---
author: Steve Kaschimer
date: 2028-12-31
image: /images/posts/2028-12-31-hero.webp
image_alt: "A small shape merged flush into the edge of a larger shape with no visible seam or gap, implying a value fully absorbed into its owner's own structure rather than kept separate."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single large teal outlined shape with one small amber shape merged flush into its edge, blending seamlessly with no visible seam or gap, implying a value fully absorbed into its owner's structure rather than kept as a separate entity. Mood is seamless and integrated. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Embedded Value maps a small object into columns in another object's table rather than giving it its own table - especially useful for value objects like Money or Address. Covers EF Core owned mappings, and why this beats flattening the domain model just because persistence found it convenient."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Embedded Value in Modern .NET"
---

Embedded Value maps a small object into columns in another object's
table rather than giving that object its own table.

This is especially useful for value objects.

## A Domain-Friendly Value Object

``` csharp
public readonly record struct Money(
    decimal Amount,
    string Currency);
```

The domain benefits from treating money as one concept rather than
passing a decimal and currency code separately.

The relational model does not necessarily need a `Money` table.

Instead, an order might store:

``` text
Orders
--------------------------------
Id
TotalAmount
TotalCurrency
```

The object is embedded into the owner's row.

## Another Example: Address

``` csharp
public sealed record Address(
    string Line1,
    string City,
    string State,
    string PostalCode,
    string Country);
```

A customer table can contain:

``` text
ShippingLine1
ShippingCity
ShippingState
ShippingPostalCode
ShippingCountry
```

while application code still works with one `Address` object.

## EF Core Mapping

Modern EF Core provides multiple ways to model value-like structures
depending on lifecycle and provider requirements.

An owned mapping can look like:

``` csharp
builder.OwnsOne(x => x.ShippingAddress, address =>
{
    address.Property(x => x.Line1)
        .HasColumnName("ShippingLine1");

    address.Property(x => x.City)
        .HasColumnName("ShippingCity");

    address.Property(x => x.PostalCode)
        .HasColumnName("ShippingPostalCode");
});
```

The domain retains an `Address`; the relational table gets ordinary
columns.

## Why Not Flatten the Domain?

You could write:

``` csharp
public string ShippingLine1 { get; set; }
public string ShippingCity { get; set; }
public string ShippingPostalCode { get; set; }
```

But then persistence concerns have dictated the domain shape.

A value object can centralize validation and behavior:

``` csharp
public sealed record DateRange
{
    public DateOnly Start { get; }
    public DateOnly End { get; }

    public DateRange(DateOnly start, DateOnly end)
    {
        if (end < start)
            throw new ArgumentException("End must not precede start.");

        Start = start;
        End = end;
    }

    public int Days => End.DayNumber - Start.DayNumber + 1;
}
```

Embedded Value lets the object model keep that useful abstraction
without requiring another relational table.

## Value Semantics Matter

Embedded objects are usually strongest when they are values rather than
independently identified entities.

A `Money(10, "USD")` is defined by its value.

It normally does not need:

``` csharp
MoneyId
```

Giving every small value object an identity and table can make both the
object model and database unnecessarily complicated.

## Nullability

Optional embedded values deserve careful mapping.

If an optional address maps to five nullable columns, what does it mean
when three contain values and two are null?

Your domain invariants and persistence constraints should prevent
invalid partial states where appropriate.

## Querying Embedded Values

Because the values map to ordinary columns, queries can still filter on
them:

``` csharp
var expensiveOrders = await db.Orders
    .Where(x => x.Total.Amount >= 1_000m)
    .ToListAsync(cancellationToken);
```

The exact supported expression depends on the mapping and provider, but
the architectural benefit is important: a richer object model does not
necessarily prevent relational querying.

## Embedded Value vs. Serialized LOB

Embedded Value gives individual relational columns to the object's
values.

Serialized LOB stores a serialized representation in one large field.

Embedded columns are usually better when the database must query, sort,
index, constrain, or report on individual values.

Serialization can be attractive when the structure is complex and mostly
treated as an opaque whole.

## Testing

Test the value object itself with ordinary unit tests. Separately
integration-test the mapping to ensure column names, nullability,
conversions, and round-tripping behave correctly.

## When to Use It

Use Embedded Value when a small domain object belongs to an owner, has
value semantics, and its individual fields remain useful to the
relational database.

## Related Patterns

-   Dependent Mapping
-   Serialized LOB
-   Data Mapper
-   Identity Field

## Summary

Embedded Value lets object-oriented design and relational design each
use a natural shape.

The domain gets concepts such as `Money`, `Address`, and `DateRange`.
The database gets columns that remain queryable and indexable.

That is a good example of mapping being a translation rather than
forcing one model to imitate the other.
