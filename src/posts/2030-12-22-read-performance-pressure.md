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

Northstar's operations dashboard is useful.

It is also increasingly expensive.

Every refresh asks the database for:

```text
total Saga count
active Saga count
timed-out count
compensated count
average checkout amount
20 slowest workflows
```

The query is legitimate.

The pressure comes from repetition.

## Reproduce It

Run:

```powershell
./scripts/hammer-dashboard.ps1 -Count 200
```

The same dashboard is recomputed over and over.

The data changes much less frequently than it is requested.

## The Question

Must every request see the exact current value?

For an operational dashboard, perhaps a few seconds of staleness is acceptable.

If so, we can trade:

```text
freshness
```

for:

```text
lower database load
lower latency
```

That trade earns caching.

## What We Will Not Do

We will not cache:

```text
payment authorization
inventory reservation
Saga state transitions
```

Those are correctness-sensitive write concerns.

The cache belongs on the read side where stale data is explicitly acceptable.

## Next

v21 introduces Cache-Aside around the dashboard.

But we will also deliberately address:

```text
TTL
staleness
cache miss stampede
invalidation
cache failure
```

because those are the real architecture of caching.
