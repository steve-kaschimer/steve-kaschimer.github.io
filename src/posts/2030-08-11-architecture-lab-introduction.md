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

Northstar Commerce is the evolving companion application for Volume III - a small commerce app we'll deliberately under-build, then grow only when something forces our hand.

The baseline is about as plain as ASP.NET Core, EF Core, and SQLite get:

```text
ASP.NET Core -> EF Core -> SQLite
```

No future architecture gets pre-installed. Every pattern that shows up later in this lab has to answer a concrete problem - a new requirement, a scale constraint, a failure we actually hit - not a habit.

## Lab Rule

> Complexity must be earned.

## Baseline Experiment

Open `Features/Orders/PlaceOrder.cs`. Right now the use case owns everything: validation, product lookup, business decisions, calculation, persistence, and the HTTP response. That's fine for how simple the rules are today.

The next experiment pushes on that simplicity until it stops holding up, and we evolve the model in response.
