---
category: Object-Relational Structural Patterns
csharp: 14
description: "Map an entire inheritance hierarchy to one relational
  table using EF Core table-per-hierarchy (TPH), discriminators, and
  modern C#."
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/singleTableInheritance.html"
order: 23
pattern: Single Table Inheritance
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: single-table-inheritance
status: draft
title: Single Table Inheritance in Modern .NET
---

# Single Table Inheritance in Modern .NET

Single Table Inheritance stores an entire object inheritance hierarchy
in one database table.

In EF Core terminology, this is **table-per-hierarchy (TPH)**, and it is
the default inheritance mapping strategy.

## One Hierarchy, One Table

We will use the same model for all three inheritance articles:

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

With Single Table Inheritance, all three types share one table:

``` text
PaymentMethods
-------------------------------------------------------------
Id | DisplayName | Type | LastFour | Network | BankName | AccountLastFour
```

A discriminator tells the mapper which CLR type each row represents.

## EF Core Configuration

``` csharp
modelBuilder.Entity<PaymentMethod>()
    .HasDiscriminator<string>("PaymentMethodType")
    .HasValue<CardPaymentMethod>("card")
    .HasValue<BankAccountPaymentMethod>("bank");
```

EF Core can create the discriminator automatically, but explicit values
make the database representation easier to understand and stabilize.

## The Nullable-Column Trade-off

A card row does not need `BankName`. A bank-account row does not need
`Network`.

The single table therefore contains columns that are irrelevant for some
rows:

``` text
card | 1234 | Visa | NULL      | NULL
bank | NULL | NULL | Acme Bank | 9876
```

This is the central structural trade-off of the pattern.

## Why TPH Is Attractive

The database can retrieve the entire hierarchy without joining
inheritance tables:

``` csharp
var methods = await db.PaymentMethods
    .ToListAsync(cancellationToken);
```

A derived-type query is also natural:

``` csharp
var cards = await db.PaymentMethods
    .OfType<CardPaymentMethod>()
    .ToListAsync(cancellationToken);
```

EF Core translates the type restriction using the discriminator.

## Polymorphic Queries

TPH is particularly attractive when the application frequently queries
the base type:

``` csharp
var methods = await db.PaymentMethods
    .OrderBy(x => x.DisplayName)
    .ToListAsync(cancellationToken);
```

Every row is already in one table.

## Constraints Can Be Awkward

The schema cannot express every subtype invariant elegantly.

For example, `LastFour` should be required for cards but meaningless for
bank accounts. The column often needs to be nullable at the table level
even if the C# property is conceptually required for the derived type.

Application validation, check constraints, or carefully designed
database constraints may be needed.

## Adding New Derived Types

Suppose we add:

``` csharp
public sealed class WalletPaymentMethod : PaymentMethod
{
    public string Provider { get; private set; } = "";
    public string WalletHandle { get; private set; } = "";
}
```

The shared table gains more columns.

This is easy operationally, but a very broad hierarchy can produce a
wide table with many subtype-specific nullable columns.

## Performance

TPH avoids the inheritance joins required by Class Table Inheritance.
That makes it a strong default for many applications, especially when
polymorphic queries are common.

Do not choose solely from intuition about null columns. Measure
representative workloads and indexes.

## When to Use It

Single Table Inheritance is compelling when the hierarchy is modest,
base-type queries are common, and the convenience of one table outweighs
subtype-specific nullable columns.

## When to Reconsider

Reconsider it when the hierarchy produces an extremely wide table,
subtype-specific constraints are difficult to express, or concrete types
are almost always queried independently.

## Related Patterns

-   Class Table Inheritance
-   Concrete Table Inheritance
-   Data Mapper
-   Identity Field
-   Inheritance Mappers

## Summary

Single Table Inheritance chooses query simplicity over relational
separation.

EF Core's TPH implementation makes it the natural baseline: one
hierarchy, one table, one discriminator, and no inheritance joins.
