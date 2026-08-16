---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-06
image: /images/posts/2030-10-06-hero.webp
image_alt: "A sealed box glyph positioned directly beside a ledger entry mark, both enclosed by one shared stamp outline, implying two facts committed together as one atomic unit."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small sealed amber box glyph positioned directly beside a teal ledger-entry mark, both enclosed by one shared off-white stamp outline, implying a business change and its outbound message committed together as one atomic unit. Mood is atomic and dependable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Order row and the Outbox row now commit together in one local transaction, and a separate dispatcher owns the remote publish - Northstar trades a hole in the workflow for an honest at-least-once guarantee."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Lab 8: Transactional Outbox Makes the Integration Event Durable"
---

v8 deliberately performed:

```text
save Order
publish Integration Event
```

That contained a hole.

If the first operation succeeded and the second never did, Ordering and Fulfillment disagreed about reality.

## The New Transaction

v9 changes the write path:

```text
BEGIN

Order row
Outbox row

COMMIT
```

Both durable facts now succeed or fail together.

## Why the Broker Is Not in the Transaction

The application does not attempt a distributed transaction across SQLite and a broker.

Instead, it stores the intent to publish locally.

A background dispatcher owns the remote operation.

## Break It

Make publishing fail.

The dispatcher records the failure.

The Outbox row remains pending.

Restore publishing.

The dispatcher tries again.

The message survives the outage because the database already owns it.

## We Did Not Achieve Exactly Once

Imagine:

```text
publish succeeds
process crashes
PublishedAt not saved
```

The dispatcher will publish again.

So the guarantee is:

```text
at least once
```

That is why the next pressure belongs on the receiving side.

## Next

We will create a Fulfillment consumer and deliberately deliver the same message twice.

Then Inbox / Idempotent Consumer will earn its place.
