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



The previous stage showed a familiar growth pattern: `PlaceOrder` sprouting a confirmation, then loyalty, then fulfillment, then analytics, until the command had quietly become the registry of everybody who cared that an order was placed.

## The Refactor

The Order aggregate now just records the fact - `OrderPlaced` - without knowing anything about email, loyalty, analytics, or fulfillment implementations. Application handlers pick up that fact and react independently.

## What Improved

Adding another in-process reaction no longer means editing `PlaceOrder`, and the business occurrence itself is now explicit and testable on its own. The aggregate's job is to say this happened; the application's job is to decide who cares.

## What Did Not Improve

Durability. This stage still dispatches after the database commit, which leaves a real gap: the order commit can succeed, the process can crash a moment later, and the domain-event handler never runs. That's not a bug in Domain Events - it's simply where the pattern's guarantees stop.

## The Next Big Step

Some of these reactions are purely local application behavior. Others - a fulfillment service that must know, an analytics pipeline that must know - are really external commitments in disguise. Once a reaction needs to survive a crash and cross a process boundary, in-memory dispatch stops being enough, and that's the pressure that eventually earns Integration Events, a message broker, and a Transactional Outbox. Not yet, though. First we needed to pull the fact apart from the reactions to it.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
