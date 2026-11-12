# Zero-Dependency Domain Modeling in .NET: Inside Egypt.NET

Most codebases handle national identifiers, governorates, and regional classification with ad-hoc regexes and copy-pasted helper methods scattered across services. Over time, validation rules drift, edge cases like century digits or governorate codes break silently, and every request pays unnecessary string allocation costs.

I built [Egypt.Net.Core](https://github.com/abdulrahmanhossam/egypt-net-core) to replace fragile helper snippets with a **zero-dependency, immutable domain library** backed by comprehensive unit tests and BenchmarkDotNet measurements.

---

## Design Principles

When designing a foundational NuGet library, every external dependency becomes a transitive burden for consumers. Keeping `Egypt.Net.Core` free of third-party runtime dependencies forced three clear decisions:

1. **Value semantics and immutability** — `EgyptianNationalId` validates eagerly at construction time and exposes read-only domain properties (`BirthDate`, `Age`, `Gender`, `Governorate`, `BirthRegion`).
2. **Privacy by default** — logging raw national IDs is a compliance hazard, so built-in formatting supports masked output (`301**********58`) alongside dashed and bracketed formats.
3. **Bilingual domain representation** — Egyptian applications frequently render both Arabic and English labels, so governorate names, gender, and regions carry first-class Arabic (`القاهرة`, `ذكر`/`أنثى`) and English values out of the box.

---

## Anatomy of an Egyptian National ID

A 14-digit Egyptian National ID encodes structured demographic metadata directly in its digits:

| Slice | Length | Meaning |
|---|---|---|
| `[0]` | 1 | Century code (`2` = 1900–1999, `3` = 2000–2099) |
| `[1..7]` | 6 | Birth date (`YYMMDD`) |
| `[7..9]` | 2 | Governorate code (27 governorates + `88` born abroad) |
| `[9..13]` | 4 | Sequence number (`[12]` odd = Male, even = Female) |
| `[13]` | 1 | Check digit |

Validation has to check more than `length == 14 && allDigits`. A valid-looking string like `30102300123458` passes naive digit checks while encoding February 30th. Domain construction must verify calendar validity (`DateOnly` / leap years), valid century markers, and recognized governorate codes before returning an instance.

---

## Parsing Without Heavy Allocations

In high-throughput APIs, parsing identifiers on the hot path shouldn't trigger substring allocations or regex backtracking. Using `ReadOnlySpan<char>` slicing and direct ASCII digit math (`c - '0'`) keeps parsing fast and predictable:

```csharp
// Direct span-based digit parsing avoids substring heap allocations
private static int ParseTwoDigits(ReadOnlySpan<char> span, int start)
    => (span[start] - '0') * 10 + (span[start + 1] - '0');
```

Across the v1.1.0 benchmark suite measured with **BenchmarkDotNet**, parsing an `EgyptianNationalId` averaged **2.13 μs** per operation, keeping GC pressure minimal even under batch ingestion workloads.

---

## Verification Across 150+ Unit Tests

Domain libraries earn trust through edge cases, not happy-path demos. The xUnit test suite covers:

- Century boundary transitions (`1999-12-31` vs `2000-01-01`)
- Leap year dates (`Feb 29` on valid vs invalid years)
- All 27 governorate codes plus foreign birth (`88`)
- Gender parity across odd/even sequence digits
- Equality (`IEquatable<T>`), comparison (`IComparable<T>`), and masked formatting

```bash
dotnet add package Egypt.Net.Core
```

Explore the source, benchmarks, and module docs at [abdulrahmanhossam/egypt-net-core](https://github.com/abdulrahmanhossam/egypt-net-core).

