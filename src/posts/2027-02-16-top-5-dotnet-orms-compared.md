---
author: Steve Kaschimer
date: 2027-02-16
image: /images/posts/2027-02-16-hero.webp
image_alt: "Five columns of abstract data-access glyphs positioned along a horizontal axis running from full object tracking on the left to raw SQL on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a box shape with a small tracked checkmark badge in its corner, a thin SQL-bracket glyph flowing directly into a mapped rectangle with almost no gap, a stack of three small labeled config panels beside a vault-shaped icon, a straight teal arrow passing cleanly through a narrow funnel with no obstruction, and a shape split evenly down the middle - one half a small gear-free generated-method icon, the other half a raw bracket glyph. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'full tracking' on the left to 'raw SQL' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, robot faces, generic gears or database-cylinder clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "EF Core, Dapper, NHibernate, Linq2Db, and RepoDb all sit at different points on one axis: how much should the ORM do for you, versus how much SQL do you want to write yourself. A practical breakdown of what each optimizes for."
tags: ["dotnet", "orm", "database", "performance", "architecture"]
title: "The Top 5 .NET ORMs Compared: Which One Should You Choose?"
---



Every .NET data access decision eventually collapses into the same question: how much should the ORM do for you, versus how much SQL do you want to write yourself? That's really the axis all five of these tools sit on. EF Core sits at the "do the most for me" end. Dapper sits at the "get out of my way" end. The other three - NHibernate, Linq2Db, and RepoDb - fill in the space between with their own specific trade-offs, and none of them are simply worse versions of EF Core or Dapper.

This guide compares the five ORMs .NET developers reach for most often, what each one actually optimizes for, and which project profile fits best. One thing worth knowing upfront: for a meaningful share of real production systems, the honest answer isn't "pick one" - it's EF Core for the domain and migrations, with Dapper handling the specific read paths where raw SQL control matters more than abstraction. That hybrid pattern comes up often enough in this comparison that it's worth keeping in mind while reading. This series continues with dedicated getting-started walkthroughs for each ORM in .NET.

## Quick Comparison

| | EF Core | Dapper | NHibernate | Linq2Db | RepoDb |
| --- | --- | --- | --- | --- | --- |
| **Category** | Full ORM | Micro-ORM | Full ORM | LINQ-to-SQL micro-ORM | Hybrid micro-ORM |
| **Query style** | LINQ over entities | Raw SQL, mapped to objects | HQL, Criteria API, LINQ | Strongly-typed LINQ-to-SQL | Method-based + raw SQL |
| **Change tracking** | Yes, built in | No | Yes, built in | No | No |
| **Migrations** | Built-in, mature tooling | None - bring your own | Supported via tooling | None - bring your own | None - bring your own |
| **Performance** | Good, close to raw ADO.NET when tuned | Fastest for raw/complex queries | Good, but heavier than micro-ORMs | Very fast - minimal abstraction over SQL | Comparable to or faster than Dapper in some benchmarks |
| **Learning curve** | Moderate | Low | Higher - more configuration surface | Low-moderate | Low |
| **Maintainer** | Microsoft | Community (Stack Overflow-originated) | Community (Hibernate .NET port) | Community | Community |
| **Best for** | Most new ASP.NET Core projects | Read-heavy paths, reporting, raw SQL control | Existing enterprise codebases already using it | Teams wanting LINQ with minimal ORM overhead | Teams wanting Dapper's speed with less boilerplate |

## EF Core

The default for new ASP.NET Core projects. Full ORM: entities, change tracking, LINQ → SQL, mature migrations system. Actively maintained by Microsoft with tight ecosystem integration.

Code First, Database First, Model First workflows. LINQ queries are strongly typed and refactor-safe, catches bugs raw SQL strings miss. Migrations are good, schema evolution alongside code.

Change tracking has overhead; `AsNoTracking()` fixes read-only queries. Generated SQL for complex queries can surprise you compared to hand-written. Abstraction obscures what's happening at the database level, making perf diagnostics harder.

## Dapper

Map SQL query results onto .NET objects, as fast as possible. Minimal footprint, no config ceremony. Built at Stack Overflow.

Full SQL control. When you need to hand-tune execution plans or use database-specific features EF Core doesn't model. Supports multi-mapping, batching, bulk ops.

No change tracking, no migrations, no schema management. Every query is a raw SQL string, refactoring a column name doesn't get caught by the compiler. Doesn't scale gracefully to large domain models with many relationships.

Very commonly paired with EF Core for specific read paths (reporting, high-throughput) rather than used as a full replacement.

## NHibernate

.NET port of Java's Hibernate. Used in large enterprise apps for over a decade. Full ORM: HQL, Criteria API, LINQ provider. Extremely configurable, multi-database, custom mapping strategies (Fluent, XML, attributes), precise lazy/eager control. First and second-level caching mature and well-documented.

Steeper learning curve than anything here. Configuration surface is large. EF Core has closed most of the differentiation gap while offering better tooling and a larger community.

Best for existing NHibernate codebases. For new projects, EF Core's caught up enough that NHibernate's complexity is harder to justify.

## Linq2Db

Strongly-typed LINQ queries with minimal abstraction between code and SQL. Thin LINQ layer over SQL, not a full ORM.

Very fast, no change tracking, no identity map overhead. LINQ translates to SQL predictably. Wide database provider support.

No change tracking, so updates require explicit handling. Smaller community and ecosystem. Less commonly adopted.

## RepoDb

Hybrid micro-ORM between Dapper and EF Core. Raw SQL execution + method-based CRUD (`Insert`, `Update`, `Delete`, `Query`). Reduces boilerplate while keeping raw SQL available.

Genuinely fast, benchmarks match or exceed Dapper while offering more convenience. Built-in second-level caching and query tracing. Async throughout. Flexible mapping.

Smaller community than EF Core or Dapper. No migrations or schema management (same gap as Dapper). Less battle-tested at scale.

## How to Decide

A few heuristics that cover most real-world decisions:

**Starting a new ASP.NET Core project with no strong reason to deviate?** EF Core is the right default - mature tooling, Microsoft backing, and migrations that just work.

**Have specific read-heavy or reporting queries where you want full SQL control?** Reach for Dapper for those specific paths rather than replacing your whole data layer - the EF Core-plus-Dapper hybrid pattern is common and well-supported precisely because it lets each tool do what it's best at.

**Maintaining an existing NHibernate codebase?** Keep using it. Its configuration depth pays off in systems already built around it, and a rewrite purely to modernize is rarely worth the risk on its own.

**Want LINQ's type safety without change-tracking overhead?** Linq2Db is worth evaluating if your team values a thin, predictable query layer over a full ORM's feature set.

**Like Dapper's performance but tired of writing the same CRUD SQL repeatedly?** RepoDb's hybrid approach gives you both raw SQL and generated CRUD methods without committing to full ORM overhead.

None of these are exclusive choices within a single application - pairing EF Core for your domain model and migrations with Dapper (or RepoDb) for specific performance-sensitive read paths is a widely accepted pattern, not a compromise.

## Frequently Asked Questions

### Is Dapper actually faster than EF Core?

For complex raw SQL and large result sets, yes, meaningfully. For standard, well-indexed CRUD operations, a properly tuned EF Core query using `AsNoTracking()` performs within a few percent of Dapper - the gap is often smaller than benchmarks suggest, and profiling your actual workload matters more than trusting a generic benchmark.

### Can I use Dapper and EF Core in the same project?

Yes, and it's a common, well-supported pattern. You can obtain the underlying `DbConnection` from your `DbContext` and pass it directly to Dapper's extension methods, letting EF Core handle your domain model and migrations while Dapper handles specific queries that benefit from raw SQL.

### Is NHibernate still worth learning in 2026?

For new, greenfield projects, generally no - EF Core has closed most of the feature gap while offering better tooling and a larger community. NHibernate remains a reasonable choice specifically for maintaining or extending existing systems already built on it, where the migration cost to something else would outweigh the benefit.

### What's the actual difference between a micro-ORM and a full ORM?

A full ORM (EF Core, NHibernate) manages an object graph with change tracking, an identity map, and typically a migrations system for schema evolution. A micro-ORM (Dapper, RepoDb, Linq2Db to varying degrees) focuses narrowly on mapping query results to objects, leaving schema management, change tracking, and unit-of-work concerns to you or another tool.

### Should I choose an ORM based on raw performance benchmarks?

Not primarily. Micro-ORMs will generally win raw benchmarks against full ORMs, but for most applications the bottleneck is the database query itself, network latency, or business logic - not the marginal overhead of an ORM's mapping layer. Choose based on how much abstraction and tooling (migrations, change tracking) your team actually needs, and treat performance as a secondary factor unless you have a specific, measured bottleneck.

### Are RepoDb and Linq2Db mature enough for production use?

Yes, both are used in production systems, but with meaningfully smaller communities than EF Core or Dapper. That's not disqualifying, but it does mean fewer Stack Overflow answers, less third-party tooling, and a smaller pool of developers already familiar with them - factor that into hiring and onboarding considerations, not just technical capability.

### How do migrations work if I'm not using EF Core?

Dapper, RepoDb, and Linq2Db all leave schema migrations entirely up to you - common approaches include a dedicated migration tool (like DbUp, Fluent Migrator, or Flyway) independent of the query layer. NHibernate has some tooling support for schema generation and migration, though less mature than EF Core's. This is one of the clearest differentiators when choosing between a full ORM and a micro-ORM: a full ORM typically owns migrations end-to-end, while a micro-ORM treats it as a separate concern.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
