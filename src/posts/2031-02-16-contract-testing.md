---
author: Steve Kaschimer
companion_download: /downloads/northstar-contracts.zip
companion_download_label: "the contract testing lab"
date: 2031-02-16
image: /images/posts/2031-02-16-hero.webp
image_alt: "Two interlocking puzzle-piece shapes positioned on either side of a boundary line, one shape's notch precisely defining the profile the other must match."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two interlocking amber and teal puzzle-piece-shaped glyphs positioned on either side of a thin off-white boundary line, not yet joined, one shape's notch clearly defining the exact profile the other must match, implying an explicit, verifiable dependency rather than a shared assumption. Mood is precise and mutually accountable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A consumer-driven contract now records exactly what the Shipping/Fulfillment consumer depends on - nothing about internal legacy fields or provider implementation - so independent deploys stop meeting each other for the first time in production."
tags: ["dotnet", "architecture", "design-patterns", "testing"]
title: "Lab 27: Contract Tests Catch Boundary Breakage Early"
---

Northstar now has boundaries that may evolve independently.

That creates a question:

> How do we know a provider change still satisfies what consumers rely on?

## The Consumer View

The consumer cares about:

```text
OrderId
ShipmentReference
Status
```

It does not care about:

```text
internalProviderVersion
legacy status code
database schema
implementation class
```

The contract should capture only the dependency that actually exists.

## Provider Verification

The provider test starts the real ASP.NET Core app and verifies the response shape.

That gives us boundary-level feedback without requiring a full end-to-end environment.

## Why Not Share DTO Packages?

A shared DTO assembly may align types while still missing:

```text
status codes
serialization details
optional/required semantics
route behavior
```

And it tightly couples release cycles.

The contract should test the actual boundary.

## Why Not Test Everything?

Overspecified contracts become another form of coupling.

If the consumer does not use a field, do not freeze it accidentally.

## The Lesson

Consumer-driven contract testing gives independent teams confidence to evolve APIs while catching breaking changes before those versions meet in production.
