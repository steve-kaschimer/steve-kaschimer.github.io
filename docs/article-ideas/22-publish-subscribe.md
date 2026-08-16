---
title: "Publish/Subscribe: Decoupling Producers From Reactions"
slug: "publish-subscribe"
description: "Use publish/subscribe to decouple producers from multiple independent consumers, and understand delivery, ordering, durability, and contract-versioning implications in modern .NET systems."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Messaging & Event-Driven Architecture"
order: 22
dotnet: "10"
csharp: "14"
status: "draft"
---

# Publish/Subscribe: Decoupling Producers From Reactions

Publish/Subscribe lets one producer announce that something happened without knowing every consumer that cares.

```text
OrderPlaced
   |
   +--> Fulfillment
   +--> Analytics
   +--> Loyalty
```

That is very different from:

```text
PlaceOrder()
  |
  +--> Call Fulfillment
  +--> Call Analytics
  +--> Call Loyalty
```

The producer no longer owns the reaction graph.

## The Problem

Direct calls create temporal coupling.

If Loyalty is unavailable, should placing the order fail?

If Analytics is slow, should the customer wait?

If three more consumers are added, should Ordering change every time?

Publish/Subscribe reduces that coupling.

## Topic-Oriented Model

A broker usually introduces a topic or event stream:

```text
Publisher
   |
   v
OrderPlaced topic
   |
   +--> Subscription A
   +--> Subscription B
   +--> Subscription C
```

Each subscription can receive its own copy.

This is not the same as one queue with multiple competing workers. We will cover that next.

## Event Contract

Use explicit integration contracts:

```csharp
public sealed record OrderPlacedIntegrationEvent(
    Guid EventId,
    Guid OrderId,
    Guid CustomerId,
    decimal Total,
    string Currency,
    DateTimeOffset OccurredAt);
```

The contract is part of the distributed boundary.

Treat it more like a public API than an internal class.

## Domain Event vs. Integration Event

Recall:

```text
Domain Event
  internal model fact
  same bounded context
  may be in-process

Integration Event
  stable distributed contract
  crosses boundary
  requires durable delivery semantics
```

Do not publish internal domain objects directly to the broker.

## Fan-Out

Publish/Subscribe is valuable when multiple consumers react independently.

```text
OrderPlaced
  |
  +--> send receipt
  +--> reserve fulfillment work
  +--> update analytics
```

Each consumer can evolve separately.

That is the main architectural win.

## Delivery Is Not Magic

A broker can improve reliability.

It does not create exactly-once business behavior automatically.

Common delivery models include:

```text
at-most-once
at-least-once
```

At-least-once means duplicates are possible.

Consumers must be idempotent when duplicate effects matter.

## Ordering

Do not assume global ordering.

Many brokers preserve order only within:

```text
partition
session
key
```

If order matters, define the ordering boundary explicitly.

For example:

```text
all events for Order 42
```

may use the same partition key.

## Event Evolution

Contracts live longer than internal code.

Prefer additive evolution:

```json
{
  "eventId": "...",
  "orderId": "...",
  "total": 100,
  "currency": "USD",
  "salesChannel": "web"
}
```

Adding optional data is often safer than renaming fields or changing meanings.

## Consumer Independence

A powerful property:

```text
Ordering does not know who subscribes.
```

That means adding Analytics should not require redeploying Ordering.

But it also means producers cannot rely on synchronous consumer completion.

If the order must not commit unless inventory reservation succeeds, publish/subscribe may not be the right coordination model for that decision.

## Events vs. Commands

Event:

```text
OrderPlaced
```

Command:

```text
ReserveInventory
```

The event says:

> this happened; interested parties may react.

The command says:

> this receiver is requested to do something.

Conflating the two creates ambiguous ownership.

## Error Handling

A subscriber can fail independently.

That is a feature and a responsibility.

You need:

- retry policy;
- dead-letter handling;
- monitoring;
- replay strategy;
- idempotency.

Once you publish asynchronously, failure handling becomes part of architecture.

## Observability

Track:

```text
publish count
publish latency
subscription lag
consumer failures
dead-letter count
duplicate detection
processing latency
```

Distributed tracing should carry correlation information across the message boundary.

## Testing

Test:

```text
publisher emits correct contract
consumer accepts contract
duplicate event is safe
unknown/new fields do not break consumer
failure routes correctly
```

Contract tests are especially important for independently deployed publishers and subscribers.

## When It Helps

Use Publish/Subscribe when:

- one fact has multiple independent reactions;
- producers should not know consumers;
- asynchronous processing is acceptable;
- consumer lifecycles differ.

## When It Hurts

It hurts when:

- you need immediate synchronous consistency;
- event graphs become impossible to follow;
- teams publish vague events for every internal state change;
- consumers are not idempotent;
- operational monitoring is weak.

## Summary

Publish/Subscribe replaces direct reaction coupling with a distributed event contract.

The trade is substantial:

you gain decoupling and independent evolution, while accepting asynchronous failure, duplication, ordering, contract evolution, and operational complexity.
