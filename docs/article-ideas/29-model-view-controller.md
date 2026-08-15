---
category: Web Presentation Patterns
csharp: 14
description: Revisit Fowler's Model View Controller pattern through
  ASP.NET Core MVC, including controllers, models, Razor views, APIs,
  and modern separation-of-concerns guidance.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/modelViewController.html"
order: 29
pattern: Model View Controller
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: model-view-controller
status: draft
title: Model View Controller in Modern ASP.NET Core
---

# Model View Controller in Modern ASP.NET Core

Model View Controller splits user-interface interaction into three
roles: model, view, and controller.

Few patterns in enterprise development are as widely known---or as
inconsistently interpreted.

ASP.NET Core MVC gives us a concrete modern implementation, but
understanding the roles is more useful than memorizing framework
folders.

## The Three Responsibilities

At a high level:

``` text
Request
   |
Controller
   |
Model / Application
   |
View
   |
Response
```

The **controller** interprets input and coordinates the response.

The **model** represents the data and behavior needed by the
application.

The **view** renders information for the user.

## A Modern ASP.NET Core Controller

``` csharp
public sealed class OrdersController(
    GetOrderDetails getOrderDetails)
    : Controller
{
    [HttpGet("/orders/{id:guid}")]
    public async Task<IActionResult> Details(
        Guid id,
        CancellationToken cancellationToken)
    {
        var model = await getOrderDetails.ExecuteAsync(
            new OrderId(id),
            cancellationToken);

        return model is null
            ? NotFound()
            : View(model);
    }
}
```

The controller handles HTTP concerns:

-   route values,
-   status results,
-   request cancellation,
-   choosing a view.

It delegates application work elsewhere.

## The View

A Razor view might receive:

``` csharp
public sealed record OrderDetailsViewModel(
    Guid Id,
    string CustomerName,
    string Status,
    decimal Total);
```

and render it:

``` cshtml
@model OrderDetailsViewModel

<h1>Order @Model.Id</h1>

<dl>
    <dt>Customer</dt>
    <dd>@Model.CustomerName</dd>

    <dt>Status</dt>
    <dd>@Model.Status</dd>

    <dt>Total</dt>
    <dd>@Model.Total.ToString("C")</dd>
</dl>
```

The view is concerned with presentation rather than persistence or
business workflow.

## What Is the Model?

"Model" is overloaded.

It may refer to:

-   a Domain Model,
-   an application model,
-   a view model,
-   a form/input model.

These are not necessarily the same object.

For a mature application, passing EF Core entities directly to Razor
views often couples presentation to persistence more tightly than
necessary.

A purpose-built view model is usually clearer.

## Input Models

A POST action might accept:

``` csharp
public sealed record SubmitOrderRequest(
    Guid OrderId);
```

Then:

``` csharp
[HttpPost("/orders/{id:guid}/submit")]
public async Task<IActionResult> Submit(
    Guid id,
    CancellationToken cancellationToken)
{
    await submitOrder.ExecuteAsync(
        new OrderId(id),
        cancellationToken);

    return RedirectToAction(
        nameof(Details),
        new { id });
}
```

The controller translates HTTP interaction into an application
operation.

## Thin Controllers

"Thin controller" does not mean a controller must contain almost no
code.

It means business rules should not accumulate there.

This is a warning sign:

``` csharp
if (order.Status == OrderStatus.Draft &&
    order.Lines.Count > 0 &&
    customer.CreditLimit >= order.Total)
{
    // ...
}
```

Those rules belong in the domain or application layer.

The controller should coordinate the web interaction.

## MVC and Minimal APIs

ASP.NET Core Minimal APIs do not eliminate MVC's underlying separation
concerns.

A route handler can still act as a controller:

``` csharp
app.MapGet(
    "/orders/{id:guid}",
    async (
        Guid id,
        GetOrderDetails query,
        CancellationToken ct) =>
    {
        var result = await query.ExecuteAsync(
            new OrderId(id),
            ct);

        return result is null
            ? Results.NotFound()
            : Results.Ok(result);
    });
```

There may be no Razor View, but input interpretation, application
behavior, and response representation are still separate concerns.

## MVC for JSON APIs

For an API:

``` csharp
[ApiController]
[Route("api/orders")]
public sealed class OrderApiController(
    GetOrderDetails query)
    : ControllerBase
{
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDetailsDto>> Get(
        Guid id,
        CancellationToken cancellationToken)
    {
        var result = await query.ExecuteAsync(
            new OrderId(id),
            cancellationToken);

        return result is null
            ? NotFound()
            : Ok(result);
    }
}
```

The "view" is no longer a `.cshtml` template. Representation is produced
through output formatting and serialization.

The separation principle still applies.

## Model Binding Is Not the Domain Model

ASP.NET Core can bind request data into C# objects.

Do not confuse that convenience with permission to bind directly into
domain entities:

``` csharp
public IActionResult Update(Order order)
```

A dedicated request model creates a safer boundary:

``` csharp
public sealed record UpdateOrderRequest(
    string PurchaseOrderNumber);
```

Then application code decides which changes are valid.

## Validation

Presentation validation and domain validation solve different problems.

A request model can express:

``` csharp
[Required]
public string PurchaseOrderNumber { get; init; } = "";
```

while the domain enforces invariants that must remain true regardless of
whether the operation came from HTTP, a queue, a scheduled job, or a
test.

Do not make the web layer the only guardian of business correctness.

## Testing

Controllers can be tested directly for routing-independent behavior, but
many MVC concerns are best verified with ASP.NET Core integration tests.

Business rules should remain testable without constructing an HTTP
context.

Views may deserve rendering or end-to-end tests when presentation
behavior is important.

## When to Use It

MVC remains a strong fit for server-rendered applications and
conventional HTTP APIs where explicit controller boundaries improve
organization.

The deeper lesson also applies to other presentation frameworks: keep
input handling, business behavior, and representation concerns from
collapsing into one object.

## Related Patterns

-   Page Controller
-   Front Controller
-   Template View
-   Application Controller
-   Service Layer

## Summary

Model View Controller is not primarily about having `Models`, `Views`,
and `Controllers` folders.

It is about separating interaction handling, application behavior, and
presentation.

ASP.NET Core gives us excellent framework support for that separation,
but the architecture still depends on where we choose to put
responsibilities.
