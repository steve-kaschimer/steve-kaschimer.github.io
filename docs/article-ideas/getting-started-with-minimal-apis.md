# Getting Started with Minimal APIs in .NET

Minimal APIs make the first ten minutes genuinely trivial -- `app.MapGet("/orders/{id}", ...)` and you have a working endpoint. The part that doesn't show up in a quickstart is what happens once you have forty of those calls in `Program.cs`: without a deliberate organizational strategy, a file that started as "delightfully simple" becomes the least navigable part of the codebase. That's the gap this guide is aimed at closing.

This guide covers setting up Minimal APIs in .NET, bootstrapping route organization, validation, and OpenAPI documentation from the start rather than retrofitting them later, the core patterns for request handling and dependency injection, and the best practices that keep a Minimal API codebase readable well past the first few endpoints. By the end you'll have a structure that scales in organization, not just in endpoint count.

If you're deciding between API styles first, a comparison of the top .NET API styles covers where Minimal APIs fit relative to Controllers, gRPC, GraphQL, and SignalR.

## What You'll Need

- .NET 8 SDK or later
- No special packages beyond ASP.NET Core itself for the basics -- validation and OpenAPI support are add-ons covered below

## Installing and Scaffolding

```bash
dotnet new web -n MyApp.Api
cd MyApp.Api
```

The `web` template (not `webapi`, which defaults to Controllers) scaffolds a Minimal API project directly.

## Bootstrapping the Ideal Environment

### Route groups: the antidote to a sprawling Program.cs

Instead of registering every route directly on `app`, group related endpoints and move the registration into extension methods per feature area:

```csharp
// Features/Orders/OrderEndpoints.cs
public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/orders").WithTags("Orders");

        group.MapGet("/{id:int}", GetOrderById);
        group.MapPost("/", CreateOrder);
        group.MapPost("/{id:int}/process", ProcessOrder);
    }

    private static async Task<IResult> GetOrderById(int id, IOrderService orderService)
    {
        var order = await orderService.GetByIdAsync(id);
        return order is not null ? Results.Ok(order) : Results.NotFound();
    }

    private static async Task<IResult> CreateOrder(CreateOrderRequest request, IOrderService orderService)
    {
        var order = await orderService.CreateAsync(request);
        return Results.Created($"/orders/{order.Id}", order);
    }

    private static async Task<IResult> ProcessOrder(int id, IOrderService orderService)
    {
        await orderService.ProcessAsync(id);
        return Results.NoContent();
    }
}
```

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<IOrderService, OrderService>();

var app = builder.Build();
app.MapOrderEndpoints();
app.MapCustomerEndpoints();
app.Run();
```

`MapGroup` also lets you apply shared configuration -- authorization, rate limiting, a common prefix -- to every endpoint in the group at once, rather than repeating it per route.

### OpenAPI documentation from day one

```bash
dotnet add package Microsoft.AspNetCore.OpenApi
```

```csharp
builder.Services.AddOpenApi();

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
```

Annotate endpoints with metadata so the generated spec is actually useful, not just technically present:

```csharp
group.MapGet("/{id:int}", GetOrderById)
    .WithName("GetOrderById")
    .WithSummary("Retrieves an order by its ID")
    .Produces<Order>(200)
    .Produces(404);
```

### Validation without hand-rolled if-statements everywhere

```bash
dotnet add package FluentValidation
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

Wire validation into a filter so it runs automatically rather than being called manually in every handler:

```csharp
public static class ValidationFilterExtensions
{
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) =>
        builder.AddEndpointFilter(async (context, next) =>
        {
            var arg = context.Arguments.OfType<T>().FirstOrDefault();
            var validator = context.HttpContext.RequestServices.GetService<IValidator<T>>();
            if (validator is not null && arg is not null)
            {
                var result = await validator.ValidateAsync(arg);
                if (!result.IsValid)
                    return Results.ValidationProblem(result.ToDictionary());
            }
            return await next(context);
        });
}
```

```csharp
group.MapPost("/", CreateOrder).WithValidation<CreateOrderRequest>();
```

## Core Workflow

- **One extension method per feature area, registered from `Program.cs`.** This keeps `Program.cs` itself short and stable, while each feature's endpoints live in their own file.
- **Use typed results (`Results.Ok`, `Results.NotFound`, `Results.Created`) rather than raw objects.** This keeps response semantics explicit and plays well with OpenAPI generation.
- **Inject dependencies as handler parameters, not through a constructor.** Minimal API handlers aren't classes -- dependencies are resolved as method parameters, which ASP.NET Core handles automatically for registered services.

```csharp
private static async Task<IResult> GetOrderById(int id, IOrderService orderService, CancellationToken ct)
{
    var order = await orderService.GetByIdAsync(id, ct);
    return order is not null ? Results.Ok(order) : Results.NotFound();
}
```

## Verifying Your Setup

1. **Routes are grouped by feature, not all inline in `Program.cs`** -- confirm `Program.cs` stays short as endpoint count grows
2. **OpenAPI spec reflects actual response shapes** -- check `/openapi/v1.json` (or your configured path) and confirm `Produces<T>` annotations match reality
3. **Validation runs automatically, not by convention** -- submit an invalid request and confirm it's rejected by the filter, not by a manual check inside the handler
4. **Handlers stay thin** -- confirm business logic lives in injected services, not directly in the route handler lambda

## Best Practices

**Use route groups and extension methods from the start, not after `Program.cs` becomes unmanageable.** Retrofitting organization onto forty inline route registrations is far more painful than starting with the structure.

**Keep handlers thin -- delegate to services for actual logic.** A Minimal API handler should orchestrate (parse request, call a service, shape response), not contain business rules directly.

**Adopt validation as a filter, applied consistently, rather than ad hoc per-handler checks.** Consistency here matters more than which specific validation library you choose.

**Set up OpenAPI generation early.** It's cheap to add at the start and expensive to retrofit accurately once endpoint behavior has drifted from what documentation would describe.

**Don't avoid Minimal APIs' simplicity by re-implementing Controllers' patterns wholesale.** If you find yourself building an elaborate custom framework on top of Minimal APIs to replicate every Controllers convention, that's a signal Controllers might actually be the better fit for your project.

## Comparison with Controllers

| | Minimal APIs | Controllers (MVC) |
| --- | --- | --- |
| Boilerplate | Lower | Higher -- controller classes, action method conventions |
| Organization | Manual (route groups, extension methods) | Built in (controller-per-resource) |
| Filters & conventions | Available, less mature ecosystem | Extensive, decade-plus of accumulated tooling |
| Performance | Slightly faster, lower overhead | Slightly more overhead |
| Best fit | New projects, microservices, moderate-sized APIs | Large APIs, teams with existing Controllers investment |

Microsoft recommends Minimal APIs as the default for new projects, but the two aren't mutually exclusive within a solution -- some teams use Minimal APIs for simple services and Controllers for a more complex one that benefits from its conventions.

## Frequently Asked Questions

### Are Minimal APIs slower or less capable than Controllers?

No -- Minimal APIs are generally slightly faster due to lower overhead, and they've closed most of the feature gaps (filters, model binding customization, OpenAPI support) that used to favor Controllers. The remaining differences are more about ecosystem maturity and organizational conventions than raw capability.

### How do I keep Program.cs from becoming unmanageable as I add endpoints?

Use `MapGroup` and extension methods to move endpoint registration into per-feature files, called from `Program.cs` as a single line each (`app.MapOrderEndpoints()`). This is the single most important habit for keeping a Minimal API project navigable as it grows.

### How does dependency injection work without a constructor?

Minimal API handlers aren't classes, so services are injected as method parameters instead -- ASP.NET Core's DI container resolves any parameter type it recognizes as a registered service automatically, without needing `[FromServices]` in most cases.

### Can I use Minimal APIs and Controllers in the same project?

Yes -- they can coexist in the same ASP.NET Core application. This is sometimes used during a gradual migration from Controllers to Minimal APIs, or deliberately, using each style where it fits best within the same solution.

### How do I handle authorization in Minimal APIs?

Apply `.RequireAuthorization()` to a route group or individual endpoint, the same underlying authorization system Controllers use via `[Authorize]`. Route groups make this easy to apply consistently across every endpoint in a feature area with one call.

### What's the best way to handle validation in Minimal APIs?

An endpoint filter (as shown above) that runs a validator (commonly FluentValidation) automatically before the handler executes, rather than each handler manually checking and returning a bad-request response. This keeps validation consistent without repeating boilerplate in every handler.

### What's the most common mistake in a first Minimal APIs setup?

Registering every route directly on `app` in `Program.cs` without route groups or extension methods, which works fine for the first handful of endpoints and becomes genuinely hard to navigate by the time an API has thirty or forty. Establishing feature-based organization early avoids a painful retrofit later.
