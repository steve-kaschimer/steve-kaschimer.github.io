---
category: Domain-Driven Design
csharp: 14
description: Model meaningful facts that have already happened inside a
  bounded context, defer their dispatch safely, and distinguish domain
  events from durable integration messages.
dotnet: 10
order: 14
series: Modern Application Architecture Patterns in .NET
slug: domain-events
status: draft
title: "Domain Events: Making Business Consequences Explicit"
volume: 2
---

# Domain Events: Making Business Consequences Explicit

Something happened.

The business cares.

Other behavior should react.

That is the natural territory of a Domain Event.

``` csharp
public sealed record OrderPlaced(
    OrderId OrderId,
    CustomerId CustomerId,
    Money Total);
```

The tense matters.

It is `OrderPlaced`, not `PlaceOrder`.

An event is a fact.

## The Hidden Side Effect Problem

Imagine:

``` csharp
public async Task PlaceOrderAsync(...)
{
    // create order
    // save order
    // update loyalty
    // create fulfillment work
    // send internal notification
    // update sales statistics
}
```

One use case gradually becomes the place where every consequence is
wired together.

The business rule:

> When an order is placed, update loyalty status.

exists only as procedural glue.

Domain Events make that relationship explicit.

## Raise the Fact in the Domain

The aggregate knows what happened:

``` csharp
public void Place()
{
    if (Status != OrderStatus.Draft)
        throw new DomainException(...);

    Status = OrderStatus.Placed;

    AddDomainEvent(
        new OrderPlaced(
            Id,
            CustomerId,
            Total));
}
```

The aggregate records the fact.

It does not need to know every reaction.

## Deferred Dispatch

Avoid immediately invoking arbitrary handlers from inside the aggregate.

Instead, collect events:

``` csharp
private readonly List<IDomainEvent>
    _domainEvents = [];

public IReadOnlyCollection<IDomainEvent>
    DomainEvents => _domainEvents;

protected void AddDomainEvent(
    IDomainEvent domainEvent)
    => _domainEvents.Add(domainEvent);
```

The application can dispatch them around the Unit of Work boundary.

This keeps domain behavior testable and makes transaction semantics
explicit.

## Before or After Commit?

This is a real architectural decision.

### Dispatch before commit

``` text
Change aggregate
Raise event
Handle event
Save everything
Commit
```

Handlers can participate in the same transaction.

Failure can roll back the whole operation.

But the transaction may grow and handlers become part of the command's
consistency boundary.

### Dispatch after commit

``` text
Change aggregate
Save
Commit
Dispatch event
```

The original aggregate is committed first.

Now handler failure cannot roll back the original change.

That may require eventual consistency or durable messaging.

Neither option is universally correct.

The business consistency requirement decides.

## Domain Event vs. Integration Event

This distinction is critical.

``` text
DOMAIN EVENT
OrderPlaced
   |
same bounded context
usually in-process
   |
loyalty / policy / local reaction
```

versus:

``` text
INTEGRATION EVENT
OrderPlacedIntegrationEvent
   |
durable broker
crosses process/bounded-context boundary
   |
Fulfillment Service
Analytics Service
```

A domain event is not automatically a message on a broker.

## Why Not Publish the Domain Event Directly?

Because internal domain representation and external contracts have
different reasons to change.

A handler can translate:

``` text
Domain Event
    |
    v
Integration Event
```

The integration contract can be versioned and stabilized independently.

Later, Transactional Outbox will make that publication reliable.

## Events Should Carry Useful Facts

Avoid events that merely expose implementation mechanics:

``` text
OrderRowInserted
OrderEntityModified
```

Prefer domain language:

``` text
OrderPlaced
PaymentAuthorized
ShipmentDispatched
CustomerQualifiedForPreferredStatus
```

A domain expert should recognize the occurrence.

## Events Are Immutable Facts

Records are a natural representation:

``` csharp
public sealed record PaymentAuthorized(
    PaymentId PaymentId,
    OrderId OrderId,
    Money Amount,
    DateTimeOffset OccurredAt)
    : IDomainEvent;
```

Once something happened, the historical fact should not be mutated.

## Handler Responsibilities

A handler may coordinate a reaction:

``` csharp
public sealed class UpdateLoyaltyWhenOrderPlaced(
    ICustomerRepository customers)
{
    public async Task HandleAsync(
        OrderPlaced domainEvent,
        CancellationToken cancellationToken)
    {
        // Load customer aggregate and apply rule.
    }
}
```

Handlers belong naturally in the application layer when they need
repositories or infrastructure abstractions.

## Avoid Event Spaghetti

Domain Events introduce indirection.

If:

``` text
A -> event -> B
B -> event -> C
C -> event -> D
```

understanding one command may require exploring a hidden graph.

Use events when decoupled reactions are genuinely valuable.

Use direct calls when the behavior is one obvious synchronous operation.

## Failure Semantics

An in-process event dispatcher is not durable.

If the process crashes after commit but before dispatch:

``` text
Database commit ✓
Domain event handling ✗
```

the reaction may be lost.

If that reaction must survive crashes, we need a durable mechanism.

That is where Integration Events + Transactional Outbox enter the story.

## Domain Events and Aggregates

Events are especially useful across aggregate boundaries.

Inside one aggregate, direct method calls normally keep behavior
clearer.

Across aggregates, events can express:

> this fact occurred; interested domain/application behavior may react.

## Testing the Aggregate

A domain test can assert both state and fact:

``` csharp
order.Place();

Assert.Equal(
    OrderStatus.Placed,
    order.Status);

Assert.Contains(
    order.DomainEvents,
    x => x is OrderPlaced);
```

Handler tests then verify reactions separately.

## Observability

Do not confuse domain events with telemetry events.

A domain event represents business meaning.

A trace span or log entry represents operational observation.

You may instrument domain-event dispatch, but the concepts should remain
distinct.

## When It Helps

Domain Events help when:

-   one domain occurrence has multiple reactions;
-   cross-aggregate consequences need explicit modeling;
-   you want business side effects to be discoverable;
-   the number of reactions may evolve independently.

## When It Hurts

Avoid them when:

-   one method call communicates the workflow better;
-   events are used to hide ordinary control flow;
-   teams assume in-memory dispatch is durable;
-   every property change becomes an event.

## How It Relates to Fowler

Domain Events build naturally on Domain Model, Unit of Work, Service
Layer, and Observer-style ideas.

They become the bridge from our object-oriented architecture into the
messaging patterns later in Volume II.

## Summary

A Domain Event is a meaningful fact that has already happened inside the
domain.

The aggregate records the fact.

Application handlers coordinate reactions.

And when that fact must cross a process boundary reliably, we will
deliberately transform it into a durable integration message rather than
pretending an in-process event dispatcher is a message broker.
