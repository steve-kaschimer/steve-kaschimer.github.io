---
author: Steve Kaschimer
date: 2029-01-21
image: /images/posts/2029-01-21-hero.webp
image_alt: "A vertical stack of distinct shapes connected to one another by thin joining lines running between each pair, implying separate structures that must be joined together to reconstruct one complete object."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a vertical stack of three distinct teal shapes, each connected to the one below it by a thin amber joining line, implying separate structures that must be joined together to reconstruct one complete object. Mood is normalized but effortful. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Class Table Inheritance represents an inheritance hierarchy with one relational table per class - EF Core's table-per-type (TPT) - so the schema mirrors the object model closely. Covers why that conceptual neatness is paid for in joins, and current EF Core guidance that TPT often performs worse than the TPH default."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Class Table Inheritance in Modern .NET"
---



Class Table Inheritance represents an inheritance hierarchy with one relational table for each class. In EF Core terminology, this is **table-per-type (TPT)**.

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

With TPT, the schema mirrors the type hierarchy:
``` text
PaymentMethods
----------------
Id
DisplayName

CardPaymentMethods
------------------
Id -> PaymentMethods.Id
LastFour
Network

BankAccountPaymentMethods
-------------------------
Id -> PaymentMethods.Id
BankName
AccountLastFour
```

The derived row shares its primary-key value with the base row.

## EF Core Configuration

``` csharp
modelBuilder.Entity<PaymentMethod>()
    .UseTptMappingStrategy();

modelBuilder.Entity<PaymentMethod>()
    .ToTable("PaymentMethods");

modelBuilder.Entity<CardPaymentMethod>()
    .ToTable("CardPaymentMethods");

modelBuilder.Entity<BankAccountPaymentMethod>()
    .ToTable("BankAccountPaymentMethods");
```

The relational schema now resembles the class hierarchy closely.

## Persisting a Derived Object

Saving a card requires data in both the base and derived tables. Conceptually:
``` text
PaymentMethods
Id = 42, DisplayName = "Corporate Visa"

CardPaymentMethods
Id = 42, LastFour = "1234", Network = "Visa"
```

The mapper reconstructs one `CardPaymentMethod` from those rows.

## The Appeal of TPT

Subtype-specific columns live only where they belong. There is no `BankName` column on a card row and no discriminator column is required to identify a row's type in the same way as TPH. This often looks attractive from a normalization and schema-design perspective.

## The Cost: Joins

Object reconstruction requires joins. A derived query may need:
``` text
PaymentMethods
JOIN CardPaymentMethods
```

A polymorphic query over the base hierarchy can become more complicated because the mapper must determine which derived table contains each object's additional state. This is the defining practical trade-off.

## Polymorphic Queries

Application code remains pleasantly simple:
``` csharp
var methods = await db.PaymentMethods
    .ToListAsync(cancellationToken);
```

But simple LINQ does not imply simple SQL. Inheritance mapping is a good example of why database behavior must be evaluated below the ORM abstraction.

## Schema Evolution

Adding a new derived type generally adds a new table rather than adding columns to the shared base table. That can be attractive when subtypes contain many distinct fields. However, the cost of polymorphic queries grows with hierarchy complexity.

## Constraints

TPT makes subtype-specific relational constraints easier because subtype columns live in subtype tables. But constraints or indexes spanning inherited and derived properties can be harder because those values live in different tables.

## Performance Guidance

TPT is frequently chosen because the schema feels clean. That is not enough. Current EF Core guidance warns that TPT often performs worse than TPH because queries can require complex joins. Benchmark representative reads and writes before selecting it for aesthetic reasons.

## When to Use It

Class Table Inheritance may fit when an external schema already uses this structure, relational normalization is a strong requirement, or subtype tables need independent relational treatment and measured performance is acceptable.

## When to Avoid It

Be cautious when polymorphic queries are frequent, hierarchies are deep, latency is important, or TPT is being chosen merely because the tables resemble the classes.

## Related Patterns

-   Single Table Inheritance
-   Concrete Table Inheritance
-   Foreign Key Mapping
-   Data Mapper
-   Inheritance Mappers

## Summary

Class Table Inheritance makes the relational schema look like the object hierarchy. That conceptual neatness has a price: reconstructing objects requires joins. In EF Core, TPT is available and useful, but it should be selected because its trade-offs fit the system - not because it looks architecturally pure.
