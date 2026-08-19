---
author: Steve Kaschimer
date: 2027-12-07
image: /images/posts/2027-12-07-hero.webp
image_alt: "Five columns of abstract mocking glyphs positioned along a horizontal axis running from runtime proxy generation on the left to compile-time source generation on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a wrapped proxy glyph shown as a rectangle inside a slightly larger outline, a direct unwrapped rectangle with no outer shell, a single consistent hexagonal entry-point glyph feeding two thin branches, a rectangle with a small elevated-key badge implying a deeper unlocked capability, and a solid compiled-code bracket glyph with a small checkmark seal. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'runtime proxy' on the left to 'compile-time generation' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Mocking in .NET used to be a two-horse syntax preference between Moq and NSubstitute. Moq 4.20's SponsorLink incident reshaped adoption in a way an honest comparison can't skip. A practical breakdown of five mocking libraries, including which one is the only option that can mock statics and sealed classes."
tags: ["dotnet", "testing", "tooling", "developer-productivity"]
title: "The Top 5 .NET Mocking Libraries Compared: Which One Should You Choose?"
---



Mocking library comparisons in .NET used to be a simple two-horse race between Moq and NSubstitute, decided mostly by syntax preference. That changed in August 2023, when Moq 4.20 shipped a component called SponsorLink that read a developer's Git email, hashed it, and sent it to a server to check GitHub Sponsors status - without clear consent. The feature was reverted within days, but the trust damage wasn't, and it genuinely reshaped adoption patterns across the .NET ecosystem in a way this comparison can't honestly skip over.

This guide compares five mocking libraries: Moq, NSubstitute, FakeItEasy, JustMock, and Rocks - the last one included specifically because it represents where a meaningful slice of the community has been heading since 2023: compile-time, source-generator-based mocking that sidesteps the runtime proxy-generation model (and the trust concerns that came with a library controlling what happens during your build) entirely. All five remain legitimate choices; the point of this comparison isn't to declare Moq unusable, but to give you the full picture - technical and otherwise - before you pick. This series continues with dedicated getting-started walkthroughs for each library.

## Quick Comparison

| | Moq | NSubstitute | FakeItEasy | JustMock | Rocks |
| --- | --- | --- | --- | --- | --- |
| **Mechanism** | Runtime proxy generation (Castle DynamicProxy) | Runtime proxy generation | Runtime proxy generation | Runtime proxy + optional Profiler API | Compile-time source generation |
| **Syntax style** | Lambda-based (`Setup`/`Returns`/`Verify`) | Natural (`sub.Method().Returns(...)`), no Setup ceremony | Single consistent `A.CallTo(...)` API | Fluent AAA (`Arrange`/`Act`/`Assert`) | Source-generated, strongly typed per-interface |
| **Mocks non-virtual/sealed/static** | No | No | No | Yes (commercial, Profiler API) | No |
| **License** | Open source (post-SponsorLink, reverted) | Open source | Open source | Free tier + commercial | Open source |
| **Community size** | Largest, though shaken by 2023 | Large, grew significantly post-2023 | Solid, loyal following | Smaller, commercial-focused | Small, newer |
| **Best for** | Existing Moq codebases, teams unbothered by its history | New projects wanting the cleanest, lowest-ceremony syntax | Teams wanting one consistent API for stubbing and verification | Legacy code needing to mock statics/sealed/non-virtual members | Teams wanting AOT-compatible, compile-time-checked mocks |

## Moq

Most widely used. Richest feature set: argument matchers, sequential setups, callback chains, in-order verification, protected virtual methods. Largest community, deepest documentation. Powerful lambda-based syntax.

In August 2023, version 4.20.0 shipped SponsorLink, closed-source component that read a dev's Git email, hashed it, sent it to Azure to check GitHub Sponsors status without clear consent. Reverted in days; trust damage prompted real migration wave. Many organizations pinned to pre-4.20, banned it, or migrated entirely. Same runtime proxy-generation limitations as NSubstitute and FakeItEasy, can't mock non-virtual, sealed, static.

## NSubstitute

Substitute object itself is the mock, no separate wrapper, no `.Object`, no `Setup()`. Cleanest, most natural syntax: `sub.Method().Returns(value)` with no ceremony. No SponsorLink concerns. Increased adoption as teams migrated from Moq. Async "just works."

No strict mock support, unconfigured calls succeed silently by default. Same runtime proxy-generation limitations, interfaces and virtual only. Advanced scenarios (complex callbacks, argument matching) less immediately discoverable than Moq's explicit API.

## FakeItEasy

One consistent entry point: everything (stubbing, verification) goes through `A.CallTo(...)` or `A.Fake<T>()`. Consistent API shape for both, no separate mental model for setup vs. assertion. Mature and stable, loyal following predating Moq controversy. Clear, discoverable API.

Smaller community than Moq or NSubstitute. Same runtime proxy-generation limitations. Less commonly recommended than NSubstitute despite being comparably mature.

## JustMock

Architecturally different, free tier (JustMock Lite) with proxy-based mocking, commercial tier uses .NET Profiling API to mock statics, sealed classes, non-virtual, private members, even framework types like `DateTime` and `File`.

Only option here that can mock statics/sealed/non-virtual without refactoring. Genuinely valuable for legacy code where interfaces/virtuals aren't practical. Fluent AAA API. Actively maintained by Telerik.

Advanced "elevated mocking" requires commercial edition and Profiler API. Real licensing cost. Less commonly reached for outside legacy/enterprise contexts.

## Rocks

Fundamentally different approach, C# source generators produce strongly-typed mock code at compile time instead of runtime proxy generation (like Castle DynamicProxy). Same shift TUnit represents for test frameworks.

No runtime proxy generation, mocks are ordinary source-generated C# code, full Native AOT and trimmed-deployment compatibility. Compile-time errors for mismatched setups. No dependency on runtime library controlling proxy behavior (trust advantage in post-SponsorLink context).

Small community, much less real-world adoption. Source-generator model means different syntax and mental model. Build times increase somewhat. Debugging generated code requires understanding what the generator produced.

## How to Decide

A few heuristics that cover most real-world decisions:

**Maintaining an existing Moq codebase, comfortable with its history?** Pin to a current, clean version and keep using it - there's no urgent technical reason to migrate a working, well-understood test suite.

**Starting a new project and want the cleanest, lowest-ceremony syntax?** NSubstitute is the most commonly cited answer, and for good reason - readable, natural, and untouched by the trust concerns that shook Moq.

**Want one consistent API shape for both stubbing and verification?** FakeItEasy's `A.CallTo(...)` model is worth serious consideration, not just as a Moq alternative but on its own technical merits.

**Working with legacy code that has static, sealed, or non-virtual dependencies you can't refactor around?** JustMock is the only option here that can actually mock those without a larger refactor first - evaluate whether the commercial license is worth that specific capability.

**Building for Native AOT or want compile-time-checked mocks?** Rocks is the right category of tool, with the honest caveat that you're trading ecosystem maturity for architectural advantages that may or may not matter for your specific deployment target.

None of these decisions need to be permanent or absolute across an entire organization - it's reasonable for an existing Moq-based suite to keep working while new projects default to NSubstitute or another alternative, without a mandate to rewrite everything at once.

## Frequently Asked Questions

### Is Moq still safe to use after the SponsorLink incident?

Technically, yes - SponsorLink was reverted within days of the backlash, and current versions don't contain it. The more relevant question for most teams isn't safety but trust: whether your organization is comfortable with a library that shipped that kind of component once, even briefly and even if reverted. Many teams pin to a specific known-clean version and monitor release notes going forward rather than avoiding Moq outright.

### What exactly did the SponsorLink controversy involve?

In August 2023, Moq 4.20.0 bundled a component that read the `user.email` value from a developer's local Git configuration, hashed it with SHA-256, and sent that hash to an Azure service to check whether the developer was sponsoring the project on GitHub Sponsors - without clear, explicit consent, and without this being disclosed prominently to users upgrading the package. The backlash was immediate and significant, and the maintainer reverted the change within days, but it fundamentally altered how much trust a meaningful part of the community places in the project.

### Which library is the most common migration path away from Moq?

NSubstitute is most frequently cited as the primary migration target, largely due to its clean, readable syntax and the fact that it saw a meaningful adoption bump specifically during and after the 2023 controversy. FakeItEasy is a strong second option for teams who prefer its single consistent API shape over NSubstitute's no-`Setup()` minimalism.

### Can any of these libraries mock a static method or a sealed class?

Only JustMock, and only in its commercial edition using the .NET Profiling API. Moq, NSubstitute, FakeItEasy, and Rocks all rely on generating a proxy or implementation for an interface or virtual member - none of them can intercept a static call or a sealed class's non-virtual members, which is architecturally why JustMock exists as a distinct option in this space.

### Is Rocks actually production-ready, or just an interesting experiment?

It's used in production by teams that specifically value its compile-time, AOT-compatible architecture, but it has meaningfully less real-world adoption and community support than the four more established options here. Evaluate it seriously if Native AOT compatibility or compile-time-checked mocks are genuine requirements, but go in aware you're trading ecosystem maturity for those specific architectural benefits.

### Should I migrate my existing Moq test suite to another library?

Not automatically, and not without a concrete reason - a large, working Moq-based test suite represents real, sunk engineering investment, and migration is genuine work with its own risk of introducing bugs into your safety net. The more common and lower-risk pattern is defaulting new projects or new test files to an alternative while leaving an existing, functioning Moq suite in place, rather than a wholesale rewrite driven purely by trust concerns about a component that's no longer present in current versions.

### Does NSubstitute's lack of strict mocking matter in practice?

It depends on your team's testing philosophy. NSubstitute's default behavior - unconfigured calls succeed silently rather than throwing - means a test won't fail just because you forgot to configure an interaction, which some teams prefer for reducing brittle tests, while others specifically want strict mocking to catch unexpected interactions early. If strict-by-default matters to you, this is a concrete technical reason to lean toward Moq or FakeItEasy instead.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
