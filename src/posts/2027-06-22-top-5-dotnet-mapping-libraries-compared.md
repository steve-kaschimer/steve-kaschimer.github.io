---
author: Steve Kaschimer
date: 2027-06-22
image: /images/posts/2027-06-22-hero.webp
image_alt: "Five columns of abstract mapping glyphs positioned along a horizontal axis running from runtime reflection on the left to compile-time source generation on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a convention-based arrow bending through a small profile-shaped panel, a lightning-fast adapt-glyph with a looser, less defined outline implying flexibility, a solid two-piece puzzle connector representing a compiled partial-method fit, a minimal open bracket representing unmediated hand-written code, and a glyph that generates both a small rectangle and a connecting arrow from a single dot, implying a type and its mapping both produced together. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'runtime reflection' on the left to 'compile-time generation' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic arrow clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "AutoMapper's April 2025 shift to commercial licensing did for object mapping what Moq's SponsorLink incident did for mocking - it got teams actually comparing alternatives again. A practical breakdown of five ways to map one type to another in .NET."
tags: ["dotnet", "tooling", "performance", "architecture", "developer-productivity"]
title: "The Top 5 .NET Mapping Libraries Compared: Which One Should You Choose?"
---

Object mapping comparisons in .NET used to start and end with AutoMapper - it was the default so completely that "which mapping library" barely felt like a real question. That changed in April 2025, when AutoMapper's maintainer completed its transition to a commercial licensing model. There's still a free community tier, so plenty of teams are unaffected, but the announcement did what Moq's SponsorLink incident did for mocking: it got a lot of .NET developers actually comparing alternatives for the first time in years, rather than defaulting out of habit.

This guide compares five ways .NET developers map one type to another - AutoMapper, Mapster, Mapperly, manual mapping, and Facet - the last one included specifically because it represents the newest direction this space has moved in, generating not just the mapping code but the destination DTO itself from source generators. None of these are wrong choices; the point is understanding what's actually changed in this landscape recently before defaulting to whichever one a five-year-old tutorial recommended. This series continues with dedicated getting-started walkthroughs for each approach.

## Quick Comparison

| | AutoMapper | Mapster | Mapperly | Manual Mapping | Facet |
| --- | --- | --- | --- | --- | --- |
| **Mechanism** | Runtime reflection/expression trees | Runtime (default) or compile-time via Mapster.Tool | Compile-time source generator | Hand-written C# | Compile-time source generator, generates DTOs too |
| **Performance** | Slowest of the mapper libraries in most benchmarks | Fast, faster still in compile-time mode | Fastest of the libraries, on par with manual | Fastest, the baseline everything is measured against | Fast - source-generated, similar profile to Mapperly |
| **License** | Commercial (since April 2025), free community tier | Free, open source - but development pace has slowed | Free, MIT, actively developed | N/A - just C# | Free, MIT, actively developed |
| **Debuggability** | Harder - reflection/expression internals | Moderate | Excellent - generated code is readable, steppable | Excellent - it's just your code | Excellent - generated code is readable, steppable |
| **EF Core ProjectTo support** | Yes, mature and widely used | Limited | Yes | N/A - write your own projection | Yes, growing support |
| **Best for** | Existing AutoMapper codebases, teams unaffected by licensing | Teams wanting a free, flexible drop-in with both runtime and compile-time modes | New projects wanting compile-time safety and best performance | Small mapping surfaces, or teams who want zero dependency | Teams who want DTOs generated from domain models, not just mapping logic |

## AutoMapper

AutoMapper remains the most recognized name in .NET object mapping, with a convention-based configuration model that automatically maps properties by name and a `Profile`-based system for anything more complex. Its April 2025 shift to a commercial license is the single most important fact to know before evaluating it in 2026.

**Strengths:**

- Extremely mature, with mature `ProjectTo` support for translating mappings directly into EF Core queries - a capability that remains one of its most-cited reasons for staying, even among teams evaluating alternatives elsewhere
- The convention-based configuration model handles a huge range of common mapping scenarios with very little code
- Still actively maintained and updated, contrary to some assumptions after the licensing change - it hasn't been abandoned, just monetized
- The safest choice specifically for legacy migration work, where an existing large AutoMapper investment isn't worth unwinding

**Weaknesses:**

- Commercial licensing since April 2025 - there's a free community tier that covers many users, but larger organizations need a paid license for current versions, a real new cost that didn't exist before
- Consistently the slowest of the dedicated mapping libraries in benchmarks, often by a significant margin (roughly 8x slower than manual mapping or Mapperly in commonly cited results), due to its reliance on reflection and expression trees rather than compile-time code generation
- Runtime-based mapping means configuration errors surface at runtime rather than compile time, a real category of bug the source-generator-based alternatives eliminate entirely

**Choose this when:** you have an existing, working AutoMapper codebase - especially one leaning on `ProjectTo` for EF Core projections - and either fall within the free community tier or the paid license is a reasonable cost against migration risk.

## Mapster

Mapster built its reputation as the free, flexible AutoMapper alternative - a static `Adapt()` extension method that works with zero configuration for simple cases, plus an optional compile-time mode for teams wanting source-generated performance without a full syntax change.

**Strengths:**

- Genuinely zero-configuration for simple mapping scenarios - `source.Adapt<Destination>()` just works for matching property names, no setup required
- Faster than AutoMapper by default, and faster still when using its compile-time source-generation mode
- Free and open source, with no licensing shift comparable to AutoMapper's
- Flexible enough to bridge both runtime and compile-time approaches depending on what a given part of your codebase needs

**Weaknesses:**

- Development pace has genuinely slowed, and its long-term maintenance future carries real uncertainty - worth checking current repository activity before betting a new project on it
- Limited EF Core `ProjectTo`-equivalent support compared to AutoMapper, a real gap if that specific capability matters to your data access patterns
- Documentation and community activity, while still present, don't match the momentum Mapperly has picked up recently as the more actively developed alternative

**Choose this when:** you want a free, low-friction AutoMapper replacement with minimal migration effort - particularly as an interim step during a gradual migration - while being realistic about its uncertain long-term development trajectory.

## Mapperly

Mapperly is the momentum play in this comparison - a source-generator-based mapper that produces real, compile-time-generated C# mapping code, with performance on par with hand-written manual mapping and a growing reputation as the library actively picking up the adoption AutoMapper and Mapster are each losing for different reasons.

**Strengths:**

- Performance on par with manual mapping in benchmarks - meaningfully faster than AutoMapper and generally faster than Mapster's default runtime mode, since there's no reflection or runtime code generation overhead at all
- Generated mapping code is readable and fully debuggable - you can step directly into it, the same debugging advantage source-generator-based tools bring to mocking (Rocks) and testing (TUnit)
- Mapping errors are caught at compile time, not runtime - a mistyped member reference becomes a build error immediately rather than a production surprise
- Actively developed with real momentum, including adoption by major frameworks like ABP, which switched specifically because of Mapperly's active maintenance versus Mapster's slowing pace

**Weaknesses:**

- A genuinely different configuration approach from AutoMapper's `Profile`-based model - migrating an existing AutoMapper codebase to Mapperly profile-by-profile is explicitly not recommended by practitioners; it fits much better as a clean-slate choice for new or rewritten services
- Smaller community than AutoMapper's historical peak, though growing quickly
- EF Core projection support exists but is less battle-tested than AutoMapper's long-established `ProjectTo`

**Choose this when:** you're starting a new project or rewriting a service, and want the best combination of performance, compile-time safety, and active development momentum - the clearest "if starting fresh today" answer in this comparison.

## Manual Mapping

Writing mapping code by hand - a constructor, a static factory method, or a simple assignment block - remains a completely legitimate choice, and one that's gained renewed attention specifically because AutoMapper's licensing change prompted a broader "do we actually need a library for this" conversation across the ecosystem.

**Strengths:**

- The fastest option, full stop - it's the baseline every benchmark in this comparison measures itself against, since there's no abstraction layer at all
- Zero external dependency, zero licensing risk, and completely transparent, debuggable code
- No framework-specific conventions to learn - any C# developer can read and modify a manual mapping method immediately
- Scales naturally alongside refactoring - when a source or destination type changes, the compiler immediately flags every manual mapping method that needs updating

**Weaknesses:**

- Genuinely more boilerplate for large numbers of types or deeply nested object graphs, which is exactly the tedious, repetitive work mapping libraries exist to eliminate
- No automatic handling of common patterns (flattening, unflattening, collection mapping) that a library provides out of the box
- Easy to let mapping logic drift into being scattered and inconsistent across a codebase without a shared convention a library would otherwise enforce

**Choose this when:** your mapping surface is small to moderate, your team values maximum transparency and zero dependency risk over convenience, or you're working in a context where adding a mapping dependency isn't appropriate.

## Facet

Facet represents a different framing of the whole problem: instead of asking "how do I map an existing DTO from my domain model," it asks "why am I hand-writing the DTO at all." Using C# source generators, Facet generates both the destination type and the mapping code to populate it, from a single declarative attribute.

**Strengths:**

- Eliminates a category of boilerplate the other four approaches don't even attempt to address - not just the mapping logic, but the DTO class definition itself, generated directly from your domain model
- Source-generator-based, meaning the same debuggability and compile-time safety advantages Mapperly offers over AutoMapper and Mapster's runtime approaches
- A genuinely novel take specifically suited to the common "I need five slightly different views of this one entity" scenario that traditionally means five hand-maintained DTO classes plus five mapping profiles
- Emerged directly in response to the gap AutoMapper's commercial shift and the broader source-generator trend created

**Weaknesses:**

- Newer and less established than any other option in this comparison - a genuinely different bet than adopting Mapperly, which at least follows a mapping model similar to what AutoMapper and Mapster already established
- Solves a narrower, more specific problem (DTO generation plus mapping, tightly coupled) rather than being a general-purpose mapper for arbitrary type-to-type scenarios
- Much smaller community and real-world adoption than any of the other four

**Choose this when:** your dominant mapping pattern is "generate a focused view of a domain entity" rather than general arbitrary type-to-type mapping, and you're comfortable adopting a newer, narrower tool to eliminate DTO boilerplate specifically, not just mapping logic.

## How to Decide

A few heuristics that cover most real-world decisions:

**Have an existing, working AutoMapper codebase, especially one using ProjectTo for EF Core?** Staying is often the right call - check whether you fall within the free community tier, and weigh migration risk against licensing cost if not.

**Starting a new project or rewriting a service, with no existing mapping investment?** Mapperly is the clearest answer - best performance, compile-time safety, and real development momentum behind it.

**Want a free, low-friction path away from AutoMapper without a big rewrite?** Mapster's `Adapt()` can often slot in with minimal code changes, with the honest caveat about its uncertain long-term maintenance trajectory.

**Mapping surface is small, or you want zero dependency risk?** Manual mapping remains completely reasonable - don't feel obligated to adopt a library for a handful of straightforward type conversions.

**Your core pattern is generating focused DTOs from domain entities, not general mapping?** Facet is worth evaluating specifically for that narrower, common scenario.

A pattern worth knowing: several teams run AutoMapper and Mapperly side by side deliberately - AutoMapper retained specifically for EF Core `ProjectTo` projection where it remains strongest, with Mapperly handling everything else. That's not indecision, it's using each tool where it's genuinely better rather than forcing one choice everywhere.

## Frequently Asked Questions

### Is AutoMapper still safe to use after going commercial?

Yes, technically - it's actively maintained and the free community tier covers a meaningful share of users. The real question isn't safety but cost: larger organizations need to evaluate whether a paid license is worth it against migrating to a free alternative, a calculation that didn't exist before April 2025.

### What's the actual performance difference between these options in practice?

Commonly cited benchmarks show AutoMapper roughly 8x slower than manual mapping or Mapperly for equivalent operations, though the absolute difference is often in nanoseconds and genuinely negligible for most application workloads. The gap matters far more in high-throughput, mapping-heavy hot paths than in typical CRUD applications where the database or network call dwarfs mapping overhead entirely.

### Should I migrate my existing AutoMapper codebase to Mapperly?

Practitioner guidance is fairly consistent on this: don't attempt a profile-by-profile migration of a large existing AutoMapper codebase to Mapperly - the configuration models are different enough that this ends up slower than a targeted rewrite. Mapperly fits much better as a clean-slate choice for new services or ones already being substantially rewritten.

### Is Mapster a safe long-term bet for a new project?

It's worth going in aware of its slowed development pace and uncertain maintenance future - some teams and frameworks (ABP being a notable example) have specifically moved to Mapperly citing this concern. Mapster remains functional and free today, but if you're choosing for a new, long-lived project, Mapperly's more active development is the more conservative bet.

### Can I use AutoMapper and Mapperly in the same project?

Yes, and this is a deliberate pattern some teams use - retaining AutoMapper specifically for EF Core `ProjectTo` projection while routing all other in-memory mapping through Mapperly. It's not a transitional accident; it's using each tool for what it's genuinely best at.

### Is manual mapping actually a reasonable choice, or just what you do before adopting a "real" library?

It's a completely legitimate, permanent choice for many codebases, not just a stepping stone. For a small to moderate mapping surface, manual mapping's transparency, zero dependency risk, and baseline performance are real advantages - the "you need a library" assumption is worth questioning rather than accepting by default, especially post-AutoMapper's licensing shift prompting exactly that reconsideration across the ecosystem.

### What makes Facet different from Mapperly if both use source generators?

Mapperly generates mapping code between two types you've already defined. Facet generates the destination type itself, alongside the mapping code, from a declarative attribute on your domain model - eliminating the DTO class definition, not just the logic to populate it. They're solving adjacent but distinct problems: Mapperly assumes your DTOs already exist; Facet assumes they don't need to be hand-written at all.
