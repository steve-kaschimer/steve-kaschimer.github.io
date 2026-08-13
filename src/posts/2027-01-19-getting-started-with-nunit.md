---
author: Steve Kaschimer
date: 2027-01-19
image: /images/posts/2027-01-19-hero.webp
image_alt: "A stack of nested labeled attribute rings representing OneTimeSetUp, SetUp, TearDown, and OneTimeTearDown, beside a fluent chain of connected condition links."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on four thin concentric rings of increasing radius, each a hairline outline, with the outermost pair rendered in amber (representing once-per-fixture scope) and the inner pair in teal (representing per-test scope). To the right, a short horizontal chain of three small rounded-rectangle links connected by thin lines represents composable fluent assertions. Mood is layered, expressive, and precise. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic target/bullseye clip art despite the concentric-ring motif."
layout: post.njk
site_title: Tech Notes
summary: "NUnit front-loads more concepts than xUnit, and each one buys something specific. A setup guide for the setup/teardown hierarchy, constraint-based assertions, and knowing which attribute runs when."
tags: ["dotnet", "testing", "developer-productivity", "tooling"]
title: "Getting Started with NUnit in .NET"
---

NUnit's attribute-driven design front-loads more concepts than xUnit's constructor-based approach - `[SetUp]`, `[TearDown]`, `[TestFixture]`, `[OneTimeSetUp]` - but each one buys you something specific and well-documented, and the payoff is a genuinely expressive, readable assertion syntax that a lot of teams prefer once they're used to it. The part worth getting right early is knowing which setup attribute runs when, since NUnit gives you more granularity here than the other frameworks in this series, and using the wrong one is an easy, quiet way to make tests slower or less isolated than intended.

This guide covers installing NUnit, bootstrapping test fixtures with the right setup/teardown granularity, the core patterns for parameterized tests and constraint-based assertions, and the best practices that make good use of NUnit's richer attribute vocabulary without over-using it. By the end you'll have a test suite that takes advantage of what NUnit specifically offers over its alternatives.

If you're deciding between testing frameworks first, [a comparison of the top .NET testing frameworks](/posts/2027-01-05-top-5-dotnet-testing-frameworks-compared/) covers where NUnit fits relative to xUnit, MSTest, TUnit, and Expecto.

## What You'll Need

- .NET 8 SDK or later
- No special tooling beyond the SDK

## Installing and Scaffolding

```bash
dotnet new nunit -n MyApp.Tests
cd MyApp.Tests
dotnet add reference ../MyApp/MyApp.csproj
```

The template wires up `NUnit`, `NUnit3TestAdapter`, and `Microsoft.NET.Test.Sdk` automatically.

## Bootstrapping the Ideal Environment

### The setup/teardown hierarchy, and when to use each

```csharp
[TestFixture]
public class OrderServiceTests
{
    private AppDbContext _db = null!;
    private OrderService _sut = null!;

    [OneTimeSetUp]
    public void OneTimeSetUp()
    {
        // Runs once before any test in this fixture -- for genuinely expensive, shareable setup
    }

    [SetUp]
    public void SetUp()
    {
        // Runs before every test -- for per-test isolated state
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _sut = new OrderService(_db);
    }

    [TearDown]
    public void TearDown() => _db.Dispose();

    [OneTimeTearDown]
    public void OneTimeTearDown()
    {
        // Runs once after all tests in this fixture
    }

    [Test]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var order = new Order { Id = 1, Status = OrderStatus.Pending };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _sut.ProcessAsync(order.Id);

        Assert.That(order.Status, Is.EqualTo(OrderStatus.Processing));
    }
}
```

`[SetUp]`/`[TearDown]` run per test, the same granularity as xUnit's constructor/Dispose. `[OneTimeSetUp]`/`[OneTimeTearDown]` run once per fixture - the NUnit equivalent of xUnit's `IClassFixture<T>`, but built into the attribute vocabulary directly rather than requiring a separate fixture class.

### Constraint-based assertions

```csharp
Assert.That(order.Status, Is.EqualTo(OrderStatus.Processing));
Assert.That(order.Items, Is.Not.Empty);
Assert.That(order.Total, Is.GreaterThan(0).And.LessThan(10000));
Assert.That(() => sut.ProcessAsync(-1), Throws.TypeOf<OrderNotFoundException>());
```

This constraint-based style is one of NUnit's most distinctive features - assertions read close to natural language and compose cleanly (`.And`, `.Or`) for combined conditions, which many find more readable than xUnit's `Assert.Equal(expected, actual)` style, particularly for anything beyond simple equality.

### Parameterized tests

```csharp
[TestCase(OrderStatus.Pending, true)]
[TestCase(OrderStatus.Shipped, false)]
public void CanBeProcessed_ReturnsExpectedResult(OrderStatus status, bool expected)
{
    var order = new Order { Status = status };
    Assert.That(order.CanBeProcessed(), Is.EqualTo(expected));
}
```

For data sets too large or dynamic for inline `[TestCase]` attributes, `[TestCaseSource]` references a method or property providing the data:

```csharp
[TestCaseSource(nameof(OrderStatusCases))]
public void CanBeProcessed_ReturnsExpectedResult(OrderStatus status, bool expected) { /* ... */ }

private static IEnumerable<TestCaseData> OrderStatusCases()
{
    yield return new TestCaseData(OrderStatus.Pending, true);
    yield return new TestCaseData(OrderStatus.Shipped, false);
}
```

## Core Workflow

- **Use `[SetUp]`/`[TearDown]` for per-test isolated state, `[OneTimeSetUp]`/`[OneTimeTearDown]` only for genuinely expensive, safely shareable setup.** Reaching for one-time setup by default, rather than deliberately, is a common way to accidentally introduce cross-test coupling.
- **Prefer constraint-based `Assert.That(...)` over older classic-style assertions** (`Assert.AreEqual(...)`), which NUnit still supports for backward compatibility but doesn't represent its current idiomatic style.
- **Use `[TestCase]` for small, fixed data sets and `[TestCaseSource]` for larger or computed ones**, the same distinction xUnit draws between `[InlineData]` and `[MemberData]`.

## Verifying Your Setup

1. **Tests run and are discovered correctly** - `dotnet test` should list and execute every test
2. **Setup/teardown granularity matches intent** - confirm `[OneTimeSetUp]` genuinely runs once, not per test, and that shared state from it doesn't leak unintended side effects between tests
3. **Constraint-based assertions produce clear failure messages** - confirm a failing assertion's output clearly communicates expected vs. actual
4. **Parallel execution behaves as configured** - NUnit's parallelism is more opt-in than xUnit's; confirm your configuration matches what you actually intend

## Best Practices

**Default to `[SetUp]`/`[TearDown]` for test isolation, and reach for `[OneTimeSetUp]` deliberately, not as a performance shortcut by default.** One-time setup shared across tests is a common source of subtle cross-test coupling if the shared state isn't genuinely immutable or safely reusable.

**Use the constraint-based assertion style consistently.** Mixing classic (`Assert.AreEqual`) and constraint-based (`Assert.That`) styles in the same codebase is confusing for readers - pick one, and constraint-based is the more current idiomatic choice.

**Configure parallel execution explicitly rather than assuming a default.** Unlike xUnit, NUnit's parallelism behavior is more configuration-dependent - know what your test suite is actually doing rather than assuming.

**Use test categories (`[Category("Integration")]`) to separate fast unit tests from slower integration tests.** This lets you run a fast subset during development and the full suite in CI, without maintaining separate projects.

**Take advantage of NUnit's rich constraint composition (`.And`, `.Or`, `.Not`) for genuinely compound conditions**, rather than splitting them into multiple separate assertions that obscure the actual intent being verified.

## Comparison with xUnit

| | NUnit | xUnit |
| --- | --- | --- |
| Setup/teardown | `[SetUp]`/`[TearDown]`, `[OneTimeSetUp]`/`[OneTimeTearDown]` | Constructor/IDisposable, IClassFixture |
| Assertion style | Constraint-based (`Assert.That(x, Is.EqualTo(y))`) | Direct (`Assert.Equal(y, x)`) |
| Parameterized tests | `[TestCase]`, `[TestCaseSource]` | `[Theory]` + `[InlineData]`/`[MemberData]` |
| Parallelism | Configurable, more opt-in | Default, class-level |
| Feature richness | More built-in attributes and constraints | More minimal, extensibility-driven |

Both are excellent, mature choices - NUnit's richer built-in vocabulary suits teams who want more out of the box; xUnit's minimalism suits teams who prefer fewer concepts and lean on plain C# constructs instead.

## Frequently Asked Questions

### What's the difference between [SetUp] and [OneTimeSetUp]?

`[SetUp]` runs before every individual test method, giving each test fresh, isolated state. `[OneTimeSetUp]` runs once before all tests in the fixture, appropriate only for expensive setup that's safe to share across every test without one test's execution affecting another's correctness.

### Should I use Assert.That or Assert.AreEqual?

`Assert.That(actual, Is.EqualTo(expected))` - the constraint-based style is NUnit's current idiomatic approach and generally considered more readable and composable, especially for conditions beyond simple equality. `Assert.AreEqual` and other classic-style assertions still work for backward compatibility but aren't the recommended style for new tests.

### How do I run only a subset of my NUnit tests, like just unit tests and not integration tests?

Use `[Category("...")]` attributes on your test fixtures or methods, then filter with `dotnet test --filter "Category=Unit"` (or your chosen category name). This lets you maintain fast and slow tests in the same project while still running them selectively.

### Does NUnit run tests in parallel by default like xUnit?

Not to the same degree - NUnit's parallel execution is more explicitly configurable via `[Parallelizable]` attributes and assembly-level settings, rather than being class-level parallel by default the way xUnit is. Confirm your actual configuration rather than assuming a default, since behavior here differs meaningfully between the two frameworks.

### What's the difference between [TestCase] and [TestCaseSource]?

`[TestCase]` supplies parameterized test data directly as attribute arguments, appropriate for small, fixed data sets known at compile time. `[TestCaseSource]` references a method or property that yields test cases, appropriate for larger data sets, computed data, or data you want to share across multiple test methods.

### Can I mix NUnit's classic and constraint-based assertion styles in the same project?

Technically yes, since NUnit supports both, but it's worth avoiding for consistency's sake - mixing styles makes a codebase harder to read and suggests no clear team convention. Standardize on the constraint-based style for new tests, and consider migrating older classic-style assertions when you touch that code anyway.

### What's the most common mistake in a first NUnit setup?

Using `[OneTimeSetUp]` for state that should actually be per-test isolated, introducing subtle cross-test coupling that only surfaces as flaky failures under certain execution orders. The second common mistake is mixing assertion styles inconsistently across the codebase rather than settling on the constraint-based approach as the team standard.
