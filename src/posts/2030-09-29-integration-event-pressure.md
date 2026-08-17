---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-29
image: /images/posts/2030-09-29-hero.webp
image_alt: "A solid checkmark on one side of a boundary line and a broken, dotted connection reaching toward the other side, implying a committed fact that has not actually reached its destination."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single solid amber checkmark on the left side of a vertical off-white boundary line, connected by a broken dotted teal line reaching toward an unfilled shape on the right side, implying a committed local fact that has not yet reliably crossed the boundary. Mood is exposed and unresolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Fulfillment needs to hear about every placed order reliably, not just conveniently - and a naive publish-after-commit step reveals exactly why an in-process domain event isn't a delivery guarantee."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Lab 7: When a Domain Event Needs a Delivery Guarantee"
---

v7 gave us a useful local fact:

```text
OrderPlaced
```

Now Fulfillment becomes a separate operational concern.

The requirement changes from:

> run some code after order placement

to:

> Fulfillment must eventually hear about every placed order.

Those are not the same guarantee.

## Domain Event vs. Integration Event

The domain event remains internal:

```text
OrderPlaced
```

A handler translates it into a distributed contract:

```text
OrderPlacedIntegrationEvent
```

That keeps the internal domain model separate from the external contract.

## The Naive Implementation

This stage publishes after commit:

```text
COMMIT Order
    |
publish message
```

Under normal conditions, it works.

That is why the bug is dangerous.

## Break It

Configure publishing to fail.

Now:

```text
Order committed ✓
Integration event published ✗
```

No amount of retry inside the current request can prove recovery after a process crash.

The system has crossed a boundary where two independent durable systems must be coordinated.

## The Pattern We Have Earned

Transactional Outbox.

The next stage will change the sequence to:

```text
BEGIN
  save Order
  save OutboxMessage
COMMIT

later:
  publish OutboxMessage
```

The broker will no longer be part of the order transaction.

That is the key design move.
