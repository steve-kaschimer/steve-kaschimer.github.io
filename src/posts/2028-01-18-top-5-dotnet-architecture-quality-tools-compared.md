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

NetArchTest is a fluent, ArchUnit-inspired library purpose-built for one job: writing architectural rules as ordinary unit tests. It reads types from a compiled assembly and lets you assert things like "classes in this namespace shouldn't depend on that namespace" using a chainable API that reads close to natural language.

**Strengths:**

- Minimal setup - it's a NuGet package added to your existing test project, with no separate server, license, or infrastructure
- Runs as part of your normal test suite, meaning architecture violations show up in the same feedback loop as any other failing test, at the same speed
- The fluent API (`Types.InAssembly(...).ShouldNot().HaveDependencyOn(...)`) is genuinely readable, making rules easy to write and easy for a reviewer to understand at a glance
- Works well specifically for the dependency-direction rules that Clean Architecture, Modular Monolith, and similar patterns depend on being enforced

**Weaknesses:**

- Narrow in scope by design - it doesn't touch code smells, security vulnerabilities, duplication, or the broader quality concerns SonarQube or NDepend cover
- Being reflection-based, it inspects compiled assemblies, which means rules run against build output, not live source - a minor but real distinction from analyzers that see your code as you type it
- No dashboard, trend tracking, or visualization - results are pass/fail test output, nothing more

**Choose this when:** you specifically want to enforce dependency-direction and structural rules (Clean Architecture layers, Modular Monolith boundaries) as part of your existing test suite, without adopting a broader static analysis platform.

## ArchUnitNET

ArchUnitNET is NetArchTest's closest sibling - also a fluent, architecture-testing library, also inspired by Java's ArchUnit, also designed to be written as unit tests. The choice between the two is largely about API expressiveness and specific feature preferences rather than a fundamentally different approach.

**Strengths:**

- A more expressive rule-definition API in some areas than NetArchTest, with richer support for describing layers, slices, and more complex structural relationships
- First-class integration packages for xUnit, NUnit, and MSTest specifically, making it drop directly into whichever test framework your project already uses
- Same core benefit as NetArchTest - architecture rules live in your test suite, run at test speed, and fail your build the same way any other test failure would

**Weaknesses:**

- Smaller adoption and community than NetArchTest specifically, despite comparable capability, meaning somewhat less documentation and fewer examples to draw on
- Same narrow scope as NetArchTest - purely architectural/structural rules, not a substitute for broader code quality tooling
- The choice between ArchUnitNET and NetArchTest often comes down to which specific rule syntax a team finds more natural, which isn't always obvious without trying both firsthand

**Choose this when:** you want the same architecture-testing approach as NetArchTest but find its specific rule vocabulary or feature set (layer/slice modeling, in particular) a better fit for how you want to express your project's structure.

## SonarQube

SonarQube is a full static analysis platform, not a library you add to a test project - it runs as a server (self-hosted or SonarCloud) that your CI pipeline sends analysis results to, producing a dashboard tracking code smells, bugs, security vulnerabilities, duplication, test coverage, and yes, some architectural constraints like dependency cycles.

**Strengths:**

- Far broader scope than either architecture-testing library - one platform covering code smells, security hotspots, duplication, coverage trends, and some dependency/architecture checks together
- Quality gates can block a pull request or deployment from proceeding if metrics fall below a defined threshold, giving you an organization-wide enforcement mechanism, not just a per-repo one
- Strong for tracking trends over time across many repositories - a view NetArchTest or ArchUnitNET, being test-scoped, don't provide
- Free Community edition covers a meaningful amount of functionality; paid tiers add more advanced security and portfolio-level features

**Weaknesses:**

- Requires standing up and maintaining a separate server (or paying for SonarCloud), which is real infrastructure overhead compared to a NuGet package
- Feedback happens at CI/analysis speed, not at every keystroke or every local test run - a slower loop than compiler-integrated analyzers
- Defining project-specific custom rules requires deeper engagement with SonarQube's SDK and API, more involved than NetArchTest's fluent rule syntax

**Choose this when:** you want organization-wide quality gates, trend tracking, and a broad net of checks (not just architecture) across potentially many repositories, and you're willing to run the infrastructure (or pay for SonarCloud) to get it.

## Roslyn Analyzers

Roslyn Analyzers run inside the C# compiler itself - they're not a separate tool you invoke, they're part of the same compilation pipeline that turns your code into IL, which means violations surface as compiler warnings or errors directly in your IDE, as you type, not after a test run or a CI pass.

**Strengths:**

- The fastest possible feedback loop of anything in this comparison - violations appear in your editor in real time, often before you've even saved the file
- Built into the .NET SDK itself, with a large existing ecosystem of analyzer packages (Roslynator alone brings 500+ rules) covering everything from code style to structural conventions
- You can write fully custom analyzers for team-specific rules - not just consuming existing packages, but authoring your own compiler-integrated checks
- Zero additional infrastructure - analyzers run as part of the build every team member already does

**Weaknesses:**

- Writing a custom analyzer from scratch has a real learning curve - it requires understanding Roslyn's syntax tree and semantic model APIs, meaningfully more involved than NetArchTest's fluent rule syntax
- Existing analyzer packages cover a lot of ground, but architecture-specific dependency rules (like NetArchTest's "layer A shouldn't depend on layer B") are less commonly the focus of general-purpose analyzer packages, and require either a specialized package or custom authoring
- Purely compile-time - can't express rules that need runtime information or need to reason across an entire compiled assembly the way NetArchTest's assembly-scanning approach can more naturally

**Choose this when:** instant, in-editor feedback matters more than anything else, and you want either the broad existing ecosystem of analyzer packages or the ability to author fully custom, team-specific compiler rules.

## NDepend

NDepend is a commercial, deeply feature-rich static analysis tool often described as the "Swiss Army knife" for .NET code quality - dependency graph visualization, a powerful LINQ-based query language (CQLinq) for interrogating your codebase's structure, quality gates, and trend tracking, all in one standalone tool with CI integration.

**Strengths:**

- CQLinq lets you write arbitrarily sophisticated queries against your codebase's structure using LINQ syntax - genuinely more expressive and detailed than any other tool in this comparison for deep dependency analysis
- Rich visualizations (dependency graphs, dependency matrices) that make it easier to spot structural problems humans miss reading code directly
- Strong trend tracking - NDepend is well suited to answering "is our technical debt getting better or worse over time," not just "does this pass right now"
- Can import Roslyn analyzer results, letting it serve as a unifying dashboard rather than purely a competing tool

**Weaknesses:**

- Commercial, per-seat licensing - a real cost compared to every other tool in this comparison except SonarQube's paid tiers
- Windows-oriented tooling history (though it has broadened over time), worth checking against your team's actual platform mix
- The learning curve for CQLinq, while powerful, is real - getting full value out of NDepend takes more investment than writing a NetArchTest fluent assertion

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
