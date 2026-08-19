---
author: Steve Kaschimer
date: 2026-09-29
image: /images/posts/2026-09-29-hero.webp
image_alt: "Five columns of abstract organization glyphs positioned along a horizontal axis running from single-layer structure on the left to fully distributed on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: three stacked horizontal bars, a set of concentric rings with a small dot at the center, a single bordered card, a grid of bordered boxes each with its own small internal dot, and a loose cluster of separate connected nodes. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'single deployable' on the left to 'distributed' on the right, with a small glowing teal dot positioned at a different point under each column. A faint amber bracket spans two adjacent columns to suggest patterns composing rather than competing. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, robot faces, generic gears or lightbulb clip art."
layout: post.njk
site_title: Tech Notes
summary: "Layered, Clean, Vertical Slice, Modular Monolith, and Microservices all answer the same question differently. A practical breakdown of what each actually optimizes for, and which project profile fits."
tags: ["dotnet", "architecture", "microservices", "platform-engineering", "developer-productivity"]
title: "The Top 5 .NET Architecture Patterns Compared: Which One Should You Choose?"
---



Every .NET project eventually asks the same question: how should this codebase actually be organized? The honest answer is "it depends" - but that's not a satisfying place to leave a decision that gets harder to reverse the longer a project runs. Layered architecture, Clean Architecture, Vertical Slice Architecture, Modular Monolith, and Microservices all answer the organization question differently, and they're not five points on a single spectrum from "bad" to "good" - they're different trade-offs between structure, speed, and how much a system needs to scale organizationally, not just technically.

This guide breaks down what each pattern actually optimizes for, where it starts to strain, and which project profile it fits. A useful thing to know upfront: several of these aren't mutually exclusive. Vertical Slice Architecture and Clean Architecture can coexist inside a single module of a Modular Monolith, and a Modular Monolith is often the honest predecessor to Microservices rather than its opposite. This series continues with dedicated getting-started walkthroughs for each pattern in .NET.

## Quick Comparison

| Dimension | Layered (N-Tier) | Clean Architecture | Vertical Slice | Modular Monolith | Microservices |
| --- | --- | --- | --- | --- | --- |
| **Organizes code by** | Technical layer (UI, business, data) | Dependency direction, centered on domain | Feature/use case | Business capability module | Independently deployable service |
| **Deployment unit** | Single app | Single app | Single app | Single app | Many services |
| **Learning curve** | Lowest - most familiar | Moderate - more abstraction and ceremony | Low - maps directly to requests | Moderate - requires enforced boundaries | Highest - distributed systems complexity |
| **Change isolation** | Weak - a change often touches every layer | Good within the dependency rule | Excellent - one feature, one slice | Excellent between modules | Excellent between services |
| **Operational overhead** | Minimal | Minimal | Minimal | Minimal (still one deployable) | Significant (networking, observability, deployment) |
| **Best for** | Small apps, CRUD-heavy tools, learning projects | Domain-heavy apps needing long-term testability | Feature-heavy apps with independent use cases | Growing systems that need internal boundaries without distributed complexity | Large orgs needing independent scaling and deployment per team |

## Layered (N-Tier) Architecture

UI layer, business logic layer, data layer. Each depends on the one below. Nothing controversial here, it's how most production .NET code is actually organized.

Use it for small, CRUD-heavy apps where the question isn't "how do I organize complex business rules" but "how do I move data from the database to the screen and back." Familiar to every developer. No ceremony. No layer-spanning abstractions to reason about.

The catch: a single feature often touches all three layers. Business logic tends to get tangled with data access. As the app grows, the middle layer becomes a dumping ground with no natural boundaries. Not because the pattern is bad, but because it's the wrong fit for complexity that eventually shows up.

## Clean Architecture

The dependency rule: inward toward the domain. The domain knows nothing about EF Core, ASP.NET, or anything else. Business rules sit at the center, insulated.

Worth the ceremony when you have business complexity worth insulating, non-trivial rules, invariants, logic that changes independently of your framework or database. Swapping infrastructure is implementing an interface, not rewriting core logic. The domain layer is testable without any infrastructure present.

Cost: ceremony on simple features. A CRUD endpoint passes through several layers before touching a database. Project structure isn't self-explaining; dependency inversion is a concept to internalize. Related code for one use case can spread across projects.

## Vertical Slice Architecture

Organize by feature, not by layer. One feature = one slice. Endpoint, models, validation, logic, data access, all in one place. Add a feature, add a slice. No touching four existing layers.

Excellent change isolation. Modify or remove a feature without rippling across the codebase. Maps to how requests actually work. Works naturally with MediatR, each slice is a command or query handler.

Watch for duplication without a default shared layer. And this pattern doesn't enforce Clean Architecture's dependency rule by default, you add that discipline if your domain actually needs it, not because the pattern requires it.

## Modular Monolith

One deployable, many modules. Each module owns its domain, owns its data, communicates through narrow interfaces. Boundaries enforced structurally, not just by convention.

You get most of the Microservices benefit, real ownership, isolation, independent change, without operational overhead of distributed systems. Each module can use whatever fits internally (Clean Architecture in one, Vertical Slice in another). And it's a credible path toward Microservices later, if module boundaries translate to service boundaries.

Boundaries require discipline: project references that make it a compile error to cross, architecture tests that fail the build on violations. Without enforcement, it drifts. Still one release cadence, one fault domain, you can't scale one module independently without splitting services.

## Microservices

Each service owns its data, deploys independently, communicates over the network. Multiple teams can ship on different cadences without blocking each other. One service down doesn't take the whole system with it. A service can use a different tech stack, database, scaling profile suited to what it actually does.

And then: network calls where method calls used to be. Eventual consistency where transactions used to be. Observability, retries, failure handling all need deliberate design. Service discovery, deployment pipelines per service, distributed tracing. Operational overhead most monoliths don't have.

Don't use this until you actually need it. Multiple teams with independent deployment needs is a real need. Premature adoption is one of the most common architecture mistakes in the industry.

## How to Decide

A few heuristics that cover most real-world decisions:

**Building something small, short-lived, or genuinely CRUD-shaped?** Layered architecture is not a compromise here - it's the right amount of structure for the problem.

**Domain has real business complexity you want protected from infrastructure churn?** Clean Architecture's dependency rule earns its ceremony when there's actually business logic worth insulating.

**Application is mostly a collection of largely independent features?** Vertical Slice Architecture keeps each feature's blast radius contained and makes the codebase easy to navigate feature-by-feature.

**System is growing past what a single mental model can hold, but you're not ready for distributed systems overhead?** A Modular Monolith gets you real internal boundaries while staying one deployable, and it's a credible path toward Microservices later if you need it.

**Multiple teams need independent deployment and scaling, and you can justify the operational investment?** Microservices solve an organizational problem as much as a technical one - make sure that's the problem you actually have.

None of these are permanent, either - a common and often underrated path is Vertical Slice or Clean Architecture inside a Modular Monolith, evolving specific modules into standalone services only once a concrete scaling or team-ownership need actually shows up, rather than architecting for that need speculatively from day one.

## Frequently Asked Questions

### Are Clean Architecture and Vertical Slice Architecture mutually exclusive?

No. They answer different questions - Vertical Slice Architecture organizes what code lives together (by feature), while Clean Architecture governs how dependencies point (inward, toward the domain). A vertical slice can still keep its business logic free of direct infrastructure dependencies; the two patterns compose more often than they compete.

### Is a Modular Monolith just a Microservices system that hasn't been split up yet?

Not quite, but the framing is useful. A Modular Monolith is a legitimate, complete architecture in its own right - not merely an unfinished Microservices migration. Many systems stay modular monoliths indefinitely because the operational cost of splitting into services never gets justified by an actual organizational need. That said, well-enforced module boundaries do make a later split meaningfully easier if that need eventually arises.

### Should I start a new project with Microservices?

Usually not. Microservices solve problems around independent team ownership, deployment, and scaling that most new projects don't have yet. Starting with a Modular Monolith or Vertical Slice Architecture and evolving toward services once a concrete need appears is generally lower-risk than architecting for distributed systems complexity speculatively.

### Which pattern is easiest to migrate away from later?

Vertical Slice Architecture and a well-bounded Modular Monolith both tend to migrate cleanly, because they already organize code around cohesive units (features or modules) rather than cross-cutting technical layers. Layered architecture is typically the hardest to migrate away from, since business logic and data access tend to be entangled across the whole codebase rather than isolated by feature or module.

### Can I use more than one of these patterns in the same codebase?

Yes, and it's common in practice. A Modular Monolith might use Clean Architecture inside one complex module and Vertical Slice Architecture inside a simpler one. What matters is that the choice is deliberate per module rather than applying maximum ceremony everywhere or minimum structure everywhere regardless of actual complexity.

### Does choosing Clean Architecture or Vertical Slice Architecture affect my choice of ORM or database?

Not fundamentally, though the patterns influence how that dependency is structured. Clean Architecture pushes data access behind an interface defined in the domain or application layer, so the domain doesn't reference EF Core directly. Vertical Slice Architecture is more relaxed about this by default, often allowing a slice to talk to the database directly for simplicity, with abstraction added deliberately only where a specific slice needs it.

### How do I know when a Modular Monolith's boundaries are actually being enforced, versus just aspirational?

Enforcement needs to be structural, not just cultural - project references that make it a compile error for one module to reach into another's internals, and increasingly, automated architecture tests that fail a build when a boundary is violated. If the only thing stopping cross-module coupling is code review vigilance, the boundaries will erode as the team and codebase grow.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
