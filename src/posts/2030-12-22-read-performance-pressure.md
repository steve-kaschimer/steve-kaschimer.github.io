---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-12-22
image: /images/posts/2030-12-22-hero.webp
image_alt: "A single query mark being repeated many times in a tight cluster around one unchanging data shape, implying heavy repetition against information that barely moves."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on many small repeated amber query-mark glyphs clustered tightly around one unchanging teal data shape at the center, implying heavy repeated demand against information that barely moves. Mood is repetitive and wasteful. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Running hammer-dashboard.ps1 200 times reveals the real problem: the operations dashboard's data changes far less often than it's requested, which is exactly the trade caching exists to make."
tags: ["dotnet", "architecture", "design-patterns", "caching"]
title: "Lab 19: When the Read Side Becomes Expensive"
---



Northstar's operations dashboard is genuinely useful, and it's also getting expensive. Every refresh asks the database for the total Saga count, the active count, the timed-out count, the compensated count, the average checkout amount, and the twenty slowest workflows. The query itself is legitimate - the pressure comes purely from how often it runs.

## Reproduce It

Run `./scripts/hammer-dashboard.ps1 -Count 200` and watch the same dashboard get recomputed over and over. The underlying data changes far less often than the dashboard gets requested.

## The Question

Does every single request actually need the exact current value? For an operational dashboard, a few seconds of staleness is probably fine, and if that's true, we can trade some freshness for lower database load and lower latency. That trade is what earns us a cache.

## What We Will Not Do

Payment authorization, inventory reservation, and Saga state transitions stay uncached - those are correctness-sensitive write concerns, not places where stale data is acceptable. Caching belongs on the read side, and only where staleness is a decision we've made on purpose.

## Next

The next stage wraps the dashboard in Cache-Aside, and deliberately deals with TTL, staleness, cache-miss stampedes, invalidation, and cache failure along the way - because those five things are the real architecture of caching, not the lookup itself.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
