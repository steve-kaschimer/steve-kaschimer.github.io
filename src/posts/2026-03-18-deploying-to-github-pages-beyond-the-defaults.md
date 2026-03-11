---
author: Steve Kaschimer
date: 2026-03-18
image: /images/posts/2026-03-18-hero.png
image_prompt: "A clean, technical illustration in a dark-mode editorial style — near-black background with electric blue, green, and cool white accents. The composition shows a three-stage pipeline rendered as a horizontal flow: a leftmost box labeled 'build' with a gear icon and a small caching layer symbol below it, connected by a clean arrow to a center box labeled 'upload artifact' with a sealed container icon, connected by another arrow to a rightmost box labeled 'deploy' with a shield and a padlock — the shield carries a faint OIDC token badge in electric blue. Below the pipeline, a slim horizontal band shows a GitHub Environment gate: a human silhouette with a checkmark and the word 'Approved' in green. The bottom of the image carries faint ghost-text YAML — just legible enough to read 'permissions: id-token: write' and 'environment: github-pages'. Mood: the satisfaction of a pipeline that is both fast and actually secure — engineered, not cobbled together. Avoid: generic cloud logos, circuit-board textures, lock clipart, any specific company branding."
layout: post.njk
site_title: Tech Notes
summary: The default GitHub Pages workflow skips caching, leaks artifacts, and has no deployment gate — this post rebuilds it from scratch with OIDC authentication, npm caching, and a reviewer-gated GitHub Environment.
tags: ["github-actions", "eleventy", "ci-cd"]
title: "Deploying to GitHub Pages with GitHub Actions: Beyond the Defaults"
---

Most tutorials for deploying to GitHub Pages start with `peaceiris/actions-gh-pages` or the GitHub UI's auto-generated workflow. Both work. Neither is production-grade. The problems are predictable: every run reinstalls all npm packages from scratch, build artifacts persist indefinitely against your storage quota, and the site goes live on every push to `main` with no human gate between "CI passed" and "it's in front of users."

The official `actions/deploy-pages` action — introduced in 2022 and now the GitHub-recommended approach — solves most of this. But using it correctly means understanding OIDC token authentication, the artifact lifecycle, and how GitHub Environments create a reviewable deployment gate. This post builds the full production pipeline, step by step, for an Eleventy + Tailwind CSS site.

---

## What the Default Workflow Gets Wrong

Before the fix, the failure list:

- **No caching**: every run reinstalls all npm packages from scratch, adding 60–90 seconds to every deploy
- **Broad token permissions**: classic `GITHUB_TOKEN`-based deploys grant write access to the entire repository context; OIDC-based deployment scopes that to the Pages deployment specifically
- **No environment protection**: the site deploys directly on every push to `main` — no reviewer gate, no way to stop a bad deploy before it goes live
- **Artifact leakage**: `actions/upload-pages-artifact` defaults to a 90-day retention window; a blog with daily publishing accumulates artifacts fast against your GitHub storage quota
- **`gh-pages` branch pollution**: the `peaceiris` approach writes a separate `gh-pages` branch — another moving part to maintain, rebase on, and reason about when something goes wrong

***

## The Build This Pipeline Serves

This blog — and the workflow in this post — runs on a specific stack. If you're on the same one, you can drop this directly into your repo.

- **Eleventy v2** (`@11ty/eleventy`) — static site generator, outputs to `_site/`
- **Tailwind CSS v3** (`tailwindcss`) — utility-first CSS, built as a separate step
- **`npm-run-all`** — used to run Eleventy and Tailwind in parallel during development (`npm run dev`), sequentially for production

The relevant scripts from `package.json`:

```json
{
  "scripts": {
    "build": "npx @11ty/eleventy",
    "build:css": "npx tailwindcss -i ./src/styles/input.css -o ./_site/styles/output.css --minify",
    "deploy": "npm run build && npm run build:css"
  }
}
```

The `deploy` script runs `build` first, then `build:css`. Order matters here: Eleventy creates the `_site/` directory, and `build:css` writes its output directly into `_site/styles/`. Running them in parallel with `npm-run-all --parallel` risks a race condition where Tailwind tries to write before `_site/` exists. The `deploy` script gets this right — use it instead of calling the steps individually.

***

## Step 1: Configure GitHub Pages to Use the Actions Source

Before any workflow will work, GitHub Pages must be configured to deploy from GitHub Actions rather than from a branch. The default is branch-based (`gh-pages`), and `actions/deploy-pages` silently does nothing if you've left it there.

Go to **Repository Settings → Pages → Build and deployment → Source** and select **GitHub Actions**.

That's the only UI change required. Everything else is workflow config.

***

## Step 2: OIDC Authentication — What It Is and Why It Matters

The deployment permissions block that shows up in every `deploy-pages` example deserves an explanation, not just a copy-paste:

```yaml
permissions:
  contents: read    # Read the repo to build it
  pages: write      # Write to GitHub Pages
  id-token: write   # Request an OIDC token for deployment authentication
```

**OIDC** (OpenID Connect) is the mechanism GitHub Actions uses to issue short-lived, scoped tokens at runtime. When `actions/deploy-pages` runs, it requests an OIDC token from GitHub's identity provider — a token that is scoped specifically to a Pages deployment for this workflow run, on this repository, in this environment. The token expires when the run completes.

The alternative — using a static `GITHUB_TOKEN` or a Personal Access Token stored as a repository secret — grants broader permissions that persist indefinitely, require rotation, and are exposed in your secrets store. With OIDC there is nothing to rotate, nothing to store, and nothing to leak. The `id-token: write` permission is what allows the workflow to request this token.

***

## Step 3: Dependency Caching

The single change with the highest return on effort. `actions/setup-node` supports built-in npm caching:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

With `cache: 'npm'`, the action manages a cache keyed on the hash of your `package-lock.json`. When the lockfile hasn't changed — which is true for the vast majority of content-only commits on a blog — the cache is hit and the `npm ci` install step takes seconds instead of a minute. When you do update dependencies, the lockfile changes, the cache key changes, and a fresh install populates the new cache.

For teams with monorepos or custom cache locations, the manual `actions/cache@v4` approach gives you full control:

```yaml
- name: Cache npm dependencies
  uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
```

For a single-package repo like this one, `cache: 'npm'` in `setup-node` is equivalent and cleaner.

***

## Step 4: Building the Site

The build job checks out the code, installs dependencies with `npm ci` (not `npm install` — `ci` respects the lockfile exactly and fails if it's out of sync), runs the production build, and uploads the artifact:

```yaml
build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build Eleventy site and Tailwind CSS
      run: npm run deploy

    - name: Upload Pages artifact
      uses: actions/upload-pages-artifact@v3
      with:
        path: _site
        retention-days: 1
```

The `retention-days: 1` on the artifact upload is the cleanup fix. The artifact only needs to survive long enough for the `deploy` job to consume it in the same workflow run — typically minutes. After that it has no value. The default is 90 days. For a blog with regular publishing, that accumulates fast against your GitHub storage quota. One day is the right number here.

***

## Step 5: Deploying with Environment Protection

The deploy job is where the environment gate comes in:

```yaml
deploy:
  needs: build
  runs-on: ubuntu-latest
  environment:
    name: github-pages
    url: ${{ steps.deployment.outputs.page_url }}
  permissions:
    pages: write
    id-token: write
  steps:
    - name: Deploy to GitHub Pages
      id: deployment
      uses: actions/deploy-pages@v4
```

The `environment:` block does two things. First, it connects this job to a **GitHub Environment** — a named deployment target that can be configured with protection rules. Second, the `url:` output from `actions/deploy-pages` is automatically surfaced in the GitHub UI, linked from the deployment entry in the Actions run.

The permissions here are scoped to this job only: `pages: write` and `id-token: write`. The top-level permissions for the workflow are set to `contents: read`. The `build` job never gets write access to Pages; the `deploy` job never gets more than it needs. This is the principle of least privilege applied where it's cheapest — YAML.

### Configuring the GitHub Environment

The environment protection rules live in the GitHub UI, not the workflow file. Navigate to **Repository Settings → Environments → New environment** and name it `github-pages`.

From there, the two most useful controls:

- **Required reviewers**: add one or more people who must approve the deployment before the job proceeds. When a deployment is pending approval, the `deploy` job pauses and GitHub sends a notification to the reviewers. The workflow waits — your site doesn't go live until someone explicitly approves it.
- **Deployment branch filter**: restrict deployments to the `main` branch. This prevents accidental deploys from feature branches even if someone triggers a `workflow_dispatch` from the wrong ref.

For a personal site or solo project, required reviewers may be more friction than value. The deployment branch filter alone is a meaningful improvement — it eliminates the category of "I accidentally ran this from a branch that wasn't ready."

***

## The Complete Workflow

All of it assembled:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build Eleventy site and Tailwind CSS
        run: npm run deploy

      - name: Upload Pages artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: _site
          retention-days: 1

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    permissions:
      pages: write
      id-token: write
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

A few design decisions worth calling out explicitly:

**Two-job structure.** `build` produces the artifact; `deploy` consumes it. If `build` fails, `deploy` never runs — there is no path from a broken build to a live deployment. The jobs are cleanly separated and could run on different runner types if needed.

**`workflow_dispatch`.** Allows manual triggering from the GitHub Actions UI, useful for redeploying after a config change, an environment tweak, or any situation where you want to redeploy without committing a change to `main`.

**Top-level `permissions: contents: read`.** This is the floor. Every job in this workflow inherits it unless they declare their own permissions block. The `deploy` job adds `pages: write` and `id-token: write` at the job level — those permissions exist for that job only, not for `build`.

**`npm ci` not `npm install`.** Reproducible installs, lockfile-enforcing. If `package-lock.json` diverges from `package.json`, `npm ci` fails loudly instead of silently mutating the install.

***

## PR Preview Deployments

GitHub Pages doesn't natively support per-PR preview URLs. If that's a requirement, two options:

**Cloudflare Pages or Netlify**: connect your repository and they handle PR preview URLs automatically, with zero workflow changes on your end. Each PR gets its own preview URL, and it tears down when the PR closes. For most teams, this is the right answer.

**Custom approach within GitHub Pages**: deploy to a path-prefixed URL per PR number on a separate branch, managed through workflow logic. More engineering work, stays entirely within GitHub, no third-party dependency. Worth it if GitHub Pages is a hard constraint; not worth it otherwise.

***

<div class="callout-box">

## GitHub Pages Deployment Checklist

- [ ] Set Pages source to **GitHub Actions** in Repository Settings — not a branch
- [ ] Use `actions/setup-node` with `cache: 'npm'` — eliminates 60–90 seconds of install time on unchanged deps
- [ ] Run `npm ci` not `npm install` — reproducible, lockfile-respecting installs; fails loudly on lockfile drift
- [ ] Use `npm run deploy` (not parallel dev scripts) — Eleventy must build `_site/` before `build:css` can write into it
- [ ] Set `retention-days: 1` on the Pages artifact — it only needs to survive until the `deploy` job runs in the same workflow
- [ ] Set top-level `permissions: contents: read`; add `pages: write` + `id-token: write` only in the `deploy` job
- [ ] Create a `github-pages` Environment with a deployment branch filter set to `main`
- [ ] Add required reviewers to the Environment if the site is anything beyond a personal project
- [ ] Add `workflow_dispatch` — allows redeployment without a code change

</div>

The gap between "it works" and "it's production-grade" for GitHub Pages is surprisingly small. Caching, least-privilege permissions, a one-day artifact lifecycle, and a deployment environment that can be gated — none of these are complex changes. Together they cut deploy time noticeably, close the OIDC security gap, and give you the ability to stop a bad deploy before it reaches users. For a personal blog or a small team site, this workflow is the right baseline — not over-engineered, but not leaving the obvious improvements on the table either.

***

Questions about GitHub Actions deployment pipelines, or want help adapting this for a monorepo or a different static site generator? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
