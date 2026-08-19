---
author: Steve Kaschimer
date: 2027-01-05
image: /images/posts/2027-01-05-hero.webp
image_alt: "Five columns of abstract testing glyphs positioned along a horizontal axis running from runtime discovery on the left to compile-time discovery on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a simple box with a single arrow entering directly (minimal ceremony), a small badge shape with a chained link icon (rich composable assertions), a plain window-pane rectangle divided into four panes, a gear icon transforming into a small checkmark-in-box at its right edge (compile-time generation), and a lowercase lambda glyph beside a short connected chain of dots (composable data). Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'runtime discovery' on the left to 'compile-time discovery' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, robot faces, generic gears used as a dominant motif, or Microsoft/Visual Studio iconography."
layout: post.njk
site_title: Tech Notes
summary: "xUnit, NUnit, MSTest, TUnit, and Expecto don't all discover tests the same way anymore. A practical breakdown of what each optimizes for, and why the discovery mechanism - not the syntax - is the real story."
tags: ["dotnet", "testing", "performance", "tooling", "developer-productivity"]
title: "The Top 5 .NET Testing Frameworks Compared: Which One Should You Choose?"
---



For a long time, "which .NET testing framework" meant picking between xUnit, NUnit, and MSTest - three mature options with overlapping feature sets and mostly stylistic differences. That's shifted meaningfully in the last couple of years. Microsoft.Testing.Platform, a new lightweight test execution platform, is now supported across every major framework, and TUnit has emerged as a genuinely different architecture - source-generated, reflection-free, Native AOT-compatible - built specifically because reflection-based test discovery was starting to show its age against modern .NET's performance expectations.

This guide compares the five testing frameworks .NET developers reach for most often: xUnit, NUnit, MSTest, TUnit, and Expecto (F#'s functional-first testing library, included because a comparison of .NET testing tools that only covers C#-oriented frameworks misses a real and distinct part of the ecosystem). The three incumbents remain excellent, mature choices - this isn't a "the old ones are obsolete" story - but the landscape now has a genuinely different architectural option worth understanding before you default to habit. This series continues with dedicated getting-started walkthroughs for each framework in .NET.

## Quick Comparison

| | xUnit | NUnit | MSTest | TUnit | Expecto |
| --- | --- | --- | --- | --- | --- |
| **Origin** | Built for .NET, by original NUnit contributors | Ported from JUnit, independently evolved | Microsoft's own framework | New, source-generator-based (2024+) | F#-native, functional-first |
| **Test discovery** | Reflection | Reflection | Reflection | Source-generated at compile time | Reflection (F# quotations-based) |
| **Native AOT support** | No | No | Partial | Yes, first-class | No |
| **Parallel execution** | Default, class-level | Configurable | Configurable | Default | Native to functional test trees |
| **Maturity** | Very mature, .NET Core-era default | Very mature, oldest of the three incumbents | Mature, Microsoft-backed | New, API mostly stable, pre-1.0 in places | Mature within the F# ecosystem |
| **Best for** | Most new .NET Core/.NET projects | Teams wanting rich assertion/attribute features | Visual Studio-centric teams, Microsoft-stack shops | Performance-critical suites, AOT/trimmed deployments, greenfield projects | F# projects wanting idiomatic, functional tests |

## xUnit

The default. What `dotnet new xunit` gives you. Clean, minimal ceremony: constructor-based setup, `IDisposable` for teardown, fewer attributes. Runs tests in parallel at the class level by default.

Built by some of the people behind the original NUnit, specifically to fix design decisions they'd made there. Strongest constructor-based dependency injection support in this list.

Class-level parallelism by default surfaces hidden test interdependencies, a real but ultimately healthy adjustment for suites migrating from sequential execution. Still reflection-based, so no AOT or compile-time benefits.

## NUnit

Rich assertion syntax: `Assert.That(result, Is.EqualTo(expected))`. Extensive built-in features: `[TestCase]` for parameterized data, `[SetUp]`/`[TearDown]`, categories. .NET Foundation project, institutional backing.

More attribute ceremony than xUnit. Older than xUnit in the .NET Core era, so less default tooling support. Same reflection-based discovery as xUnit and MSTest.

## MSTest

Microsoft's own framework. Deep Visual Studio integration. Supports both legacy VSTest platform and newer Microsoft.Testing.Platform. Familiar to teams from older .NET Framework projects.

Generally perceived as less ergonomic than xUnit or NUnit for day-to-day writing, though the gap has narrowed. Less community momentum for new projects. Same reflection-based discovery.

## TUnit

Genuinely different architecture. Source generators wire up tests at compile time instead of reflection at runtime. Work shifts from run time to build time.

Meaningfully faster execution, especially at scale and in async-heavy suites. First-class Native AOT and trimming support, genuinely useful for cloud-native deployments. Batteries-included assertions, mocking, ASP.NET Core/Aspire/Playwright integrations via Microsoft.Testing.Platform.

New (alpha in 2024). Smaller community. Migrating a large existing suite is a real undertaking. Best for greenfield or existing suites already hitting performance problems.

## Expecto

F#'s idiomatic testing library. Tests as composable values and functions, not attribute-decorated methods. Lightweight, fast, parallelism fits the functional test-tree structure naturally.

For F#, not C#. Smaller community. Included because F# teams deserve an answer for their language, not an awkward adaptation of xUnit.

## How to Decide

A few heuristics that cover most real-world decisions:

**Starting a new .NET Core or .NET 5+ project in C#, no specific reason to deviate?** xUnit remains the closest thing to a safe default, with the deepest ecosystem support for current .NET idioms.

**Prefer rich, expressive assertion syntax and a comprehensive built-in attribute feature set?** NUnit's maturity and readability are genuine strengths, not just legacy inertia.

**Standardized on Visual Studio and the Microsoft stack, or maintaining an existing MSTest suite?** MSTest's first-party integration and predictable support tied to .NET itself are real, practical advantages in that context.

**Starting greenfield and want the best possible performance, or specifically need Native AOT-compatible tests?** TUnit is the only framework here architecturally built for that - worth serious evaluation despite being newer.

**Writing F#?** Expecto is the idiomatic choice, built for the language rather than adapted to it.

Migrating an existing large test suite between frameworks purely for marginal ergonomic gains is rarely worth the churn - the strongest case for switching is a concrete, felt pain point (CI run time, AOT compatibility, a specific missing feature) rather than a general sense that a newer option exists.

## Frequently Asked Questions

### Is xUnit still the best default choice for a new .NET project in 2026?

For most new C# projects without a specific reason to deviate, yes - it remains the closest thing to a safe default, with strong ecosystem support and tooling integration for current .NET idioms. TUnit is a legitimate alternative worth evaluating specifically if performance or Native AOT compatibility are concrete requirements from the start, not just general interest in something newer.

### What's the actual practical benefit of TUnit's source-generated test discovery?

Faster test execution (particularly noticeable in large or async-heavy suites) and Native AOT/trimming compatibility that reflection-based frameworks structurally can't offer without significant rework. Since test discovery happens at compile time rather than being computed via reflection at every run, startup and discovery overhead shifts to build time, where it's a one-time cost rather than a per-run one.

### Should I migrate my existing xUnit or NUnit test suite to TUnit?

Generally not, unless you have a concrete, felt pain point - slow CI test execution or a genuine need for AOT-compatible test binaries - that TUnit specifically addresses. For most established suites where the current framework is working fine, migration churn isn't worth it purely for the sake of using something newer; TUnit's strongest case is greenfield adoption.

### Does Microsoft.Testing.Platform mean all these frameworks now work the same way?

Not entirely - Microsoft.Testing.Platform is a shared, lightweight execution platform that xUnit, NUnit, MSTest, and TUnit can all run on (replacing or supplementing the older VSTest platform), which improves consistency in areas like CI integration and tooling. But each framework still has its own distinct API, attribute model (or lack thereof, for TUnit), and philosophy for actually writing tests - the platform underneath is converging, but the developer-facing experience remains meaningfully different.

### Is NUnit outdated compared to xUnit?

No - it's a different design philosophy (attribute-rich, expressive assertions) rather than an outdated one. NUnit remains actively maintained, widely used, and a completely reasonable choice, particularly for teams that prefer its assertion style or are already invested in an NUnit codebase. "Not the new-project default" isn't the same as "outdated."

### Can I use TUnit if my project isn't targeting Native AOT?

Yes - Native AOT compatibility is one of TUnit's strengths, not a requirement to use it. Its source-generated discovery still provides faster test execution even for applications with no AOT plans at all, so the performance benefit applies more broadly than just AOT scenarios specifically.

### Why is Expecto included in a .NET testing framework comparison alongside C#-focused tools?

Because F# is a first-class .NET language with real production use, and a testing framework comparison that only covers C#-oriented tools misses a meaningful part of the ecosystem. Expecto isn't competing for the same adoption decision as the other four - it's the answer for teams whose actual question is "what's the idiomatic testing library for F#," which deserves its own honest answer rather than a C#-shaped one.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
