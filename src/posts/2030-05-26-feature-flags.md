---
author: Steve Kaschimer
date: 2030-05-26
image: /images/posts/2030-05-26-hero.webp
image_alt: "A toggle switch glyph shown in an intermediate position, implying gradual, controlled activation."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber toggle-switch glyph rendered in an intermediate position between fully off and fully on, with a faint teal gradient trailing behind the toggle implying gradual, controlled activation rather than an instant flip. Mood is gradual and controlled. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A feature flag lets deployed code exist without making the behavior available to everyone."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Feature Flags: Separating Deployment From Release"
---

A feature flag lets deployed code exist without making the behavior available to everyone.

```text
Deploy code
   |
flag OFF
   |
enable gradually
```

This separates **deployment** from **release**.

## Basic Example

```csharp
if (await features.IsEnabledAsync(
    "NewCheckout",
    cancellationToken))
{
    return await newCheckout.ExecuteAsync(...);
}

return await oldCheckout.ExecuteAsync(...);
```

The conditional is easy.

The lifecycle is the pattern.

## Types of Flags

Useful categories include:

```text
release flag
experiment flag
operations/kill-switch flag
permission/entitlement flag
```

They have different expected lifetimes.

A release flag should usually disappear after rollout.

## Progressive Delivery

A flag can target:

```text
internal users
1% of customers
one tenant
one region
50%
100%
```

This reduces blast radius.

## Kill Switch

Some flags exist specifically to disable optional or risky behavior quickly:

```text
recommendation engine causing failures
-> disable recommendations
```

That can be faster and safer than an emergency deployment.

## Flags and Domain Logic

Avoid scattering:

```csharp
if (flag) ...
```

through every layer.

Evaluate the flag near the decision boundary and choose one coherent behavior path.

Otherwise two implementations become interleaved and difficult to remove.

## Flag Debt

Every temporary flag creates two possible systems.

Ten boolean flags can theoretically create 1,024 combinations.

Remove obsolete flags aggressively.

Store metadata such as:

```text
owner
purpose
created date
expiration date
```

## Testing

Test both meaningful paths while the flag exists.

For targeted rollouts, test evaluation rules too.

## Security

A feature flag is not authorization.

If a user is forbidden from an operation, enforce authorization even when the feature is enabled.

## When It Helps

Feature flags are excellent for progressive rollout, experiments, operational kill switches, and separating deployment from customer release.

## When It Hurts

Long-lived unmanaged flags create hidden configuration complexity and dead code.

## Summary

Feature flags make release a runtime decision.

Their power comes from reversibility and controlled exposure.

Their cost is combinatorial complexity, so every temporary flag should have a retirement plan.
