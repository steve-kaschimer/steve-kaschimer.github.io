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



Northstar v2 exposed the problem plainly: business rules had no clear owner. `PlaceOrder`, `CancelOrder`, and `ChangeOrderQuantity` each knew a piece of Order behavior, and none of them owned the whole thing. The fix isn't "more services" - it's modeling the business concept itself.

## What Changed

The Order is now an Aggregate Root:
```text
Order
├── Items
├── Status
├── Subtotal
├── Discount
└── Total
```

External code can no longer reach in and mutate important state directly. It has to ask:
```csharp
order.AddItem(...);
order.ChangeQuantity(...);
order.Place();
order.Cancel();
```

## Money Became a Value

The previous model passed anonymous `decimal` values around wherever money needed representing. `Money` gives that state a real domain type instead - deliberately simple for now, since currency handling can get richer once an actual requirement asks for it.

## Pricing Got a Name

The VIP discount logic moved into `PricingPolicy`, so the application no longer needs to know the calculation rule at all - it just asks for a price.

## The Application Became Boring Again

That's a good sign. `PlaceOrder` now just loads products, creates an Order, asks it to add items, asks it to place itself, and saves. The business model does the business work; the application script coordinates.

## What Did Not Change

Still one application, one database, EF Core, synchronous HTTP. Domain complexity is a real pressure, but it never asked for a distributed architecture, so we didn't reach for one.

## New Pressure

The write model keeps getting richer, and soon the UI is going to want an order list, a customer name, status, total, shipment state, an approval queue, dashboard summaries - the kind of thing a rich aggregate answers badly. Loading a full `Order` to satisfy a read like that will start to feel wrong, and that discomfort is what eventually pulls us toward dedicated queries and CQRS.

## Lesson

We didn't introduce a Domain Model because DDD is fashionable. We introduced it because the transaction scripts had stopped being a coherent home for shared business rules. The pattern was earned, not assumed.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
