---
author: Steve Kaschimer
companion_download: /downloads/northstar-distributed.zip
companion_download_label: "the distributed lab"
date: 2031-01-05
image: /images/posts/2031-01-05-hero.webp
image_alt: "A shape with a small version tag attached, and a faint duplicate ghost outline of the same shape rendered slightly offset behind it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid teal shape with a small amber version-tag glyph attached to its corner, and one faint offset ghost outline of the same shape rendered behind it in off-white, implying a staleness check performed only at the moment of commit. Mood is watchful but permissive. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "CheckoutSaga now carries a version, and an operator action built against a stale version is refused rather than silently overwriting newer state - detection at commit, not a lock held for the length of a decision."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Lab 21: Optimistic Concurrency Protects Intent"
---



Northstar's workflow state is now long-lived, and that creates a new risk on its own: an operator reads Saga version 7, the workflow itself advances to version 8, and only then does the operator submit an action built against the version they originally read. Without concurrency protection, that stale action can silently overwrite state that's already moved on.

## The Version

`CheckoutSaga` now carries a `Version`, incremented on every meaningful transition, and EF Core treats it as a concurrency token.

## Expected Version

The operator endpoint accepts an `expectedVersion` in the request body. If the Saga has already moved to version 8 by the time that request arrives, it comes back as a `409 Conflict` instead of quietly succeeding - the application refuses to pretend a stale decision is still valid.

## Two Layers of Protection

The handler checks the expected version first, but EF Core still protects the actual database commit in case some other writer changes the row between the read and the save. That second layer isn't redundant - it's the one that actually closes the race.

## Why Not Lock the Saga?

Because the interaction here can involve a human thinking, or slow external work happening, and holding a database lock for that entire stretch would be both fragile and expensive. Optimistic concurrency lets work proceed independently and only checks for conflict at the moment of commit, which is exactly when it matters.

## The Lesson

Concurrency control was never really about who wins a race. It's about whether the system can safely apply an action against state that's already changed since the caller last looked at it - and that's a business decision dressed up as a database feature, not the other way around.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
