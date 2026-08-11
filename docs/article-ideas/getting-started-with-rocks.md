# Getting Started with Rocks in .NET

Rocks asks you to accept one trade upfront: a smaller community and a genuinely different syntax, in exchange for mocks that are ordinary, compiler-checked C# code instead of runtime-generated proxies. There's no `System.Reflection.Emit`, no IL generation happening behind the scenes that you can't step into while debugging -- Rocks uses C# source generators to write real mock classes at build time, which is also exactly what makes it compatible with Native AOT and trimmed deployments in a way every proxy-based library in this comparison structurally isn't.

This guide covers installing Rocks, bootstrapping expectations and mocks with its source-generated model, the core patterns for configuring and verifying behavior, and the best practices for adopting a tool whose architecture (not just its API) differs from what most .NET developers already know. By the end you'll have compile-time-checked mocks and a clear sense of when that trade-off is worth making.

If you're deciding between mocking libraries first, a comparison of the top .NET mocking libraries covers where Rocks fits relative to Moq, NSubstitute, FakeItEasy, and JustMock.

## What You'll Need

- .NET 8 SDK or later (Rocks generates code targeting recent .NET versions -- check current documentation for the exact minimum, since this has moved forward with each major release)
- A recent C# language version, since Rocks relies on modern source generator capabilities

## Installing Rocks

```bash
dotnet add package Rocks
```

That's the entire installation -- no separate analyzer package or profiler to configure. Referencing the package is sufficient because Rocks operates entirely through source generation triggered at build time.

## Bootstrapping the Ideal Environment

### The core mocking pattern

```csharp
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(int id);
    Task SaveAsync(Order order);
}
```

```csharp
[Fact]
public async Task ProcessOrder_MarksOrderAsProcessing()
{
    var expectations = Rock.Create<IOrderRepository>();
    var order = new Order { Id = 1, Status = OrderStatus.Pending };

    expectations.Methods().GetByIdAsync(1).ReturnValue(Task.FromResult<Order?>(order));
    expectations.Methods().SaveAsync(order);

    var repository = expectations.Instance();
    var sut = new OrderService(repository);

    await sut.ProcessAsync(1);

    Assert.Equal(OrderStatus.Processing, order.Status);
    expectations.Verify();
}
```

The pattern has three distinct steps, more explicit than the other libraries in this comparison: `Rock.Create<T>()` builds an expectations object, `.Methods()` configures what calls are expected and what they return, `.Instance()` produces the actual mock you pass to your system under test, and `.Verify()` confirms every configured expectation was actually met.

### Why this looks different: source generation, not runtime proxying

When you call `Rock.Create<IOrderRepository>()`, a source generator has already produced real, compilable C# code implementing `IOrderRepository` specifically for your test -- not at test-run time via reflection, but at build time, checked by the compiler like any other code in your project. This is why you can set a breakpoint and step directly into the generated mock code during debugging, something that isn't meaningfully possible with a runtime-proxy-based library.

### Configuring return values and verifying call counts

```csharp
var expectations = Rock.Create<IOrderRepository>();

expectations.Methods().GetByIdAsync(Arg.Is<int>(id => id > 0))
    .ReturnValue(Task.FromResult<Order?>(order));

var repository = expectations.Instance();

// ... use repository ...

expectations.Verify(); // fails if configured expectations weren't met
```

Rocks' `Arg.Is<T>(predicate)` plays the same role as the equivalent argument matcher in any other library in this comparison -- configuring a match condition rather than an exact value.

### Handling properties and events

```csharp
var expectations = Rock.Create<IOrderNotifier>();
expectations.Properties().Getters().IsEnabled().ReturnValue(true);

var notifier = expectations.Instance();
Assert.True(notifier.IsEnabled);
```

Rocks generates dedicated, strongly-typed configuration surfaces for methods, properties, and events separately -- reflecting its overall design philosophy of exposing exactly what a given member type needs, generated specifically for the interface being mocked, rather than one generic API surface shared across every kind of member.

## Core Workflow

- **Create expectations, configure them, get the instance, use it, then verify.** This five-step flow (`Create` → configure → `Instance` → exercise → `Verify`) is more explicit than other libraries' patterns -- treat the extra structure as the trade-off for compile-time safety, not unnecessary ceremony.
- **Lean on IDE tooling and compiler errors rather than runtime failures for configuration mistakes.** Because mocks are real generated code, a lot of what would be a runtime exception in a proxy-based library becomes a compile error with Rocks instead.
- **Use Rocks specifically where AOT compatibility or compile-time checking are genuine requirements**, not simply because it's newer -- the syntax adjustment is real and worth being intentional about taking on.

## Verifying Your Setup

1. **Source generation is actually running** -- confirm generated mock code appears in your build output (visible via "Go to Definition" or your IDE's generated files view) and that IntelliSense reflects it correctly
2. **Expectations and verification work as intended** -- confirm `.Verify()` fails when a configured expectation wasn't actually met, and passes when it was
3. **Native AOT compatibility holds, if that's your reason for choosing Rocks** -- confirm `dotnet publish` with AOT settings succeeds for a project using Rocks-based mocks
4. **You can step into generated mock code while debugging** -- confirm this genuinely works, since it's one of Rocks' concrete practical advantages over proxy-based libraries

## Best Practices

**Adopt Rocks specifically for AOT/trimming requirements or a genuine desire for compile-time-checked mocks**, not simply because it's the newest option. Its smaller community means more of the troubleshooting burden falls on you directly compared to Moq or NSubstitute.

**Get comfortable with its more explicit, multi-step pattern rather than expecting Moq or NSubstitute's shorter syntax.** The extra structure (`Create` → `Methods()` → `Instance()` → `Verify()`) is a direct consequence of its source-generated architecture, not arbitrary verbosity.

**Take advantage of being able to step into generated mock code during debugging.** This is a genuine, concrete benefit worth using when a test's mock-related behavior isn't doing what you expect -- inspect the actual generated implementation rather than treating it as a black box.

**Check current documentation for target framework requirements before committing**, since Rocks' generated code target has moved forward across major versions, and using an older guide's exact framework assumptions could be outdated.

**Evaluate IDE and CI tooling compatibility given the smaller ecosystem.** Confirm your specific combination of IDE and build pipeline handles Rocks' source generators smoothly before adopting it for a project of real consequence.

## Comparison with Moq

| | Rocks | Moq |
| --- | --- | --- |
| Mechanism | Compile-time source generation | Runtime proxy generation |
| Native AOT support | Yes | No |
| Debugging | Can step into generated mock code | Proxy internals not meaningfully steppable |
| Syntax | More explicit, multi-step (`Create`/`Methods`/`Instance`/`Verify`) | Concise (`Setup`/`Returns`/`Verify`) |
| Community | Small, newer | Largest, most established |

Rocks trades Moq's syntax familiarity and ecosystem size for genuine architectural advantages (AOT compatibility, compile-time checking, debuggable generated code) -- the right choice depends on whether those specific advantages matter for your deployment target, not on which is "better" in the abstract.

## Frequently Asked Questions

### Why does Rocks use a different, more explicit syntax than Moq or NSubstitute?

Because it's solving mocking a fundamentally different way -- generating real C# code at compile time via source generators rather than a runtime proxy via reflection-emitted IL. The more explicit `Create`/`Methods()`/`Instance()`/`Verify()` flow reflects that architecture directly; it's not extra ceremony for its own sake, but a consequence of mocks being actual generated code rather than a dynamically synthesized object.

### Does Rocks actually support Native AOT, or is that aspirational?

Yes, genuinely -- because Rocks generates real C# code at build time rather than relying on runtime reflection or dynamic proxy generation (both of which are hostile to AOT compilation), it's compatible with Native AOT and trimmed deployments in a way that Moq, NSubstitute, and FakeItEasy structurally are not, since all three depend on runtime proxy generation.

### Can I step into Rocks' generated mock code while debugging?

Yes -- since the mock is ordinary, compiled C# code rather than IL emitted at runtime, your debugger can step into it the same way it would step into any other method in your codebase. This is one of Rocks' concrete, practical advantages, not just an architectural talking point.

### Is Rocks a mature, battle-tested library?

It's been under development for a number of years and has a working, capable feature set, but its real-world adoption and community size are meaningfully smaller than Moq, NSubstitute, or FakeItEasy. Evaluate it on its specific architectural merits for your use case (AOT compatibility, compile-time checking) rather than assuming equivalent ecosystem maturity to the more established options.

### Do I need to learn a completely different mental model to use Rocks?

The core concepts (create a mock, configure expected calls and return values, verify they happened) are the same as any mocking library -- what's different is the specific syntax and the underlying mechanism. Expect a real but not enormous learning curve if you're coming from Moq or NSubstitute, mostly around Rocks' more explicit, multi-step configuration flow.

### Can Rocks mock static methods or sealed classes like JustMock?

No -- Rocks still requires an interface or unsealed class with virtual members, since it generates an implementing type via source generation, the same fundamental requirement proxy-based libraries have (just satisfied through a different mechanism). JustMock's commercial elevated mode remains the only option in this comparison series capable of mocking statics and sealed classes.

### What's the most common mistake when adopting Rocks?

Adopting it purely because it's newer or technically interesting, without an actual AOT or compile-time-checking requirement driving the decision, and then being surprised by the smaller community and less familiar syntax compared to Moq or NSubstitute. The second common mistake is not checking current framework target requirements before starting, since Rocks' generated code target has moved forward across major releases.
