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

Northstar is now important enough that deployment itself becomes a source of risk.

Two tools help us separate concerns:

```text
Feature Flag
Health Checks
```

They solve very different problems.

## Feature Flag

The new checkout flow is deployed but disabled:

```text
Features:NewCheckoutFlow = false
```

That separates:

```text
code deployment
```

from:

```text
behavior release
```

We can later enable the feature gradually without another deployment.

## Why the Flag Is at the Decision Boundary

The flag is evaluated once near checkout-flow selection.

We do not scatter:

```csharp
if (newCheckout)
```

through domain logic, messaging, and persistence.

That keeps the temporary complexity localized.

## Flag Debt

A release flag should have an owner and removal date.

If both implementations become permanent accidentally, the flag becomes architecture debt.

## Liveness

`/health/live` asks:

> Is this process alive enough that restarting it might help?

It deliberately does not call remote dependencies.

A Payment outage should not cause every Ordering instance to restart.

## Readiness

`/health/ready` asks:

> Should this instance receive new traffic?

That is a routing decision.

The example is intentionally conservative and cheap.

## Why Not One `/health` Endpoint?

Because:

```text
alive
ready
all dependencies perfect
```

are not the same question.

Conflating them causes restart storms and unnecessary capacity loss.

## The Lesson

Runtime safety is not only about handling failures after they happen.

It is also about controlling how new behavior enters production and giving orchestration platforms the right signals to route traffic safely.
