'use strict';

window.PORTFOLIO_DATA = {
    profile: {
        name: 'Abdulrahman Hossam',
        handle: 'abdulrahmanhossam.github.io',
        email: 'ahossam.tech@gmail.com',
        github: 'https://github.com/abdulrahmanhossam',
        linkedin: 'https://www.linkedin.com/in/abdulrahman-hossam-0ba758285/',
        leetcode: 'https://leetcode.com/u/abdulrhman7ossam2002/',
        cv: 'pdfs/Abdulrahman_Hossam_CV.pdf'
    },

    projects: [
        {
            slug: 'marsa',
            category: 'Deployment Platform',
            title: 'Marsa',
            subtitle: 'Self-hosted deployment platform for a single Linux host',
            summary: 'Builds and runs one service per deployment with .NET 10, PostgreSQL 17, Docker BuildKit, Caddy TLS cutover, and rollback.',
            tags: ['C#', '.NET 10', 'PostgreSQL', 'Docker', 'Caddy'],
            githubUrl: 'https://github.com/ofuqq/marsa',
            hasDemo: false,
            evidenceNote: 'Repository specification, architecture docs, security model, and .NET 10 solution CI are verified on main.',
            problem: 'Small teams and solo engineers often reach for Kubernetes or PaaS clusters when all they actually need is one Linux box that builds from Git, verifies container health, cuts traffic over cleanly through Caddy, and keeps the previous release ready for instant rollback.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Receive source push',
                    desc: 'Accept GitHub, GitLab, or HTTPS Git webhooks and resolve deterministic runtime detection.'
                },
                {
                    num: '02',
                    title: 'Build immutable release',
                    desc: 'Compile and package an isolated Docker image via BuildKit while recording redacted build logs.'
                },
                {
                    num: '03',
                    title: 'Health-gate container',
                    desc: 'Start the new release on an isolated port with memory/CPU limits and probe its health endpoint.'
                },
                {
                    num: '04',
                    title: 'Cutover or roll back',
                    desc: 'Update Caddy reverse-proxy routing and TLS only after health passes; retain prior release for rollback.'
                }
            ],
            architectureSummary: 'A .NET 10 control plane backed by PostgreSQL 17 orchestrates Docker Engine builds, manages secrets and audit records, drives Caddy 2.x for zero-downtime port switching, and serves an Arabic-localized Razor Components dashboard alongside an OpenAPI 3.1 API.',
            decisions: [
                {
                    title: 'One service per deployment on a single host',
                    body: 'Instead of abstracting multi-node cluster scheduling, Marsa optimizes for a predictable single-VPS operational model. That keeps networking, disk state, and rollback mechanics inspectable by one engineer.'
                },
                {
                    title: 'Health-gated Caddy cutover',
                    body: 'New containers boot on an isolated port and must pass explicit health checks before Caddy swaps upstream routes. If the probe fails, live traffic never touches the broken release.'
                },
                {
                    title: 'Immutable releases with redacted logs',
                    body: 'Secrets are separated from build artifacts and scrubbed from stored logs so deployment history remains auditable without leaking credentials.'
                }
            ],
            testsAndLimitations: [
                'Marsa is currently in active early-stage engineering at Ofuq. The repository includes the architecture specification, security model, backlog, Razor/API project layout, and green GitHub Actions CI checks.',
                'It is not yet packaged as a production server installer or binary CLI release; live VPS benchmarks will be published once the v0.1 runtime runner lands.'
            ],
            references: [
                { label: 'Repository & specification', url: 'https://github.com/ofuqq/marsa' },
                { label: 'Architecture overview', url: 'https://github.com/ofuqq/marsa/blob/main/docs/architecture/overview.md' },
                { label: 'Security model', url: 'https://github.com/ofuqq/marsa/blob/main/docs/architecture/security.md' },
                { label: 'GitHub Actions CI', url: 'https://github.com/ofuqq/marsa/actions/workflows/ci.yml' }
            ],
            localCommands: [
                'git clone https://github.com/ofuqq/marsa.git',
                'cd marsa',
                'dotnet restore && dotnet build --configuration Release'
            ]
        },
        {
            slug: 'ruqa',
            category: 'Desktop Systems',
            title: 'Ruqa',
            subtitle: 'Lightweight native desktop whiteboard & study scratchpad in Rust',
            summary: 'Mouse-first infinite canvas built with winit, tiny-skia, and softbuffer featuring bilingual Arabic/Latin text and ~34.2 MB peak RSS.',
            tags: ['Rust', 'winit', 'tiny-skia', 'softbuffer'],
            githubUrl: 'https://github.com/ofuqq/ruqa',
            hasDemo: false,
            evidenceNote: 'v0.1.0 release candidate with ~34.2 MB peak RSS verified in continuous 125-op study session tests and CI.',
            problem: 'Most digital whiteboards run inside Electron or heavy browser tabs, requiring cloud accounts and treating mouse users as second-class compared to stylus tablets. Studying and explaining technical concepts offline needed a fast native canvas with zero telemetry.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Capture mouse-first input',
                    desc: 'Process velocity-sensitive strokes, wheel zoom, pan, and single-key tool switches via winit.'
                },
                {
                    num: '02',
                    title: 'Track dirty damage rects',
                    desc: 'Isolate modified canvas regions so frame updates avoid redrawing unchanged infinite-canvas tiles.'
                },
                {
                    num: '03',
                    title: 'Rasterize on CPU',
                    desc: 'Render crisp ink curves, shapes, and bilingual Arabic/Latin typography using tiny-skia.'
                },
                {
                    num: '04',
                    title: 'Present & persist locally',
                    desc: 'Blit buffers through softbuffer and serialize boards cleanly to local .ruqa JSON and PNG exports.'
                }
            ],
            architectureSummary: 'Built at Ofuq with 84+ commits contributed across core app behavior, viewport centering, incremental untitled board naming, Arabic input path research, damage-rect rendering analysis, and reproducible performance budget benchmarks.',
            decisions: [
                {
                    title: 'Pure CPU rasterization over WebGL/Electron',
                    body: 'Choosing tiny-skia + softbuffer eliminates Chromium runtime overhead and GPU driver quirks across Linux and Windows, keeping peak memory around 34.2 MB in stress simulations.'
                },
                {
                    title: 'Damage-rect analysis for interactive frame budgets',
                    body: 'Benchmarked full-scene repaints against dirty-rectangle tracking on fixed stress scenes so pan, zoom, and freehand ink stay responsive without runaway CPU spikes.'
                },
                {
                    title: '100% offline .ruqa storage',
                    body: 'Boards save directly to deterministic local JSON files with no sync daemon or account lock-in, protecting user notes and preventing silent untitled board overwrites.'
                }
            ],
            testsAndLimitations: [
                'Verified with automated dogfooding session tests (125-operation continuous study simulation measuring ~34.2 MB peak RSS), reproducible budget benchmarks, and GitHub Actions CI.',
                'Current v0.1.0 release candidate targets single-user desktop study workflows; collaborative multiplayer sync is intentionally out of scope.'
            ],
            references: [
                { label: 'Ruqa repository', url: 'https://github.com/ofuqq/ruqa' },
                { label: 'Performance budget PR #166', url: 'https://github.com/ofuqq/ruqa/pull/166' },
                { label: 'Damage-rect research PR #168', url: 'https://github.com/ofuqq/ruqa/pull/168' },
                { label: 'Arabic input paths PR #167', url: 'https://github.com/ofuqq/ruqa/pull/167' }
            ],
            localCommands: [
                'git clone https://github.com/ofuqq/ruqa.git',
                'cd ruqa',
                'cargo test && cargo run --release'
            ]
        },
        {
            slug: 'talebelm',
            category: 'Clean Architecture',
            title: 'TalebElm',
            subtitle: 'Self-directed learning platform with server-verified progression',
            summary: 'Ordered learning tracks in .NET 10 where modules unlock only after passing exams and solving Codeforces or GitHub practice tasks.',
            tags: ['C#', '.NET 10', 'ASP.NET Core', 'EF Core', 'Clean Arch'],
            githubUrl: 'https://github.com/Tawjjeh/TalebElm',
            hasDemo: false,
            evidenceNote: 'Build, domain/application test suite, EF Core migrations, and CI/CD quality gates pass on main.',
            problem: 'Self-learners routinely click "mark as complete" on video playlists without retaining fundamentals. TalebElm enforces mastery at the server boundary: the next module opens only when both an exam grade and external Codeforces/GitHub problem verification pass.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Api boundary',
                    desc: 'Expose HTTP endpoints, map domain exceptions to status codes, and enforce authentication.'
                },
                {
                    num: '02',
                    title: 'Application orchestration',
                    desc: 'Coordinate track progression, enrollment rules, and exam/task unlock use cases.'
                },
                {
                    num: '03',
                    title: 'Pure Domain core',
                    desc: 'Enforce track ordering, module invariants, and grading rules with zero framework coupling.'
                },
                {
                    num: '04',
                    title: 'Infrastructure & gates',
                    desc: 'Persist aggregates via EF Core migrations and run automated CI/CD + security checks.'
                }
            ],
            architectureSummary: 'Dependencies point strictly inward toward Domain. Outer layers (Api and Infrastructure) implement contracts defined by Application and Domain so persistence and external Codeforces/GitHub verifiers stay replaceable.',
            decisions: [
                {
                    title: 'Dual-gated unlock instead of self-attestation',
                    body: 'Progression checks require server-confirmed exam scores plus verifiable Codeforces submissions or GitHub repositories, eliminating manual review bottlenecks.'
                },
                {
                    title: 'Strict four-layer Clean Architecture',
                    body: 'Isolating Domain from EF Core and ASP.NET Core keeps invariant unit tests fast and prevents persistence annotations from leaking into business rules.'
                },
                {
                    title: 'Milestone-driven feature index',
                    body: 'Maintained a living FEATURE_INDEX and milestone architecture docs so implemented endpoints vs planned 501 stubs stay transparent to contributors.'
                }
            ],
            testsAndLimitations: [
                'Domain models, EF Core configurations, migrations, PBKDF2 password hashing, track/module reads, and health endpoints pass green in CI on main.',
                'Several M2/M3 endpoints (Codeforces/GitHub verification workers and capstone workflows) are actively under milestone implementation and documented in FEATURE_INDEX.'
            ],
            references: [
                { label: 'TalebElm repository', url: 'https://github.com/Tawjjeh/TalebElm' },
                { label: 'Architecture guide', url: 'https://github.com/Tawjjeh/TalebElm/blob/main/ARCHITECTURE.md' },
                { label: 'Feature index', url: 'https://github.com/Tawjjeh/TalebElm/blob/main/docs/FEATURE_INDEX.md' }
            ],
            localCommands: [
                'git clone https://github.com/Tawjjeh/TalebElm.git',
                'cd TalebElm',
                'dotnet test TalebElm.slnx'
            ]
        },
        {
            slug: 'egypt-net',
            category: 'Domain Library',
            title: 'Egypt.NET',
            subtitle: 'Zero-dependency .NET domain library for Egyptian national data',
            summary: 'Immutable National ID parser and regional classifier in C# achieving 2.13 μs average parsing with 150+ xUnit tests.',
            tags: ['C#', '.NET 8/9', 'xUnit', 'BenchmarkDotNet', 'NuGet'],
            githubUrl: 'https://github.com/abdulrahmanhossam/egypt-net-core',
            nugetUrl: 'https://www.nuget.org/packages/Egypt.Net.Core',
            hasDemo: true,
            demoType: 'egypt-net',
            evidenceNote: '150+ unit tests passing and BenchmarkDotNet v1.1.0 baseline measured at 2.13 μs per parse (~2.7 KB allocated).',
            problem: 'Backend teams building Egyptian fintech, healthcare, and gov-tech services repeatedly copy-paste brittle regexes to parse 14-digit National IDs. Those snippets fail on leap-year birth dates, omit governorate/region mappings, and leak raw PII into application logs.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Validate structure & date',
                    desc: 'Verify 14 ASCII digits, century marker (2/3), leap-year calendar validity, and governorate code.'
                },
                {
                    num: '02',
                    title: 'Extract demographics',
                    desc: 'Derive BirthDate, Age, Gender (English & Arabic), and demographic generation.'
                },
                {
                    num: '03',
                    title: 'Map geography',
                    desc: 'Classify across 27 governorates, 7 geographic regions, Upper/Lower Egypt, and coastal flags.'
                },
                {
                    num: '04',
                    title: 'Format safely',
                    desc: 'Expose IEquatable/IComparable value semantics and masked formats (301**********58) for logs.'
                }
            ],
            architectureSummary: 'Published on NuGet as Egypt.Net.Core (v1.1.0) with zero external runtime dependencies, bilingual Arabic/English metadata, and LINQ-friendly string extensions.',
            decisions: [
                {
                    title: 'Zero third-party dependencies',
                    body: 'Any application targeting .NET 8/9 can install Egypt.Net.Core without pulling transitive packages or risking version diamond conflicts.'
                },
                {
                    title: 'Eager validation at construction',
                    body: 'An EgyptianNationalId instance cannot exist in an invalid state, shifting validation to system boundaries rather than scattering null/bool checks across domain services.'
                },
                {
                    title: 'Privacy-first formatting helpers',
                    body: 'Built-in masked formatting encourages developers to redact middle digits before writing structured logs or audit trails.'
                }
            ],
            testsAndLimitations: [
                'Covered by 150+ xUnit tests spanning century boundaries, leap years, all 27 governorates plus foreign birth code (88), equality, and formatting modes.',
                'BenchmarkDotNet v1.1.0 baseline recorded 2.13 μs average parsing time and 232 Gen0 collections per 262K operations.'
            ],
            references: [
                { label: 'Egypt.NET repository', url: 'https://github.com/abdulrahmanhossam/egypt-net-core' },
                { label: 'NuGet: Egypt.Net.Core', url: 'https://www.nuget.org/packages/Egypt.Net.Core' },
                { label: 'Core module README', url: 'https://github.com/abdulrahmanhossam/egypt-net-core/blob/main/Egypt.Net.Core/README.md' }
            ],
            localCommands: [
                'dotnet add package Egypt.Net.Core',
                'git clone https://github.com/abdulrahmanhossam/egypt-net-core.git',
                'cd egypt-net-core && dotnet test'
            ]
        },
        {
            slug: 'user-activity-logger',
            category: 'NuGet Package',
            title: 'UserActivityLogger',
            subtitle: 'Attribute-driven audit logging for ASP.NET Core MVC',
            summary: 'Published NuGet package (v1.0.10) recording user, route, IP, HTTP method, and status code through [LogUserActivity] and EF Core.',
            tags: ['C#', 'ASP.NET Core', 'EF Core', '.NET 8–10', 'NuGet'],
            githubUrl: 'https://github.com/abdulrahmanhossam/UserActivityLogger',
            nugetUrl: 'https://www.nuget.org/packages/UserActivityLogger',
            hasDemo: false,
            evidenceNote: 'Published on NuGet.org (v1.0.10) with xUnit test suite and GitHub Actions CI covering net8.0, net9.0, and net10.0.',
            problem: 'Auditing sensitive controller actions in ASP.NET Core MVC often pollutes business handlers with repetitive DbContext logging code, risking inconsistent field capture or accidental storage of sensitive form values like passwords.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Decorate action',
                    desc: 'Annotate MVC controller actions with [LogUserActivity("Description")] metadata.'
                },
                {
                    num: '02',
                    title: 'Intercept result filter',
                    desc: 'UserActivityLoggingFilter runs after the action result executes to observe final HTTP status.'
                },
                {
                    num: '03',
                    title: 'Redact & enrich context',
                    desc: 'Extract user identity, path, query, IP, and method via IHttpContextAccessor while redacting secrets.'
                },
                {
                    num: '04',
                    title: 'Persist via DbContext',
                    desc: 'UserActivityLoggerService<TContext> writes audit entries into the host application DbContext.'
                }
            ],
            architectureSummary: 'Integrates cleanly into existing ASP.NET Core MVC applications via builder.ConfigureUserActivityLogger() on ModelBuilder and supports manual logging through IUserActivityLogger outside MVC filter pipelines.',
            decisions: [
                {
                    title: 'Result filter execution over action-entry logging',
                    body: 'Logging after action result execution lets the audit entry capture the true response status code and outcome-dependent event messages.'
                },
                {
                    title: 'Configurable form-data redaction',
                    body: 'Sensitive fields can be masked before persistence so compliance logs stay useful without storing raw credentials or tokens.'
                },
                {
                    title: 'Host DbContext integration',
                    body: 'Writing through the application’s own EF Core TContext avoids spinning up separate connection pools or external audit databases for small-to-medium MVC apps.'
                }
            ],
            testsAndLimitations: [
                'Tested in UserActivityLogger.Tests with GitHub Actions CI verifying builds and tests on master across .NET 8, 9, and 10.',
                'Currently targets ASP.NET Core MVC controller pipelines; Minimal API endpoint filters are not yet first-class.'
            ],
            references: [
                { label: 'UserActivityLogger repository', url: 'https://github.com/abdulrahmanhossam/UserActivityLogger' },
                { label: 'NuGet: UserActivityLogger', url: 'https://www.nuget.org/packages/UserActivityLogger' },
                { label: 'Architecture overview', url: 'https://github.com/abdulrahmanhossam/UserActivityLogger/blob/master/docs/architecture-overview.md' }
            ],
            localCommands: [
                'dotnet add package UserActivityLogger --version 1.0.10',
                'git clone https://github.com/abdulrahmanhossam/UserActivityLogger.git',
                'cd UserActivityLogger && dotnet test'
            ]
        },
        {
            slug: 'qget',
            category: 'CLI Tooling',
            title: 'qget',
            subtitle: 'Minimalist zero-setup CLI video downloader in Go',
            summary: 'Wraps yt-dlp, Deno, and FFmpeg with automatic first-run dependency installation, dynamic quality selection, and playlist downloads.',
            tags: ['Go', 'CLI', 'yt-dlp', 'FFmpeg', 'Linux/Windows'],
            githubUrl: 'https://github.com/abdulrahmanhossam/qget',
            hasDemo: false,
            evidenceNote: 'Prebuilt Linux & Windows release binaries shipped with automated dependency bootstrapping and resume support.',
            problem: 'Using yt-dlp across fresh Linux or Windows machines usually breaks on missing JS runtimes (Deno), outdated extractors, or missing FFmpeg muxing tools. Non-technical users and quick terminal workflows just want one binary that handles setup automatically.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Probe environment',
                    desc: 'Check PATH and local tool cache for yt-dlp, Deno, and FFmpeg binaries on startup.'
                },
                {
                    num: '02',
                    title: 'Bootstrap dependencies',
                    desc: 'Automatically download missing runtime binaries or refresh them via --update.'
                },
                {
                    num: '03',
                    title: 'Resolve formats',
                    desc: 'Query available streams and present a sorted quality menu, container picker, or MP3 mode.'
                },
                {
                    num: '04',
                    title: 'Stream & visualize',
                    desc: 'Execute download with --continue resume support and render a single-line progress bar.'
                }
            ],
            architectureSummary: 'Compiled as a single static Go binary with stripped debug symbols (-ldflags="-s -w") supporting both interactive prompts and scripted CLI flags.',
            decisions: [
                {
                    title: 'Orchestrate yt-dlp rather than reimplement extractors',
                    body: 'Video sites change signatures weekly; wrapping yt-dlp with automated self-updates gives users reliability without maintaining fragile scrapers.'
                },
                {
                    title: 'First-run dependency provisioning',
                    body: 'Auto-installing Deno and FFmpeg removes the #1 failure mode (separate audio/video streams failing to merge) on clean machines.'
                }
            ],
            testsAndLimitations: [
                'Verified across EndeavourOS/Arch Linux and Windows release builds with single videos, full playlists, MP3 audio extraction, and interrupted transfer resume.',
                'Relies on upstream yt-dlp extractor compatibility and outbound HTTPS access during initial dependency setup.'
            ],
            references: [
                { label: 'qget repository', url: 'https://github.com/abdulrahmanhossam/qget' },
                { label: 'Releases', url: 'https://github.com/abdulrahmanhossam/qget/releases' }
            ],
            localCommands: [
                'git clone https://github.com/abdulrahmanhossam/qget.git',
                'cd qget && go build -ldflags="-s -w" -o qget main.go',
                './qget "https://youtube.com/watch?v=..."'
            ]
        },
        {
            slug: 'tinygc',
            category: 'Memory Management',
            title: 'TinyGC.NET',
            subtitle: 'Educational Mark-Sweep garbage collector in C#',
            summary: 'Models bump-pointer allocation, free-list reclamation, object headers, and GcRootHandle reachability tracing.',
            tags: ['C#', '.NET', 'GC', 'Memory Internals'],
            githubUrl: 'https://github.com/abdulrahmanhossam/tinygc.net',
            hasDemo: false,
            evidenceNote: 'Complete Mark-Sweep implementation with heap diagnostics and student extension exercises.',
            problem: 'Developers read about GC roots, fragmentation, and Mark-Sweep phases in textbooks, yet rarely see those concepts expressed in clean, readable C# code they can step through in a debugger.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Allocate via bump/free-list',
                    desc: 'Assign Heap slots in O(1) via bump pointer or reuse swept holes from the free list.'
                },
                {
                    num: '02',
                    title: 'Register root handles',
                    desc: 'Pin live references via GcRootHandle so the collector knows where object graphs begin.'
                },
                {
                    num: '03',
                    title: 'Mark reachable graph',
                    desc: 'Traverse transitive object references from roots and set live object header flags.'
                },
                {
                    num: '04',
                    title: 'Sweep unreachable slots',
                    desc: 'Scan heap slots, clear mark bits on survivors, and reclaim unmarked memory.'
                }
            ],
            architectureSummary: 'Pairs with dotnet-memory-internals (a C + C# lab covering OS virtual memory, stack vs heap, LOH >= 85 KB, and Dispose leaks) as an approachable hands-on runtime curriculum.',
            decisions: [
                {
                    title: 'Managed buffer simulation over unsafe Win32 calls',
                    body: 'Simulating the heap inside readable C# lets learners inspect object headers, free lists, and live stats without platform-specific P/Invoke noise.'
                },
                {
                    title: 'Explicit root handles',
                    body: 'Requiring GcRootHandle makes the boundary between stack/register roots and heap objects unmistakable.'
                }
            ],
            testsAndLimitations: [
                'Demonstrates allocation pressure, unreachable object collection, and heap statistics output via the included demo program.',
                'Intended as an educational single-threaded collector; generational promotion, compaction, and concurrent marking are left as guided student exercises.'
            ],
            references: [
                { label: 'TinyGC.NET repository', url: 'https://github.com/abdulrahmanhossam/tinygc.net' },
                { label: '.NET Memory Internals lab', url: 'https://github.com/abdulrahmanhossam/dotnet-memory-internals' }
            ],
            localCommands: [
                'git clone https://github.com/abdulrahmanhossam/tinygc.net.git',
                'cd tinygc.net && dotnet run'
            ]
        },
        {
            slug: 'kernel-simulator',
            category: 'Operating Systems',
            title: 'Kernel Simulator',
            subtitle: 'Tick-based CPU process scheduler in ASP.NET Core 9',
            summary: 'Simulates Round Robin, Preemptive Priority, Aging (starvation prevention), process state transitions, and I/O blocking.',
            tags: ['C#', 'ASP.NET Core 9', 'OS Simulation', 'Scheduling'],
            githubUrl: 'https://github.com/abdulrahmanhossam/kernel-simulator',
            hasDemo: true,
            demoType: 'kernel-simulator',
            evidenceNote: 'Verified across deterministic tick scenarios: CPU idle, Round Robin quantum expiry, I/O blocking, and priority preemption.',
            problem: 'CPU scheduling algorithms look straightforward on static Gantt charts, yet subtle interactions between time quantums, I/O blocking interrupts, priority preemption, and starvation aging only click when stepped tick by tick.',
            architectureSteps: [
                {
                    num: '01',
                    title: 'Advance I/O devices',
                    desc: 'Tick blocked processes and move completed I/O workloads back into the Ready Queue.'
                },
                {
                    num: '02',
                    title: 'Apply aging',
                    desc: 'Increment effective priority for waiting processes so low-priority tasks never starve.'
                },
                {
                    num: '03',
                    title: 'Select or preempt',
                    desc: 'Dispatch from Ready Queue if CPU is idle, or preempt if a higher-priority process arrives.'
                },
                {
                    num: '04',
                    title: 'Execute one CPU tick',
                    desc: 'Decrement remaining burst, enforce quantum expiry, or transition to Blocked / Finished.'
                }
            ],
            architectureSummary: 'Separates tick orchestration (SimulationService) from queue selection and aging policy (SchedulerService), allowing deterministic unit-level verification of every state transition.',
            decisions: [
                {
                    title: 'Discrete tick loop over wall-clock timers',
                    body: 'Advancing simulation one logical tick at a time makes scheduling deterministic, reproducible, and easy to inspect in tests.'
                },
                {
                    title: 'Starvation prevention via aging',
                    body: 'Preemptive priority queues can starve background jobs indefinitely; bounded aging guarantees eventual CPU progress.'
                }
            ],
            testsAndLimitations: [
                'Validated against core test scenarios: idle CPU ticks, Round Robin with quantum=2, mid-burst I/O blocking at tick 2, and priority preemption.',
                'Models a single-core CPU with deterministic tick I/O; multi-core affinity and virtual memory paging are outside the simulator scope.'
            ],
            references: [
                { label: 'Kernel Simulator repository', url: 'https://github.com/abdulrahmanhossam/kernel-simulator' }
            ],
            localCommands: [
                'git clone https://github.com/abdulrahmanhossam/kernel-simulator.git',
                'cd kernel-simulator && dotnet run'
            ]
        }
    ],

    posts: [
        {
            slug: 'tinygc-mark-sweep-internals',
            date: 'Jul 2026',
            isoDate: '2026-07-10',
            readTime: '11 min read',
            minutes: 11,
            title: 'Building a Mark-Sweep Garbage Collector in C#',
            description: 'Bump-pointer allocation, free lists, GcRootHandle reachability, and Mark-Sweep reclamation inside TinyGC.NET.',
            path: 'internals'
        },
        {
            slug: 'egypt-net-zero-dependency-domain-modeling',
            date: 'Jun 2026',
            isoDate: '2026-06-22',
            readTime: '9 min read',
            minutes: 9,
            title: 'Zero-Dependency Domain Modeling in .NET: Inside Egypt.NET',
            description: 'Designing immutable value objects, Span-based National ID parsing (2.13 μs), masked logging, and 150+ xUnit tests.',
            path: 'aspnet'
        },
        {
            slug: 'aspnet-core-right-way-part-2',
            date: 'Jun 2026',
            isoDate: '2026-06-14',
            readTime: '10 min read',
            minutes: 10,
            title: 'ASP.NET Core: The Right Way — Part 2: Controllers, Routing & HTTP Responses',
            description: 'Controllers, attribute routing, model binding, and returning meaningful HTTP status codes for CRUD endpoints.',
            path: 'aspnet'
        },
        {
            slug: 'aspnet-core-right-way-part-1',
            date: 'Jun 2026',
            isoDate: '2026-06-04',
            readTime: '8 min read',
            minutes: 8,
            title: 'ASP.NET Core: The Right Way — Part 1: Framework Foundations & Project Setup',
            description: 'How ASP.NET Core works under the hood and how to organize your first scalable API project.',
            path: 'aspnet'
        },
        {
            slug: 'dotnet-memory-internals',
            date: 'Feb 2026',
            isoDate: '2026-02-28',
            readTime: '18 min read',
            minutes: 18,
            title: '.NET Memory Management: A Practical Guide',
            description: 'Exploring the CLR’s memory model—thread stack vs managed heap, GC generations, LOH, and avoiding leaks.',
            path: 'internals'
        }
    ],

    homeFeed: [
        { type: 'article', slug: 'tinygc-mark-sweep-internals', date: 'Jul 2026', title: 'Building a Mark-Sweep Garbage Collector in C#' },
        { type: 'project', slug: 'marsa', title: 'Marsa', summary: 'Self-hosted deployment platform in .NET 10, Docker, and Caddy.' },
        { type: 'project', slug: 'ruqa', title: 'Ruqa', summary: 'Native Rust desktop whiteboard and study scratchpad.' },
        { type: 'article', slug: 'egypt-net-zero-dependency-domain-modeling', date: 'Jun 2026', title: 'Zero-Dependency Domain Modeling in .NET: Inside Egypt.NET' },
        { type: 'project', slug: 'talebelm', title: 'TalebElm', summary: 'Clean Architecture learning platform with server-verified unlocks.' },
        { type: 'article', slug: 'aspnet-core-right-way-part-2', date: 'Jun 2026', title: 'ASP.NET Core: The Right Way — Part 2' },
        { type: 'article', slug: 'aspnet-core-right-way-part-1', date: 'Jun 2026', title: 'ASP.NET Core: The Right Way — Part 1' },
        { type: 'project', slug: 'egypt-net', title: 'Egypt.NET', summary: 'Zero-dependency Egyptian domain library (2.13 μs parsing).' },
        { type: 'project', slug: 'user-activity-logger', title: 'UserActivityLogger', summary: 'Attribute-driven audit logging NuGet package for ASP.NET Core MVC.' },
        { type: 'article', slug: 'dotnet-memory-internals', date: 'Feb 2026', title: '.NET Memory Management: A Practical Guide' },
        { type: 'project', slug: 'qget', title: 'qget', summary: 'Minimalist Go CLI video downloader with auto-dependency setup.' },
        { type: 'project', slug: 'tinygc', title: 'TinyGC.NET', summary: 'Educational Mark-Sweep garbage collector in C#.' },
        { type: 'project', slug: 'kernel-simulator', title: 'Kernel Simulator', summary: 'Tick-based OS process scheduler in ASP.NET Core 9.' }
    ],

    readingPaths: [
        {
            title: '.NET Memory & Runtime Internals',
            description: 'Start from stack vs managed heap mechanics in the CLR and move into building a Mark-Sweep GC from scratch.',
            slugs: ['dotnet-memory-internals', 'tinygc-mark-sweep-internals']
        },
        {
            title: 'Production ASP.NET Core & Domain Design',
            description: 'From project setup and HTTP semantics to zero-dependency domain libraries benchmarked with BenchmarkDotNet.',
            slugs: ['aspnet-core-right-way-part-1', 'aspnet-core-right-way-part-2', 'egypt-net-zero-dependency-domain-modeling']
        }
    ],

    glossary: [
        { term: 'Clean Architecture', def: 'Layering where dependencies point strictly inward toward Domain business rules, keeping EF Core and HTTP frameworks at the edges.' },
        { term: 'Mark-Sweep GC', def: 'Two-phase tracing collection: traverse reachable objects from roots (Mark), then reclaim unmarked heap slots (Sweep).' },
        { term: 'Bump-Pointer Allocation', def: 'O(1) memory allocation that advances a single heap cursor offset when contiguous space is available.' },
        { term: 'LOH (Large Object Heap)', def: 'CLR managed heap segment reserved for allocations >= 85,000 bytes to reduce expensive memory copying.' },
        { term: 'Health-Gated Cutover', def: 'Routing strategy (used in Marsa) where Caddy switches live traffic to a new container only after health probes pass.' },
        { term: 'Damage-Rect Rendering', def: 'Repainting only dirty bounding rectangles changed since the last frame rather than redrawing the full canvas.' },
        { term: 'Result Filter', def: 'ASP.NET Core MVC pipeline hook running around action result execution—used in UserActivityLogger to capture final HTTP status.' },
        { term: 'Time Quantum', def: 'Maximum consecutive CPU ticks a Round Robin process may run before yielding back to the Ready Queue.' },
        { term: 'Aging (OS Scheduling)', def: 'Gradually boosting priority of waiting processes to prevent starvation under Preemptive Priority scheduling.' },
        { term: 'ReadOnlySpan<char>', def: 'Stack-only slice over contiguous character memory enabling zero-allocation parsing in .NET.' }
    ],

    faq: [
        {
            q: 'What kind of backend and systems roles are you interested in?',
            a: 'Backend and platform engineering roles working on distributed services, APIs, developer tooling, and performance-critical .NET or Go systems. I enjoy owning architecture end-to-end—from domain modeling and SQL queries to Linux deployments and CI quality gates.'
        },
        {
            q: 'What are you building right now at Ofuq and Tawjjeh?',
            a: 'At Ofuq I work on Marsa (a self-hosted single-host deployment platform in .NET 10, PostgreSQL, Docker, and Caddy) and Ruqa (a lightweight native Rust desktop whiteboard). At Tawjjeh I contribute to TalebElm, a Clean Architecture .NET 10 learning platform with server-verified progression.'
        },
        {
            q: 'Which open-source NuGet packages or tools have you shipped?',
            a: 'Egypt.Net.Core (zero-dependency Egyptian National ID & geography domain library with 150+ tests and 2.13 μs parsing), UserActivityLogger (attribute-driven ASP.NET Core MVC audit logging package v1.0.10), and qget (cross-platform Go CLI video downloader).'
        },
        {
            q: 'What is your daily Linux / dev environment like?',
            a: 'I run a minimal X11 setup on EndeavourOS / Arch Linux using custom-patched dwm 6.8 and st 0.9.3 (published in my rice repo) with Neovim / Rider / VS Code, Docker, and PostgreSQL.'
        }
    ]
};

