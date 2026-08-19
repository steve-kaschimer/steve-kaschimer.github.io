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



Northstar now has boundaries that can evolve independently of each other, which raises an obvious question: how do we actually know a provider change still satisfies what its consumers depend on?

## The Consumer View

The consumer cares about `OrderId`, `ShipmentReference`, and `Status`. It doesn't care about an internal provider version, a legacy status code, the database schema, or which implementation class is behind any of it. The contract should capture exactly the dependency that exists - nothing more.

## Provider Verification

The provider test spins up the real ASP.NET Core app and verifies the shape of its response, which gives us boundary-level feedback without needing a full end-to-end environment just to catch a breaking change.

## Why Not Share DTO Packages?

A shared DTO assembly can align types on paper while still missing status codes, serialization details, optional-versus-required semantics, and actual route behavior - and it tightly couples both sides' release cycles in the process. A contract test checks the real boundary instead of a shared abstraction that might not reflect it.

## Why Not Test Everything?

Because an overspecified contract just becomes another form of coupling. If the consumer never touches a field, freezing that field into the contract anyway doesn't protect anything - it only makes the provider's life harder for no benefit.

## The Lesson

Consumer-driven contract testing gives independently deploying teams real confidence to evolve their APIs, and it catches the breaking changes before two independently deployed versions ever meet each other for the first time in production.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
