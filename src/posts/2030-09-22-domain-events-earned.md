---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-22
image: /images/posts/2030-09-22-hero.webp
image_alt: "One small central node with a burst of thin, independent lines radiating outward, each terminating in a small open circle rather than connecting directly, implying reactions that exist independently of the source."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one small teal central node with a burst of four thin amber lines radiating outward, each terminating in a small unfilled circle rather than a hard connection, implying independent reactions that exist without being wired directly into the source. Mood is decoupled and light. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Order aggregate now simply records that OrderPlaced happened; application handlers react independently, and PlaceOrder stops being a registry of everyone who cares."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Lab 6: Domain Events Separate Facts From Reactions"
---

v6 showed a natural growth pattern:

```text
PlaceOrder
  |
  + confirmation
  + loyalty
  + fulfillment
  + analytics
```

The command had become the registry of everybody who cared about order placement.

## The Refactor

The Order aggregate now records:

```text
OrderPlaced
```

That is a domain fact.

It does not know:

```text
email
loyalty implementation
analytics
fulfillment implementation
```

Application handlers react independently.

## What Improved

Adding another in-process reaction no longer requires editing `PlaceOrder`.

The business occurrence is now explicit and testable.

The aggregate says:

```text
this happened
```

The application decides:

```text
who cares
```

## What Did Not Improve

Durability.

This stage dispatches after the database commit.

That means this failure is possible:

```text
Order commit succeeds
Process crashes
Domain-event handler never runs
```

This is not a bug in Domain Events.

It is the boundary of the pattern.

## The Next Big Step

Some reactions are merely local application behavior.

Others eventually become external commitments:

```text
Fulfillment service must know
Analytics pipeline must know
```

Once that requirement becomes durable and cross-process, in-memory dispatch is not enough.

That pressure will earn:

```text
Integration Event
Message Broker
Transactional Outbox
```

But not yet.

First, we needed to separate the fact from the reactions.
