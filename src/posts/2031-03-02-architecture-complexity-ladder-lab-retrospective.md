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



Northstar began as software. Then reality happened to it, and that distinction is really the whole story. We didn't start with CQRS, Saga, Outbox, Inbox, RabbitMQ, a Circuit Breaker, a DLQ, OpenTelemetry, a cache, or a sidecar sitting on the shelf waiting to be used. We started with a problem small enough to actually understand, and every architectural move after that had to answer one question before it earned its place: what pressure made the simpler design insufficient?

## The Ladder

| Stage | Pressure | Pattern / Move | Complexity Paid | |---|---|---|---| | v1 | Basic application | Simple baseline | Minimal | | v2–3 | Business rules become rich | Domain Model | More domain structure | | v4–5 | Reads and writes pull apart | CQRS | Separate mental models | | v6–7 | Other behavior reacts to domain changes | Domain Events | Event ordering/handlers | | v8–9 | External publication must agree with commits | Transactional Outbox | Dispatcher + eventual delivery | | v10–11 | Delivery can repeat | Inbox / Idempotent Consumer | Message identity/storage | | v12–14 | Workflow crosses transaction boundaries | Saga | State machine + compensation | | v15 | Participants can lose replies | Participant Outbox | Reliability repeated per service | | v16–17 | Dependencies become slow/unavailable | Timeout, Retry, Circuit Breaker, telemetry | Policy + operational tuning | | v18 | Poison work never succeeds | Dead Letter Queue | Recovery operations | | v19 | Demand exceeds instantaneous capacity | Rate Limit, Queue Leveling, Competing Consumers, Bulkhead | Capacity policy | | v20–21 | Repeated reads become expensive | Cache-Aside | Staleness + invalidation | | v22 | Writers race | Optimistic Concurrency | Conflict handling | | v23 | Deployment itself is risky | Feature Flags + Health | Runtime release controls | | v24–25 | Distribution costs exceed benefits | Modular Monolith | Strong internal boundaries | | v26–27 | Legacy cannot be replaced safely at once | Strangler Fig + ACL | Temporary coexistence | | v28 | Independent releases can violate expectations | Contract Testing | Contract lifecycle | | v29 | Cross-cutting runtime capability needs isolation | Sidecar | Per-instance process/network hop | Notice what happened at v24-25: we moved down, not up. That's not a failure in the model - it's proof that this is a ladder, not a maturity scale you're supposed to keep climbing forever.

## Complexity Is a Budget

Every pattern buys something, and every pattern charges rent for it. Saga buys coordination without a global transaction, and charges for it in state, timeouts, compensation, observability, and operational debugging. Cache-Aside buys lower load on the source of truth, and charges for it in staleness, invalidation, stampede control, and one more failure mode to think about. Microservices buy independent deployment and isolation, and charge for it in network failure, eventual consistency, deployment coordination, distributed observability, and contract management. The question worth asking is never "is this pattern good?" It's "is what it buys worth what it costs here?"

## Pattern Composition

Patterns rarely live alone. Northstar's asynchronous workflow eventually became Saga plus Outbox plus Inbox plus Idempotency plus Retry plus Circuit Breaker plus DLQ plus Observability, all stacked on top of each other - which is exactly why choosing a distributed architecture is never really choosing one pattern. It usually commits you to a whole family of supporting patterns whether you planned for that or not.

## Pattern Removal

Part of the skill of architecture is noticing when a pattern has stopped earning its rent. Once Inventory no longer needed independent deployment, we could replace the broker, the Saga step, the Inbox, the Outbox, and the distributed tracing boundary around it with a single `IInventoryModule`. The domain boundary survived that change intact. The distribution machinery didn't need to.

## The Decision Loop

Before adding any architecture, run through this: observe the pressure, name the actual failure mode, identify the simplest response, state plainly what complexity it introduces, make the resulting behavior observable, and re-evaluate once the forces change. If you can't name the failure mode in step two, you probably don't need step three yet.

## A Practical Decision Matrix

| If the problem is... | First consider... | Be cautious about jumping directly to... | |---|---|---| | Rich business rules | Domain Model | Microservices | | Different read/write needs | Separate models / CQRS | Event sourcing | | Reliable external publication | Outbox | Distributed transactions | | Duplicate messages | Idempotency / Inbox | Exactly-once claims | | Long-running distributed workflow | Saga | Global transaction | | Transient remote failure | Timeout + bounded Retry | Infinite retry | | Persistent poison message | DLQ | Endless requeue | | Traffic burst | Queue / Rate Limit | Scaling everything | | Expensive repeated reads | Cache-Aside | Caching all data | | Concurrent edits | Optimistic Concurrency | Long-lived locks | | Risky rollout | Feature Flag | Permanent branching | | Too many services | Modular Monolith | More services | | Legacy replacement | Strangler Fig | Big-bang rewrite | | API evolution risk | Contract Tests | Giant E2E suite only | | Cross-cutting process isolation | Sidecar | Service mesh by default |

## The Final Northstar Test

Imagine a new requirement lands: customers need to see a near-real-time shipment map. Don't reach for technology first. Ask how fresh the data really needs to be, how many customers are actually watching, where the location data originates, whether updates can repeat or arrive out of order, what happens when the provider goes down, whether this needs independent scaling, and what stale window is actually acceptable. Patterns only become useful once those questions have real answers.

## What Senior Architecture Looks Like

Early in a career, growth usually feels like learning more techniques. Later on, a different skill starts to matter more: knowing when not to use them. That's not an argument for simplistic systems - it's an argument for making complexity prove its value before it gets to stay.

## Closing Principle

Northstar's final architecture was never really the point. Its evolution was. At every stage, we should be able to point at a line in the design and say "this exists because this failure mode exists." If we can't say that, the architecture deserves another look - and that's the Architecture Complexity Ladder, in full.

## Exercises

Three closing exercises for readers who want to practice the decision loop themselves.

### Exercise 1 ,  Choose the Next Step

For each scenario below, resist the urge to name a pattern first. Instead, write down the pressure, the failure mode, the simplest acceptable response, the complexity it introduces, and how you'll know it worked.

#### Scenario A

Checkout traffic spikes 20x for fifteen minutes every Friday.

#### Scenario B

The Payment provider occasionally takes 25 seconds to respond.

#### Scenario C

Operations refreshes the same dashboard every second.

#### Scenario D

Inventory and Ordering are owned by one team, always deploy together, and almost never scale independently.

#### Scenario E

A legacy Warehouse API cannot be retired this year, but one endpoint is causing most incidents. Once you've answered them, compare your reasoning against the Northstar stages themselves - not just against the pattern names, which is where it's easy to fool yourself.

### Exercise 2 ,  Remove a Pattern

Pick one: Saga, Cache-Aside, RabbitMQ, Circuit Breaker, Feature Flag, or Sidecar. Assume the force that originally justified it has disappeared, and answer what code can be deleted, what infrastructure can go with it, what operational procedures disappear, what failure modes disappear, what capabilities get lost in the process, and which boundary has to survive even after the pattern itself is gone. The point of the exercise is practicing architectural subtraction, which gets far less attention than addition ever does.

### Exercise 3 ,  Design Your Own Northstar

Start from the same constraint Northstar did: one ASP.NET Core application, one relational database, one deployment unit. Pick a business domain of your own, and add architecture only when you can write down a failing scenario the current design genuinely can't handle responsibly. Keep a decision log as you go: | Step | New Pressure | Decision | Alternatives Rejected | Complexity Added | Removal Trigger | |---|---|---|---|---|---| That last column matters more than it looks. Before adopting any pattern, state the condition under which you'd remove it again - that one habit is what turns architecture from accumulation into something you actually manage over its lifecycle.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
