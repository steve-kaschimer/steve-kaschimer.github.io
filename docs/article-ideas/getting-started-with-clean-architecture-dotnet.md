# Getting Started with Clean Architecture in .NET

Clean Architecture's core idea is simple to state and easy to get wrong in practice: dependencies point inward, toward the domain, and the domain knows nothing about the database, the web framework, or any other infrastructure detail. Getting the idea is the easy part. Getting the project structure right -- so that rule is actually enforced rather than just aspired to -- is where most first attempts go sideways.

This guide covers scaffolding a Clean Architecture solution in .NET, bootstrapping it so the dependency rule is a compile-time guarantee rather than a convention, the core workflow of adding a feature, and the best practices that keep the pattern's ceremony proportional to the complexity it's protecting. By the end you'll have a solution structure you can extend without the discipline eroding as it grows.

If you're deciding between architecture styles first, a comparison of the top .NET architecture patterns covers where Clean Architecture fits relative to layered architecture, Vertical Slice, Modular Monolith, and Microservices.

## What You'll Need

- .NET 8 SDK or later
- A relational database (SQL Server, PostgreSQL, or SQLite for local development)
- Familiarity with dependency inversion -- it's the concept the entire pattern is built around

## Installing and Scaffolding

Rather than assembling the project structure by hand, start from a proven template. Steve "Ardalis" Smith's Clean Architecture Solution Template is the most widely used starting point in the .NET community:

```bash
dotnet new install Ardalis.CleanArchitecture.Template
dotnet new clean-arch -o MyApp
cd MyApp
```

This scaffolds a solution with `Core`, `UseCases`, `Infrastructure`, and `Web` projects, wired with MediatR for CQRS-style use case handling and FastEndpoints for minimal API endpoints. If you'd rather build the structure by hand to understand each piece, create the projects directly:

```bash
dotnet new sln -n MyApp

dotnet new classlib -n MyApp.Core
dotnet new classlib -n MyApp.UseCases
dotnet new classlib -n MyApp.Infrastructure
dotnet new webapi -n MyApp.Web

dotnet sln add MyApp.Core MyApp.UseCases MyApp.Infrastructure MyApp.Web

dotnet add MyApp.UseCases reference MyApp.Core
dotnet add MyApp.Infrastructure reference MyApp.Core MyApp.UseCases
dotnet add MyApp.Web reference MyApp.Core MyApp.UseCases MyApp.Infrastructure
```

## Bootstrapping the Ideal Environment

The dependency rule is the entire point of Clean Architecture, and it only works if it's structurally enforced. This is where the project reference graph matters more than in any other pattern in this series.

### The four layers, and what belongs where

```
MyApp.Core/            → Entities, value objects, domain interfaces, business rules
MyApp.UseCases/         → Application logic: commands, queries, handlers (often via MediatR)
MyApp.Infrastructure/   → EF Core DbContext, repository implementations, external services
MyApp.Web/               → API endpoints, DI wiring, Program.cs
```

The critical rule: `Core` references nothing else in the solution. It doesn't know EF Core exists, doesn't know ASP.NET Core exists, and defines interfaces (like `IOrderRepository`) that `Infrastructure` implements -- not the other way around.

```csharp
// MyApp.Core/Interfaces/IOrderRepository.cs
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task AddAsync(Order order);
}

// MyApp.Core/Entities/Order.cs
public class Order
{
    public int Id { get; private set; }
    public OrderStatus Status { get; private set; }

    public void MarkAsProcessing()
    {
        if (Status != OrderStatus.Pending)
            throw new InvalidOperationException("Only pending orders can be processed.");
        Status = OrderStatus.Processing;
    }
}
```

```csharp
// MyApp.Infrastructure/Data/OrderRepository.cs
public class OrderRepository : IOrderRepository
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context) => _context = context;

    public Task<Order?> GetByIdAsync(int id) =>
        _context.Orders.FirstOrDefaultAsync(o => o.Id == id);

    public async Task AddAsync(Order order) => await _context.Orders.AddAsync(order);
}
```

```csharp
// MyApp.UseCases/Orders/ProcessOrderHandler.cs
public class ProcessOrderHandler(IOrderRepository repository)
    : IRequestHandler<ProcessOrderCommand, Order>
{
    public async Task<Order> Handle(ProcessOrderCommand request, CancellationToken ct)
    {
        var order = await repository.GetByIdAsync(request.OrderId)
            ?? throw new OrderNotFoundException(request.OrderId);

        order.MarkAsProcessing();
        return order;
    }
}
```

### Wiring dependency injection in Program.cs

This is where `Infrastructure`'s implementations get bound to `Core`'s interfaces -- the one place in the solution where the concrete and the abstract meet:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(ProcessOrderHandler).Assembly));

builder.Services.AddFastEndpoints();

var app = builder.Build();
app.UseFastEndpoints();
app.Run();
```

### Enforce the rule with architecture tests, not just discipline

Project references stop the most obvious violations, but a determined developer can still add a NuGet package reference to EF Core directly in `Core`. Add an architecture test to catch that automatically:

```csharp
[Fact]
public void Core_Should_Not_Reference_Infrastructure()
{
    var result = Types.InAssembly(typeof(Order).Assembly)
        .Should()
        .NotHaveDependencyOn("MyApp.Infrastructure")
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

Using a library like `NetArchTest` or `ArchUnitNET` turns the dependency rule from an aspiration into something your build fails on if violated.

## Core Workflow

Adding a feature typically means:

1. **Core** -- add or update entities and domain interfaces if the feature introduces new business rules
2. **UseCases** -- add a command or query and its handler, containing the application-specific orchestration logic
3. **Infrastructure** -- implement any new repository or external service interfaces the use case depends on
4. **Web** -- add the endpoint that maps an HTTP request to the command/query and returns the result

More ceremony than layered architecture for a simple feature, but the payoff is that `Core` and `UseCases` stay testable and infrastructure-agnostic no matter how the surrounding technology changes.

## Verifying Your Setup

1. **`Core` has zero external dependencies** -- check its `.csproj`; it should reference nothing beyond the .NET base class libraries
2. **Architecture tests pass** -- confirm a `NetArchTest`/`ArchUnitNET` suite actively fails if `Core` gains a dependency on `Infrastructure`
3. **Domain logic is testable without a database** -- unit test `Order.MarkAsProcessing()` with no `DbContext`, no mocks, nothing but the entity itself
4. **Swapping infrastructure doesn't touch Core or UseCases** -- as a sanity check, imagine replacing EF Core with Dapper; confirm that change is contained entirely to `Infrastructure`

## Best Practices

**Keep `Core` genuinely dependency-free.** The instant it references EF Core "just for this one convenience," the isolation that makes the domain testable and infrastructure-agnostic starts eroding.

**Back the dependency rule with automated architecture tests.** Code review catches most violations, but a failing build catches all of them, consistently, without relying on a reviewer noticing.

**Don't over-apply the pattern to trivial CRUD.** A simple, rules-free create/read/update/delete endpoint doesn't need four layers and a MediatR handler -- Clean Architecture earns its ceremony specifically where there's real business logic to protect.

**Use the Specification pattern for complex queries instead of leaking IQueryable into UseCases.** Keeping query logic behind named, testable specifications avoids `Core`/`UseCases` depending on EF Core's query surface directly.

**Start from a proven template rather than inventing conventions from scratch.** The Ardalis Clean Architecture template encodes a lot of hard-won structure decisions -- deviate deliberately once you understand why the defaults exist, not before.

## Comparison with Vertical Slice Architecture

| | Clean Architecture | Vertical Slice Architecture |
| --- | --- | --- |
| Organizing principle | Dependency direction, domain-centered | Feature/use case |
| Where related code for one feature lives | Spread across Core, UseCases, Infrastructure, Web | Co-located in one slice |
| Ceremony for a simple feature | Higher -- touches multiple projects even for CRUD | Lower -- one slice, start to finish |
| Domain protection from infrastructure | Enforced by the dependency rule | Not enforced by default; added deliberately if needed |
| Best fit | Domain-heavy apps with real business rules worth insulating | Feature-heavy apps with largely independent use cases |

The two aren't opposites -- a single project can use Vertical Slice Architecture for organizing features while still applying Clean Architecture's dependency rule inside slices that touch genuinely complex domain logic. Many teams land on a pragmatic middle ground rather than picking one pattern dogmatically for the whole codebase.

## Frequently Asked Questions

### What's the difference between Clean, Onion, and Hexagonal architecture?

They're variations on the same core idea -- dependencies point inward toward the domain, and infrastructure is a detail plugged in at the edges via interfaces. The naming differences largely reflect different authors' framing (Onion emphasizes concentric layers, Hexagonal/Ports-and-Adapters emphasizes swappable adapters) rather than fundamentally different rules. In .NET, "Clean Architecture" is the most common label, largely due to Robert Martin's writing and Steve Smith's widely used template.

### Do I need MediatR to do Clean Architecture in .NET?

No, MediatR is a common convenience for structuring the UseCases layer as discrete command/query handlers, but it's not required by the pattern itself. You can implement use cases as plain service classes with interfaces -- MediatR just standardizes the shape and adds convenient cross-cutting behavior (logging, validation) via its pipeline.

### Why does my Core project need interfaces if Infrastructure implements them?

This is the dependency inversion at the heart of the pattern: `Core` defines what it needs (`IOrderRepository`) without knowing how it's fulfilled, and `Infrastructure` provides the implementation. This means `Core` can be compiled, tested, and reasoned about without `Infrastructure` existing at all -- the dependency points from `Infrastructure` toward `Core`'s interface, not the other way around.

### Is Clean Architecture overkill for a small project?

Often, yes. The ceremony pays for itself when there's real business complexity worth protecting from infrastructure churn. A small CRUD app with minimal business rules will likely feel over-engineered under Clean Architecture -- layered architecture or Vertical Slice Architecture will get you there with less overhead.

### How do I actually enforce the dependency rule, not just hope for it?

Project references catch the obvious violations (a class library can't reference a project that doesn't reference it back), but architecture tests using `NetArchTest` or `ArchUnitNET` catch the subtler ones, like a stray NuGet package reference. Make the architecture test part of your CI build so a violation fails the pipeline, not just a code review.

### Can Clean Architecture work with Vertical Slice Architecture in the same solution?

Yes -- this is a common and pragmatic combination. Organize the UseCases layer around features (vertical slices) while still respecting the Core/Infrastructure dependency rule underneath. You get feature-oriented navigation and enforced domain isolation at the same time, at the cost of needing to actively decide how each new piece of code should be organized rather than following one rigid convention everywhere.

### What goes in Core versus UseCases?

`Core` holds domain entities, value objects, domain interfaces, and business rules intrinsic to the entities themselves (like an `Order` refusing an invalid state transition). `UseCases` holds application-specific orchestration -- the steps a particular command or query needs to take, which repositories to call, and in what order -- without containing infrastructure details itself.
