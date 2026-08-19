---
author: Steve Kaschimer
date: 2029-03-25
image: /images/posts/2029-03-25-hero.webp
image_alt: "One shape on the left flowing through a transformation arrow into a differently structured shape on the right, implying structured input converted into a distinct structured output."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a teal grid-shaped glyph on the left flowing through a bold amber transformation arrow into a differently structured circular glyph on the right, implying structured input converted deliberately into a distinct structured output. Mood is conversion-oriented and clean. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Transform View treats rendering as a transformation - structured data goes in, a complete representation comes out - which is exactly what happens every time a modern API serializes a DTO into JSON. Covers why this is the natural fit for machine-oriented output, and when handcrafted HTML is still better served by Template View instead."
tags: ["dotnet", "architecture", "design-patterns", "aspnet-core"]
title: "Transform View in Modern .NET"
---



Transform View treats rendering as a transformation. The application has structured data as input and produces a complete representation as output. Rather than beginning with an HTML template containing dynamic markers, the renderer processes the source data and creates the result.

## The Core Idea

Conceptually:
``` text
Model / Read Model
       |
   Transformation
       |
 HTML / JSON / XML
```

This differs from Template View, where presentation markup provides the starting structure.

## A Simple Transformation

Suppose the application returns:
``` csharp
public sealed record OrderSummary(
    Guid Id,
    string CustomerName,
    decimal Total);
```

A transformation function could produce a representation:
``` csharp
public static string ToHtml(OrderSummary order)
{
    return $"""
        <article>
            <h1>Order {order.Id}</h1>
            <p>{WebUtility.HtmlEncode(order.CustomerName)}</p>
            <strong>{order.Total:C}</strong>
        </article>
        """;
}
```

The code processes the model and generates the output. For complex HTML, a template is usually easier to maintain, but this demonstrates the pattern.

## JSON APIs as a Modern Analogy

Modern APIs frequently transform DTOs into JSON:
``` csharp
app.MapGet(
    "/api/orders/{id:guid}",
    async (
        Guid id,
        GetOrderDetails query,
        CancellationToken ct) =>
    {
        var order = await query.ExecuteAsync(
            new OrderId(id),
            ct);

        return order is null
            ? Results.NotFound()
            : Results.Ok(order);
    });
```

ASP.NET Core's output formatter or JSON serializer transforms the response object into the wire representation. The developer is not writing a JSON template.

## Explicit API Transformation

Often the transformation starts before serialization:
``` csharp
var response = new OrderResponse(
    Id: order.Id.Value,
    Customer: order.Customer.Name,
    Total: new MoneyResponse(
        order.Total.Amount,
        order.Total.Currency));
```

Then serialization handles the final representation. This keeps the public API contract separate from the domain model.

## Why Transform?

Transformation works well when output is naturally derived from structured data. Examples include:
-   JSON,
-   XML,
-   CSV,
-   feeds,
-   machine-readable documents,
-   generated reports.

The renderer can systematically walk the source structure and create the target structure.

## Transform View vs. Template View

Template View:
``` text
HTML template
+ dynamic markers
+ model
= HTML
```

Transform View:
``` text
model
-> transformation logic
-> output
```

Template View is usually easier when the output is mostly handcrafted HTML. Transform View is often attractive when the output is machine-oriented or strongly structured.

## XML

XML makes the transformation idea particularly obvious. An application may create an object or intermediate XML model and transform it into a final XML or HTML representation. Although XSLT is less prominent in everyday .NET web development than it once was, it is a classic example of transformation-oriented rendering.

## Separate the Domain From the Representation

Do not make domain entities double as wire contracts merely because serialization is convenient. Instead:
``` csharp
public sealed record CustomerResponse(
    Guid Id,
    string DisplayName);
```

and:
``` csharp
public static CustomerResponse ToResponse(
    Customer customer)
{
    return new CustomerResponse(
        customer.Id.Value,
        customer.DisplayName);
}
```

The transformation becomes an explicit architectural boundary.

## Mapping Libraries

Libraries can automate repetitive object-to-object transformations. That can be useful when mappings are mechanical. But important API transformations often benefit from explicit code because it makes contract decisions visible. A mapping library should reduce repetition, not hide important semantics.

## Streaming Transformations

Transformation does not always require building the entire output in memory. Large exports can stream records:
``` csharp
await foreach (var order in query.StreamAsync(ct))
{
    await writer.WriteLineAsync(
        $"{order.Id},{order.Total}");
}
```

The source is processed element by element into the target representation. This closely matches the spirit of Transform View.

## Security

Transformation code owns representation concerns such as:
-   HTML encoding,
-   JSON contract shape,
-   field omission,
-   sensitive-data filtering,
-   output escaping.

Never assume a generic serializer automatically knows which domain data is appropriate to expose.

## Testing

Transformations are often easy to test because they can be pure functions:
``` csharp
var response = OrderMapper.ToResponse(order);

Assert.Equal(
    order.Id.Value,
    response.Id);
```

For serialized formats, contract tests can verify the final JSON, XML, or other representation.

## When to Use It

Transform View fits when:
-   output is strongly structured,
-   rendering is naturally expressed as data transformation,
-   multiple target formats may exist,
-   explicit representation mapping is valuable,
-   templates would add little clarity.

## When to Prefer Template View

For substantial handcrafted HTML, Razor or another Template View is usually easier for humans to read and maintain. Generating hundreds of lines of HTML procedurally is rarely an improvement.

## Related Patterns

-   Template View
-   Two Step View
-   Data Transfer Object
-   Model View Controller

## Summary

Transform View treats rendering as a conversion from structured input to a target representation. Modern .NET APIs, serializers, response mappers, exports, and document generators all make the underlying idea familiar. The important distinction from Template View is the direction of thought: instead of starting with the presentation and filling holes, start with the data and transform it into the presentation.
