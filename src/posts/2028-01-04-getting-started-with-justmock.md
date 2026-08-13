---
author: Steve Kaschimer
date: 2028-01-04
image: /images/posts/2028-01-04-hero.webp
image_alt: "A rectangle with a small elevated-key badge implying a deeper unlocked capability, distinct from a plainer twin rectangle beside it representing the free basic mode."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on two nearly identical flat rectangles side by side - the left one plain, representing basic proxy-based mocking, the right one carrying a small amber key-shaped badge in its corner, implying an elevated, unlocked capability layered on top via a deeper mechanism. A faint lock icon sits above the badge, needing to be explicitly opened. Mood is capable, deliberate, and distinctly commercial in its advanced tier. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "JustMock answers a question the other mocking libraries in this series can't: what do you do when the code under test has a static dependency, a sealed class, or a non-virtual method, and refactoring it isn't realistic right now. A setup guide for the free Lite tier and the commercial Profiler-based elevated mode."
tags: ["dotnet", "testing", "tooling", "developer-productivity"]
title: "Getting Started with JustMock in .NET"
---

JustMock exists to answer a question the other mocking libraries in this series can't: what do you do when the code you need to test has a static dependency, a sealed class, or a non-virtual method, and refactoring it to be more mockable isn't a realistic option right now? Every proxy-based mocking library (Moq, NSubstitute, FakeItEasy) requires an interface or virtual member to intercept - JustMock's commercial edition sidesteps that requirement entirely using the .NET Profiling API, at the cost of needing to actually enable that more invasive mode deliberately.

This guide covers installing JustMock, bootstrapping both its free (Lite) and commercial (elevated) modes, the core patterns for basic mocking and the advanced scenarios that are JustMock's actual reason for existing, and the best practices for knowing when you need elevated mode versus when a simpler library would do. By the end you'll know exactly which mode a given testing scenario actually requires.

If you're deciding between mocking libraries first, [a comparison of the top .NET mocking libraries](/posts/2027-12-07-top-5-dotnet-mocking-libraries-compared/) covers where JustMock fits relative to Moq, NSubstitute, FakeItEasy, and Rocks.

## What You'll Need

- .NET 8 SDK or later
- For basic mocking (interfaces, virtual members): nothing beyond the NuGet package
- For elevated mocking (statics, sealed classes, non-virtual members): the JustMock Profiler, enabled via Visual Studio or CI integration, and a commercial license

## Installing JustMock

For the free tier:

```bash
dotnet add package JustMock
```

This is JustMock Lite - basic proxy-based mocking of interfaces and virtual members, comparable in scope to Moq, NSubstitute, or FakeItEasy. It requires no profiler and no license.

For elevated mocking (statics, sealed classes, non-virtual members), you need the commercial edition, licensed through Telerik/Progress, with the Profiler enabled via the JustMock Visual Studio extension or your CI pipeline's integration.

## Bootstrapping the Ideal Environment

### Basic mode: interfaces and virtual members

```csharp
public class OrderServiceTests
{
    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var repository = Mock.Create<IOrderRepository>();
        var order = new Order { Id = 1, Status = OrderStatus.Pending };

        Mock.Arrange(() => repository.GetByIdAsync(1)).Returns(Task.FromResult(order));

        var sut = new OrderService(repository);

        await sut.ProcessAsync(1);

        Assert.Equal(OrderStatus.Processing, order.Status);
        Mock.Assert(() => repository.SaveAsync(order), Occurs.Once());
    }
}
```

`Mock.Create<T>()`, `Mock.Arrange(...)`, and `Mock.Assert(...)` follow JustMock's Arrange/Act/Assert-aligned naming - conceptually similar to Moq's `Setup`/`Verify`, just named to match the AAA testing pattern directly.

### Elevated mode: mocking a static method

This is where JustMock does something the other libraries in this comparison structurally can't:

```csharp
[Fact]
public void ProcessOrder_UsesCurrentTimestamp()
{
    Mock.Arrange(() => DateTime.Now).Returns(new DateTime(2026, 1, 1));

    var order = OrderService.CreateOrder();

    Assert.Equal(new DateTime(2026, 1, 1), order.CreatedAt);
}
```

Mocking `DateTime.Now` directly - a static, framework property - is exactly the kind of scenario that requires elevated mode and the Profiler API. Enable elevated mode from the JustMock menu in Visual Studio (or your CI's equivalent integration) before running tests that use this capability; forgetting to enable it is the most common reason an elevated-mode test fails mysteriously.

### Mocking a sealed class

```csharp
[Fact]
public void ProcessOrder_HandlesSealedDependency()
{
    var sealedDependency = Mock.Create<SealedPaymentProcessor>();
    Mock.Arrange(() => sealedDependency.Charge(100m)).Returns(true);

    var result = sealedDependency.Charge(100m);

    Assert.True(result);
}
```

The same `Mock.Create<T>()` syntax works for a sealed class once elevated mode is active - JustMock doesn't require different syntax for basic versus elevated scenarios, which is part of its appeal for legacy code where you don't want to rewrite tests as you gradually encounter harder-to-mock dependencies.

### Partial mocking, keeping the real object mostly intact

```csharp
var order = Mock.Create<Order>(Behavior.CallOriginal);
Mock.Arrange(() => order.CalculateDiscount()).Returns(0.1m);
// order.OtherMethods() still execute their real implementation
```

Partial mocking lets you fake only specific members of an object while leaving the rest of its behavior real - useful for legacy classes where you need to isolate just one problematic dependency without faking the entire object.

## Core Workflow

- **Default to basic mode (JustMock Lite) whenever your code is already interface-driven or uses virtual members.** There's no reason to reach for elevated mode's added complexity and licensing cost for scenarios the free tier already handles.
- **Reach for elevated mode specifically when refactoring toward mockability isn't practical right now.** Static dependencies, sealed classes, and non-virtual members in legacy code are exactly the scenario elevated mode exists for.
- **Remember to enable/disable elevated mode explicitly around tests that need it.** This is a genuinely different operational step from any other library in this series - it's not automatic.

## Verifying Your Setup

1. **Basic mode tests run without needing the Profiler** - confirm interface and virtual-member mocking works with just the NuGet package, no elevated mode required
2. **Elevated mode is actually enabled when needed** - confirm tests mocking statics, sealed classes, or non-virtual members fail clearly (not mysteriously) if elevated mode isn't active, and pass once it is
3. **CI pipeline correctly enables the Profiler for elevated-mode tests** - confirm your CI configuration (Azure Pipelines, GitLab, Jenkins) includes JustMock's integration step, not just the test run itself
4. **Licensing covers your actual usage** - confirm your team's license tier actually includes elevated mocking if your test suite depends on it

## Best Practices

**Use JustMock Lite (free) as your default, and only reach for the commercial elevated features when you actually hit a static, sealed, or non-virtual dependency you can't refactor around.** Paying for and configuring elevated mode for scenarios the free tier already covers is unnecessary overhead.

**Treat elevated-mode dependencies as a signal, not just a testing convenience.** If you're regularly needing to mock statics or sealed classes, it's worth asking whether the code under test could be refactored toward more standard dependency injection over time - elevated mocking is a pragmatic tool for legacy code, not necessarily a permanent architectural stance.

**Explicitly configure CI integration for elevated mode, don't assume it works out of the box.** The Profiler needs to be part of your build/test pipeline configuration - verify this is set up correctly rather than discovering a gap when elevated-mode tests fail in CI but pass locally.

**Use partial mocking sparingly and deliberately.** It's a genuinely useful tool for legacy code, but faking part of an object while leaving the rest real can make test behavior harder to reason about if overused.

**Budget for licensing costs as part of adopting JustMock's full capability.** Unlike every other library in this comparison, meaningful parts of JustMock's value proposition require a paid license - factor this into the decision honestly rather than assuming free-tier parity with the commercial features.

## Comparison with Moq

| | JustMock | Moq |
| --- | --- | --- |
| Mechanism | Proxy-based (free) + Profiler API (commercial) | Runtime proxy generation only |
| Mocks statics/sealed/non-virtual | Yes, commercial edition only | No |
| License | Free tier + commercial | Fully open source |
| Best fit | Legacy code with hard-to-refactor dependencies | Standard interface-driven codebases |
| Syntax | `Mock.Create`/`Mock.Arrange`/`Mock.Assert` | `Mock<T>`, `Setup`/`Returns`/`Verify` |

For a standard, interface-driven codebase, Moq (or NSubstitute, or FakeItEasy) covers the need without any licensing cost. JustMock's real value is specifically for the harder cases those libraries can't reach at all.

## Frequently Asked Questions

### Do I need to pay for JustMock to use it at all?

No - JustMock Lite is free and open source, covering basic mocking of interfaces and virtual members comparable to Moq, NSubstitute, or FakeItEasy. Payment is only required for the commercial edition's elevated mocking capabilities (statics, sealed classes, non-virtual members), which use the .NET Profiling API.

### What is elevated mode, and why does it need to be explicitly enabled?

Elevated mode activates JustMock's Profiler API integration, which intercepts calls at a lower level than standard proxy generation - capable of mocking things (statics, sealed classes, non-virtual members) that proxy-based approaches structurally can't reach. It requires explicit enabling (via the JustMock Visual Studio menu, or CI integration) because it's a more invasive mechanism than ordinary mocking, not something safe to have silently active for every test run by default.

### Why would I mock a static method or sealed class instead of just refactoring the code?

In an ideal world, you'd refactor toward interfaces and dependency injection. In practice, legacy codebases often have static dependencies deeply embedded across a large surface area, and refactoring everything before you can write any tests is often a much bigger, riskier undertaking than the actual testing task at hand. JustMock's elevated mocking lets you write meaningful tests now, with refactoring toward more standard patterns as a separate, incremental effort if desired.

### Does JustMock work with xUnit, NUnit, and MSTest?

Yes - JustMock integrates with all the major .NET test frameworks; its mocking API is independent of which test framework you use to structure and run the tests themselves.

### How do I set up JustMock's elevated mode in a CI pipeline?

JustMock provides specific integration steps for Azure Pipelines, GitLab CI/CD, Jenkins, and MSBuild - these need to be explicitly configured as part of your pipeline, since elevated mode's Profiler API requires the CI environment to activate it the same way Visual Studio does locally. Consult JustMock's current CI integration documentation for your specific platform, since this is a genuinely different setup step from any other library in this comparison.

### Should I use JustMock for a new, greenfield project?

Usually not as the default - if you're writing new, interface-driven code, Moq, NSubstitute, or FakeItEasy will cover your needs without licensing cost or the added complexity of elevated mode. JustMock's distinctive value is specifically for legacy code with dependencies the other libraries can't reach.

### What's the most common mistake in a first JustMock setup?

Forgetting to enable elevated mode before running tests that mock statics, sealed classes, or non-virtual members, resulting in confusing failures that don't clearly indicate the actual problem. The second common mistake is reaching for elevated mocking by default rather than defaulting to the free, simpler basic mode for code that's already interface-driven and doesn't need it.
