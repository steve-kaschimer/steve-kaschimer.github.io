---
author: Steve Kaschimer
date: 2030-05-12
image: /images/posts/2030-05-12-hero.webp
image_alt: "One bounded rectangle with several internal partitions of different shapes, all inside one unbroken outer boundary."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single unbroken teal outer boundary rectangle containing four small distinctly shaped amber partitions inside it, implying strong internal boundaries preserved without splitting the deployment itself. Mood is bounded and unified. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A modular monolith keeps one deployable application while dividing it into explicit business modules with controlled dependencies."
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Modular Monolith: Strong Boundaries Without a Distributed System"
---



A modular monolith keeps one deployable application while dividing it into explicit business modules with controlled dependencies.
```text
Application
├── Orders
├── Payments
├── Catalog
└── Identity
```

The important word is **modular**, not monolith.

## Why It Exists

A traditional monolith can decay into one shared object graph:
```text
Orders -> Payments internals
Payments -> Catalog tables
Catalog -> Identity implementation
```

A modular monolith keeps the operational simplicity of one process while making those boundaries intentional.

## Module Shape

A module can own its application, domain, and infrastructure concerns:
```text
Modules/
  Orders/
    Application/
    Domain/
    Infrastructure/
    Contracts/
```

Other modules should depend on its public contract, not its implementation.
```csharp
public interface IOrdersModule
{
    Task<OrderSummary?> GetSummaryAsync(
        OrderId id,
        CancellationToken cancellationToken);
}
```

## Data Ownership

One database is fine. Shared ownership is the danger.
```text
Orders schema
Payments schema
Catalog schema
```

Separate schemas are one useful technique. The stronger rule is semantic: one module owns writes to its data. Avoid cross-module joins becoming the default integration mechanism.

## Communication

Start with the simplest mechanism that preserves the boundary:
```text
direct in-process contract
```

Use module events when decoupled reactions help. Do not introduce a broker merely to simulate microservices inside one process.

## Transactions Are a Superpower

A modular monolith can still use a local ACID transaction when the business genuinely requires it. That is a major advantage over premature service decomposition. Do not throw away local transactions merely to look distributed.

## Enforce the Architecture

A folder is not a boundary. Use project references, internal visibility, architecture tests, and dependency rules to prevent accidental coupling. For example, tests can assert that `Orders.Domain` never references `Payments.Infrastructure`.

## Extraction Path

A well-designed module is a candidate, not a promise, for future extraction.
```text
Modular Monolith
      |
clear boundary
      |
business/scale reason appears
      |
extract service
```

The goal is not to make extraction inevitable. It is to make it possible without rewriting the whole system.

## When It Helps

Use a modular monolith when the domain benefits from strong boundaries but independent deployment and distributed failure are not yet worth their cost.

## When It Hurts

It fails when "module" means only folders while every module shares tables, internal classes, and implementation details.

## Summary

A modular monolith is often the best default for a substantial business application: strong boundaries, one deployment, simple debugging, and local transactions. Microservices should be an answer to a problem, not the starting architecture.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
