---
author: Steve Kaschimer
date: 2029-03-18
image: /images/posts/2029-03-18-hero.webp
image_alt: "A window frame glyph containing a repeating pattern of small placeholder slots, some filled solid and some left as empty outlines, implying static structure with a few dynamic insertion points."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single teal window-frame outline containing four small placeholder slots in a row, two rendered as solid amber fills and two left as empty off-white outlines, implying mostly static presentation structure with a few dynamic insertion points. Mood is structured and templated. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Template View renders dynamic output by starting with presentation markup and embedding markers that get replaced with data at runtime - Razor is the obvious modern example. Covers strongly typed view models, layouts, partials, and the discipline of keeping business rules out of the template even though Razor technically allows it."
tags: ["dotnet", "architecture", "design-patterns", "aspnet-core"]
title: "Template View in Modern ASP.NET Core"
---



Template View renders dynamic output by starting with presentation markup and embedding markers that are replaced with data at runtime. In ASP.NET Core, Razor is the obvious modern example.

## The Core Idea

A Razor view looks primarily like HTML:
``` cshtml
@model OrderDetailsViewModel

<h1>Order @Model.OrderNumber</h1>

<p>Status: @Model.Status</p>
<p>Total: @Model.Total.ToString("C")</p>
```

Static presentation structure dominates the file, while expressions inject dynamic information. That is Template View.

## Why Templates Help

Generating a whole HTML page procedurally is awkward:
``` csharp
builder.Append("<h1>");
builder.Append(model.OrderNumber);
builder.Append("</h1>");
```

Templates invert the emphasis. Instead of code that happens to emit HTML, we write HTML that contains small pieces of dynamic code.

## Strongly Typed View Models

Prefer a presentation-specific model:
``` csharp
public sealed record OrderDetailsViewModel(
    string OrderNumber,
    string CustomerName,
    string Status,
    decimal Total);
```

Then:
``` cshtml
@model OrderDetailsViewModel
```

The view gets exactly the information it needs. This reduces coupling to EF Core entities and domain aggregates.

## Keep Views Presentation-Oriented

Razor allows arbitrary C#, but capability is not a recommendation. This is a warning sign:
``` cshtml
@if (Model.Customer.CreditLimit >=
     Model.Order.Total &&
     Model.Order.Status == OrderStatus.Draft)
{
    ...
}
```

If that expression represents a business rule, calculate the business decision elsewhere. The view should render the result.

## Layouts

Templates can compose other templates. A layout:
``` cshtml
<!DOCTYPE html>
<html>
<head>
    <title>@ViewData["Title"]</title>
</head>
<body>
    <main>
        @RenderBody()
    </main>
</body>
</html>
```

centralizes shared page structure. This keeps individual views focused on their page-specific content.

## Partials

Repeated fragments can become partial views:
``` cshtml
<partial
    name="_OrderStatus"
    model="Model.Status" />
```

Use partials for presentation composition, not as a substitute for clear application boundaries.

## View Components

When a reusable UI fragment needs its own retrieval or preparation logic, ASP.NET Core View Components can provide a stronger abstraction than a partial. They can be useful for elements such as:
-   shopping-cart summaries,
-   navigation state,
-   notification panels,
-   reusable dashboards.

Again, the component should prepare presentation data rather than become a hidden domain service.

## HTML Encoding

A template engine also participates in safe rendering. Razor normally HTML-encodes expressions:
``` cshtml
@Model.CustomerName
```

That default is important. Bypassing encoding with raw HTML should be deliberate and restricted to content that is known to be safe.

## Template View and APIs

JSON APIs generally do not use Template View in the classic sense. Serialization transforms objects into JSON without starting from a JSON-shaped template containing embedded markers. That is conceptually closer to transformation-based output. Template View remains most natural for server-rendered HTML, email templates, and similar text-heavy presentation formats.

## Email Templates

The pattern is not limited to browser pages. A Razor-based email can use the same idea:
``` cshtml
@model OrderSubmittedEmail

<h1>Thanks for your order</h1>
<p>Your order @Model.OrderNumber has been submitted.</p>
```

The template remains presentation-centric.

## Testing

Views can be tested through integration or rendering tests when presentation logic is important. But if a view requires extensive unit testing of business conditions, that may indicate too much behavior has leaked into the template.

## When to Use It

Template View is ideal when:
-   the output is mostly static markup,
-   dynamic values are embedded in predictable places,
-   designers and developers benefit from seeing the presentation
structure directly,
-   reusable layouts and fragments are valuable.

## Related Patterns

-   Transform View
-   Two Step View
-   Model View Controller
-   Page Controller

## Summary

Template View starts with the presentation and inserts dynamic data into it. Razor is a strong modern implementation because the HTML remains visible and natural while C# expressions provide the dynamic pieces. The key discipline is keeping the template focused on presentation rather than allowing business logic to migrate into the view.
