---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-13
image: /images/posts/2030-10-13-hero.webp
image_alt: "Two identical stamped marks overlapping with a visible offset, implying the same delivery arriving more than once and leaving a duplicate trace."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two identical amber stamp-mark glyphs overlapping with a small visible offset between them, both stamped onto the same teal surface, implying the same delivery arriving twice and leaving a duplicate trace. Mood is repetitive and unresolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Sending the same integration event twice produces two Fulfillment work records - proof that once delivery is at-least-once, the consumer, not the publisher, owns the duplicate-effect problem."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Lab 9: At-Least-Once Delivery Means Duplicate Effects Are Your Problem"
---

Transactional Outbox solved message loss.

It did not solve duplicate delivery.

That is expected.

## Reproduce It

Send the same integration event twice:

```json
{
  "eventId": "11111111-1111-1111-1111-111111111111",
  "orderId": "22222222-2222-2222-2222-222222222222",
  "customerEmail": "reader@example.com",
  "total": 100,
  "occurredAt": "2026-08-14T20:00:00Z"
}
```

to:

```text
POST /lab/fulfillment/deliver
```

twice.

Then query:

```text
GET /lab/fulfillment/work
```

You will see two work records with the same source event identity.

## The Important Shift

The publisher can no longer guarantee:

```text
you will receive this exactly once
```

The consumer must guarantee:

```text
receiving it again is harmless
```

## Next

We will add an Inbox.

The consumer will persist:

```text
MessageId processed
```

in the same transaction as:

```text
FulfillmentWork created
```

That atomicity is the whole point.
