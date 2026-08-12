# Getting Started with MSTest in .NET

MSTest's reputation as "the Visual Studio one" undersells where it's actually landed in recent years -- it now supports both the legacy VSTest platform and the newer Microsoft.Testing.Platform, and its feature gap with xUnit and NUnit has narrowed considerably. The part worth getting right early is less about MSTest's capability and more about which testing platform you're actually building against, since that choice affects tooling behavior in ways that aren't always obvious from the project template alone.

This guide covers installing MSTest, bootstrapping test classes with the right setup/teardown granularity, the core patterns for parameterized tests and assertions, and the best practices for a framework that's deeply tied to the Microsoft ecosystem specifically. By the end you'll have a test suite that fits naturally into a Visual Studio-centric or broader Microsoft-stack workflow.

If you're deciding between testing frameworks first, a comparison of the top .NET testing frameworks covers where MSTest fits relative to xUnit, NUnit, TUnit, and Expecto.

## What You'll Need

- .NET 8 SDK or later
- Visual Studio is the most natural fit given MSTest's first-party integration, though `dotnet test`, VS Code, and Rider all work fine too

## Installing and Scaffolding

```bash
dotnet new mstest -n MyApp.Tests
cd MyApp.Tests
dotnet add reference ../MyApp/MyApp.csproj
```

The template wires up `MSTest.TestFramework`, `MSTest.TestAdapter`, and `Microsoft.NET.Test.Sdk`.

## Bootstrapping the Ideal Environment

### The setup/teardown hierarchy

```csharp
[TestClass]
public class OrderServiceTests
{
    private AppDbContext _db = null!;
    private OrderService _sut = null!;

    [ClassInitialize]
    public static void ClassInitialize(TestContext context)
    {
        // Runs once before any test in this class
    }

    [TestInitialize]
    public void TestInitialize()
    {
        // Runs before every test
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        _db = new AppDbContext(options);
        _sut = new OrderService(_db);
    }

    [TestCleanup]
    public void TestCleanup() => _db.Dispose();

    [ClassCleanup]
    public static void ClassCleanup()
    {
        // Runs once after all tests in this class
    }

    [TestMethod]
    public async Task ProcessOrder_MarksOrderAsProcessing()
    {
        var order = new Order { Id = 1, Status = OrderStatus.Pending };
        _db.Orders.Add(order);
        await _db.SaveChangesAsync();

        await _sut.ProcessAsync(order.Id);

        Assert.AreEqual(OrderStatus.Processing, order.Status);
    }
}
```

The naming maps directly onto NUnit's equivalent concepts -- `[TestInitialize]`/`[TestCleanup]` run per test (like NUnit's `[SetUp]`/`[TearDown]`), and `[ClassInitialize]`/`[ClassCleanup]` run once per class (like NUnit's `[OneTimeSetUp]`/`[OneTimeTearDown]`). `[ClassInitialize]` requires a static method accepting a `TestContext` parameter -- easy to get wrong on a first attempt if you're used to instance-based setup elsewhere.

### Assertions

```csharp
Assert.AreEqual(OrderStatus.Processing, order.Status);
Assert.IsTrue(order.Items.Any());
Assert.IsNotNull(order.Customer);
await Assert.ThrowsExceptionAsync<OrderNotFoundException>(() => sut.ProcessAsync(-1));
```

MSTest's assertion style is closer to xUnit's direct `Assert.X(expected, actual)` pattern than NUnit's constraint-based fluent syntax -- straightforward, if less composable for complex conditions.

### Parameterized tests

```csharp
[TestMethod]
[DataRow(OrderStatus.Pending, true)]
[DataRow(OrderStatus.Shipped, false)]
public void CanBeProcessed_ReturnsExpectedResult(OrderStatus status, bool expected)
{
    var order = new Order { Status = status };
    Assert.AreEqual(expected, order.CanBeProcessed());
}
```

`[DataRow]` is MSTest's equivalent of xUnit's `[InlineData]` or NUnit's `[TestCase]`. For dynamic or larger data sets, `[DynamicData]` references a method or property, similar to `[MemberData]`/`[TestCaseSource]` in the other two frameworks.

## Core Workflow

- **Use `[TestInitialize]`/`[TestCleanup]` for per-test setup, `[ClassInitialize]`/`[ClassCleanup]` only for genuinely shareable, expensive setup.** The same discipline that applies to NUnit's equivalent attributes.
- **Remember `[ClassInitialize]` and `[ClassCleanup]` must be static methods.** This is a common first-time stumbling block if you're used to instance-based lifecycle methods from xUnit or NUnit.
- **Decide deliberately between VSTest and Microsoft.Testing.Platform for your project**, since MSTest supports both -- the newer platform is lighter weight and the direction the ecosystem is moving, but VSTest remains fully supported and may be necessary for certain existing tooling.

## Verifying Your Setup

1. **Tests run and are discovered correctly** -- `dotnet test` should list and execute every test
2. **Class-level setup/teardown are static and run at the right granularity** -- confirm `[ClassInitialize]` runs once, not per test
3. **Assertions produce clear failure output** -- confirm a failing `Assert.AreEqual` clearly shows expected vs. actual values
4. **The correct testing platform is in use** -- confirm whether your project is running on VSTest or Microsoft.Testing.Platform, and that this matches your intent (particularly relevant for CI configuration)

## Best Practices

**Use `[TestInitialize]`/`[TestCleanup]` as your default for per-test isolation**, reaching for `[ClassInitialize]`/`[ClassCleanup]` deliberately for genuinely expensive, safely shareable setup -- the same principle that applies across every framework in this series.

**Remember the static requirement for class-level lifecycle methods.** `[ClassInitialize]` and `[ClassCleanup]` must be static, unlike `[TestInitialize]`/`[TestCleanup]` -- a common compile error for developers moving between frameworks.

**Consider migrating to Microsoft.Testing.Platform for new projects.** It's the lighter-weight, more modern execution platform that MSTest (along with xUnit, NUnit, and TUnit) now supports, and represents the direction the ecosystem is heading.

**Use `TestContext` for accessing test metadata and output**, rather than working around its absence -- it's injected into `[ClassInitialize]` and available as a property on the test class, giving you access to test name, results directory, and other run-time context.

**Don't assume MSTest is "less capable" without checking current versions.** Its feature gap with xUnit and NUnit has narrowed substantially in recent releases -- evaluate based on your team's actual needs and Microsoft ecosystem alignment, not outdated assumptions.

## Comparison with xUnit

| | MSTest | xUnit |
| --- | --- | --- |
| Setup/teardown | `[TestInitialize]`/`[TestCleanup]`, `[ClassInitialize]`/`[ClassCleanup]` (static) | Constructor/IDisposable, IClassFixture |
| Assertion style | Direct (`Assert.AreEqual(expected, actual)`) | Direct (`Assert.Equal(expected, actual)`) |
| Parameterized tests | `[DataRow]`, `[DynamicData]` | `[Theory]` + `[InlineData]`/`[MemberData]` |
| Ecosystem alignment | First-party Microsoft, deep Visual Studio integration | Community-driven, .NET Core-era default |
| Testing platform support | Both VSTest and Microsoft.Testing.Platform | Both, via adapters |

The assertion styles are quite similar between the two; the meaningful differences are in setup/teardown mechanics (attribute-based and partly static vs. constructor-based) and which ecosystem each is most naturally aligned with.

## Frequently Asked Questions

### Why does my ClassInitialize method need to be static?

MSTest's design requires class-level setup and cleanup to be static because they run once for the entire test class, independent of any specific test instance -- there's no meaningful "which instance" for a one-time class-level operation to belong to. This differs from `[TestInitialize]`/`[TestCleanup]`, which are instance methods since they run per-test against a fresh instance.

### What's the difference between VSTest and Microsoft.Testing.Platform for MSTest projects?

VSTest is the older, more established test execution platform; Microsoft.Testing.Platform is the newer, lighter-weight alternative now supported across MSTest, xUnit, NUnit, and TUnit. MSTest supports both, and the newer platform represents the direction the ecosystem is moving, though VSTest remains fully supported and some existing tooling may still expect it.

### Is MSTest less feature-rich than xUnit or NUnit?

The gap has narrowed considerably in recent versions -- MSTest today supports parameterized tests, async test methods, and a comparable core feature set to the other two. It's less about raw capability at this point and more about ecosystem fit: MSTest's real advantage is its first-party integration with Visual Studio and the broader Microsoft development stack.

### How do I access test metadata like the current test name from within a test?

Use `TestContext`, injected as a parameter into `[ClassInitialize]` or available as a property (`TestContext.CurrentContext` in some contexts, or a class-level `TestContext` property populated by the framework) on the test class itself. It provides test name, outcome, and other run-time metadata without you needing to track it manually.

### Should I choose MSTest specifically because my team uses Visual Studio?

It's a reasonable factor, though not a decisive one on its own -- xUnit and NUnit both have excellent Visual Studio support too. MSTest's advantage is more about deeper first-party alignment with the broader Microsoft ecosystem (Azure DevOps, certain enterprise tooling) rather than Visual Studio Test Explorer support specifically, which all three frameworks handle well.

### Can I migrate an MSTest project to xUnit or NUnit later if needed?

Yes, though it's real, non-trivial work -- attribute names, assertion syntax, and setup/teardown mechanics all differ enough that it's a genuine migration project, not an automated conversion, for anything beyond a small test suite. Weigh this against the actual benefit you'd gain before starting a large-scale migration.

### What's the most common mistake in a first MSTest setup?

Forgetting that `[ClassInitialize]` and `[ClassCleanup]` must be static methods, which produces a straightforward compile error but is a common stumbling block coming from xUnit or NUnit's instance-based lifecycle patterns. The second common mistake is not being aware of which testing platform (VSTest vs. Microsoft.Testing.Platform) a project is actually running on, which can affect CI behavior in ways that aren't obvious from the project file alone.
