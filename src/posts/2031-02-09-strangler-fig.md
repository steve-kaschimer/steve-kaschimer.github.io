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



The previous stage gave us a routing point. This one puts it to work.

## The Route

The client still calls `GET /shipping/{orderId}` exactly as before. The router, though, can now send that request to Legacy Shipping or to the new Fulfillment module without the client contract changing at all.

## Anti-Corruption Layer

When traffic goes to Legacy, the application doesn't hand back `STATUS_CD = 4` and a raw `SHIP_REF` directly - an Anti-Corruption Layer translates it into Northstar's own language first, as `FulfillmentStatus.Shipped` and a proper `ShipmentReference`. That translation matters, because a migration should improve the model it's replacing, not just copy the legacy semantics into new code with a fresh coat of paint.

## Progressive Migration

Start with `UseNewFulfillment = false`, then enable the new path somewhere controlled. The same routing concept can later narrow down to a specific tenant, a specific customer cohort, a specific endpoint, or a straightforward percentage rollout - whatever the risk tolerance calls for.

## Rollback

If the new implementation misbehaves, routing back to Legacy is just a flag flip. That's the real safety advantage here: the migration stays reversible for as long as the data semantics on both sides still allow it.

## Retirement Is Part of the Pattern

A Strangler project isn't finished the moment the new system exists and works. It's finished once the old route is removed, the legacy implementation is retired, and the temporary translation layer comes out - otherwise Northstar just ends up running both systems forever, which defeats the entire point.

## The Lesson

Strangler Fig was never a rewrite technique. It's a risk-management strategy for replacing behavior incrementally, behind a boundary stable enough that clients never notice the ground shifting underneath them.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
