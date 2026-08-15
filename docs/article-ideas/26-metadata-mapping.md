---
category: Object-Relational Metadata Mapping Patterns
csharp: 14
description: Use metadata-driven mapping to describe how types,
  properties, tables, and columns correspond, and see how EF Core's
  model metadata embodies the pattern.
dotnet: 10
fowler_url: "https://martinfowler.com/eaaCatalog/metadataMapping.html"
order: 26
pattern: Metadata Mapping
series: Patterns of Enterprise Application Architecture in Modern .NET
slug: metadata-mapping
status: draft
title: Metadata Mapping in Modern .NET
---

# Metadata Mapping in Modern .NET

Metadata Mapping moves mapping rules out of hand-written persistence
code and into data that describes the mapping itself.

Instead of hard-coding:

``` csharp
if (type == typeof(Customer))
{
    table = "Customers";
    idColumn = "CustomerId";
}
```

the mapping layer reads metadata.

In modern .NET, EF Core is a major example of this idea.

## The Problem

Imagine a Data Mapper with code like:

``` csharp
public Customer Map(DbDataReader reader)
{
    return new Customer(
        id: reader.GetInt64(
            reader.GetOrdinal("CustomerId")),
        name: reader.GetString(
            reader.GetOrdinal("Name")),
        email: reader.GetString(
            reader.GetOrdinal("Email")));
}
```

For one type, this is manageable.

For hundreds of entities, hand-written mapping becomes repetitive.

Metadata Mapping describes common rules once and lets a generic
mechanism use them.

## Mapping as Data

Conceptually, metadata might say:

``` text
Type: Customer
Table: Customers

Property: Id
Column: CustomerId
Key: true

Property: Name
Column: Name

Property: Email
Column: EmailAddress
```

A generic mapper can interpret those instructions.

The mapping logic becomes reusable.

## Attributes as Metadata

One option is attributes:

``` csharp
[Table("Customers")]
public sealed class Customer
{
    [Key]
    [Column("CustomerId")]
    public long Id { get; private set; }

    [Column("EmailAddress")]
    public string Email { get; private set; } = "";
}
```

This places mapping metadata close to the model.

That is convenient, but it also means the domain type now contains
persistence annotations.

For simple applications, that may be perfectly acceptable.

For a persistence-ignorant domain model, you may prefer external
configuration.

## Fluent Metadata

EF Core's Fluent API lets mapping metadata live outside the entity:

``` csharp
public sealed class CustomerConfiguration
    : IEntityTypeConfiguration<Customer>
{
    public void Configure(
        EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Id)
            .HasColumnName("CustomerId");

        builder.Property(x => x.Email)
            .HasColumnName("EmailAddress");
    }
}
```

The resulting model metadata is then consumed by EF Core's mapping
infrastructure.

## Convention as Metadata

Metadata does not have to be explicitly written.

Conventions are also a form of mapping knowledge.

For example, EF Core can infer that:

``` csharp
public int Id { get; private set; }
```

is likely a primary key.

Likewise, naming conventions can infer relationships.

This gives us three common sources of mapping metadata:

``` text
Conventions
Annotations
Fluent configuration
```

The framework merges them into one internal model.

## Why Metadata Mapping Scales

Without metadata, each mapper must know how to map each type.

With metadata, a generic mapping engine can ask questions such as:

``` text
What table does this entity use?
Which property is the key?
Which columns map to which properties?
What are the relationships?
Which converters apply?
```

The engine stays generic while the model varies.

This is a major reason ORMs can support large schemas without requiring
a custom mapper class for every operation.

## Metadata and Value Conversions

Metadata can also describe transformations:

``` csharp
builder.Property(x => x.Id)
    .HasConversion(
        id => id.Value,
        value => new CustomerId(value));
```

Now the mapping model knows that the CLR type and database type differ.

The same idea applies to:

-   enums,
-   strongly typed IDs,
-   encrypted values,
-   custom scalar types,
-   provider-specific conversions.

## Metadata and Relationships

The metadata model also describes foreign keys:

``` csharp
builder
    .HasOne(x => x.Customer)
    .WithMany(x => x.Orders)
    .HasForeignKey(x => x.CustomerId);
```

That one configuration gives the ORM enough information to reason about:

-   keys,
-   navigation properties,
-   relationship fix-up,
-   joins,
-   cascade behavior,
-   migration generation.

Metadata Mapping is therefore far broader than column-name
configuration.

## Runtime Metadata

EF Core exposes metadata APIs at runtime.

Conceptually:

``` csharp
var entityType =
    db.Model.FindEntityType(typeof(Customer));

var tableName =
    entityType?.GetTableName();
```

This can be useful for framework code, diagnostics, generic
infrastructure, and tooling.

Application business logic should rarely need to inspect ORM metadata
directly.

## Metadata Mapping and Migrations

Once mapping is represented as metadata, the framework can compare model
states and generate migrations.

That is an important secondary benefit.

The mapping model becomes useful not just for runtime persistence, but
also for tooling.

## The Danger of Over-Generalization

Metadata Mapping can tempt teams to build overly generic platforms.

For example:

``` text
Every table uses one universal mapper.
Every query is dynamically generated.
Every business rule is configured in metadata.
```

At some point, code becomes a poorly designed programming language
encoded in configuration.

Metadata is most useful when it describes repetitive structural
information.

Business behavior usually remains clearer in code.

## Reflection and Source Generation

A custom mapper may use reflection to inspect metadata.

Modern .NET also offers source-generation techniques that can move work
from runtime to compile time.

The underlying pattern remains the same: mapping behavior is driven by a
description of the relationship between object and persistence models.

## Testing

Configuration deserves tests when it is complex.

Useful checks include:

-   expected table names,
-   key configuration,
-   required relationships,
-   value converters,
-   indexes,
-   delete behavior,
-   provider-specific column types.

An integration test that builds the model and round-trips representative
entities often catches more than unit-testing configuration classes in
isolation.

## When to Use It

Metadata Mapping is valuable when:

-   many types follow recurring mapping rules,
-   a generic persistence engine is desirable,
-   the ORM already provides metadata infrastructure,
-   mapping configuration should remain separate from domain behavior.

## When Not to Build Your Own

If EF Core already provides mature mapping metadata, creating a second
mapping-description system is usually unnecessary.

Custom metadata systems become justified mainly when you are building
infrastructure that EF Core cannot represent or when mapping is not
relational at all.

## Related Patterns

-   Data Mapper
-   Query Object
-   Repository
-   Inheritance Mappers
-   Embedded Value

## Summary

Metadata Mapping turns persistence mapping from hand-written procedural
code into a model that describes how objects and storage correspond.

EF Core relies heavily on this idea.

Once you see that, many ORM features---conventions, Fluent
configuration, annotations, migrations, value converters, relationship
mapping---fit together as parts of one metadata-driven system.
