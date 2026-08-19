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



Transactional Outbox solved message loss. It never promised to solve duplicate delivery, and it shouldn't have.

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

to `POST /lab/fulfillment/deliver`, then check `GET /lab/fulfillment/work`. You'll find two work records carrying the same source event identity.

## The Important Shift

The publisher can no longer promise you'll receive this exactly once. From here on, that guarantee has to move to the consumer: receiving it again has to be harmless.

## Next

We'll add an Inbox, so the consumer persists "MessageId processed" in the same transaction that creates the `FulfillmentWork` record. That shared transaction, and the atomicity it buys, is the whole point.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
