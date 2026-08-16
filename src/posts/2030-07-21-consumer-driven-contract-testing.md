---
author: Steve Kaschimer
date: 2030-07-21
image: /images/posts/2030-07-21-hero.webp
image_alt: "Two puzzle-piece-like shapes on either side of a boundary, one clearly defining the exact notch the other must fit."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two interlocking amber and teal puzzle-piece-shaped glyphs positioned on either side of a thin off-white boundary line, not yet joined, one shape's notch clearly defining the exact profile the other must match, implying an explicit expectation verified before deployment. Mood is precise and mutually accountable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Independent deployment creates a dangerous possibility:"
tags: ["dotnet", "architecture", "design-patterns", "testing"]
title: "Consumer-Driven Contract Testing: Catching Integration Breakage Before Deployment"
---

Independent deployment creates a dangerous possibility:

```text
Provider deploys
Provider tests pass
Consumer deploys
Consumer tests pass
Integration breaks
```

Consumer-Driven Contract Testing verifies that a provider still satisfies the interactions its consumers actually depend on.

## The Contract

A consumer records expectations such as:

```text
GET /customers/42

expects:
200
id
displayName
status
```

The provider verifies those expectations against its implementation.

## Why Not Share DTO Packages?

A shared assembly can keep compile-time types aligned.

It can also tightly couple release cycles and still miss runtime behavior:

```text
status codes
headers
serialization
optional fields
semantic meaning
```

Contracts should test the actual boundary.

## Consumer Ownership

The consumer defines what it needs.

That is important.

Provider-only tests tend to verify what the provider intends to expose, not necessarily what consumers rely on.

## HTTP and Messaging

The same principle applies to event contracts.

Consumer expectation:

```text
OrderPlaced contains
eventId
orderId
total
currency
```

Provider verification ensures new publisher code still produces compatible messages.

## Contract Broker / Registry

At scale, teams need somewhere to publish and discover contract versions and verification results.

CI can then answer:

```text
Can this provider version safely deploy
against known consumers?
```

## Contracts Are Not End-to-End Tests

Contract tests prove boundary compatibility.

They do not prove the entire production workflow works.

Use a testing portfolio:

```text
unit
integration
contract
small number of end-to-end tests
```

## Avoid Overspecification

A consumer should not contract-test every field in a response if it uses only three.

Overspecified contracts freeze irrelevant provider details.

Test the dependency that actually exists.

## Versioning

Contract verification helps teams evolve APIs additively and detect breaking changes before rollout.

It complements—not replaces—a versioning strategy.

## When It Helps

Use consumer-driven contracts when services or teams deploy independently and integration breakage is costly.

## When It Hurts

For one codebase deployed atomically, contract infrastructure may cost more than it saves.

## Summary

Consumer-Driven Contract Testing moves integration compatibility into CI.

The consumer declares the boundary it depends on, and the provider continuously proves that boundary still works.

That is much faster feedback than discovering incompatibility after independent deployments meet in production.
