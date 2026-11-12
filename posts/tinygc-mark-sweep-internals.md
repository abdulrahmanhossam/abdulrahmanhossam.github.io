# Building a Mark-Sweep Garbage Collector in C#

Automatic memory management often feels like magic until you sit down and implement a garbage collector yourself. When building [TinyGC.NET](https://github.com/abdulrahmanhossam/tinygc.net), the goal was to strip away the complexity of generational compaction and concurrent background threads to expose the core mechanics every managed runtime relies on: **heap allocation**, **root reachability**, and **mark-and-sweep reclamation**.

---

## Why Implement a GC Inside a Managed Language?

C# already runs on the CLR, which comes with a production-grade generational garbage collector. Building an educational GC inside C# lets you model the exact data structures—object headers, free lists, bump pointers, and root handles—without fighting raw pointer arithmetic and OS page faults on day one.

In `TinyGC.NET`, the simulated heap is backed by a fixed-size managed buffer managed by five core abstractions:

| Component | Responsibility |
|---|---|
| `GCObject` | Base object layout carrying metadata headers (`Marked`, size, slot index) |
| `Heap` | Tracks the active memory region, bump pointer offset, and free list blocks |
| `GcRootHandle` | Registers live stack/application references as tracing roots |
| `GC` | Orchestrates allocation, triggers collection, and runs Mark + Sweep |
| `Program` | Exercises allocation pressure, unreferenced object graphs, and stats |

---

## Step 1: Allocation Strategy (Bump Pointer & Free List)

When an application calls `GC.Instance.New<T>()`, the allocator needs to find contiguous space quickly.

### Bump-Pointer Allocation

For fresh memory at the end of the used heap, allocation is `O(1)`:

```csharp
// Conceptual bump-pointer allocation inside Heap
public HeapSlot Allocate(int size)
{
    if (_bumpOffset + size <= _capacity)
    {
        var slot = new HeapSlot(_bumpOffset, size);
        _bumpOffset += size;
        return slot;
    }

    // Fall back to Free List or trigger collection
    return TryAllocateFromFreeList(size)
        ?? throw new OutOfMemoryException("Managed heap exhausted.");
}
```

Incrementing `_bumpOffset` is as fast as allocation gets. The tradeoff is fragmentation: once objects in the middle of the heap die, incrementing the tail pointer alone cannot reuse those holes.

### Reclaiming Holes with a Free List

When objects are swept, their slots are returned to a **Free List**—a collection of `(offset, size)` blocks available for future allocations. When bump space runs out (or before growing), the allocator scans the free list for a block large enough to satisfy the request.

---

## Step 2: Root Handles & Reachability

A tracing garbage collector never searches for *dead* objects directly. Instead, it answers one question: **which objects are still reachable from active roots?**

In a real runtime like the CLR, roots live in CPU registers, thread stacks, static fields, and `GCHandle` tables. In `TinyGC.NET`, `GcRootHandle` models those explicit roots:

```csharp
using var root = new GcRootHandle(GC.Instance.New<MyData>());
```

Any `GCObject` held by an active `GcRootHandle` (or transitively referenced by one) is considered **alive**. Anything unreachable from the root set is garbage, regardless of whether reference cycles exist.

---

## Step 3: The Mark Phase

Collection begins by clearing previous marks (or flipping a mark bit) and traversing the object graph starting from every registered root:

```csharp
private void Mark()
{
    var worklist = new Stack<GCObject>();

    foreach (var root in _roots)
    {
        if (root.Target is { Marked: false } obj)
        {
            obj.Marked = true;
            worklist.Push(obj);
        }
    }

    while (worklist.Count > 0)
    {
        var current = worklist.Pop();
        foreach (var child in current.GetReferences())
        {
            if (!child.Marked)
            {
                child.Marked = true;
                worklist.Push(child);
            }
        }
    }
}
```

Using an explicit `Stack<GCObject>` instead of recursion prevents blowing the call stack when object graphs grow deep—a classic pitfall in production GC implementations.

---

## Step 4: The Sweep Phase

Once every reachable object has `Marked == true`, the collector performs a linear scan over the heap:

1. **If `obj.Marked == true`**: reset `obj.Marked = false` so it is ready for the next collection cycle, and keep it alive.
2. **If `obj.Marked == false`**: invoke cleanup if needed, remove it from the live table, and merge its slot back into the **Free List**.

```csharp
private int Sweep()
{
    int reclaimed = 0;

    foreach (var obj in _heap.AllObjectsSnapshot())
    {
        if (obj.Marked)
        {
            obj.Marked = false;
        }
        else
        {
            _heap.Free(obj);
            reclaimed++;
        }
    }

    return reclaimed;
}
```

Coalescing adjacent free blocks during sweep prevents small holes from turning into permanent fragmentation when larger objects arrive later.

---

## Extending the Model

Once the basic Mark-Sweep loop is working, the next natural steps mirror how production runtimes evolved:

- **Compaction (Mark-Compact)**: sliding surviving objects to the bottom of the heap and updating root pointers so bump-pointer allocation stays `O(1)` without fragmentation.
- **Generations (Gen 0 / 1 / 2)**: exploiting the weak generational hypothesis—most objects die young—so short collections only scan recent allocations.
- **Native heap backing**: swapping the managed array for `Marshal.AllocHGlobal` to observe real unmanaged memory layouts.

You can explore the full source code and exercises in [abdulrahmanhossam/tinygc.net](https://github.com/abdulrahmanhossam/tinygc.net) alongside the C/C# memory experiments in [dotnet-memory-internals](https://github.com/abdulrahmanhossam/dotnet-memory-internals).

