---
author: Steve Kaschimer
companion_download: /downloads/northstar-baseline.zip
companion_download_label: "the baseline application"
date: 2030-08-18
image: /images/posts/2030-08-18-hero.webp
image_alt: "A single straight procedural arrow beginning to fray into several diverging threads partway along its length, implying one simple procedure starting to split under the weight of new rules."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single bold teal arrow running left to right that begins to fray into three thin diverging amber threads partway along its length, implying one simple procedure starting to split under the weight of accumulating business rules. Mood is strained and diverging. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Northstar's transaction scripts start duplicating business rules across PlaceOrder, CancelOrder, and ChangeOrderQuantity - the first real pressure toward a richer domain model."
tags: ["dotnet", "architecture", "design-patterns", "software-design"]
title: "Lab 1: When Transaction Script Starts to Hurt"
---

Northstar v1 used a straightforward transaction script.

That was the right design.

Now the business has changed.

## New Rules

Northstar now requires:

- product-specific purchase limits;
- discontinued-product checks;
- VIP discounts;
- approval for orders above $1,000;
- status-dependent cancellation;
- status-dependent modification.

None of these rules are individually complicated.

The problem is that they belong to the same business concepts and begin appearing in different use cases.

## Inspect `PlaceOrder`

`PlaceOrder` now knows about:

```text
product availability
quantity policy
VIP recognition
discount calculation
approval thresholds
order status
persistence
HTTP results
```

That is a lot of reasons to change.

## Inspect `CancelOrder`

Cancellation contains status-transition rules:

```csharp
if (order.Status == "Shipped")
```

The `Order` object itself does not know that a shipped order cannot be cancelled.

Any other use case can accidentally bypass that rule.

## Inspect `ChangeOrderQuantity`

This experiment is deliberately incomplete.

The handler can change quantity, but recalculating pricing now exposes an ownership problem.

Where should these rules live?

```text
subtotal
VIP discount
approval threshold
status transition
quantity limit
```

Putting them all in every transaction script will duplicate behavior.

Creating a giant `OrderService` merely moves the duplication into another procedural class.

## Run the Tests

```bash
dotnet test
```

The current tests mostly verify state.

Notice how awkward it is to test real business behavior without going through the scripts.

That is another signal.

## The Architectural Pressure

We now need somewhere that can say:

```text
An Order owns its lifecycle.

An Order decides whether it can be cancelled.

An Order decides whether items can change.

Money and pricing should not be anonymous decimals.

The application use case should coordinate,
not contain the business itself.
```

Those statements point toward a Domain Model.

## What We Will Change Next

The next stage will introduce:

```text
Order aggregate
OrderStatus
Money
OrderItem behavior
Pricing policy
domain-oriented methods
```

Then the application script becomes orchestration again.

## What We Will Not Add Yet

We still do not need:

```text
message broker
CQRS infrastructure
microservices
distributed cache
Saga
Outbox
```

The new problem is domain complexity.

We will solve that problem locally.

## The Lesson

Transaction Script did not become a bad pattern.

The forces changed.

That distinction is the point of the lab.
