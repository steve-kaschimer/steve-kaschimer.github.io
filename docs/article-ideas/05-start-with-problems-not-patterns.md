---
category: Foundations
csharp: 14
description: Use forces, failure modes, and explicit trade-offs to
  decide whether a pattern belongs in a .NET architecture instead of
  applying patterns by reputation.
dotnet: 10
order: 5
series: Modern Application Architecture Patterns in .NET
slug: start-with-problems-not-patterns
status: draft
title: "Don't Start With Patterns: Start With Problems"
volume: 2
---

# Don't Start With Patterns: Start With Problems

A pattern catalog can accidentally encourage the worst possible way to
use patterns.

You read about Outbox.

Outbox sounds robust.

So every application gets an Outbox.

That is backwards.

## Pattern Selection Is Diagnosis

A doctor does not begin with:

> I really like casts. Which part of you can I put one on?

Architecture should work the same way.

Start with symptoms.

For example:

``` text
Symptom:
Customers are occasionally charged twice.

Evidence:
Requests are retried after timeout.

Constraint:
Payment provider accepts idempotency keys.

Candidate:
Idempotency.
```

That is a pattern earning its way into the design.

## Write the Problem Statement First

Before adopting a pattern, write one paragraph answering:

``` text
What is happening?
Why is the current design insufficient?
What constraint prevents the obvious solution?
What failure are we trying to prevent?
```

If the team cannot answer those questions, it probably cannot evaluate
the pattern's trade-offs either.

## Patterns Have Costs

Consider CQRS.

Benefits may include:

-   independent read models;
-   simpler queries;
-   clearer command semantics;
-   separate optimization.

Costs may include:

-   more types;
-   more code paths;
-   eventual consistency if stores separate;
-   duplicated models;
-   more testing.

The decision is not:

``` text
CQRS = good
```

It is:

``` text
Benefits in our context
>
Costs in our context
```

## Patterns Compose

Real systems rarely use one pattern in isolation.

A reliable messaging flow might become:

``` text
Command
   |
Domain Model
   |
Unit of Work
   |
Transactional Outbox
   |
Broker
   |
Competing Consumer
   |
Idempotent Consumer
```

Each pattern addresses a different failure mode.

Adding only one can leave the system with false confidence.

## Patterns Can Conflict

A rich Domain Model favors behavior close to state.

A highly optimized reporting model favors direct projections.

Trying to make one model satisfy both forces can make both worse.

CQRS can let us use different patterns on each side.

Pattern literacy is partly the ability to recognize tensions between
forces.

## Prefer the Smallest Sufficient Pattern

Suppose an API calls a remote weather service.

One occasional transient failure does not automatically justify:

``` text
Retry
Circuit Breaker
Bulkhead
Fallback
Hedging
Queue
Cache
```

Maybe a timeout plus a carefully bounded retry is enough.

Add mechanisms when measurements and failure modes justify them.

## Architecture Decision Records

For consequential choices, capture the reasoning.

A lightweight ADR can contain:

``` markdown
# Use Transactional Outbox for Order Events

## Context
Database commit and broker publish can fail independently.

## Decision
Persist integration events in the order database transaction.

## Consequences
Requires dispatcher, cleanup, monitoring, and idempotent consumers.
```

The consequence section prevents a pattern from looking free.

## Measure the Problem

Production architecture should be informed by evidence.

Useful signals include:

-   latency percentiles;
-   error rates;
-   retry counts;
-   queue depth;
-   dead-letter count;
-   cache hit rate;
-   database contention;
-   dependency failure rate.

Observability helps us discover when a pattern is needed---and whether
it actually worked.

## The Pattern Review Checklist

Before adopting a pattern, ask:

1.  What specific problem does it solve?
2.  Do we have that problem now?
3.  What is the simplest alternative?
4.  What new failure modes does it introduce?
5.  What operational machinery does it require?
6.  How will we test it?
7.  How will we observe it?
8.  How will we know it succeeded?
9.  Can we remove it later?
10. Does the team understand it?

That checklist will appear repeatedly throughout Volume II.

## A Pattern Is a Trade

This is the philosophy of the entire volume:

> A pattern is a named trade-off that has worked repeatedly in a
> particular context.

That is more useful than treating patterns as architectural
commandments.

## Next

With the foundations established, we can begin structuring a modern .NET
application.

The first subject is Dependency Injection---not because `AddScoped` is
difficult, but because dependency direction, lifetime, composition, and
replaceability shape almost every pattern that follows.
