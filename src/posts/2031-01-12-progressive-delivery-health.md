---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2031-01-12
image: /images/posts/2031-01-12-hero.webp
image_alt: "A toggle switch shown in an intermediate position beside two small distinct gate glyphs labeled differently, implying deployment, release, and routing kept as separate decisions."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber toggle-switch glyph in an intermediate position on the left, beside two small distinct teal gate glyphs on the right, implying deployment, release, and traffic-routing kept as three separate, deliberate decisions. Mood is controlled and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A disabled feature flag separates deploying the new checkout flow from releasing it, while distinct liveness and readiness endpoints stop Northstar from conflating three very different operational questions."
tags: ["dotnet", "architecture", "design-patterns", "observability"]
title: "Lab 22: Safe Change Needs Runtime Controls"
---



Northstar is now important enough that deployment itself has become a source of risk. Feature flags and health checks help here, and they solve genuinely different problems.

## Feature Flag

The new checkout flow ships to production disabled - `Features:NewCheckoutFlow = false` - which separates deploying the code from releasing the behavior. We can flip it on gradually later without another deployment at all.

## Why the Flag Is at the Decision Boundary

The flag gets evaluated exactly once, near where checkout flow is selected. It doesn't get scattered as `if (newCheckout)` through domain logic, messaging, and persistence - keeping it at one boundary keeps the temporary complexity contained to one place instead of leaking everywhere.

## Flag Debt

A release flag needs an owner and a removal date. Leave both implementations sitting around long enough, and the flag stops being a rollout tool and quietly becomes architecture debt instead.

## Liveness

`/health/live` asks one narrow question: is this process alive enough that restarting it might actually help? It deliberately doesn't call any remote dependencies - a Payment outage shouldn't be a reason for every Ordering instance to restart itself.

## Readiness

`/health/ready` asks a different question - should this instance receive new traffic right now? That's a routing decision, and the check backing it stays intentionally cheap and conservative.

## Why Not One `/health` Endpoint?

Because "is it alive," "is it ready," and "are all its dependencies perfect" are three different questions, not one. Conflating them is what causes restart storms and unnecessary capacity loss - restarting a process because a downstream dependency is unhappy fixes nothing and makes things worse.

## The Lesson

Runtime safety isn't only about handling failures after they've happened. It's also about controlling how new behavior enters production in the first place, and giving the orchestration platform the right signals to route traffic safely around whatever's actually going on.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
