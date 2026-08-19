---
author: Steve Kaschimer
date: 2027-04-06
image: /images/posts/2027-04-06-hero.webp
image_alt: "A layered rectangle stack representing per-feature route groups, each labeled section connecting to a single narrow endpoint channel with no controller class icon in sight."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small stack of three thin labeled rectangles representing per-feature route groups, each connected by a short teal line converging into a single narrow endpoint channel on the right. Below, a small filter-funnel icon sits beside a compact validation checkmark badge, representing an endpoint filter. Mood is lean, modern, and low-ceremony. Avoid: vendor logos, brand colors, circuit-board textures, gears, or a class-diagram box as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Minimal APIs are Microsoft's recommended default for new ASP.NET Core REST APIs in 2026. A setup guide for route groups that keep a growing API organized, OpenAPI wiring, and validation through a reusable endpoint filter."
tags: ["dotnet", "api-design", "developer-productivity", "tooling"]
title: "Getting Started with Minimal APIs in .NET"
---



Minimal APIs are the leaner of the two REST styles ASP.NET Core offers, and Microsoft's recommended default for new projects - `dotnet new webapi` scaffolds them unless you explicitly opt into Controllers. The pitch is straightforward: fewer classes, less ceremony, an endpoint that's a few lines of code. The part that trips people up isn't the basics, it's what happens once you have more than a handful of endpoints and `Program.cs` starts sprawling.

This guide covers installing and scaffolding a Minimal API project, organizing endpoints with route groups and per-feature extension methods before `Program.cs` becomes unmanageable, wiring up OpenAPI documentation, and adding validation through a reusable endpoint filter. By the end you'll have a setup that stays organized as it grows, not just a working "hello world" endpoint.

If you're deciding between API styles first, [a comparison of the top .NET API styles](/posts/2027-03-30-top-5-dotnet-api-styles-compared/) covers where Minimal APIs fit relative to Controllers, gRPC, GraphQL, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- Basic familiarity with ASP.NET Core's dependency injection and hosting model
- No prior Minimal API experience required - the whole point is that there's less to learn upfront than Controllers

## Scaffolding a Minimal API Project

```bash
dotnet new web
```

`dotnet new web` gives you the bare Minimal API template. If you've used `dotnet new webapi` before and got Controllers instead, that's because the webapi template now defaults to Minimal APIs too - `--use-controllers` is what opts back into MVC.

## Bootstrapping the Ideal Environment

### Start simple, then reach for route groups

A handful of endpoints directly in `Program.cs` is fine at first:

```csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/orders/{id}", (int id) => Results.Ok(new { id, status = "Processing" }));
app.MapPost("/orders", (CreateOrderRequest request) => Results.Created($"/orders/{1}", request));

app.Run();
```

This is exactly where Minimal APIs earn their reputation for low ceremony - and exactly where a growing API starts to sprawl if every endpoint lives directly in `Program.cs`. The fix is route groups combined with per-feature extension methods, not abandoning Minimal APIs for Controllers.

### Organize with route groups and extension methods

```csharp
public static class OrderEndpoints
{
    public static RouteGroupBuilder MapOrderEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id}", GetOrder);
        group.MapPost("/", CreateOrder);
        return group;
    }

    private static async Task<IResult> GetOrder(int id, AppDbContext db) =>
        await db.Orders.FindAsync(id) is { } order
            ? Results.Ok(order)
            : Results.NotFound();

    private static async Task<IResult> CreateOrder(CreateOrderRequest request, AppDbContext db)
    {
        var order = new Order { CustomerId = request.CustomerId };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return Results.Created($"/orders/{order.Id}", order);
    }
}
```

```csharp
// Program.cs
app.MapGroup("/orders").MapOrderEndpoints();
```

Each feature gets its own extension method and, typically, its own file - `OrderEndpoints.cs`, `CustomerEndpoints.cs` - which keeps `Program.cs` as a short list of `MapGroup(...).MapXEndpoints()` calls no matter how large the API grows.

### Wire up OpenAPI documentation

```bash
dotnet add package Microsoft.AspNetCore.OpenApi
```

```csharp
// Program.cs
builder.Services.AddOpenApi();

var app = builder.Build();
app.MapOpenApi();
```

`AddOpenApi()`/`MapOpenApi()` gives you a generated OpenAPI document without a third-party package - useful on its own, and a prerequisite if you want to point a UI like Swagger UI or Scalar at your API.

## Core Workflow

### Handler-parameter dependency injection, not constructors

Minimal API handlers resolve dependencies as method parameters rather than through a constructor:

```csharp
private static async Task<IResult> GetOrder(int id, AppDbContext db, ILogger<Program> logger)
{
    logger.LogInformation("Fetching order {OrderId}", id);
    return await db.Orders.FindAsync(id) is { } order
        ? Results.Ok(order)
        : Results.NotFound();
}
```

There's no constructor to wire up - the framework resolves `AppDbContext` and `ILogger<Program>` from DI automatically based on the parameter types, the same way MVC model binding resolves route and query parameters.

### Validation through a reusable endpoint filter

Minimal APIs don't get `[ApiController]`'s automatic model validation for free - you add it deliberately, once, as a reusable filter:

```csharp
public static class ValidationFilterExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter(async (context, next) =>
        {
            var validator = context.HttpContext.RequestServices.GetRequiredService<IValidator<T>>();
            var argument = context.Arguments.OfType<T>().First();
            var result = await validator.ValidateAsync(argument);

            return result.IsValid
                ? await next(context)
                : Results.ValidationProblem(result.ToDictionary());
        });
}
```

```csharp
group.MapPost("/", CreateOrder).WithValidation<CreateOrderRequest>();
```

Add `FluentValidation` (`dotnet add package FluentValidation.DependencyInjectionExtensions`) and register your validators, and this single extension method gives every endpoint that opts in the same validation behavior Controllers get automatically - without tying validation logic to the endpoint definitions themselves.

## Verifying Your Setup

1. **Route groups keep `Program.cs` short** - confirm adding a new feature means adding a new `MapXEndpoints()` file and one line in `Program.cs`, not growing the top-level file
2. **OpenAPI document generates correctly** - hit the `/openapi/v1.json` endpoint (or whatever route `MapOpenApi()` used) and confirm it reflects your actual endpoints
3. **Validation filter runs before handler logic** - send an invalid request body and confirm you get a validation problem response, not a handler exception
4. **Handlers resolve dependencies correctly** - confirm services registered in DI are being injected as method parameters without errors

## Best Practices

**Move to route groups and per-feature extension methods before `Program.cs` gets unwieldy, not after.** The migration is mechanical but tedious to do retroactively across a large file - start the pattern from your second or third feature.

**Add validation deliberately through a filter, don't skip it because it's not automatic.** Minimal APIs not having `[ApiController]`'s built-in validation is a deliberate design choice, not a missing feature - the `WithValidation<T>()` pattern closes that gap in a few lines, once.

**Keep handler methods as static methods on feature-specific classes.** This keeps the handler testable and the routing declaration readable, versus inline lambdas that grow past a few lines directly in the route mapping.

**Use `Results.Xxx` helpers instead of returning raw objects for anything beyond simple `200 OK` responses.** `Results.Created`, `Results.NotFound`, `Results.ValidationProblem` all produce the correct status code and response shape without manual `StatusCode` juggling.

**Reach for Controllers instead if your API's structure genuinely calls for it.** If you find yourself rebuilding `[ApiController]`'s model-binding and error-response conventions piece by piece, that's a signal worth listening to, not a reason to keep pushing through with Minimal APIs out of momentum.

## Comparison with Controllers

| | Minimal APIs | Controllers |
| --- | --- | --- |
| Ceremony per endpoint | Low - a few lines, no class required | Higher - controller class + action method |
| Validation | Manual, via endpoint filters | Automatic via `[ApiController]` |
| Organization at scale | Route groups + extension methods | Controller classes + conventions |
| Default template | `dotnet new webapi` (as of recent SDKs) | `dotnet new webapi --use-controllers` |
| Best for | New REST APIs, smaller-to-medium services | Large APIs benefiting from established conventions |

## Frequently Asked Questions

### Do Minimal APIs support the same routing features as Controllers?

Yes - route parameters, constraints, and route groups all work the same way conceptually. The difference is organizational, not capability: Controllers group routes by class and attribute conventions, Minimal APIs group them explicitly via `MapGroup()` and extension methods.

### How do I keep Program.cs from becoming unmanageable?

Route groups paired with per-feature extension methods (`MapOrderEndpoints`, `MapCustomerEndpoints`) - each feature gets its own file, and `Program.cs` stays a short list of registration calls regardless of how many endpoints the API grows to.

### Is there automatic model validation in Minimal APIs?

Not automatically, unlike `[ApiController]`. You add it deliberately via a reusable `AddEndpointFilter`-based extension method paired with FluentValidation (or a similar library), which is a one-time setup cost that then applies uniformly to every endpoint that opts in.

### Can I mix Minimal APIs and Controllers in the same project?

Yes, they can coexist in the same ASP.NET Core application without conflict. This is uncommon as a permanent architecture but reasonable during a gradual migration from one style to the other.

### What's the biggest structural difference from Controllers besides syntax?

Dependency injection is per-handler-parameter in Minimal APIs instead of per-constructor in Controllers, and validation/model-binding conventions that Controllers give you automatically via `[ApiController]` are things you assemble yourself in Minimal APIs, deliberately, rather than inheriting for free.

### What's the most common mistake in a first Minimal API setup?

Letting every endpoint accumulate directly in `Program.cs` without adopting route groups and extension methods early, and skipping validation entirely because it isn't automatic the way it is with `[ApiController]` - both are avoidable with patterns that take only a little more setup than the naive approach.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
