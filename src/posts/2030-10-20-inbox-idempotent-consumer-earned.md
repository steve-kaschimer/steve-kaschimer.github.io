---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-20
image: /images/posts/2030-10-20-hero.webp
image_alt: "Two identical duplicate stamp marks converging into one solid stamp mark protected inside a small locked outline, implying repeated delivery reduced to one safely recorded effect."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two faint duplicate amber stamp-mark glyphs converging into one solid teal stamp mark enclosed by a small off-white locked-outline border, implying repeated delivery safely reduced to exactly one recorded effect. Mood is protected and resolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "An Inbox marker and the resulting Fulfillment work now commit together under one unique key - the same duplicate delivery that created two work items before now produces exactly one."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Lab 10: Inbox Makes Duplicate Delivery Harmless"
---

v10 delivered one `OrderPlacedIntegrationEvent` twice.

Fulfillment created two work items.

That is exactly what at-least-once delivery allows unless the consumer protects itself.

## The Inbox

v11 records:

```text
MessageId
Handler
ProcessedAt
```

with a unique key.

The handler commits:

```text
Inbox marker
+
Fulfillment work
```

together.

## Why the Transaction Matters

This would be unsafe:

```text
create fulfillment work
COMMIT

record inbox
COMMIT
```

A crash between commits could repeat the business effect.

Likewise:

```text
record inbox
COMMIT

create fulfillment work
```

could permanently suppress work that never happened.

The marker and the effect are one local consistency boundary.

## Why the Unique Constraint Matters

Two duplicates can arrive simultaneously.

Both can observe:

```text
not processed yet
```

The database must decide which one wins.

Application-level `if` checks are not enough.

## Try It

Post the same event twice.

Then inspect:

```text
/lab/fulfillment/inbox
/lab/fulfillment/work
```

You should see:

```text
one Inbox row
one FulfillmentWork row
```

## Pattern Composition

Northstar now has:

```text
Ordering transaction
  |
Outbox
  |
at-least-once publish
  |
Fulfillment
  |
Inbox
  |
business effect
```

Outbox protects the producer.

Inbox protects the consumer.

Together they form a reliable local-to-local bridge without pretending the distributed system is globally atomic.

## Next

Now we can make the workflow genuinely distributed.

Placing an order will require:

```text
reserve inventory
authorize payment
schedule fulfillment
```

Each participant owns its own transaction.

Some steps can fail after earlier steps have committed.

That is the pressure Saga exists to solve.
