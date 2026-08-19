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

Most recognized name. Convention-based configuration maps properties by name, `Profile` system for complex scenarios. Commercial license since April 2025, free community tier exists, but larger orgs need paid. Still actively maintained.

Extremely mature `ProjectTo` support for EF Core queries, most-cited reason teams stay. Convention model handles common scenarios with minimal code.

Consistently slowest in benchmarks (roughly 8x slower than manual/Mapperly), due to reflection and expression trees. Runtime-based mapping means config errors surface at runtime, not compile time.

## Mapster

Zero-configuration for simple mapping: `source.Adapt<Destination>()` just works. Compile-time source-generation mode available. Free and open source.

Faster than AutoMapper by default. Flexible, bridges runtime and compile-time approaches.

Development pace slowed; long-term maintenance uncertain. Limited EF Core `ProjectTo` support. Documentation and community don't match Mapperly's momentum.

## Mapperly

Source-generator-based. Produces real, compile-time-generated C# mapping code. Performance on par with manual mapping, meaningfully faster than AutoMapper, no reflection overhead.

Generated code is readable and debuggable, step directly into it. Mapping errors caught at compile time. Actively developed with real momentum.

Different configuration approach from AutoMapper, migrating existing codebases isn't recommended; better as clean-slate. Smaller community, though growing. EF Core projection support is less battle-tested than AutoMapper's.

## Manual Mapping

Constructor, static factory method, or assignment block. Fastest option, it's the baseline benchmarks measure against. Zero dependency, zero licensing risk, completely transparent and debuggable.

Scales naturally with refactoring, compiler flags manual mapping methods when types change. No framework conventions to learn.

More boilerplate for large type counts or deeply nested graphs. No automatic pattern handling. Easy to drift into scattered, inconsistent mapping logic without a library to enforce conventions.

## Facet

Generates both the destination type and mapping code from a source domain model. Eliminates DTO boilerplate too, not just mapping logic. Source-generator-based, same debuggability and compile-time safety as Mapperly.

Suited to the common "I need five different views of this entity" scenario. Emerged in response to AutoMapper's commercial shift.

Newer and less established. Solves a narrower problem (DTO + mapping, tightly coupled) not general type-to-type mapping. Smaller community.

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


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
