# Getting Started with Vertical Slice Architecture in .NET

Vertical Slice Architecture starts from a different question than most patterns in this series. Instead of asking "how should we separate technical concerns," it asks "what does this specific request actually need" -- and then puts the endpoint, validation, business logic, and data access for that one feature in the same place, rather than spreading it across layers that exist purely for technical tidiness.

This guide covers setting up a Vertical Slice solution in .NET, bootstrapping the folder structure and libraries that make slices genuinely self-contained, the core workflow of adding a feature, and the best practices that keep slices from drifting into duplicated chaos as the codebase grows. By the end you'll have a structure where adding a feature means adding a slice, not touching four existing files.

If you're deciding between architecture styles first, a comparison of the top .NET architecture patterns covers where Vertical Slice Architecture fits relative to layered architecture, Clean Architecture, Modular Monolith, and Microservices.

## What You'll Need

- .NET 8 SDK or later
- A relational database (SQL Server, PostgreSQL, or SQLite for local development)
- Comfort with CQRS-style thinking -- commands and queries as discrete, self-contained units are the natural shape of a slice

## Installing and Scaffolding

Vertical Slice Architecture is a folder and code organization convention more than a specific library, but two packages make it dramatically easier to implement cleanly in .NET: MediatR for wiring requests to handlers, and FastEndpoints (or minimal APIs) for lightweight endpoint definitions.

```bash
dotnet new webapi -n MyApp
cd MyApp

dotnet add package MediatR
dotnet add package FastEndpoints
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package FluentValidation
```

Unlike Clean Architecture, Vertical Slice Architecture typically lives in a single project rather than being split across multiple class libraries -- the organization happens at the folder level, by feature, not at the project level, by technical concern.

## Bootstrapping the Ideal Environment

The whole pattern lives or dies on folder structure. Instead of `Controllers/`, `Services/`, and `Repositories/` folders, organize by feature:

```
Features/
  Orders/
    CreateOrder/
      CreateOrderEndpoint.cs
      CreateOrderCommand.cs
      CreateOrderHandler.cs
      CreateOrderValidator.cs
    ProcessOrder/
      ProcessOrderEndpoint.cs
      ProcessOrderCommand.cs
      ProcessOrderHandler.cs
    GetOrderById/
      GetOrderByIdEndpoint.cs
      GetOrderByIdQuery.cs
      GetOrderByIdHandler.cs
```

### A complete slice, start to finish

```csharp
// Features/Orders/ProcessOrder/ProcessOrderCommand.cs
public record ProcessOrderCommand(int OrderId) : IRequest<ProcessOrderResult>;

public record ProcessOrderResult(int OrderId, string Status);
```

```csharp
// Features/Orders/ProcessOrder/ProcessOrderHandler.cs
public class ProcessOrderHandler(AppDbContext db) : IRequestHandler<ProcessOrderCommand, ProcessOrderResult>
{
    public async Task<ProcessOrderResult> Handle(ProcessOrderCommand request, CancellationToken ct)
    {
        var order = await db.Orders.FindAsync([request.OrderId], ct)
            ?? throw new OrderNotFoundException(request.OrderId);

        order.Status = OrderStatus.Processing;
        await db.SaveChangesAsync(ct);

        return new ProcessOrderResult(order.Id, order.Status.ToString());
    }
}
```

```csharp
// Features/Orders/ProcessOrder/ProcessOrderEndpoint.cs
public class ProcessOrderEndpoint(IMediator mediator) : Endpoint<ProcessOrderCommand, ProcessOrderResult>
{
    public override void Configure()
    {
        Post("/orders/{OrderId}/process");
    }

    public override async Task HandleAsync(ProcessOrderCommand req, CancellationToken ct)
    {
        var result = await mediator.Send(req, ct);
        await SendAsync(result, cancellation: ct);
    }
}
```

Everything this feature needs -- request shape, validation (if added via a `ProcessOrderValidator : AbstractValidator<ProcessOrderCommand>`), business logic, and data access -- lives in one folder. Removing the feature means deleting one folder, not hunting across a controller, a service, and a repository.

### Wiring it up in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddFastEndpoints();

var app = builder.Build();
app.UseFastEndpoints();
app.Run();
```

### Handle cross-cutting concerns with a MediatR pipeline, not copy-paste

Validation, logging, and transaction handling shouldn't be re-implemented in every handler. A MediatR pipeline behavior applies them once, across every slice:

```csharp
public class ValidationBehavior<TRequest, TResponse>(IValidator<TRequest>? validator)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (validator is not null)
        {
            var result = await validator.ValidateAsync(request, ct);
            if (!result.IsValid) throw new ValidationException(result.Errors);
        }
        return await next();
    }
}
```

## Core Workflow

Adding a feature is deliberately simple:

1. Create a new folder under `Features/<Area>/<FeatureName>/`
2. Add the command or query, its handler, the endpoint, and a validator if needed
3. Register nothing extra -- MediatR and FastEndpoints discover handlers and endpoints via assembly scanning

Removing or changing a feature is just as contained: touch one folder, and confirm nothing else referenced its internals (nothing should, if the slice was kept properly self-contained).

## Verifying Your Setup

1. **A feature lives in one folder** -- pick any slice and confirm you don't need to open files outside its folder to understand it end-to-end
2. **Cross-cutting concerns apply automatically** -- confirm validation errors from `FluentValidation` are caught by the pipeline behavior without each handler calling the validator manually
3. **Deleting a slice is clean** -- as a test, delete a feature folder and confirm nothing elsewhere in the codebase breaks
4. **Shared logic is deliberately extracted, not duplicated** -- if two slices need the same calculation, confirm it lives in a shared, named location rather than being copy-pasted

## Best Practices

**Resist extracting shared abstractions too early.** A little duplication between two slices is often cheaper than a shared abstraction that has to flex to fit both -- extract only once a real, stable pattern emerges across three or more slices.

**Use a MediatR pipeline for cross-cutting concerns, not per-handler boilerplate.** Validation, logging, and transaction wrapping belong in pipeline behaviors, applied uniformly, not copy-pasted into every handler.

**Don't feel obligated to abstract data access behind a repository inside every slice.** Talking to `DbContext` directly from a handler is often fine in Vertical Slice Architecture -- add an abstraction only where a specific slice actually needs one (for testing, for swapping implementations), not as a blanket rule.

**Keep slices focused on one use case.** A "slice" that handles create, update, and delete for an entity in one file has drifted back toward CRUD-service thinking -- one command or query per slice keeps the isolation real.

**Extract genuinely shared domain logic into a clearly named shared location.** When logic is truly common across many features (a domain entity's own business rules, for instance), a small shared folder is appropriate -- the goal is avoiding unnecessary structure, not avoiding all structure.

## Comparison with Modular Monolith

| Dimension | Vertical Slice Architecture | Modular Monolith |
| --- | --- | --- |
| Unit of organization | Feature / use case | Business capability module |
| Typical scope | Within a single project | Across multiple modules, each potentially its own project |
| Boundary enforcement | Convention -- folders, not compiler-enforced | Often compiler-enforced via project references |
| Best fit | Feature-heavy apps with largely independent use cases | Growing systems needing macro-level boundaries between domains |

These aren't competing choices so much as different altitudes -- a Modular Monolith answers "how do we split the system into modules," while Vertical Slice Architecture answers "how do we organize code within one of those modules." Many well-structured modular monoliths use Vertical Slice Architecture inside each module.

## Frequently Asked Questions

### Does Vertical Slice Architecture mean no shared code at all?

No -- it means shared code should be a deliberate, named extraction rather than a default layer everything routes through. Domain entities, truly common validation rules, and genuinely reusable infrastructure code still belong in shared locations; the difference is that sharing is opt-in per case, not the default structure.

### Do I need MediatR to do Vertical Slice Architecture?

No, but it's a strong fit. MediatR gives each slice a consistent shape (a request, a handler) and a pipeline for cross-cutting concerns, which is most of what makes slices easy to keep consistent across a codebase. You can implement the same organizing principle with plain classes and manual DI registration if you'd rather avoid the dependency.

### How is this different from just putting everything in one big controller?

The key difference is isolation, not co-location for its own sake. A slice groups the request, validation, business logic, and data access for one specific use case -- it doesn't mean cramming unrelated features into a single class. Each slice remains narrowly scoped to one command or query.

### Won't I end up duplicating a lot of logic across slices?

Some duplication is expected and often fine -- it's cheaper than a shared abstraction that has to compromise to fit multiple use cases. Duplication becomes a real problem only when the same non-trivial logic starts drifting out of sync across slices; that's the signal to extract it deliberately, not a reason to avoid the pattern.

### Can Vertical Slice Architecture scale to a large codebase?

Yes, particularly when paired with a Modular Monolith's module boundaries at the macro level -- Vertical Slice Architecture organizes within a module, while the module boundary handles isolation between larger business capabilities. Without that outer structure, a very large number of slices in one flat `Features/` folder can become its own kind of unwieldy, so consider grouping slices by area as the feature count grows.

### Does Vertical Slice Architecture protect the domain from infrastructure the way Clean Architecture does?

Not by default. A slice is free to call `DbContext` directly, which is convenient but doesn't give you the same infrastructure-independence guarantee Clean Architecture's dependency rule provides. If a specific slice has domain logic worth protecting, you can apply that discipline deliberately within the slice -- the two patterns compose rather than conflict.

### What's the biggest mistake teams make adopting Vertical Slice Architecture?

Treating "organize by feature" as "duplicate everything with no shared structure," which produces its own kind of mess -- inconsistent validation, inconsistent error handling, and cross-cutting concerns re-implemented slightly differently in every slice. A shared pipeline for validation, logging, and error handling is what keeps many independent slices feeling like one coherent application.
