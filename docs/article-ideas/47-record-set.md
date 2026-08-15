---
category: Base Patterns
csharp: 14
description: Represent tabular data in memory for reporting, dynamic
  queries, imports, exports, and data-centric workflows using modern
  .NET.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/recordSet.html"
order: 47
pattern: Record Set
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: record-set
status: draft
title: Record Set in Modern .NET
---

# Record Set in Modern .NET

Record Set is an in-memory representation of tabular data.

Rather than turning every query result into a graph of domain objects, a
Record Set keeps data in rows and columns that closely resemble a
relational result.

That style remains useful in modern .NET---especially for reporting,
imports, exports, administrative tooling, analytics, and integration
code.

## The Core Idea

A SQL query naturally returns a table:

``` text
OrderId | CustomerName | Total | Status
--------|--------------|-------|--------
101     | Acme         | 42.50 | Open
102     | Contoso      | 91.00 | Paid
```

A Record Set preserves that tabular shape in memory.

Classic .NET provides a literal implementation:

``` csharp
var table = new DataTable("Orders");

table.Columns.Add("OrderId", typeof(int));
table.Columns.Add("CustomerName", typeof(string));
table.Columns.Add("Total", typeof(decimal));
table.Columns.Add("Status", typeof(string));
```

Rows can then be added or loaded from a data source.

## DataTable and DataSet

`DataTable` and `DataSet` are the most recognizable .NET examples of
Record Set.

``` csharp
using var command = connection.CreateCommand();
command.CommandText = """
    SELECT OrderId, CustomerName, Total, Status
    FROM OrderSummary
    WHERE CreatedAt >= @since
    """;

using var reader =
    await command.ExecuteReaderAsync(cancellationToken);

var table = new DataTable();
table.Load(reader);
```

The result remains tabular rather than becoming domain entities.

## Record Set Is Not Obsolete

Modern .NET code often favors strongly typed objects, LINQ, and EF Core
projections.

That does not eliminate the situations where a tabular structure is the
natural representation.

Examples include:

-   report generators,
-   spreadsheet exports,
-   CSV pipelines,
-   bulk imports,
-   dynamic administrative screens,
-   schema-driven integrations,
-   ad hoc query tools.

The important question is whether the problem is naturally
object-oriented or tabular.

## Strongly Typed Read Models

A modern alternative often looks like:

``` csharp
public sealed record OrderSummaryRow(
    int OrderId,
    string CustomerName,
    decimal Total,
    string Status);
```

Then:

``` csharp
var rows = await db.Orders
    .Where(x => x.CreatedAt >= since)
    .Select(x => new OrderSummaryRow(
        x.Id,
        x.Customer.Name,
        x.Total,
        x.Status.ToString()))
    .ToListAsync(cancellationToken);
```

This is not a classic generic Record Set, but it preserves the important
tabular idea while adding compile-time types.

For fixed schemas, this is often preferable.

## Dynamic Schemas

Record Set becomes more compelling when columns are not known at compile
time.

Imagine a report builder where users choose:

``` text
Customer
Region
Revenue
LastOrderDate
```

A dynamic table can represent the selected columns without generating a
new CLR type for every possible report shape.

## ADO.NET DataReader

`DbDataReader` is a forward-only tabular stream rather than an in-memory
Record Set.

It is often a better choice when data is large:

``` csharp
await using var reader =
    await command.ExecuteReaderAsync(cancellationToken);

while (await reader.ReadAsync(cancellationToken))
{
    var orderId = reader.GetInt32(0);
    var total = reader.GetDecimal(2);

    // Stream the row somewhere.
}
```

Do not materialize a huge Record Set merely because the consumer
ultimately wants tabular output.

## Reporting

Record Set fits reporting particularly well because reports frequently
cross aggregate and domain boundaries.

A sales report may combine:

``` text
Customer
Order
Product
Region
Salesperson
```

Trying to express that as a rich domain object graph can be
counterproductive.

A purpose-built query and tabular result are often clearer.

## CSV Export

A typed row projection can flow directly into an export:

``` csharp
await foreach (var row in query.AsAsyncEnumerable())
{
    await writer.WriteLineAsync(
        $"{row.OrderId},{row.CustomerName},{row.Total}");
}
```

For dynamic columns, a Record Set or dictionary-based row representation
may be more appropriate.

## Spreadsheet Integration

Spreadsheet libraries naturally think in rows and columns.

A Record Set can provide a convenient intermediate form:

``` text
Database query
    |
Record Set
    |
Spreadsheet writer
```

The representation matches the destination.

## Record Set vs. Domain Model

A Domain Model emphasizes:

-   behavior,
-   invariants,
-   identity,
-   relationships.

A Record Set emphasizes:

-   rows,
-   columns,
-   filtering,
-   sorting,
-   tabular transformation.

Do not use a Record Set as the heart of a complex behavioral domain
merely because it is easy to bind to a UI.

## Record Set vs. DTO

A DTO usually has an explicit contract shape.

A Record Set is tabular and may be dynamic.

For a stable public API:

``` csharp
public sealed record OrderDto(...);
```

is generally clearer than returning a generic table.

For an internal reporting engine with configurable columns, the opposite
may be true.

## Record Set vs. Table Module

Table Module organizes business logic around all rows in a table or
view.

Record Set is the tabular data representation that such a module may
operate on.

The two patterns can work together, but neither requires the other.

## DataSet Relationships

A `DataSet` can hold several tables and relationships:

``` text
Orders
OrderLines
Products
```

This can represent a disconnected relational structure in memory.

That capability was particularly common in earlier .NET enterprise
applications.

Today, use it when a relational in-memory representation is actually
useful---not simply because the framework supports it.

## Null Semantics

Tabular data often carries database nulls.

With `DataTable`, that may appear as:

``` csharp
DBNull.Value
```

Strongly typed projections instead use nullable CLR types:

``` csharp
DateTimeOffset? ShippedAt
```

This is one reason typed read models are usually more pleasant when the
schema is fixed.

## Performance

Materializing a large table can consume substantial memory.

Consider:

-   projecting only required columns,
-   streaming large results,
-   pagination,
-   server-side filtering,
-   avoiding duplicate data,
-   choosing typed objects when they are cheaper and clearer.

Record Set is a representation choice, not an excuse to move the whole
database into RAM.

## Validation and Business Logic

Fowler's original motivation highlights a danger of data-aware tabular
tooling: complex business rules can end up mixed into UI or database
code.

That concern still applies.

Use Record Set where the problem is genuinely tabular.

Keep significant domain behavior in an appropriate domain or application
layer.

## Testing

For fixed-schema Record Sets, verify:

-   expected columns,
-   types,
-   null handling,
-   row ordering where relevant,
-   conversions,
-   empty results.

For dynamic reports, schema tests are often as important as value tests.

## When to Use It

Record Set is a good fit for:

-   reporting,
-   dynamic tabular data,
-   spreadsheet and CSV workflows,
-   imports and exports,
-   database tooling,
-   simple data-centric screens.

## When to Prefer Typed Objects

Prefer records, DTOs, or domain objects when:

-   the schema is stable,
-   behavior matters,
-   compile-time safety matters,
-   invariants need protection,
-   the data has meaningful object semantics.

## Related Patterns

-   Table Module
-   Table Data Gateway
-   Data Transfer Object
-   Query Object
-   Mapper

## Summary

Record Set represents data in memory using the same row-and-column shape
that relational systems naturally produce.

Modern .NET still supports the classic pattern through `DataTable` and
`DataSet`, but typed records and LINQ projections are often better for
fixed schemas.

The pattern remains valuable when the problem itself is
tabular---particularly in reporting, integration, and dynamic data
workflows.
