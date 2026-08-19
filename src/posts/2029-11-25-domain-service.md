---
author: Steve Kaschimer
date: 2029-11-25
image: /images/posts/2029-11-25-hero.webp
image_alt: "Two separate entity shapes connected only through a small intermediary node positioned between them."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two distinct teal entity shapes positioned apart, each connected by a thin line to one small amber intermediary node placed exactly between them, implying an operation that belongs to neither shape alone. Mood is mediating and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Model domain operations that require domain knowledge but do not naturally belong to one entity or value object, without turning services into an anemic-domain dumping ground."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Domain Service: Behavior That Doesn't Belong to an Entity"
---



Domain behavior should usually live with the state it governs. But sometimes an important business operation does not naturally belong to one Entity or Value Object. That is where a Domain Service can help.

## The Smell That Comes First

Suppose transferring money requires two accounts:
``` text
Source Account
Destination Account
Transfer Policy
```

Putting the whole operation on the source account feels wrong. Putting it on the destination feels equally wrong. The operation is meaningful to the domain but not naturally owned by either entity.

## A Domain Service

``` csharp
public sealed class FundsTransferService
{
    public TransferResult Transfer(
        Account source,
        Account destination,
        Money amount)
    {
        if (source.Currency != destination.Currency)
            return TransferResult.Rejected(
                "Currencies must match.");

        source.Withdraw(amount);
        destination.Deposit(amount);

        return TransferResult.Success();
    }
}
```

The service contains domain logic. It works with domain objects. It does not know about HTTP, EF Core, logging, or message brokers.

## Domain Service vs. Application Service

This distinction matters. Application Service:
``` text
Load account
Load destination
Call domain behavior
Save transaction
Publish consequences
```

Domain Service:
``` text
Decide whether/how the transfer is valid
```

The application service orchestrates. The domain service models business meaning.

## Do Not Move Entity Behavior Out

This is an anemic design:
``` csharp
public sealed class OrderService
{
    public void Cancel(Order order)
    {
        if (order.Status == ...)
            order.Status = ...;
    }
}
```

If cancellation depends only on Order's own state, it belongs on Order:
``` csharp
order.Cancel();
```

A Domain Service is not a place to put logic because methods on entities feel impure.

## Stateless by Default

Domain services are commonly stateless:
``` csharp
public sealed class PricingPolicy
{
    public Money Calculate(
        CustomerSegment segment,
        Cart cart)
    {
        // ...
    }
}
```

Dependencies can themselves be domain abstractions when necessary. But be cautious if the service starts needing:
``` text
DbContext
HttpClient
ILogger
IMessageBus
```

You may have crossed into application or infrastructure concerns.

## External Information

Sometimes a domain decision needs external information. For example:
``` text
Can this currency conversion occur?
```

A domain abstraction might provide rates:
``` csharp
public interface IExchangeRateProvider
{
    ExchangeRate Get(
        Currency from,
        Currency to);
}
```

But if retrieving that rate requires async HTTP and retry policies, a cleaner application flow may fetch the information first and pass a domain value into the domain service. Keep network behavior out of the model where practical.

## Naming Matters

Avoid generic names:
``` text
OrderDomainService
CustomerDomainService
```

Prefer domain language:
``` text
PricingPolicy
FundsTransferService
EligibilityPolicy
AllocationService
```

The name should tell a domain expert what the service does.

## Policy Objects

Many "domain services" are really policies.
``` csharp
public sealed class RefundEligibilityPolicy
{
    public bool CanRefund(
        Order order,
        DateTimeOffset now)
    {
        // ...
    }
}
```

That is useful because the business concept itself has a name.

## Testing

Domain service tests should need no application host.
``` csharp
var result = policy.CanRefund(
    order,
    now);

Assert.True(result);
```

If every test needs a database and web server, the service probably contains more than domain logic.

## When It Helps

Use a Domain Service when:
-   the operation is part of the ubiquitous language;
-   it contains meaningful business rules;
-   it involves several domain objects;
-   no single entity/value object naturally owns it.

## When It Hurts

It hurts when it becomes:
``` text
OrderService
  4,000 lines
  all order behavior
```

That is often an anemic domain disguised as DDD.

## How It Relates to Fowler

Fowler's Service Layer organizes application operations. Domain Service operates **inside** the domain model. The names sound similar; their responsibilities are different.

## Summary

Start by putting behavior on the Entity or Value Object that owns it. When an important domain operation genuinely spans concepts and has no natural owner, give that operation a domain name and model it as a Domain Service. Do not use Domain Service as an escape hatch from object-oriented domain modeling.
