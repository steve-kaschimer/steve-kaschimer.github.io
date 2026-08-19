---
author: Steve Kaschimer
date: 2028-02-22
image: /images/posts/2028-02-22-hero.webp
image_alt: "A lightning-fast in-editor squiggle-underline glyph appearing directly beneath a single line of code with no round trip to any external process, a small custom-rule variant branching off beside it."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single flat line representing a line of code, with a wavy amber squiggle-underline appearing directly beneath a short segment of it, with no arrow or path leading anywhere else, emphasizing there is no round trip to an external process. A smaller secondary squiggle branches off to the side, representing a custom-authored rule distinct from a pre-built package rule. Mood is instant, immediate, and compiler-native. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Roslyn Analyzers have the fastest feedback loop of any tool in this series because they run inside the same compiler that turns your code into IL. A setup guide for installing existing analyzer packages, configuring severity via .editorconfig, and authoring a custom analyzer for team-specific rules."
tags: ["dotnet", "architecture", "code-quality", "developer-productivity"]
title: "Getting Started with Roslyn Analyzers in .NET"
---



Roslyn Analyzers have the fastest feedback loop of any tool in this comparison for a simple reason: they run inside the same compiler that turns your code into IL, so a violation shows up as a squiggly line in your editor before you've even saved the file, not after a test run or a CI pass. That immediacy is available two ways - installing an existing analyzer package with hundreds of pre-built rules, or writing your own for something specific to your team that no general-purpose package would know to check.

This guide covers installing existing analyzer packages, configuring severity and enforcement through `.editorconfig`, the basics of authoring a custom analyzer for a team-specific rule, and the best practices that keep analyzer warnings meaningful rather than becoming background noise everyone ignores. By the end you'll have instant, in-editor enforcement for both off-the-shelf and genuinely custom rules.

If you're deciding between architecture/quality tools first, [a comparison of the top .NET architecture and quality enforcement tools](/posts/2028-01-18-top-5-dotnet-architecture-quality-tools-compared/) covers where Roslyn Analyzers fit relative to NetArchTest, ArchUnitNET, SonarQube, and NDepend.

## What You'll Need

- .NET 8 SDK or later - analyzer support is built directly into the SDK, no separate installation needed for the mechanism itself
- For authoring custom analyzers: the `Microsoft.CodeAnalysis.Analyzers` and `Microsoft.CodeAnalysis.CSharp` packages, plus familiarity with Roslyn's syntax tree and semantic model concepts

## Installing Existing Analyzer Packages

For a broad set of ready-made rules covering style and structural conventions:

```bash
dotnet add package Roslynator.Analyzers
```

For security and design-intent-focused rules:

```bash
dotnet add package Meziantou.Analyzer
```

Both install as ordinary NuGet packages and start producing warnings immediately on the next build - no separate configuration step required to get initial value, though tuning severity (below) is worth doing deliberately.

## Bootstrapping the Ideal Environment

### Configuring severity via .editorconfig

Analyzer rules default to whatever severity the package author chose, which isn't always what your team wants. Override specific rules in `.editorconfig`:

```ini
# .editorconfig
[*.cs]
# Escalate a specific rule to an error, failing the build
dotnet_diagnostic.RCS1123.severity = error

# Downgrade a rule your team has deliberately decided not to follow
dotnet_diagnostic.RCS1021.severity = none

# Set a default severity for analyzer categories
dotnet_analyzer_diagnostic.category-Style.severity = suggestion
```

Committing `.editorconfig` to source control means every team member and CI run applies the same severity configuration - this is the mechanism that turns "a warning someone might notice" into "a build failure nobody can miss," for the rules you actually want enforced strictly.

### Treating warnings as errors in CI specifically

```xml
<!-- Directory.Build.props -->
<Project>
  <PropertyGroup Condition="'$(CI)' == 'true'">
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
  </PropertyGroup>
</Project>
```

A common pattern: let analyzer warnings stay warnings locally (so they don't block a developer's inner loop), but treat them as errors specifically in CI, so nothing merges with unaddressed warnings even if a local build was run without noticing them.

### Authoring a custom analyzer for a team-specific rule

Custom analyzers require their own project, typically referencing `Microsoft.CodeAnalysis.CSharp.Workspaces`:

```csharp
[DiagnosticAnalyzer(LanguageNames.CSharp)]
public class NoConsoleWriteLineAnalyzer : DiagnosticAnalyzer
{
    private static readonly DiagnosticDescriptor Rule = new(
        id: "MYAPP001",
        title: "Avoid Console.WriteLine in production code",
        messageFormat: "Use ILogger instead of Console.WriteLine",
        category: "Design",
        defaultSeverity: DiagnosticSeverity.Warning,
        isEnabledByDefault: true);

    public override ImmutableArray<DiagnosticDescriptor> SupportedDiagnostics => [Rule];

    public override void Initialize(AnalysisContext context)
    {
        context.ConfigureGeneratedCodeAnalysis(GeneratedCodeAnalysisFlags.None);
        context.EnableConcurrentExecution();
        context.RegisterSyntaxNodeAction(AnalyzeInvocation, SyntaxKind.InvocationExpression);
    }

    private static void AnalyzeInvocation(SyntaxNodeAnalysisContext context)
    {
        var invocation = (InvocationExpressionSyntax)context.Node;
        if (invocation.Expression is MemberAccessExpressionSyntax
            {
                Expression: IdentifierNameSyntax { Identifier.Text: "Console" },
                Name.Identifier.Text: "WriteLine"
            })
        {
            context.ReportDiagnostic(Diagnostic.Create(Rule, invocation.GetLocation()));
        }
    }
}
```

This is a genuinely different level of effort from installing an existing package - you're working directly with Roslyn's syntax tree API. But it's the only way to enforce a rule truly specific to your codebase's conventions with the same instant, in-editor feedback that off-the-shelf analyzers provide.

### Packaging and referencing a custom analyzer

```xml
<ItemGroup>
  <ProjectReference Include="..\MyApp.Analyzers\MyApp.Analyzers.csproj"
                    OutputItemType="Analyzer"
                    ReferenceOutputAssembly="false" />
</ItemGroup>
```

`OutputItemType="Analyzer"` is what tells the compiler to actually run your project as an analyzer rather than link it as a normal dependency - easy to forget and a common reason a custom analyzer silently does nothing.

## Core Workflow

- **Install existing analyzer packages first, and only author custom ones for rules genuinely specific to your team.** Most style and correctness needs are already covered by mature packages like Roslynator - don't reinvent what already exists.
- **Configure severity deliberately via `.editorconfig`, don't leave every rule at its package default.** Some defaults will be too strict for your team's conventions, others too lenient for rules you actually want enforced.
- **Treat warnings as errors in CI, even if you keep them as warnings locally.** This balances fast local iteration against nothing slipping through unnoticed at merge time.

## Verifying Your Setup

1. **Existing analyzer packages produce warnings on real violations** - confirm a deliberately introduced style or correctness issue triggers the expected warning in your editor
2. **`.editorconfig` severity overrides take effect** - confirm a rule you escalated to `error` actually fails the build, and one you downgraded to `none` no longer appears
3. **CI treats warnings as errors, even if local builds don't** - confirm your CI configuration actually enforces this distinction
4. **Custom analyzers are correctly referenced as analyzers, not regular dependencies** - confirm `OutputItemType="Analyzer"` is set and your custom rule actually fires

## Best Practices

**Start with an existing, mature analyzer package before writing anything custom.** Roslynator's 500+ rules and Meziantou.Analyzer's security/design focus cover a huge amount of ground for zero authoring effort.

**Use `.editorconfig` and commit it to source control.** This is what makes severity configuration a team-wide, version-controlled decision rather than an individual IDE setting that varies by developer.

**Escalate genuinely important rules to `error`, and don't let everything sit at `warning` by default.** A warning that never blocks anything is easy to accumulate and eventually ignore entirely - reserve `error` for rules where a violation should never merge.

**Author custom analyzers only for rules that are genuinely team- or codebase-specific**, and that existing packages don't already cover. The authoring investment is real; make sure it's buying you something a NuGet package search wouldn't have already solved.

**Remember `OutputItemType="Analyzer"` when referencing a custom analyzer project.** This is the single most common reason a correctly written custom analyzer appears to do nothing - it's being referenced as a normal library instead of run as an analyzer.

## Comparison with SonarQube

| | Roslyn Analyzers | SonarQube |
| --- | --- | --- |
| Where it runs | Inside the compiler, every build | Separate server/service, CI-integrated |
| Feedback speed | Instant, in-editor | CI pipeline speed (batch) |
| Custom rules | Full custom authoring via Roslyn APIs | Custom rules via SonarQube's own SDK |
| Infrastructure | None - built into the SDK | Real - a server or SonarCloud subscription |
| Trend tracking | None built in | Strong, dashboard-based over time |

They're complementary rather than competing - Roslyn Analyzers catch issues the instant you write them; SonarQube provides the organization-wide dashboard and trend view a compiler-integrated tool structurally can't offer. Many mature teams run both.

## Frequently Asked Questions

### Do I need any special setup to use Roslyn Analyzers, or are they built in?

The mechanism is built directly into the .NET SDK and C# compiler - no separate installation needed. What you install are analyzer *packages* (Roslynator, Meziantou.Analyzer, or your own custom ones) that plug into that already-present mechanism.

### How do I stop a specific analyzer rule from firing without disabling the whole package?

Set its severity to `none` for that specific rule ID in `.editorconfig`: `dotnet_diagnostic.RCS1021.severity = none`. This lets you adopt a package's rules selectively rather than all-or-nothing, silencing specific rules your team has deliberately decided not to follow.

### Why would I write a custom analyzer instead of just using code review to catch a specific issue?

A custom analyzer catches the issue instantly, for every developer, on every keystroke - before it's ever committed, let alone reviewed. Code review is valuable for judgment calls a machine can't make, but for a mechanically checkable rule (a specific anti-pattern, a required naming convention, a banned API), an analyzer catches it earlier and more consistently than relying on a human reviewer to remember and notice every time.

### What's the difference between treating warnings as errors locally versus in CI only?

Treating warnings as errors everywhere means a developer's local build fails the moment a rule is violated, which can slow down exploratory or in-progress work. Treating them as errors only in CI (via a conditional `TreatWarningsAsErrors` in `Directory.Build.props`) keeps local iteration fast while still guaranteeing nothing with unaddressed warnings merges - a common, pragmatic middle ground.

### Why isn't my custom analyzer running even though the code compiles?

The most common cause is forgetting `OutputItemType="Analyzer"` (and typically `ReferenceOutputAssembly="false"`) on the project reference to your analyzer project - without it, the compiler treats it as a normal library dependency rather than running it as an analyzer during compilation.

### Can Roslyn Analyzers enforce architecture rules like NetArchTest does?

To a limited degree with custom authoring, but it's not their natural strength - NetArchTest and ArchUnitNET are purpose-built for assembly-level dependency-direction rules with a much simpler API for that specific job. Roslyn Analyzers excel at syntax- and semantic-level rules checkable within a single file or method; cross-assembly dependency rules are possible but more awkward to express than with a dedicated architecture-testing library.

### What's the most common mistake in a first Roslyn Analyzers setup?

Not committing `.editorconfig` to source control, leaving severity configuration as an individual, inconsistent IDE setting rather than a team-wide, enforced decision. The second common mistake, specific to custom analyzers, is forgetting `OutputItemType="Analyzer"` on the project reference, leading to confusion about why a correctly written analyzer never fires.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
