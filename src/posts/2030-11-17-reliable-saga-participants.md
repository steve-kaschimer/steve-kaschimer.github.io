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

v14 made the Saga asynchronous.

It also exposed a familiar hole inside Inventory and Payments:

```text
Inbox + business effect commit
then
publish reply
```

If a worker crashed after commit but before publish, the Saga could wait forever for a reply that would never arrive.

We have seen this bug before.

## The Fix

Each participant now commits three things together:

```text
BEGIN

Inbox marker
Business effect
Reply Outbox

COMMIT
```

The worker then acknowledges the incoming message only after that local transaction succeeds.

A separate Outbox dispatcher publishes the reply.

## Inventory

For `ReserveInventory`:

```text
Inbox(ReserveInventory.MessageId)
InventoryReservation
Outbox(InventoryReserved)
```

all commit together.

For compensation:

```text
Inbox(ReleaseInventory.MessageId)
Reservation = Released
Outbox(InventoryReleased)
```

all commit together.

## Payments

For `AuthorizePayment`:

```text
Inbox(AuthorizePayment.MessageId)
PaymentAttempt
Outbox(PaymentAuthorized | PaymentDeclined)
```

all commit together.

## Why This Matters

Distributed reliability is recursive.

Every service owns one local transaction boundary.

At that boundary, the same rule applies:

> If local state and an outgoing message must agree, persist the outgoing message locally before publishing it.

## What We Have Now

Northstar's Saga path is now:

```text
Ordering:
Saga + Outbox
        |
RabbitMQ
        |
Inventory:
Inbox + Reservation + Reply Outbox
        |
RabbitMQ
        |
Ordering:
Inbox + Saga + Next Outbox
        |
RabbitMQ
        |
Payments:
Inbox + Payment + Reply Outbox
        |
RabbitMQ
        |
Ordering:
Inbox + Saga
```

The system does not have one global transaction.

It has a chain of reliable local transactions.

## Next Pressure

Now that correctness is respectable, we can turn to **time** and **failure duration**.

What if Payment is not declining—it is simply unavailable?

What if a message waits too long?

What if a remote dependency is transiently unhealthy?

That will earn:

```text
timeouts
retry
circuit breaker
dead-letter handling
observability
```

The next phase is operational resilience rather than transactional correctness.
