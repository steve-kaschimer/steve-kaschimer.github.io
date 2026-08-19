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



Northstar now has a legacy Shipping capability, ugly in ways that feel painfully familiar: `STATUS_CD`, `ACCOUNT_NO`, `SHIP_REF`, `LAST_ERR`. The obvious temptation is to just rewrite it. That's not an architecture, though - it's a wish.

## The Real Problem

The old implementation carries knowledge nobody's fully written down, and its clients depend on behavior we don't completely understand yet. A replacement has to coexist with the current system while our confidence in it actually grows, not replace it in one leap of faith.

## The First Move

Put a routing boundary in front of the capability. At first, 100% of traffic still goes to Legacy, and nothing changes behaviorally at all - but there's now an interception point that didn't exist before, and that's the seed a Strangler Fig migration actually needs.

## Next

Move one narrow capability - shipping status - over to the new Fulfillment module, and leave everything else on the legacy path. Keeping the migration that small is exactly what makes it reversible.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
