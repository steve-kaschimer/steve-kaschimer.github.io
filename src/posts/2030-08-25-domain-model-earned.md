---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-08-25
image: /images/posts/2030-08-25-hero.webp
image_alt: "A circular glyph with dense internal texture lines radiating from its center, implying an object that now carries both data and meaningful behavior rather than being a plain container."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal circular glyph with dense amber internal texture lines radiating from its center outward, implying an object that has earned both data and meaningful behavior rather than remaining a plain container. Mood is settled and self-contained. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Order becomes an Aggregate Root, Money becomes a real value, and pricing gets a name - Northstar's Domain Model arrives only once the transaction scripts can no longer coherently own the rules."
tags: ["dotnet", "architecture", "design-patterns", "domain-driven-design"]
title: "Lab 2: The Domain Model Earns Its Keep"
---

Northstar v2 exposed a problem:

business rules had no clear owner.

`PlaceOrder`, `CancelOrder`, and `ChangeOrderQuantity` all knew pieces of Order behavior.

The fix is not "more services."

The fix is to model the business concept.

## What Changed

The Order is now an Aggregate Root.

```text
Order
├── Items
├── Status
├── Subtotal
├── Discount
└── Total
```

External code can no longer mutate important state directly.

Instead:

```csharp
order.AddItem(...);
order.ChangeQuantity(...);
order.Place();
order.Cancel();
```

## Money Became a Value

The previous model passed anonymous `decimal` values around.

Now:

```csharp
Money
```

gives monetary state a domain type.

This version keeps currency intentionally simple; later labs can enrich it if a requirement appears.

## Pricing Got a Name

VIP discount logic moved into:

```text
PricingPolicy
```

The application no longer needs to know the calculation rule.

## The Application Became Boring Again

That is a success.

`PlaceOrder` now:

```text
load products
create Order
ask Order to add items
ask Order to place itself
save
```

The business model does the business work.

## What Did Not Change

We still have:

```text
one application
one database
EF Core
synchronous HTTP
```

Domain complexity did not justify distributed architecture.

## New Pressure

The write model is getting richer.

Soon the UI will ask for things like:

```text
order list
customer name
status
total
shipment state
approval queue
dashboard summaries
```

Loading rich aggregates to answer every read will start to feel wrong.

That pressure will lead us toward dedicated Queries and then CQRS.

## Lesson

We did not introduce a Domain Model because DDD is fashionable.

We introduced it because the transaction scripts stopped being a coherent home for shared business rules.

The pattern was earned.
