---
author: Steve Kaschimer
date: 2027-01-12
image: /images/posts/2027-01-12-hero.webp
image_alt: "A simple box with a single arrow entering directly, beside a row of faded, crossed-out attribute-tag icons representing setup attributes that were deliberately left out."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single flat rectangle outline with one teal arrow entering directly from the left, labeled implicitly as construction rather than with real text. To the right, three small tag-shaped icons sit at low opacity with a thin diagonal line through each, suggesting deliberately absent attributes. Below, two thin parallel lanes run side by side, each containing small identical box icons, implying parallel execution by default. Mood is minimal, deliberate, and unhurried. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark/lightbulb clip art."
layout: post.njk
site_title: Tech Notes
summary: "There's no [SetUp] because the constructor does that job, and no [TearDown] because IDisposable already does. A setup guide for constructor-based lifecycle, class fixtures, and designing tests for xUnit's default parallelism rather than fighting it."
tags: ["dotnet", "testing", "ci-cd", "developer-productivity"]
title: "Getting Started with xUnit in .NET"
---

xUnit's minimal-ceremony philosophy is the whole point, and it's also the thing that occasionally confuses people coming from NUnit or MSTest: there's no `[SetUp]` attribute because xUnit wants you to use the constructor instead, and there's no `[TearDown]` because `IDisposable` already does that job. Once that click happens - test classes are just objects with a lifecycle, not a special container the framework manages through attributes - the rest of xUnit falls into place quickly.

This guide covers installing xUnit, bootstrapping test project structure and shared fixtures correctly, the core patterns for setup/teardown and parameterized tests, and the best practices that take advantage of xUnit's default parallelism rather than fighting it. By the end you'll have a test suite that's fast by default and doesn't fall into the class-level shared-state traps that trip people up under parallel execution.

If you're deciding between testing frameworks first, [a comparison of the top .NET testing frameworks](/posts/2027-01-05-top-5-dotnet-testing-frameworks-compared/) covers where xUnit fits relative to NUnit, MSTest, TUnit, and Expecto.

## What You'll Need

- .NET 8 SDK or later
- No special tooling beyond the SDK - xUnit integrates with `dotnet test`, Visual Studio, VS Code, and Rider out of the box

## Installing and Scaffolding

```bash
dotnet new xunit -n MyApp.Tests
cd MyApp.Tests
dotnet add reference ../MyApp/MyApp.csproj
```

The template includes `xunit`, `xunit.runner.visualstudio`, and `Microsoft.NET.Test.Sdk` already wired up - no manual package assembly needed for the basics.

## Bootstrapping the Ideal Environment

### Setup and teardown via constructor and IDisposable

```csharp
public class OrderServiceTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly OrderService _sut;

    public OrderServiceTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _sut = new OrderService(_db);
    }

    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var order = new Order { Id = 1, Status = OrderStatus.Pending };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _sut.ProcessAsync(order.Id);

        Assert.Equal(OrderStatus.Processing, order.Status);
    }

    public void Dispose() => _db.Dispose();
}
```

The constructor runs before every test method, and `Dispose()` runs after every test method - this is xUnit's setup/teardown, with no dedicated attributes required. A fresh instance of the test class is created per test, which is also why shared mutable state between test methods in the same class needs deliberate handling (see fixtures below), rather than accidentally working because of a shared instance.

### Shared, expensive setup with class fixtures

For genuinely expensive setup you don't want repeated per test (spinning up a test container, for instance), use `IClassFixture<T>`:

```csharp
public class DatabaseFixture : IAsyncLifetime
{
    public AppDbContext Db { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        // Expensive one-time setup, e.g., starting a Testcontainers instance
        Db = await CreateRealDatabaseConnectionAsync();
    }

    public Task DisposeAsync() => Db.DisposeAsync().AsTask();
}

public class OrderServiceTests(DatabaseFixture fixture) : IClassFixture<DatabaseFixture>
{
    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        // fixture.Db is shared across all tests in this class
    }
}
```

`IClassFixture<T>` shares one instance across every test in the class (created once, disposed once), while the constructor-based setup above creates fresh state per test - choosing the right one is about whether tests need isolation from each other or can safely share expensive setup.

### Parameterized tests

```csharp
[Theory]
[InlineData(OrderStatus.Pending, true)]
[InlineData(OrderStatus.Shipped, false)]
public void CanBeProcessed_ReturnsExpectedResult(OrderStatus status, bool expected)
{
    var order = new Order { Status = status };
    Assert.Equal(expected, order.CanBeProcessed());
}
```

`[Theory]` combined with `[InlineData]` (or `[MemberData]`/`[ClassData]` for more complex or shared data sources) runs the same test logic against multiple inputs without duplicating the test method.

## Core Workflow

- **Use the constructor for per-test setup, `IDisposable`/`IAsyncLifetime` for teardown.** This is xUnit's core convention - lean into it rather than looking for `[SetUp]`/`[TearDown]` attributes that don't exist.
- **Use `[Fact]` for a single, non-parameterized test and `[Theory]` for parameterized ones.** This distinction is explicit in xUnit, unlike some frameworks that unify both under one attribute.
- **Assume tests run in parallel across classes by default**, and design tests to not depend on shared external state (a shared database, static fields) unless deliberately coordinated.

## Verifying Your Setup

1. **Tests run and are discovered correctly** - `dotnet test` should list and execute every test in the project
2. **Constructor/Dispose setup and teardown fire per test** - add logging or a breakpoint to confirm the lifecycle matches expectations
3. **Class fixtures are shared correctly** - confirm `IClassFixture<T>` state persists across tests in the same class but is properly disposed after the last one
4. **Parallel execution doesn't cause flaky failures** - run the suite repeatedly and confirm no test depends on execution order or unintentionally shared state

## Best Practices

**Design tests assuming parallel execution, not despite it.** xUnit's default parallelism (at the class level) is a feature - fighting it by disabling parallelism to work around shared state usually just hides a design problem rather than fixing it.

**Use `IClassFixture<T>` specifically for expensive, shareable setup**, not as a default for everything. Overusing shared fixtures for state that should be test-isolated reintroduces the exact cross-test coupling parallel execution is meant to expose.

**Prefer `[Theory]`/`[MemberData]` over copy-pasted `[Fact]` methods for closely related test cases.** This keeps the actual test logic in one place and makes the set of cases being verified easy to scan at a glance.

**Keep constructors focused on setup, not assertions.** Constructor logic that could throw for reasons unrelated to the test itself makes failures harder to diagnose - keep it to arranging state.

**Use `IAsyncLifetime` instead of a synchronous constructor when setup is genuinely async** (like a real database or container). Blocking on async work in a constructor is a common source of subtle deadlocks.

## Comparison with NUnit

| | xUnit | NUnit |
| --- | --- | --- |
| Setup/teardown | Constructor / IDisposable | `[SetUp]` / `[TearDown]` attributes |
| Parallelism | Default, class-level | Configurable, opt-in |
| Parameterized tests | `[Theory]` + `[InlineData]`/`[MemberData]` | `[TestCase]`, `[TestCaseSource]` |
| Assertion style | `Assert.Equal(expected, actual)` | `Assert.That(actual, Is.EqualTo(expected))` |
| Default for new .NET Core projects | Yes | No, but fully supported |

Both are mature, well-supported choices - the difference is largely philosophical (minimal ceremony vs. rich attribute-driven features) rather than one being objectively more capable than the other.

## Frequently Asked Questions

### Why doesn't xUnit have [SetUp] and [TearDown] attributes like NUnit?

By design - xUnit's philosophy uses the test class's own constructor and `IDisposable.Dispose()` for setup and teardown instead, treating the test class as an ordinary object with a normal lifecycle rather than something the framework manages through special attributes. This was a deliberate design choice by xUnit's original authors, some of whom had previously worked on NUnit.

### Does xUnit create a new instance of the test class for every test?

Yes - this is core to how xUnit provides test isolation. Each test method runs against a fresh instance of the test class, so constructor logic (setup) runs before every single test, not once per class. Shared state across tests requires an explicit `IClassFixture<T>`, not an accident of instance reuse.

### How do I share expensive setup across multiple tests without recreating it every time?

Use `IClassFixture<T>` (shared across one class) or `ICollectionFixture<T>` (shared across multiple classes grouped into a test collection). Both create the fixture once and dispose it once, in contrast to constructor-based setup which runs fresh per test.

### Why are my tests failing intermittently only when run together, not individually?

This is almost always a sign of unintended shared state between tests running in parallel - a static field, a shared database without proper isolation, or a fixture being used where per-test isolation was actually needed. xUnit's default parallelism surfaces this kind of coupling that might not show up under sequential execution; treat it as a design issue to fix, not a reason to disable parallelism.

### Can I disable parallel execution if my tests aren't ready for it?

Yes, via `[assembly: CollectionBehavior(DisableTestParallelization = true)]` or by configuring test collections, but treat this as a temporary measure while you address the underlying shared-state issue, not a permanent solution - you're giving up a real performance benefit to work around a design problem that will likely resurface elsewhere.

### What's the difference between [Fact] and [Theory]?

`[Fact]` is a single test with no parameters. `[Theory]` is a parameterized test that runs once per data row supplied via `[InlineData]`, `[MemberData]`, or `[ClassData]` - xUnit reports each data row as its own test result, making failures in a specific case easy to identify individually.

### What's the most common mistake in a first xUnit setup?

Assuming test classes share state across test methods the way they might in a framework with class-level `[SetUp]` semantics, when xUnit actually creates a fresh instance per test by design. The second common mistake is fighting the default parallelism instead of treating any resulting flakiness as a signal to fix shared-state issues in the tests themselves.
