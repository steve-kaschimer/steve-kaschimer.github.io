---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-20
image: /images/posts/2030-10-20-hero.webp
image_alt: "Two identical duplicate stamp marks converging into one solid stamp mark protected inside a small locked outline, implying repeated delivery reduced to one safely recorded effect."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two faint duplicate amber stamp-mark glyphs converging into one solid teal stamp mark enclosed by a small off-white locked-outline border, implying repeated delivery safely reduced to exactly one recorded effect. Mood is protected and resolved. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "An Inbox marker and the resulting Fulfillment work now commit together under one unique key - the same duplicate delivery that created two work items before now produces exactly one."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Lab 10: Inbox Makes Duplicate Delivery Harmless"
---



The previous stage delivered one `OrderPlacedIntegrationEvent` twice, and Fulfillment created two work items in response - exactly what at-least-once delivery allows unless the consumer protects itself.

## The Inbox

This stage records `MessageId`, `Handler`, and `ProcessedAt` under a unique key, and the handler commits the Inbox marker together with the Fulfillment work in the same transaction.

## Why the Transaction Matters

Committing the fulfillment work first and the inbox marker second would be unsafe - a crash between the two commits could repeat the business effect. Doing it the other way around is just as bad: it could permanently suppress work that never actually happened. The marker and the effect need to live inside one local consistency boundary, not two.

## Why the Unique Constraint Matters

Two duplicates can arrive at almost the same instant, and both can observe "not processed yet" before either has committed anything. Something has to decide which one wins, and an application-level `if` check isn't fast enough to be that referee - only the database's unique constraint can settle it.

## Try It

Post the same event twice, then check `/lab/fulfillment/inbox` and `/lab/fulfillment/work`. You should find exactly one Inbox row and exactly one FulfillmentWork row, no matter how many times the event arrives.

## Pattern Composition

Northstar's reliable path now runs Ordering's transaction into an Outbox, out through an at-least-once publish, into Fulfillment's Inbox, and only then into the business effect. Outbox protects the producer; Inbox protects the consumer. Together they form a reliable local-to-local bridge - not a globally atomic distributed system, just two honest local transactions doing their part.

## Next

With that bridge in place, we can make the workflow genuinely distributed. Placing an order is about to require reserving inventory, authorizing payment, and scheduling fulfillment, each owned by its own participant with its own transaction - and once any of those steps can fail after an earlier one has already committed, that's the pressure Saga exists to solve.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
