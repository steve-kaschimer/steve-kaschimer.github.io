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

Northstar v1 used a straightforward transaction script, and that was the right call at the time. But the business has moved on, and the script is starting to show it.

## New Rules

Northstar now needs product-specific purchase limits, discontinued-product checks, VIP discounts, approval for orders above $1,000, and status-dependent rules for both cancellation and modification. None of that is individually complicated. What makes it painful is that these rules all belong to the same handful of business concepts, and they keep turning up in different use cases.

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

That's a lot of reasons for one method to change.

## Inspect `CancelOrder`

Cancellation has its own status-transition rule buried inside it:

```csharp
if (order.Status == "Shipped")
```

The `Order` object itself has no idea a shipped order can't be cancelled - the rule only exists here, in this one handler. Any other use case that touches an order can walk right past it.

## Inspect `ChangeOrderQuantity`

This experiment is deliberately left half-finished. The handler can change quantity, but recalculating the price along with it exposes a real ownership question: where should subtotal, VIP discount, approval threshold, status transition, and quantity limit actually live? Put them all in every transaction script and you get duplicated behavior. Wrap them in one giant `OrderService` instead, and you've just moved the duplication into a different procedural class.

## Run the Tests

```bash
dotnet test
```

The current tests mostly check state after the fact. Try writing one that actually verifies business behavior without going through a script, and notice how awkward it gets - that's a second signal pointing the same direction as the first.

## The Architectural Pressure

What we're missing is one place that can say: an Order owns its own lifecycle, decides for itself whether it can be cancelled, and decides for itself whether its items can change. Money and pricing shouldn't be anonymous decimals passed around by convention. The application use case should coordinate that behavior, not contain it.

That's a description of a Domain Model, whether we call it one yet or not.

## What We Will Change Next

The next stage introduces an `Order` aggregate, `OrderStatus`, `Money`, behavior on `OrderItem`, a pricing policy, and other domain-oriented methods - after which the application script goes back to doing what it should have been doing all along: orchestration, not decision-making.

## What We Will Not Add Yet

No message broker, no CQRS infrastructure, no microservices, no distributed cache, no Saga, no Outbox. The problem in front of us is domain complexity, and it can be solved without leaving the process.

## The Lesson

Transaction Script didn't become a bad pattern. The forces around it changed - and noticing that distinction, rather than blaming the pattern, is the whole point of this lab.
