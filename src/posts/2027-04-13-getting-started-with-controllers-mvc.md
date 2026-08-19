---
author: Steve Kaschimer
date: 2027-04-13
image: /images/posts/2027-04-13-hero.webp
image_alt: "A single class-shaped icon issuing an automatic checkmark badge and a standardized error panel, with a small filter ring wrapped around it representing a cross-cutting action filter."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid rectangle representing a controller class, with a small amber checkmark badge automatically emitted from its top edge and a compact standardized error panel emitted from its base, both connected by short teal lines showing they come from the same source with no manual wiring. A thin ring shape wraps partway around the rectangle representing an action filter intercepting the flow. Mood is structured, conventions-driven, and mature. Avoid: vendor logos, brand colors, circuit-board textures, gears, or a sprawling class-diagram as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Controllers earn their conventions at scale - automatic model validation, binding source inference, and standardized error responses that Minimal APIs make you assemble yourself. A setup guide for [ApiController], FluentValidation, and action filters."
tags: ["dotnet", "api-design", "developer-productivity", "tooling"]
title: "Getting Started with Controllers (MVC) in .NET"
---



Controllers are the original ASP.NET Core web API pattern, and while new project templates now default to Minimal APIs, Controllers remain the right call for large APIs that benefit from `[ApiController]`'s conventions. The part worth understanding isn't the syntax - it's what `[ApiController]` is actually doing for you behind the scenes, since that's exactly what you'd otherwise have to reconstruct by hand in Minimal APIs.

This guide covers scaffolding a Controllers-based Web API, what `[ApiController]` actually provides (automatic model validation, binding source inference, standardized error responses), wiring up FluentValidation for cases the built-in validation doesn't cover, and using action filters for cross-cutting concerns. By the end you'll understand not just how to write a controller, but what convention it's leaning on and why.

If you're deciding between API styles first, [a comparison of the top .NET API styles](/posts/2027-03-30-top-5-dotnet-api-styles-compared/) covers where Controllers fit relative to Minimal APIs, gRPC, GraphQL, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- Familiarity with attribute-based routing and standard MVC conventions is helpful but not required

## Scaffolding a Controllers Project

```bash
dotnet new webapi --use-controllers
```

The `--use-controllers` flag is now required - without it, `dotnet new webapi` scaffolds a Minimal API project instead. This is a template default change, not a deprecation of Controllers themselves.

## Bootstrapping the Ideal Environment

### Register MVC services

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
```

### Define a controller and understand what [ApiController] does

```csharp
[ApiController]
[Route("orders")]
public class OrdersController(AppDbContext db) : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<Order>> GetOrder(int id)
    {
        var order = await db.Orders.FindAsync(id);
        return order is null ? NotFound() : Ok(order);
    }

    [HttpPost]
    public async Task<ActionResult<Order>> CreateOrder(CreateOrderRequest request)
    {
        var order = new Order { CustomerId = request.CustomerId };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }
}
```

`[ApiController]` isn't just a marker attribute - it enables three specific behaviors: automatic `400 Bad Request` responses when model validation fails (before your action method even runs), inference of binding sources (route, query, body) without explicit `[FromRoute]`/`[FromBody]` attributes in most cases, and standardized `ProblemDetails` error responses. Understanding these three is more useful than memorizing the attribute's existence.

### Add FluentValidation for validation logic beyond data annotations

`[ApiController]`'s automatic validation covers data-annotation attributes (`[Required]`, `[Range]`, etc.) on your request models, but real validation logic often needs more than annotations express:

```bash
dotnet add package FluentValidation.AspNetCore
```

```csharp
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId).GreaterThan(0);
    }
}
```

```csharp
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderRequestValidator>();
builder.Services.AddFluentValidationAutoValidation();
```

`AddFluentValidationAutoValidation()` hooks FluentValidation into the same automatic-validation pipeline `[ApiController]` already uses, so a failing FluentValidation rule produces the same standardized `400` response as a failing data annotation - one consistent validation experience, not two different error shapes depending on which validation mechanism caught the problem.

## Core Workflow

### Action filters for cross-cutting concerns

```csharp
public class LoggingActionFilter(ILogger<LoggingActionFilter> logger) : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context) =>
        logger.LogInformation("Executing {Action}", context.ActionDescriptor.DisplayName);

    public void OnActionExecuted(ActionExecutedContext context) =>
        logger.LogInformation("Executed {Action} with result {Result}",
            context.ActionDescriptor.DisplayName, context.Result?.GetType().Name);
}
```

```csharp
builder.Services.AddControllers(options =>
    options.Filters.Add<LoggingActionFilter>());
```

Registered globally like this, the filter runs around every action. Filters can also be applied per-controller or per-action via `[ServiceFilter(typeof(LoggingActionFilter))]` when you don't want the behavior everywhere.

### Filters vs. middleware

A common early point of confusion: middleware runs for every request regardless of whether it maps to a controller action, and operates on the raw `HttpContext`. Action filters run specifically around MVC action execution and have access to model-bound arguments and the action result - use middleware for concerns that apply to the whole pipeline (authentication, response compression), and filters for concerns specific to how MVC actions execute (logging action-level details, short-circuiting based on model state).

## Verifying Your Setup

1. **Automatic model validation actually triggers** - send a request with an invalid data-annotation-decorated field and confirm you get a `400` with `ProblemDetails`, without any manual `ModelState.IsValid` check in your action
2. **Binding sources resolve correctly** - confirm route parameters, query parameters, and body content bind to the right action parameters without needing explicit `[From...]` attributes in the common cases
3. **FluentValidation rules fire through the same pipeline** - confirm a failing FluentValidation rule produces the same response shape as a failing data annotation
4. **Registered filters actually run** - confirm your `LoggingActionFilter` (or equivalent) output appears for controller actions

## Best Practices

**Lean on `[ApiController]`'s automatic behaviors instead of reimplementing them.** Manually checking `ModelState.IsValid` in every action, or hand-rolling error response shapes, duplicates what the attribute already does consistently across your whole API.

**Use FluentValidation for validation logic beyond simple data annotations, wired through the same automatic pipeline.** Two different validation mechanisms producing two different error shapes is worse for API consumers than picking one consistent approach.

**Reserve action filters for concerns specific to action execution, not general request handling.** If a concern applies to every request regardless of routing, it belongs in middleware, not a filter.

**Don't add Controllers to a project just out of habit if it's small and greenfield.** The conventions `[ApiController]` provides pay off at scale - for a handful of endpoints, that structure is available but not necessarily needed, and Minimal APIs may be the better starting point.

**Keep controllers thin - push business logic into services injected via the constructor.** A controller action should orchestrate (bind, call a service, return a result), not contain the actual business logic itself.

## Comparison with Minimal APIs

| | Controllers | Minimal APIs |
| --- | --- | --- |
| Validation | Automatic via `[ApiController]` | Manual, via endpoint filters |
| Ceremony per endpoint | Higher - controller class + action method | Low - a few lines, no class required |
| Cross-cutting concerns | Action filters (`IActionFilter`) | Endpoint filters (`AddEndpointFilter`) |
| Scaffolding | `dotnet new webapi --use-controllers` | `dotnet new webapi` (default) |
| Best for | Large APIs benefiting from established conventions | New REST APIs, smaller-to-medium services |

## Frequently Asked Questions

### What does [ApiController] actually do, beyond marking a class as an API controller?

Three concrete things: automatic `400` responses on model validation failure (without you calling `ModelState.IsValid`), inference of binding sources so you rarely need explicit `[FromRoute]`/`[FromQuery]`/`[FromBody]` attributes, and standardized `ProblemDetails` error response shapes. All three are things you'd otherwise assemble yourself in a Minimal API.

### Why does dotnet new webapi scaffold Minimal APIs instead of Controllers now?

Microsoft changed the default template to favor Minimal APIs as the lighter-weight, more modern starting point. Controllers aren't deprecated - `--use-controllers` still scaffolds the full MVC pattern - it's purely a change in which one you get without an explicit flag.

### What's the difference between middleware and action filters?

Middleware runs for every request in the pipeline regardless of whether it reaches a controller action, and works with the raw `HttpContext`. Action filters run specifically around MVC action execution, with access to bound arguments and the action's result - use middleware for pipeline-wide concerns, filters for action-execution-specific ones.

### Do I still need FluentValidation if I'm using data annotations?

Not necessarily - data annotations cover simple, declarative rules fine. FluentValidation earns its place when validation logic needs conditional rules, cross-field checks, or reuse across multiple request types that data annotations can't express cleanly. Both can coexist through the same automatic-validation pipeline when wired up correctly.

### Can Controllers and Minimal APIs coexist in one project?

Yes - both can be registered and used in the same ASP.NET Core application. It's uncommon as a permanent architecture, but a reasonable interim state during a gradual migration between the two styles.

### What's the most common mistake in a first Controllers setup?

Manually reimplementing behaviors `[ApiController]` already provides for free - explicit `ModelState.IsValid` checks, hand-written error response shapes - usually because the developer isn't aware those come automatically with the attribute, producing inconsistent behavior across the API where some actions get the automatic treatment and others don't.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
