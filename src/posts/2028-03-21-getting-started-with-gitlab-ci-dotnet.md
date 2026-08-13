---
author: Steve Kaschimer
date: 2028-03-21
image: /images/posts/2028-03-21-hero.webp
image_alt: "An all-in-one platform glyph combining a pipeline, a shield, and a repo icon in one continuous shape with no seams, implying source control, CI, and security scanning as a single product."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a single continuous shape that smoothly combines a pipeline outline, a small shield, and a repository icon, with no visible seams or connecting lines between the three, implying all three are genuinely one platform rather than separately joined tools. Mood is consolidated, complete, and unified. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "GitLab CI's single-file, single-platform philosophy means your .gitlab-ci.yml sits inside the same product that hosts the repo, runs security scans, and tracks issues. A setup guide for stages/rules, cache keys, and the built-in dependency and container scanning templates."
tags: ["dotnet", "ci-cd", "devops", "security", "tooling"]
title: "Getting Started with GitLab CI for .NET"
---

GitLab CI's single-file, single-platform philosophy means your `.gitlab-ci.yml` isn't just a build pipeline - it's sitting inside the same product that hosts your repo, runs your security scans, and tracks your issues. That consolidation is the whole pitch, and it changes the setup calculus a little: the interesting parts of a GitLab CI setup for .NET aren't just build/test/deploy, but wiring up the built-in dependency and container scanning that GitHub Actions or Azure DevOps would need a separate tool for.

This guide covers setting up a GitLab CI pipeline for .NET, bootstrapping caching and multi-stage pipelines, the core patterns for build/test/deploy plus GitLab's built-in security scanning, and the best practices that take advantage of the consolidated platform rather than treating GitLab CI as a standalone build tool. By the end you'll have a pipeline that builds, tests, and scans your .NET application in one coherent configuration.

If you're deciding between CI/CD platforms first, [a comparison of the top CI/CD platforms for .NET](/posts/2028-02-29-top-5-cicd-platforms-dotnet-compared/) covers where GitLab CI fits relative to GitHub Actions, Azure DevOps, TeamCity, and Jenkins.

## What You'll Need

- A GitLab repository (GitLab.com or self-managed)
- No local installation required - pipelines run on GitLab's shared runners or your own configured runners

## Your First Pipeline

```yaml
# .gitlab-ci.yml
image: mcr.microsoft.com/dotnet/sdk:8.0

stages:
  - build
  - test

build:
  stage: build
  script:
    - dotnet restore
    - dotnet build --configuration Release --no-restore

test:
  stage: test
  script:
    - dotnet test --configuration Release
```

GitLab CI's structure centers on `stages` (the pipeline's phases) and jobs assigned to each stage - conceptually similar to GitHub Actions' jobs and Azure DevOps' stages, expressed through GitLab's own YAML vocabulary. The `image` directive specifies the container the job runs in, using the official .NET SDK image directly.

## Bootstrapping the Ideal Environment

### Cache NuGet packages

```yaml
variables:
  NUGET_PACKAGES: '$CI_PROJECT_DIR/.nuget/packages'

cache:
  key:
    files:
      - '**/packages.lock.json'
  paths:
    - .nuget/packages

build:
  stage: build
  script:
    - dotnet restore
    - dotnet build --configuration Release --no-restore
```

Keying the cache off your lock files means it correctly invalidates when dependencies change - the same principle as GitHub Actions' `cache-dependency-path` or Azure DevOps' `Cache@2` key, expressed through GitLab's cache configuration.

### Multi-stage pipeline with deploy

```yaml
stages:
  - build
  - test
  - deploy

deploy_production:
  stage: deploy
  image: mcr.microsoft.com/dotnet/sdk:8.0
  script:
    - dotnet publish -c Release -o publish
    - echo "Deploying to production"
  environment:
    name: production
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

`rules` controls when a job runs - here, deployment only triggers on pushes to `main`, the same conditional-trigger concept as GitHub Actions' branch filters or Azure DevOps' trigger configuration. `environment` enables GitLab's environment tracking and, combined with protected environment settings, approval gating.

### Enable built-in dependency and container scanning

```yaml
include:
  - template: Security/Dependency-Scanning.gitlab-ci.yml
  - template: Security/Container-Scanning.gitlab-ci.yml
```

This is the concrete payoff of GitLab's consolidated platform - including these templates adds dependency vulnerability scanning and container image scanning directly into your pipeline, without integrating a separate third-party tool the way you would on GitHub Actions or Azure DevOps.

### Configure protected environments for deployment approval

**Settings → CI/CD → Protected environments**: restrict who can deploy to a given environment and optionally require approval before a deployment job runs - GitLab's equivalent of GitHub Actions' required reviewers or Azure DevOps' environment approval checks.

## Core Workflow

- **Use `rules` to control exactly when jobs run**, keeping deploy jobs scoped to the right branch or tag rather than running on every pipeline trigger.
- **Include GitLab's security scanning templates rather than integrating separate third-party scanners**, taking advantage of the platform consolidation that's GitLab CI's core differentiator.
- **Use `cache` keyed to your dependency lock files** for the same NuGet restore time savings every platform in this comparison benefits from.

## Verifying Your Setup

1. **Caching reduces restore time on subsequent runs** - compare cached vs. uncached pipeline duration
2. **Deploy jobs only trigger on the intended branch/tag** - confirm `rules` correctly scope deployment
3. **Security scanning templates run and report findings** - confirm dependency and container scanning jobs appear in the pipeline and produce results in the Security dashboard
4. **Protected environment approval gates work correctly** - confirm a deployment to a protected environment requires approval before proceeding

## Best Practices

**Take advantage of GitLab's built-in security scanning rather than reaching for a separate tool.** This is the platform's clearest differentiator versus GitHub Actions or Azure DevOps - underusing it means paying for consolidation without getting its actual benefit.

**Use `rules` deliberately to scope jobs to the right triggers.** The same discipline that applies to any CI/CD platform - don't let deploy jobs run on every push by accident.

**Cache dependencies keyed to lock files, not a static key.** A static cache key risks serving stale dependencies after a real dependency change; keying off the lock file content ensures correct invalidation.

**Use protected environments and required approvals for production deployments.** The same enforced human checkpoint concept every platform in this comparison supports, configured through GitLab's environment protection settings.

**If you're evaluating GitLab CI specifically, evaluate the broader platform consolidation, not just the CI/CD syntax.** Its real value proposition is repos, CI, and security scanning together - adopting it purely for CI/CD syntax preferences undersells (and under-delivers on) what it's actually built for.

## Comparison with GitHub Actions

| | GitLab CI | GitHub Actions |
| --- | --- | --- |
| Platform scope | Repos, CI/CD, security scanning, planning, all-in-one | CI/CD tightly coupled to GitHub repos |
| Built-in security scanning | Yes, via included templates | Requires separate tools/actions |
| YAML structure | `stages`/jobs with `rules` | `on`/`jobs` with `uses`/`run` |
| Repo requirement | GitLab | GitHub |
| Community/.NET examples | Smaller than GitHub Actions | Larger, broader marketplace |

If you're specifically drawn to GitLab CI's built-in security scanning, that's a genuine, concrete reason to consider it over stitching a scanner into GitHub Actions - but it comes with the broader platform commitment of moving source control to GitLab, not just a CI/CD syntax change.

## Frequently Asked Questions

### Do I need to host my code on GitLab to use GitLab CI?

For the tightest, most native experience, yes - GitLab CI is built around GitLab-hosted repositories, unlike Azure DevOps which comfortably supports GitHub-hosted repos as well. This is a meaningfully bigger platform decision than choosing a CI/CD tool alone.

### What's GitLab CI's biggest advantage over GitHub Actions specifically?

Built-in security scanning (dependency scanning, container scanning, SAST/DAST) included directly via template files, without integrating a separate third-party tool. This is a genuine, concrete differentiator, not just a stylistic difference in YAML syntax.

### How do I control which branch a deployment job runs on?

Use `rules` with a condition like `if: '$CI_COMMIT_BRANCH == "main"'`, GitLab CI's mechanism for conditionally including a job in a given pipeline run - functionally similar to GitHub Actions' branch filters on triggers.

### How does caching work in GitLab CI compared to GitHub Actions?

Both key a cache off file contents to ensure correct invalidation - GitLab CI's `cache: key: files:` pointing at your lock file, GitHub Actions' `cache-dependency-path` doing the equivalent. The underlying goal (avoid re-downloading unchanged dependencies) and mechanism (content-based cache keys) are the same across platforms.

### Can I require approval before a production deployment in GitLab CI?

Yes, via Protected Environments (**Settings → CI/CD → Protected environments**), which can restrict who can deploy and require approval before a deployment job proceeds - the same enforced human checkpoint concept as GitHub Actions' required reviewers or Azure DevOps' approval checks.

### Is GitLab CI harder to learn if I already know GitHub Actions?

The core concepts (stages/jobs, conditional triggers, caching, environments) map closely between the two, so the learning curve is moderate rather than steep - mostly a matter of adjusting to GitLab's specific YAML vocabulary (`rules` instead of trigger filters, `stages` instead of GitHub's implicit job ordering via `needs`).

### What's the most common mistake in a first GitLab CI setup for .NET?

Not taking advantage of the built-in security scanning templates, missing the platform's clearest differentiator and effectively using GitLab CI as if it were a standalone build tool. The second common mistake is using a static cache key instead of one tied to lock file contents, risking stale cached dependencies after a real change.
