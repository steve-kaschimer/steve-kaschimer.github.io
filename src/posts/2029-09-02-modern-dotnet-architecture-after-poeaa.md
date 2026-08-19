---
author: Steve Kaschimer
date: 2029-09-02
image: /images/posts/2029-09-02-hero.webp
image_alt: "A four-rung ladder glyph rising from a layered blueprint base, implying a new volume of ideas built directly on top of an established foundation."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal four-rung ladder glyph rising out of a faint amber layered blueprint base beneath it, implying a new body of ideas built directly on top of an established foundation rather than replacing it. Mood is continuous and additive. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Volume II begins where Patterns of Enterprise Application Architecture leaves off: the network, cloud, messaging, DDD, CQRS, resilience, and feature-oriented architecture changed the problems we routinely solve."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Modern .NET Architecture: What Changed After PoEAA?"
---



*Patterns of Enterprise Application Architecture* gave us a vocabulary
for enterprise software: Domain Model, Service Layer, Unit of Work, Data Mapper, Gateway, DTO, Value Object, and many more. Those patterns did not disappear. They became the foundation. A modern ASP.NET Core application using EF Core may already contain Data Mapper, Unit of Work, Identity Map, Gateway, DTO, Mapper, Value Object, and Service Layer ideas - even if nobody on the team uses those names. But enterprise software changed. We now routinely build systems where:
-   one business operation crosses process boundaries;
-   messages can be delivered more than once;
-   dependencies fail independently;
-   reads and writes have radically different requirements;
-   deployments scale horizontally;
-   services must be observable in production;
-   retries can make an outage worse;
-   one database transaction cannot protect the whole workflow.

That creates a new set of recurring architectural problems. This volume is about those problems.

## This Is Not a Replacement for Volume I

A useful way to think about the two volumes is:
``` text
Volume I
Object and application architecture
        |
        v
Domain Model
Service Layer
Data Mapper
Unit of Work
Gateway
DTO
Value Object
        |
        v
Volume II
Modern application and distributed architecture
```

Volume II builds on Volume I rather than superseding it. A Transactional Outbox still needs a transaction. An Anti-Corruption Layer often contains Gateways and Mappers. Clean Architecture depends heavily on dependency inversion and Separated Interface. CQRS frequently combines Transaction Script, Domain Model, Service Layer, DTO, and Query Object ideas. The old vocabulary remains useful because the new patterns are composed from smaller architectural ideas.

## The Architecture Complexity Ladder

The central principle of this volume is simple:
> Complexity should pull patterns into the architecture. Patterns should
> not push complexity into it.

Start with the smallest architecture that solves the actual problem.
``` text
CRUD
  |
  v
Transaction Script
  |
  v
Domain Model
  |
  v
Vertical Slices / CQRS
  |
  v
Domain Events
  |
  v
Integration Events
  |
  v
Outbox / Idempotency
  |
  v
Saga / Compensation
```

You do not earn architectural points for reaching the bottom. A system that needs only CRUD is better when it remains simple.

## Modern .NET Makes Simple Architecture Very Good

.NET 10, ASP.NET Core, EF Core, and C# 14 let us build a surprisingly capable application with very little machinery.
``` csharp
app.MapPost(
    "/orders",
    async (
        CreateOrderRequest request,
        OrdersDbContext db,
        CancellationToken cancellationToken) =>
    {
        var order = new Order
        {
            CustomerId = request.CustomerId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Orders.Add(order);

        await db.SaveChangesAsync(cancellationToken);

        return Results.Created(
            $"/orders/{order.Id}",
            new { order.Id });
    });
```

There is nothing inherently wrong with this. If the business rule is simple, the code should probably be simple too. Architecture becomes interesting when the forces acting on this code begin to change.

## Force #1: Business Complexity

Suppose creating an order now requires:
-   credit rules;
-   inventory constraints;
-   pricing policies;
-   promotions;
-   shipping restrictions;
-   approval limits.

The endpoint should not become the domain model. We may introduce:
``` text
Endpoint
   |
Application Use Case
   |
Aggregate
   |
Value Objects
```

Now DDD concepts begin earning their cost.

## Force #2: Different Read and Write Needs

A transactional model may be excellent for enforcing invariants but terrible for building a dashboard. That tension leads naturally toward CQRS:
``` text
              Application
             /                   Commands         Queries
           |                |
     Domain Model       Projection
           |                |
           +---- Data ------+
```

CQRS begins as separation of responsibility. It does not begin with two databases.

## Force #3: The Network

Once an operation crosses a network boundary, new facts become unavoidable:
``` text
The network can fail.
The response can be lost.
The request may have succeeded anyway.
The caller may retry.
The retry may duplicate the operation.
```

Now Gateway is not enough. We need to reason about:
-   timeouts;
-   retry;
-   circuit breakers;
-   idempotency;
-   observability.

## Force #4: Multiple Transactions

Suppose placing an order requires:
``` text
Order Database
Payment Provider
Inventory Service
Shipping Service
```

There is no single EF Core transaction around all four. Now we enter distributed systems. Patterns such as:
-   Transactional Outbox;
-   Idempotent Consumer;
-   Saga;
-   Compensating Transaction;

exist because the guarantees we enjoyed inside one database transaction no longer apply.

## Force #5: Independent Scale

A queue lets producers and consumers operate at different rates:
``` text
Producer
   |
   v
 Queue
   |
   +----> Consumer
   +----> Consumer
   +----> Consumer
```

That creates opportunities for Queue-Based Load Leveling and Competing Consumers. It also creates duplicate delivery, ordering, poison-message, and observability problems. Every architectural capability has a cost.

## Architecture Styles Are Not Patterns

Modern architecture discussions often mix several kinds of ideas:
``` text
Clean Architecture       architecture style
Vertical Slice           organization strategy
DDD                      design approach
CQRS                     architectural pattern
Outbox                   reliability pattern
Retry                    resilience pattern
Dependency Injection     design technique
```

That is fine in ordinary conversation, but this volume will be precise about what each idea actually changes. The question is never:
> Which architecture is best?

The useful question is:
> Which problem are we solving, and what new trade-offs does this
> solution introduce?

## The Modern .NET Toolbox

We will work through several layers of the toolbox.

### Application structure

-   Dependency Injection
-   Clean Architecture
-   Hexagonal Architecture
-   Vertical Slice Architecture
-   Mediator

### Domain modeling

-   Entity
-   Aggregate
-   Domain Service
-   Domain Event
-   Specification
-   Anti-Corruption Layer

### Commands and queries

-   Command
-   Query
-   CQRS
-   Result
-   Idempotency

### Messaging

-   Publish/Subscribe
-   Competing Consumers
-   Transactional Outbox
-   Inbox / Idempotent Consumer
-   Dead Letter Queue
-   Queue-Based Load Leveling
-   Event Sourcing

### Distributed workflows

-   Saga
-   Compensating Transaction
-   Backend for Frontend
-   API Gateway

### Resilience

-   Retry
-   Circuit Breaker
-   Bulkhead
-   Cache-Aside

And we will add patterns when the journey reveals a gap rather than forcing the catalog to remain artificially fixed.

## Production Is Part of Architecture

Volume I could often demonstrate a pattern inside one process. Volume II cannot stop there. For each pattern we will ask:
``` text
How does it fail?
How do we observe it?
How do we test it?
How does it behave under concurrency?
What happens during deployment?
What happens when a dependency is unavailable?
What does retry do?
What happens twice?
```

That means production concerns such as OpenTelemetry, structured logging, health checks, cancellation, resilience, and failure recovery will appear throughout the series.

## The Rule for Every Pattern

Every article will answer two equally important questions:
> When should I use this?

and:
> When should I absolutely not use this?

A pattern is not a badge of architectural maturity. It is a trade. You accept additional structure or operational complexity in exchange for solving a specific recurring problem. If you do not have the problem, you should probably decline the trade.

## Where We Start

We begin with the most important architectural skill of all:
**recognizing how much architecture the problem deserves.**

Before Clean Architecture, DDD, CQRS, messaging, or microservices, we need a way to distinguish useful structure from accidental complexity. That is the subject of the next article.
