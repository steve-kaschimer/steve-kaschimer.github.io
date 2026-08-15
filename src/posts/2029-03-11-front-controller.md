---
author: Steve Kaschimer
date: 2029-03-11
image: /images/posts/2029-03-11-hero.webp
image_alt: "A single funnel or gate shape positioned before several separate window frames, implying every request passing through one shared checkpoint before reaching its specific destination."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single amber funnel-gate glyph positioned on the left, with three small teal window-frame shapes arranged on the right, each connected back to the funnel by a thin line, implying every request passing through one shared checkpoint before reaching its specific destination. Mood is centralized and consistent. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Front Controller channels web requests through a common handler before dispatching to request-specific behavior - a pattern ASP.NET Core's middleware and routing pipeline makes feel almost invisible. Covers centralizing authentication, exception handling, and correlation, without letting the shared pipeline grow into a hidden application service of its own."
tags: ["dotnet", "architecture", "design-patterns", "aspnet-core"]
title: "Front Controller in Modern ASP.NET Core"
---

Front Controller channels web requests through a common handler before
dispatching them to request-specific behavior.

ASP.NET Core makes this pattern feel almost invisible because its
request pipeline is built around the same idea.

## The Problem

Every endpoint may need the same concerns:

-   authentication,
-   authorization,
-   exception handling,
-   logging,
-   localization,
-   correlation,
-   security headers.

Duplicating those concerns in every controller produces inconsistent
behavior and maintenance problems.

## The ASP.NET Core Pipeline

A simplified application:

``` csharp
var app = builder.Build();

app.UseExceptionHandler();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
```

Requests enter a shared pipeline before routing reaches a particular
controller or endpoint.

Conceptually:

``` text
Request
   |
Exception handling
   |
Authentication
   |
Authorization
   |
Routing
   |
Specific endpoint
```

This is strongly aligned with Front Controller.

## Middleware as Common Request Processing

Custom middleware can centralize application-wide behavior:

``` csharp
public sealed class CorrelationMiddleware(
    RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId =
            context.Request.Headers["X-Correlation-ID"]
                .FirstOrDefault()
            ?? Guid.CreateVersion7().ToString();

        context.Response.Headers["X-Correlation-ID"] =
            correlationId;

        await next(context);
    }
}
```

Register it once:

``` csharp
app.UseMiddleware<CorrelationMiddleware>();
```

Every relevant request now passes through the behavior.

## Dispatching to Request-Specific Logic

After common processing, routing selects a handler:

``` csharp
[HttpPost("/orders/{id:guid}/submit")]
public async Task<IActionResult> Submit(
    Guid id,
    CancellationToken cancellationToken)
{
    await submitOrder.ExecuteAsync(
        new OrderId(id),
        cancellationToken);

    return NoContent();
}
```

The common pipeline and specific controller action have distinct
responsibilities.

## Front Controller and Page Controller

These patterns work together.

Front Controller handles common request concerns.

Page Controller handles one page or action.

``` text
Request
   |
Front Controller-like pipeline
   |
Page Controller / endpoint
   |
Application service
```

Modern frameworks commonly combine both.

## Filters and Endpoint Filters

Not every shared concern belongs in middleware.

MVC filters and Minimal API endpoint filters can apply behavior closer
to endpoint execution.

The architectural principle remains the same: centralize behavior that
should be consistent rather than copying it into every handler.

## Exception Handling

Central exception handling is a classic Front Controller responsibility.

Instead of:

``` csharp
try
{
    // endpoint code
}
catch (OrderNotFoundException)
{
    return NotFound();
}
```

in dozens of actions, a centralized handler can translate known
application exceptions into HTTP responses consistently.

## Authentication and Authorization

Security is another strong example.

Controllers should not repeatedly parse tokens or reproduce
authorization logic.

The common request pipeline can establish identity, while policies
decide whether the selected operation is allowed.

## Keep Business Logic Out of the Pipeline

Centralization can go too far.

Middleware should not become a giant application service containing
order, billing, customer, and inventory behavior.

The Front Controller coordinates web concerns. Domain and application
behavior still belong behind the presentation boundary.

## Testing

ASP.NET Core integration tests are particularly valuable because the
behavior of the pattern emerges from pipeline ordering.

Tests can verify that authentication, authorization, exception handling,
headers, and endpoint dispatch work together correctly.

## When to Use It

For modern ASP.NET Core applications, some form of Front Controller
behavior is effectively built into the framework.

The design work lies in deciding which concerns belong in middleware,
filters, endpoint-specific handlers, or application services.

## Related Patterns

-   Page Controller
-   Model View Controller
-   Application Controller
-   Service Layer

## Summary

Front Controller centralizes common web request handling before
dispatching to request-specific behavior.

ASP.NET Core's middleware and routing pipeline are a modern expression
of that idea. The pattern helps explain why cross-cutting HTTP concerns
belong in a shared pipeline rather than repeated across controllers.
