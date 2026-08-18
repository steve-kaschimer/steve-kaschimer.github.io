---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-11-10
image: /images/posts/2030-11-10-hero.webp
image_alt: "A chain of step nodes with one segment of the connecting line replaced by a small queue glyph, implying a workflow whose steps now cross an asynchronous broker rather than direct calls."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal chain of teal step nodes where one connecting segment is replaced by a small amber queue-buffer glyph, implying a workflow whose steps now cross an asynchronous broker rather than a direct in-process call. Mood is decoupled and durable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The same Saga state machine crosses RabbitMQ: Ordering now emits commands and waits for facts, and stopping a worker mid-checkout proves the workflow survives outages a synchronous coordinator never could."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Lab 13: The Saga Crosses the Network"
---

The previous Saga was deliberately kept in-process, which let us understand the business workflow before adding any transport complexity on top of it. Now the same state machine crosses RabbitMQ.

## What Changed

Ordering no longer calls `InventoryService.Reserve()` or `PaymentService.Authorize()` directly. Instead it emits commands - `ReserveInventory`, `AuthorizePayment`, `ReleaseInventory` - and participants reply with facts: `InventoryReserved`, `PaymentAuthorized`, `PaymentDeclined`, `InventoryReleased`.

## What Did Not Change

The Saga is still asking the same business questions it always asked: what step completed, what comes next, what compensates Inventory if Payment fails, and when the workflow is actually done. The transport changed. The workflow semantics didn't.

## Pattern Composition

This is where the earlier labs converge. Ordering's Saga state and Outbox feed into RabbitMQ, which reaches Inventory and Payment, each guarded by its own Inbox before it commits a local business effect and sends a reply. The Saga isn't replacing Outbox or Inbox here - it's leaning on the exact same local-consistency ideas they already gave us.

## Manual Acknowledgements

Consumers only acknowledge a message after they've processed it, which means a worker that dies before acknowledging leaves RabbitMQ free to redeliver that message. That's why every worker has an Inbox: the redelivery itself is expected and fine, and it's only the duplicate business effect that would be a problem.

## Break It: Worker Down

Stop Inventory, then start a checkout. Ordering has already accepted the workflow, so the command just waits in the queue. Restart Inventory and the Saga picks up right where it left off - a fundamentally different availability story than the synchronous coordinator we started with.

## Break It: Payment Decline

Configure Payment to decline. The Saga receives `PaymentDeclined`, and it doesn't try to roll back history - it emits `ReleaseInventory` instead, and once `InventoryReleased` comes back, the Saga settles into `Compensated`.

## What Is Still Imperfect

Right now the Inventory and Payment workers persist their Inbox record and business effect, then publish the reply as a separate step - a smaller version of the same dual-write problem we already learned about. A fully hardened implementation would give each participant its own Outbox, so the Inbox marker, the business effect, and the reply Outbox row all commit together. That's a refinement, not a new pattern - it's just applying the same composition consistently at every transactional boundary instead of stopping partway.

## Lesson

Distributed architecture is recursive. The reliability rule we learned inside Ordering shows up again inside every participant, because patterns don't disappear when you cross a service boundary - they repeat, once per local consistency boundary, for as long as those boundaries exist.
