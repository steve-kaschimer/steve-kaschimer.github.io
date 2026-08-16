---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-08-11
image: /images/posts/2030-08-11-hero.webp
image_alt: "A single small seed glyph at the center of an otherwise empty frame, implying a deliberately minimal starting point with room to grow."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one small solid teal seed-shaped glyph positioned at the exact center of an otherwise empty dark frame, with a faint amber outline suggesting the outline of a much larger shape it could become, implying a deliberately minimal starting point. Mood is deliberate and unhurried. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Introducing the Northstar Architecture Lab: a small ASP.NET Core + EF Core + SQLite commerce app that earns every pattern in this series the same way a real system would - one concrete pressure at a time."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Architecture Lab: Northstar Commerce"
---

Northstar Commerce is the evolving companion application for Volume III.

The baseline is deliberately simple:

```text
ASP.NET Core -> EF Core -> SQLite
```

We will not pre-install future architecture.

Each new pattern must answer a concrete problem introduced by a requirement, scale constraint, or failure scenario.

## Lab Rule

> Complexity must be earned.

## Baseline Experiment

Read `Features/Orders/PlaceOrder.cs`.

The use case currently owns validation, product lookup, business decisions, calculation, persistence, and response creation.

That is acceptable while the rules are simple.

The next experiment will deliberately increase business complexity until the limitations become visible.

Then we will evolve the model.
