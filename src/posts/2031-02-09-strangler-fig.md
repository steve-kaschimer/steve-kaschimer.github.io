---
author: Steve Kaschimer
companion_download: /downloads/northstar-modernization.zip
companion_download_label: "the modernization lab"
date: 2031-02-09
image: /images/posts/2031-02-09-hero.webp
image_alt: "A thin vine shape gradually wrapping around and extending past a weathered trunk shape beside it, with a small translation seam visible where the two meet."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one weathered teal trunk shape on the left gradually being overtaken by a thin amber vine wrapping around and extending past it on the right, with a small off-white seam mark where they meet, implying incremental replacement with deliberate translation at the boundary. Mood is incremental and reversible. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The routing boundary starts sending shipping status to a new Fulfillment module behind an Anti-Corruption Layer, translating legacy status codes into Northstar's own language while keeping the old path one toggle away."
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Lab 26: Strangler Fig Moves One Capability at a Time"
---

v26 gave us a routing point.

v27 uses it.

## The Route

The client still calls:

```text
GET /shipping/{orderId}
```

But the router can choose:

```text
Legacy Shipping
or
New Fulfillment
```

without changing the client contract.

## Anti-Corruption Layer

When traffic goes to Legacy, the application does **not** return:

```text
STATUS_CD = 4
SHIP_REF
```

directly.

The ACL translates it into Northstar's language:

```text
FulfillmentStatus.Shipped
ShipmentReference
```

That matters because migration should improve the model rather than copy legacy semantics into new code.

## Progressive Migration

Start with:

```text
UseNewFulfillment = false
```

Then enable the new path in a controlled environment.

The same routing concept can later become:

```text
specific tenant
specific customer cohort
specific endpoint
percentage rollout
```

## Rollback

If the new implementation misbehaves:

```text
route back to Legacy
```

That is the safety advantage.

The migration is reversible while data semantics still permit it.

## Retirement Is Part of the Pattern

A Strangler project is not complete when the new system exists.

It is complete when:

```text
old route removed
legacy implementation retired
temporary translation removed
```

Otherwise Northstar ends up operating both forever.

## The Lesson

Strangler Fig is not a rewrite technique.

It is a risk-management strategy for replacing behavior incrementally behind a stable boundary.
