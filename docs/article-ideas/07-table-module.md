---
category: Domain Logic Patterns
csharp: 14
description: Explore Fowler's Table Module pattern, how it differs from
  Domain Model, and where its table-oriented approach still fits modern
  .NET.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/tableModule.html"
order: 7
pattern: Table Module
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: table-module
status: draft
title: Table Module in Modern .NET
---

# Table Module in Modern .NET

Table Module organizes domain logic into one module responsible for all
rows in a table or view. It is less commonly named in modern .NET
discussions, but the idea remains useful.

## The Key Distinction

With Domain Model, one object instance commonly represents one entity.
With Table Module, one module operates across the entire record set.

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

There is no requirement for a rich `Invoice` object with methods such as
`Pay()` or `Cancel()`.

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

Transaction Script is organized around use cases such as `SubmitOrder`
and `CancelOrder`. Table Module is organized around record sets such as
Orders, Customers, and Invoices.

## Table Module vs. Domain Model

Domain Model:

``` csharp
order.Submit();
```

Table Module:

``` csharp
orders.Submit(orderId);
```

The first associates behavior with an entity instance. The second
associates behavior with the module responsible for the set.

## When It Makes Sense

Table Module can fit well when set-based operations dominate, reporting
is central, data comes from views or stored procedures, or a rich object
graph adds little value.

## EF Core Changes the Picture

EF Core makes object-oriented persistence convenient, so modern .NET
naturally gravitates toward entity objects. A Table Module should
therefore add meaningful domain behavior rather than merely duplicate
LINQ or `DbSet<T>`.

## Testing

Set-oriented logic can often be tested against in-memory collections,
while queries intended for EF Core should also receive integration tests
to verify SQL translation.

## Related Patterns

-   Transaction Script
-   Domain Model
-   Table Data Gateway
-   Record Set

## Summary

Table Module occupies useful middle ground: it gives business logic a
home without requiring a rich object model. It remains a good fit when
the problem itself is naturally tabular or set-oriented.
