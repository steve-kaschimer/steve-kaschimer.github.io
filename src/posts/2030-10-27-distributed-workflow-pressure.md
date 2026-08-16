---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-27
image: /images/posts/2030-10-27-hero.webp
image_alt: "Three separate solid shapes connected in sequence by a chain, with the final link broken and no path leading backward to the earlier shapes."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on three separate solid teal shapes connected in a left-to-right sequence by amber chain links, with the final link rendered broken and no path leading back toward the earlier shapes, implying committed steps that cannot simply be rewound. Mood is exposed and forward-only. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Checkout now spans Order, Inventory, and Payment as three independently committed responsibilities - when Payment declines after Inventory has already reserved stock, there is no local transaction left to roll back."
tags: ["dotnet", "architecture", "design-patterns", "distributed-systems"]
title: "Lab 11: When One Business Operation Stops Being One Transaction"
---

Checkout now spans three independently committed responsibilities:

```text
Order
Inventory
Payment
```

The coordinator calls them in sequence.

Under normal conditions, everything works.

## Break It

Configure Payment to decline.

The resulting state is:

```text
Order exists
InventoryReservation = Reserved
PaymentAuthorization = Declined
```

The HTTP request failed from the customer's perspective.

But some business effects already happened.

## Why Rollback No Longer Works

The inventory reservation committed in a separate operation.

There is no local transaction that can rewind it automatically.

The workflow itself now needs state and recovery behavior.

## The Question

What should happen after Payment declines?

The business answer is:

```text
Release Inventory
Cancel Checkout
```

That is a compensating action.

## Next

v13 introduces a Saga state machine.

The workflow becomes a durable concept rather than a sequence hidden inside one coordinator method.
