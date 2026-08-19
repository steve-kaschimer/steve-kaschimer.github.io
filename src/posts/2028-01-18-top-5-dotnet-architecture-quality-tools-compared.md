---
author: Steve Kaschimer
date: 2028-01-18
image: /images/posts/2028-01-18-hero.webp
image_alt: "Five columns of abstract enforcement glyphs positioned along a horizontal axis running from instant compiler-integrated feedback on the left to slower batch-analysis dashboards on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a narrow assembly-boundary glyph with a single directional arrow crossing a forbidden barrier line, a similar boundary glyph with a richer layered-slice pattern beneath it, a broad dashboard-panel glyph with a gauge and trend line, a lightning-fast in-editor squiggle-underline glyph, and a query-bracket glyph resembling a LINQ expression feeding into a small dependency-graph node cluster. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'instant' on the left to 'batch analysis' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A team agrees the domain layer shouldn't reference infrastructure, everyone nods, and eighteen months later a deadline-pressured change adds exactly that reference. These tools make it a build failure instead of a hope. A practical breakdown of five ways to enforce architecture and quality automatically."
tags: ["dotnet", "architecture", "code-quality", "testing", "ci-cd"]
title: "The Top 5 .NET Architecture & Quality Enforcement Tools Compared: Which One Should You Choose?"
---



Architecture decisions have a way of degrading the moment nobody's actively enforcing them. A team agrees the domain layer shouldn't reference infrastructure, everyone nods, and eighteen months later a deadline-pressured developer adds exactly that reference because it was the fastest way to ship a fix. Code review might catch it. It might not. The tools in this comparison exist specifically to make that rule a build failure instead of a hope.

This guide compares five tools .NET teams use to keep architecture and code quality honest over time: NetArchTest, ArchUnitNET, SonarQube, Roslyn Analyzers, and NDepend. They split into two real categories worth understanding upfront - NetArchTest and ArchUnitNET are architecture-testing libraries specifically (you write rules as unit tests), while SonarQube, Roslyn Analyzers, and NDepend are broader static analysis tools that happen to include architectural rule capability alongside a much wider net of code quality, security, and maintainability checks. Picking between them is less "which is best" and more "which layer of enforcement am I actually trying to add." This series continues with dedicated getting-started walkthroughs for each tool.

## Quick Comparison

| | NetArchTest | ArchUnitNET | SonarQube | Roslyn Analyzers | NDepend |
| --- | --- | --- | --- | --- | --- |
| **Category** | Architecture testing library | Architecture testing library | Broad static analysis platform | Compiler-integrated code analysis | Broad static analysis + architecture tool |
| **Where it runs** | Inside your test suite | Inside your test suite | Separate server, CI-integrated | In the compiler itself, every build | Standalone tool + CI integration |
| **Feedback speed** | Test-run speed | Test-run speed | CI pipeline speed (batch analysis) | Instant, at every keystroke/build | Analysis-run speed |
| **Scope** | Dependency and naming rules specifically | Dependency and naming rules specifically | Code smells, security, duplication, coverage, architecture | Code style, correctness, API usage, custom rules | Code quality, dependency graphs, trend tracking, architecture |
| **License** | Free, open source | Free, open source | Free (Community) + paid tiers | Free, built into the SDK | Commercial |
| **Best for** | Lightweight, test-driven boundary enforcement | Same as NetArchTest, more expressive fluent API | Organization-wide quality gates across many repos | Real-time feedback on every keystroke, custom team rules | Deep dependency analysis and quality trend tracking over time |

## NetArchTest

Fluent, ArchUnit-inspired library purpose-built for one job: write architectural rules as unit tests. Assert "classes in this namespace shouldn't depend on that namespace" using chainable API that reads like natural language.

Minimal setup, NuGet package in existing test project. Runs as part of test suite, violations show up same feedback loop as any other failing test. Fluent API is readable. Works well for dependency-direction and structural rules (Clean Architecture, Modular Monolith).

Narrow scope, doesn't touch code smells, security, duplication, or broader quality concerns. Reflection-based (inspects compiled assemblies), runs against build output not live source. No dashboard or trend tracking.

## ArchUnitNET

NetArchTest's closest sibling, fluent, architecture-testing library, inspired by Java's ArchUnit, written as unit tests. Choice between the two is API expressiveness and feature preferences, not fundamentally different.

More expressive rule-definition API in some areas than NetArchTest. Richer support for layers, slices, complex structural relationships. First-class xUnit/NUnit/MSTest integration packages. Architecture rules live in test suite, run at test speed.

Smaller community than NetArchTest. Same narrow scope, purely architectural/structural. Choice often comes down to which rule syntax a team finds more natural.

## SonarQube

Full static analysis platform, not a library, runs as server (self-hosted or SonarCloud) that CI sends results to. Dashboard tracks code smells, bugs, security vulnerabilities, duplication, coverage, some architectural constraints.

Far broader scope than architecture-testing libraries. Quality gates block PRs/deployments if metrics fall below threshold, organization-wide enforcement. Strong trend tracking across repositories. Free Community edition meaningful; paid tiers advanced.

Requires infrastructure or SonarCloud cost. Feedback at CI/analysis speed, not keystroke. Custom rules require deeper SDK engagement.

## Roslyn Analyzers

Run inside C# compiler, not separate tool, part of compilation pipeline. Violations surface as compiler warnings/errors in IDE in real time, as you type.

Fastest feedback loop, violations in editor before save. Built into .NET SDK, large ecosystem (Roslynator 500+ rules). Write fully custom analyzers for team-specific rules. Zero infrastructure.

Learning curve for custom analyzers (Roslyn syntax tree and semantic model APIs). Architecture-specific dependency rules less common in general-purpose packages. Purely compile-time, can't express runtime rules or reason across entire assembly.

## NDepend

Commercial, deeply feature-rich. "Swiss Army knife" for .NET, dependency graph visualization, CQLinq (LINQ-based query language), quality gates, trend tracking, all in standalone tool with CI integration.

CQLinq writes arbitrarily sophisticated queries against codebase structure. Rich visualizations spot structural problems. Strong trend tracking. Can import Roslyn analyzer results.

Commercial per-seat licensing. Windows-oriented history. CQLinq learning curve real.

**Choose this when:** you want the deepest possible dependency and quality analysis with strong visualization and trend tracking, and the licensing cost is justified by the insight it provides across a codebase of real size and complexity.

## How to Decide

A few heuristics that cover most real-world decisions:

**Want to enforce dependency-direction rules (Clean Architecture layers, Modular Monolith boundaries) as part of your existing test suite, with minimal setup?** NetArchTest or ArchUnitNET - pick based on which rule syntax you find more natural after trying both on a small example.

**Want organization-wide quality gates and trend tracking across many repositories, not just architecture?** SonarQube is built for exactly this, at the cost of running (or paying for) a separate platform.

**Want the fastest possible feedback loop, ideally before you even finish typing?** Roslyn Analyzers are unmatched here - pair an existing package (Roslynator, Meziantou.Analyzer) with any custom rules your team needs.

**Want the deepest dependency analysis and visualization, with budget for a commercial tool?** NDepend's CQLinq and dependency graphs go further than any free option in this comparison.

These aren't mutually exclusive, and most mature .NET teams end up layering more than one. A common, effective combination: Roslyn Analyzers for instant, in-editor style and correctness feedback; NetArchTest or ArchUnitNET for dependency-direction rules living in the test suite; and SonarQube or NDepend for the organization-wide dashboard and trend view neither of the first two provides.

## Frequently Asked Questions

### Should I use NetArchTest or ArchUnitNET?

Both solve the same problem with a very similar approach - try writing the same handful of rules in each and see which fluent API reads more naturally to your team. NetArchTest has somewhat wider adoption and more existing examples; ArchUnitNET offers richer modeling for layers and slices in some scenarios. Neither is a clearly superior technical choice over the other.

### Do I need SonarQube or NDepend if I'm already using NetArchTest?

They're not redundant - NetArchTest (and ArchUnitNET) enforce specific, narrow dependency and structural rules you define, while SonarQube and NDepend cover a much broader net of code smells, security issues, duplication, and general quality metrics, plus organization-wide trend tracking neither architecture-testing library provides. Many teams use both, for different layers of enforcement.

### What's the difference between a Roslyn Analyzer and an architecture-testing library like NetArchTest?

A Roslyn Analyzer runs inside the compiler itself, giving instant, in-editor feedback at the syntax/semantic level, well suited to style, correctness, and API-usage rules. NetArchTest runs as a unit test against a compiled assembly, well suited to dependency-direction and structural rules that are naturally expressed by asking "does this reflect all the types and check what depends on what." They're complementary tools solving different-shaped problems, not competing solutions to the same one.

### Is NDepend worth the licensing cost compared to free alternatives?

It depends on the depth of analysis and visualization you need. For straightforward dependency-direction enforcement, the free architecture-testing libraries (NetArchTest, ArchUnitNET) cover the need without cost. NDepend's value is in deeper, more sophisticated analysis (CQLinq queries, dependency graphs, long-term trend tracking) that becomes more valuable as codebase size and organizational complexity grow - evaluate against your actual scale, not as a default upgrade.

### Can I write custom rules with Roslyn Analyzers the way I can with NetArchTest?

Yes, but the effort is meaningfully different - NetArchTest's fluent API is designed for quickly expressing dependency rules in a few lines. Writing a custom Roslyn Analyzer requires understanding the compiler's syntax tree and semantic model APIs, a real learning investment, though the payoff is instant, in-editor feedback rather than test-run-speed feedback.

### Do these tools replace code review?

No - they automate the parts of review that are mechanical and easy to miss under time pressure (a stray dependency, a naming violation, a code smell), freeing human reviewers to focus on things automation genuinely can't judge well: whether an approach is the right one, whether a change makes sense in context, and design trade-offs. Treat them as raising the floor, not replacing the judgment a reviewer brings.

### Which of these tools should a team adopt first if starting from nothing?

Roslyn Analyzers, since they're free, already built into the SDK, and require no new infrastructure - adding an existing package like Roslynator is close to zero-cost and immediately useful. NetArchTest or ArchUnitNET is a natural second step once you have specific dependency-direction rules (from adopting Clean Architecture or a Modular Monolith, for instance) you want enforced automatically. SonarQube or NDepend become worth the additional investment once you're managing quality across multiple repositories or want deeper trend visibility than test-scoped tools provide.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
