---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-09-01
image: /images/posts/2030-09-01-hero.webp
image_alt: "A single rich circular glyph on one side straining to fit through a narrow rectangular opening on the other, implying a write-oriented shape poorly suited to a read-oriented question."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single dense teal circular glyph on the left straining against a narrow amber rectangular opening on the right, unable to pass through cleanly, implying a rich write-side shape poorly suited to a simple read-side question. Mood is mismatched and constrained. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "An approval dashboard and an operations list expose the cost of reading through a rich aggregate: correct, but increasingly the wrong shape for questions the domain model was never built to answer."
tags: ["dotnet", "architecture", "design-patterns", "cqrs"]
title: "Lab 3: When the Write Model Becomes the Wrong Read Model"
---

Northstar's Order aggregate is doing exactly its job, protecting quantity rules, pricing, discounts, status transitions, approval rules, and cancellation. Then the product team asks for an approval dashboard, operations asks for a paginated order list, and customers ask for order history - and none of those requests actually need any domain behavior at all.

## The First Implementation

At this stage we deliberately reuse the aggregate's own read path. Open `ReadPressureEndpoints.cs` and you'll see the approval dashboard loading Orders, including Items, materializing full aggregates, then filtering, sorting, and projecting them down. Correct? Yes. Well-shaped for the problem? Less and less.

## The Read Requirement

All the approval dashboard actually needs is `OrderId`, `CustomerEmail`, `Total`, `Units`, and `CreatedAt`. It has no use for `Cancel()`, `Place()`, `ChangeQuantity()`, or `PricingPolicy` - those are valuable capabilities, just not to this particular read.

## The Operations List Is Worse

The operations endpoint loads every order, loads every item, then filters, sorts, and paginates all of it in memory - intentionally badly, to make the point. A database is much better at `WHERE`, `ORDER BY`, `COUNT`, `SKIP`/`TAKE`, and projection than our application code is. We're fighting the tool because the architecture insists on reading through the domain model, and that's simply the wrong constraint for this job.

## The Pressure

The system now wants two different shapes: a write model built around the Order aggregate's behavior, invariants, and consistency, and a read model built around `OrderListItem`, `PendingApprovalItem`, and `CustomerOrderHistoryItem`. Those two shapes have different reasons to change, and forcing one to serve both is what's been causing the friction.

## What We Will Do Next

The next stage introduces dedicated query handlers that project straight from the database - `.Select(x => new PendingApprovalOrder(...))` - with no aggregate rehydration, no domain behavior, no unnecessary item graph. Commands and queries still share the same database for now, and that's enough.

## Is That CQRS?

Yes, at the simplest useful level. CQRS begins the moment you intentionally separate write responsibility from read responsibility - it doesn't require two databases, Kafka, event sourcing, or projection workers. Those are later options, worth reaching for only if new forces actually justify them.

## What We Still Will Not Add

No message broker, no outbox, no read replica, no eventual consistency, no microservices. The problem in front of us is simply that reads and writes want different models, and that's the only problem we're solving right now.

## The Lesson

A rich Domain Model didn't become a mistake here - it's still the right tool for writes. The mistake would be making every read pay for write-side behavior it doesn't need. Reads and writes are starting to pull apart, and that pull is exactly the pressure CQRS exists to relieve.
