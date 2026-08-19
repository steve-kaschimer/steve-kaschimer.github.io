---
author: Steve Kaschimer
date: 2028-02-15
image: /images/posts/2028-02-15-hero.webp
image_alt: "A query-bracket glyph resembling a LINQ expression feeding into a small dependency-graph node cluster, with a distinct commercial-key badge marking it apart from the free tools around it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a thin bracket-shaped glyph resembling a LINQ query expression on the left, connected by a teal line to a small cluster of interconnected nodes on the right representing a dependency graph. A small amber key-shaped badge sits beside the query bracket, implying a licensed, unlocked capability distinct from the free tools around it. Mood is deep, deliberate, and premium. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "NDepend's reputation as the Swiss Army knife for .NET code quality comes down to CQLinq - a LINQ-based query language for interrogating your codebase's structure directly. A setup guide for writing CQLinq rules, dependency visualization, and honest licensing considerations."
tags: ["dotnet", "architecture", "code-quality", "tooling"]
title: "Getting Started with NDepend in .NET"
---



NDepend's reputation as the "Swiss Army knife" for .NET code quality comes down to one specific capability the rest of this comparison series doesn't have: CQLinq, a LINQ-based query language for interrogating your codebase's structure directly. Instead of learning a bespoke fluent API like NetArchTest's or configuring rules through a web UI like SonarQube's, you write actual LINQ queries against your code - which means anything you can express in LINQ, you can ask about your codebase, without waiting for the tool to have a purpose-built feature for that specific question.

This guide covers installing and running NDepend, bootstrapping a baseline analysis and your first CQLinq rules, the core patterns for dependency visualization and trend tracking, and the best practices for getting real value out of a tool with genuine depth rather than just running a default report once and forgetting about it. By the end you'll have NDepend integrated into your workflow with rules that reflect your team's actual priorities.

If you're deciding between architecture/quality tools first, [a comparison of the top .NET architecture and quality enforcement tools](/posts/2028-01-18-top-5-dotnet-architecture-quality-tools-compared/) covers where NDepend fits relative to NetArchTest, ArchUnitNET, SonarQube, and Roslyn Analyzers - including the licensing consideration that sets it apart from every other tool in this series.

## What You'll Need

- A licensed copy of NDepend (commercial; a trial is available for evaluation)
- .NET 8 SDK or later
- Visual Studio is the most integrated experience, though NDepend also runs standalone and via CI integration without it

## Installing and Scaffolding

Install the NDepend Visual Studio extension for the most integrated experience, or download the standalone NDepend application for CI/command-line use. For a first analysis:

1. Open NDepend (or the Visual Studio extension) and choose **Analyze .NET assemblies**, pointing it at your solution or built output
2. NDepend scans your assemblies and produces a baseline analysis - dependency graphs, metrics, and a first-pass quality report

For CI integration, NDepend provides a console tool that can run analysis as part of a build pipeline:

```bash
NDepend.Console.exe MyApp.ndproj /OutDir NDependOut
```

This generates an HTML report and, if configured, XML output your CI can parse for pass/fail decisions.

## Bootstrapping the Ideal Environment

### Your first CQLinq rule

CQLinq queries live in NDepend's rule editor and read like ordinary LINQ against a `codebase` object exposing your analyzed assemblies:

```csharp
// Methods with high cyclomatic complexity
from m in Application.Methods
where m.CyclomaticComplexity > 20
orderby m.CyclomaticComplexity descending
select new { m, m.CyclomaticComplexity }
```

Running this immediately lists every method exceeding a complexity threshold, ranked - no separate configuration screen, just a LINQ query you can adjust freely.

### Enforcing a dependency-direction rule via CQLinq

```csharp
// Core should not depend on Infrastructure
from t in Application.Types
where t.ParentNamespace.Name == "MyApp.Core"
where t.DependsOn("MyApp.Infrastructure")
select t
```

This is functionally similar to what NetArchTest or ArchUnitNET would express in their own fluent APIs, but written as a direct LINQ query - worth knowing if your team is already comfortable with LINQ and would rather express architecture rules that way than learn a separate DSL.

### Setting up quality gates

In NDepend's dashboard, define rules with pass/fail thresholds (e.g., "no critical rule violations," "technical debt ratio below X%") and mark them as quality gate conditions. Configure your CI's console tool invocation to exit with a non-zero code if the gate fails, the same enforcement pattern as SonarQube's quality gates but driven by NDepend's own rule set and metrics.

### Dependency graph visualization

NDepend's dependency graph and dependency matrix views are interactive visualizations of your codebase's actual structure - useful specifically for spotting problems that are hard to see reading code directly: an unexpected coupling between two modules that were supposed to be independent, or a component with a surprisingly large number of incoming dependencies that makes it risky to change.

## Core Workflow

- **Start from NDepend's default rule set, then customize deliberately.** It ships with a substantial library of built-in CQLinq rules covering common code quality concerns - review and adjust rather than starting from a blank slate.
- **Use CQLinq for anything the built-in rules don't already express**, treating it as a genuine query language rather than a limited configuration surface - if you can express the question in LINQ, you can ask NDepend about it.
- **Check the dependency graph/matrix periodically, not just the pass/fail metrics.** Some structural problems are much easier to spot visually than through a list of rule violations.

## Verifying Your Setup

1. **Analysis runs successfully against your actual solution** - confirm NDepend produces a report reflecting your real codebase's structure and metrics
2. **CQLinq rules return expected results** - test a rule against a codebase area you know has (or doesn't have) a specific issue, confirming the query behaves as intended
3. **Quality gate integrates with CI correctly** - confirm a deliberately introduced violation causes the CI step to fail as configured
4. **Trend data accumulates over multiple analysis runs** - confirm the dashboard's historical view reflects data from more than a single run, since trend tracking is one of NDepend's core value propositions

## Best Practices

**Invest time in learning CQLinq rather than only using default rules.** The querying flexibility is NDepend's most distinctive capability relative to every other tool in this comparison - underusing it means paying for a feature you're not getting value from.

**Use the dependency graph and matrix views deliberately, not just as a novelty.** They surface structural problems (unexpected coupling, risky high-fan-in components) that are genuinely hard to spot by reading code or scanning a metrics list.

**Track trends over time, not just pass/fail on the current commit.** NDepend's historical view is one of its real advantages over test-scoped architecture libraries - use it to answer "is our technical debt trend improving," not just "does this commit pass."

**Confirm your licensing covers your actual team size and CI usage before committing architecturally to it.** NDepend's per-seat commercial licensing is a real, ongoing cost - factor it into the decision honestly rather than assuming free-tool-equivalent economics.

**Pair with Roslyn Analyzers for the fastest possible in-editor feedback**, using NDepend for the deeper, trend-oriented analysis it's specifically strong at. NDepend's analysis runs are not instant the way compiler-integrated analyzers are.

## Comparison with NetArchTest

| | NDepend | NetArchTest |
| --- | --- | --- |
| Rule language | CQLinq (full LINQ query language) | Fluent API specific to dependency rules |
| Scope | Broad - metrics, dependencies, trends, visualization | Narrow - dependency-direction and structural rules |
| Visualization | Rich (dependency graphs, matrices) | None |
| Trend tracking | Strong, built in | None |
| License | Commercial | Free, open source |

NDepend can express everything NetArchTest can (and considerably more) via CQLinq, but at real licensing cost and a steeper learning curve - the choice comes down to whether you need NDepend's broader scope and visualization, or whether NetArchTest's narrower, free, purpose-built tool already covers your actual need.

## Frequently Asked Questions

### Is NDepend worth the cost compared to free alternatives like NetArchTest or Roslyn Analyzers?

It depends on what you actually need. For straightforward dependency-direction enforcement, the free architecture-testing libraries cover the need without cost. NDepend's value is in its combination of deep CQLinq querying, rich visualization, and long-term trend tracking - capabilities that become more valuable as codebase size and organizational complexity grow, and that no free tool in this comparison fully replicates together.

### Do I need to know LINQ well to use CQLinq effectively?

Comfort with LINQ syntax (from, where, select, orderby) translates directly - if your team already writes LINQ queries against application data, the same mental model applies to querying your codebase's structure through NDepend. It's a real but not enormous learning curve if you're already LINQ-fluent.

### Can NDepend replace SonarQube?

There's real overlap - both offer quality gates, metrics, and dashboards - but they're not identical. SonarQube's strength is broader multi-language, multi-repository organizational quality gates with a strong open-source/free tier; NDepend's strength is deep, LINQ-queryable .NET-specific structural analysis and visualization. Some teams use one, some use both for their respective strengths, and the choice often comes down to budget and how central deep dependency analysis specifically is to your needs.

### How often should I run NDepend analysis?

For trend tracking to be meaningful, run it on every build or at least every merge to your main branch, the same cadence you'd use for SonarQube. Periodic (e.g., weekly) analysis is better than none, but loses the fine-grained trend detail and immediate feedback that per-commit analysis provides.

### What's the difference between NDepend's dependency graph and dependency matrix views?

The dependency graph is a node-and-edge visualization showing which components depend on which, good for getting an intuitive sense of overall structure. The dependency matrix is a more compact, grid-based view better suited to precisely identifying specific coupling relationships and cycles in larger codebases where a graph would become visually overwhelming. Both are worth using - graphs for intuition, matrices for precision.

### Can NDepend import results from Roslyn Analyzers?

Yes - NDepend can import Roslyn analyzer diagnostics, letting it serve as a unifying dashboard that combines its own CQLinq-based analysis with results from analyzer packages you're already running, rather than requiring you to check two entirely separate tools.

### What's the most common mistake when adopting NDepend?

Running the default analysis once, treating it as a one-time report rather than an ongoing part of the workflow, and missing the trend-tracking value that comes from consistent, repeated analysis over time. The second common mistake is never learning CQLinq beyond the built-in rules, effectively using an expensive, deeply capable tool as if it were a much simpler one.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
