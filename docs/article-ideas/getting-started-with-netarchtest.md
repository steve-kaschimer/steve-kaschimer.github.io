# Getting Started with NetArchTest in .NET

NetArchTest's entire value proposition is that architecture rules stop being something written in a design doc nobody rereads and start being something your build actually checks. The setup is genuinely small -- a NuGet package and a test class -- which is exactly why it's worth doing early in a project rather than after the dependency violations it would have caught have already accumulated.

This guide covers installing NetArchTest, bootstrapping a dedicated architecture test project, the core rule patterns for enforcing dependency direction and naming conventions, and the best practices that keep these tests useful rather than either too loose to matter or too brittle to survive normal refactoring. By the end you'll have your architecture's rules enforced the same way any other regression is -- automatically, on every build.

If you're deciding between architecture/quality tools first, a comparison of the top .NET architecture and quality enforcement tools covers where NetArchTest fits relative to ArchUnitNET, SonarQube, Roslyn Analyzers, and NDepend.

## What You'll Need

- .NET 8 SDK or later
- An existing test project (xUnit, NUnit, or MSTest all work identically well) -- either a dedicated architecture-test project or a section of your existing test suite

## Installing NetArchTest

```bash
dotnet add package NetArchTest.Rules
```

## Bootstrapping the Ideal Environment

### A dedicated architecture test project

Rather than scattering architecture rules across your regular unit test files, create a dedicated project so they're easy to find and reason about as a set:

```bash
dotnet new xunit -n MyApp.ArchitectureTests
cd MyApp.ArchitectureTests
dotnet add package NetArchTest.Rules
dotnet add reference ../MyApp.Core/MyApp.Core.csproj
dotnet add reference ../MyApp.Infrastructure/MyApp.Infrastructure.csproj
dotnet add reference ../MyApp.Web/MyApp.Web.csproj
```

The test project needs references to every layer/project it's writing rules about, since NetArchTest inspects compiled assemblies directly.

### Enforcing Clean Architecture's dependency rule

```csharp
public class ArchitectureTests
{
    [Fact]
    public void Core_Should_Not_Depend_On_Infrastructure()
    {
        var result = Types.InAssembly(typeof(Order).Assembly)
            .Should()
            .NotHaveDependencyOn("MyApp.Infrastructure")
            .GetResult();

        Assert.True(result.IsSuccessful, string.Join(", ", result.FailingTypeNames ?? []));
    }

    [Fact]
    public void Core_Should_Not_Depend_On_Web()
    {
        var result = Types.InAssembly(typeof(Order).Assembly)
            .Should()
            .NotHaveDependencyOn("MyApp.Web")
            .GetResult();

        Assert.True(result.IsSuccessful);
    }
}
```

Including `result.FailingTypeNames` in the assertion failure message is worth doing consistently -- when this test fails, you want to immediately see which type introduced the violation, not just that "some rule somewhere failed."

### Enforcing naming and structural conventions

```csharp
[Fact]
public void Controllers_Should_Have_ApiController_Attribute()
{
    var result = Types.InAssembly(typeof(Program).Assembly)
        .That()
        .Inherit(typeof(ControllerBase))
        .Should()
        .HaveCustomAttribute(typeof(ApiControllerAttribute))
        .GetResult();

    Assert.True(result.IsSuccessful);
}

[Fact]
public void Repository_Classes_Should_Be_Sealed()
{
    var result = Types.InAssembly(typeof(OrderRepository).Assembly)
        .That()
        .ImplementInterface(typeof(IOrderRepository))
        .Should()
        .BeSealed()
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

Rules like these catch consistency drift that's easy to introduce accidentally (a new repository class that forgot to be `sealed`, a new controller missing `[ApiController]`) without anyone deliberately deciding to break the convention.

### Combining conditions with And()/Or()

```csharp
[Fact]
public void Handlers_Should_Reside_In_Correct_Namespace()
{
    var result = Types.InAssembly(typeof(Program).Assembly)
        .That()
        .ImplementInterface(typeof(IRequestHandler<,>))
        .And()
        .AreClasses()
        .Should()
        .ResideInNamespaceStartingWith("MyApp.Application.Handlers")
        .GetResult();

    Assert.True(result.IsSuccessful);
}
```

## Core Workflow

- **Write one rule per architectural decision your team has actually made.** Don't invent rules speculatively -- each test should reflect a real, agreed-upon constraint, so a failure clearly means "this violates something we decided," not "this tripped an arbitrary check."
- **Include failing type names in assertion messages.** A failing architecture test should immediately tell the next developer what to fix, not just that something's wrong somewhere in the assembly.
- **Run architecture tests as part of your normal CI pipeline**, the same as any other test -- there's no separate invocation needed, since they're ordinary tests in your chosen framework.

## Verifying Your Setup

1. **Rules catch real violations** -- temporarily introduce a deliberate violation (a `Core` class referencing `Infrastructure`) and confirm the corresponding test fails
2. **Failure messages are actionable** -- confirm a failing test's output tells you which specific type violated the rule, not just that the rule failed
3. **Tests run in CI, not just locally** -- confirm your CI pipeline actually executes the architecture test project alongside your regular test suite
4. **Rules reflect current, real decisions** -- periodically review whether existing rules still match your team's actual architecture, removing or updating any that have gone stale

## Best Practices

**Keep architecture tests in a dedicated project, separate from regular unit tests.** This makes the full set of enforced architectural decisions easy to review and discover, rather than scattered throughout the codebase.

**Write rules that reflect real decisions the team has made, not aspirational or speculative ones.** A rule nobody agreed to is just friction; a rule reflecting a genuine architectural decision is protection.

**Include diagnostic information (failing type names) in every assertion.** The whole value of catching a violation early is lost if the failure message doesn't tell the next developer what to actually fix.

**Revisit and prune rules periodically as the architecture evolves.** A stale rule that no longer reflects the team's actual intent is worse than no rule -- it either gets bypassed with frustration or, worse, quietly disabled entirely.

**Pair NetArchTest with a broader static analysis tool if you need more than dependency/structural rules.** NetArchTest is deliberately narrow -- code smells, security, and duplication are better covered by SonarQube, Roslyn Analyzers, or NDepend.

## Comparison with ArchUnitNET

| | NetArchTest | ArchUnitNET |
| --- | --- | --- |
| Rule syntax | `Types.InAssembly(...).Should()...` | Similar fluent style, richer layer/slice modeling |
| Test framework integration | Works with any framework via NuGet | Dedicated packages per framework (xUnit, NUnit, MSTestV2) |
| Community/adoption | Somewhat wider | Smaller, but comparable capability |
| Best fit | Straightforward dependency-direction rules | More complex layer/slice modeling needs |

Both solve the same problem with a comparably expressive fluent API -- the choice between them is largely about which rule vocabulary your team finds more natural, not a significant capability gap.

## Frequently Asked Questions

### Do architecture tests run differently from regular unit tests?

No -- they're ordinary tests in whichever framework you're using (xUnit, NUnit, MSTest), just asserting against `NetArchTest.Rules`' `Types.InAssembly(...)` API instead of application logic. They run in your normal `dotnet test` invocation and CI pipeline exactly like any other test.

### Why does my architecture test project need references to every layer it's testing?

NetArchTest inspects compiled assemblies via reflection, so it needs a project reference to each assembly it's writing rules about -- it can't reason about types it doesn't have access to. This is different from source-level tools like Roslyn Analyzers, which see your code without needing a compiled reference.

### How do I make a failing architecture test actually useful for debugging?

Include `result.FailingTypeNames` (or similar diagnostic properties from the `GetResult()` object) in your assertion failure message. Without it, a failing test just says "the rule failed" without telling the next developer which specific type caused it, turning a useful early warning into a frustrating scavenger hunt.

### Can NetArchTest catch things like code duplication or security issues?

No -- it's deliberately scoped to dependency-direction and structural rules (naming conventions, inheritance, attribute presence). For code smells, security vulnerabilities, or duplication, you need a broader tool like SonarQube, Roslyn Analyzers, or NDepend, ideally used alongside NetArchTest rather than instead of it.

### Should every project have architecture tests from day one?

For projects following a deliberate structural pattern (Clean Architecture, Modular Monolith), yes -- setting up a handful of core dependency-direction rules early is cheap and prevents the exact kind of drift those patterns are meant to guard against. For very small or short-lived projects without meaningful architectural decisions to enforce, it's less urgent.

### What happens if a legitimate change needs to violate an existing rule?

That's a signal to have an explicit conversation about whether the rule (or the change) needs to be reconsidered, rather than just deleting the test to make it pass. Architecture rules should evolve deliberately alongside genuine shifts in the system's design, not get silently bypassed under deadline pressure.

### What's the most common mistake in a first NetArchTest setup?

Writing rules without including diagnostic failure information, so a failing test tells you something's wrong but not what -- turning what should be a fast fix into a search. The second common mistake is letting rules go stale as the architecture legitimately evolves, rather than treating the rule set itself as something that needs periodic review.
