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

Northstar now has long-lived workflow state.

That creates a new risk:

```text
Operator reads Saga version 7
Workflow advances to version 8
Operator submits an action based on version 7
```

Without concurrency protection, the stale action may overwrite newer state.

## The Version

`CheckoutSaga` now carries:

```text
Version
```

Every meaningful transition increments it.

EF Core treats the version as a concurrency token.

## Expected Version

The operator endpoint accepts:

```json
{
  "expectedVersion": 7
}
```

If the Saga is now version 8:

```text
409 Conflict
```

The application refuses to pretend the stale decision is still valid.

## Two Layers of Protection

The handler first compares the expected version.

EF Core then still protects the database commit in case another writer changes the row between read and save.

That second layer matters.

## Why Not Lock the Saga?

The interaction may include humans or slow external work.

Holding a database lock for that duration would be fragile and expensive.

Optimistic concurrency lets work proceed independently and detects conflict at commit.

## The Lesson

Concurrency control is not about "who wins."

It is about whether the system may safely apply an action against state that has changed since the caller observed it.

That is a business decision, not merely a database feature.
