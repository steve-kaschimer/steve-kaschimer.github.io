---
category: Object-Relational Behavioral Patterns
csharp: 14
description: Understand Lazy Load, EF Core lazy-loading options, the N+1
  query problem, and when explicit loading or projection is a better
  choice.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/lazyLoad.html"
order: 15
pattern: Lazy Load
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: lazy-load
status: draft
title: Lazy Load in Modern .NET
---

# Lazy Load in Modern .NET

Lazy Load delays retrieving related data until that data is actually
needed.

It solves a real problem:

> Loading an entire object graph up front can be wasteful if most of
> that graph is never used.

But in modern web applications, lazy loading is also one of the easiest
ways to accidentally create severe database performance problems.

## The Problem

Imagine loading an order:

``` csharp
var order = await db.Orders
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);
```

An order may be related to:

-   customer,
-   lines,
-   products,
-   shipping address,
-   payments,
-   discounts,
-   audit entries.

Loading all of that every time would be expensive.

So perhaps we load only the order itself and defer other data.

That is the idea behind Lazy Load.

## Fowler's Variations

The classic pattern has several forms, including:

-   Lazy Initialization,
-   Virtual Proxy,
-   Value Holder,
-   Ghost.

Modern ORMs most often expose lazy loading through proxy-like behavior
or injected loaders.

The implementation details differ, but the architectural idea is the
same:

> Leave a placeholder until the related data is actually accessed.

## Lazy Loading With EF Core Proxies

EF Core can use proxies for lazy-loading navigation properties when
configured with the appropriate package and options.

Conceptually, an entity might expose virtual navigation properties:

``` csharp
public class Order
{
    public int Id { get; set; }

    public virtual Customer Customer { get; set; } = null!;

    public virtual ICollection<OrderLine> Lines { get; set; } = [];
}
```

Then code can appear to access ordinary properties:

``` csharp
var order = await db.Orders
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);

Console.WriteLine(order.Customer.Name);
```

Accessing `Customer` may trigger another database query.

That convenience is also the danger.

## The N+1 Query Problem

Suppose we load 100 orders:

``` csharp
var orders = await db.Orders
    .ToListAsync(cancellationToken);
```

Then:

``` csharp
foreach (var order in orders)
{
    Console.WriteLine(order.Customer.Name);
}
```

If each `Customer` navigation triggers a database call, you can get:

``` text
1 query for the orders
100 additional queries for customers
```

That is the classic N+1 query problem.

The code looks innocent because the database access is hidden behind
property access.

## Eager Loading

If you know related data will be needed, eager loading can make the
requirement explicit:

``` csharp
var orders = await db.Orders
    .Include(x => x.Customer)
    .Include(x => x.Lines)
    .ToListAsync(cancellationToken);
```

Now the query expresses its data requirements up front.

This can be easier to reason about, though large include graphs can
create their own performance problems.

## Explicit Loading

EF Core also supports loading a navigation explicitly after the entity
is loaded:

``` csharp
var order = await db.Orders
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);

await db.Entry(order)
    .Collection(x => x.Lines)
    .LoadAsync(cancellationToken);
```

This keeps the database access visible at the call site.

For application code where query cost matters, that visibility can be
valuable.

## Projection Is Often Better for Reads

For APIs and read models, projection is frequently the most predictable
option:

``` csharp
var result = await db.Orders
    .Where(x => x.Id == orderId)
    .Select(x => new OrderDetails(
        x.Id,
        x.Customer.Name,
        x.Lines.Select(line =>
            new OrderLineDetails(
                line.Product.Name,
                line.Quantity,
                line.UnitPrice))
        .ToList()))
    .SingleAsync(cancellationToken);
```

This tells EF Core exactly what shape the application needs.

No hidden navigation access is required later.

For many web endpoints, projection is preferable to loading a large
tracked domain graph.

## Lazy Loading and Domain Models

Lazy loading can make rich object graphs convenient:

``` csharp
order.Customer.PreferredShippingAddress
```

But it also means a seemingly pure domain operation can unexpectedly hit
the database.

Consider:

``` csharp
public Money CalculateTotal()
{
    return Lines
        .Select(x => x.Total)
        .Aggregate(Money.Zero, (a, b) => a + b);
}
```

If `Lines` is lazy-loaded, calling `CalculateTotal()` may perform I/O.

That makes the domain model's performance behavior less obvious.

Some teams therefore avoid lazy loading entirely in favor of loading
aggregate state explicitly.

## Lazy Loading and Serialization

Lazy loading becomes particularly risky around JSON serialization.

If a serializer walks navigation properties, it may trigger:

-   many unexpected queries,
-   circular object graphs,
-   large payloads,
-   data exposure that the endpoint did not intend.

This is another reason API responses should usually use explicit DTOs or
projections rather than serializing tracked entity graphs directly.

## Lazy Loading With `ILazyLoader`

EF Core also supports lazy loading without proxies by injecting a lazy
loader into entity types.

Conceptually:

``` csharp
private Customer? _customer;

public Customer Customer =>
    _lazyLoader.Load(this, ref _customer)!;
```

This avoids proxy requirements, but it introduces persistence-support
infrastructure into the entity.

That trade-off may or may not fit a persistence-ignorant Domain Model.

## Detached Objects

Lazy loading usually depends on a live persistence context.

Once the `DbContext` is disposed, a detached entity generally cannot
magically retrieve missing relationships.

This is important in web applications where entities should not escape
the request's persistence lifetime and then be expected to keep loading
data later.

## Performance Is About Access Patterns

Lazy loading is neither universally good nor universally bad.

It works best when:

-   related data is genuinely optional,
-   the number of lazy loads is bounded,
-   the context is still alive,
-   database calls are acceptable and understood.

It works poorly when:

-   collections are accessed in loops,
-   serialization traverses graphs,
-   latency matters,
-   query count is hard to observe,
-   object access hides expensive I/O.

## Observability

If you use lazy loading, SQL logging becomes essential.

A loop that looks harmless in C# can produce dozens or hundreds of
queries.

Development environments should make database-command logging easy to
inspect so N+1 behavior is visible early.

## Testing

Unit tests over in-memory objects may not reveal lazy-loading behavior.

Integration tests are valuable for query-sensitive use cases.

For performance-critical code, you may want tests or diagnostics that
assert the number of database commands executed for a request.

## When to Use It

Lazy Load can be appropriate when:

-   object graphs are large,
-   related data is only occasionally accessed,
-   developer convenience matters,
-   query patterns are known and monitored,
-   the ORM context lifetime is well controlled.

## When to Avoid It

Prefer eager loading, explicit loading, or projection when:

-   building APIs,
-   query predictability matters,
-   collections are traversed frequently,
-   performance is sensitive,
-   domain operations should not trigger hidden I/O.

## Trade-offs

Lazy Load optimizes for convenience and deferred work.

Its main cost is hidden I/O.

The most important question is not:

> Can the ORM lazy-load this navigation?

It is:

> Do we want accessing this property to be capable of issuing a database
> query?

## Related Patterns

-   Data Mapper
-   Identity Map
-   Unit of Work
-   Repository

## Summary

Lazy Load prevents unnecessary work when related data is never used.

But hidden database calls can make an application much harder to reason
about.

Modern .NET gives you several alternatives---lazy loading, eager
loading, explicit loading, and projection.

Choose based on the access pattern of the use case, and make database
behavior visible enough that convenience does not turn into an N+1
problem.
