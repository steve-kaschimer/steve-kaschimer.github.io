---
author: Steve Kaschimer
date: 2027-02-02
image: /images/posts/2027-02-02-hero.webp
image_alt: "A gear transforming into a small checkmark inside a box at its right edge, with a compact rocket-like icon beside it representing Native AOT compatibility."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a gear-shaped outline on the left that visually resolves, along a short teal arrow, into a small solid checkmark-in-box shape on the right - implying work completed before runtime rather than during it. Below, a compact minimal rocket-nose glyph in amber sits beside the checkmark box, connected by a thin line, representing fast native startup. Faint grid dots in the background suggest a build-time compilation pass rather than a live process. Mood is fast, generative, and forward-looking. Avoid: vendor logos, brand colors, circuit-board textures, gears used as the sole dominant motif beyond the transformation, or literal spaceship/launch imagery."
layout: post.njk
site_title: Tech Notes
summary: "TUnit finds tests at compile time via source generators, not reflection at runtime - a genuinely different architecture, not a faster implementation of the same idea. A setup guide covering granular hooks, async fluent assertions, and Native AOT."
tags: ["dotnet", "testing", "performance", "ci-cd", "tooling"]
title: "Getting Started with TUnit in .NET"
---



TUnit's most important characteristic isn't a syntax difference from xUnit or NUnit - it's when test discovery happens. The three incumbent frameworks find your tests at runtime via reflection, every single test run. TUnit finds them at compile time via source generators, which is a genuinely different architecture, not a faster implementation of the same idea. That's what unlocks Native AOT support the others structurally can't offer without a rewrite, and it's why TUnit's setup guide looks familiar on the surface while behaving differently underneath.

This guide covers installing TUnit, bootstrapping test classes and fixtures with dependency injection, the core patterns for parameterized and data-driven tests, and the best practices for taking advantage of what TUnit specifically offers - performance and AOT compatibility - without assuming it's a drop-in swap for an existing suite. By the end you'll have a fast, source-generated test suite and a clear sense of when TUnit's newness is worth the trade-off.

If you're deciding between testing frameworks first, [a comparison of the top .NET testing frameworks](/posts/2027-01-05-top-5-dotnet-testing-frameworks-compared/) covers where TUnit fits relative to xUnit, NUnit, MSTest, and Expecto.

## What You'll Need

- .NET 8 SDK or later
- A recent version of Visual Studio, VS Code, or Rider - TUnit requires IDE support for Microsoft.Testing.Platform, which is present in current versions but may need enabling in some IDE settings

## Installing and Scaffolding

```bash
dotnet new install TUnit.Templates
dotnet new TUnit -n MyApp.Tests
cd MyApp.Tests
dotnet add reference ../MyApp/MyApp.csproj
```

Unlike xUnit, NUnit, and MSTest, TUnit doesn't declare `Microsoft.NET.Test.Sdk` - it's built entirely on Microsoft.Testing.Platform from the start, with no VSTest fallback path. This also means your project needs `<OutputType>Exe</OutputType>` explicitly set, since TUnit generates a standalone test executable rather than a library invoked by an external runner.

## Bootstrapping the Ideal Environment

### A basic test class

```csharp
public class OrderServiceTests
{
    private AppDbContext _db = null!;
    private OrderService _sut = null!;

    [Before(Test)]
    public void Setup()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _sut = new OrderService(_db);
    }

    [After(Test)]
    public void Cleanup() => _db.Dispose();

    [Test]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var order = new Order { Id = 1, Status = OrderStatus.Pending };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _sut.ProcessAsync(order.Id);

        await Assert.That(order.Status).IsEqualTo(OrderStatus.Processing);
    }
}
```

`[Before(Test)]`/`[After(Test)]` are TUnit's per-test setup and teardown hooks - conceptually similar to NUnit's `[SetUp]`/`[TearDown]`, but part of a broader, more granular hook system (`[Before(Class)]`, `[Before(Assembly)]`, and their `After` counterparts) that lets you target exactly the scope you need.

### Async, fluent assertions

```csharp
await Assert.That(order.Total).IsGreaterThan(0).And.IsLessThan(10000);
await Assert.That(order.Items).IsNotEmpty();
await Assert.That(async () => await sut.ProcessAsync(-1))
    .Throws<OrderNotFoundException>();
```

TUnit's assertions are async by default (note the `await`), reflecting its async-first design, and read fluently in a way that's closer to NUnit's constraint-based style than xUnit's direct assertions - with failure messages designed to pinpoint the specific difference rather than dumping full object graphs.

### Dependency injection with shared, reference-counted fixtures

```csharp
public class DatabaseFixture : IAsyncInitializer, IAsyncDisposable
{
    public AppDbContext Db { get; private set; } = null!;

    public async Task InitializeAsync() => Db = await CreateRealDatabaseAsync();
    public async ValueTask DisposeAsync() => await Db.DisposeAsync();
}

public class OrderServiceTests
{
    [ClassDataSource<DatabaseFixture>(Shared = SharedType.PerClass)]
    public required DatabaseFixture Fixture { get; init; }

    [Test]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        // Fixture.Db is available here, shared per the configured scope
    }
}
```

TUnit's fixture sharing supports reference-counted disposal across different scopes (per-test, per-class, per-assembly, globally) - more granular control than xUnit's class/collection fixture split, letting you tune exactly how widely expensive setup is shared.

### Parameterized and matrix tests

```csharp
[Test]
[Arguments(OrderStatus.Pending, true)]
[Arguments(OrderStatus.Shipped, false)]
public async Task CanBeProcessed_ReturnsExpectedResult(OrderStatus status, bool expected)
{
    var order = new Order { Status = status };
    await Assert.That(order.CanBeProcessed()).IsEqualTo(expected);
}
```

```csharp
[Test]
[MatrixDataSource]
public async Task Combinations(
    [Matrix(OrderStatus.Pending, OrderStatus.Shipped)] OrderStatus status,
    [Matrix(true, false)] bool isPriority)
{
    // Runs once for every combination -- 4 test cases from this one method
}
```

Matrix tests are a TUnit-specific convenience - generating the full cross-product of multiple parameter dimensions without manually writing out every combination as a separate `[Arguments]` row.

## Core Workflow

- **Use `[Before(Test)]`/`[After(Test)]` for per-test setup, and the broader hook scopes (`Class`, `Assembly`) deliberately for shared, expensive setup.** The same discipline that applies to every framework's setup/teardown granularity, just with more scope options here.
- **Lean into async assertions rather than working around them.** TUnit's `await Assert.That(...)` pattern is core to its design, not an inconsistency to route around.
- **Use matrix tests for genuine combinatorial coverage, not as a default for every parameterized test.** They're powerful for the right scenario and unnecessary noise for a simple, small parameter set better served by plain `[Arguments]`.

## Verifying Your Setup

1. **Tests run and are discovered at build time** - confirm `dotnet test` (or the generated executable directly) finds and runs your tests without a separate discovery pass
2. **AOT compatibility holds, if that's a goal** - if targeting Native AOT, confirm `dotnet publish` with AOT settings succeeds and the resulting binary runs your tests correctly
3. **Fixture sharing scope matches intent** - confirm `SharedType.PerClass` (or whichever scope you chose) behaves as expected across multiple test classes if shared more broadly
4. **IDE test discovery works** - confirm your IDE's Test Explorer shows TUnit tests correctly; if not, check whether Microsoft.Testing.Platform support needs enabling in IDE settings

## Best Practices

**Adopt TUnit for greenfield projects or suites with a concrete performance/AOT need, not by default for existing suites.** Migrating an established xUnit or NUnit suite is real work - the strongest case for TUnit is starting fresh or hitting a specific pain point it directly addresses.

**Use the granular hook scopes deliberately, matching setup cost to sharing scope.** `[Before(Test)]` for cheap, isolated setup; `[Before(Class)]` or broader for genuinely expensive setup safe to share - the same principle as every other framework, with more precision available here.

**Take advantage of matrix tests for real combinatorial scenarios**, but don't reach for them where a handful of explicit `[Arguments]` rows would be clearer - readability still matters more than cleverness.

**Check IDE and CI tooling compatibility before fully committing, given TUnit's relative newness.** Confirm your specific combination of IDE, CI provider, and any test-reporting tooling handles TUnit and Microsoft.Testing.Platform correctly before migrating a suite of real consequence.

**Treat the API as "mostly stable," not "guaranteed stable," while TUnit is pre-1.0 in places.** Pin versions deliberately and watch release notes for breaking changes more closely than you might with a long-established framework.

## Comparison with xUnit

| | TUnit | xUnit |
| --- | --- | --- |
| Test discovery | Source-generated at compile time | Reflection at runtime |
| Native AOT support | Yes, first-class | No |
| Assertions | Async, fluent (`await Assert.That(...)`) | Direct, synchronous (`Assert.Equal(...)`) |
| Setup/teardown | Attribute hooks with granular scopes | Constructor/IDisposable, IClassFixture |
| Maturity | New, API mostly stable, smaller community | Very mature, largest .NET Core-era community |

TUnit's architectural advantage (compile-time discovery, AOT support) is real and specific, not a marketing claim - but xUnit's maturity and ecosystem size are equally real advantages that matter for most existing projects without a concrete reason to move.

## Frequently Asked Questions

### Is TUnit ready for production use?

For greenfield projects, yes - its design is described as "mostly stable" and it's actively maintained with a clear architectural rationale. For migrating a large, established test suite, weigh the newness (smaller community, less battle-tested at scale, evolving API in some areas) against the concrete benefit you'd gain, rather than migrating purely because it's newer.

### Why does my TUnit project need OutputType set to Exe?

TUnit generates a standalone test executable at build time rather than a library that an external test runner (like VSTest) discovers and invokes via reflection. This is a direct consequence of its source-generated, compile-time discovery architecture - the test project itself becomes a runnable program.

### Does TUnit support Native AOT for all test scenarios?

It's designed for first-class Native AOT support, which is one of its core differentiators from the reflection-based incumbents. Some advanced or highly dynamic testing scenarios may still have edge cases worth verifying for your specific use case, but AOT compatibility is a foundational design goal, not an afterthought bolted on.

### How does TUnit's fixture sharing differ from xUnit's IClassFixture?

TUnit supports more granular, reference-counted sharing scopes (per-test, per-class, per-assembly, globally) via `[ClassDataSource<T>]` and its `SharedType` options, compared to xUnit's more binary choice between per-test (constructor) and per-class (`IClassFixture<T>`) or per-collection (`ICollectionFixture<T>`) sharing. This gives finer control at the cost of a few more concepts to learn.

### What are matrix tests, and when should I use them?

`[MatrixDataSource]` combined with `[Matrix(...)]` parameters generates the full cross-product of multiple parameter dimensions automatically - useful when you genuinely need to verify behavior across every combination of several independent variables. For a small, fixed set of specific cases, plain `[Arguments]` rows are usually clearer and avoid generating combinations you don't actually need to test.

### Can I run TUnit tests alongside xUnit or NUnit tests in the same solution?

Yes - they're separate test projects with separate discovery mechanisms, so there's no conflict running a TUnit project alongside xUnit or NUnit projects in the same solution. This can be a reasonable way to adopt TUnit incrementally for new test projects while leaving an existing suite on its current framework.

### What's the most common mistake in a first TUnit setup?

Treating it as a drop-in replacement for an existing xUnit or NUnit suite and expecting a straightforward find-and-replace migration, when attribute names, assertion syntax, and the async-first assertion model all differ meaningfully. The second common mistake is not verifying IDE and CI tooling compatibility with Microsoft.Testing.Platform before committing to TUnit for a project of real consequence.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
