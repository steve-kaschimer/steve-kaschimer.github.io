---
author: Steve Kaschimer
date: 2028-10-08
image: /images/posts/2028-10-08-hero.webp
image_alt: "A single gateway arch spanning the full width of a grid glyph beneath it, implying one shared entry point for an entire table's worth of data."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber gateway arch spanning the full width of a teal grid glyph positioned directly beneath it, implying one shared, deliberate entry point for an entire table's persistence rather than scattered access. Mood is centralized and deliberate. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Table Data Gateway places the SQL for a table behind a single object, giving persistence logic one clear home instead of letting database knowledge spread through controllers and jobs. Covers pairing it with Transaction Script, and why it's more compelling when SQL is intentionally explicit than as a thin wrapper around what DbSet already provides."
tags: ["dotnet", "architecture", "design-patterns", "data-access"]
title: "Table Data Gateway in Modern .NET"
---

Table Data Gateway places the SQL for a table or view behind a single
object. Instead of allowing database knowledge to spread through
controllers, jobs, and application services, the gateway becomes the
entry point for reading and writing that table.

## The Problem

Direct SQL can be an excellent choice, but scattered SQL creates
coupling. A schema change can force edits throughout the application.

A gateway gives persistence logic a clear home:

``` csharp
public sealed class OrderGateway(DbConnection connection)
{
    public Task<OrderRow?> FindAsync(
        int id,
        CancellationToken cancellationToken)
    {
        // SELECT Id, CustomerId, Status FROM Orders WHERE Id = @id
    }

    public Task<int> MarkSubmittedAsync(
        int id,
        DateTimeOffset submittedAt,
        CancellationToken cancellationToken)
    {
        // UPDATE Orders SET Status = ..., SubmittedAt = ... WHERE Id = @id
    }
}
```

There is one `OrderGateway` for the table - not one gateway instance per
row.

## Pairing It With Transaction Script

``` csharp
public sealed class SubmitOrder(
    OrderGateway orders,
    TimeProvider timeProvider)
{
    public async Task ExecuteAsync(int id, CancellationToken ct)
    {
        var order = await orders.FindAsync(id, ct)
            ?? throw new InvalidOperationException("Order not found.");

        if (order.Status != "Draft")
            throw new InvalidOperationException(
                "Only draft orders can be submitted.");

        await orders.MarkSubmittedAsync(
            id, timeProvider.GetUtcNow(), ct);
    }
}
```

The script owns the workflow. The gateway owns persistence.

## Meaningful Gateway Methods

A gateway need not be generic CRUD. Methods such as:

``` csharp
Task<IReadOnlyList<OrderRow>> FindReadyToShipAsync(
    DateTimeOffset asOf,
    CancellationToken cancellationToken);
```

can centralize important persistence queries without pretending that
database operations are domain objects.

## What About EF Core?

`DbSet<T>` already provides a powerful table-like persistence API. A
gateway that simply forwards `Add`, `Find`, `Update`, and `Remove`
usually adds little.

Table Data Gateway is more compelling when:

-   SQL is intentionally explicit,
-   stored procedures or views dominate,
-   the application is record-oriented,
-   Transaction Script or Table Module fits the domain,
-   you want a narrow boundary around ADO.NET or another SQL API.

## Transactions

Gateways should not necessarily own transaction boundaries. A use case
may coordinate several gateways inside one transaction. The application
operation or Unit of Work can own that boundary.

## Testing

Gateway tests should generally be integration tests against the real
database technology. Mocks cannot verify SQL syntax, column mapping,
constraints, or query behavior.

## Trade-offs

Benefits include explicit SQL, centralized database access, and a simple
persistence boundary. Costs include manual mapping and a table-oriented
API that may become awkward for a rich object model.

## Related Patterns

-   Transaction Script
-   Table Module
-   Row Data Gateway
-   Data Mapper

## Summary

Table Data Gateway is a deliberate choice for table-oriented
persistence. When direct SQL is the right tool, a gateway keeps that SQL
contained and gives the rest of the application a focused API.
