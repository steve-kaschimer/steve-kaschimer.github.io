---
author: Steve Kaschimer
date: 2030-02-10
image: /images/posts/2030-02-10-hero.webp
image_alt: "A sealed box glyph positioned directly beside a ledger entry mark, both stamped together in one motion."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small sealed amber box glyph positioned directly beside a teal ledger-entry mark, both enclosed by one shared off-white stamp outline, implying a business change and its outbound message committed together in one atomic step. Mood is atomic and reliable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Persist integration messages in the same local transaction as business state, then publish them asynchronously with at-least-once delivery and observable retry semantics."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Transactional Outbox: Making Database Changes and Events Reliable"
---

One of the most dangerous distributed-system bugs fits in six lines:

```csharp
db.Orders.Add(order);

await db.SaveChangesAsync(cancellationToken);

await messageBus.PublishAsync(
    new OrderPlacedIntegrationEvent(...),
    cancellationToken);
```

The database write and message publish are two independent operations.

## The Dual-Write Problem

Failure scenario A:

```text
DB commit succeeds
Message publish fails
```

The order exists.

Nobody hears about it.

Failure scenario B:

```text
Message publish succeeds
DB commit fails
```

Consumers react to an order that does not exist.

A local database transaction cannot atomically commit both a relational database and an external broker.

## The Outbox Idea

Write the business state and outbound message into the same database transaction.

```text
BEGIN TRANSACTION

INSERT Order

INSERT OutboxMessage

COMMIT
```

Then a separate dispatcher publishes Outbox rows to the broker.

## Outbox Table

Conceptually:

```text
OutboxMessages
--------------------------------
Id
OccurredAt
Type
Payload
PublishedAt
AttemptCount
LastError
```

The important fact is that the Outbox row is persisted atomically with the business change.

## EF Core Example

```csharp
order.Place();

db.Orders.Add(order);

db.OutboxMessages.Add(
    OutboxMessage.Create(
        new OrderPlacedIntegrationEvent(
            Guid.NewGuid(),
            order.Id.Value,
            order.CustomerId.Value,
            order.Total.Amount,
            order.Total.Currency.Code,
            timeProvider.GetUtcNow())));

await db.SaveChangesAsync(cancellationToken);
```

EF Core commits both rows together.

No broker call occurs inside the transaction.

## Dispatcher

A background process polls unpublished rows:

```text
SELECT pending outbox rows
       |
publish
       |
mark published
```

Example shape:

```csharp
public sealed class OutboxPublisher(
    OrdersDbContext db,
    IMessageBus bus)
{
    public async Task PublishBatchAsync(
        CancellationToken cancellationToken)
    {
        var messages = await db.OutboxMessages
            .Where(x => x.PublishedAt == null)
            .OrderBy(x => x.OccurredAt)
            .Take(100)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            await bus.PublishAsync(
                message.ToEnvelope(),
                cancellationToken);

            message.MarkPublished(
                DateTimeOffset.UtcNow);
        }

        await db.SaveChangesAsync(cancellationToken);
    }
}
```

This is simplified.

Production implementations need stronger concurrency and retry handling.

## At-Least-Once Publication

A subtle failure remains:

```text
publish succeeds
dispatcher crashes
before marking row published
```

On restart, the same message may publish again.

Therefore Outbox usually provides:

```text
at-least-once publication
```

not magical exactly-once delivery.

Consumers must be idempotent.

## Why Not Mark Published First?

If we mark before publishing:

```text
mark published
crash
message never sent
```

We traded duplication for message loss.

For most business integrations, duplicate-tolerant at-least-once delivery is safer.

## Polling Concurrency

Multiple dispatcher instances may run simultaneously.

Avoid having all of them publish the same row at once.

Strategies include:

- row locking;
- skip-locked reads;
- leasing;
- status transitions;
- partitioning.

The exact solution is database-specific.

## Ordering

If event order matters for one aggregate:

```text
OrderCreated
OrderPaid
OrderShipped
```

the dispatcher and broker must preserve the required ordering boundary.

A common approach is to publish with an aggregate/order ID as partition or session key.

Do not assume table order equals distributed processing order.

## Outbox Payload

Options include storing:

```text
serialized integration event
```

or:

```text
event type + structured columns + payload
```

Store enough information to publish independently of the original aggregate.

The dispatcher should not need to reload domain state to recreate the event later.

## Event Creation Timing

An important sequence:

```text
domain changes
domain event raised
application translates to integration event
outbox row stored
same commit
```

The integration event should represent committed intent, but publication can occur later.

## Cleanup

Outbox tables grow forever unless cleaned.

Use retention:

```text
delete published rows older than N days
archive if audit requirements exist
```

Do cleanup in batches to avoid giant delete transactions.

## Observability

Measure:

```text
pending outbox count
oldest pending age
publish attempts
publish failures
dispatcher throughput
duplicate publication rate
```

The most important metric is often **oldest unpublished message age**.

A dispatcher that is quietly stuck is an integration outage.

## Transactions and External Calls

Do not keep the database transaction open while calling the broker.

That defeats the pattern and increases lock duration.

The whole point is:

```text
commit locally first
publish asynchronously later
```

## Outbox and CQRS

With separate read stores:

```text
Write DB
  |
Outbox
  |
Broker
  |
Projection
  |
Read DB
```

Outbox provides the reliable bridge.

This is why CQRS often leads to Outbox once read/write stores separate.

## Testing

Important tests:

```text
business row and outbox row commit together
rollback removes both
dispatcher publishes pending row
publisher crash can cause duplicate but not loss
duplicate message is safe downstream
cleanup removes only old published rows
```

## When It Helps

Use Transactional Outbox when:

- business state and message publication must not diverge;
- one local database transaction cannot include the broker;
- asynchronous integration is important;
- message loss would be harmful.

## When It Hurts

It adds:

- storage;
- polling/CDC machinery;
- duplicate delivery;
- cleanup;
- monitoring;
- operational latency.

Do not add it when there is no dual-write problem.

## Summary

Transactional Outbox solves one specific reliability gap:

```text
database commit
+
message publication
```

cannot usually be one distributed atomic transaction.

Persist the outbound message with the business state, publish it later, and accept at-least-once delivery explicitly.

Outbox gives you reliable publication.

Idempotent Consumer gives you safe reception.
