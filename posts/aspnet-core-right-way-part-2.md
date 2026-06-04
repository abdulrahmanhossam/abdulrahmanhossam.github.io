# ASP.NET Core: The Right Way — Part 2: Controllers, Routing & HTTP Responses

In Part 1 we set up a project, talked through the framework layers, and organized our files. Now we write actual code.

This part covers the request-response cycle — how a URL becomes a C# method call and how you send data back to the client.

---

## HTTP Primer

Every API call is an HTTP request with:

- A **method** (GET, POST, PUT, DELETE, PATCH)
- A **URL path** (`/api/projects`)
- Optional **headers**, **query parameters**, and a **body**

Your job is to map each request to a C# method and return a meaningful response. ASP.NET Core makes this straightforward.

---

## Controllers

A controller is a plain C# class that groups related endpoints together. Each public method is an **action** that handles one type of request.

```csharp
using Microsoft.AspNetCore.Mvc;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(new[] { "Project 1", "Project 2" });
    }
}
```

Key points:
- `[ApiController]` enables automatic model validation, binding, and other API conveniences.
- `[Route("api/[controller]")]` sets the base path. `[controller]` is replaced with `Projects` (the class name minus the suffix).
- `ControllerBase` gives you helper methods like `Ok()`, `NotFound()`, `BadRequest()`.
- `IActionResult` is the return type that represents an HTTP response.

---

## Routing

Routing connects incoming URLs to actions. ASP.NET Core supports **attribute routing** (recommended for APIs).

| Attribute | HTTP method | Example URL |
|---|---|---|
| `[HttpGet]` | GET | `/api/projects` |
| `[HttpPost]` | POST | `/api/projects` |
| `[HttpPut("{id}")]` | PUT | `/api/projects/5` |
| `[HttpDelete("{id}")]` | DELETE | `/api/projects/5` |
| `[HttpPatch("{id}")]` | PATCH | `/api/projects/5` |

The `{id}` part is a route parameter — its value is captured from the URL and passed to your method.

```csharp
[HttpGet("{id}")]
public IActionResult GetById(int id)
{
    // id comes from the URL: /api/projects/42 → id = 42
    return Ok($"Project {id}");
}
```

---

## Model Binding

Parameters come from different places in the request. ASP.NET Core figures out where to look based on the parameter source:

```csharp
// From URL path:  GET /api/projects/5
[HttpGet("{id}")]
public IActionResult GetById(int id)

// From query string:  GET /api/projects?status=active
[HttpGet]
public IActionResult GetAll([FromQuery] string status)

// From request body:  POST /api/projects  with JSON body
[HttpPost]
public IActionResult Create([FromBody] CreateProjectRequest request)

// From route data:  GET /api/projects/5/tasks/3
[HttpGet("{projectId}/tasks/{taskId}")]
public IActionResult GetTask(int projectId, int taskId)
```

`[FromBody]` deserializes JSON from the request body into a C# object. `[FromQuery]` reads from the query string. Simple types like `int id` are inferred from the route by default.

---

## Returning Responses

Always return meaningful HTTP status codes:

```csharp
[HttpGet("{id}")]
public IActionResult GetById(int id)
{
    var project = _repository.Find(id);

    if (project is null)
        return NotFound();                    // 404

    return Ok(project);                       // 200 with body
}

[HttpPost]
public IActionResult Create([FromBody] CreateProjectRequest request)
{
    if (string.IsNullOrWhiteSpace(request.Name))
        return BadRequest("Name is required.");  // 400

    var created = _repository.Add(request);
    return CreatedAtAction(nameof(GetById), new { id = created.Id }, created); // 201
}
```

| Helper | Status | When |
|---|---|---|
| `Ok()` | 200 | Success with optional body |
| `CreatedAtAction()` | 201 | Resource created — includes Location header |
| `NoContent()` | 204 | Success, no body (e.g., DELETE) |
| `BadRequest()` | 400 | Validation failure |
| `NotFound()` | 404 | Resource doesn't exist |
| `Conflict()` | 409 | Duplicate or state conflict |

---

## Your First Complete Controller

Put it all together. Create `Controllers/ProjectsController.cs`:

```csharp
using Microsoft.AspNetCore.Mvc;

namespace TaskManager.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private static readonly List<Project> Projects = new();
    private static int _nextId = 1;

    [HttpGet]
    public IActionResult GetAll()
    {
        return Ok(Projects);
    }

    [HttpGet("{id}")]
    public IActionResult GetById(int id)
    {
        var project = Projects.Find(p => p.Id == id);
        return project is null ? NotFound() : Ok(project);
    }

    [HttpPost]
    public IActionResult Create([FromBody] Project request)
    {
        var project = new Project
        {
            Id = _nextId++,
            Name = request.Name,
            Description = request.Description
        };
        Projects.Add(project);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var removed = Projects.RemoveAll(p => p.Id == id);
        return removed > 0 ? NoContent() : NotFound();
    }
}

public class Project
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
}
```

This uses an in-memory list — fine for learning. Part 3 will add a real database.

---

## Testing Your API

With the project running (`dotnet run`), open the `.http` file that came with the template or use `curl`:

```bash
# Create a project
curl -X POST http://localhost:5xxx/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "My First Project", "description": "Learning ASP.NET Core"}'

# Get all projects
curl http://localhost:5xxx/api/projects

# Get by ID
curl http://localhost:5xxx/api/projects/1

# Delete
curl -X DELETE http://localhost:5xxx/api/projects/1
```

---

## Summary

You now know:
- How controllers map URLs to C# methods
- How routing attributes work
- How model binding pulls data from requests
- How to return proper HTTP responses
- How to build and test a complete CRUD controller

### What is next

Part 3 will replace the in-memory list with Entity Framework Core and a real database — migrations, DbContext, and async operations.

---

*Written by Abdulrahman Hossam*
