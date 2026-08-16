---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-15
image: /images/posts/2030-09-15-hero.webp
image_alt: "One small central node with several thick direct lines radiating outward to distinct destinations, implying a single operation now directly wired to every one of its side effects."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one small amber central node with four thick teal lines radiating directly outward to four distinct destination shapes at the frame's edges, implying a single operation now tightly wired to every one of its side effects. Mood is overloaded and tangled. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Confirmation email, loyalty points, fulfillment work, and analytics all pile into PlaceOrder - the command has quietly become the registry of everyone who cares that an order was placed."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Lab 5: When One Successful Command Creates Too Many Reactions"
---

Northstar's `PlaceOrder` command now succeeds.

Then the business asks for consequences:

```text
confirmation
loyalty
fulfillment
analytics
```

So we call them.

That is not bad engineering.

It is the simplest implementation.

## The New Shape

`PlaceOrder` now coordinates:

```text
domain behavior
persistence
confirmation
loyalty
fulfillment
analytics
```

The handler is becoming a list of reactions.

## The Hidden Coupling

If Analytics is removed, `PlaceOrder` changes.

If Loyalty adds a new dependency, `PlaceOrder` changes.

If Fulfillment becomes asynchronous, `PlaceOrder` changes.

The command knows too much about who cares that the order was placed.

## The Question

The domain knows this fact:

```text
OrderPlaced
```

Why should the aggregate or command know every consumer of that fact?

## Next

The next stage introduces a Domain Event:

```text
OrderPlaced
```

The aggregate records the fact.

Handlers react.

The application dispatches those reactions around the Unit of Work boundary.

We will still remain in-process.

No broker yet.

That distinction matters.
