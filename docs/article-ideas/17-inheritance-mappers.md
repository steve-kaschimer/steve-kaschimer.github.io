---
category: Object-Relational Metadata Mapping Patterns
csharp: 14
description: Understand how inheritance mapping strategies are
  coordinated behind a common mapper abstraction and how EF Core hides
  much of that complexity.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/inheritanceMappers.html"
order: 17
pattern: Inheritance Mappers
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: inheritance-mappers
status: draft
title: Inheritance Mappers in Modern .NET
---

# Inheritance Mappers in Modern .NET

Inheritance Mappers coordinate persistence for an object hierarchy when
different classes in that hierarchy may need different mapping behavior.

This pattern sits one level above the inheritance-table strategies we
just covered.

Single Table Inheritance, Class Table Inheritance, and Concrete Table
Inheritance describe *how tables represent inheritance*.

Inheritance Mappers describe *how the mapping layer coordinates
persistence across the hierarchy*.

## The Problem

Suppose we have:

``` csharp
public abstract class PaymentMethod
{
    public Guid Id { get; protected set; }
    public string DisplayName { get; protected set; } = "";
}

public sealed class CardPaymentMethod : PaymentMethod
{
    public string LastFour { get; private set; } = "";
}

public sealed class BankAccountPaymentMethod : PaymentMethod
{
    public string BankName { get; private set; } = "";
}
```

A persistence layer needs to answer:

-   which mapper handles the base class?
-   which mapper handles derived classes?
-   how are polymorphic queries resolved?
-   how are inserts and updates routed?
-   how are common fields handled?

A naive design can duplicate logic across subtype mappers.

Inheritance Mappers provide a coordinated structure.

## A Manual Mapper Hierarchy

One possible design is:

``` csharp
public abstract class PaymentMethodMapper
{
    protected readonly DbConnection Connection;

    protected PaymentMethodMapper(DbConnection connection)
        => Connection = connection;

    public abstract Task<PaymentMethod?> FindAsync(
        Guid id,
        CancellationToken cancellationToken);
}
```

Then:

``` csharp
public sealed class CardPaymentMethodMapper
    : PaymentMethodMapper
{
    public CardPaymentMethodMapper(DbConnection connection)
        : base(connection)
    {
    }

    public override Task<PaymentMethod?> FindAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        // Load card-specific representation.
    }
}
```

The exact shape depends on the inheritance strategy.

## Mapper Inheritance vs. Domain Inheritance

A common mistake is assuming the mapper hierarchy must exactly mirror
the domain hierarchy.

It does not.

The mapper structure should optimize persistence responsibilities.

For example, one mapper may handle several related CLR types if they
share one table and one discriminator.

Likewise, a TPT implementation may use separate components for base and
subtype tables.

The persistence hierarchy and domain hierarchy have related but distinct
responsibilities.

## Polymorphic Lookup

A common requirement is:

``` csharp
PaymentMethod method =
    await mapper.FindAsync(id, cancellationToken);
```

The mapper must determine the concrete type.

With a discriminator-based table, that might mean:

``` text
PaymentMethodType = "card"
```

then materialize:

``` csharp
CardPaymentMethod
```

With a table-per-concrete-type mapping, it may need to determine which
concrete table contains the row.

That resolution logic belongs in the mapping layer.

## Common Mapping Logic

Mapper inheritance can centralize repeated behavior.

For example:

``` csharp
protected void MapBaseFields(
    DbDataReader reader,
    PaymentMethod entity)
{
    // Map Id, DisplayName, CreatedAt, etc.
}
```

Subtype mappers then focus on subtype-specific state.

This reduces duplication but can also create a complex inheritance
structure inside the persistence layer.

Composition is often preferable when it keeps the mapping easier to
follow.

## EF Core Makes This Pattern Mostly Invisible

In modern .NET, EF Core handles most inheritance-mapper coordination
internally.

You configure the model:

``` csharp
modelBuilder.Entity<PaymentMethod>()
    .HasDiscriminator<string>("Type")
    .HasValue<CardPaymentMethod>("card")
    .HasValue<BankAccountPaymentMethod>("bank");
```

Then application code simply writes:

``` csharp
var methods = await db.PaymentMethods
    .ToListAsync(cancellationToken);
```

EF Core determines:

-   which concrete type each row represents,
-   how shared fields map,
-   how subtype-specific fields map,
-   how change tracking works across the hierarchy.

That is exactly the kind of machinery Inheritance Mappers are intended
to organize.

## Why Learn the Pattern If EF Core Already Does It?

Because the abstraction leaks in useful ways.

You still need to understand:

-   why a polymorphic query generates certain SQL,
-   how inheritance mapping affects indexes,
-   why some schemas are awkward to map,
-   why subtype changes may require different migrations,
-   why performance varies across TPH, TPT, and TPC.

The ORM hides implementation complexity, not architectural consequences.

## Custom Persistence Layers

Inheritance Mappers become more explicit when:

-   you use ADO.NET directly,
-   stored procedures differ by subtype,
-   a legacy schema uses unusual inheritance representation,
-   different derived types live in different stores,
-   you build your own Data Mapper abstraction.

For example:

``` csharp
public sealed class PaymentMethodRepository(
    ICardPaymentMethodMapper cards,
    IBankPaymentMethodMapper banks)
{
    public async Task<PaymentMethod?> FindAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        return await cards.FindAsync(id, cancellationToken)
            ?? await banks.FindAsync(id, cancellationToken);
    }
}
```

This can work, but the cost of polymorphic lookup is now obvious.

## Inheritance Mapping and Repositories

Repositories should generally expose domain-oriented operations:

``` csharp
Task<PaymentMethod?> GetAsync(
    PaymentMethodId id,
    CancellationToken cancellationToken);
```

They should not force callers to know which mapper or table strategy is
underneath.

That is one of the main reasons to keep inheritance-mapping machinery
inside infrastructure.

## Testing

Test the mapping at two levels.

First, verify each concrete subtype round-trips correctly.

Second, verify polymorphic queries:

``` csharp
var methods = await db.PaymentMethods
    .ToListAsync();

Assert.Contains(
    methods,
    x => x is CardPaymentMethod);

Assert.Contains(
    methods,
    x => x is BankAccountPaymentMethod);
```

If the hierarchy is important, migration and schema tests can also be
valuable.

## When to Use It

You need the concept whenever inheritance is persisted.

You may not need to implement it directly if your ORM already
coordinates inheritance mapping.

A custom implementation makes sense when a Data Mapper must support a
complex or legacy inheritance representation.

## Trade-offs

The pattern centralizes inheritance-specific persistence knowledge.

Its cost is another abstraction layer that can become complicated if the
object hierarchy or relational strategy is complicated.

## Related Patterns

-   Single Table Inheritance
-   Class Table Inheritance
-   Concrete Table Inheritance
-   Data Mapper
-   Repository

## Summary

Inheritance Mappers are the coordination layer behind persisted
inheritance.

Modern EF Core makes most of that coordination invisible, but the
pattern remains useful because it explains where inheritance-specific
persistence logic belongs and why domain code should not need to know
which relational strategy is being used.
