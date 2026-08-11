# Getting Started with NSubstitute in .NET

NSubstitute's defining decision is that there's no wrapper object -- `Substitute.For<T>()` returns something that behaves like the real interface and also happens to be your configuration target. There's no `.Object` to unwrap, no separate `Setup()` call before you can specify a return value; you just call the method on the substitute directly, and calling it again with `.Returns(...)` is how you configure it. That single design choice is responsible for most of what people mean when they say NSubstitute's syntax is "the cleanest."

This guide covers installing NSubstitute, bootstrapping substitutes and configuring return values correctly, the core patterns for verification and argument matching, and the best practices that take advantage of its minimal-ceremony design without losing the precision strict mocking sometimes provides. By the end you'll have a test suite that reads close to plain English, and a clear understanding of the one behavior (no strict mode) worth knowing about upfront.

If you're deciding between mocking libraries first, a comparison of the top .NET mocking libraries covers where NSubstitute fits relative to Moq, FakeItEasy, JustMock, and Rocks.

## What You'll Need

- .NET 8 SDK or later
- An existing test project (xUnit, NUnit, or MSTest all work identically well with NSubstitute)

## Installing NSubstitute

```bash
dotnet add package NSubstitute
```

## Bootstrapping the Ideal Environment

### Creating and configuring a substitute

```csharp
public class OrderServiceTests
{
    [Fact]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var repository = Substitute.For<IOrderRepository>();
        var order = new Order { Id = 1, Status = OrderStatus.Pending };

        repository.GetByIdAsync(1).Returns(order);

        var sut = new OrderService(repository);

        await sut.ProcessAsync(1);

        Assert.Equal(OrderStatus.Processing, order.Status);
        await repository.Received(1).SaveAsync(order);
    }
}
```

Note there's no `.Setup()` call and no `.Object` property -- `repository` itself is both the fake you pass to your system under test and the thing you configure directly by calling its methods.

### Argument matching

```csharp
repository.GetByIdAsync(Arg.Any<int>()).Returns(callInfo => new Order { Id = callInfo.Arg<int>() });

repository.SaveAsync(Arg.Is<Order>(o => o.Status == OrderStatus.Processing)).Returns(Task.CompletedTask);
```

`Arg.Any<T>()` and `Arg.Is<T>(predicate)` mirror Moq's `It.IsAny<T>()`/`It.Is<T>()` conceptually -- use the former for arguments the test doesn't care about, the latter when a specific condition matters.

### Verifying calls with Received

```csharp
await repository.Received(1).SaveAsync(order);
await repository.DidNotReceive().DeleteAsync(Arg.Any<int>());
```

`Received(n)` (or the shorthand `Received()` for "at least once") and `DidNotReceive()` are NSubstitute's verification vocabulary -- read almost as plain English, consistent with the library's overall design philosophy.

### Configuring sequential returns

```csharp
repository.GetNextIdAsync().Returns(1, 2, 3);
```

Passing multiple values to `Returns(...)` configures NSubstitute to return them in sequence on successive calls -- the equivalent of Moq's `SetupSequence`, expressed more compactly.

## Core Workflow

- **Call the method directly on the substitute to configure it -- there's no separate setup step.** This is the core mental adjustment coming from Moq; lean into it rather than looking for a `.Setup()` equivalent.
- **Use `Arg.Any<T>()` for irrelevant arguments, `Arg.Is<T>()` for conditions that matter.** The same discipline that applies to any mocking library's argument matching.
- **Remember unconfigured calls succeed silently by default.** NSubstitute doesn't support strict mocking the way some other libraries do -- calling an unconfigured member returns a default value rather than throwing, which is a deliberate design choice worth understanding rather than being surprised by.

## Verifying Your Setup

1. **Substitutes are created and configured correctly** -- confirm calling a method directly on the substitute (no `.Setup()`) correctly configures its return behavior
2. **Argument matchers behave as expected** -- confirm `Arg.Is<T>()` predicates correctly discriminate between matching and non-matching calls
3. **`Received`/`DidNotReceive` catch missing or unexpected interactions** -- deliberately break a test's expected interaction and confirm verification actually fails
4. **You understand the no-strict-mode default** -- confirm your team is comfortable with unconfigured calls succeeding silently, or has a deliberate strategy for cases where that's not desired

## Best Practices

**Lean into the direct call syntax rather than looking for Moq-style ceremony.** `sub.Method().Returns(value)` is the whole pattern -- there's no missing `.Setup()` to find.

**Use `Arg.Is<T>()` for arguments that matter to the test's intent, and `Arg.Any<T>()` for everything else.** The same principle that applies to any mocking library -- over- or under-specifying arguments both have real costs.

**Be deliberate about the lack of strict mocking.** If your team specifically wants unconfigured calls to fail loudly (catching unintended interactions), know that NSubstitute doesn't provide this by default, and factor that into your choice or your testing conventions.

**Use `callInfo` in `Returns(callInfo => ...)` when a mock's return value needs to depend on the arguments it received.** This is NSubstitute's mechanism for dynamic, argument-dependent responses, analogous to Moq's lambda-based `Returns` overloads.

**Keep substitute configuration close to the test using it.** The same discipline that applies to any mocking library -- excessive shared setup across many tests makes individual tests harder to understand in isolation.

## Comparison with Moq

| | NSubstitute | Moq |
| --- | --- | --- |
| Syntax | `sub.Method().Returns(value)` | `mock.Setup(x => x.Method()).Returns(value)` |
| Accessing the fake | The substitute itself | Via `.Object` |
| Strict mocking | Not supported -- unconfigured calls succeed silently | Supported via `MockBehavior.Strict` |
| History | No comparable trust incident | SponsorLink incident (2023, since reverted) |
| Community | Large, grew significantly post-2023 | Largest, though shaken by 2023 |

NSubstitute's cleaner syntax and lack of trust history make it a strong default for new projects; Moq's richer feature set (including strict mocking) remains a legitimate reason to prefer it for teams that want that specific capability.

## Frequently Asked Questions

### Why doesn't NSubstitute have a Setup() method like Moq?

By design -- NSubstitute's whole philosophy is that the substitute object itself is both the fake and the configuration target, so calling a method directly on it (followed by `.Returns(...)`) is how you configure behavior, with no separate setup step needed. This is the source of its cleaner, more natural-reading syntax.

### Does NSubstitute support strict mocking, where unconfigured calls throw?

No -- this is a deliberate design choice, not a missing feature. Unconfigured calls on an NSubstitute substitute succeed silently, returning a default value rather than throwing. If your testing philosophy specifically requires strict-by-default behavior, that's a concrete reason to consider Moq (with `MockBehavior.Strict`) or FakeItEasy instead.

### How do I configure a substitute's return value to depend on the arguments it receives?

Use the `callInfo` lambda overload: `sub.Method(Arg.Any<int>()).Returns(callInfo => ComputeResult(callInfo.Arg<int>()))`. This gives you access to the actual arguments passed on each call, letting the mock's response vary dynamically rather than always returning the same fixed value.

### What's the difference between Received() and Received(1)?

`Received()` (no argument) verifies the call happened at least once. `Received(1)` verifies it happened exactly once. Use the specific count when the exact number of interactions matters to what you're testing, and the parameterless version when you just need to confirm an interaction occurred at all.

### Can NSubstitute mock static methods or sealed classes?

No -- like Moq and FakeItEasy, NSubstitute relies on runtime proxy generation for interfaces and virtual members, which structurally can't intercept static calls or sealed class members. JustMock's commercial edition is the option in this comparison series capable of that specific scenario.

### Is NSubstitute a safe choice with no trust or licensing concerns?

Yes -- it's open source with no comparable incident to Moq's SponsorLink history, and it saw meaningfully increased adoption specifically because of that contrast during and after 2023. It remains a strong, low-friction default for new projects on that basis alone, separate from its syntax advantages.

### What's the most common mistake in a first NSubstitute setup?

Looking for a `.Setup()` method out of habit from Moq and being confused when it doesn't exist, rather than configuring the substitute by calling its methods directly. The second common mistake is assuming unconfigured calls will fail the way they might in a strict-mode mocking library, when NSubstitute's default behavior is to succeed silently instead.
