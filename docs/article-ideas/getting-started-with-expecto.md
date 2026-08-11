# Getting Started with Expecto in .NET (F#)

Expecto asks a genuinely different question than the other four frameworks in this series: instead of "which attributes decorate a test method," it asks "what does a test look like if it's just an ordinary F# value." Tests in Expecto are composed using the language's own tools -- functions, lists, pattern matching -- rather than a separate attribute-based DSL bolted on top of an object-oriented test class model. If you're coming from xUnit or NUnit, the biggest adjustment isn't syntax, it's the mental model: a test suite is data you build up, not a class the framework introspects.

This guide covers installing Expecto, structuring tests as composable values, the core patterns for setup, parameterized tests, and property-based testing, and the best practices for writing tests that feel idiomatic to F# rather than translated from a C#-oriented framework. By the end you'll have a test suite that reads naturally alongside the rest of an F# codebase.

If you're deciding between testing frameworks first, a comparison of the top .NET testing frameworks covers where Expecto fits relative to xUnit, NUnit, MSTest, and TUnit -- including why it's the right answer specifically for F#, not a competing option for C# projects.

## What You'll Need

- .NET 8 SDK or later
- F# -- Expecto is built for and idiomatic to F# specifically, not a general-purpose .NET framework usable comfortably from C#

## Installing and Scaffolding

```bash
dotnet new console -lang F# -o MyApp.Tests
cd MyApp.Tests
dotnet add package Expecto
```

Expecto tests run as an ordinary console application's entry point rather than through a separate test adapter model -- your `Program.fs` becomes the test runner itself.

## Bootstrapping the Ideal Environment

### Tests as values, not attribute-decorated methods

```fsharp
open Expecto

let orderTests =
    testList "OrderService" [
        testCase "processing a pending order marks it as processing" <| fun _ ->
            let order = { Id = 1; Status = Pending }
            let result = OrderService.processOrder order
            Expect.equal result.Status Processing "Order should be marked as Processing"

        testCase "processing an already-shipped order fails" <| fun _ ->
            let order = { Id = 2; Status = Shipped }
            Expect.throws (fun () -> OrderService.processOrder order |> ignore)
                "Should throw when processing an already-shipped order"
    ]

[<EntryPoint>]
let main argv = runTestsWithCLIArgs [] argv orderTests
```

`testList` groups related tests the way a `[TestFixture]` or test class would in the other frameworks, but it's just a list value -- you can combine, filter, or transform it using ordinary F# list operations, since it's not a special container type the framework reflects over.

### Setup and teardown via ordinary function composition

Expecto doesn't have dedicated `[SetUp]`/`[TearDown]` attributes -- setup and teardown are just functions you call, composed the way you'd compose any other F# logic:

```fsharp
let withTestDatabase (test: AppDbContext -> unit) =
    let options =
        DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(System.Guid.NewGuid().ToString())
            .Options
    use db = new AppDbContext(options)
    test db

let orderTests =
    testList "OrderService" [
        testCase "processing marks order as processing" <| fun _ ->
            withTestDatabase (fun db ->
                let order = { Id = 1; Status = Pending }
                db.Orders.Add(order) |> ignore
                db.SaveChanges() |> ignore

                OrderService.processOrder db order.Id

                Expect.equal order.Status Processing "Order should be marked as Processing")
    ]
```

This is the core adjustment coming from an attribute-based framework: there's no framework hook for setup/teardown because you don't need one -- it's just a higher-order function wrapping the test body, using patterns already familiar from the rest of F#.

### Parameterized tests

```fsharp
let statusTests =
    testList "CanBeProcessed" [
        for (status, expected) in [ (Pending, true); (Shipped, false) ] ->
            testCase $"status {status} returns {expected}" <| fun _ ->
                let order = { Status = status }
                Expect.equal (OrderService.canBeProcessed order) expected "Unexpected result"
    ]
```

A list comprehension generating `testCase` values is Expecto's answer to `[TestCase]`/`[InlineData]` -- no special attribute needed, since you're just building a list of test values using the same syntax you'd use to build any other list.

### Property-based testing, built in

```fsharp
open FsCheck

let propertyTests =
    testList "Order properties" [
        testProperty "total is always non-negative" <| fun (items: PositiveInt list) ->
            let order = createOrderWithItems items
            order.Total >= 0m
    ]
```

Expecto integrates with FsCheck for property-based testing directly -- generating a wide range of inputs automatically to verify a property holds generally, rather than only checking hand-picked example cases. This is a natural extension of Expecto's data-oriented design and something the attribute-based C# frameworks don't offer as a first-class, built-in pattern.

## Core Workflow

- **Build test suites as composable list values (`testList`), not classes.** This is the core mental shift -- lean into F#'s native data manipulation rather than looking for class-based organization.
- **Use ordinary functions for setup/teardown, composed around the test body.** There's no dedicated attribute vocabulary to learn here, which is either simpler or less familiar depending on where you're coming from.
- **Reach for property-based tests (via FsCheck) where they add real value** -- verifying invariants across a wide input space, not as a wholesale replacement for example-based `testCase` tests.

## Verifying Your Setup

1. **Tests run and report correctly** -- running the compiled test executable should discover and execute every `testCase` in your `testList`
2. **Setup/teardown composition works as expected** -- confirm your composed setup functions correctly isolate state between tests
3. **Parameterized tests via list comprehension produce distinct, individually reportable results** -- confirm each generated `testCase` shows up as its own result, not collapsed into one
4. **Property-based tests are actually exercising a meaningful input range** -- confirm FsCheck-generated cases cover the space you intend, adjusting generators if needed

## Best Practices

**Lean into F#'s native constructs rather than trying to replicate attribute-based patterns from C# frameworks.** Fighting Expecto's data-oriented design to make it feel like NUnit misses the point of using an F#-native tool in the first place.

**Use `testList` nesting to organize tests hierarchically**, the same way you'd organize any other nested F# data structure -- this scales naturally without needing separate namespacing conventions.

**Compose setup/teardown as higher-order functions wrapping test bodies**, keeping the pattern consistent across your suite rather than reinventing it per test file.

**Use property-based testing deliberately for genuine invariants**, not as a default for every test -- example-based `testCase` tests remain clearer for verifying specific, known scenarios.

**Keep test data and logic as plain F# values wherever possible.** Expecto's whole value proposition erodes if you route everything through unnecessary abstraction layers that could just be ordinary functions and data.

## Comparison with xUnit

| | Expecto | xUnit |
| --- | --- | --- |
| Language | F#-specific | C#-oriented, works in any .NET language |
| Test structure | Composable list values (`testList`) | Attribute-decorated classes and methods |
| Setup/teardown | Ordinary function composition | Constructor/IDisposable, IClassFixture |
| Property-based testing | Built-in integration via FsCheck | Requires a separate library (FsCheck.Xunit exists, but is add-on) |
| Best fit | F# projects | C# and general .NET projects |

They're not really competing for the same decision -- Expecto is the right choice specifically because you're writing F# and want tests that feel native to the language, not because it's "better" or "worse" than xUnit in the abstract.

## Frequently Asked Questions

### Can I use Expecto for a C# project?

Not comfortably -- Expecto is designed around F#'s functional idioms (values, function composition, list operations), which don't translate naturally to C#. If you're writing C#, one of xUnit, NUnit, MSTest, or TUnit is the appropriate choice; Expecto is specifically the answer for F# codebases.

### How does Expecto handle setup and teardown without SetUp/TearDown attributes?

Through ordinary function composition -- you write a function that takes a test body, performs setup, calls the test body, and handles cleanup (often via F#'s `use` binding for disposal), then wrap your actual test logic with it. This uses the same language constructs you'd use for any other cross-cutting concern in F#, rather than a framework-provided attribute hook.

### What's the advantage of tests being composable values instead of attribute-decorated methods?

You can manipulate your test suite using ordinary F# operations -- filtering, mapping, combining `testList` values -- the same way you'd manipulate any other data structure, rather than relying on framework-specific mechanisms for organizing or selecting subsets of tests. It also means test generation (like the list-comprehension parameterized test example) falls out naturally from the language rather than needing a special attribute.

### Does Expecto support parallel test execution?

Yes, and it fits naturally into how Expecto's test trees are structured, since tests are already organized as composable data rather than needing separate coordination for parallelism to be layered on top.

### What's property-based testing, and why does Expecto support it natively?

Property-based testing (via FsCheck) verifies that a general property holds across a wide, automatically generated range of inputs, rather than checking only hand-picked example cases -- useful for catching edge cases you wouldn't have thought to test explicitly. Expecto's data-oriented design integrates this naturally as a first-class pattern, reflecting a broader emphasis in the F# community on this testing style compared to more example-test-centric conventions in C#-oriented frameworks.

### Is Expecto mature and well-supported?

Yes, within the F# ecosystem specifically -- it's a well-established, actively used library with the idiomatic patterns and conventions that come from being built for F# rather than adapted to it. Its community is smaller than xUnit's or NUnit's simply because F#'s overall share of .NET usage is smaller, not because Expecto itself is niche within F# development.

### What's the most common mistake when adopting Expecto?

Trying to force attribute-based, class-oriented patterns from C# testing frameworks onto Expecto instead of embracing its data-and-function-composition model, which produces awkward code that fights the library rather than using it as intended. The second common mistake is underusing property-based testing, missing one of Expecto's most distinctive and valuable built-in capabilities.
