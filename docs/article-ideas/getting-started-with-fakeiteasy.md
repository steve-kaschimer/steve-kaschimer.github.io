# Getting Started with FakeItEasy in .NET

FakeItEasy's entire design fits behind one idea: whatever you're doing with a fake -- stubbing a return value or verifying a call happened -- it goes through the same entry point, `A.`. There's no separate mental model for "arranging" versus "asserting" the way some libraries split those concerns into different syntaxes. Once you know `A.Fake<T>()` creates a fake and `A.CallTo(...)` is how you interact with it either way, you've learned most of the library.

This guide covers installing FakeItEasy, bootstrapping fakes and configuring behavior correctly, the core patterns for stubbing, verification, and argument matching under its single unified API, and the best practices that make the most of that consistency. By the end you'll have a test suite where stubbing and verifying share one discoverable shape, rather than two.

If you're deciding between mocking libraries first, a comparison of the top .NET mocking libraries covers where FakeItEasy fits relative to Moq, NSubstitute, JustMock, and Rocks.

## What You'll Need

- .NET 8 SDK or later
- An existing test project (xUnit, NUnit, or MSTest all work identically well with FakeItEasy)

## Installing FakeItEasy

```bash
dotnet add package FakeItEasy
```

## Bootstrapping the Ideal Environment

### Creating and configuring a fake

```csharp
public class OrderServiceTests
{
    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var repository = A.Fake<IOrderRepository>();
        var order = new Order { Id = 1, Status = OrderStatus.Pending };

        A.CallTo(() => repository.GetByIdAsync(1)).Returns(order);

        var sut = new OrderService(repository);

        await sut.ProcessAsync(1);

        Assert.Equal(OrderStatus.Processing, order.Status);
        A.CallTo(() => repository.SaveAsync(order)).MustHaveHappenedOnceExactly();
    }
}
```

`A.Fake<T>()` creates the fake -- no wrapper type, used directly the same way NSubstitute's substitutes are. `A.CallTo(...)` is the single entry point for both configuring behavior (`.Returns(...)`) and verifying it happened (`.MustHaveHappenedOnceExactly()`), which is the whole point of FakeItEasy's design.

### Argument matching

```csharp
A.CallTo(() => repository.GetByIdAsync(A<int>.Ignored)).Returns(order);

A.CallTo(() => repository.SaveAsync(A<Order>.That.Matches(o => o.Status == OrderStatus.Processing)))
    .Returns(Task.CompletedTask);
```

`A<T>.Ignored` matches any argument of that type, and `A<T>.That.Matches(predicate)` matches a specific condition -- the same conceptual role as `It.IsAny<T>()`/`It.Is<T>()` in Moq or `Arg.Any<T>()`/`Arg.Is<T>()` in NSubstitute, expressed through FakeItEasy's own vocabulary.

### Verifying calls

```csharp
A.CallTo(() => repository.SaveAsync(A<Order>.Ignored)).MustHaveHappenedOnceExactly();
A.CallTo(() => repository.DeleteAsync(A<int>.Ignored)).MustNotHaveHappened();
A.CallTo(() => repository.GetByIdAsync(A<int>.Ignored)).MustHaveHappened(2, Times.OrMore);
```

Because verification uses the same `A.CallTo(...)` shape as stubbing, there's no separate syntax to learn for assertions -- just a different terminal call (`.MustHaveHappenedOnceExactly()` instead of `.Returns(...)`).

### Sequential returns

```csharp
A.CallTo(() => repository.GetNextIdAsync()).ReturnsNextFromSequence(1, 2, 3);
```

`ReturnsNextFromSequence` is FakeItEasy's equivalent of Moq's `SetupSequence` or NSubstitute's multi-value `Returns(...)` -- configuring different return values across successive calls.

## Core Workflow

- **Use `A.Fake<T>()` to create, and interact with the fake directly** -- no wrapper object, the same pattern as NSubstitute.
- **Route both stubbing and verification through `A.CallTo(...)`.** This consistency is FakeItEasy's core value proposition -- lean into it rather than looking for a separate verification-specific syntax.
- **Use `A<T>.Ignored` for irrelevant arguments, `A<T>.That.Matches(...)` for conditions that matter.** The same argument-matching discipline that applies across every mocking library in this series.

## Verifying Your Setup

1. **Fakes are created and configured correctly** -- confirm `A.Fake<T>()` produces an instance usable directly, with `A.CallTo(...)` correctly configuring its behavior
2. **Argument matchers behave as expected** -- confirm `A<T>.That.Matches(...)` predicates correctly discriminate between matching and non-matching calls
3. **Verification catches missing or unexpected interactions** -- deliberately break a test's expected call count and confirm `MustHaveHappened...` assertions actually fail
4. **Verification and stubbing both read consistently** -- confirm your team is actually taking advantage of the one-API-shape consistency rather than mixing in patterns from other libraries out of habit

## Best Practices

**Route everything through `A.CallTo(...)` consistently.** The library's core value is having one shape for both stubbing and verification -- inconsistent usage (or mixing in habits from another library) undermines the exact benefit you chose FakeItEasy for.

**Use `A<T>.Ignored` for arguments the test doesn't care about, and `A<T>.That.Matches(...)` for ones it does.** Over- or under-specifying arguments has the same costs here as in any mocking library.

**Choose the precise `MustHaveHappened...` variant that matches your actual intent.** `MustHaveHappenedOnceExactly()`, `MustHaveHappened(n, Times.OrMore)`, and others give you fine control -- pick the one that actually expresses what you're testing, not just whichever compiles.

**Keep fake configuration close to the test using it.** The same discipline that applies to any mocking library -- excessive shared setup makes individual tests harder to understand in isolation.

**Take advantage of FakeItEasy's discoverability by exploring what hangs off `A.` when uncertain.** Since nearly everything is accessible from that one entry point, IDE autocomplete on `A.` is a genuinely useful way to discover capabilities you might not know about yet.

## Comparison with NSubstitute

| | FakeItEasy | NSubstitute |
| --- | --- | --- |
| Syntax | Single API: `A.CallTo(...)` for both stubbing and verification | Direct calls on the substitute; `Received()`/`DidNotReceive()` for verification |
| Accessing the fake | The fake itself, no wrapper | The substitute itself, no wrapper |
| Consistency model | One shape for stub and verify | Two related but distinct patterns (direct call vs. Received) |
| Strict mocking | Not supported by default, similar to NSubstitute | Not supported |
| Community | Solid, loyal following | Large, grew significantly post-2023 |

Both avoid a wrapper object and share similar ergonomics -- the real difference is philosophical: FakeItEasy's single `A.CallTo(...)` entry point for everything versus NSubstitute's slightly more varied (but still minimal) syntax split between direct calls and `Received()`.

## Frequently Asked Questions

### What's the advantage of FakeItEasy's single A.CallTo(...) API over having separate stub and verify syntax?

Consistency and discoverability -- you only need to learn one pattern for interacting with a fake, whether you're configuring its behavior or checking that an interaction happened. Some teams find this genuinely reduces cognitive load; others don't find the distinction (as in Moq or NSubstitute, where stubbing and verification look somewhat different) to be a real problem in practice. It's a legitimate but ultimately stylistic differentiator.

### Does FakeItEasy support strict mocking, where unconfigured calls throw?

Not by default -- similar to NSubstitute, unconfigured calls on a FakeItEasy fake return a default value rather than throwing. If strict-by-default behavior is a hard requirement for your testing philosophy, Moq's `MockBehavior.Strict` is the more direct fit among the mainstream open-source options.

### What's the difference between MustHaveHappenedOnceExactly and MustHaveHappened?

`MustHaveHappenedOnceExactly()` requires the call to have happened exactly one time, no more and no less. `MustHaveHappened(n, Times.OrMore)` (or similar variants) gives you more flexible count constraints -- at least n times, exactly n times, or other combinations. Choose the variant that actually matches what you're verifying, rather than defaulting to the loosest one that happens to pass.

### Can FakeItEasy mock static methods or sealed classes?

No -- like Moq and NSubstitute, FakeItEasy relies on runtime proxy generation for interfaces and virtual members. JustMock's commercial edition is the option in this comparison series capable of mocking statics and sealed classes, using the .NET Profiling API.

### How do I make a fake's return value depend on the arguments it received?

Use `A.CallTo(...).ReturnsLazily((call) => ComputeResult(call.GetArgument<int>(0)))`, FakeItEasy's mechanism for computing a dynamic return value based on the actual call, analogous to Moq's lambda-based `Returns` or NSubstitute's `callInfo` pattern.

### Is FakeItEasy actively maintained and production-ready?

Yes -- it's a mature, established library with a loyal following that predates the Moq controversy, not simply a beneficiary of 2023's migration wave. It's a legitimate, well-supported choice on its own technical merits, separate from any comparison to Moq's history.

### What's the most common mistake in a first FakeItEasy setup?

Not taking advantage of the single `A.CallTo(...)` consistency and mixing in mental models from another mocking library, which can lead to verbose or inconsistent test code that doesn't reflect FakeItEasy's actual design intent. The second common mistake is choosing an imprecise `MustHaveHappened...` variant that happens to pass rather than one that actually expresses the specific interaction count being verified.
