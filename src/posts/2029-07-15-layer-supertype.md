---
author: Steve Kaschimer
date: 2029-07-15
image: /images/posts/2029-07-15-hero.webp
image_alt: "A vertical stack of differently shaped small glyphs all touching and resting on one shared horizontal base plate beneath them, implying a common foundation shared by otherwise distinct types."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three differently shaped small teal glyphs arranged in a row, each resting directly on one shared horizontal amber base plate beneath them, implying a common foundation genuinely shared by otherwise distinct types. Mood is grounded and shared. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Layer Supertype is a common superclass for every type in a layer, giving it one place for behavior every member genuinely shares - useful in modern .NET, but inheritance deserves more care here than older enterprise frameworks often gave it. Covers the fragile-base-class problem, and modern C# interfaces with default members as a more flexible alternative to a growing base class."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Layer Supertype in Modern .NET"
---



Layer Supertype is a type that acts as the common superclass for all types in a layer. It gives the layer one place for behavior or data that every member genuinely shares. In modern .NET, the pattern is useful - but inheritance should be applied more carefully than it often was in older enterprise frameworks.

## The Basic Idea

Suppose every domain entity has an identifier:
``` csharp
public abstract class Entity<TId>
    where TId : notnull
{
    public TId Id { get; protected init; } = default!;
}
```

Then:
``` csharp
public sealed class Customer
    : Entity<CustomerId>
{
}
```

and:
``` csharp
public sealed class Order
    : Entity<OrderId>
{
}
```

The base type gives the domain layer shared semantics.

## Shared Identity Semantics

A richer entity base might implement equality:
``` csharp
public abstract class Entity<TId>
    where TId : notnull
{
    public TId Id { get; protected init; } = default!;

    public override bool Equals(object? obj)
    {
        return obj is Entity<TId> other
            && GetType() == other.GetType()
            && EqualityComparer<TId>.Default.Equals(
                Id,
                other.Id);
    }

    public override int GetHashCode()
        => HashCode.Combine(GetType(), Id);
}
```

Now entity identity behavior is consistent throughout the layer. Whether this belongs in a base class depends on your domain model, but it illustrates the pattern well.

## Persistence Layer Supertype

A persistence layer might have:
``` csharp
public abstract class RepositoryBase
{
    protected AppDbContext Db { get; }

    protected RepositoryBase(AppDbContext db)
        => Db = db;
}
```

Then:
``` csharp
public sealed class OrderRepository(
    AppDbContext db)
    : RepositoryBase(db)
{
}
```

This can remove repeated plumbing. But if the base class exists only to save one constructor parameter declaration, composition may be simpler.

## Controllers

Older ASP.NET applications frequently created:
``` csharp
public abstract class ApplicationController
    : Controller
{
    protected string CurrentTenantId => ...;
    protected string CurrentUserId => ...;
}
```

Then every controller inherited from it. Some shared presentation behavior may justify this. But modern ASP.NET Core offers alternatives:
-   middleware,
-   filters,
-   endpoint filters,
-   services,
-   authorization policies,
-   extension methods.

A base controller should not become the only way to access half the application.

## The Fragile Base Class Problem

A Layer Supertype can slowly accumulate unrelated conveniences:
``` csharp
public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public string CreatedBy { get; set; }
    public bool IsDeleted { get; set; }
    public List<DomainEvent> Events { get; set; }
    public byte[] RowVersion { get; set; }
}
```

Now every entity is forced to participate in:
-   auditing,
-   soft delete,
-   domain events,
-   optimistic concurrency,

whether or not those concepts make sense. The common base has become infrastructure policy by inheritance.

## Prefer True Commonality

A good Layer Supertype represents something that is genuinely universal within the layer. For example:
``` csharp
public abstract class DomainEvent
{
    public DateTimeOffset OccurredAt { get; }
}
```

may make sense if every domain event shares the concept. A `BaseThingWithEveryFeatureWeMightNeed` does not.

## Interfaces as Layer Supertypes

Fowler's original formulation emphasizes a superclass, but modern C# interfaces can sometimes provide the shared type relationship without implementation inheritance:
``` csharp
public interface IHasDomainEvents
{
    IReadOnlyCollection<IDomainEvent>
        DomainEvents { get; }
}
```

Infrastructure can operate on the capability:
``` csharp
foreach (var entry in db.ChangeTracker
    .Entries<IHasDomainEvents>())
{
    // Collect events.
}
```

This is often more flexible than requiring all entities to inherit from one large base class.

## Default Interface Members

Modern C# can even provide limited shared implementation in interfaces. Use that capability carefully. Interface inheritance communicates capability; base-class inheritance communicates both type and implementation reuse. Choose based on what the layer actually needs.

## Generic Constraints

A shared type can enable reusable infrastructure:
``` csharp
public interface IEntity<TId>
{
    TId Id { get; }
}
```

Then:
``` csharp
public static T FindById<T, TId>(
    IEnumerable<T> entities,
    TId id)
    where T : IEntity<TId>
{
    // ...
}
```

The layer's shared contract becomes useful without requiring a concrete superclass.

## Layer Supertype and EF Core

EF Core can map inherited properties automatically. For example:
``` csharp
public abstract class AuditedEntity
{
    public DateTimeOffset CreatedAt { get; protected set; }
}
```

Derived mapped entities inherit the property. That is convenient, but remember that a C# inheritance decision can affect the persistence model. Keep domain and schema consequences in mind.

## Cross-Cutting Concerns

Before putting a cross-cutting concern in a Layer Supertype, ask whether another mechanism is a better fit. For example:
``` text
Logging            -> middleware / decorator
Authorization      -> policies
Validation         -> boundary / domain
Auditing           -> interceptor
Persistence        -> repository / DbContext
Correlation        -> request context
```

Inheritance is one tool, not the default home for shared behavior.

## Testing

A Layer Supertype deserves focused tests if it contains important behavior such as equality or event handling. More importantly, test derived types to ensure the inherited semantics actually fit them. A base abstraction that constantly needs exceptions is probably too broad.

## When to Use It

Layer Supertype is useful when:
-   every object in a layer shares real behavior,
-   shared semantics must remain consistent,
-   generic infrastructure benefits from a common type,
-   implementation inheritance is genuinely appropriate.

## When to Avoid It

Avoid it when the base class becomes a convenience bucket or forces unrelated concerns onto every type. Modern dependency injection and composition often provide cleaner alternatives.

## Related Patterns

-   Separated Interface
-   Mapper
-   Identity Field
-   Implicit Lock

## Summary

Layer Supertype gives an architectural layer a common type and a home for truly shared behavior. In modern .NET, the strongest implementations tend to be small and deliberate. Use inheritance for genuine shared semantics - not merely because several classes happen to need similar plumbing.
