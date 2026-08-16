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

Northstar now has CQRS.

It does not have two databases.

It does not have Kafka.

It does not have Event Sourcing.

It does not have a projection worker.

It has this:

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

That is enough.

## What Changed

The write side still protects behavior through the `Order` aggregate.

The read side now uses dedicated query handlers:

```text
GetPendingApprovalOrders
GetCustomerOrderHistory
SearchOperationsOrders
```

Each projects directly into the shape the caller needs.

## Compare v4

The v4 operations query effectively did:

```text
SELECT entire aggregate graph
then
filter
sort
paginate
project
```

v5 moves those operations back where they belong:

```text
database:
WHERE
ORDER BY
SKIP
TAKE
SELECT
```

The application receives only the requested read model.

## Did We Add a Repository?

No.

The queries use EF Core directly.

A repository is useful when it expresses an aggregate persistence boundary.

These read models are not aggregates.

Hiding `IQueryable` behind a generic repository would add ceremony without solving the read problem.

## Did We Add Mediator?

No.

The endpoint receives a query handler directly.

```csharp
GetPendingApprovalOrders query
```

A mediator might become useful later if we need a shared dispatch pipeline.

Right now a method call is clearer.

## Did We Split the Database?

No.

The same transactionally consistent database serves both sides.

That means:

```text
write completes
read sees new state
```

without projection lag.

We will not trade that guarantee away until something gives us a reason.

## What CQRS Bought Us

The write model can become richer without making reporting harder.

The read model can become more specialized without weakening domain invariants.

```text
WRITE
optimized for correctness

READ
optimized for questions
```

The models no longer compromise each other.

## The Next Pressure

Placing an order now has consequences.

The business asks:

```text
send confirmation email
award loyalty points
create fulfillment work
update analytics
```

We could add them all directly to `PlaceOrder`.

That would work.

And, as usual, we are going to do just enough of that to see the pressure first.

Then Domain Events will earn their place.

## Lesson

CQRS did not arrive as a distributed architecture.

It arrived as a design decision:

> Reads and writes have different responsibilities.

Everything beyond that remains optional.
