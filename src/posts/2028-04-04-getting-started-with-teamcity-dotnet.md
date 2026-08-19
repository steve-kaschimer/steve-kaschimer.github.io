---
author: Steve Kaschimer
date: 2028-04-04
image: /images/posts/2028-04-04-hero.webp
image_alt: "A build-chain glyph shown as several small connected nodes branching and rejoining, with two independent branches merging into a single dependent node representing parallel builds gating a downstream stage."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small network of connected nodes: two independent branches on the left running in parallel, each a short chain of two nodes, converging into a single downstream node on the right that only lights up once both branches complete. Mood is orchestrated, precise, and enterprise-grade. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "TeamCity's build configuration UI is a genuinely good way to learn the concepts, but the moment there's more than one project, Kotlin DSL is the real setup decision. A setup guide for version-controlled pipeline configuration and genuine multi-project build chains."
tags: ["dotnet", "ci-cd", "devops", "tooling"]
title: "Getting Started with TeamCity for .NET"
---



TeamCity's build configuration UI is where most people start, and it's a genuinely good way to learn the concepts - but the moment you have more than one project, the thing that actually matters is Kotlin DSL: version-controlled, code-based pipeline definitions instead of UI-configured settings that live only in TeamCity's own database. That's the real setup decision this guide centers on, since it's what determines whether your TeamCity configuration is reviewable, diffable, and portable, or a black box only reproducible by clicking through the same UI steps again.

This guide covers setting up a TeamCity build configuration for .NET using both the UI and Kotlin DSL, bootstrapping build chains for multi-project solutions, the core patterns for dependency management between builds, and the best practices that take advantage of what TeamCity specifically does well - sophisticated build orchestration - without treating it like a simpler YAML-based CI tool. By the end you'll have version-controlled pipeline configuration and a real build chain, not just a single linear job.

If you're deciding between CI/CD platforms first, [a comparison of the top CI/CD platforms for .NET](/posts/2028-02-29-top-5-cicd-platforms-dotnet-compared/) covers where TeamCity fits relative to GitHub Actions, Azure DevOps, GitLab CI, and Jenkins.

## What You'll Need

- A TeamCity server (cloud or self-hosted) and at least one build agent
- A repository TeamCity can access (GitHub, GitLab, Azure Repos, or any Git-compatible host - TeamCity is repo-agnostic)

## Your First Build Configuration (via UI)

In the TeamCity UI: **Create Project → connect your repository → Create build configuration**, then add build steps:

1. **.NET Restore**: `dotnet restore`
2. **.NET Build**: `dotnet build --configuration Release --no-restore`
3. **.NET Test**: `dotnet test --configuration Release --no-build`

TeamCity auto-detects common project structures and can suggest build steps automatically when connecting a .NET repository, though reviewing and adjusting the detected steps is worth doing rather than accepting them blindly.

## Bootstrapping the Ideal Environment

### Switch to Kotlin DSL for version-controlled configuration

```kotlin
// .teamcity/settings.kts
import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.buildSteps.script

version = "2024.03"

project {
    buildType(BuildAndTest)
}

object BuildAndTest : BuildType({
    name = "Build and Test"

    steps {
        script {
            name = "Restore"
            scriptContent = "dotnet restore"
        }
        script {
            name = "Build"
            scriptContent = "dotnet build --configuration Release --no-restore"
        }
        script {
            name = "Test"
            scriptContent = "dotnet test --configuration Release --no-build"
        }
    }

    triggers {
        vcs {}
    }
})
```

This is the equivalent of GitHub Actions' `.github/workflows/*.yml` or GitLab's `.gitlab-ci.yml` - your build configuration as code, committed alongside your application, reviewable in pull requests, and reproducible without manually reconstructing UI settings. TeamCity can generate this DSL from an existing UI-configured build as a starting point, which is a practical way to migrate from UI-first to DSL-first configuration.

### Cache NuGet packages

```kotlin
steps {
    script {
        name = "Restore"
        scriptContent = "dotnet restore --packages %teamcity.build.checkoutDir%/.nuget"
    }
}

requirements {
    // Ensure builds land on agents with a warm NuGet cache when possible
}
```

TeamCity's caching approach differs from GitHub Actions' or GitLab's explicit cache actions - it more commonly relies on agent-level persistence (the same build agent retaining its NuGet cache directory across runs) combined with directing `dotnet restore` at a consistent local packages directory.

### Build a build chain for multi-project solutions

```kotlin
project {
    buildType(BuildCore)
    buildType(BuildApi)
    buildType(RunIntegrationTests)

    buildType(RunIntegrationTests) {
        dependencies {
            snapshot(BuildCore) {}
            snapshot(BuildApi) {}
        }
    }
}
```

This is TeamCity's signature strength - a genuine build chain where `RunIntegrationTests` depends on both `BuildCore` and `BuildApi` completing successfully, letting TeamCity parallelize independent builds and only proceed to dependent stages once prerequisites are satisfied. This kind of dependency graph is more explicit and sophisticated here than the linear or simply-nested job dependencies in GitHub Actions or GitLab CI.

### Configure deployment with approval

```kotlin
object DeployProduction : BuildType({
    name = "Deploy to Production"

    steps {
        script {
            scriptContent = "echo Deploying to production"
        }
    }

    dependencies {
        snapshot(BuildAndTest) {}
    }

    // Manual trigger only, rather than automatic VCS trigger
})
```

Omitting a `triggers { vcs {} }` block means this build configuration only runs when manually triggered - TeamCity's equivalent of an approval gate, since a human has to explicitly initiate the deployment run rather than it firing automatically.

## Core Workflow

- **Use Kotlin DSL for anything beyond a single, simple project.** The version-control and review benefits compound as your configuration grows - UI-only configuration becomes a real liability at scale.
- **Model genuine build dependencies as a build chain**, taking advantage of TeamCity's parallelization and dependency-ordering strength rather than flattening everything into one linear sequence.
- **Use manual triggers (omitting automatic VCS triggers) for deployment configurations** that need a human decision point before running.

## Verifying Your Setup

1. **Kotlin DSL configuration matches what's actually running** - confirm changes to `.teamcity/settings.kts` correctly update the build configuration when TeamCity syncs
2. **Build chains execute in the correct order and parallelize where possible** - confirm dependent builds wait for their prerequisites, and independent builds run concurrently
3. **NuGet restore is taking advantage of agent-level caching** - compare build times across consecutive runs on the same agent
4. **Manual-trigger deployment configurations don't run automatically** - confirm a deployment configuration without a VCS trigger only executes when explicitly started

## Best Practices

**Move to Kotlin DSL early, even for a single project.** The migration cost only grows the longer configuration lives purely in the UI - TeamCity can generate DSL from existing UI configuration, making this a reasonable first step rather than a from-scratch effort.

**Model real build dependencies as an explicit build chain**, not a single flattened sequence of steps. This is TeamCity's core differentiator - underusing it means paying for capability you're not benefiting from.

**Use manual triggers deliberately for anything requiring a human decision point**, the same principle as required reviewers in GitHub Actions or approval gates in Azure DevOps, expressed through TeamCity's trigger configuration instead.

**Take advantage of agent requirements and pools if you have varied build needs** (Windows vs. Linux, different hardware profiles) - this is part of what self-hosted control buys you that a purely cloud-hosted platform doesn't offer as flexibly.

**Review generated Kotlin DSL from UI-configured builds before committing it**, since auto-generated DSL can be more verbose than a hand-written equivalent - clean it up for long-term maintainability rather than committing the raw generated output unexamined.

## Comparison with GitHub Actions

| | TeamCity | GitHub Actions |
| --- | --- | --- |
| Configuration | Kotlin DSL (code) or UI | YAML |
| Build orchestration | Sophisticated build chains, explicit dependency graphs | Job dependencies via `needs`, less elaborate |
| Hosting | Self-hosted or cloud | Cloud (GitHub-hosted or self-hosted runners) |
| Repo coupling | Repo-agnostic | Tightest with GitHub |
| Cost model | License-based | Free tier + usage-based |

TeamCity's build chain sophistication is worth the switch specifically for complex, multi-project .NET solutions with real dependency ordering needs - for a simple, single-project pipeline, GitHub Actions' YAML is typically less overhead to set up and maintain.

## Frequently Asked Questions

### Should I configure TeamCity through the UI or Kotlin DSL?

Kotlin DSL, for anything beyond a quick single-project evaluation. UI configuration lives only in TeamCity's own database, isn't reviewable in a pull request, and isn't reproducible without manually clicking through the same steps again - DSL gives you version-controlled, code-based configuration comparable to what GitHub Actions or GitLab CI provide by default through YAML.

### What's a build chain, and why does TeamCity emphasize it more than other platforms?

A build chain is an explicit dependency graph between separate build configurations - one build (or several, run in parallel) completing successfully before a dependent build starts. TeamCity's snapshot dependencies make this a first-class, sophisticated feature, well suited to complex multi-project .NET solutions where the build ordering genuinely matters, more so than the simpler linear or lightly-nested job dependencies most YAML-based CI tools offer.

### How does TeamCity handle NuGet package caching?

Typically through agent-level persistence - the same build agent retaining its local NuGet packages directory across consecutive runs, combined with directing `dotnet restore` at a consistent local path. This differs from GitHub Actions' or GitLab's explicit, per-run cache actions, relying instead on the self-hosted (or persistent cloud) agent's own file system state.

### Can I migrate an existing UI-configured TeamCity project to Kotlin DSL?

Yes - TeamCity can generate Kotlin DSL from an existing UI-configured build configuration, giving you a starting point to review, clean up, and commit to version control rather than writing the DSL entirely from scratch.

### Is TeamCity worth it if I only have one simple .NET project?

Probably not the first choice - its strengths (build chains, sophisticated dependency management, self-hosted control) matter most for complex, multi-project solutions. A single simple project is usually served just as well, with less setup overhead, by GitHub Actions or another YAML-based CI tool.

### How do I add an approval gate before a TeamCity deployment?

Omit an automatic VCS trigger from the deployment build configuration, so it only runs when manually started - this is TeamCity's approach to requiring a human decision point, functionally similar to GitHub Actions' required reviewers or Azure DevOps' approval checks, though implemented differently.

### What's the most common mistake in a first TeamCity setup for .NET?

Configuring everything through the UI without migrating to Kotlin DSL, leaving build configuration unreviewable and hard to reproduce as the project grows. The second common mistake is not modeling genuine build dependencies as an actual build chain, missing TeamCity's core differentiating strength and using it as if it were a simpler, linear CI tool.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
