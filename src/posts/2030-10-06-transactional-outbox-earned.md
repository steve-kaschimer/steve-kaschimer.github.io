---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-10-06
image: /images/posts/2030-10-06-hero.webp
image_alt: "A sealed box glyph positioned directly beside a ledger entry mark, both enclosed by one shared stamp outline, implying two facts committed together as one atomic unit."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small sealed amber box glyph positioned directly beside a teal ledger-entry mark, both enclosed by one shared off-white stamp outline, implying a business change and its outbound message committed together as one atomic unit. Mood is atomic and dependable. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "The Order row and the Outbox row now commit together in one local transaction, and a separate dispatcher owns the remote publish - Northstar trades a hole in the workflow for an honest at-least-once guarantee."
tags: ["dotnet", "architecture", "design-patterns", "reliability"]
title: "Lab 8: Transactional Outbox Makes the Integration Event Durable"
---

The previous stage deliberately did the naive thing: save the Order, then publish the Integration Event. That left a hole - if the first step succeeded and the second never did, Ordering and Fulfillment quietly disagreed about reality.

## The New Transaction

This stage changes the write path so the Order row and an Outbox row commit together in one transaction. Both durable facts now succeed or fail as a pair.

## Why the Broker Is Not in the Transaction

The application isn't attempting a distributed transaction across SQLite and a broker - that's not what's happening here. It's storing the intent to publish locally, and leaving the actual remote operation to a background dispatcher.

## Break It

Make publishing fail. The dispatcher records the failure and the Outbox row just sits there, pending. Restore publishing, and the dispatcher tries again - the message survives the outage because the database already owned it the whole time.

## We Did Not Achieve Exactly Once

Picture the publish succeeding right before the process crashes, before `PublishedAt` gets saved. The dispatcher will publish it again. So the real guarantee here is at-least-once, not exactly-once - which is exactly why the next pressure lands on the receiving side.

## Next

We'll build a Fulfillment consumer and deliberately deliver the same message twice, and that's where Inbox / Idempotent Consumer earns its place.
