# .NET Memory Management: A Practical Guide

Every .NET developer interacts with memory management daily, whether they realize it or not. Understanding how the Garbage Collector works helps you write faster, more reliable applications.

---

## The Basics: Why Memory Matters

When you write C# code, you don't need to manually free memory. The GC handles it. But understanding the internals helps you:

- Avoid memory leaks in long-running applications
- Write high-performance code
- Debug OutOfMemoryException issues
- Make better architectural decisions

---

## How .NET Allocates Memory

### The Thread Stack

The stack is **fast** but **limited**. It's pre-allocated memory that grows downward:

```csharp
void Calculate() {
    int x = 10;      // Stored on stack - O(1) allocation
    int y = 20;      // Stored on stack
    int result = x + y;
}                   // Automatically "freed" when method ends
```

**Value types** (int, double, bool, struct) go on the stack. They're快速 and automatic.

### The Managed Heap

The heap is **flexible** but **slower**. The GC manages it:

```csharp
public class Person {
    public string Name;
    public int Age;
}

void CreatePerson() {
    var person = new Person();
    person.Name = "Alice";
    person.Age = 30;
}   // GC will clean this up eventually
```

**Reference types** (classes) go on the heap. The GC decides when to clean them.

---

## What Happens in Memory

Every .NET object looks like this in memory:

```
[Sync Block (8 bytes)][Method Table (8 bytes)][Your Fields...]
```

The **Sync Block** handles locking and interop. The **Method Table** tells the GC what type the object is.

---

## How the Garbage Collector Works

### The Mark-Sweep-Compact Algorithm

.NET uses a three-phase approach:

**1. Mark Phase**
The GC starts from "GC Roots" - things like static variables and active method references. It marks every reachable object as "alive".

**2. Sweep Phase**
Any object NOT marked is garbage. The GC frees that memory.

**3. Compact Phase**
The GC moves live objects together to eliminate gaps. This prevents memory fragmentation.

---

### Visual: The GC Process

```
START: Objects in memory
[A] → [B] → [C]
  ↓       ↓
[X]       [Y]  ← D is unreachable!

MARK: GC marks reachable objects
[A] ✓    [B] ✓   [C] ✓ (marked)
[X] ✓    [Y] ✓   (D not marked)

SWEEP: Remove unmarked
[A] → [B] → [C]     [D] gone!

COMPACT: Fill gaps
[A] → [B] → [C] → [X] → [Y]
```

---

## Generations: The Smart Optimization

### The Key Insight

Most objects die young. You create an object, use it briefly, then never need it again.

.NET optimizes for this by using **generations**:

| Generation | Description | Collection Frequency |
|------------|-------------|---------------------|
| **Gen 0** | New objects | Very frequent |
| **Gen 1** | Survived Gen 0 | Moderate |
| **Gen 2** | Long-lived | Rare |

### How Promotion Works

```
new Person() → Gen 0 → survive GC → Gen 1 → survive GC → Gen 2
                                  → die → collected
```

Objects that survive a Gen 0 collection get promoted to Gen 1. Survive Gen 1? Up to Gen 2.

This design means the GC spends most of its time scanning Gen 0 (which is small), rarely touching Gen 2 (which might be huge).

---

## Large Object Heap (LOH)

### The 85KB Rule

Objects **85KB or larger** skip Gen 0/1 entirely and go straight to the Large Object Heap:

```csharp
// Goes to Gen 0
var small = new byte[1024];

// Goes to LOH directly - NOT compacted
var large = new byte[85_000];
```

### Why This Matters

The LOH is **not compacted** by default. This can cause memory fragmentation:

```
[Used 100KB] [Free 2MB] [Used 90KB]
              ↑ This gap can't be filled!
```

**Warning**: Frequent large allocations can exhaust memory. Monitor LOH in production.

---

## Common Memory Mistakes

### 1. Event Handler Leaks

The most common leak in .NET apps:

```csharp
// WRONG - creates permanent reference
publisher.Click += HandleClick;

// CORRECT - remove when done
publisher.Click -= HandleClick;

// BEST - use IDisposable
public class Subscriber : IDisposable {
    public void Dispose() {
        publisher.Click -= HandleClick;
    }
}
```

### 2. Static Collections Without Limits

```csharp
// WRONG - grows forever
static List<string> Cache = new();

static Dictionary<string, Person> _cache = new();
static const int MaxSize = 1000;

// BETTER - implement eviction
void AddToCache(string key, Person value) {
    if (_cache.Count >= MaxSize) {
        _cache.Remove(_cache.Keys.First());
    }
    _cache[key] = value;
}
```

### 3. Forgetting to Dispose

```csharp
// WRONG
var file = new StreamWriter("data.txt");
file.Write("data");
// If exception occurs here, file stays open!

// CORRECT - using statement ensures cleanup
using (var file = new StreamWriter("data.txt")) {
    file.Write("data");
} // File guaranteed closed
```

---

## Best Practices

### 1. Use `using` Statements

```csharp
using (var resource = new SqlConnection(connString))
{
    // Resource automatically disposed
}
```

### 2. Avoid Finalizers

Finalizers slow down the GC and add unpredictable delays:

```csharp
// AVOID THIS
~MyClass() {
    CleanupNative();  // Unpredictable timing!
}

// DO THIS INSTEAD
public void Dispose() {
    CleanupNative();
    GC.SuppressFinalize(this);
}
```

### 3. Monitor Memory in Production

```csharp
// Check current generation
Console.WriteLine(GC.GetTotalMemory(false));

// Force collection (carefully!)
GC.Collect();
GC.WaitForPendingFinalizers();
```

### 4. Use Memory Profiling Tools

- **Visual Studio Diagnostic Tools**: Basic memory profiling
- **dotMemory**: JetBrains - detailed analysis
- **ANTS Memory Profiler**: Redgate - production debugging

---

## Quick Reference

| Concept | What It Means |
|---------|---------------|
| **Stack** | Fast, temporary storage for value types |
| **Heap** | Managed storage for reference types |
| **GC Roots** | Static variables, thread stack, pinned objects |
| **Gen 0** | New objects - collected frequently |
| **Gen 2** | Long-lived objects - collected rarely |
| **LOH** | Objects ≥85KB - no compaction |
| **Dispose** | Your code cleans up unmanaged resources |
| **SuppressFinalize** | Skip finalization queue |

---

## Summary

Understanding .NET memory management helps you:

1. **Write faster code** - Allocate on stack when possible
2. **Avoid leaks** - Unsubscribe from events, use IDisposable
3. **Debug issues** - Know what causes OutOfMemoryException
4. **Make better decisions** - Choose the right data structures

The GC is your friend. Treat it well, and it'll treat your applications well.

---

*Written by Abdulrahman Hossam*