---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-11-03
image: /images/posts/2030-11-03-hero.webp
image_alt: "A chain of connected step nodes with one node highlighted as the current position, and a distinct looping arrow reaching back from a later node to compensate an earlier one."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal chain of four teal step nodes connected by links, one node highlighted solid amber as the current position, with a separate curved off-white arrow looping back from a later node toward an earlier one, implying durable workflow state with explicit compensation. Mood is tracked and recoverable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A durable CheckoutSaga now remembers exactly where a workflow stands and treats a Payment decline as a business action - releasing inventory - rather than a rollback that no longer exists."
tags: ["dotnet", "architecture", "design-patterns", "distributed-systems"]
title: "Lab 12: Saga Makes Distributed Workflow State Explicit"
---

v12 proved the problem:

```text
Inventory reserved
Payment declined
```

There is no global rollback.

v13 introduces a durable workflow object:

```text
CheckoutSaga
```

## The Saga Remembers Progress

The workflow records:

```text
InventoryReservationId
PaymentAuthorizationId
Status
StartedAt
CompletedAt
```

That gives the system a durable answer to:

> Where is this checkout right now?

## Compensation Is a Business Action

When Payment declines:

```text
ReleaseInventory
```

is not a rollback.

It is a new operation that compensates for the earlier reservation.

The world moved forward.

## Why This Matters Operationally

An operator can now inspect the Saga and see:

```text
Started
InventoryReserved
PaymentDeclined
Compensated
```

The recovery path is part of the model rather than hidden in logs.

## What Is Still Simplified

The coordinator still calls Inventory and Payment in-process.

That is intentional.

We wanted to learn the workflow semantics before adding broker mechanics.

The next evolution can distribute those Saga commands and replies using the messaging infrastructure we already built.

## Lesson

Saga was not introduced because the application had multiple services.

It was introduced because one business transaction crossed independent commit boundaries and partial success required explicit recovery.
