# Getting Started with NHibernate in .NET

NHibernate predates most of the .NET ORM landscape it now gets compared against, and it shows in a good way and a demanding one. The good way: caching, mapping flexibility, and loading control are all mature and battle-tested after over a decade of production use in large enterprise systems. The demanding way: there's real configuration depth to learn before any of that maturity pays off, and skipping straight to "just make it work" produces a setup that fights you the moment your model gets non-trivial.

This guide covers installing NHibernate, bootstrapping session management and mapping the way most production NHibernate codebases actually do it (Fluent NHibernate, not raw XML), the core session and transaction workflow, and the best practices that keep NHibernate's flexibility from turning into accidental complexity. By the end you'll have a setup suited to extending an existing NHibernate codebase or making a deliberate, informed choice to start a new one.

If you're deciding between ORMs first, a comparison of the top .NET ORMs covers where NHibernate fits relative to EF Core, Dapper, Linq2Db, and RepoDb -- including why it's rarely the recommended default for new, greenfield projects in 2026.

## What You'll Need

- .NET 8 SDK or later
- A database and its ADO.NET driver
- Some familiarity with the Unit of Work and Session patterns, since NHibernate's `ISession` is the center of nearly everything you'll do with it

## Installing NHibernate

```bash
dotnet add package NHibernate
dotnet add package FluentNHibernate
```

`FluentNHibernate` gives you a strongly-typed C# mapping API instead of hand-written XML `.hbm.xml` files -- it's the standard approach in modern NHibernate codebases and worth using from the start rather than learning XML mapping first.

## Bootstrapping the Ideal Environment

### Define your entities and Fluent mappings

```csharp
public class Order
{
    public virtual int Id { get; protected set; }
    public virtual Customer Customer { get; set; } = null!;
    public virtual OrderStatus Status { get; set; }
}
```

NHibernate requires entity members to be `virtual` -- this is how it generates lazy-loading proxies at runtime. Forgetting this is one of the most common first-time mistakes; the entity will compile and run, but lazy loading and change tracking silently won't work as expected.

```csharp
public class OrderMap : ClassMap<Order>
{
    public OrderMap()
    {
        Id(x => x.Id);
        References(x => x.Customer).Column("CustomerId");
        Map(x => x.Status).CustomType<OrderStatus>();
    }
}
```

### Build the SessionFactory once, at startup

The `ISessionFactory` is expensive to build and meant to be a singleton -- built once at application startup, not per request:

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

var sessionFactory = Fluently.Configure()
    .Database(MsSqlConfiguration.MsSql2012.ConnectionString(
        builder.Configuration.GetConnectionString("Default")))
    .Mappings(m => m.FluentMappings.AddFromAssemblyOf<OrderMap>())
    .BuildSessionFactory();

builder.Services.AddSingleton(sessionFactory);
builder.Services.AddScoped(sp => sp.GetRequiredService<ISessionFactory>().OpenSession());
```

Note the two different lifetimes: `ISessionFactory` is a singleton, but each `ISession` it opens is scoped per request (or per unit of work) -- sessions are lightweight and cheap to open, unlike the factory that creates them.

### Schema generation for local development

NHibernate can generate a schema from your mappings, useful for local development and testing:

```csharp
new SchemaExport(configuration).Create(false, true);
```

For production, this isn't a substitute for a proper migration strategy -- most NHibernate codebases pair it with a dedicated migration tool (Fluent Migrator is common) rather than relying on automatic schema generation against a real database.

## Core Workflow

### Reading and writing within a session

```csharp
public class OrderRepository(ISession session)
{
    public async Task<Order?> GetByIdAsync(int id) =>
        await session.GetAsync<Order>(id);

    public async Task<Order> ProcessOrderAsync(int orderId)
    {
        using var transaction = session.BeginTransaction();

        var order = await session.GetAsync<Order>(orderId)
            ?? throw new OrderNotFoundException(orderId);

        order.Status = OrderStatus.Processing;

        await transaction.CommitAsync();
        return order;
    }
}
```

NHibernate tracks changes to loaded entities within a session the same way EF Core does -- modifying a loaded entity's properties and committing the transaction is enough; there's no explicit "update" call needed for tracked entities.

### Querying with LINQ or HQL

```csharp
// LINQ provider
var activeOrders = await session.Query<Order>()
    .Where(o => o.Status == OrderStatus.Processing)
    .ToListAsync();

// HQL, NHibernate's own query language
var results = await session.CreateQuery(
    "from Order o where o.Status = :status")
    .SetParameter("status", OrderStatus.Processing)
    .ListAsync<Order>();
```

The LINQ provider is the more approachable entry point for teams coming from EF Core; HQL and the Criteria API offer more control for complex queries once you're comfortable with the basics.

## Verifying Your Setup

1. **Entities have `virtual` members where needed** -- confirm lazy-loaded navigation properties and any property NHibernate needs to proxy are marked `virtual`
2. **SessionFactory is built once** -- confirm it's registered as a singleton, not accidentally rebuilt per request, which is expensive and defeats its purpose
3. **Sessions are properly scoped and disposed** -- confirm each request gets its own session and that sessions are disposed at the end of their scope
4. **Mappings match your schema** -- run `SchemaExport` in validation mode against a real database and confirm no mismatches are reported

## Best Practices

**Mark entity members `virtual` deliberately, not by habit alone.** Understand why NHibernate needs it (proxy generation for lazy loading) rather than just following the convention -- it clarifies a lot of otherwise-confusing lazy-loading behavior later.

**Keep the SessionFactory a singleton and sessions scoped per unit of work.** Conflating the two lifetimes is a common source of subtle bugs and unnecessary overhead.

**Use Fluent NHibernate mappings over raw XML for new code.** XML `.hbm.xml` files still work and you'll encounter them in older NHibernate codebases, but Fluent mappings are more maintainable and give you compiler-checked property references.

**Configure second-level caching deliberately, not by default.** NHibernate's caching is genuinely powerful for high-read scenarios, but it introduces cache invalidation complexity -- turn it on for specific entities where the read pattern justifies it, not globally out of the gate.

**If you're extending an existing NHibernate codebase, follow its existing mapping conventions before introducing new ones.** Consistency across an established codebase's mapping style matters more than which specific convention (Fluent vs. XML, HQL vs. LINQ) is technically "better."

## Comparison with EF Core

| | NHibernate | EF Core |
| --- | --- | --- |
| Query style | HQL, Criteria API, LINQ | LINQ over tracked entities |
| Change tracking | Yes, session-scoped | Yes, context-scoped |
| Mapping | Fluent NHibernate or XML | Fluent API or data annotations |
| Caching | Mature first- and second-level caching | Less built-in caching sophistication |
| Tooling & community | Smaller, more enterprise-focused | Larger, Microsoft-backed, broader resources |
| Best fit | Existing enterprise codebases | New projects, broader ecosystem support |

The conceptual overlap is real -- both are full ORMs with change tracking, both support LINQ, both need something like a session/context per unit of work. The practical difference in 2026 is less about capability gaps (EF Core has closed most of them) and more about which one has the tooling, community, and momentum behind it for a new project.

## Frequently Asked Questions

### Why do my NHibernate entity properties need to be virtual?

NHibernate generates dynamic proxy classes for lazy loading and change tracking, and that proxy generation requires overriding your entity's members -- which is only possible if they're `virtual`. A non-virtual property will still compile, but NHibernate can't proxy it, silently breaking lazy loading for that property.

### Is NHibernate still a good choice for a new project in 2026?

Generally not recommended as the default. EF Core has closed most of the feature gap that used to differentiate NHibernate, while offering better tooling integration, Microsoft backing, and a substantially larger community. NHibernate remains a solid choice specifically for extending an existing codebase already built on it.

### What's the difference between HQL and NHibernate's LINQ provider?

HQL (Hibernate Query Language) is NHibernate's own SQL-like query language, offering fine-grained control similar to what the Criteria API provides. The LINQ provider translates standard C# LINQ expressions to SQL, similar in spirit to EF Core's approach, and is generally the more approachable starting point for teams already comfortable with LINQ.

### How does NHibernate's second-level cache work?

The first-level cache is session-scoped and automatic -- entities loaded within a session are cached for the duration of that session. The second-level cache is process- or distributed-scoped and configured explicitly per entity, useful for frequently-read, infrequently-changed data. It requires deliberate setup and a cache provider (in-memory, Redis, etc.), and isn't enabled by default.

### Should I use Fluent NHibernate or XML mapping files?

Fluent NHibernate for new code -- it gives you compiler-checked, strongly-typed mappings instead of hand-written XML strings that only fail at runtime if wrong. You'll likely encounter XML `.hbm.xml` mappings in older NHibernate codebases, and NHibernate itself continues to support both, so understanding XML mapping is still useful for maintenance work even if you don't choose it for anything new.

### Can I use NHibernate and Dapper together, the way people pair EF Core and Dapper?

Yes, the same hybrid pattern applies -- NHibernate for your domain model and change-tracked writes, Dapper for specific reporting or high-throughput read queries where raw SQL control matters more than the ORM's abstraction. You can obtain the underlying `IDbConnection` from an NHibernate session similarly to how you would from an EF Core `DbContext`.

### What's the most common mistake in a first NHibernate setup?

Rebuilding the `ISessionFactory` per request instead of treating it as an expensive, one-time singleton, and forgetting to mark entity members `virtual`, which silently breaks lazy loading in a way that's confusing to diagnose without understanding NHibernate's proxy-based mechanism.
