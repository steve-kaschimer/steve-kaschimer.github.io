---
author: Steve Kaschimer
date: 2029-09-09
image: /images/posts/2029-09-09-hero.webp
image_alt: "Five small distinctly shaped label tags arranged in a row, implying separate categories of idea rather than one interchangeable label."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on five small distinctly shaped teal and amber label-tag glyphs arranged in an evenly spaced row, implying separate categories of architectural idea rather than one interchangeable label. Mood is precise and taxonomic. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Separate architectural styles, design patterns, principles, practices, and technologies so architecture discussions become about decisions rather than labels."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Patterns, Principles, Styles, and Practices: Know What You're Choosing"
---

Software architecture conversations become confusing when every useful
idea is called a pattern.

Clean Architecture, SOLID, CQRS, dependency injection, microservices,
Retry, DDD, and Kubernetes are not the same kind of thing.

Knowing the difference makes architectural decisions easier to reason
about.

## Five Different Kinds of Decision

A practical classification is:

  Kind                 Question
  -------------------- -------------------------------------------
  Principle            What should guide our decisions?
  Architecture style   How is the system broadly organized?
  Pattern              How do we solve this recurring problem?
  Practice             How do we work or implement consistently?
  Technology           What concrete tool provides capabilities?

For example:

``` text
Dependency Inversion      Principle
Hexagonal Architecture    Style
Gateway                   Pattern
Constructor Injection     Practice/technique
ASP.NET Core DI            Technology
```

These ideas can reinforce one another without being interchangeable.

## Why This Matters

If somebody says:

> We use Clean Architecture.

you still do not know:

-   whether the system uses DDD;
-   whether it uses CQRS;
-   whether it uses repositories;
-   whether features are vertical slices;
-   whether messaging exists;
-   whether the application is a monolith.

Labels are summaries, not designs.

## Principles

Principles constrain choices.

Examples include:

-   dependency inversion;
-   separation of concerns;
-   high cohesion;
-   low coupling;
-   information hiding;
-   favoring explicit boundaries.

A principle does not normally tell you exactly what classes to create.

It helps you evaluate alternatives.

## Styles

An architecture style shapes the system at a broad level.

Examples include:

``` text
Layered
Hexagonal
Event-Driven
Microservices
Modular Monolith
```

A style creates a family of constraints.

Hexagonal architecture, for example, emphasizes an application core
separated from external adapters through ports.

That does not tell you whether your persistence adapter should use EF
Core or Dapper.

## Patterns

A pattern addresses a recurring problem in a context and brings
trade-offs.

For example:

``` text
Problem:
A remote dependency repeatedly fails.

Pattern:
Circuit Breaker.

Trade:
Fail fast and protect resources,
but temporarily reject calls that
might otherwise have succeeded.
```

That is much more specific than an architecture style.

## Practices

Practices are repeatable ways of working.

Examples:

-   constructor injection;
-   automated migrations;
-   structured logging;
-   contract testing;
-   code review;
-   trunk-based development.

Practices can support patterns without being patterns themselves.

## Technologies

Technologies implement capabilities.

Examples:

``` text
ASP.NET Core
EF Core
PostgreSQL
Azure Service Bus
OpenTelemetry
Redis
```

A technology does not determine the architecture.

You can build an excellent or terrible architecture with any of them.

## CQRS Is a Good Test

CQRS means separating responsibility for commands and queries.

That is the architectural idea.

This:

``` text
Commands -> EF Core
Queries  -> Dapper
```

is one implementation.

This:

``` text
Write DB -> events -> Read DB
```

is a more advanced implementation.

The second is not required for the first to be CQRS.

Separating the idea from one popular implementation prevents needless
complexity.

## DDD Is Another Good Test

Domain-Driven Design is not:

``` text
EntityBase
AggregateRootBase
Repository<T>
ValueObjectBase
```

DDD is an approach to managing complex business domains through
modeling, language, boundaries, and collaboration with domain experts.

Those classes may support that approach.

They are not the approach.

## Microservices Are an Architecture Style

A microservice architecture introduces independent process and
deployment boundaries.

That means the network becomes part of normal application behavior.

It creates benefits:

-   independent deployment;
-   independent scaling;
-   technology autonomy;
-   stronger ownership boundaries.

It also creates costs:

-   distributed transactions;
-   latency;
-   failure modes;
-   observability requirements;
-   deployment coordination;
-   message/API versioning.

Calling something a "microservice pattern" can hide the fact that
choosing microservices changes the system's fundamental operating model.

## Use Labels After the Decision

A healthier sequence is:

``` text
1. Identify the problem.
2. Identify the forces.
3. Compare options.
4. Accept a trade-off.
5. Give the resulting design a useful name.
```

The unhealthy sequence is:

``` text
1. Choose "Clean Architecture."
2. Copy a folder structure.
3. Invent interfaces.
4. Discover what problem they were meant to solve.
```

## Summary

Architecture vocabulary is useful only when it makes decisions clearer.

Principles guide us.

Styles organize systems.

Patterns solve recurring problems.

Practices make implementation repeatable.

Technologies provide concrete capabilities.

Throughout Volume II, we will keep those categories separate enough to
ask the question that matters:

**What problem does this choice solve, and what does it cost us?**
