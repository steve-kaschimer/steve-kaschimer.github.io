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

Northstar now contains:

```text
Ordering.Api
Inventory.Worker
Payments.Worker
RabbitMQ
Outbox
Inbox
Saga
Retry
Circuit Breaker
Dead Letter Queue
OpenTelemetry
```

All of those patterns solved real problems.

Now we ask a different question:

> Which of those problems came from the business, and which came from deployment topology?

## The Inventory Boundary

Inventory currently needs:

```text
independent message consumer
its own SQLite database
Inbox
Outbox
broker topology
process lifecycle
```

Why?

Because we chose an independent process.

But suppose:

- the same team owns Ordering and Inventory;
- Inventory does not need independent scaling;
- Inventory does not need independent deployment;
- the business requires immediate consistency more often than fault isolation.

Then the service boundary may be costing more than it buys.

## The Experiment

v24 is a decision lab.

Do not change code yet.

Write down the forces for each boundary:

```text
Ordering
Inventory
Payments
Fulfillment
```

For each, answer:

1. Does it need independent deployment?
2. Does it need independent scaling?
3. Does it need a different availability boundary?
4. Does a separate team own it?
5. Does it require a different technology/runtime?
6. Are eventual consistency and messaging worth the trade?

## A Likely Answer

Payment may remain external/distributed because it wraps a third-party or separately governed capability.

Inventory may not.

Fulfillment may not.

That means the next architecture could be:

```text
Northstar.Host
  |
  +-- Ordering Module
  +-- Inventory Module
  +-- Fulfillment Module

External:
  Payment
```

This is not "going backward."

It is aligning deployment boundaries with actual forces.

## What We Preserve

We do **not** erase boundaries.

The modular monolith still needs:

```text
module contracts
data ownership
dependency rules
module-specific application/domain code
```

The goal is:

```text
fewer distributed failure modes
without
returning to a big ball of mud
```

## Next

v25 will build that shape explicitly.
