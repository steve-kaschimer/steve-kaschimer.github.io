---
author: Steve Kaschimer
date: 2028-09-24
image: /images/posts/2028-09-24-hero.webp
image_alt: "A grid glyph with a single amber operator symbol overlaid across the whole grid rather than on any individual cell, implying behavior that operates on the entire set at once."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal grid glyph of evenly spaced rows and columns, with a single amber operator mark overlaid across the entire grid rather than isolated to any one cell, implying behavior that acts on the whole record set at once rather than one row at a time. Mood is set-oriented and orderly. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Table Module organizes domain logic into one module responsible for all rows in a table or view, rather than one object instance per entity - a less commonly named pattern today, but one LINQ makes natural for set-oriented behavior. Covers where it still fits cleanly against both Transaction Script and Domain Model."
tags: ["dotnet", "architecture", "design-patterns", "domain-logic"]
title: "Table Module in Modern .NET"
---



Table Module organizes domain logic into one module responsible for all rows in a table or view. It is less commonly named in modern .NET discussions, but the idea remains useful.

## The Key Distinction

With Domain Model, one object instance commonly represents one entity. With Table Module, one module operates across the entire record set.
``` csharp
public sealed class InvoiceTable
{
    public decimal CalculateOutstandingBalance(
        IEnumerable<InvoiceRow> invoices,
        CustomerId customerId)
        => invoices
            .Where(x => x.CustomerId == customerId)
            .Where(x => x.Status == InvoiceStatus.Open)
            .Sum(x => x.Total - x.AmountPaid);
}
```

There is no requirement for a rich `Invoice` object with methods such as `Pay()` or `Cancel()`.

## A Modern .NET Interpretation

LINQ makes set-oriented behavior natural:
``` csharp
public sealed class OrderTable
{
    public IQueryable<OrderRecord> ReadyToShip(
        IQueryable<OrderRecord> orders,
        DateTimeOffset now)
        => orders.Where(x =>
            x.Status == OrderStatus.Paid &&
            x.ShipAfter <= now);
}
```

This can compose directly with EF Core.

## Table Module vs. Transaction Script

Transaction Script is organized around use cases such as `SubmitOrder` and `CancelOrder`. Table Module is organized around record sets such as Orders, Customers, and Invoices.

## Table Module vs. Domain Model

Domain Model:
``` csharp
order.Submit();
```

Table Module:
``` csharp
orders.Submit(orderId);
```

The first associates behavior with an entity instance. The second associates behavior with the module responsible for the set.

## When It Makes Sense

Table Module can fit well when set-based operations dominate, reporting is central, data comes from views or stored procedures, or a rich object graph adds little value.

## EF Core Changes the Picture

EF Core makes object-oriented persistence convenient, so modern .NET naturally gravitates toward entity objects. A Table Module should therefore add meaningful domain behavior rather than merely duplicate LINQ or `DbSet<T>`.

## Testing

Set-oriented logic can often be tested against in-memory collections, while queries intended for EF Core should also receive integration tests to verify SQL translation.

## Related Patterns

-   Transaction Script
-   Domain Model
-   Table Data Gateway
-   Record Set

## Summary

Table Module occupies useful middle ground: it gives business logic a home without requiring a rich object model. It remains a good fit when the problem itself is naturally tabular or set-oriented.
