---
category: Web Presentation Patterns
csharp: 14
description: Render presentation in two stages using logical page models
  and shared rendering, with modern ASP.NET Core and Razor examples.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/twoStepView.html"
order: 34
pattern: Two Step View
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: two-step-view
status: draft
title: Two Step View in Modern ASP.NET Core
---

# Two Step View in Modern ASP.NET Core

Two Step View renders a response in two stages.

First, domain or application data is transformed into a logical page
representation. Second, that logical representation is rendered into the
final output.

The pattern is useful when many pages share a common visual structure.

## The Core Idea

Conceptually:

``` text
Domain / Application Data
          |
      Step One
          |
   Logical Page Model
          |
      Step Two
          |
        HTML
```

The first step decides *what the page means*. The second decides *how
that kind of page is rendered*.

## A Logical Page Model

Suppose several pages share a title, breadcrumbs, alerts, and main
content.

``` csharp
public sealed record PageModel<TContent>(
    string Title,
    IReadOnlyList<Breadcrumb> Breadcrumbs,
    IReadOnlyList<Alert> Alerts,
    TContent Content);
```

An order query can create:

``` csharp
var page = new PageModel<OrderDetails>(
    Title: $"Order {order.Number}",
    Breadcrumbs:
    [
        new("Orders", "/orders"),
        new(order.Number, null)
    ],
    Alerts: [],
    Content: order);
```

This is the first transformation.

## The Second Step

A shared Razor layout or rendering layer then turns that logical page
into HTML.

``` cshtml
@model PageModel<OrderDetails>

<h1>@Model.Title</h1>

<partial name="_Breadcrumbs"
         model="Model.Breadcrumbs" />

<partial name="_Alerts"
         model="Model.Alerts" />

<partial name="_OrderDetails"
         model="Model.Content" />
```

The page-specific data has already been organized into a common
presentation model.

## Why Two Steps?

Without a shared logical representation, every page may independently
decide how to render:

-   titles,
-   navigation,
-   alerts,
-   metadata,
-   menus,
-   common actions.

Two Step View centralizes that presentation structure.

## Layouts Are Related, but Not Identical

A Razor layout provides common markup:

``` cshtml
<header>...</header>
@RenderBody()
<footer>...</footer>
```

Two Step View goes further when the first stage produces a standardized
logical page that the second stage renders consistently.

A layout alone does not necessarily mean you are using the full pattern.

## A Dashboard Example

Different application features can produce the same logical component
model:

``` csharp
public abstract record DashboardWidget;

public sealed record MetricWidget(
    string Label,
    string Value)
    : DashboardWidget;

public sealed record TableWidget<T>(
    string Title,
    IReadOnlyList<T> Rows)
    : DashboardWidget;
```

The first step converts domain data into widgets.

The second step renders each widget consistently.

This can be useful in portals, reporting systems, admin interfaces, and
content-management systems.

## Two Step View and Design Systems

Modern design systems make the pattern especially relevant.

The first step can describe semantic UI components:

``` text
Page
  Header
  Alert
  Metric Grid
  Data Table
  Action Bar
```

The second step maps those components to the organization's actual HTML
and CSS components.

This reduces visual drift between features.

## Two Step View vs. Template View

Template View starts with the final presentation template.

Two Step View introduces an intermediate representation.

``` text
Template View:
Model -> HTML template -> HTML

Two Step View:
Model -> Logical Page -> Renderer -> HTML
```

The extra step is worthwhile only when it creates meaningful reuse.

## Two Step View vs. Transform View

Transform View directly transforms domain data into output.

Two Step View performs two transformations:

``` text
Domain data
-> presentation-oriented intermediate form
-> final representation
```

That intermediate form is the defining characteristic.

## APIs Can Use the Same Idea

The pattern is usually discussed in terms of HTML, but the architectural
idea can apply to other representations.

For example:

``` csharp
public sealed record ApiEnvelope<T>(
    T Data,
    IReadOnlyList<ApiLink> Links,
    ApiMetadata Metadata);
```

Feature code produces the logical API representation, while centralized
serialization produces the wire format.

Whether to call that Two Step View is less important than recognizing
the same two-stage responsibility split.

## Avoid Building a UI Language Accidentally

An intermediate representation can grow into an enormous generic UI
description language.

That may be justified for a platform product.

For an ordinary application, it can create more indirection than value.

Use Two Step View when pages genuinely share enough presentation
semantics to justify the intermediate model.

## Testing

The two stages can be tested independently.

First-step tests verify:

-   correct page title,
-   breadcrumbs,
-   alerts,
-   component selection,
-   presentation decisions.

Rendering tests verify that logical components produce the expected
HTML.

This separation can make complex presentation systems easier to test.

## When to Use It

Two Step View fits when:

-   many pages share a strong common structure,
-   a design system needs consistent rendering,
-   multiple features produce the same logical components,
-   presentation reuse goes beyond a simple layout.

## When to Skip It

A normal Razor layout plus partials is often enough for straightforward
applications.

Do not introduce an intermediate page language merely because the
pattern exists.

## Related Patterns

-   Template View
-   Transform View
-   Model View Controller
-   Application Controller

## Summary

Two Step View introduces a presentation-oriented intermediate model
between application data and final rendering.

In modern ASP.NET Core, the pattern can be valuable for
design-system-heavy applications, dashboards, portals, and other systems
where many features need to produce a consistent family of pages.
