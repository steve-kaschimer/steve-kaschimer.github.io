---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2030-12-08
image: /images/posts/2030-12-08-hero.webp
image_alt: "A queue line flowing steadily left to right with one flagged item diverted into a small side compartment just off the main path."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a horizontal teal queue line flowing left to right with a steady stream of small marks, one mark flagged amber and diverted into a small quarantine compartment positioned just off the main line, implying poison work set aside without blocking the healthy stream. Mood is orderly and protective. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Each queue now gets a dead-letter exchange so a permanently failing message stops competing with healthy work - quarantined, not lost, and safe to replay because the consumer is already idempotent."
tags: ["dotnet", "architecture", "design-patterns", "messaging"]
title: "Lab 17: Dead Lettering Stops Poison Work From Owning the Queue"
---



Retries only make sense while another attempt has a real chance of succeeding. A message that's permanently broken needs to leave the normal processing path eventually, or it never will.

## The Failure Loop

Without a DLQ, the loop just runs forever: receive, fail, requeue, receive, fail, requeue. Healthy work ends up competing with poison work for the same queue, indefinitely.

## The New Topology

Each queue now has a `.dlx` and a `.dead` counterpart, and after one redelivery failure, the message gets rejected and dead-lettered instead of looping again.

## What DLQ Does Not Solve

Dead-lettering doesn't fix the underlying business process - it just gives operations a durable place to go look at the failure. Without someone actually owning that queue, the pattern is only half-finished.

## Replay Safety

Because the consumers already use Inbox-based idempotent processing, replaying a dead-lettered message is much safer than it would otherwise be. That's DLQ and Idempotent Consumer composing again, the same way earlier patterns have kept composing throughout this lab.

## Lesson

A queue should only carry work that still has a reasonable shot at succeeding. Dead-lettering protects throughput by moving permanently unhealthy work out of that path - without losing it, just setting it aside for someone to actually look at.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
