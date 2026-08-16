---
category: Foundations
csharp: 14
description: Choose deployment boundaries after identifying business
  boundaries, and understand why a modular monolith is often the
  strongest starting point for a modern .NET system.
dotnet: 10
order: 4
series: Modern Application Architecture Patterns in .NET
slug: modular-monolith-or-microservices
status: draft
title: Modular Monolith or Microservices? Start With the Boundary
volume: 2
---

# Modular Monolith or Microservices? Start With the Boundary

One of the easiest ways to make a new system unnecessarily difficult is
to begin with:

> How many microservices should we have?

That question is premature.

Start with:

> Where are the business boundaries?

## Logical Boundaries Before Deployment Boundaries

Imagine an application with:

``` text
Catalog
Ordering
Billing
Fulfillment
Identity
```

Those may be meaningful modules or bounded contexts.

They do not automatically need to be separate processes.

A modular monolith can preserve boundaries inside one deployment:

``` text
┌───────────────────────────────┐
│        ASP.NET Core App       │
│                               │
│ Catalog   Ordering   Billing  │
│                               │
│ Fulfillment       Identity    │
└───────────────────────────────┘
```

The important property is that modules do not become one
undifferentiated codebase.

## What a Modular Monolith Buys You

Inside one process, you retain:

-   simple deployment;
-   local calls;
-   straightforward debugging;
-   inexpensive transactions;
-   simpler testing;
-   fewer operational components.

At the same time, strong module boundaries can preserve:

-   ownership;
-   encapsulation;
-   separate domain models;
-   explicit contracts;
-   future extraction options.

That is an excellent trade for many systems.

## What Microservices Change

Split Billing into another service:

``` text
Ordering ----HTTP/message----> Billing
```

The call is no longer a method call.

Now:

``` text
Billing can be unavailable.
The request can time out.
The operation may succeed after the timeout.
Ordering may retry.
The retry may duplicate the operation.
The contract must be versioned.
Both services need distributed tracing.
```

Microservices do not merely rearrange projects.

They convert in-process coupling into distributed-systems problems.

## The Database Boundary

A useful microservice boundary generally includes ownership of data.

This:

``` text
Order Service ----Billing Service ---+--> Shared Database
Shipping Service -/
```

may provide independent processes without meaningful autonomy.

Shared schemas create coupling through:

-   migrations;
-   transactions;
-   queries;
-   data semantics;
-   deployment coordination.

If services cannot change their data independently, the service boundary
may be weaker than it appears.

## Module Contracts

A modular monolith can prohibit arbitrary cross-module access.

For example:

``` text
Ordering
   |
   v
IBillingModule
   |
Billing
```

or communicate through internal events.

The exact mechanism matters less than preserving the rule:

> A module owns its internals.

## Extraction Later

If Billing later needs independent deployment:

``` text
Before:
Ordering -> IBillingModule -> Billing module

After:
Ordering -> IBillingGateway -> Billing service
```

A well-designed logical boundary can make the physical split less
traumatic.

It does not make extraction free.

Distributed communication still changes consistency and failure
semantics.

## When Microservices Earn Their Cost

Good reasons include:

-   independent deployment is genuinely valuable;
-   different scaling characteristics matter;
-   organizational ownership is strong;
-   regulatory or security isolation requires it;
-   failure isolation is important;
-   technology independence provides real value.

"We expect lots of users" is not enough by itself.

A monolith can scale horizontally too.

## Organizational Architecture

Service boundaries often become team boundaries.

That means architecture and organization interact.

If five teams constantly modify the same service, the service may not
represent a useful ownership boundary.

Conversely, creating twenty services for a five-person team can impose
operational coordination the organization cannot sustain.

## Start With the Boundary

A practical progression is:

``` text
Business capability
      |
Bounded context / module
      |
Explicit contract
      |
Independent ownership
      |
Independent deployment?
      |
Maybe microservice
```

Notice that "microservice" comes last.

## Summary

Modularity and microservices solve different problems.

Modularity is about boundaries.

Microservices add process and deployment independence.

A modular monolith often gives a system the first benefit without
immediately accepting the network, consistency, observability, and
operational costs of the second.

Find the boundary first.

Then decide whether that boundary deserves its own process.
