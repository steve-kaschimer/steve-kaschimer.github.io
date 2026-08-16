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

The previous Saga was intentionally in-process.

That allowed us to understand the business workflow before introducing transport complexity.

Now the same state machine crosses RabbitMQ.

## What Changed

Ordering no longer invokes:

```text
InventoryService.Reserve()
PaymentService.Authorize()
```

Instead it emits commands:

```text
ReserveInventory
AuthorizePayment
ReleaseInventory
```

Participants reply with facts:

```text
InventoryReserved
PaymentAuthorized
PaymentDeclined
InventoryReleased
```

## What Did Not Change

The Saga still asks the same business questions:

```text
What step completed?
What step comes next?
If Payment fails, what compensates Inventory?
When is the workflow complete?
```

Transport changed.

Workflow semantics did not.

## Pattern Composition

This stage is where the earlier labs converge.

```text
Ordering
  |
Saga state + Outbox
  |
RabbitMQ
  |
Inventory / Payment
  |
Inbox
  |
local business effect
  |
reply message
```

The Saga is not replacing Outbox or Inbox.

It relies on the same local-consistency ideas.

## Manual Acknowledgements

Consumers acknowledge messages only after processing.

If a worker dies before acknowledgement, RabbitMQ can redeliver the message.

That is why each worker has an Inbox.

The redelivery is expected.

The duplicate business effect is not.

## Break It: Worker Down

Stop Inventory.

Start a checkout.

Ordering has already accepted the workflow.

The command waits in the queue.

Restart Inventory.

The Saga continues.

This is a fundamentally different availability model from the earlier synchronous coordinator.

## Break It: Payment Decline

Configure Payment to decline.

The Saga receives:

```text
PaymentDeclined
```

It does not roll back history.

It emits:

```text
ReleaseInventory
```

After:

```text
InventoryReleased
```

the Saga becomes:

```text
Compensated
```

## What Is Still Imperfect

The Inventory and Payment workers currently persist their Inbox/business effect before publishing the reply directly.

That creates a smaller version of the same dual-write problem we already learned.

A fully hardened implementation would give **each participant its own Outbox**, so:

```text
Inbox
Business effect
Reply Outbox
```

commit together.

That is the next refinement—not a new pattern, but applying the pattern composition consistently at every transactional boundary.

## Lesson

Distributed architecture is recursive.

The reliability rule we learned in Ordering applies again inside every participant.

Patterns do not disappear when we cross a service boundary.

They repeat at each local consistency boundary.
