---
author: Steve Kaschimer
date: 2028-09-10
image: /images/posts/2028-09-10-hero.webp
image_alt: "A single straight procedural arrow passing through three small gate marks in sequence, implying one operation executing a fixed set of steps."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single bold teal arrow running left to right, passing through three small amber gate marks spaced evenly along its length, implying one procedure executing a fixed sequence of steps for one operation. Mood is direct and procedural. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Transaction Script organizes business logic around the application's transactions, with one procedure handling each operation - explicit, easy to locate, and often the right choice for CRUD-heavy systems. A look at when it works well, and the warning sign - duplicated business knowledge - that means a domain object may need to take over."
tags: ["dotnet", "architecture", "design-patterns", "domain-logic"]
title: "Transaction Script in Modern .NET"
---



Transaction Script organizes business logic around the application's transactions or use cases, with one procedure handling each operation.

## The Problem

Many applications begin as a set of straightforward operations: create an order, approve an invoice, cancel a subscription, or register a customer. When the rules for each operation are relatively independent, a rich object model can add more ceremony than value.

## A Modern C# Example

``` csharp
public sealed class SubmitOrder(AppDbContext db, TimeProvider timeProvider)
{
    public async Task ExecuteAsync(int orderId, CancellationToken ct)
    {
        var order = await db.Orders
            .Include(x => x.Lines)
            .SingleOrDefaultAsync(x => x.Id == orderId, ct)
            ?? throw new InvalidOperationException($"Order {orderId} was not found.");

        if (order.Status != OrderStatus.Draft)
            throw new InvalidOperationException("Only draft orders can be submitted.");

        if (order.Lines.Count == 0)
            throw new InvalidOperationException("An order must contain at least one line.");

        order.Status = OrderStatus.Submitted;
        order.SubmittedAt = timeProvider.GetUtcNow();

        await db.SaveChangesAsync(ct);
    }
}
```

A Minimal API endpoint can stay thin:
``` csharp
app.MapPost("/orders/{id:int}/submit", async (
    int id, SubmitOrder script, CancellationToken ct) =>
{
    await script.ExecuteAsync(id, ct);
    return Results.NoContent();
});
```

## Why It Works

Transaction Script is explicit, easy to locate, straightforward to test, and maps naturally to request/response applications. It is often an excellent choice for CRUD-heavy systems and integration-oriented applications.

## When It Starts to Hurt

The warning sign is duplication of business knowledge. If `SubmitOrder`, `CancelOrder`, `ShipOrder`, and `RefundOrder` each contain their own version of the same order-state rules, the domain is telling you that behavior may need a more natural owner.

## Transaction Script vs. Domain Model

A script might say:
``` csharp
if (order.Status != OrderStatus.Draft)
    throw new InvalidOperationException();

order.Status = OrderStatus.Submitted;
```

A Domain Model might say:
``` csharp
order.Submit();
```

The second is useful when `Submit` represents meaningful behavior whose rules must remain consistent wherever it is invoked.

## Testing

Transaction Scripts are often best tested at the application boundary. Persistence-heavy scripts benefit from integration tests against a realistic database rather than elaborate mocks of `DbContext`.

## When to Use It

Use Transaction Script when workflows are simple, rules are modest, operations are mostly independent, and procedural flow makes the application easier to understand.

## When Not to Use It

Consider Domain Model when invariants span multiple operations, state transitions become complicated, or the same business knowledge is repeatedly encoded in different scripts.

## Related Patterns

-   Domain Model
-   Service Layer
-   Table Data Gateway
-   Data Mapper

## Summary

Transaction Script optimizes for local simplicity. That is a feature, not a failure. Start with the complexity you actually have and refactor toward richer domain abstractions when the business rules demonstrate that you need them.
