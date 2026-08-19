---
author: Steve Kaschimer
date: 2027-12-14
image: /images/posts/2027-12-14-hero.webp
image_alt: "A wrapped proxy glyph shown as a rectangle inside a slightly larger outline, with a small amber version marker beside it indicating a clean, current release well past a past incident."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a solid rectangle enclosed within a slightly larger, thinner outline rectangle, implying a wrapped mock object distinct from its inner fake instance. Beside it, a small amber version-number badge sits cleanly separated from a faded, crossed-out marker representing a past concern now resolved. Mood is familiar, rich, and settled. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art."
layout: post.njk
site_title: Tech Notes
summary: "Moq's Setup/Returns/Verify workflow is likely the mocking syntax the largest share of .NET developers already know. A setup guide for the Mock<T>/.Object model, argument matching, sequential setups, and settling the SponsorLink version question."
tags: ["dotnet", "testing", "tooling", "developer-productivity"]
title: "Getting Started with Moq in .NET"
---



Moq's core workflow - `Setup`, `Returns`, `Verify` - is likely the mocking syntax the largest share of .NET developers already know, and that familiarity is a real reason to keep using it. The one thing worth addressing directly before anything else: in August 2023, Moq shipped a component called SponsorLink that harvested developer email hashes without clear consent. It was reverted within days, and current versions don't contain it, but knowing this history - and pinning to a version you trust - is part of using Moq responsibly in 2026, not optional background trivia.

This guide covers installing Moq (with a note on version selection given its history), bootstrapping mocks and setups correctly, the core patterns for stubbing, verification, and argument matching, and the best practices that keep a Moq-based test suite maintainable. By the end you'll have a working mocking setup and a clear, informed stance on the version question.

If you're deciding between mocking libraries first, [a comparison of the top .NET mocking libraries](/posts/2027-12-07-top-5-dotnet-mocking-libraries-compared/) covers where Moq fits relative to NSubstitute, FakeItEasy, JustMock, and Rocks - including the fuller context on SponsorLink.

## What You'll Need

- .NET 8 SDK or later
- An existing test project (xUnit, NUnit, or MSTest all work identically well with Moq)

## Installing Moq

```bash
dotnet add package Moq
```

Moq versions from 4.20.2 onward have SponsorLink fully removed - there's no need to pin to an old pre-4.20 version to avoid it, contrary to some outdated advice still circulating. Use a current version, but if your organization has a specific policy on this, confirm what it requires before adding the dependency.

## Bootstrapping the Ideal Environment

### Creating and configuring a mock

```csharp
public class OrderServiceTests
{
    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var mockRepository = new Mock<IOrderRepository>();
        var order = new Order { Id = 1, Status = OrderStatus.Pending };

        mockRepository
            .Setup(r => r.GetByIdAsync(1))
            .ReturnsAsync(order);

        var sut = new OrderService(mockRepository.Object);

        await sut.ProcessAsync(1);

        Assert.Equal(OrderStatus.Processing, order.Status);
        mockRepository.Verify(r => r.SaveAsync(order), Times.Once);
    }
}
```

`new Mock<T>()` creates the mock; `.Object` is the actual fake instance you pass to your system under test - this indirection (mock wrapper vs. the object itself) is one of the more common early points of confusion coming from a library like NSubstitute, where the substitute object is used directly.

### Argument matching

```csharp
mockRepository
    .Setup(r => r.GetByIdAsync(It.IsAny<int>()))
    .ReturnsAsync((int id) => new Order { Id = id });

mockRepository
    .Setup(r => r.SaveAsync(It.Is<Order>(o => o.Status == OrderStatus.Processing)))
    .Returns(Task.CompletedTask);
```

`It.IsAny<T>()` matches any argument of that type; `It.Is<T>(predicate)` matches only arguments satisfying a specific condition - both are essential for setups that shouldn't be tightly coupled to one exact input value.

### Verifying calls

```csharp
mockRepository.Verify(r => r.SaveAsync(It.IsAny<Order>()), Times.Once);
mockRepository.Verify(r => r.DeleteAsync(It.IsAny<int>()), Times.Never);
```

`Times.Once`, `Times.Never`, `Times.Exactly(n)`, and others give you precise control over exactly how many times an interaction should have occurred - worth using specifically rather than defaulting to loose verification everywhere.

### Sequential setups for multi-call scenarios

```csharp
mockRepository
    .SetupSequence(r => r.GetNextIdAsync())
    .ReturnsAsync(1)
    .ReturnsAsync(2)
    .ReturnsAsync(3);
```

`SetupSequence` returns different values on successive calls to the same setup - useful for testing retry logic, pagination, or any scenario where the same method is called multiple times with different expected results each time.

## Core Workflow

- **Mock only what your system under test actually depends on** - typically interfaces representing external dependencies (repositories, external services), not every collaborator regardless of whether it's actually a boundary worth isolating.
- **Use `It.IsAny<T>()` for arguments the test doesn't care about, and specific values or `It.Is<T>()` for ones it does.** Over-specifying every argument makes tests brittle to unrelated changes; under-specifying makes them too permissive to catch real bugs.
- **Verify only the interactions that matter to the behavior under test**, not every call the mock happened to receive - excessive verification couples tests too tightly to implementation details.

## Verifying Your Setup

1. **Mocks are configured and used correctly** - confirm `.Object` (not the `Mock<T>` wrapper itself) is what gets passed into the system under test
2. **Argument matchers behave as expected** - confirm `It.Is<T>()` predicates correctly discriminate between matching and non-matching calls
3. **Verification catches missing or unexpected interactions** - deliberately break a test's expected call count and confirm `Verify` actually fails
4. **You're on a current Moq version with SponsorLink fully absent** - confirm your package version is 4.20.2 or later

## Best Practices

**Use a current Moq version - there's no need to pin to a pre-4.20 release.** SponsorLink was fully removed by 4.20.2; staying artificially behind on that basis alone means missing legitimate fixes and improvements for no remaining benefit.

**Don't over-specify Setup calls with exact argument values when the test doesn't actually care about them.** Use `It.IsAny<T>()` for irrelevant parameters so the test stays focused on what it's actually verifying.

**Reserve `Verify` for interactions that are genuinely part of the behavior under test.** Verifying every mock call regardless of relevance turns tests into brittle implementation-detail checks rather than behavior checks.

**Use `MockBehavior.Strict` deliberately when you want unconfigured calls to fail loudly**, rather than the default loose behavior where unconfigured calls on non-void members return default values silently.

**Keep mock setup close to the test that uses it, not buried in a shared base class doing too much.** Excessive shared setup makes individual tests harder to understand in isolation.

## Comparison with NSubstitute

| | Moq | NSubstitute |
| --- | --- | --- |
| Syntax | `mock.Setup(x => x.Method()).Returns(value)` | `sub.Method().Returns(value)` |
| Accessing the fake | Via `.Object` | The substitute itself, no wrapper |
| History | SponsorLink incident (2023, since reverted) | No comparable trust incident |
| Feature richness | Very rich - sequences, callbacks, protected members | Solid, slightly less ceremony-heavy for advanced scenarios |
| Community | Largest, though shaken by 2023 | Large, grew significantly post-2023 |

Both are capable, mature libraries - the practical difference is largely syntax preference (explicit `Setup`/`.Object` vs. NSubstitute's more direct style) plus whichever weight your team puts on Moq's 2023 history.

## Frequently Asked Questions

### Do I need to avoid or pin an old version of Moq because of SponsorLink?

No, not anymore - SponsorLink was fully removed starting with version 4.20.2, so current versions of Moq don't contain it. Some outdated advice from immediately after the incident still recommends pinning to pre-4.20 versions, but that's no longer necessary for avoiding SponsorLink specifically; it just means missing legitimate updates.

### What's the difference between Mock<T> and Mock<T>.Object?

`Mock<T>` is the wrapper you use to configure setups and verify calls. `.Object` is the actual fake instance implementing `T` that you pass to your system under test. This two-part model (configure the wrapper, pass the `.Object`) is Moq's core design and the most common point of confusion for developers coming from libraries like NSubstitute where the substitute object handles both roles directly.

### What's the difference between It.IsAny<T>() and a specific value in Setup?

`It.IsAny<T>()` matches any argument of that type, appropriate when the test doesn't care about the specific value passed. A specific value (or `It.Is<T>(predicate)` for a condition) matches only when the actual call satisfies it, appropriate when the specific argument matters to what you're verifying. Choosing the wrong one either makes tests too brittle (over-specified) or too permissive (under-specified) to be meaningful.

### How do I test that a method was called with specific arguments?

Use `Verify` with `It.Is<T>(predicate)` to check the call happened with arguments matching a specific condition, combined with a `Times` value to control how many times: `mock.Verify(x => x.Method(It.Is<Order>(o => o.Id == 1)), Times.Once)`.

### What's MockBehavior.Strict, and when should I use it?

By default (`MockBehavior.Loose`), calling an unconfigured member on a mock returns a default value rather than throwing. `MockBehavior.Strict` makes unconfigured calls throw instead, which is useful when you specifically want a test to fail if it exercises an interaction you didn't anticipate and explicitly set up.

### Can I mock a static method or sealed class with Moq?

No - Moq, like NSubstitute and FakeItEasy, relies on generating a runtime proxy for an interface or virtual member, which fundamentally can't intercept static calls or sealed class members. JustMock's commercial edition is the option in this comparison series specifically capable of that, using the .NET Profiling API.

### What's the most common mistake in a first Moq setup?

Forgetting to pass `.Object` and accidentally trying to use the `Mock<T>` wrapper itself as if it were the fake instance, which won't compile against code expecting the actual interface type. The second common mistake is over-specifying argument matchers with exact values where `It.IsAny<T>()` would make the test appropriately less brittle.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
