---
author: Steve Kaschimer
companion_download: /downloads/northstar-modular-monolith.zip
companion_download_label: "the modular monolith lab"
date: 2031-01-26
image: /images/posts/2031-01-26-hero.webp
image_alt: "Several distinct internal partitions inside one unbroken outer boundary rectangle, implying strong internal walls preserved without separate deployable units."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one unbroken teal outer boundary rectangle containing three small distinctly shaped amber partitions inside it, implying strong internal ownership boundaries preserved without separate deployable processes. Mood is consolidated and still disciplined. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Northstar collapses Ordering, Inventory, and Fulfillment back into one deployable host while keeping their module contracts intact - removing the broker, the Inbox, and the Outbox without erasing the boundary."
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Lab 24: Moving Down the Complexity Ladder"
---

Northstar just did something architecture diagrams rarely celebrate.

It became simpler.

## What We Removed

For Inventory and Fulfillment we removed:

```text
separate process
RabbitMQ hop
Inbox
Outbox
dead-letter topology
cross-process tracing
eventual consistency
independent deployment
```

That is a lot of machinery.

## What We Kept

We kept:

```text
Inventory module
Fulfillment module
public contracts
private implementation
data ownership
dependency rules
tests
```

That distinction is the entire lesson.

## A Module Is Still a Boundary

Ordering depends on:

```csharp
IInventoryModule
```

It does not depend on:

```text
InventoryDbContext
InventoryReservation entity
Inventory tables
```

The deployment boundary disappeared.

The ownership boundary did not.

## Why Payment Stayed External

Payment still represents a boundary with stronger forces:

```text
external provider
different failure semantics
security/compliance
network latency
independent availability
```

That is enough to justify keeping the port remote.

## Local Transactions Are Valuable

Once two capabilities share a process/database boundary, some workflows may regain local transactional options.

That can eliminate entire classes of compensation and delivery problems.

Do not throw away that capability merely because distributed patterns are interesting.

## Architecture Tests

The lab includes tests that assert implementation types remain internal.

A folder naming convention is not enough.

Boundaries should be enforceable.

## The Big Lesson

The Complexity Ladder is not one-way.

```text
microservice
   |
   v
module
```

can be an architectural improvement when independent deployment no longer justifies the distributed tax.

Simplification is not failure.

It is one of the clearest signs that architecture is being driven by forces instead of fashion.
