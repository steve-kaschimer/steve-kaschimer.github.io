---
author: Steve Kaschimer
date: 2028-11-12
image: /images/posts/2028-11-12-hero.webp
image_alt: "Two faint, offset duplicate outlines of the same shape resolving into one solid shape in front of them, implying multiple potential representations collapsing into a single authoritative instance."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one solid teal circular shape in the foreground, with two faint, slightly offset duplicate outlines of the same shape fading behind it in amber and off-white, implying multiple potential representations resolving into one authoritative instance. Mood is resolving and consistent. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Identity Map ensures a particular database identity maps to exactly one in-memory object within a business transaction - a small implementation detail that's actually important for both correctness and performance. Covers how EF Core's tracked DbContext already provides this, and why a second identity map on top of it is usually one too many."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Identity Map in Modern .NET"
---

Identity Map ensures that, within a business transaction, a particular
database identity maps to one in-memory object.

That sounds like a small implementation detail.

It is actually important for both correctness and performance.

## The Problem

Suppose two parts of a use case load the same customer:

``` csharp
var customerA = await LoadCustomerAsync(42);
var customerB = await LoadCustomerAsync(42);
```

If those calls produce two different objects representing the same
database row, the application now has two versions of "customer 42" in
memory.

Then this happens:

``` csharp
customerA.ChangeEmail("new@example.com");
customerB.ChangeName("Ada Lovelace");
```

Which object represents the current state?

How should persistence merge the changes?

What happens if one object contains stale values?

This is an identity problem.

## The Pattern

An Identity Map keeps a dictionary keyed by persistent identity:

``` csharp
public sealed class IdentityMap<TKey, TEntity>
    where TKey : notnull
{
    private readonly Dictionary<TKey, TEntity> _entities = [];

    public bool TryGet(
        TKey id,
        out TEntity? entity)
        => _entities.TryGetValue(id, out entity);

    public TEntity Add(
        TKey id,
        TEntity entity)
    {
        _entities.Add(id, entity);
        return entity;
    }
}
```

A mapper can consult it before going to the database:

``` csharp
public async Task<Customer> LoadAsync(
    CustomerId id,
    CancellationToken cancellationToken)
{
    if (_identityMap.TryGet(id, out var existing))
        return existing!;

    var customer = await LoadFromDatabaseAsync(
        id,
        cancellationToken);

    return _identityMap.Add(id, customer);
}
```

Now the same identity returns the same object instance within the Unit
of Work.

## EF Core Already Does This for Tracking Queries

When EF Core executes a tracking query, the `DbContext` tracks returned
entities.

If the same entity identity is encountered again in that context, EF
Core performs identity resolution so the tracked instance is reused.

Conceptually:

``` csharp
var first = await db.Customers
    .SingleAsync(
        x => x.Id == customerId,
        cancellationToken);

var second = await db.Customers
    .SingleAsync(
        x => x.Id == customerId,
        cancellationToken);

Console.WriteLine(
    ReferenceEquals(first, second));
```

With normal tracking behavior in the same context, the important idea is
that both queries resolve to the same tracked identity.

This is one reason `DbContext` should have a clear, bounded lifetime.

## Why Object Identity Matters

Consider an order with a customer reference:

``` csharp
var order = await db.Orders
    .Include(x => x.Customer)
    .SingleAsync(
        x => x.Id == orderId,
        cancellationToken);

var customer = await db.Customers
    .SingleAsync(
        x => x.Id == order.CustomerId,
        cancellationToken);
```

Within one tracked graph, you generally want:

``` csharp
ReferenceEquals(order.Customer, customer)
```

to behave consistently with the idea that both references mean the same
persistent entity.

Without identity resolution, graph operations become much harder to
reason about.

## Identity Map Is Scoped

The map is not supposed to be a global cache.

This distinction matters.

A global cache says:

> Reuse this object across many operations.

An Identity Map says:

> Within this Unit of Work, one database identity should correspond to
> one object.

When the `DbContext` ends, its identity map effectively ends with it.

That keeps data freshness and memory usage manageable.

## Tracking vs. No-Tracking

EF Core also supports no-tracking queries:

``` csharp
var customers = await db.Customers
    .AsNoTracking()
    .ToListAsync(cancellationToken);
```

No-tracking queries are useful when:

-   data is read-only,
-   you do not plan to call `SaveChanges` for those instances,
-   change tracking overhead is unnecessary.

But the identity semantics differ because the context is not retaining
those entities in its normal change tracker.

This is one reason you should choose tracking behavior intentionally.

## No-Tracking With Identity Resolution

EF Core also supports:

``` csharp
.AsNoTrackingWithIdentityResolution()
```

This is an interesting hybrid.

The query can perform identity resolution while materializing the result
without leaving those instances tracked by the main `DbContext`
afterward.

That is useful for read-only object graphs where repeated references to
the same entity should still resolve consistently.

## Duplicate Instances and Attach

Problems can appear when disconnected applications construct a second
entity instance with an identity that the context is already tracking.

For example:

``` csharp
var existing = await db.Customers
    .SingleAsync(
        x => x.Id == dto.Id,
        cancellationToken);

var incoming = new Customer(dto.Id, dto.Name);

db.Attach(incoming);
```

Now the context may be asked to track two instances with the same key.

That is exactly the situation Identity Map is designed to prevent.

A better approach is usually to update the already tracked object:

``` csharp
existing.ChangeName(dto.Name);
```

rather than constructing a duplicate persistent identity inside the same
Unit of Work.

## Identity Map and Web APIs

Disconnected HTTP requests complicate things.

Each request usually has its own `DbContext`, so the Identity Map does
not span requests.

That is good.

An entity returned in request A should not remain a live tracked object
until request B.

Instead, request B loads a fresh object into a fresh Unit of Work.

This keeps web applications from accidentally turning their ORM session
into an application-wide object cache.

## Identity Map and Caching

Identity Map and second-level caching solve different problems.

Identity Map:

-   scoped to a Unit of Work,
-   primarily about object identity and consistency,
-   commonly built into an ORM session.

Application cache:

-   may span requests,
-   primarily about avoiding repeated data access,
-   needs expiration and invalidation policies,
-   may store serialized representations rather than live tracked
    objects.

Confusing them can lead to stale tracked entities and surprising
behavior.

## Performance

Identity Map can avoid repeated materialization and redundant data
access within a Unit of Work.

But an excessively long-lived context can turn the benefit into a
liability:

-   more tracked objects,
-   more memory,
-   more change-detection work,
-   stale state.

The goal is not to maximize reuse.

The goal is to keep identity consistent within the correct boundary.

## Testing

Most applications do not need direct tests for EF Core's Identity Map
behavior.

You may want tests around application code that relies on object
identity or around disconnected update flows.

For example, integration tests can verify that loading related entities
and then loading the same entity independently does not produce
conflicting tracked instances.

## When to Use It

You need the concept whenever an object-relational layer maintains
mutable entities during a business transaction.

In EF Core, tracking queries already provide it.

A custom Identity Map may make sense when:

-   you are building a custom Data Mapper,
-   direct SQL materialization creates object graphs,
-   your persistence layer is not using an ORM that provides identity
    resolution.

## When Not to Build Your Own

Do not add a second Identity Map on top of EF Core's tracked `DbContext`
unless you have an unusually specific reason.

Two identity systems can be worse than none.

## Related Patterns

-   Unit of Work
-   Data Mapper
-   Repository
-   Lazy Load
-   Optimistic Offline Lock

## Summary

Identity Map solves a deceptively important problem:

> Within one business transaction, there should not be multiple
> competing in-memory objects representing the same persistent entity.

EF Core tracking already provides this behavior.

Understanding the pattern explains why `DbContext` lifetime, tracking
mode, disconnected updates, and duplicate entity instances matter so
much.
