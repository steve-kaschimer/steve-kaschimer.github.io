# Getting Started with ArchUnitNET in .NET

ArchUnitNET's fluent API reads a lot like NetArchTest's -- both are ArchUnit-inspired, both express rules as unit tests, both let you assert dependency-direction constraints in a chainable, readable syntax. The real differences show up once you're modeling something more elaborate than "layer A shouldn't depend on layer B" -- ArchUnitNET's support for layers and slices as first-class concepts gives you a more expressive vocabulary for describing genuinely structured systems, at the cost of a slightly larger API surface to learn.

This guide covers installing ArchUnitNET, bootstrapping architecture rules with its layer and slice modeling, the core patterns for common rules, and the best practices that keep an ArchUnitNET-based rule set expressive without becoming its own maintenance burden. By the end you'll have architecture rules enforced automatically, with a richer vocabulary for expressing more complex structural constraints than a simpler tool provides.

If you're deciding between architecture/quality tools first, a comparison of the top .NET architecture and quality enforcement tools covers where ArchUnitNET fits relative to NetArchTest, SonarQube, Roslyn Analyzers, and NDepend.

## What You'll Need

- .NET 8 SDK or later
- An existing test project -- ArchUnitNET has dedicated integration packages for xUnit, NUnit, and MSTestV2

## Installing ArchUnitNET

```bash
dotnet add package ArchUnitNET.xUnit
```

Substitute `ArchUnitNET.NUnit` or `ArchUnitNET.MSTestV2` depending on your test framework -- each package includes the core ArchUnitNET library plus framework-specific integration.

## Bootstrapping the Ideal Environment

### Loading the architecture under test

```csharp
public class ArchitectureTests
{
    private static readonly Architecture Architecture = new ArchLoader()
        .LoadAssemblies(
            typeof(Order).Assembly,           // Core
            typeof(OrderRepository).Assembly, // Infrastructure
            typeof(Program).Assembly)         // Web
        .Build();
}
```

`ArchLoader` builds a model of your codebase's structure once, which every rule in the test class then queries against -- worth making this a static field so it's loaded once per test class rather than rebuilt per test.

### Defining layers explicitly

```csharp
private static readonly IObjectProvider<IType> CoreLayer =
    Types().That().ResideInNamespace("MyApp.Core").As("Core");

private static readonly IObjectProvider<IType> InfrastructureLayer =
    Types().That().ResideInNamespace("MyApp.Infrastructure").As("Infrastructure");

private static readonly IObjectProvider<IType> WebLayer =
    Types().That().ResideInNamespace("MyApp.Web").As("Web");
```

Naming layers explicitly like this is one of ArchUnitNET's more expressive features over a simpler tool -- it lets you write layer-oriented rules that read naturally, rather than repeating namespace strings across every individual rule.

### Enforcing a layered dependency rule

```csharp
[Fact]
public void Core_Should_Not_Depend_On_Infrastructure_Or_Web()
{
    IArchRule rule = Types().That().Are(CoreLayer)
        .Should().NotDependOnAny(InfrastructureLayer.Or(WebLayer));

    rule.Check(Architecture);
}
```

`rule.Check(Architecture)` throws an assertion failure (integrated with your test framework via the package you installed) if the rule is violated -- no separate `Assert.True(result.IsSuccessful)` boilerplate needed, since the framework integration package handles that directly.

### Naming and attribute conventions

```csharp
[Fact]
public void Controllers_Should_Have_ApiController_Attribute()
{
    IArchRule rule = Classes().That().AreAssignableTo(typeof(ControllerBase))
        .Should().BeDecorated(typeof(ApiControllerAttribute));

    rule.Check(Architecture);
}

[Fact]
public void Repository_Implementations_Should_Be_Sealed()
{
    IArchRule rule = Classes().That().ImplementInterface(typeof(IOrderRepository))
        .Should().BeSealed();

    rule.Check(Architecture);
}
```

### Slice-based rules for module boundaries

```csharp
[Fact]
public void Modules_Should_Not_Have_Cyclic_Dependencies()
{
    var slices = SliceRuleDefinition.Slices()
        .Matching("MyApp.Modules.(*)..")
        .Should().BeFreeOfCycles();

    slices.Check(Architecture);
}
```

Slice rules are one of ArchUnitNET's more distinctive capabilities -- checking for cyclic dependencies between modules matched by a namespace pattern, useful specifically for Modular Monolith architectures where module boundaries need to stay acyclic.

## Core Workflow

- **Load the architecture once per test class, reuse across rules.** `ArchLoader` builds a full model of the assemblies you point it at -- rebuilding it per test is unnecessary overhead.
- **Name layers explicitly when your rules span more than a simple two-namespace check.** This is where ArchUnitNET's expressiveness pays off compared to repeating namespace strings across many rules.
- **Use slice rules specifically for module-boundary and cyclic-dependency checks**, a capability that goes beyond what a simpler dependency-direction-only tool provides.

## Verifying Your Setup

1. **Rules catch real violations** -- temporarily introduce a deliberate violation and confirm the corresponding rule's `Check(Architecture)` call fails the test
2. **Layer definitions match your actual namespace structure** -- confirm each named layer (`CoreLayer`, `InfrastructureLayer`, etc.) captures the types you intend, not an over- or under-inclusive set
3. **Slice rules correctly identify module boundaries** -- confirm your slice pattern (`"MyApp.Modules.(*).."`) matches your actual module namespace structure
4. **Tests run in CI alongside your regular suite** -- confirm architecture tests execute as part of your normal pipeline

## Best Practices

**Define named layers once and reuse them across multiple rules**, rather than repeating namespace-matching logic in every individual test -- this is where ArchUnitNET's richer modeling genuinely pays off over a simpler namespace-string-per-rule approach.

**Use slice rules for module boundary and cyclic-dependency checks specifically.** This is a capability worth using deliberately if you're working with a Modular Monolith or similarly module-oriented architecture, not something to reach for by default in a simpler layered system.

**Load the architecture once per test class via a static field**, not per individual test method -- `ArchLoader` doing a full assembly scan repeatedly is unnecessary and slows down your test suite for no benefit.

**Keep rule definitions readable by naming things well.** ArchUnitNET's fluent API is expressive, but a rule chained across many conditions without clear naming can become just as hard to parse as the problem it's meant to prevent.

**Pair with a broader static analysis tool for anything beyond structural/dependency rules.** Like NetArchTest, ArchUnitNET is deliberately scoped to architecture and structure -- code smells, security, and duplication need SonarQube, Roslyn Analyzers, or NDepend.

## Comparison with NetArchTest

| | ArchUnitNET | NetArchTest |
| --- | --- | --- |
| Layer/slice modeling | First-class, explicit named layers and slice rules | Less explicit -- namespace strings per rule |
| Cyclic dependency detection | Built-in via slice rules | Not a first-class feature |
| Test framework integration | Dedicated packages per framework | Single package, framework-agnostic |
| Community/adoption | Smaller | Somewhat wider |

ArchUnitNET's richer modeling is a genuine advantage for more structurally complex systems (especially Modular Monoliths needing cyclic-dependency checks); for a simpler two- or three-layer Clean Architecture setup, the difference from NetArchTest is mostly stylistic.

## Frequently Asked Questions

### What's the advantage of named layers over NetArchTest's namespace-string approach?

Readability and reuse -- once you define `CoreLayer` and `InfrastructureLayer` as named providers, every subsequent rule referencing them reads clearly and doesn't repeat namespace-matching logic. For a small number of simple rules the difference is minor; for a larger rule set spanning many layers, it meaningfully reduces duplication and improves clarity.

### What are slice rules, and when should I use them?

Slice rules check for structural properties (most commonly, freedom from cyclic dependencies) across a set of "slices" matched by a namespace pattern -- typically your application's modules. They're particularly valuable for Modular Monolith architectures, where verifying that modules don't have circular dependencies on each other is a meaningful, checkable architectural guarantee.

### Do I need to rebuild the Architecture object for every test?

No, and you shouldn't -- build it once via a static field (typically using `ArchLoader`) and reuse it across every rule in the test class. Rebuilding it per test re-scans your assemblies unnecessarily and slows down your test suite.

### How does rule.Check(Architecture) differ from NetArchTest's result.IsSuccessful pattern?

`rule.Check(Architecture)` integrates directly with your test framework via ArchUnitNET's framework-specific package (xUnit, NUnit, or MSTestV2), throwing a test failure automatically on violation. NetArchTest's pattern returns a result object you assert on manually (`Assert.True(result.IsSuccessful)`), giving you more direct access to diagnostic details like failing type names as part of that manual assertion.

### Can ArchUnitNET detect cyclic dependencies between modules?

Yes, via slice rules -- this is one of its more distinctive capabilities compared to NetArchTest, which doesn't have an equivalent first-class cyclic-dependency check. If module cycle detection is a specific requirement, it's a real point in ArchUnitNET's favor.

### Should I choose ArchUnitNET over NetArchTest for a simple Clean Architecture setup?

Not necessarily -- for straightforward two- or three-layer dependency-direction rules, both tools handle the job comparably well, and the choice comes down to syntax preference. ArchUnitNET's advantages (named layers, slice rules) matter more as your structural rules become more elaborate, particularly for Modular Monolith-style module boundary checks.

### What's the most common mistake in a first ArchUnitNET setup?

Rebuilding the `Architecture` object per test instead of loading it once per test class, adding unnecessary overhead to the test suite. The second common mistake is not taking advantage of named layers for rule sets with more than a couple of simple dependency checks, ending up with repeated namespace-matching logic that ArchUnitNET's modeling was specifically designed to avoid.
