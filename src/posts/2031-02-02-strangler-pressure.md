---
author: Steve Kaschimer
companion_download: /downloads/northstar-modernization.zip
companion_download_label: "the modernization lab"
date: 2031-02-02
image: /images/posts/2031-02-02-hero.webp
image_alt: "A single routing gate positioned in front of an old, weathered trunk shape, with all traffic currently flowing through unchanged."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small amber routing-gate glyph positioned directly in front of a weathered teal trunk shape, with one thick off-white line flowing straight through the gate unchanged, implying an interception point that exists but has not yet redirected anything. Mood is watchful and patient. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A legacy Shipping capability full of unknown client dependencies gets a routing boundary in front of it - at first sending 100% of traffic to Legacy, but planting the seed a Strangler Fig migration needs."
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Lab 25: Modernization Is a Migration Problem"
---

Northstar now has a legacy Shipping capability.

It is ugly in ways that feel familiar:

```text
STATUS_CD
ACCOUNT_NO
SHIP_REF
LAST_ERR
```

The temptation is:

> Rewrite it.

That is not yet an architecture.

## The Real Problem

The old implementation contains unknown knowledge.

Its clients depend on behavior we may not fully understand.

A replacement must coexist with the current system while confidence grows.

## The First Move

Put a routing boundary in front of the capability.

At first:

```text
100% -> Legacy
```

Nothing changes behaviorally.

But now there is an interception point.

That is the seed of Strangler Fig.

## Next

Move one narrow capability:

```text
shipping status
```

to the new Fulfillment module.

Keep the rest legacy.

That makes the migration reversible.
