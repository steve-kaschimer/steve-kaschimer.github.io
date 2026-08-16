---
title: "Command: Modeling an Intent to Change the System"
slug: "command"
description: "Model application requests as explicit business intentions, distinguish commands from events and CRUD updates, and design command handling around validation, invariants, transactions, and idempotency."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Commands, Queries & Data"
order: 17
dotnet: "10"
csharp: "14"
status: "draft"
---

# Command: Modeling an Intent to Change the System

A Command is a request to make something happen.

```csharp
public sealed record PlaceOrder(
    CustomerId CustomerId,
    IReadOnlyList<OrderLineRequest> Lines);
```

That sounds simple.

But treating commands as explicit business intentions changes how we think about application APIs.

## Commands Are Imperative

Good command names sound like actions:

```text
PlaceOrder
CancelOrder
AuthorizePayment
ChangeShippingAddress
ApproveExpense
```

Compare them with:

```text
UpdateOrder
SaveCustomer
SetStatus
```

The second group describes data manipulation.

The first group describes **business intent**.

That difference matters because the application can evaluate whether the requested action is allowed.

## A Command Is Not an Event

A command says:

> Please do this.

An event says:

> This happened.

```text
PlaceOrder      Command
OrderPlaced     Event

AuthorizePayment   Command
PaymentAuthorized  Event
```

A command can be rejected.

An event represents a fact that has already occurred.

Microsoft's .NET architecture guidance makes this same distinction: commands are requests and may be refused, while events describe occurrences. It also emphasizes that a command normally has one intended receiver.

## Commands Are Messages, Not Necessarily Broker Messages

This is a command:

```csharp
public sealed record CancelOrder(
    OrderId OrderId,
    string Reason);
```

even if it is dispatched with an ordinary method call:

```csharp
await handler.HandleAsync(command, ct);
```

A mediator can dispatch it.

A message broker can transport it.

Neither mechanism defines the pattern.

## Commands Should Express the Use Case

Suppose the UI wants to reserve a hotel room.

Prefer:

```csharp
BookRoom
```

over:

```csharp
UpdateReservationStatus(
    ReservationStatus.Reserved)
```

Why?

Because `BookRoom` gives the application a place to enforce:

- availability;
- guest eligibility;
- payment requirements;
- cancellation policy;
- pricing rules.

A generic update command leaks storage-oriented thinking into the application contract.

## Commands Usually Return Small Results

A command may return:

```text
nothing
identifier
success/failure
small operation result
```

For example:

```csharp
public sealed record PlaceOrderResult(
    OrderId OrderId);
```

Avoid making command handlers double as arbitrary query endpoints.

If the caller needs a complex read model after the operation, it can issue a query.

## Command Handler

```csharp
public sealed class PlaceOrderHandler(
    IOrderRepository orders,
    IUnitOfWork unitOfWork)
{
    public async Task<PlaceOrderResult> HandleAsync(
        PlaceOrder command,
        CancellationToken cancellationToken)
    {
        var order = Order.Create(
            OrderId.New(),
            command.CustomerId);

        foreach (var line in command.Lines)
        {
            order.AddItem(
                line.ProductId,
                line.UnitPrice,
                line.Quantity);
        }

        order.Place();

        orders.Add(order);

        await unitOfWork.SaveChangesAsync(
            cancellationToken);

        return new(order.Id);
    }
}
```

The handler coordinates the use case.

The aggregate owns domain invariants.

## Boundary Validation vs. Domain Validation

The command boundary can reject malformed input:

```text
CustomerId missing
No lines supplied
String too long
```

The domain protects business invariants:

```text
Order cannot be placed twice
Quantity must be positive
Credit limit cannot be exceeded
```

Do not rely solely on command validation for invariants.

Someone may invoke the domain from another use case later.

## Transaction Boundary

A command is often a natural transaction boundary:

```text
Receive command
      |
Load aggregate
      |
Execute behavior
      |
Persist
      |
Commit
```

This does not mean every command requires a database transaction.

It means the use case should have intentional consistency semantics.

## Command Identity

Network retries introduce a dangerous question:

```text
Did the command fail,
or did the response fail?
```

Imagine:

```text
POST /orders
   |
server creates order
   |
response lost
   |
client retries
```

Without command identity, the application may create two orders.

An idempotency key can associate retries with the same logical operation.

We will treat that as its own pattern in Article 21.

## Commands and Authorization

Task-based commands create useful authorization boundaries.

```text
Can user edit Order?
```

is often less meaningful than:

```text
Can user CancelOrder?
Can user ApproveOrder?
Can user RefundOrder?
```

Authorization can align with actual business capabilities.

## Commands and Vertical Slices

Commands fit naturally into feature-oriented organization:

```text
Orders/
  Place/
    Command.cs
    Handler.cs
    Endpoint.cs

  Cancel/
    Command.cs
    Handler.cs
    Endpoint.cs
```

Each command represents one meaningful application operation.

## Commands and Mediator

A mediator can dispatch:

```csharp
await sender.SendAsync(
    new PlaceOrder(...),
    cancellationToken);
```

That can enable pipelines for validation, transactions, or telemetry.

But the command pattern does not require mediator infrastructure.

Direct handler injection remains perfectly valid.

## Testing

Command-handler tests should prove the use case.

```text
Given a draft order
When PlaceOrder executes
Then the order becomes placed
And the unit of work commits
```

Avoid tests that merely verify every collaborator method was called in a particular order unless that order is part of the behavior.

## When It Helps

Commands are useful when:

- application operations have meaningful intent;
- writes have business rules;
- task-based APIs communicate better than CRUD;
- authorization maps to actions;
- command identity or pipelines matter.

## When It Hurts

Commands add little when a screen truly performs simple data maintenance.

Do not turn:

```text
Change display preference
```

into an elaborate command hierarchy if a straightforward update communicates the system better.

## How It Relates to Fowler

A command handler often implements Fowler's Transaction Script or Service Layer.

With DDD it may coordinate an Aggregate.

With CQRS, Command becomes the explicit write-side vocabulary.

## Summary

A Command is not just a DTO headed toward a handler.

It names an intention to change the system.

That gives the application a clear place to authorize the action, validate its shape, invoke domain behavior, define transaction semantics, and eventually make retries safe.
