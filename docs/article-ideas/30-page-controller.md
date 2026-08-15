---
category: Web Presentation Patterns
csharp: 14
description: Understand Page Controller through ASP.NET Core
  controllers, Razor Pages, endpoint handlers, and the trade-offs of one
  handler per page or action.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/pageController.html"
order: 30
pattern: Page Controller
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: page-controller
status: draft
title: Page Controller in Modern ASP.NET Core
---

# Page Controller in Modern ASP.NET Core

Page Controller assigns a controller object to a specific page or action
in a web application.

In modern ASP.NET Core, the pattern appears in several forms:

-   MVC controller actions,
-   Razor Page models,
-   endpoint handlers,
-   feature-specific request handlers.

The implementation has changed since the early 2000s. The core idea has
not.

## The Core Idea

A request such as:

``` text
GET /orders/42
```

is handled by code dedicated to that page or action.

Conceptually:

``` text
/orders/42
    |
Order Details Controller
    |
Application Logic
    |
Response
```

Each page or action has a clear entry point.

## An MVC Action as Page Controller

``` csharp
public sealed class OrdersController(
    GetOrderDetails query)
    : Controller
{
    [HttpGet("/orders/{id:guid}")]
    public async Task<IActionResult> Details(
        Guid id,
        CancellationToken cancellationToken)
    {
        var model = await query.ExecuteAsync(
            new OrderId(id),
            cancellationToken);

        return model is null
            ? NotFound()
            : View(model);
    }
}
```

The action handles one web interaction: displaying order details.

## Razor Pages Is an Especially Clear Example

A Razor Page model maps naturally to the pattern:

``` csharp
public sealed class DetailsModel(
    GetOrderDetails query)
    : PageModel
{
    public OrderDetailsViewModel Order { get; private set; }
        = null!;

    public async Task<IActionResult> OnGetAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        var order = await query.ExecuteAsync(
            new OrderId(id),
            cancellationToken);

        if (order is null)
            return NotFound();

        Order = order;
        return Page();
    }
}
```

The page model owns request-handling behavior for one page.

That is Page Controller in a very literal form.

## One Controller per Page?

The pattern does not require one CLR class for every URL.

An MVC controller can group related actions:

``` csharp
OrdersController
    Details
    Create
    Submit
    Cancel
```

Each action still behaves as the controller for a specific request.

The important characteristic is that request-specific handling remains
localized.

## Minimal API Handlers

Even this:

``` csharp
app.MapPost(
    "/orders/{id:guid}/submit",
    async (
        Guid id,
        SubmitOrder command,
        CancellationToken ct) =>
    {
        await command.ExecuteAsync(
            new OrderId(id),
            ct);

        return Results.NoContent();
    });
```

has Page Controller-like semantics.

The endpoint-specific handler interprets one request and coordinates one
response.

Patterns describe responsibility structures, not framework class names.

## What Belongs in a Page Controller?

Good responsibilities include:

-   reading route and query parameters,
-   accepting form/input models,
-   invoking application operations,
-   selecting a view,
-   returning HTTP status codes,
-   redirecting,
-   handling presentation-specific flow.

Business rules should normally live elsewhere.

## The Fat Page Controller Problem

This is where Page Controller can deteriorate:

``` csharp
public async Task<IActionResult> Submit(Guid id)
{
    var order = await db.Orders
        .Include(x => x.Lines)
        .SingleAsync(x => x.Id == id);

    if (order.Lines.Count == 0)
        return BadRequest();

    if (order.Status != OrderStatus.Draft)
        return BadRequest();

    // pricing logic
    // inventory logic
    // payment logic
    // email logic
    // persistence logic
}
```

The page handler has become the application.

A better version delegates:

``` csharp
await submitOrder.ExecuteAsync(
    new OrderId(id),
    cancellationToken);
```

The controller remains responsible for the web interaction.

## Repeated Controller Logic

As an application grows, many page controllers need the same concerns:

-   authentication,
-   authorization,
-   exception handling,
-   localization,
-   request logging,
-   correlation IDs,
-   validation.

Do not solve this by copying the code into every controller.

ASP.NET Core provides cross-cutting mechanisms such as middleware,
filters, authorization policies, endpoint filters, and model-binding
infrastructure.

This is where the relationship with Front Controller becomes important.

## Page Controller and Front Controller Together

These patterns are not necessarily competitors.

ASP.NET Core has a centralized request pipeline:

``` text
Request
  |
Middleware pipeline
  |
Routing
  |
Specific endpoint/controller
```

The shared pipeline provides Front Controller-like centralized
processing, while the selected action or page handles request-specific
behavior.

Modern frameworks often combine pattern responsibilities rather than
implementing one pattern exclusively.

## Page Controller vs. Application Controller

Page Controller handles a particular request.

Application Controller centralizes application navigation or flow
decisions across multiple screens.

For straightforward CRUD-style navigation, Page Controllers may be
enough.

For a multi-step workflow such as:

``` text
Choose plan
-> Configure account
-> Verify identity
-> Review
-> Complete
```

a separate flow-coordination abstraction may become useful.

## Feature Folders

Large applications can become difficult to navigate if all controllers
live in one folder.

A feature-oriented structure can keep a Page Controller near its models
and application behavior:

``` text
Features/
  Orders/
    Details/
      Endpoint.cs
      Query.cs
      ViewModel.cs
    Submit/
      Endpoint.cs
      Command.cs
```

The pattern is about responsibility, not the traditional folder layout.

## Testing

A Page Controller should be easy to test because it delegates business
behavior.

For example, test that:

-   missing data returns 404,
-   successful POST redirects correctly,
-   invalid input returns the expected presentation response,
-   the application operation receives the expected command.

Use integration tests for routing, filters, middleware, model binding,
and rendering behavior.

## When to Use It

Page Controller is a natural fit when request handling can be organized
around distinct pages or actions and each interaction has relatively
straightforward presentation flow.

ASP.NET Core MVC, Razor Pages, and Minimal APIs all support this style
well.

## When It Starts to Strain

Consider additional abstractions when:

-   navigation rules become complex,
-   many screens participate in one workflow,
-   controller code repeatedly coordinates the same flow,
-   cross-cutting behavior is duplicated across handlers.

That leads naturally toward Front Controller and Application Controller.

## Related Patterns

-   Model View Controller
-   Front Controller
-   Template View
-   Application Controller
-   Service Layer

## Summary

Page Controller gives each web interaction a focused place to live.

ASP.NET Core offers several modern expressions of the pattern, from MVC
actions to Razor Page models to endpoint handlers.

The pattern works best when controllers remain controllers: interpret
the request, invoke application behavior, and choose the
response---without becoming the place where the business itself is
implemented.
