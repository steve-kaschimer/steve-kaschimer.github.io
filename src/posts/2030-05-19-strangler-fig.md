---
author: Steve Kaschimer
date: 2030-05-19
image: /images/posts/2030-05-19-hero.webp
image_alt: "A thin vine shape gradually overtaking and replacing a solid trunk shape beside it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one solid amber trunk shape on the left gradually being overtaken by a thin teal vine shape wrapping around and extending past it on the right, implying incremental replacement growing around an existing system rather than a single cutover. Mood is incremental and organic. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Strangler Fig pattern replaces an existing system incrementally."
tags: ["dotnet", "architecture", "design-patterns", "microservices"]
title: "Strangler Fig: Modernizing Systems Without the Big-Bang Rewrite"
---

The Strangler Fig pattern replaces an existing system incrementally.

```text
Clients
   |
Routing Boundary
  / Old  New
```

New behavior grows around the old system until the old implementation can be retired.

## Why Not Rewrite Everything?

Big-bang rewrites combine several risks:

- requirements rediscovery;
- feature parity;
- migration;
- operational cutover;
- years of accumulated edge cases.

The old system continues changing while the replacement is being built.

Strangler Fig reduces the size of each bet.

## Choose a Slice

Do not begin with:

```text
rewrite database
```

Begin with a business capability:

```text
Customer Search
Invoice Generation
Order History
```

Route that capability to the new implementation while everything else remains old.

## Routing

The interception point might be:

- reverse proxy;
- API gateway;
- facade;
- message router;
- application adapter.

```text
/orders/history -> New
/orders/create  -> Legacy
```

## Data Is Usually Harder Than Routing

Code can be strangled endpoint by endpoint.

Data ownership is harder.

Migration strategies include:

```text
new module reads legacy data
new system owns new records
CDC replicates selected data
explicit migration
```

Avoid indefinite dual writes if possible. They create synchronization ambiguity.

## Anti-Corruption Layer

The new model should not become a prettier wrapper around the legacy model.

Use an ACL:

```text
New Domain
   |
Translation
   |
Legacy Model
```

This lets modernization improve the model rather than preserve every historical accident.

## Measure Progress

Track capabilities, traffic, and data ownership moved to the new system.

A strangler program without deletion becomes:

```text
Legacy + New + Integration Forever
```

Retirement is part of the pattern.

## Rollback

Incremental routing makes rollback easier.

If a new slice fails, route traffic back while fixing it—provided data semantics still permit that.

## When It Helps

Use Strangler Fig for systems too important or complex to replace safely in one cutover.

## When It Hurts

It adds temporary architecture: routing, translation, duplicated capability, and migration machinery.

For a small replaceable application, a clean replacement may be cheaper.

## Summary

Strangler Fig turns modernization into a sequence of reversible capability migrations.

The destination matters, but so does creating a safe path from here to there.
