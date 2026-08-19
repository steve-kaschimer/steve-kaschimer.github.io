---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2031-01-19
image: /images/posts/2031-01-19-hero.webp
image_alt: "Several separate floating boxes connected by thin dotted lines, with one box's connection rendered as a solid question mark rather than a firm link."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three separate amber floating boxes connected by thin teal dotted lines, with one connection replaced by a solid off-white question-mark glyph rather than a firm link, implying a service boundary whose justification is being reconsidered. Mood is analytical and unresolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Before changing any code, Northstar asks a harder question of Inventory, Payments, and Fulfillment: which of these boundaries need independent deployment badly enough to keep paying for distributed failure?"
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Lab 23: Did These Boundaries Need to Be Services?"
---



Northstar now runs `Ordering.Api`, `Inventory.Worker`, and `Payments.Worker` on top of RabbitMQ, an Outbox, an Inbox, a Saga, Retry, a Circuit Breaker, a Dead Letter Queue, and OpenTelemetry. Every one of those patterns solved a real problem. The question worth asking now is a different one: which of those problems actually came from the business, and which came from the deployment topology we happened to choose?

## The Inventory Boundary

Inventory currently needs its own independent message consumer, its own SQLite database, an Inbox, an Outbox, broker topology, and its own process lifecycle. Why? Because we chose to run it as an independent process - that's the only reason. But if the same team owns both Ordering and Inventory, if Inventory doesn't need independent scaling or independent deployment, and if the business cares more about immediate consistency than fault isolation, then that service boundary may be costing more than it's actually buying.

## The Experiment

This stage is a decision lab, not a coding exercise - no code changes yet. Write down the forces acting on Ordering, Inventory, Payments, and Fulfillment, and for each one answer six questions: does it need independent deployment, does it need independent scaling, does it need a different availability boundary, does a separate team own it, does it require a different technology or runtime, and is eventual consistency plus messaging actually worth the trade here?

## A Likely Answer

Payment probably stays external and distributed, since it wraps a third-party capability governed by someone else entirely. Inventory and Fulfillment probably don't need that at all, which points toward a shape like `Northstar.Host` hosting Ordering, Inventory, and Fulfillment as modules, with only Payment left outside as an external dependency. That's not going backward - it's aligning the deployment boundaries with the forces that are actually there.

## What We Preserve

Nothing about this erases the boundaries themselves. The modular monolith still needs module contracts, clear data ownership, dependency rules, and module-specific application and domain code. The goal is fewer distributed failure modes, not a slide back into one undifferentiated ball of mud.

## Next

The next stage builds that shape explicitly.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
