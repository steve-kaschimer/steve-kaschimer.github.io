---
title: "Result Pattern: Making Expected Failure Explicit"
slug: "result-pattern"
description: "Represent expected application outcomes explicitly in modern C#, distinguish business failure from exceptional failure, and map results cleanly to HTTP without replacing exceptions indiscriminately."
series: "Modern Application Architecture Patterns in .NET"
volume: 2
category: "Commands, Queries & Data"
order: 20
dotnet: "10"
csharp: "14"
status: "draft"
---

# Result Pattern: Making Expected Failure Explicit

Applications fail in different ways.

These are not the same:

```text
Order does not exist.
Coupon is expired.
Payment is declined.
Database connection disappeared.
Invariant was violated because of a bug.
```

The Result pattern is useful when failure is an **expected part of the application's contract**.

## The Null Problem

Suppose:

```csharp
public Task<Order?> GetOrderAsync(OrderId id);
```

`null` tells us only that there is no Order.

It cannot naturally distinguish:

```text
not found
not authorized
temporarily unavailable
```

## The Exception Problem

We could throw:

```csharp
throw new OrderNotFoundException(id);
```

But if "order not found" is an ordinary expected outcome, exception-driven control flow may obscure the contract.

## An Explicit Result

A minimal model:

```csharp
public abstract record Result<T>
{
    private Result() { }

    public sealed record Success(T Value)
        : Result<T>;

    public sealed record Failure(Error Error)
        : Result<T>;
}

public sealed record Error(
    string Code,
    string Message);
```

Then:

```csharp
public Task<Result<OrderId>> HandleAsync(...);
```

The signature says failure is expected.

## Domain-Specific Results Can Be Better

Generic `Result<T>` is not mandatory.

Sometimes:

```csharp
public abstract record PaymentAuthorization
{
    public sealed record Approved(
        AuthorizationId Id)
        : PaymentAuthorization;

    public sealed record Declined(
        DeclineReason Reason)
        : PaymentAuthorization;
}
```

communicates the domain far better than:

```text
Result<AuthorizationId>
```

Use the smallest abstraction that improves clarity.

## Expected vs. Exceptional

A useful distinction:

```text
Expected business/application outcome
    -> Result

Unexpected infrastructure/programming failure
    -> Exception
```

Examples:

```text
Coupon expired       Result
Card declined        Result
Order not found      Result/optional, context dependent

SQL connection lost  Exception
NullReferenceException Exception
Broken invariant     Exception
```

Do not convert every exception into:

```text
Result.Fail("Something went wrong")
```

That can erase diagnostic information.

## Result and Domain Exceptions

Some domain models protect invariants by throwing domain exceptions.

Others return domain results.

Both can work.

For example:

```csharp
public CancelOrderResult Cancel()
{
    if (Status == OrderStatus.Shipped)
        return CancelOrderResult.Rejected(
            CancelReason.AlreadyShipped);

    Status = OrderStatus.Cancelled;

    return CancelOrderResult.Success;
}
```

The choice depends on whether the rejected operation is a normal domain branch or represents programmer misuse.

## Pattern Matching

Modern C# makes discriminated-style results pleasant:

```csharp
return result switch
{
    PlaceOrderResult.Success success =>
        Results.Created(
            $"/orders/{success.OrderId}",
            success),

    PlaceOrderResult.Invalid invalid =>
        Results.ValidationProblem(
            invalid.Errors),

    PlaceOrderResult.Conflict conflict =>
        Results.Conflict(conflict.Message),

    _ => throw new UnreachableException()
};
```

The endpoint translates application outcomes into transport semantics.

The application does not need to return `IResult`.

## HTTP Mapping Belongs at the Edge

Avoid:

```csharp
public Task<IResult> PlaceOrderAsync(...)
```

inside the application layer.

HTTP is an adapter concern.

Instead:

```text
Application Result
       |
HTTP Adapter
       |
ProblemDetails / status code
```

The same application operation can then be invoked from a queue or CLI.

## Error Codes

Stable machine-readable codes are useful:

```csharp
new Error(
    "orders.already_shipped",
    "A shipped order cannot be cancelled.");
```

The human message can change.

The code can remain part of a contract.

Do not expose internal exception type names as public error codes.

## Validation Errors

Validation often deserves structured data:

```csharp
public sealed record ValidationError(
    string Field,
    string Code,
    string Message);
```

That lets HTTP adapters produce `ValidationProblemDetails` without coupling the application to ASP.NET Core.

## Result Explosion

This is the danger:

```text
Result<Result<Option<Either<...>>>>
```

If understanding the success path requires decoding a type puzzle, the abstraction has failed.

Domain-specific result types and ordinary exceptions are often clearer.

## Logging

Expected failures should not all be logged as errors.

A declined card is business information.

A database outage is an operational error.

Result modeling helps telemetry distinguish them.

## Testing

Results make expected outcomes easy to test:

```csharp
var result = order.Cancel();

Assert.IsType<
    CancelOrderResult.Rejected>(result);
```

No exception assertion is required for ordinary business rejection.

## When It Helps

Use Result when:

- callers are expected to handle several normal outcomes;
- failure is part of the use-case contract;
- transport-independent error mapping matters;
- exceptions would be ordinary control flow.

## When It Hurts

It hurts when:

- every function returns Result regardless of need;
- exceptions are swallowed into generic failures;
- stack traces and diagnostics disappear;
- generic type machinery overwhelms domain language.

## How It Relates to Fowler

Result is a modern application-level companion to patterns such as Special Case and Service Layer.

It also pairs naturally with Commands, Queries, Vertical Slices, and HTTP `ProblemDetails`.

## Summary

Result makes **expected failure** explicit.

It does not eliminate exceptions.

Model ordinary business/application outcomes as values when doing so improves the contract, and preserve exceptions for failures that are genuinely exceptional or operational.

The goal is clarity, not a world in which `throw` is forbidden.
