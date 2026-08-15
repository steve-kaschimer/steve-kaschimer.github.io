---
author: Steve Kaschimer
date: 2029-01-28
image: /images/posts/2029-01-28-hero.webp
image_alt: "Several complete, fully self-contained shapes arranged side by side with no shared base or connecting structure between them, implying independent representations that duplicate common structure rather than sharing it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three complete, fully self-contained teal shapes arranged side by side with clear gaps between them and no connecting lines or shared base, implying independent representations that each duplicate common structure rather than sharing it. Mood is independent and duplicated. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Concrete Table Inheritance creates a table for each concrete class and repeats inherited fields in each one - EF Core's table-per-concrete-type (TPC). Covers why leaf-type queries become simple while base-type queries and referential integrity become genuinely harder, and the key-generation subtlety that comes with it."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Concrete Table Inheritance in Modern .NET"
---

Concrete Table Inheritance creates a table for each concrete class in an
inheritance hierarchy and repeats inherited fields in each concrete
table.

In EF Core terminology, this is **table-per-concrete-type (TPC)**.

## The Same C# Hierarchy

``` csharp
public abstract class PaymentMethod
{
    public Guid Id { get; protected set; }
    public string DisplayName { get; protected set; } = "";
}

public sealed class CardPaymentMethod : PaymentMethod
{
    public string LastFour { get; private set; } = "";
    public string Network { get; private set; } = "";
}

public sealed class BankAccountPaymentMethod : PaymentMethod
{
    public string BankName { get; private set; } = "";
    public string AccountLastFour { get; private set; } = "";
}
```

Because `PaymentMethod` is abstract, TPC does not need a base table.

Instead:

``` text
CardPaymentMethods
---------------------------------
Id
DisplayName
LastFour
Network

BankAccountPaymentMethods
---------------------------------
Id
DisplayName
BankName
AccountLastFour
```

Inherited properties such as `DisplayName` are duplicated across
concrete tables.

## EF Core Configuration

``` csharp
modelBuilder.Entity<PaymentMethod>()
    .UseTpcMappingStrategy();

modelBuilder.Entity<CardPaymentMethod>()
    .ToTable("CardPaymentMethods");

modelBuilder.Entity<BankAccountPaymentMethod>()
    .ToTable("BankAccountPaymentMethods");
```

Each concrete object can be represented by one row in one table.

## TPC vs. TPT

TPT normalizes inherited fields:

``` text
PaymentMethods
      +
CardPaymentMethods
```

TPC duplicates them:

``` text
CardPaymentMethods contains all card fields
BankAccountPaymentMethods contains all bank fields
```

TPC therefore avoids the join needed to reconstruct a single concrete
object.

## Querying One Concrete Type

A leaf-type query can be straightforward:

``` csharp
var cards = await db.Set<CardPaymentMethod>()
    .Where(x => x.Network == "Visa")
    .ToListAsync(cancellationToken);
```

All required card data lives in the card table.

This is one of TPC's strongest characteristics.

## Querying the Base Type

The application can still write:

``` csharp
var methods = await db.PaymentMethods
    .ToListAsync(cancellationToken);
```

But there is no common table containing all payment methods.

The relational query must combine results from concrete tables.

So TPC shifts complexity:

-   concrete-type reads become simple,
-   polymorphic base-type reads become more involved.

## Key Generation Matters

All entities in an EF Core hierarchy must have unique key values even
when they live in different concrete tables.

That means this is unsafe conceptually:

``` text
CardPaymentMethods.Id = 1
BankAccountPaymentMethods.Id = 1
```

if both belong to the same mapped hierarchy.

Providers that support sequences can use a shared sequence.
Application-generated globally unique identifiers are another natural
option:

``` csharp
public Guid Id { get; protected set; } = Guid.CreateVersion7();
```

Key-generation strategy should be designed as part of the mapping.

## Referential Integrity

TPC can make some foreign-key relationships harder to enforce at the
database level.

If another table references a `PaymentMethod`, which table should its
foreign key target?

The identity might live in `CardPaymentMethods` or
`BankAccountPaymentMethods`.

There is no single base table containing every valid ID.

This is an important structural consequence, not merely an ORM
implementation detail.

## Duplicated Columns

TPC deliberately denormalizes inherited state.

If the base class gains:

``` csharp
public DateTimeOffset CreatedAt { get; protected set; }
```

every concrete table needs a corresponding column.

That duplication is the price paid for keeping each concrete object's
state together in one table.

## Adding a New Concrete Type

A new subtype generally means a new table:

``` csharp
public sealed class WalletPaymentMethod : PaymentMethod
{
    public string Provider { get; private set; } = "";
}
```

The new table repeats all inherited columns plus its own.

Existing concrete tables need not gain subtype-specific columns, unlike
TPH.

## Performance

TPC can perform well when workloads mostly query individual concrete
types because each object is contained in one table.

Base-type queries may require unions across concrete tables.

Current EF Core guidance generally favors TPH as the broad default, with
TPC worth considering when leaf-type querying dominates and benchmarks
show a benefit.

## Choosing Among the Three

Using our payment hierarchy:

``` text
TPH / Single Table
  One table
  Discriminator
  Nullable subtype columns
  Strong polymorphic-query story

TPT / Class Table
  One table per class
  Normalized inherited fields
  Joins to reconstruct derived objects

TPC / Concrete Table
  One table per concrete type
  Duplicated inherited fields
  No inheritance join for concrete objects
  More complex polymorphic queries
```

There is no universally correct mapping.

The right choice depends on how the hierarchy is queried, updated,
constrained, and expected to evolve.

## When to Use It

Concrete Table Inheritance is worth considering when most queries target
concrete leaf types, concrete types have substantially different shapes,
and benchmarked performance favors TPC.

## When to Reconsider

Prefer another strategy when polymorphic base queries dominate,
database-enforced references to the base hierarchy are important, or
duplicated inherited columns create unacceptable schema maintenance.

## Related Patterns

-   Single Table Inheritance
-   Class Table Inheritance
-   Identity Field
-   Data Mapper
-   Inheritance Mappers

## Summary

Concrete Table Inheritance optimizes the relational representation
around concrete objects rather than the hierarchy as a whole.

EF Core's TPC support makes the strategy practical, but it introduces
real consequences for key generation, polymorphic queries, duplicated
columns, and referential integrity.

Choose it from measured access patterns, not from the shape of the class
diagram.
