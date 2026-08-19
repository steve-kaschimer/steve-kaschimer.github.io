---
author: Steve Kaschimer
date: 2029-09-16
image: /images/posts/2029-09-16-hero.webp
image_alt: "A vertical ladder of eight rungs, the lower rungs bold and solid and the upper rungs progressively fainter toward the top."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single vertical teal ladder glyph of eight rungs, the bottom three rungs rendered bold and solid amber and each rung above progressively fainter until the top rung is a barely visible outline, implying escalating cost the higher a design climbs. Mood is cautionary and measured. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Learn when a .NET application has earned additional architecture, from straightforward CRUD through domain modeling, CQRS, messaging, and distributed workflows."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "The Architecture Complexity Ladder"
---



The most expensive architecture is not always the most sophisticated one. It is the architecture that solves problems you do not have. This article gives us a ladder for deciding when a .NET application has earned additional structure.

## Level 0: CRUD

Start here when the application primarily stores and retrieves data.
``` text
HTTP
 |
Endpoint
 |
EF Core
 |
Database
```

A Minimal API endpoint plus EF Core may be enough.
``` csharp
app.MapGet(
    "/customers/{id:guid}",
    async (
        Guid id,
        AppDbContext db,
        CancellationToken ct) =>
        await db.Customers.FindAsync([id], ct)
            is { } customer
                ? Results.Ok(customer)
                : Results.NotFound());
```

Do not create four projects and twelve interfaces merely because the application might become complicated someday.

## Level 1: Use Cases

The endpoint begins accumulating workflow. Extract an application operation:
``` text
Endpoint
   |
Use Case
   |
DbContext
```

Now HTTP concerns and application behavior can evolve independently. This may look like a Service Layer, Transaction Script, command handler, or vertical slice handler. The name matters less than the boundary.

## Level 2: Domain Model

Business rules become interconnected.
``` text
if customer is preferred
and order total exceeds...
unless product category...
except when region...
```

Now a rich model can protect invariants.
``` text
Endpoint
   |
Application
   |
Order Aggregate
   |
Persistence
```

The complexity of the domain has earned domain modeling.

## Level 3: Separate Reads and Writes

The model that protects invariants is not necessarily the model that answers:
> Show the last 100 orders with customer name, shipment state, and
> total.

Do not torture the aggregate into becoming a report engine. Separate commands and queries. That is the beginning of CQRS.

## Level 4: Internal Events

One business action triggers several reactions:
``` text
OrderPlaced
   |
   +--> award loyalty points
   +--> update internal metrics
   +--> create fulfillment task
```

Domain events can decouple reactions inside the same bounded context while keeping the domain language explicit.

## Level 5: External Integration

Now another process must hear about the order.
``` text
Orders
   |
Integration Event
   |
Broker
   |
Fulfillment
```

A method call has become distributed communication. We must now care about delivery, duplication, ordering, and compatibility.

## Level 6: Reliable Messaging

The classic dual-write appears:
``` text
Save database
Publish message
```

Those are two independent operations. If one succeeds and the other fails, the system becomes inconsistent. The Transactional Outbox becomes relevant. On the receiving side, at-least-once delivery makes idempotent consumption relevant.

## Level 7: Distributed Workflow

A business transaction now spans:
``` text
Orders
Payments
Inventory
Shipping
```

No single local transaction owns the workflow. Saga and Compensating Transaction become candidates. At this point, architecture is as much about failure recovery as happy-path execution.

## Level 8: Independent Scale and Failure

Traffic is bursty. A queue buffers work. Multiple consumers process it. Remote services fail. Now patterns such as:
-   Queue-Based Load Leveling;
-   Competing Consumers;
-   Retry;
-   Circuit Breaker;
-   Bulkhead;

address concrete operational forces.

## You Can Stop Anywhere

This is the most important part of the ladder.
``` text
Level 0  CRUD
Level 1  Use Cases
Level 2  Domain Model
Level 3  CQRS
Level 4  Domain Events
Level 5  Messaging
Level 6  Reliable Messaging
Level 7  Distributed Workflow
Level 8  Resilience and Scale
```

There is no prize for Level 8. A well-designed Level 1 system is better than a Level 8 architecture built for a Level 1 problem.

## Different Parts Can Sit on Different Rungs

A single application may contain:
``` text
Admin settings       -> CRUD
Checkout              -> Domain Model
Reporting             -> Query projections
Email notifications   -> Queue
Payments              -> Idempotency + resilience
```

Architecture does not need to be uniform. Consistency is useful, but forcing every subsystem to use the most complex pattern required anywhere in the system is expensive.

## The Escalation Question

Before adding a pattern, ask:
> What happened that made the current design insufficient?

Good answers sound like:
``` text
"We are losing events between the database and broker."

"We need to protect an invariant across these entities."

"This dependency is causing cascading failures."

"The read model requires joins that don't belong in the aggregate."

"Duplicate messages are charging customers twice."
```

Weak answers sound like:
``` text
"It's best practice."

"Big systems use it."

"We might need it later."

"The template had it."
```

## Architecture Debt vs. Architecture Speculation

Under-design can create architecture debt. Over-design creates architecture speculation. Both are expensive. The goal is evolutionary architecture: introduce boundaries early enough that change remains possible, but introduce machinery only when the forces justify it.

## Summary

The Architecture Complexity Ladder is not a maturity model. It is a cost model. Each step buys capabilities and introduces new failure modes, concepts, code, tests, and operational responsibilities. Move upward because the software has encountered a problem that the next pattern solves - not because sophisticated architecture looks impressive.
