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



Northstar's `PlaceOrder` command works. Now the business wants consequences - a confirmation, loyalty points, fulfillment work, an analytics update - so we just call them from inside the handler. That's not bad engineering. It's the simplest thing that could possibly work.

## The New Shape

`PlaceOrder` now coordinates domain behavior, persistence, confirmation, loyalty, fulfillment, and analytics all in one place. The handler is quietly turning into a list of reactions.

## The Hidden Coupling

Remove Analytics and `PlaceOrder` changes. Give Loyalty a new dependency and `PlaceOrder` changes. Make Fulfillment asynchronous and `PlaceOrder` changes again. The command has ended up knowing far more than it should about who cares that an order was placed.

## The Question

The domain already knows the fact that matters here: `OrderPlaced`. There's no real reason the aggregate, or the command sitting on top of it, needs to know every consumer of that fact.

## Next

The next stage introduces a Domain Event - the aggregate simply records that `OrderPlaced` happened, handlers react to it, and the application dispatches those reactions around the Unit of Work boundary. Everything stays in-process for now, with no broker in sight, and that distinction is going to matter quite a bit in a few stages.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
