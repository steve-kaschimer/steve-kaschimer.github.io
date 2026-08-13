---
author: Steve Kaschimer
date: 2028-03-07
image: /images/posts/2028-03-07-hero.webp
image_alt: "A small pipeline glyph fused directly into a repo-shaped outline with no visible gap, a locked shield badge tucked at the seam representing SHA pinning and OIDC."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a thin pipeline glyph fused seamlessly into a repository-shaped outline, no visible boundary between them, implying zero friction between code host and build. A small amber shield badge sits right at the seam, marking a deliberate security checkpoint (SHA pinning, OIDC) layered onto the otherwise frictionless connection. Mood is native, fast, and quietly disciplined. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "A working GitHub Actions build-and-test workflow takes about ten lines, which is exactly why the real setup work lives elsewhere. A setup guide for caching NuGet correctly, pinning actions to a commit SHA, and using OIDC instead of long-lived cloud credentials."
tags: ["dotnet", "ci-cd", "devops", "tooling"]
title: "Getting Started with GitHub Actions for .NET"
---

GitHub Actions' YAML syntax is simple enough that a working .NET build-and-test workflow takes about ten lines, which is exactly why the real setup work lives elsewhere: caching NuGet packages correctly, pinning actions to a commit SHA rather than a mutable tag, and using OIDC instead of long-lived cloud credentials for deployment. None of these are hard, but none of them are the default either - a workflow that "just builds" and one that's actually fast, secure, and production-ready look almost identical until you know what to add.

This guide covers setting up a GitHub Actions workflow for .NET, bootstrapping caching and matrix builds for real project needs, the core CI and CD patterns including OIDC-based Azure deployment, and the security practices that matter specifically for GitHub Actions. By the end you'll have a pipeline that's fast on every run, not just the first one, and secure by deliberate configuration rather than by luck.

If you're deciding between CI/CD platforms first, [a comparison of the top CI/CD platforms for .NET](/posts/2028-02-29-top-5-cicd-platforms-dotnet-compared/) covers where GitHub Actions fits relative to Azure DevOps, GitLab CI, TeamCity, and Jenkins.

## What You'll Need

- A GitHub repository containing your .NET solution
- No local installation required - workflows run on GitHub's infrastructure (or self-hosted runners you configure separately)

## Your First Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: '8.0.x'

      - run: dotnet restore
      - run: dotnet build --no-restore -c Release
      - run: dotnet test --no-build -c Release
```

This is a complete, working CI pipeline - it triggers on pushes and pull requests to `main`, restores, builds, and tests. Everything from here is about making it fast, secure, and production-ready.

## Bootstrapping the Ideal Environment

### Cache NuGet packages

```yaml
- uses: actions/setup-dotnet@v4
  with:
    dotnet-version: '8.0.x'
    cache: true
    cache-dependency-path: '**/packages.lock.json'
```

Without caching, every run re-downloads every NuGet package from scratch - a real, avoidable time cost on every single build. `cache-dependency-path` pointing at your lock files means the cache correctly invalidates when dependencies actually change, rather than serving stale packages.

### Matrix builds for multiple target frameworks or OSes

```yaml
jobs:
  build-and-test:
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        dotnet-version: ['8.0.x', '9.0.x']
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: ${{ matrix.dotnet-version }}
      - run: dotnet test
```

A matrix runs the same job across every combination of the defined dimensions - useful for confirming your application works correctly across multiple .NET versions or operating systems without duplicating the workflow definition for each.

### Pin actions to a full commit SHA, not a mutable tag

```yaml
# Instead of this:
- uses: actions/checkout@v4

# Do this, for anything security-sensitive:
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
```

A tag like `@v4` can be silently repointed to different code by the action's maintainer - pinning to a full SHA guarantees you're running exactly the code you reviewed. This matters most for third-party actions with write access to secrets or deployment credentials; official GitHub-maintained actions are lower risk but pinning remains best practice broadly.

### Use OIDC instead of static credentials for cloud deployment

```yaml
permissions:
  id-token: write
  contents: read

steps:
  - uses: actions/checkout@v4
  - uses: azure/login@v2
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

This authenticates to Azure using OpenID Connect - a short-lived token issued per workflow run - rather than a long-lived service principal secret stored as a static credential. No secret to rotate, no static credential that could leak and remain valid indefinitely.

### Apply least-privilege permissions

```yaml
permissions:
  contents: read
  pull-requests: write # only if the workflow needs to comment on PRs
```

Setting `permissions` explicitly at the workflow or job level restricts what the automatically-provided `GITHUB_TOKEN` can actually do - default permissions are broader than most workflows need, and scoping them down limits the blast radius if a workflow is ever compromised.

## Core Workflow

- **Separate CI (build/test on every push and PR) from CD (deploy on merge to main or a tag).** Use `on: push: branches: [main]` for CD triggers specifically, keeping deployment from firing on every feature branch push.
- **Use environments with required reviewers for production deployments**, adding a manual approval gate before anything deploys to a sensitive target.
- **Publish test results and code coverage as workflow artifacts or PR annotations**, so failures are visible directly in the pull request rather than requiring someone to dig through raw logs.

```yaml
deploy:
  needs: build-and-test
  runs-on: ubuntu-latest
  environment: production
  steps:
    - run: echo "Deploying to production"
```

## Verifying Your Setup

1. **Caching is actually reducing build time** - compare a cached run's duration against an uncached one; a meaningful difference confirms the cache is working
2. **Matrix builds cover the combinations you actually need** - confirm all defined OS/version combinations run and report results independently
3. **OIDC authentication succeeds without a static secret** - confirm cloud deployment steps authenticate correctly using only the configured `id-token: write` permission and federated credential setup
4. **Pinned actions still resolve correctly** - confirm SHA-pinned actions run without error, and periodically review whether newer versions need to be adopted (SHA pinning means you control updates explicitly, not automatically)

## Best Practices

**Pin third-party actions to a full commit SHA, especially anything with access to secrets.** This is a real, actively recommended security practice, not excessive caution - a compromised or malicious action update is a genuine supply-chain risk.

**Use OIDC for cloud authentication instead of long-lived static credentials wherever the target platform supports it.** Azure, AWS, and GCP all support OIDC federation with GitHub Actions - there's little reason to still be storing static cloud credentials as repository secrets.

**Cache NuGet packages (and any other slow, deterministic dependency restore) by default.** The time savings compound across every single workflow run, for a small amount of one-time configuration.

**Scope `GITHUB_TOKEN` permissions explicitly at the workflow or job level.** Default permissions are broader than most workflows need - least privilege here meaningfully reduces the impact of a compromised workflow or action.

**Use required reviewers on GitHub Environments for production deployments.** This adds a genuine, enforced human gate before anything reaches a sensitive target, without adding friction to the CI portion of the pipeline.

## Comparison with Azure DevOps

| | GitHub Actions | Azure DevOps |
| --- | --- | --- |
| Repo coupling | Tightest with GitHub | Tightest with Azure Repos, works with GitHub too |
| Windows build cost | Standard GitHub-hosted pricing | Often cheapest for Windows-heavy workloads |
| Azure deployment integration | Strong via OIDC and azure/login | Deepest, most native |
| Governance for complex enterprise needs | Requires GitHub Enterprise | Strong out of the box |

If you're already committed to GitHub Actions but deploying heavily to Azure, the OIDC-based `azure/login` pattern above gets you most of Azure DevOps' native deployment convenience without switching platforms.

## Frequently Asked Questions

### Why should I pin actions to a commit SHA instead of a version tag?

A version tag like `@v4` can be repointed by the action's maintainer to different code at any time - either accidentally or, in a supply-chain attack scenario, maliciously. Pinning to a full commit SHA guarantees the exact code you reviewed is what actually runs, which matters most for any action with access to secrets or deployment credentials.

### What's OIDC, and why is it better than storing cloud credentials as secrets?

OIDC (OpenID Connect) lets your workflow authenticate to a cloud provider using a short-lived, per-run token instead of a long-lived static credential stored as a repository secret. There's no secret to rotate or accidentally leak that would remain valid indefinitely - the federated trust relationship is configured once, and tokens are issued fresh for each workflow run.

### How do I speed up slow GitHub Actions builds for .NET?

Enable NuGet caching via `actions/setup-dotnet`'s built-in `cache: true` option, use `--no-restore` and `--no-build` flags on subsequent steps to avoid redundant work, and consider self-hosted runners for genuinely heavy workloads where standard GitHub-hosted runner performance is a real bottleneck.

### What's the difference between CI and CD in a GitHub Actions workflow?

CI (continuous integration) typically runs on every push and pull request - build, test, lint. CD (continuous deployment/delivery) typically triggers on merges to a specific branch or tag creation, and actually deploys the application. Keeping these as distinct jobs or workflows, gated by different triggers, prevents deployment from firing on every feature-branch push.

### How do I require manual approval before a production deployment?

Use GitHub Environments with required reviewers configured on the "production" environment - a job targeting that environment will pause and wait for an approved reviewer before proceeding, giving you an enforced human gate without needing a separate approval tool.

### Can I run GitHub Actions workflows on my own infrastructure instead of GitHub-hosted runners?

Yes - self-hosted runners let you run workflows on infrastructure you control, useful for specific hardware needs, cost optimization at scale, or network access requirements that GitHub-hosted runners can't satisfy. Setup involves registering your own runner with the repository or organization.

### What's the most common mistake in a first GitHub Actions setup for .NET?

Not caching NuGet packages, leaving every run to redundantly re-download the same dependencies. The second common mistake is storing static cloud credentials as secrets instead of using OIDC, and not pinning third-party actions to a SHA, both of which are genuine, actively-discussed security gaps rather than theoretical concerns.
