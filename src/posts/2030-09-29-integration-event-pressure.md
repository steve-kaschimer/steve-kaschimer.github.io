---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-29
image: /images/posts/2030-09-29-hero.webp
image_alt: "A solid checkmark on one side of a boundary line and a broken, dotted connection reaching toward the other side, implying a committed fact that has not actually reached its destination."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single solid amber checkmark on the left side of a vertical off-white boundary line, connected by a broken dotted teal line reaching toward an unfilled shape on the right side, implying a committed local fact that has not yet reliably crossed the boundary. Mood is exposed and unresolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Fulfillment needs to hear about every placed order reliably, not just conveniently - and a naive publish-after-commit step reveals exactly why an in-process domain event isn't a delivery guarantee."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Lab 7: When a Domain Event Needs a Delivery Guarantee"
---



The previous stage gave us a useful local fact - `OrderPlaced` - and now Fulfillment becomes its own operational concern. The requirement quietly shifts from "run some code after order placement" to "Fulfillment must eventually hear about every placed order," and those two things are not the same guarantee at all.

## Domain Event vs. Integration Event

The domain event, `OrderPlaced`, stays internal. A handler translates it into a distributed contract - `OrderPlacedIntegrationEvent` - which keeps the internal domain model from leaking into the external one.

## The Naive Implementation

This stage publishes right after commit: save the Order, then publish the message. Under normal conditions it works fine, which is exactly why the bug hiding inside it is dangerous.

## Break It

Configure publishing to fail and watch what happens: the order commits, but the integration event never goes out. No amount of retrying inside the current request can prove recovery after the process crashes - we've crossed into territory where two independent durable systems need to be coordinated, and a single in-request retry loop can't do that.

## The Pattern We Have Earned

Transactional Outbox. The next stage changes the sequence so the Order row and an OutboxMessage row save together in one transaction, and publishing happens later, out of band. The broker stops being part of the order transaction at all - that's the key move.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
