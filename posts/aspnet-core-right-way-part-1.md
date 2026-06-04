# ASP.NET Core: The Right Way — Part 1: Framework Foundations & Project Setup

Welcome to **ASP.NET Core: The Right Way**, a series where we build a real backend project from scratch. Each part focuses on one clear step — no fluff, no skipped fundamentals.

This first post is for anyone opening ASP.NET Core for the first time. By the end, you will have a running API and a clear mental model of how everything fits together.

---

## Why ASP.NET Core?

ASP.NET Core is Microsoft's modern web framework for building APIs, web apps, and microservices. It is:

- **Cross-platform** — runs on Linux, macOS, and Windows.
- **High-performance** — consistently ranks among the fastest web frameworks (TechEmpower benchmarks).
- **Open source** — the runtime, framework, and tooling are all on GitHub under the .NET Foundation.
- **Unified** — one framework for APIs, MVC, gRPC, Blazor, and minimal APIs.

If you are coming from Node.js, think of it as Express with a built-in DI container, a powerful middleware pipeline, and first-class async support baked in at every layer.

---

## Prerequisites

Before writing any code, install these:

| Tool | Why you need it | Where to get it |
|---|---|---|
| .NET SDK 9.0+ | Compiles and runs your project | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| An editor | Writing code | JetBrains Rider, Visual Studio, or VS Code with the C# extension |
| Terminal | Running CLI commands | Built-in on any OS |

Verify your installation:

```bash
dotnet --version
```

You should see something like `9.0.x`. If not, restart your terminal and try again.

---

## Picking Your Project

This series follows a single project throughout. You will learn more by building one thing well than by skipping between tutorials.

I recommend building a **team task manager API** — simple enough to focus on backend concepts, but rich enough to need real features:

- Projects and tasks with CRUD endpoints
- User authentication and authorization
- Validation and error handling
- Database persistence
- Testing

Every pattern we cover will apply directly to real-world apps.

---

## Understanding the Framework Layers

ASP.NET Core is built on a few core concepts. Grasping these now will save you confusion later:

### The Kestrel Web Server

Kestrel is the cross-platform HTTP server built into ASP.NET Core. When you run your app, Kestrel starts, listens for HTTP requests, and pushes them through your application's pipeline. You rarely interact with Kestrel directly, but knowing it exists helps when you debug startup issues or configure hosting.

### The Middleware Pipeline

Every request travels through a series of middleware components in order. Each piece can inspect, modify, or short-circuit the request. Common middleware includes:

```
Request → Exception Handling → Logging → Authentication → Authorization → Endpoint → Response
```

You control the order by adding middleware in `Program.cs`.

### Dependency Injection

ASP.NET Core has a built-in DI container. Services are registered once and resolved automatically throughout your app. This keeps components loosely coupled and testable. You will use it constantly — controllers, services, repositories all receive their dependencies through constructors.

### The Configuration System

Settings come from multiple sources — `appsettings.json`, environment variables, command-line args, user secrets — merged into a single key-value hierarchy. You never hardcode connection strings or API keys.

---

## Creating the Project

Open a terminal and run:

```bash
dotnet new webapi -n TaskManager.Api
cd TaskManager.Api
```

This scaffolds a minimal Web API project. Let us look at what was generated:

```bash
TaskManager.Api/
├── Program.cs          # App entrypoint — middleware pipeline lives here
├── Properties/
│   └── launchSettings.json
├── appsettings.json    # Configuration
├── appsettings.Development.json
└── TaskManager.Api.http  # Test file (VS Code REST Client)
```

Open `Program.cs`. In .NET 9, the template uses the **top-level statements** style — no visible `Main` or `class Program` wrapper. You see the pipeline directly:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();

app.Run();
```

This is your app's boot sequence: create a builder, register services, build the app, configure middleware, and run.

### Run It

```bash
dotnet run
```

You should see output like:

```
Now listening on: http://localhost:5xxx
```

Open that URL in your browser or use the `.http` file. You will see an empty 404 because the template has no actual endpoints yet — that is what Part 2 is for.

---

## Organizing for Growth

A single `Program.cs` and a `Controllers/` folder works for the first week. Beyond that, your project becomes hard to navigate. We will use a **feature-based structure** from the start:

```
TaskManager.Api/
├── Program.cs
├── appsettings.json
├── Features/
│   ├── Projects/
│   │   ├── ProjectsController.cs
│   │   ├── CreateProject.cs
│   │   └── GetProjects.cs
│   └── Tasks/
│       ├── TasksController.cs
│       └── ...
└── Common/
    ├── Models/
    └── Data/
```

This groups files by feature rather than by technical layer. When you add a new feature, you create one folder instead of touching five separate directories.

---

## Summary

You now have:
- A running ASP.NET Core API
- A clear picture of the framework's building blocks
- A project structure ready to grow
- A defined project idea to build on

### What is next

Part 2 will cover the request-response cycle in depth — routing, controllers, model binding, and returning proper HTTP responses.

---

*Written by Abdulrahman Hossam*
