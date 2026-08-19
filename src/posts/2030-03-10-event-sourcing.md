---
author: Steve Kaschimer
date: 2030-03-10
image: /images/posts/2030-03-10-hero.webp
image_alt: "A horizontal sequence of small marks forming a timeline, with a single reconstructed shape assembling at its end."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal row of five small amber marks forming a timeline left to right, with one solid teal shape assembling out of faint ghost fragments at the row's right end, implying current state built by replaying a history of facts. Mood is historical and reconstructive. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Persist domain changes as an append-only stream of events, rebuild state through replay, and understand projections, snapshots, schema evolution, concurrency, and why most systems should not adopt Event Sourcing casually."
tags: ["dotnet", "architecture", "design-patterns", "event-sourcing"]
title: "Event Sourcing: Persisting Facts Instead of Current State"
---



Most applications persist current state.
```text
Orders
----------------
Id
Status = Shipped
Total = 125.00
```

Event Sourcing persists the sequence of facts that produced that state.
```text
OrderCreated
ItemAdded
PaymentAuthorized
OrderConfirmed
OrderShipped
```

Current state becomes a projection of history. This is a profound architectural shift.

## State-Based Persistence

Traditional persistence says:
```text
What is true now?
```

Event Sourcing says:
```text
What happened?
```

The event stream is the source of truth.

## Aggregate Stream

For one aggregate:
```text
Order-42

1 OrderCreated
2 ItemAdded
3 ItemAdded
4 PaymentAuthorized
5 OrderPlaced
```

Replaying the stream reconstructs Order 42.

## Event-Sourced Aggregate

```csharp
public sealed class Order
{
    public OrderStatus Status { get; private set; }

    public void Place()
    {
        if (Status != OrderStatus.Draft)
            throw new DomainException(...);

        Raise(new OrderPlaced(...));
    }

    private void Apply(OrderPlaced @event)
    {
        Status = OrderStatus.Placed;
    }
}
```

The important distinction:
```text
Raise event
then apply event
```

All state changes occur through event application.

## Rehydration

```csharp
public static Order Rehydrate(
    IEnumerable<IDomainEvent> events)
{
    var order = new Order();

    foreach (var @event in events)
    {
        order.Apply(@event);
    }

    return order;
}
```

The aggregate can be rebuilt from its history.

## Append-Only Store

The event store writes:
```text
StreamId
Version
EventId
EventType
Payload
OccurredAt
Metadata
```

Events are appended. Existing events are not normally updated.

## Optimistic Concurrency

Suppose the stream version is 7. Client A and B both load version 7. A appends version 8. B tries to append with expected version 7. The store rejects it. Event streams therefore provide a natural optimistic concurrency boundary.

## CQRS Partnership

Event Sourcing and CQRS often pair well:
```text
Event Store
   |
   +--> Order Summary Projection
   +--> Finance Projection
   +--> Search Projection
```

Write-side events feed specialized read models. But:
```text
CQRS does not require Event Sourcing.
Event Sourcing does not require separate read databases.
```

Keep the patterns conceptually separate.

## Projection

A projection transforms event history into queryable state.
```csharp
public Task HandleAsync(
    OrderPlaced @event)
{
    // update OrderSummary row
}
```

Projections are disposable if they can be rebuilt from the event log. That can be powerful. It also means projection rebuilds must be operationally feasible.

## Eventual Consistency

Read models often lag behind newly appended events.
```text
append event ✓
projection update pending
query returns old value
```

This is a product and UX concern, not just implementation detail.

## Snapshots

Long streams can be expensive to replay. A snapshot stores:
```text
state at version 10,000
```

Then rehydration loads:
```text
snapshot
+ events 10,001 onward
```

Snapshots are optimization. The event stream remains the authoritative history.

## Event Schema Evolution

Events live forever. That means today's code may need to read events written years ago. Options include:
- upcasters;
- tolerant readers;
- versioned event types;
- migration.

This is one of Event Sourcing's largest long-term costs.

## Never Rewrite History Casually

If an event contains incorrect business data, replacing history can destroy audit meaning. Often the right approach is a compensating/corrective event:
```text
CustomerAddressCorrected
```

not editing the original fact. Regulatory or privacy requirements may complicate this and require special treatment.

## Event Sourcing Is Not Audit Logging

An audit log says:
```text
who changed what
```

Event Sourcing says:
```text
domain state is derived from this event stream
```

You can have audit logging without Event Sourcing. Most systems should.

## Event Sourcing Is Not "Use Kafka"

Kafka can store event streams. That does not automatically make your domain event-sourced. Event Sourcing is about the persistence model of domain state.

## Benefits

Event Sourcing can provide:
- complete business history;
- temporal queries;
- new projections from old events;
- explicit behavior transitions;
- strong auditability;
- natural optimistic concurrency.

## Costs

It also introduces:
- event schema evolution;
- projection infrastructure;
- eventual consistency;
- replay operations;
- debugging complexity;
- tooling requirements;
- irreversible contract mistakes.

These costs are substantial.

## Good Fits

Event Sourcing shines in domains where history itself is valuable:
```text
financial ledger
trading
workflow history
inventory movements
audit-heavy systems
complex temporal rules
```

## Poor Fits

A settings screen where users edit:
```text
DisplayName
Theme
PageSize
```

probably does not need an immutable event log and projection infrastructure. Do not confuse architectural sophistication with suitability.

## Testing

Event-sourced aggregates are beautifully testable:
```text
Given:
  OrderCreated
  ItemAdded

When:
  PlaceOrder

Then:
  OrderPlaced
```

The test describes behavior as history -> command -> new facts. Also test projection rebuilds and event compatibility.

## Observability

Monitor:
```text
append failures
stream conflicts
projection lag
projection failures
rebuild progress
unknown event types
```

Projection lag should have SLOs if user-facing freshness matters.

## When It Helps

Use Event Sourcing when:
- business history is first-class;
- temporal reconstruction matters;
- multiple projections provide major value;
- append-only semantics fit the domain;
- the team can operate the infrastructure.

## When It Hurts

It hurts when adopted because:
```text
"events are modern"
```

or:
```text
"we might need audit later"
```

The complexity is too high for speculative benefit.

## Summary

Event Sourcing makes historical facts the source of truth. That unlocks remarkable capabilities: replay, temporal reasoning, new projections, and auditability. It also makes event contracts, projection infrastructure, eventual consistency, and operational tooling part of your permanent architecture. Use it when history is part of the domain, not merely because events are fashionable.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
