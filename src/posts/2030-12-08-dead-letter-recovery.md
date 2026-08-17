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

Retries only make sense while another attempt might succeed.

A permanently failing message must eventually leave the normal processing path.

## The Failure Loop

Without a DLQ:

```text
receive
fail
requeue
receive
fail
requeue
...
```

Healthy work competes with poison work forever.

## The New Topology

Each queue now has:

```text
<queue>.dlx
<queue>.dead
```

After one redelivery failure, the message is rejected and dead-lettered.

## What DLQ Does Not Solve

Dead-lettering does not fix the business process.

It gives operations a durable place to inspect the failure.

The pattern is incomplete without ownership.

## Replay Safety

Because consumers already use Inbox/idempotent processing, replay is much safer.

That is another example of patterns composing:

```text
DLQ
  +
Idempotent Consumer
```

## Lesson

A queue should carry work that still has a reasonable chance of succeeding.

Dead-lettering protects throughput by moving permanently unhealthy work out of that path while preserving it for diagnosis.
