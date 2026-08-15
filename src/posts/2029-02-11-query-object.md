---
author: Steve Kaschimer
date: 2029-02-11
image: /images/posts/2029-02-11-hero.webp
image_alt: "A funnel glyph narrowing down over a grid, with only a filtered subset of the grid's cells passing through and highlighted on the other side."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on an amber funnel glyph positioned above a teal grid, narrowing down toward a small highlighted cluster of cells beneath it while the rest of the grid remains faint, implying a named, reusable filter applied to a larger data set. Mood is selective and reusable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Query Object represents a database query as an object, giving repeated business-relevant selection logic - overdue invoices, orders ready to ship - a name and a reusable home instead of scattering it through services. Covers parameterized queries, the overlap with the Specification pattern, and the danger of building a generic query DSL that just reimplements LINQ badly."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Query Object in Modern .NET"
---

Query Object represents a database query as an object.

Instead of scattering query conditions throughout services:

``` csharp
var orders = await db.Orders
    .Where(x => x.CustomerId == customerId)
    .Where(x => x.Status == OrderStatus.Submitted)
    .Where(x => x.Total >= 500m)
    .ToListAsync(cancellationToken);
```

you can give that query a name and a reusable representation.

## Why This Pattern Exists

Queries often contain business-relevant selection logic:

-   overdue invoices,
-   active subscriptions nearing renewal,
-   orders eligible for shipment,
-   customers requiring review.

When those conditions are repeated, the application begins to duplicate
query knowledge.

A Query Object gives the query a home.

## A Simple Modern Query Object

``` csharp
public sealed record OrdersReadyToShip(
    DateTimeOffset AsOf)
{
    public IQueryable<Order> Apply(
        IQueryable<Order> source)
    {
        return source.Where(order =>
            order.Status == OrderStatus.Paid &&
            order.ShipAfter <= AsOf);
    }
}
```

Usage:

``` csharp
var query = new OrdersReadyToShip(
    timeProvider.GetUtcNow());

var orders = await query
    .Apply(db.Orders)
    .ToListAsync(cancellationToken);
```

The query condition is now named and reusable.

## Parameterized Queries

Query Objects become more useful when they capture query parameters:

``` csharp
public sealed record CustomerOrdersQuery(
    CustomerId CustomerId,
    OrderStatus? Status,
    decimal? MinimumTotal)
{
    public IQueryable<Order> Apply(
        IQueryable<Order> source)
    {
        source = source.Where(
            x => x.CustomerId == CustomerId);

        if (Status is not null)
        {
            source = source.Where(
                x => x.Status == Status);
        }

        if (MinimumTotal is not null)
        {
            source = source.Where(
                x => x.Total >= MinimumTotal);
        }

        return source;
    }
}
```

This moves query-building logic out of controllers and services.

## Query Object vs. Repository Method

You could instead write:

``` csharp
Task<IReadOnlyList<Order>>
    FindOrdersReadyToShipAsync(...);
```

on a repository.

Both approaches can be valid.

A repository method is attractive when the query is central to the
domain and there are only a few important retrieval operations.

Query Objects scale better when:

-   there are many combinations,
-   filters compose,
-   sorting and paging vary,
-   the application has a rich search experience.

## Query Object vs. Specification

In modern .NET, Query Object often overlaps with the Specification
pattern.

A specification may represent a predicate:

``` csharp
public sealed record PaidOrdersSpecification
{
    public Expression<Func<Order, bool>> ToExpression()
        => order =>
            order.Status == OrderStatus.Paid;
}
```

A Query Object usually represents more of the query:

-   filtering,
-   sorting,
-   includes,
-   paging,
-   projection.

The exact terminology varies between teams.

The architectural question is more important than the label.

## Projection-Oriented Query Objects

A query object does not have to return domain entities.

For read-heavy use cases, returning a projection is often better:

``` csharp
public sealed record OrderSearchQuery(
    CustomerId CustomerId)
{
    public IQueryable<OrderSummary> Apply(
        IQueryable<Order> source)
    {
        return source
            .Where(x => x.CustomerId == CustomerId)
            .OrderByDescending(x => x.CreatedAt)
            .Select(x => new OrderSummary(
                x.Id,
                x.CreatedAt,
                x.Status,
                x.Total));
    }
}
```

This avoids loading a full aggregate just to render a list.

## Keep IQueryable Boundaries Deliberate

Returning `IQueryable<T>` from deep infrastructure can be powerful, but
it can also leak persistence details throughout the application.

For example:

``` csharp
IQueryable<Order> GetOrders();
```

lets any caller append:

``` csharp
.Include(...)
.AsSplitQuery()
.TagWith(...)
```

or provider-specific expressions.

That may defeat the abstraction.

A Query Object can still use `IQueryable<T>` internally while exposing a
more stable execution boundary.

## Executable Query Objects

Instead of:

``` csharp
IQueryable<Order> Apply(...)
```

the object can execute itself through a persistence abstraction:

``` csharp
public sealed class OrdersReadyToShipQuery(
    AppDbContext db)
{
    public Task<List<OrderSummary>> ExecuteAsync(
        DateTimeOffset asOf,
        CancellationToken cancellationToken)
    {
        return db.Orders
            .Where(x =>
                x.Status == OrderStatus.Paid &&
                x.ShipAfter <= asOf)
            .Select(x => new OrderSummary(
                x.Id,
                x.Customer.Name,
                x.Total))
            .ToListAsync(cancellationToken);
    }
}
```

Now callers do not receive `IQueryable`.

This is often a clean fit for application-level read models.

## Query Object and CQRS

Query Object can fit naturally into a lightweight CQRS-style design.

Commands change state:

``` text
SubmitOrder
CancelOrder
RefundOrder
```

Queries return read models:

``` text
GetOrderDetails
SearchOrders
GetOrdersReadyToShip
```

You do not need a message bus or a large framework to benefit from the
separation.

## Dynamic Filtering

Query Objects are particularly useful for search screens:

``` csharp
public sealed record SearchOrders(
    string? Search,
    OrderStatus? Status,
    DateOnly? From,
    DateOnly? To,
    int Page,
    int PageSize);
```

The query object can centralize:

-   optional filters,
-   sorting,
-   pagination,
-   projection.

This keeps controller code focused on HTTP rather than query
construction.

## The Danger of Generic Query DSLs

A common over-engineering path is creating a universal query
abstraction:

``` csharp
Query<Order>
    .Where(...)
    .Include(...)
    .OrderBy(...)
    .Page(...)
```

If it merely reimplements LINQ badly, it adds no value.

A Query Object should provide meaning, not just another syntax.

Good:

``` text
OrdersReadyToShip
OverdueInvoices
CustomersNeedingVerification
```

Less useful:

``` text
GenericQueryBuilder<T>
```

unless you are genuinely building infrastructure.

## Translation Matters

When Query Objects build EF Core expressions, they must remain
translatable to SQL.

This compiles:

``` csharp
.Where(x => SomeCustomMethod(x))
```

but EF Core may not be able to translate it.

Query-object tests should therefore include integration coverage for
nontrivial expressions.

## Testing

Pure expression-building logic can be unit-tested for some cases.

But the highest-value tests run the query against the actual provider.

They verify:

-   SQL translation,
-   null semantics,
-   sorting,
-   pagination,
-   includes,
-   projection,
-   provider-specific behavior.

## When to Use It

Query Object is useful when:

-   complex queries repeat,
-   search/filter logic grows,
-   query logic deserves names,
-   read models differ from domain entities,
-   you want to keep controllers and services thin.

## When Not to Use It

Avoid creating a class for every trivial query:

``` csharp
db.Countries.OrderBy(x => x.Name)
```

does not automatically need `GetCountriesAlphabeticallyQuery`.

Use the pattern when it reduces duplication or improves meaning.

## Related Patterns

-   Metadata Mapping
-   Repository
-   Data Mapper
-   Service Layer
-   Data Transfer Object

## Summary

Query Object gives important database queries an explicit
representation.

In modern .NET, LINQ already gives us a powerful query language, so the
pattern is rarely about inventing another one.

Its value is in naming, composing, and isolating query intent so the
application's read logic remains understandable as complexity grows.
