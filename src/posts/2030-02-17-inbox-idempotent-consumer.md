---
author: Steve Kaschimer
date: 2030-02-17
image: /images/posts/2030-02-17-hero.webp
image_alt: "An inbox tray glyph holding one item stamped processed, with a duplicate copy fading beside it, ignored."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal inbox-tray glyph holding one solid amber item stamped with a small checkmark, beside which a faint duplicate outline of the same item fades into the background, implying a repeated delivery recognized and safely ignored. Mood is tolerant and safe. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Detect and safely ignore duplicate message deliveries by persisting consumed message identity with business effects in one local transaction."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Inbox and Idempotent Consumer: Making Duplicate Messages Harmless"
---



Transactional Outbox deliberately accepts at-least-once publication. Brokers may also redeliver messages. Therefore consumers must assume:
> The same logical message can arrive more than once.

Inbox / Idempotent Consumer makes that safe.

## The Duplicate Delivery Problem

```text
Broker sends Message 42
Consumer processes it
Database commits
ACK is lost
Broker sends Message 42 again
```

If the handler is:
```csharp
account.Credit(100m);
```

the customer may receive $200. The broker did not malfunction. The consumer was not idempotent.

## Inbox Table

Persist processed message IDs:
```text
InboxMessages
-------------------------------
MessageId   UNIQUE
ProcessedAt
Handler
```

Before processing:
```text
Has MessageId already committed?
```

If yes, skip.

## The Atomicity Requirement

This is not enough:
```text
check inbox
perform business change
commit business change
write inbox
```

A crash between the two commits can repeat the effect. Instead:
```text
BEGIN TRANSACTION

INSERT Inbox(MessageId)
perform business changes

COMMIT
```

The deduplication marker and business effect commit together.

## EF Core Shape

```csharp
await using var transaction =
    await db.Database.BeginTransactionAsync(
        cancellationToken);

if (await db.InboxMessages.AnyAsync(
    x => x.MessageId == message.Id,
    cancellationToken))
{
    return;
}

var order = await db.Orders
    .SingleAsync(
        x => x.Id == message.OrderId,
        cancellationToken);

order.MarkPaymentAuthorized(
    message.PaymentId);

db.InboxMessages.Add(
    InboxMessage.Processed(
        message.Id,
        timeProvider.GetUtcNow()));

await db.SaveChangesAsync(cancellationToken);

await transaction.CommitAsync(
    cancellationToken);
```

Production code should rely on a unique constraint too, because concurrent duplicate deliveries can race.

## Unique Constraint as Final Arbiter

Two consumers can both observe:
```text
message not yet processed
```

A unique constraint on `MessageId` ensures only one transaction can commit the inbox marker. Treat the database as the concurrency arbiter.

## Idempotency by Business Identity

Sometimes you do not need a generic Inbox table. If the business operation has natural identity:
```text
PaymentId
ShipmentId
ReservationId
```

the domain/database can enforce uniqueness directly. For example:
```text
OrderPayments.PaymentId UNIQUE
```

A duplicate message attempting to apply the same payment becomes harmless. This is often stronger than purely technical message deduplication.

## Inbox Retention

Can processed IDs be deleted? Eventually, maybe. But once an ID is deleted, an old redelivery can be processed again. Choose retention based on broker replay windows, business risk, and archival behavior. For high-value operations, long-lived business uniqueness may be better than short-lived technical dedupe.

## Message Identity vs. Correlation

Do not deduplicate by correlation ID. One business workflow may legitimately contain many messages sharing the same correlation ID. Use:
```text
MessageId
```

for delivery identity. Use:
```text
CorrelationId
```

for tracing the broader workflow.

## Side Effects Outside the Database

Suppose the consumer:
```text
writes DB
sends email
```

The Inbox transaction can protect the DB effect. It cannot atomically protect an external email provider. Options include:
- make email naturally idempotent;
- use a separate Outbox for the email command/event;
- store a durable send record.

Reliable consumers often combine Inbox and Outbox:
```text
Consume message
   |
BEGIN DB transaction
   |
Inbox marker
Business change
Outbox message
   |
COMMIT
```

This is an extremely powerful pattern composition.

## Poison Messages

Idempotency does not solve permanent failure. If a valid-but-unprocessable message fails every attempt, it may need dead-letter handling. That is the next topic.

## Observability

Track:
```text
duplicate messages skipped
inbox insert conflicts
processing latency
failed processing
oldest unprocessed message
replay events
```

A spike in duplicates may indicate broker retries, worker crashes, or acknowledgement problems.

## Testing

Test:
```text
same MessageId twice -> one effect
two concurrent duplicates -> one effect
business failure -> inbox marker not committed
success + outbox side effect -> both commit
```

Use a real database for concurrency tests.

## When It Helps

Use Inbox / Idempotent Consumer when:
- delivery is at least once;
- duplicate effects are harmful;
- consumers update local durable state;
- message replay is possible.

## When It Hurts

Do not create a giant dedupe subsystem when operations are naturally idempotent already. Prefer business uniqueness where available.

## Summary

At-least-once delivery moves responsibility to the consumer: duplicates must be safe. Persist message identity in the same local transaction as the business effect, enforce uniqueness atomically, and prefer business-level identities when they provide stronger guarantees. Outbox prevents message loss. Inbox prevents duplicate effects.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
