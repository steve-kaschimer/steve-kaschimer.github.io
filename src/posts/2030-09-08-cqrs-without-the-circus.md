---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-08
image: /images/posts/2030-09-08-hero.webp
image_alt: "One path forking cleanly into two distinct paths, one leading to a pencil-shaped write glyph and the other to a lens-shaped read glyph, both still rooted in the same single base."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal path forking into two distinct branches from one shared amber base, the upper branch ending in a small pencil-shaped write glyph and the lower branch ending in a small lens-shaped read glyph, implying separated responsibility without separated infrastructure. Mood is clean and unhurried. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Northstar gets CQRS with no second database, no broker, and no event sourcing - just dedicated query handlers projecting directly from the same store the domain model already writes to."
tags: ["dotnet", "architecture", "design-patterns", "cqrs"]
title: "Lab 4: CQRS Without the Circus"
---



Northstar now has CQRS - no second database, no Kafka, no Event Sourcing, no projection worker. Just this:
```text
Commands
  |
Domain Model
  |
       Same Database
  |
Queries
  |
Direct projection
```

That's enough.

## What Changed

The write side still protects behavior through the `Order` aggregate. The read side now runs through dedicated query handlers - `GetPendingApprovalOrders`, `GetCustomerOrderHistory`, `SearchOperationsOrders` - each projecting straight into the shape its caller actually needs.

## Compare v4

The v4 operations query effectively pulled the entire aggregate graph and then filtered, sorted, paginated, and projected it in memory. v5 pushes those operations back where they belong - `WHERE`, `ORDER BY`, `SKIP`, `TAKE`, `SELECT` - so the application receives only the read model it asked for.

## Did We Add a Repository?

No. The queries talk to EF Core directly. A repository earns its keep when it expresses an aggregate's persistence boundary, and these read models aren't aggregates - hiding `IQueryable` behind a generic repository here would just add ceremony without solving anything.

## Did We Add Mediator?

No. The endpoint takes a `GetPendingApprovalOrders` query handler directly. A mediator might earn its place later if we need a shared dispatch pipeline, but right now a plain method call is clearer.

## Did We Split the Database?

No. The same transactionally consistent database serves both sides, which means a write completes and the very next read already sees the new state - no projection lag. We won't trade that guarantee away until something actually gives us a reason to.

## What CQRS Bought Us

The write model can grow richer without making reporting any harder, and the read model can grow more specialized without weakening a single domain invariant. Writes stay optimized for correctness; reads stay optimized for the questions people actually ask. Neither side has to compromise for the other anymore.

## The Next Pressure

Placing an order now has consequences: send a confirmation email, award loyalty points, create fulfillment work, update analytics. We could bolt all of that directly onto `PlaceOrder`, and it would work - so, as usual, we're going to do just enough of that to feel the pressure ourselves before Domain Events earn their place.

## Lesson

CQRS didn't arrive here as a distributed architecture. It arrived as a design decision - reads and writes have different responsibilities - and everything beyond that decision stays optional until something forces it.
---

C# or .NET question? Ask away. [steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
