---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-11-17
image: /images/posts/2030-11-17-hero.webp
image_alt: "Three identical small sealed-box-and-ledger units arranged in a row, each independently complete rather than sharing one shared mechanism."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three identical small amber sealed-box-and-teal-ledger units arranged in a horizontal row, each rendered fully self-contained rather than sharing one central mechanism, implying the same reliability pattern repeating independently at every service boundary. Mood is recursive and consistent. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Inventory and Payments each get their own Inbox, business effect, and reply Outbox committed together - the same reliability rule Ordering learned earlier turns out to repeat at every local transaction boundary."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Lab 14: Reliability Repeats at Every Transaction Boundary"
---



Making the Saga asynchronous also exposed a familiar hole inside Inventory and Payments: each one committed its Inbox marker and business effect, then published its reply as a separate step. If a worker crashed after that commit but before the publish, the Saga would wait forever for a reply that was never coming. We've seen this exact bug before.

## The Fix

Each participant now commits three things together in one transaction: the Inbox marker, the business effect, and a reply Outbox row. Only after that transaction succeeds does the worker acknowledge the incoming message, and a separate Outbox dispatcher takes care of actually publishing the reply.

## Inventory

For `ReserveInventory`, the Inbox marker, the `InventoryReservation`, and the `InventoryReserved` Outbox row all commit together. For the compensating path, the Inbox marker for `ReleaseInventory`, the reservation flipping to `Released`, and the `InventoryReleased` Outbox row commit together the same way.

## Payments

For `AuthorizePayment`, the Inbox marker, the payment attempt, and the Outbox row for either `PaymentAuthorized` or `PaymentDeclined` all commit together too.

## Why This Matters

Distributed reliability turns out to be recursive. Every service owns exactly one local transaction boundary, and at that boundary the same rule always applies: if local state and an outgoing message need to agree, persist the outgoing message locally before you ever try to publish it.

## What We Have Now

Northstar's Saga path now runs Ordering's Saga and Outbox through RabbitMQ into Inventory's Inbox, reservation, and reply Outbox, back through RabbitMQ into Ordering's Inbox, Saga, and next Outbox, out again to Payments' Inbox, payment, and reply Outbox, and finally back to Ordering's Inbox and Saga. There's no single global transaction anywhere in that chain - just a sequence of reliable local ones, each doing its part.

## Next Pressure

Now that correctness is in reasonably good shape, the next question is about time and failure duration. What happens when Payment isn't declining, but simply unavailable? What if a message sits too long? What if a remote dependency is only transiently unhealthy? Those questions earn timeouts, retry, a circuit breaker, dead-letter handling, and observability - the next phase is about operational resilience, not transactional correctness.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
