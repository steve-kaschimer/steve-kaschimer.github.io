---
author: Steve Kaschimer
date: 2030-06-23
image: /images/posts/2030-06-23-hero.webp
image_alt: "A shape with a small version tag, and one faint duplicate ghost outline slightly offset behind it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on one solid teal shape with a small amber version-tag glyph attached to its corner, and one faint offset ghost outline of the same shape rendered behind it in off-white, implying a staleness check performed only at the moment of commit rather than a held lock. Mood is watchful but permissive. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Optimistic concurrency assumes conflicts are uncommon enough that work can proceed without holding a long-lived lock."
tags: ["dotnet", "architecture", "design-patterns", "concurrency"]
title: "Optimistic Concurrency: Detecting Conflicting Changes Without Holding Locks"
---



Optimistic concurrency assumes conflicts are uncommon enough that work can proceed without holding a long-lived lock. At commit time, the system asks:
> Has this state changed since I read it?

If yes, the write is rejected or reconciled.

## Version Token

```text
Order 42
Version = 7
```

A client loads version 7. Another request updates the order to version 8. The original client tries:
```text
UPDATE ... WHERE Id = 42 AND Version = 7
```

Zero rows are updated. A conflict occurred.

## EF Core

EF Core supports concurrency tokens.
```csharp
public sealed class Order
{
    public Guid Id { get; private set; }

    [Timestamp]
    public byte[] Version { get; private set; } = [];
}
```

On conflict, `SaveChangesAsync` can throw `DbUpdateConcurrencyException`. The application decides what the conflict means.

## Conflict Strategies

Possible responses:
```text
reject and ask user to reload
retry command against new state
merge non-conflicting fields
apply domain-specific reconciliation
```

Do not automatically retry every conflict. If two humans edited the same meaningful field, silent last-writer-wins may lose business intent.

## Aggregate Boundary

Optimistic concurrency fits naturally around a DDD Aggregate.
```text
load Aggregate v7
perform domain behavior
save expected v7
```

The aggregate's consistency boundary becomes the concurrency boundary.

## HTTP ETags

The same concept can cross HTTP. Server:
```text
ETag: "7"
```

Client update:
```text
If-Match: "7"
```

If the resource changed, return a precondition/conflict response instead of overwriting newer state.

## Commands

A command can carry an expected version:
```csharp
public sealed record ChangeShippingAddress(
    OrderId OrderId,
    long ExpectedVersion,
    Address Address);
```

This makes concurrency intent explicit.

## When Optimism Works

It works well when:
- conflicts are relatively rare;
- transactions should remain short;
- users/processes can retry or reconcile.

## When It Does Not

If hundreds of workers constantly update the same record, optimistic retries may become contention loops. The real design may need:
- partitioning;
- serialization through a queue;
- a different aggregate boundary.

## Testing

Test:
```text
two readers load same version
first update succeeds
second detects conflict
```

Also test the chosen recovery semantics.

## Summary

Optimistic concurrency does not prevent simultaneous work. It prevents one writer from unknowingly overwriting state that changed since it was read. Detection is easy. The business decision about what to do after detection is the real pattern.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
