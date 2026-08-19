---
author: Steve Kaschimer
date: 2029-01-07
image: /images/posts/2029-01-07-hero.webp
image_alt: "A shape with visible internal structure compressed and sealed into one dense, uniform block glyph, implying a complex structure flattened into a single opaque value."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single dense, sealed amber block glyph with faint compressed internal lines visible just beneath its surface, implying a complex structure flattened and sealed into one opaque stored value. Mood is compact and opaque. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Serialized LOB persists a graph of objects by serializing it into a single large database value - in a modern .NET application, usually JSON. Covers System.Text.Json value converters, the central trade-off against queryability, and why long-lived serialized data needs a real schema-evolution strategy even though the database enforces none."
tags: ["dotnet", "architecture", "design-patterns", "orm"]
title: "Serialized LOB in Modern .NET"
---



Serialized LOB persists a graph of objects by serializing it into a single large database value. In Fowler's original formulation, the large object might be text or binary. In a modern .NET application, JSON is often the most obvious representation.

## The Problem

Some object structures are natural in memory but awkward in a normalized relational schema. Consider configuration for a workflow:
``` csharp
public sealed record WorkflowDefinition(
    IReadOnlyList<WorkflowStep> Steps,
    IReadOnlyDictionary<string, string> Metadata);
```

The structure may contain nested objects, optional properties, and collections whose internal relationships matter more than relational querying. One option is to normalize every piece into tables. Another is to serialize the whole structure.

## Serializing With System.Text.Json

``` csharp
var json = JsonSerializer.Serialize(
    workflow,
    JsonSerializerOptions.Web);
```

The resulting JSON can be stored in a text, JSON, or large-object column depending on the database. Reading reverses the operation:
``` csharp
var workflow =
    JsonSerializer.Deserialize<WorkflowDefinition>(
        json,
        JsonSerializerOptions.Web)
    ?? throw new InvalidOperationException(
        "Workflow data could not be deserialized.");
```

## An EF Core Value Converter

For relatively simple scenarios, a value converter can serialize a property:
``` csharp
builder.Property(x => x.Definition)
    .HasConversion(
        value => JsonSerializer.Serialize(
            value,
            JsonSerializerOptions.Web),
        value => JsonSerializer.Deserialize<WorkflowDefinition>(
            value,
            JsonSerializerOptions.Web)!);
```

Production mappings may also need a value comparer so EF Core can correctly detect changes to structured values. Provider-native JSON mapping may be a better option when available.

## Why Serialize?

Serialization can preserve a complicated object shape without building a complicated relational schema. It works well when the serialized structure is:
-   owned by one parent,
-   read and written as a whole,
-   rarely queried internally,
-   relatively self-contained.

Examples might include snapshots, configuration documents, external payload archives, or historical state.

## The Major Trade-off: Queryability

Suppose you serialize:
``` json
{
  "approval": {
    "required": true,
    "minimumApprovers": 2
  }
}
```

If the application later needs to efficiently find every row where `minimumApprovers >= 3`, an opaque serialized value becomes less convenient. Modern databases with native JSON support reduce this limitation, but the architectural question remains:
> Is this data a document the application mostly treats as a whole, or
> relational data the system needs to query structurally?

That distinction should drive the mapping.

## Schema Evolution

Serialized data has a schema even if the database does not enforce it. Imagine version 1:
``` csharp
public sealed record NotificationSettings(
    bool EmailEnabled);
```

and version 2:
``` csharp
public sealed record NotificationSettings(
    bool EmailEnabled,
    bool SmsEnabled);
```

Old serialized rows still exist. You need a strategy for compatibility:
-   tolerant deserialization,
-   default values,
-   version markers,
-   migration on read,
-   background migrations.

Serialization avoids relational migrations for every structural change, but it does not eliminate data evolution.

## Version the Payload When Necessary

For long-lived data, an explicit envelope can help:
``` csharp
public sealed record SerializedDocument<T>(
    int Version,
    T Data);
```

Then migration code can make evolution deliberate rather than relying on accidental serializer compatibility.

## Serialized LOB vs. Embedded Value

Use Embedded Value when the database benefits from separate columns:
``` text
Amount
Currency
```

Use Serialized LOB when the structure is more naturally handled as one document:
``` text
WorkflowDefinitionJson
```

The decision should follow access patterns.

## Serialized LOB vs. Normalized Tables

Normalization is usually preferable when:
-   child records have independent identity,
-   other tables reference them,
-   internal fields are frequently queried,
-   relational constraints are important,
-   partial updates are common.

Serialization becomes attractive when those properties are absent.

## Concurrency

If the entire document is one column, two users editing different parts of it may still conflict at the row or document level. That can be desirable if the document is one consistency boundary. It can be frustrating if independent portions need concurrent editing. Persistence shape affects concurrency semantics.

## Security

Serialized fields should not become dumping grounds for arbitrary object graphs. Treat serialized data as untrusted when appropriate, validate it, avoid persisting secrets unnecessarily, and prefer explicit DTO-like structures over serializing arbitrary runtime types. `System.Text.Json` with explicit models is generally a clearer fit than mechanisms that attempt to reconstruct arbitrary CLR object types.

## Observability and Debugging

Textual JSON has a practical advantage over opaque binary serialization: operators and developers can often inspect it directly. That can make troubleshooting and migrations easier. Binary formats may be smaller or faster in some scenarios, but those benefits should be measured rather than assumed.

## Testing

Tests should cover:
-   serialization round-trips,
-   old payload versions,
-   missing optional fields,
-   malformed data,
-   EF Core change detection,
-   provider-specific JSON behavior,
-   concurrency where relevant.

Long-lived serialized data deserves compatibility tests because today's code may need to read data written years earlier.

## When to Use It

Serialized LOB fits when a complex structure belongs to one owner, is normally accessed as a whole, and does not need rich relational querying.

## When Not to Use It

Avoid it when serialization is merely a shortcut around modeling data that is fundamentally relational and heavily queried. A JSON column can hide schema complexity, but it cannot make that complexity disappear.

## Related Patterns

-   Embedded Value
-   Dependent Mapping
-   Data Mapper
-   Single Table Inheritance

## Summary

Serialized LOB trades relational structure for object-graph fidelity and implementation simplicity. Modern JSON support makes the pattern more practical than ever, but the core trade-off remains unchanged: data stored as one serialized value is easiest to treat as one serialized value. Use it when that matches the way the application actually uses the data.
