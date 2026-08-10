# Getting Started with Layered (N-Tier) Architecture in .NET

Layered architecture doesn't get much attention in architecture talks anymore, but it's still how a huge share of production .NET applications are actually built -- and for genuinely simple, CRUD-shaped applications, that's the right call, not a compromise. The mistake isn't using layered architecture; it's using it past the point where it stops fitting the problem.

This guide covers setting up a layered .NET solution from scratch, bootstrapping the project structure so layers stay honest about their boundaries, the core workflow of adding a feature, and the best practices that keep a layered codebase from decaying into a tangled mess as it grows. By the end you'll have a clean, conventional starting point -- and a clear sense of when to reach for something else instead.

If you're deciding between architecture styles first, a comparison of the top .NET architecture patterns covers where layered architecture fits relative to Clean Architecture, Vertical Slice, Modular Monolith, and Microservices.

## What You'll Need

- .NET 8 SDK or later
- A relational database (SQL Server, PostgreSQL, or SQLite for local development)
- No third-party architecture packages required -- this pattern uses only the .NET SDK and EF Core

## Installing and Scaffolding

Layered architecture needs no special tooling -- it's a project structure convention, not a library. Create a solution with one project per layer:

```bash
mkdir MyApp && cd MyApp
dotnet new sln

dotnet new webapi -n MyApp.Web
dotnet new classlib -n MyApp.Business
dotnet new classlib -n MyApp.DataAccess

dotnet sln add MyApp.Web MyApp.Business MyApp.DataAccess

dotnet add MyApp.Web reference MyApp.Business
dotnet add MyApp.Business reference MyApp.DataAccess
```

Add EF Core to the data access layer:

```bash
dotnet add MyApp.DataAccess package Microsoft.EntityFrameworkCore.SqlServer
dotnet add MyApp.DataAccess package Microsoft.EntityFrameworkCore.Design
```

## Bootstrapping the Ideal Environment

The whole value of layered architecture depends on the dependency direction actually being enforced -- Web depends on Business, Business depends on DataAccess, and nothing points backward. Project references are what make that a compile error rather than a convention people can accidentally violate.

### Structuring each layer

```
MyApp.Web/            → Controllers, DTOs, Program.cs
MyApp.Business/        → Services, business rules, validation
MyApp.DataAccess/      → DbContext, entities, repositories
```

A typical data access layer:

```csharp
// MyApp.DataAccess/AppDbContext.cs
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Order> Orders => Set<Order>();
}

// MyApp.DataAccess/OrderRepository.cs
public class OrderRepository
{
    private readonly AppDbContext _context;
    public OrderRepository(AppDbContext context) => _context = context;

    public Task<Order?> GetByIdAsync(int id) =>
        _context.Orders.FirstOrDefaultAsync(o => o.Id == id);
}
```

A business layer that depends only on the data access layer, never on ASP.NET Core types:

```csharp
// MyApp.Business/OrderService.cs
public class OrderService
{
    private readonly OrderRepository _repository;
    public OrderService(OrderRepository repository) => _repository = repository;

    public async Task<Order> ProcessOrderAsync(int orderId)
    {
        var order = await _repository.GetByIdAsync(orderId)
            ?? throw new OrderNotFoundException(orderId);

        order.Status = OrderStatus.Processing;
        return order;
    }
}
```

### Wiring it together in Program.cs

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("Default")));

builder.Services.AddScoped<OrderRepository>();
builder.Services.AddScoped<OrderService>();

builder.Services.AddControllers();

var app = builder.Build();
app.MapControllers();
app.Run();
```

### Keep the dependency direction honest

The single most important discipline in layered architecture: never let the data access layer reference the business layer, and never let the business layer reference ASP.NET Core packages. If `MyApp.Business` needs an `IHttpContextAccessor` or an ASP.NET-specific type, that's a sign logic that belongs in the Web layer has crept into Business.

## Core Workflow

Adding a feature in layered architecture typically touches every layer, in order:

1. **Data access** -- add or update the entity and repository method needed
2. **Business** -- add the service method implementing the business rule, calling the repository
3. **Web** -- add the controller action or endpoint, mapping requests to the business layer and responses back

This is layered architecture's defining trade-off: consistent, predictable structure for every feature, at the cost of touching multiple projects even for a small change.

## Verifying Your Setup

1. **Dependency direction holds** -- confirm `MyApp.DataAccess` has no project reference to `MyApp.Business` or `MyApp.Web`
2. **Business logic is testable in isolation** -- write a unit test for `OrderService` using an in-memory or mocked repository, without spinning up ASP.NET Core
3. **The business layer has no framework dependencies** -- check that `MyApp.Business.csproj` doesn't reference `Microsoft.AspNetCore.App`
4. **Migrations apply cleanly** -- run `dotnet ef database update` from the Web project and confirm the schema matches your entities

## Best Practices

**Enforce the dependency direction with project references, not convention.** If a layer can physically reference another layer it shouldn't, eventually it will.

**Keep DTOs separate from entities.** Returning EF Core entities directly from controllers couples your API contract to your database schema -- map to dedicated request/response models in the Web layer instead.

**Don't let the business layer become a dumping ground.** As an app grows, resist the urge to keep adding unrelated logic to one large service class -- split by responsibility even within the business layer, well before you're forced to.

**Use interfaces for repositories if you expect to unit test business logic.** `IOrderRepository` behind `OrderRepository` costs little and makes mocking data access in tests straightforward.

**Recognize when you've outgrown this pattern.** If most changes still require touching three layers for a single feature, and the codebase has passed a certain size, that friction is a real signal to consider Vertical Slice Architecture or a Modular Monolith rather than adding more structure inside the same three layers.

## Comparison with Clean Architecture

| | Layered (N-Tier) | Clean Architecture |
| --- | --- | --- |
| Organizing principle | Technical layer | Dependency direction, domain-centered |
| Ceremony | Minimal | Moderate -- more interfaces and abstraction |
| Testability of business logic | Good, if discipline is maintained | Strong by design -- the domain has zero infrastructure dependencies |
| Familiarity | Highest -- most developers already know this shape | Requires understanding dependency inversion |
| Best fit | Small, CRUD-shaped applications | Domain-heavy applications worth protecting from infrastructure churn |

Layered architecture is Clean Architecture's simpler cousin -- both separate concerns, but Clean Architecture adds an explicit rule about dependency direction (everything points inward toward the domain) that layered architecture doesn't enforce as strictly, trading some ceremony for stronger guarantees about testability and infrastructure independence.

## Frequently Asked Questions

### Is layered architecture outdated?

No -- it's simply the right amount of structure for a certain class of problem: small applications, CRUD-heavy tools, and projects where the team's familiarity with the pattern outweighs the benefits of something more elaborate. It becomes a poor fit specifically when an application's complexity outgrows what three technical layers can cleanly express.

### Why does my business layer need its own project instead of just a folder?

A separate project makes the dependency direction a compile-time guarantee rather than a convention. A folder inside the Web project can still accidentally reference ASP.NET Core types; a separate class library physically cannot unless you add that reference deliberately.

### Should repositories return entities or DTOs?

Repositories typically return entities -- that's the data access layer's natural vocabulary. The mapping to DTOs happens in the Web layer (or business layer, if the business logic needs a different shape), so your API contract doesn't leak database schema details directly to clients.

### How do I unit test the business layer without a real database?

Depend on repository interfaces rather than concrete `DbContext`-backed classes, and mock or stub them in tests. This is the main reason to introduce an `IOrderRepository` abstraction even in a straightforward layered setup -- it keeps business logic testable without spinning up a database.

### When should I move from layered architecture to something else?

When most feature changes require touching every layer just to ship one piece of functionality, and that friction is measurably slowing the team down, it's worth evaluating Vertical Slice Architecture (which organizes by feature instead) or a Modular Monolith (which introduces boundaries layered architecture doesn't have). Neither is strictly better -- they solve the specific pain layered architecture starts to cause once an app grows past a certain size.

### Can I mix layered architecture with CQRS?

Yes, though it's less natural than pairing CQRS with Vertical Slice Architecture. You can still split read and write paths within the business layer, but you'll likely find the layered structure fighting the feature-oriented nature of CQRS handlers -- if you're reaching for CQRS deliberately, it's worth evaluating whether Vertical Slice Architecture would fit better from the start.

### Does layered architecture prevent the "big ball of mud" problem?

Not automatically. Layered architecture separates *technical* concerns but does nothing to prevent unrelated business logic from accumulating in a single business layer over time. Preventing that requires the same kind of deliberate internal organization (splitting services by responsibility) that any architecture needs as it grows.
