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



The previous stage proved the problem out in the open: inventory reserved, payment declined, and no global rollback anywhere to be found. This stage introduces a durable workflow object, `CheckoutSaga`, to actually own that gap.

## The Saga Remembers Progress

The workflow records `InventoryReservationId`, `PaymentAuthorizationId`, `Status`, `StartedAt`, and `CompletedAt`, which gives the system a durable answer to a question it couldn't answer before: where is this checkout right now?

## Compensation Is a Business Action

When Payment declines, releasing the inventory isn't a rollback - it's a new operation that compensates for the earlier reservation. The world already moved forward; compensation is how we respond to that, not how we pretend it didn't happen.

## Why This Matters Operationally

An operator can now inspect a Saga and see it move through `Started`, `InventoryReserved`, `PaymentDeclined`, `Compensated` - the recovery path lives in the model itself instead of scattered across logs someone has to piece back together.

## What Is Still Simplified

The coordinator still calls Inventory and Payment in-process, and that's deliberate - we wanted to understand the workflow's semantics before layering broker mechanics on top of it. Distributing those Saga commands and replies over the messaging infrastructure we already built is the next evolution, not this one.

## Lesson

Saga wasn't introduced because the application suddenly had multiple services. It was introduced because one business transaction crossed independent commit boundaries, and partial success needed an explicit way to recover.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
