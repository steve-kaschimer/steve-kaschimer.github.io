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

Entity Framework Core is Microsoft's official ORM and the default starting point for most new ASP.NET Core projects in 2026. It's a full ORM in the traditional sense: entities, change tracking, LINQ queries translated to SQL, and a mature migrations system for evolving your schema alongside your code.

**Strengths:**

- Actively maintained by Microsoft with tight integration into the rest of the .NET ecosystem - `dotnet ef` tooling, dependency injection, and ASP.NET Core all assume EF Core as a baseline
- Supports Code First, Database First, and Model First workflows, so it fits teams that want to design the schema in C# or teams that need to map an existing database
- LINQ queries are strongly typed and refactor-safe, catching a class of bugs raw SQL strings can't
- Migrations are genuinely good - schema evolution alongside code changes is one of EF Core's most mature capabilities relative to every other option here

**Weaknesses:**

- Change tracking has real overhead, and it's easy to accidentally pay for it on read-only queries if you forget `AsNoTracking()`
- Generated SQL for complex queries can be inefficient or surprising compared to hand-written SQL, especially for reporting-style aggregations
- The abstraction can obscure what's actually happening at the database level, which occasionally makes performance problems harder to diagnose than with a thinner layer

**Choose this when:** you're starting a new ASP.NET Core project and don't have a specific reason to reach for something else - it's the right default, not just the popular one.

## Dapper

Dapper is a micro-ORM originally built at Stack Overflow, designed to do exactly one thing well: map the results of a SQL query you write yourself onto .NET objects, as fast as possible, with almost no overhead beyond raw ADO.NET.

**Strengths:**

- Consistently the fastest option for complex raw SQL and large result sets, and close to raw ADO.NET performance in general
- Minimal footprint - a single lightweight library, no configuration ceremony, easy to learn in an afternoon
- Full SQL control, which matters when you need to hand-tune a query for a specific execution plan or use database-specific features EF Core doesn't model well
- Supports multi-mapping, batching, and bulk operations for scenarios where that control pays off

**Weaknesses:**

- No change tracking, no migrations, and no schema management - Dapper is exclusively about executing SQL and mapping results, so you need another tool or manual process for everything else
- Every query is a raw SQL string, so refactoring a column name doesn't get caught by the compiler the way a LINQ query would
- Scales less gracefully to large domain models with many relationships, since there's no built-in graph tracking or navigation the way a full ORM provides

**Choose this when:** you have specific read paths - reporting queries, high-throughput endpoints, anything with a SQL query you'd rather write and tune directly - where the control is worth giving up the abstraction. Very commonly paired with EF Core rather than used as a full replacement.

## NHibernate

NHibernate is the .NET port of Java's Hibernate, and it's been used in large enterprise .NET applications for well over a decade. It's a full ORM with deep configuration options - HQL (its own query language), a Criteria API, a LINQ provider, and fine-grained control over caching and loading behavior.

**Strengths:**

- Extremely configurable - multi-database support, custom mapping strategies (Fluent API, XML, attribute-based), and precise control over lazy vs. eager loading
- First-level and second-level caching are mature and well-documented, useful for high-read enterprise workloads
- Proven at scale in large, long-running enterprise systems, with well-understood behavior after years of production use

**Weaknesses:**

- Steeper learning curve than any other option here - the configuration surface is large, and the XML/Fluent mapping conventions take real time to internalize
- EF Core has closed most of the feature gap that used to differentiate NHibernate, while offering better tooling integration and a much larger active community
- Not the recommended starting point for a new, greenfield .NET project in 2026 - its strongest use case is genuinely existing systems already built on it

**Choose this when:** you're maintaining or extending an existing NHibernate codebase. For new projects, EF Core has caught up enough in capability that NHibernate's added complexity is harder to justify than it used to be.

## Linq2Db

Linq2Db (LINQ to DB) is a lightweight ORM that gives you strongly-typed LINQ queries with minimal abstraction between your code and the generated SQL - closer in spirit to a "thin LINQ layer over SQL" than a full ORM with change tracking and unit-of-work semantics.

**Strengths:**

- Very fast - because there's no change tracking or identity map overhead, query execution stays close to what you'd get writing SQL by hand
- LINQ queries translate to SQL predictably, with less of the "what did EF Core actually generate here" uncertainty that can come with a heavier ORM
- Supports a wide range of database providers, and is a strong fit for teams that want LINQ's ergonomics without paying for features they don't use

**Weaknesses:**

- No change tracking, so update workflows require more explicit handling than EF Core's automatic dirty-checking
- Smaller community and ecosystem than EF Core or Dapper, meaning fewer tutorials, Stack Overflow answers, and third-party integrations to lean on
- Less commonly adopted than the other four, so hiring and onboarding developers already familiar with it is less likely

**Choose this when:** you want LINQ's type safety and query composability without the overhead of change tracking, and you're comfortable trading community size for a leaner, more predictable query layer.

## RepoDb

RepoDb positions itself deliberately between Dapper and EF Core - a hybrid micro-ORM that offers Dapper-like raw SQL execution alongside method-based CRUD operations that reduce the boilerplate a pure micro-ORM leaves you to write yourself.

**Strengths:**

- Genuinely fast - benchmarks frequently show it matching or exceeding Dapper's performance while offering more built-in convenience
- Method-based CRUD (`Insert`, `Update`, `Delete`, `Query`) reduces the amount of hand-written SQL needed for routine operations, while raw SQL is still available when you need it
- Built-in second-level caching and query tracing are useful additions a pure micro-ORM like Dapper doesn't provide out of the box
- Async support throughout, and flexible mapping (type, field, multi-result-set) for less common data shapes

**Weaknesses:**

- Smaller community and ecosystem than EF Core, Dapper, or even NHibernate, which means less third-party tooling and fewer people to ask when something goes wrong
- No migrations or schema management, the same gap Dapper has - you're on your own for evolving the database schema
- Less battle-tested at scale in the broadest sense than the four more established options here, simply due to smaller adoption

**Choose this when:** you want Dapper's performance profile but find yourself re-writing the same CRUD boilerplate repeatedly, and you're comfortable adopting a less widely used library in exchange for that convenience.

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
