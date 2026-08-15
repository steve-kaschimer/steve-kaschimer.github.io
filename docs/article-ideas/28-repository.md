---
category: Object-Relational Metadata Mapping Patterns
csharp: 14
description: Use Repository to mediate between domain and persistence
  with a collection-like interface, and learn when EF Core already
  provides enough abstraction.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/repository.html"
order: 28
pattern: Repository
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: repository
status: draft
title: Repository in Modern .NET
---

# Repository in Modern .NET

Repository mediates between the domain model and the data-mapping layer
using an interface that feels like a collection of domain objects.

In modern .NET, Repository is also one of the most frequently overused
patterns.

The key question is not whether repositories are "good" or "bad." It is
whether a repository gives your application a useful domain-oriented
persistence boundary that EF Core does not already provide.

## The Core Idea

Suppose the domain works with orders:

``` csharp
public interface IOrderRepository
{
    Task<Order?> GetAsync(
        OrderId id,
        CancellationToken cancellationToken);

    void Add(Order order);
}
```

Application code can then work in domain language:

``` csharp
var order = await orders.GetAsync(
    command.OrderId,
    cancellationToken);

order!.Submit();

await unitOfWork.CommitAsync(cancellationToken);
```

The application does not need to know which tables, joins, or ORM
configuration reconstruct the `Order`.

## Collection-Like Semantics

A repository conceptually behaves like a collection of persistent domain
objects:

``` csharp
orders.Add(order);
```

and:

``` csharp
var order = await orders.GetAsync(id, cancellationToken);
```

Persistence makes those operations asynchronous and more expensive than
an in-memory collection, but the conceptual interface remains
domain-oriented.

## An EF Core Implementation

``` csharp
public sealed class EfOrderRepository(
    AppDbContext db)
    : IOrderRepository
{
    public Task<Order?> GetAsync(
        OrderId id,
        CancellationToken cancellationToken)
    {
        return db.Orders
            .Include(x => x.Lines)
            .SingleOrDefaultAsync(
                x => x.Id == id,
                cancellationToken);
    }

    public void Add(Order order)
        => db.Orders.Add(order);
}
```

Notice what the repository owns: the persistence knowledge required to
reconstruct an order aggregate.

## Repository and Unit of Work

A repository should not necessarily save changes itself:

``` csharp
orders.Add(order);
await unitOfWork.CommitAsync(cancellationToken);
```

That separation lets several repositories participate in one business
transaction.

With EF Core, the same `DbContext` can back all repositories and act as
the Unit of Work.

## Is DbSet Already a Repository?

In many ways, yes.

`DbSet<Order>` provides collection-like access to persistent entities,
while `DbContext` supplies mapping, tracking, and Unit of Work behavior.

That means wrapping every `DbSet<T>` in:

``` csharp
IGenericRepository<T>
```

often adds very little.

## The Generic Repository Trap

Consider:

``` csharp
public interface IRepository<T>
{
    Task<T?> GetByIdAsync(object id);
    Task<List<T>> GetAllAsync();
    void Add(T entity);
    void Update(T entity);
    void Delete(T entity);
}
```

This often recreates a weaker version of the ORM.

The abstraction has removed:

-   expressive LINQ,
-   projections,
-   provider features,
-   aggregate-specific loading,
-   meaningful domain language.

A repository is more valuable when its API reflects the domain:

``` csharp
Task<Order?> GetForSubmissionAsync(
    OrderId id,
    CancellationToken cancellationToken);
```

rather than merely renaming CRUD.

## Repository and Query Object

Repositories and Query Objects work well together.

The repository can handle aggregate retrieval for writes:

``` csharp
var order = await orders.GetAsync(id, ct);
order.Submit();
```

while a Query Object handles read projections:

``` csharp
var summary =
    await getOrderSummary.ExecuteAsync(id, ct);
```

This avoids forcing every read query through a repository designed
around domain aggregates.

## Repositories Should Respect Aggregate Boundaries

If `OrderLine` only exists inside `Order`, this may be a warning sign:

``` csharp
IOrderLineRepository
```

Instead:

``` csharp
var order = await orders.GetAsync(orderId, ct);
order.ChangeQuantity(lineId, quantity);
```

Repositories often make the most sense around aggregate roots rather
than every table.

## IQueryable: Expose It or Not?

This interface is tempting:

``` csharp
IQueryable<Order> Query();
```

It provides flexibility, but it also allows persistence-specific query
behavior to spread outside the repository.

If the goal is to hide EF Core, exposing `IQueryable<T>` substantially
weakens that boundary.

There is no universal rule. Decide whether the repository is a strong
persistence boundary or merely a convenient query entry point.

## Testing

Repositories should generally be integration-tested against the real
database provider.

A mocked repository can be useful when testing an application service,
but it does not prove the actual repository handles:

-   includes,
-   mappings,
-   SQL translation,
-   constraints,
-   concurrency,
-   transactions.

## When to Use It

Repository is useful when:

-   the domain model is rich,
-   aggregate retrieval has meaningful rules,
-   persistence details should stay out of application logic,
-   multiple persistence implementations genuinely exist,
-   domain-oriented collection semantics improve the design.

## When to Skip It

Direct `DbContext` usage may be clearer when:

-   the application is CRUD-heavy,
-   EF Core is already an accepted application dependency,
-   repository methods merely mirror `DbSet`,
-   the abstraction hides useful ORM capabilities without replacing them
    with domain meaning.

## Related Patterns

-   Data Mapper
-   Unit of Work
-   Query Object
-   Identity Map
-   Domain Model

## Summary

Repository is most valuable as a domain abstraction, not as an
obligatory wrapper around EF Core.

If the repository speaks the language of aggregates and protects
meaningful persistence boundaries, it can clarify an application.

If it simply renames `DbSet.Add`, `FindAsync`, and `Remove`, it is
probably ceremony.
