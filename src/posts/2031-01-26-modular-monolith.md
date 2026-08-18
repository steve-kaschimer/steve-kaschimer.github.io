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

Northstar just did something architecture diagrams rarely get credit for. It became simpler.

## What We Removed

For Inventory and Fulfillment, we removed the separate process, the RabbitMQ hop, the Inbox, the Outbox, the dead-letter topology, cross-process tracing, eventual consistency, and independent deployment. That's a lot of machinery to walk away from.

## What We Kept

We kept the Inventory module and the Fulfillment module, their public contracts, their private implementations, clear data ownership, dependency rules, and the tests. That distinction - what got removed versus what stayed - is really the whole lesson of this stage.

## A Module Is Still a Boundary

Ordering depends on `IInventoryModule`, not on `InventoryDbContext`, the `InventoryReservation` entity, or Inventory's tables directly. The deployment boundary disappeared. The ownership boundary didn't move an inch.

## Why Payment Stayed External

Payment still sits behind a boundary with genuinely stronger forces pushing on it: it's an external provider, it has different failure semantics, it carries security and compliance weight, it adds real network latency, and it has its own independent availability story. That combination is enough to justify keeping its port remote, even while everything else came home.

## Local Transactions Are Valuable

Once two capabilities share a process and a database again, some workflows get their local transactional options back - and that can quietly eliminate entire categories of compensation and delivery problems that only existed because of the distribution in the first place. That capability is worth having; don't throw it away just because distributed patterns happen to be more interesting to write about.

## Architecture Tests

The lab includes tests that assert implementation types stay internal, because a folder-naming convention alone isn't a real boundary. If a boundary matters, it should be enforceable in code, not just in intent.

## The Big Lesson

The Complexity Ladder isn't one-way. Moving from a microservice back down to a module can be a genuine architectural improvement once independent deployment stops justifying the distributed tax you're paying for it. Simplifying isn't failure - it's one of the clearest signs that the architecture is actually being driven by real forces instead of fashion.
