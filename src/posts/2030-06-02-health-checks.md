---
author: Steve Kaschimer
date: 2030-06-02
image: /images/posts/2030-06-02-hero.webp
image_alt: "A heartbeat line crossing through two small distinct gate glyphs labeled differently, implying separate liveness and readiness signals."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber heartbeat-pulse line crossing left to right through two small distinct teal gate glyphs positioned along its path, implying two separate operational questions answered by the same running process. Mood is vigilant and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A health endpoint answers an operational question about a running application."
tags: ["dotnet", "architecture", "design-patterns", "observability"]
title: "Health Checks: Liveness, Readiness, and Knowing What 'Healthy' Means"
---

A health endpoint answers an operational question about a running application.

The hard part is deciding **which question**.

```text
Is the process alive?
Can it receive traffic?
Are important dependencies usable?
```

Those are different questions.

## Liveness

Liveness asks:

> Is this process functioning enough that restarting it might help?

Keep liveness conservative.

If a remote dependency fails, restarting every application instance may make the outage worse.

## Readiness

Readiness asks:

> Should this instance receive new traffic?

An application can be alive but temporarily not ready.

Examples:

```text
startup initialization incomplete
required local state unavailable
instance draining for shutdown
```

## Dependency Health

You may also expose detailed dependency diagnostics for operators.

Do not automatically make every optional dependency a readiness requirement.

If Recommendations fails but Checkout can still work, taking Checkout out of rotation reduces availability unnecessarily.

## ASP.NET Core

ASP.NET Core supports health-check registration and mapped endpoints.

Conceptually:

```csharp
builder.Services
    .AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database");

app.MapHealthChecks("/health/live");
app.MapHealthChecks("/health/ready");
```

Use tags or separate registrations to give endpoints distinct semantics.

## Deep Checks Can Cause Load

A health probe that performs an expensive query every few seconds across hundreds of instances can become production traffic.

Health checks should be cheap and bounded.

## Startup

Readiness is useful during startup:

```text
process started
   |
warm required state
   |
ready
```

Traffic begins only after the application can serve it correctly.

## Graceful Shutdown

During shutdown:

```text
mark not ready
stop accepting new work
finish in-flight work
exit
```

This reduces dropped requests during deployments.

## Health vs. Observability

A green `/health` endpoint does not prove the application is healthy for users.

You still need:

- metrics;
- logs;
- traces;
- SLOs;
- synthetic tests.

Health checks are machine-oriented routing/recovery signals.

## Security

Detailed health output can reveal topology, versions, or dependency names.

Keep public responses minimal and restrict diagnostic details appropriately.

## When It Helps

Health checks are essential in orchestrated and load-balanced environments where machines need a safe signal for restart and traffic routing.

## When It Hurts

Poorly designed checks cause restart storms, remove healthy capacity, or create dependency load.

## Summary

Do not build one endpoint called `/health` and ask it to mean everything.

Separate liveness from readiness, classify dependencies by business criticality, and make probe behavior cheap enough to remain safe during an outage.
