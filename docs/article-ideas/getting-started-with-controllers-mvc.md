# Getting Started with Controllers (MVC) in .NET

Controllers are the pattern most .NET developers learned API development on, and more than a decade of accumulated conventions -- attribute routing, model binding, filters, `ApiController` behaviors -- are exactly why large APIs still reach for them even with Minimal APIs now the recommended default for new projects. The tricky part isn't the basics; it's knowing which of those conventions to actually lean on versus which have become unnecessary ceremony now that Minimal APIs exist as an alternative.

This guide covers setting up a Controllers-based Web API in .NET, bootstrapping the project so filters, model binding, and validation work the way they're meant to, the core workflow of adding a resource, and the best practices that keep a Controllers codebase from accumulating the kind of boilerplate that gives the pattern its reputation. By the end you'll have a structure that makes good use of what Controllers actually offer over Minimal APIs.

If you're deciding between API styles first, a comparison of the top .NET API styles covers where Controllers fit relative to Minimal APIs, gRPC, GraphQL, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- No special packages for the basics -- Controllers are part of `Microsoft.AspNetCore.Mvc`, included in the ASP.NET Core shared framework

## Installing and Scaffolding

```bash
dotnet new webapi -n MyApp.Api --use-controllers
cd MyApp.Api
```

The `--use-controllers` flag is necessary in current templates, since `dotnet new webapi` defaults to Minimal APIs -- worth knowing so you don't end up with the wrong template by default.

## Bootstrapping the Ideal Environment

### A controller with the conventions that actually earn their keep

```csharp
[ApiController]
[Route("api/[controller]")]
public class OrdersController(IOrderService orderService) : ControllerBase
{
    [HttpGet("{id:int}")]
    [ProducesResponseType<Order>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await orderService.GetByIdAsync(id);
        return order is not null ? Ok(order) : NotFound();
    }

    [HttpPost]
    [ProducesResponseType<Order>(StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(CreateOrderRequest request)
    {
        var order = await orderService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }
}
```

`[ApiController]` is what enables automatic model validation (returning 400 on an invalid model without you writing the check), automatic binding source inference, and problem-details-formatted error responses -- it's doing real work, not just decoration.

### Register MVC services and configure validation behavior

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();
app.MapControllers();
app.Run();
```

### FluentValidation instead of DataAnnotations, if your validation needs more than attributes provide

```bash
dotnet add package FluentValidation.AspNetCore
```

```csharp
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderRequestValidator>();
builder.Services.AddFluentValidationAutoValidation();
```

```csharp
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId).GreaterThan(0);
        RuleFor(x => x.Items).NotEmpty();
    }
}
```

With auto-validation registered, `[ApiController]`'s automatic model validation now runs your FluentValidation rules instead of (or alongside) DataAnnotations, without any change to the controller action itself.

### Filters for genuinely cross-cutting concerns

```csharp
public class LoggingActionFilter(ILogger<LoggingActionFilter> logger) : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context) =>
        logger.LogInformation("Executing {Action}", context.ActionDescriptor.DisplayName);

    public void OnActionExecuted(ActionExecutedContext context) { }
}
```

```csharp
builder.Services.AddControllers(options =>
{
    options.Filters.Add<LoggingActionFilter>();
});
```

Filters are one of Controllers' clearest advantages over Minimal APIs' endpoint filters -- more mature, more discoverable, and with a well-understood execution pipeline (authorization, resource, action, exception, result) that's been stable for years.

## Core Workflow

Adding a resource typically means:

1. Create a controller class for the resource, decorated with `[ApiController]` and a route template
2. Add action methods for each operation, using attribute routing (`[HttpGet]`, `[HttpPost]`, etc.) rather than convention-based routing for clarity
3. Return `IActionResult` (or a specific typed result) and annotate with `[ProducesResponseType]` for accurate OpenAPI generation
4. Delegate actual logic to an injected service -- keep the controller thin, the same discipline that applies to Minimal API handlers

## Verifying Your Setup

1. **`[ApiController]` automatic validation is active** -- submit an invalid model and confirm a 400 response is returned without any manual check in the action
2. **Routes resolve as expected** -- confirm attribute routes produce the URLs you intend, especially for nested or non-default patterns
3. **Filters execute in the expected order** -- for cross-cutting concerns implemented as filters, confirm they run at the pipeline stage you expect (authorization vs. action vs. result)
4. **OpenAPI/Swagger reflects actual responses** -- confirm `[ProducesResponseType]` annotations match what actions actually return

## Best Practices

**Use `[ApiController]` on every API controller.** It's not optional ceremony -- automatic model validation and consistent error responses are genuinely useful behavior you'd otherwise have to write yourself.

**Prefer attribute routing over convention-based routing for APIs.** Explicit `[HttpGet("{id:int}")]` routes are easier to reason about and search for than routes inferred from method names and a global convention.

**Keep controllers thin.** The same discipline that applies to Minimal API handlers applies here -- a controller action should orchestrate, not contain business logic directly.

**Reach for filters specifically for cross-cutting concerns**, not as a general-purpose place to put logic that could just as easily live in a service. Logging, authorization checks, and response shaping are good filter candidates; business rules are not.

**Don't add Controllers' full ceremony to every action out of habit.** Not every endpoint needs a dedicated response type for every possible status code -- match the documentation and structure effort to the actual complexity of the endpoint.

## Comparison with Minimal APIs

| | Controllers (MVC) | Minimal APIs |
| --- | --- | --- |
| Boilerplate | Higher -- controller classes, action conventions | Lower |
| Validation | Automatic via `[ApiController]` | Requires an explicit filter |
| Filters | Mature, well-established pipeline | Available, less mature ecosystem |
| Organization | Built in (controller-per-resource) | Manual (route groups, extension methods) |
| Best fit | Large APIs, teams with existing investment | New projects, microservices |

Controllers' conventions cost more upfront but pay off at scale -- for a very large API with many related endpoints and cross-cutting concerns, that structure is doing real work. For a smaller API or microservice, the same structure is often more ceremony than the problem needs.

## Frequently Asked Questions

### Is dotnet new webapi still the right command for a Controllers-based API?

You need the `--use-controllers` flag explicitly -- current templates default to Minimal APIs when you run `dotnet new webapi` without it. This is a change worth knowing about if you're following an older tutorial that assumes Controllers are still the default.

### What does [ApiController] actually do?

It enables several behaviors specifically for API controllers: automatic HTTP 400 responses on invalid model state (without you writing the check), inference of binding sources (route, query, body) without explicit `[FromRoute]`/`[FromBody]` attributes in common cases, and problem-details-formatted error responses. It's a meaningful convenience, not just a marker attribute.

### Should I use DataAnnotations or FluentValidation with Controllers?

Either works, and `[ApiController]`'s automatic validation triggers for both once FluentValidation's auto-validation package is registered. DataAnnotations are simpler for basic rules; FluentValidation is worth adopting once your validation logic needs conditional rules, cross-property validation, or better testability than attributes provide.

### How do filters differ from middleware?

Middleware operates on every request at the ASP.NET Core pipeline level, before routing has even resolved which controller or action will handle it. Filters operate specifically within the MVC action-invocation pipeline, with more granular stages (authorization, resource, action, exception, result) and access to action-specific context like model binding results. Use middleware for cross-cutting concerns that apply regardless of routing; use filters for concerns specific to controller actions.

### Can I mix Controllers and Minimal APIs in the same project?

Yes -- both `app.MapControllers()` and `app.MapGet(...)`-style Minimal API routes can coexist in the same ASP.NET Core application. This is common during a gradual migration in either direction, or as a deliberate choice to use each style where it fits best.

### Is Controllers' performance meaningfully worse than Minimal APIs?

Slightly, in raw benchmarks -- Controllers carry more overhead per request due to the MVC pipeline's additional machinery. For the vast majority of real applications, this difference is not the deciding factor; organizational fit and team familiarity matter more than the marginal performance gap in most cases.

### What's the most common mistake in a first Controllers setup?

Skipping `[ApiController]`, which means losing automatic model validation and the other conveniences it provides, then manually re-implementing validation checks that the attribute would have handled for free. The second common mistake is putting real business logic directly in controller actions instead of delegating to injected services, which makes both testing and eventual refactoring harder.
