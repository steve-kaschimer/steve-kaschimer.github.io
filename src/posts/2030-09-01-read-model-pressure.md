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

Northstar's Order aggregate is doing its job.

It protects:

```text
quantity rules
pricing
discounts
status transitions
approval rules
cancellation
```

Then the product team asks for an approval dashboard.

The operations team asks for a paginated order list.

Customers ask for order history.

Nothing about those requests requires domain behavior.

## The First Implementation

In this stage, we intentionally reuse the aggregate read path.

Open:

```text
ReadPressureEndpoints.cs
```

The approval dashboard does this:

```text
load Orders
include Items
materialize aggregates
filter
sort
project
```

Correct?

Yes.

Efficient and well-shaped for the problem?

Increasingly no.

## The Read Requirement

The approval dashboard needs only:

```text
OrderId
CustomerEmail
Total
Units
CreatedAt
```

It does not need:

```text
Cancel()
Place()
ChangeQuantity()
PricingPolicy
```

Those capabilities are valuable on the write side.

They are irrelevant to this read.

## The Operations List Is Worse

The operations endpoint:

```text
loads every order
loads every item
filters in memory
sorts in memory
paginates in memory
```

Again, this is intentionally poor.

The database is much better at:

```text
WHERE
ORDER BY
COUNT
SKIP / TAKE
projection
```

We are fighting the tool because the architecture says:

> read through the domain model.

That is the wrong constraint.

## The Pressure

Our system now wants two different shapes.

### Write model

```text
Order Aggregate
  behavior
  invariants
  consistency
```

### Read model

```text
OrderListItem
PendingApprovalItem
CustomerOrderHistoryItem
```

These models have different reasons to change.

## What We Will Do Next

The next stage will introduce dedicated query handlers.

The database will project directly:

```csharp
.Select(x => new PendingApprovalOrder(...))
```

No aggregate rehydration.

No domain behavior.

No unnecessary item graph.

At first, commands and queries will still share the same database.

That is enough.

## Is That CQRS?

Yes—at the simplest useful level.

CQRS begins when we intentionally separate:

```text
write responsibility
from
read responsibility
```

It does not require:

```text
two databases
Kafka
event sourcing
projection workers
```

Those are later options if new forces justify them.

## What We Still Will Not Add

We do not need:

```text
message broker
outbox
read replica
eventual consistency
microservices
```

The current problem is simply that reads and writes want different models.

We will solve exactly that problem.

## The Lesson

A rich Domain Model did not become a mistake.

It is still the right tool for writes.

The mistake would be requiring every read to pay for write-side behavior it does not need.

Different responsibilities are beginning to pull apart.

That is the pressure CQRS exists to relieve.
