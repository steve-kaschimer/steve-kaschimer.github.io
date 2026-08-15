---
category: Data Source Architectural Patterns
csharp: 14
description: Understand Row Data Gateway, its one-object-per-row model,
  and how it compares with Active Record and modern ORM approaches.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/rowDataGateway.html"
order: 10
pattern: Row Data Gateway
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: row-data-gateway
status: draft
title: Row Data Gateway in Modern .NET
---

# Row Data Gateway in Modern .NET

Row Data Gateway represents one database record as an object that knows
how to persist that record.

If Table Data Gateway says, "one gateway handles the Orders table," Row
Data Gateway says, "this object is the gateway for order row 42."

## The Basic Shape

``` csharp
public sealed class OrderRowGateway
{
    private readonly DbConnection _connection;

    public int Id { get; }
    public int CustomerId { get; }
    public string Status { get; private set; }

    internal OrderRowGateway(
        DbConnection connection,
        int id,
        int customerId,
        string status)
    {
        _connection = connection;
        Id = id;
        CustomerId = customerId;
        Status = status;
    }

    public async Task UpdateStatusAsync(
        string status,
        CancellationToken cancellationToken)
    {
        // UPDATE Orders SET Status = @status WHERE Id = @id
        Status = status;
    }
}
```

A separate finder can handle collection-level lookup:

``` csharp
var order = await finder.FindAsync(orderId, cancellationToken)
    ?? throw new InvalidOperationException("Order not found.");

await order.UpdateStatusAsync("Submitted", cancellationToken);
```

## Row Data Gateway vs. Active Record

The distinction is business behavior. Row Data Gateway primarily
represents a row and its persistence. Active Record also contains domain
behavior.

Row Data Gateway:

``` csharp
await order.UpdateStatusAsync("Cancelled", ct);
```

Active Record:

``` csharp
order.Cancel();
await order.SaveAsync(ct);
```

## Row Data Gateway vs. Domain Model

A Domain Model is designed around business concepts and invariants. A
Row Data Gateway is designed around a database row.

If a database column changes, the gateway may change. If the business
rules for cancelling an order change, a domain object may change. As
complexity grows, separating those reasons for change becomes valuable.

## Concurrency

A gateway can make optimistic concurrency explicit by issuing an update
whose `WHERE` clause includes an expected version. If zero rows are
affected, another transaction changed the record first.

We will explore that more deeply in Optimistic Offline Lock.

## Where It Fits Today

The pattern is less common in EF Core applications because tracked EF
entities already provide much of the ergonomic benefit of row-oriented
objects.

Manual Row Data Gateway remains useful when you want direct SQL,
instance-oriented persistence, and a simple domain without introducing a
full ORM.

## Testing

Because gateway objects contain database behavior, integration testing
is important. Business rules should remain separately testable when they
live outside the gateway.

## Trade-offs

The pattern gives a convenient object-oriented interface over row
persistence. Its cost is coupling each gateway object to storage, which
becomes more restrictive as the domain becomes richer.

## Related Patterns

-   Table Data Gateway
-   Active Record
-   Data Mapper
-   Transaction Script

## Summary

Row Data Gateway sits between raw SQL and richer object-relational
approaches. It can be elegant for simple record-oriented domains, but
its persistence coupling becomes increasingly important as business
behavior grows.
