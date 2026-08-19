---
author: Steve Kaschimer
date: 2030-08-04
image: /images/posts/2030-08-04-hero.webp
image_alt: "The same eight-rung ladder from earlier in the series, fully visible, with a small marker standing partway up rather than reaching for the top."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on the same vertical teal eight-rung ladder glyph used earlier in this series, now shown fully assembled top to bottom, with one small amber marker glyph standing deliberately partway up rather than climbing toward the highest rung, implying informed restraint rather than unclimbed ambition. Mood is reflective and deliberate. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "We have spent two volumes learning patterns."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "The Architecture Complexity Ladder: Knowing When Not to Use a Pattern"
---



We have spent two volumes learning patterns. The final lesson is more important:
> **A pattern is not free.**

Every pattern buys a capability by introducing a cost. Good architecture is not the architecture containing the most patterns. It is the simplest architecture that reliably satisfies the forces acting on the system.

## Start With the Problem

Architecture discussions often begin with solutions:
```text
Should we use microservices?
Should we use CQRS?
Should we use Event Sourcing?
Should we add Kafka?
```

Reverse the conversation:
```text
What is failing?
What cannot scale?
Which invariant is difficult to protect?
Which teams are blocked?
Which recovery guarantee is missing?
```

Only then choose a pattern.

## The Ladder

A useful mental model is a complexity ladder.
```text
Simple CRUD
    |
Transaction Script
    |
Vertical Slice
    |
Domain Model
    |
Aggregate
    |
CQRS
    |
Asynchronous Messaging
    |
Outbox + Inbox
    |
Saga
    |
Event Sourcing
```

This is not a maturity model. Higher is not better. Every rung exists because a new force can make the rung below insufficient.

## Rung 0: Simple CRUD

Start here when the problem is fundamentally data maintenance.
```text
Create
Read
Update
Delete
```

Use framework capabilities directly. If this solves the business problem cleanly, stop. Do not apologize for CRUD.

## Climb When

Business operations become more meaningful than generic record updates.

## Rung 1: Transaction Script

Organize each use case as an explicit operation.
```text
PlaceOrder
CancelOrder
ApproveInvoice
```

The script coordinates validation, data access, and transaction behavior. This is often enough for surprisingly large systems.

## Cost

Some business rules may begin to duplicate across scripts.

## Climb When

The domain contains rich behavior and invariants shared across operations.

## Rung 2: Vertical Slice

Organize code around use cases rather than technical layers.
```text
Orders/
  Place/
  Cancel/
  Search/
```

This reduces horizontal ceremony and keeps changes localized. Vertical Slice is often compatible with either simple scripts or rich domain models.

## Cost

Without discipline, shared business behavior can duplicate across slices.

## Climb When

The business model itself needs first-class representation.

## Rung 3: Domain Model

Move important business behavior into explicit domain concepts.
```text
Order
Money
PricingPolicy
```

Now code speaks the business language.

## Cost

Mapping, persistence boundaries, and model design require more thought.

## Climb When

Some groups of state must remain consistent through every write.

## Rung 4: Aggregate

Define a transactional consistency boundary.
```text
Order
  |
OrderItems
```

The Aggregate Root protects invariants.

## Cost

Aggregate design constrains transaction and reference patterns. Large aggregates create contention. Small aggregates create coordination needs.

## Climb When

Read and write requirements begin pulling the model in incompatible directions.

## Rung 5: CQRS

Separate write behavior from read projection.
```text
Commands -> Domain Model
Queries  -> Read Model
```

Start with one database.

## Cost

Two conceptual models must now be understood and maintained.

## Do Not Automatically Climb

CQRS does **not** imply separate databases. Stay here if independent persistence provides no value.

## Climb When

Reads and writes genuinely need different stores, scaling, schemas, or deployment paths.

## Rung 6: Asynchronous Messaging

Once work crosses an asynchronous boundary:
```text
Producer
   |
Broker
   |
Consumer
```

you gain decoupling, buffering, and independent processing. You also inherit:
```text
duplicates
ordering questions
delayed work
poison messages
partial failure
```

## Cost

Debugging and operational reasoning become distributed.

## Climb When

Database state and message publication must not diverge.

## Rung 7: Outbox + Inbox

Outbox solves:
```text
commit state
but lose event
```

Inbox solves:
```text
receive event twice
and duplicate effect
```

Together they provide reliable local boundaries around at-least-once messaging.

## Cost

Tables, dispatchers, retention, retries, deduplication, and monitoring.

## Climb When

One business workflow must span several independently committed participants.

## Rung 8: Saga

Saga makes distributed workflow state explicit.
```text
Reserve
Authorize
Fulfill
```

with timeouts and compensation.

## Cost

You no longer have global rollback. Recovery becomes domain behavior. Operations must understand workflow state.

## Ask a Hard Question

Did the business truly require independent services? Or did architecture turn one easy transaction into a Saga? Sometimes the correct move is **down the ladder**.

## Rung 9: Event Sourcing

Event Sourcing changes persistence itself:
```text
current state
```

becomes:
```text
history of facts
```

This unlocks temporal reconstruction and powerful projections.

## Cost

You now own permanent event contracts, replay, projection lag, schema evolution, and specialized operational tooling.

## Climb Only When

History itself is part of the domain and those capabilities justify permanent complexity. Never adopt Event Sourcing merely because you already use events.

## Complexity Is Multidimensional

The ladder is not the only axis. A system can also acquire complexity through:
```text
deployment topology
data distribution
team topology
security boundaries
availability requirements
traffic scale
multi-region operation
```

A modular monolith with sophisticated domain logic may be more appropriate than five CRUD microservices.

## Microservices Are a Trade, Not a Destination

Splitting a process creates capabilities:
```text
independent deployment
independent scaling
technology autonomy
fault isolation
team ownership
```

It also destroys capabilities you previously had for free:
```text
local calls
local transactions
simple debugging
one deployment
strong consistency
```

You then buy replacements:
```text
local call
 -> network call + timeout + retry

local transaction
 -> Saga + compensation

method parameter
 -> versioned contract

stack trace
 -> distributed trace

single commit
 -> Outbox + Inbox
```

That does not make microservices bad. It makes their price visible.

## The Pattern Tax

Every pattern introduces some combination of:
```text
code
concepts
runtime components
failure modes
configuration
testing
monitoring
on-call knowledge
```

Call this the **pattern tax**. A pattern is justified when the value it creates exceeds that tax.

## Reversibility Matters

Prefer decisions that are cheap to change. Examples:
```text
direct handler call
 -> mediator later

single database CQRS
 -> separate read store later

modular monolith
 -> extract service later

ordinary persistence
 -> do NOT assume Event Sourcing later is cheap
```

Some choices are more reversible than others. Architecture should spend irreversible complexity carefully.

## Localize Complexity

If only one workflow needs a Saga, do not make the whole application "Saga architecture." If one query needs Dapper, do not replace every EF Core query. If one integration needs an ACL, put it at that boundary.
```text
complexity belongs
where the problem lives
```

This is one of the strongest principles in the entire series.

## Architecture Fitness Questions

Before adding a pattern, ask:
1. What concrete problem exists today?
2. What evidence shows the current design is insufficient?
3. What guarantee does the new pattern provide?
4. What new failure modes does it introduce?
5. Who will operate it at 2:00 AM?
6. How will we know it is working?
7. Can we solve the problem more locally?
8. Can we defer the decision?
9. What is the exit strategy?
10. What would make us remove the pattern later?

If the answers are vague, the architecture probably is too.

## A Practical Decision Example

Suppose an ordering system begins as:
```text
ASP.NET Core
EF Core
PostgreSQL
```

Perfectly reasonable. Business rules grow. Add:
```text
Order Aggregate
```

Reporting becomes awkward. Add:
```text
direct read projections
```

No separate database required. Email sending slows checkout. Add:
```text
Outbox
Queue
Email Consumer
```

No need to make Orders a microservice. Traffic grows and Recommendations overloads the page. Add:
```text
Bulkhead
Circuit Breaker
```

only around Recommendations. Later, a dedicated fulfillment team needs independent deployment and scaling. Now perhaps extract:
```text
Fulfillment Module
    ->
Fulfillment Service
```

The architecture evolved because forces appeared. That is healthy architecture.

## Going Down the Ladder

Patterns can be removed. If an asynchronous workflow no longer needs independent scaling:
```text
broker -> direct call
```

may be an improvement. If a microservice creates more coordination than autonomy:
```text
service -> module
```

may be an improvement. Architecture is not a one-way migration toward more infrastructure. Simplification is architectural work.

## The Senior Engineering Skill

Knowing how to implement a pattern is useful. Knowing when to implement it is better. Knowing when **not** to implement it is architecture. The expert does not look at a simple system and ask:
> Which patterns are missing?

The expert asks:
> Which forces are not yet handled well?

Sometimes the answer is:
```text
none
```

and the correct architectural decision is to leave the system alone.

## Where Volume III Begins

Volume II focused on application and service architecture. The next frontier is what happens when scale and distribution become architectural forces of their own:
```text
partitioning
sharding
consistent hashing
load shedding
backpressure
multi-region systems
replication
distributed consensus
cell-based architecture
deployment patterns
cloud-native coordination
```

Those patterns deserve their own volume because the question changes. Volume II asked:
> How should a modern application be structured?

Volume III will ask:
> How does that application remain correct and available when the system itself becomes distributed?

## Final Summary

Patterns are vocabulary. They are not a checklist. Start simple. Observe the forces acting on the system. Add the smallest pattern that supplies the missing capability. Understand the new failure modes you purchased. Measure whether the trade was worthwhile. And always preserve the option to simplify again. That is the real pattern behind all the others.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
