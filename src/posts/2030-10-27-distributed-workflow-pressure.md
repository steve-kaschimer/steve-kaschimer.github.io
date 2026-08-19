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



Checkout now spans three independently committed responsibilities - Order, Inventory, and Payment - with a coordinator calling them in sequence. Under normal conditions it all just works.

## Break It

Configure Payment to decline, and the resulting state is a mess: the Order exists, the inventory reservation is `Reserved`, and the payment authorization is `Declined`. The HTTP request failed from the customer's point of view, but some of the business effects already happened anyway.

## Why Rollback No Longer Works

The inventory reservation committed as a separate operation, in a separate transaction, and there's no local transaction left that can automatically rewind it. The workflow itself now has to carry its own state and its own recovery behavior - nothing underneath it is going to do that job for free.

## The Question

What should happen once Payment declines? The business answer is to release the inventory and cancel the checkout - which is a compensating action, not a rollback. The reservation already happened; we're not pretending it didn't.

## Next

The next stage introduces a Saga state machine, so the workflow becomes a durable concept in its own right instead of a sequence of calls hidden inside one coordinator method.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
