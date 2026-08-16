---
author: Steve Kaschimer
date: 2031-03-02
image: /images/posts/2031-03-02-hero.webp
image_alt: "The same eight-rung ladder glyph from earlier in the series, shown fully assembled with a small marker standing partway up rather than reaching for the top."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a vertical teal ladder glyph shown fully assembled top to bottom, with one small amber marker glyph standing deliberately partway up rather than climbing toward the highest rung, implying informed restraint rather than unclimbed ambition. Mood is reflective and complete. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Northstar's full stage map, its complexity budget, and the closing lesson of the lab: the best architecture is not the one with the most patterns, but the least complicated one that responsibly handles the forces the system actually faces."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Lab 29: The Architecture Complexity Ladder"
---

Northstar began as software.

Then reality happened to it.

That distinction matters.

We did not begin with:

```text
CQRS
Saga
Outbox
Inbox
RabbitMQ
Circuit Breaker
DLQ
OpenTelemetry
Cache
Sidecar
```

We began with a problem small enough to understand.

Then each architectural move had to answer one question:

> What pressure made the simpler design insufficient?

## The Ladder

| Stage | Pressure | Pattern / Move | Complexity Paid |
|---|---|---|---|
| v1 | Basic application | Simple baseline | Minimal |
| v2–3 | Business rules become rich | Domain Model | More domain structure |
| v4–5 | Reads and writes pull apart | CQRS | Separate mental models |
| v6–7 | Other behavior reacts to domain changes | Domain Events | Event ordering/handlers |
| v8–9 | External publication must agree with commits | Transactional Outbox | Dispatcher + eventual delivery |
| v10–11 | Delivery can repeat | Inbox / Idempotent Consumer | Message identity/storage |
| v12–14 | Workflow crosses transaction boundaries | Saga | State machine + compensation |
| v15 | Participants can lose replies | Participant Outbox | Reliability repeated per service |
| v16–17 | Dependencies become slow/unavailable | Timeout, Retry, Circuit Breaker, telemetry | Policy + operational tuning |
| v18 | Poison work never succeeds | Dead Letter Queue | Recovery operations |
| v19 | Demand exceeds instantaneous capacity | Rate Limit, Queue Leveling, Competing Consumers, Bulkhead | Capacity policy |
| v20–21 | Repeated reads become expensive | Cache-Aside | Staleness + invalidation |
| v22 | Writers race | Optimistic Concurrency | Conflict handling |
| v23 | Deployment itself is risky | Feature Flags + Health | Runtime release controls |
| v24–25 | Distribution costs exceed benefits | Modular Monolith | Strong internal boundaries |
| v26–27 | Legacy cannot be replaced safely at once | Strangler Fig + ACL | Temporary coexistence |
| v28 | Independent releases can violate expectations | Contract Testing | Contract lifecycle |
| v29 | Cross-cutting runtime capability needs isolation | Sidecar | Per-instance process/network hop |

Notice what happened at v24.

We moved **down**.

That is not a failure in the model.

It is proof that this is a ladder rather than a maturity scale.

## Complexity Is a Budget

Every pattern buys something.

Every pattern also charges rent.

Saga buys coordination without a global transaction.

It charges:

```text
state
timeouts
compensation
observability
operational debugging
```

Cache-Aside buys lower source load.

It charges:

```text
staleness
invalidation
stampede control
another failure mode
```

Microservices buy independent deployment and isolation.

They charge:

```text
network failure
eventual consistency
deployment coordination
distributed observability
contract management
```

The correct question is never:

> Is this pattern good?

Ask:

> Is what it buys worth what it costs here?

## Pattern Composition

Patterns rarely live alone.

Northstar's asynchronous workflow eventually became:

```text
Saga
 +
Outbox
 +
Inbox
 +
Idempotency
 +
Retry
 +
Circuit Breaker
 +
DLQ
 +
Observability
```

This is why choosing a distributed architecture is not choosing one pattern.

It frequently commits you to a family of supporting patterns.

## Pattern Removal

Architecture skill includes recognizing when a pattern is no longer earning its rent.

When Inventory stopped requiring independent deployment, we could replace:

```text
broker
Saga step
Inbox
Outbox
distributed tracing boundary
```

with:

```text
IInventoryModule
```

The domain boundary survived.

The distribution machinery did not.

## The Decision Loop

Use this loop before adding architecture:

```text
1. Observe pressure
2. Name the failure mode
3. Identify the simplest response
4. State what complexity it introduces
5. Make the behavior observable
6. Re-evaluate after the forces change
```

If you cannot name step 2, you probably do not yet need step 3.

## A Practical Decision Matrix

| If the problem is... | First consider... | Be cautious about jumping directly to... |
|---|---|---|
| Rich business rules | Domain Model | Microservices |
| Different read/write needs | Separate models / CQRS | Event sourcing |
| Reliable external publication | Outbox | Distributed transactions |
| Duplicate messages | Idempotency / Inbox | Exactly-once claims |
| Long-running distributed workflow | Saga | Global transaction |
| Transient remote failure | Timeout + bounded Retry | Infinite retry |
| Persistent poison message | DLQ | Endless requeue |
| Traffic burst | Queue / Rate Limit | Scaling everything |
| Expensive repeated reads | Cache-Aside | Caching all data |
| Concurrent edits | Optimistic Concurrency | Long-lived locks |
| Risky rollout | Feature Flag | Permanent branching |
| Too many services | Modular Monolith | More services |
| Legacy replacement | Strangler Fig | Big-bang rewrite |
| API evolution risk | Contract Tests | Giant E2E suite only |
| Cross-cutting process isolation | Sidecar | Service mesh by default |

## The Final Northstar Test

Imagine a new requirement:

> Customers need to see a near-real-time shipment map.

Do not immediately pick technology.

Ask:

```text
How fresh?
How many customers?
Where does location originate?
Can updates repeat?
Can they arrive out of order?
What happens when the provider is unavailable?
Does this need independent scaling?
What is the acceptable stale window?
```

Only then do patterns become useful.

## What Senior Architecture Looks Like

Early in a career, growth often feels like learning more techniques.

Later, a different skill becomes more valuable:

```text
knowing when not to use them
```

That does not mean choosing simplistic systems.

It means making complexity prove its value.

## Closing Principle

Northstar's final architecture is not the point.

Its evolution is.

At every stage we should be able to point to a line in the design and say:

```text
This exists because this failure mode exists.
```

If we cannot, the architecture deserves another look.

That is the Architecture Complexity Ladder.

## Exercises

Three closing exercises for readers who want to practice the decision loop themselves.

### Exercise 1 — Choose the Next Step

For each scenario, do **not** start by naming a pattern.

Write:

```text
Pressure:
Failure mode:
Simplest acceptable response:
Complexity introduced:
How we will know it worked:
```

#### Scenario A

Checkout traffic spikes 20x for fifteen minutes every Friday.

#### Scenario B

The Payment provider occasionally takes 25 seconds to respond.

#### Scenario C

Operations refreshes the same dashboard every second.

#### Scenario D

Inventory and Ordering are owned by one team, always deploy together, and almost never scale independently.

#### Scenario E

A legacy Warehouse API cannot be retired this year, but one endpoint is causing most incidents.

After answering, compare your reasoning with the Northstar stages—not just the pattern names.

### Exercise 2 — Remove a Pattern

Choose one:

```text
Saga
Cache-Aside
RabbitMQ
Circuit Breaker
Feature Flag
Sidecar
```

Assume the force that justified it has disappeared.

Answer:

1. What code can be deleted?
2. What infrastructure can be deleted?
3. What operational procedures disappear?
4. What failure modes disappear?
5. What capabilities are lost?
6. Which boundary must remain even after the pattern is removed?

The objective is to practice **architectural subtraction**.

### Exercise 3 — Design Your Own Northstar

Start with this constraint:

```text
one ASP.NET Core application
one relational database
one deployment unit
```

Now choose a business domain.

Add architecture only when you can write a failing scenario that the current design cannot responsibly handle.

Keep a decision log:

| Step | New Pressure | Decision | Alternatives Rejected | Complexity Added | Removal Trigger |
|---|---|---|---|---|---|

The last column is important.

Before adopting a pattern, state the condition under which you would remove it.

That turns architecture from accumulation into lifecycle management.
