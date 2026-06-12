---
author: Steve Kaschimer
date: 2026-07-10
image: /images/posts/2026-07-10-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, electric teal, and off-white accents. The central composition is a GitHub Actions workflow diagram split into two vertical paths. Left path, labeled 'cache miss', shows a full dependency install step with a red-tinted duration bar labeled '4m 12s'. Right path, labeled 'cache hit', shows a restore step with a teal-tinted duration bar labeled '18s'. Between the paths, a cache key expression in monospaced type: 'ubuntu-npm-a3f9c21d' glows teal. Below the paths, a three-level fallback chain: a solid box labeled 'exact key', connected by a downward arrow to a dashed box labeled 'restore-key prefix', connected by a second arrow to a dashed box labeled 'base'. At the bottom, a small hash icon labeled 'hashFiles()' in off-white. The mood is precise, engineering-first, and performance-minded"
layout: post.njk
site_title: Tech Notes
summary: "Most teams use actions/cache with a single key and accept 20% hit rates as inevitable. They're not. Cache key strategy - how you compose the key, chain restore-keys fallbacks, scope by branch, and handle matrix builds - is the difference between a dependency install that takes 4 minutes and one that takes 18 seconds."
tags: ["github-actions", "ci-cd", "developer-productivity", "performance"]
title: "GitHub Actions Advanced Caching: Strategies That Actually Cut Build Times"
---

Your CI takes four minutes to install dependencies. With a well-designed cache, it takes eighteen seconds. The gap between those two numbers is almost never about network speed or disk I/O - it's about whether your cache key is written correctly.

`actions/cache` is deceptively simple to use and deceptively easy to use wrong. A key that's too broad invalidates on every run. A key that's too narrow never hits. Most teams land somewhere in the middle: a single key that hits inconsistently, a 30-40% hit rate they've stopped questioning, and CI minutes burning at the rate of a full install on every other push.

This post is the fix. Cache key anatomy, restore-keys fallback chains, branch scoping, matrix-aware keys, per-ecosystem examples, and the security model that keeps it all safe.

***

## Why Most Caches Miss

The anti-pattern looks like this:

```yaml
- uses: actions/cache@v4
  with:
    path: node_modules
    key: npm-cache
```

This key never changes. The first run writes the cache. Every subsequent run hits it - until someone changes a dependency, at which point the cached `node_modules` is stale and wrong. The solution most teams reach for is adding the lock file hash:

```yaml
key: npm-${{ hashFiles('**/package-lock.json') }}
```

Better - but `npm-a3f9c21d` is the same key for an Ubuntu runner and a macOS runner, which means a cache written on one may be restored on the other. Compiled native modules, platform-specific binaries, and symlink layouts differ between operating systems. Cross-platform cache sharing silently corrupts builds.

The other failure mode is keys that are too broad - omitting the lock file hash entirely - or too narrow - including something like `github.sha` in the key. Committing the current SHA to the cache key guarantees a miss on every run except the one that wrote the cache. It turns `actions/cache` into an expensive no-op.

The actual hit rate problem is almost always one of these three things: missing the runner OS, missing the lock file hash, or including something that changes on every run. Fix those and hit rates climb above 80% without any other changes.

***

## Cache Key Anatomy

A well-formed cache key has three components: runner OS, a stable identifier for the dependency set (usually a tool version), and a hash of the lock file. The canonical pattern for npm:

```yaml
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

This key:

- **Changes when the OS changes.** `runner.os` returns `Linux`, `Windows`, or `macOS`. An Ubuntu job and a macOS job have separate caches.
- **Changes when dependencies change.** `hashFiles('**/package-lock.json')` hashes every `package-lock.json` in the repo. When `npm install` updates the lock file, the hash changes, the old cache key no longer matches, and the runner installs fresh.
- **Does not change between runs on the same OS with the same dependencies.** A push to a feature branch with no dependency changes hits the same cache as the previous push to that branch.

`hashFiles()` accepts glob patterns. `hashFiles('**/package-lock.json')` covers monorepos with multiple lock files. For Gradle, `hashFiles('**/*.gradle*', '**/gradle-wrapper.properties')` captures both build scripts and the wrapper version. The function computes a SHA-256 over the sorted, concatenated contents of all matching files and returns the first 16 characters of the hex digest.

If you're caching a tool that also depends on its own version - `actions/setup-node`, `actions/setup-python`, and similar - include the version in the key:

```yaml
key: ${{ runner.os }}-node-${{ matrix.node-version }}-${{ hashFiles('**/package-lock.json') }}
```

Two jobs running different Node versions install packages against different ABIs. Their caches should be separate.

***

## Restore-Keys Fallback Chains

When no cache entry matches the primary key, `actions/cache` searches for a usable partial match using the `restore-keys` list, in order, treating each entry as a prefix. The first partial match it finds is restored - stale, but better than nothing for most dependency managers.

Here is a three-level chain for npm:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-
      ${{ runner.os }}-
```

Read this as a priority list:

1. **Exact key match** - the current lock file hash. Full hit, nothing to install.
2. **`${{ runner.os }}-npm-` prefix** - a cache from a previous lock file state. Restores, then `npm install` adds or removes the delta packages. Much faster than a cold install.
3. **`${{ runner.os }}-` prefix** - any cache for this OS. Last resort, but any warmed npm cache beats downloading everything.

The reason stale caches are valuable: `npm install` against a partially-warm `~/.npm` global cache still skips the network fetch for every package that hasn't changed. Only the diff needs downloading. For a project with 800 packages where two change, the difference between a cold install and a stale cache hit is the difference between downloading all 800 and downloading 2.

After the job completes, `actions/cache` writes a new cache entry for the exact key if one didn't already exist. The stale cache does not overwrite the one it was restored from - it creates a new entry. The exact-key entry is the authoritative one; the partial-match entries are fallbacks.

***

## Branch Scoping

GitHub scopes cache access by repository and branch. A job running on a feature branch can read caches written from `main`, but a job on `main` cannot read caches written from a feature branch. Fork PRs are even more restricted: they cannot read caches from the parent repo at all. This is a deliberate security boundary.

The practical implication for cache key design: your default branch cache is the base that all feature branches fall back to. If you include `github.ref` in the primary key, each branch maintains an isolated cache that starts cold. If you omit `github.ref`, all branches share a single cache that overwrites each other on every push.

The right balance is to include `github.ref` in the primary key and exclude it from the `restore-keys` chain:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ github.ref_name }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-${{ github.ref_name }}-
      ${{ runner.os }}-npm-refs/heads/main-
      ${{ runner.os }}-npm-
```

This gives you:

- **Branch-scoped primary key** - feature branches write their own caches and don't pollute the shared pool with every PR's lock file state.
- **Fallback to `main`'s cache** - a new branch's first run restores from `main` rather than installing cold.
- **Last-resort fallback** - any npm cache for this OS, in case `main` doesn't have a recent entry either.

The `refs/heads/main-` prefix in the fallback is explicit. `github.ref_name` returns `main` on the default branch, so the prefix matches that branch's cache entries.

For short-lived feature branches, branch-scoped caches are written once and usually read once. GitHub's LRU eviction takes care of them within a few days of the branch going idle. You don't need to clean up manually.

***

## Matrix-Aware Cache Keys

Matrix builds that share a single cache key cross-contaminate. A job testing against Node 18 and a job testing against Node 20 should not share a cache - native addons, some packages, and occasionally `.bin` symlinks differ between Node versions.

The fix is to include the matrix variable in the key:

```yaml
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest]
        node-version: ['18.x', '20.x']
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}

      - uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ matrix.node-version }}-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-${{ matrix.node-version }}-
            ${{ runner.os }}-node-

      - run: npm ci
      - run: npm test
```

`runner.os` and `matrix.os` serve the same purpose here - the OS identifier. Using `runner.os` is slightly more reliable since it reflects the actual OS the runner is on, whereas `matrix.os` includes the `latest` suffix which can shift when GitHub updates the runner image. Either works; be consistent.

For a 2×2 matrix (2 OS × 2 Node versions), this produces four independent cache namespaces. Each one maintains its own history and its own fallback chain. Hits stay within the correct namespace; misses fall back to any cache for that OS/version pair, not to a different version's stale cache.

***

## Per-Ecosystem Examples

### npm

Cache `~/.npm` (the global npm content-addressable cache), not `node_modules`. `npm ci` populates `node_modules` from `~/.npm` - if the global cache is warm, `npm ci` takes seconds even when `node_modules` is cold. Caching `node_modules` directly is fragile: it ties the cache to the local directory structure, breaks cross-version fallbacks, and can cause subtle issues when native modules are involved.

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-

- run: npm ci
```

### Gradle

Gradle's cache lives in `~/.gradle/caches` and `~/.gradle/wrapper`. Hash both build scripts and the wrapper properties file - either can change between builds:

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
    restore-keys: |
      ${{ runner.os }}-gradle-

- run: ./gradlew build
```

The `**/*.gradle*` pattern matches `build.gradle`, `build.gradle.kts`, `settings.gradle`, and `settings.gradle.kts`. If your build scripts are stable but your dependency versions in a `libs.versions.toml` file change frequently, include that file in the hash as well.

### pip

Cache `~/.cache/pip`. Include the Python version in the key - wheels are version and platform-specific:

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'

- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements*.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-

- run: pip install -r requirements.txt
```

`hashFiles('**/requirements*.txt')` matches `requirements.txt`, `requirements-dev.txt`, `requirements-test.txt`, and any other variant. If you use `pyproject.toml` for dependencies, substitute `hashFiles('**/pyproject.toml')`.

If you use `actions/setup-python@v5` with the `cache` parameter, it handles this automatically. The built-in caching in setup actions is equivalent to the manual pattern above - use whichever you prefer, but don't do both.

### Docker Layer Caching

Docker layer caching in GitHub Actions uses `docker/build-push-action` with the `cache-from` and `cache-to` parameters and the `type=gha` cache backend, which writes directly to the GitHub Actions cache API:

```yaml
- uses: docker/setup-buildx-action@v3

- uses: docker/build-push-action@v5
  with:
    context: .
    push: true
    tags: ghcr.io/${{ github.repository }}:${{ github.sha }}
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

`mode=max` caches all layers, including intermediate build stages. `mode=min` (the default) caches only the final stage. For multi-stage Dockerfiles where the build stage is expensive - compiling a large Go or Rust binary, for example - `mode=max` is worth the additional cache storage.

The `type=gha` backend respects the same cache scoping rules as `actions/cache`. A push to a feature branch can restore layers cached from `main`, but writes from the feature branch don't pollute the `main` cache. This means your CI's Docker builds get free warm-layer fallback on every branch without any additional configuration.

***

## Cache Poisoning and GitHub's Isolation Model

Cache poisoning is the scenario where a malicious cache entry is written by an untrusted source and then read by a trusted workflow, causing it to execute or deploy compromised artifacts.

GitHub's isolation model addresses this structurally:

- Caches are scoped to a **repository and branch**. A cache written by a workflow run in `repo-A` is never readable by `repo-B`.
- **Fork PRs cannot read the parent repository's cache.** A `pull_request` event from a fork runs in the fork's security context. The `ACTIONS_CACHE_URL` token issued to that runner is scoped to the fork - it has no read access to the parent repo's cache entries. This blocks the attack where a malicious PR poisons the parent's cache and waits for a privileged workflow to restore it.
- **Cache entries are immutable once written.** A key that already has an entry cannot be overwritten by another run. The first writer wins. This prevents a race where an attacker writes a poisoned entry by racing the legitimate workflow.

The practical implication: if your workflows run on `pull_request` events from forks (common for open source projects), the isolation model already protects you. Fork PR workflows cannot read or write your repo's caches. You do not need to add logic to skip caching on fork PRs.

The residual risk is internal: a workflow triggered from a branch in your own repo by a contributor with push access could write a malicious cache. This is a trust-level issue, not a caching issue - if a contributor has push access, they can already modify workflow files, which is a far larger attack surface than cache entries.

One concrete hardening step: use `actions/cache/restore` and `actions/cache/save` as separate steps rather than the combined `actions/cache`. This lets you restore before the main work and save after it, and it gives you explicit control over when and whether saving happens. In particular, you can skip the save step if the primary key already had a hit:

```yaml
- uses: actions/cache/restore@v4
  id: cache-restore
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-npm-

- run: npm ci

- uses: actions/cache/save@v4
  if: steps.cache-restore.outputs.cache-hit != 'true'
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

The `if` condition prevents redundant saves when the primary key already matched. It's a minor optimization - `actions/cache` already avoids overwriting an existing key - but the split step pattern is valuable for a different reason: the `save` step runs even if the main job fails. The combined `actions/cache` action's post-step also runs on failure, but having explicit control makes the behavior readable rather than implicit.

***

## Cache Size Limits and Eviction

GitHub enforces a 10 GB total cache limit per repository. When the total size exceeds 10 GB, the oldest entries are evicted until the repo is back under the limit. There is no per-entry size limit - a single large cache entry is valid, it just consumes the shared budget.

The practical limit this creates: don't cache build output. Build artifacts, compiled binaries, and test reports are not dependency caches - they change on every commit, they consume space fast, and restoring a stale build artifact is almost never useful. Cache only the inputs that don't change on every run: downloaded packages, resolved dependency trees, compiler toolchains.

A few rules that keep cache storage under control:

**Cache the global package manager cache, not the local install directory.** For npm, `~/.npm` not `node_modules`. For pip, `~/.cache/pip` not `venv/`. The global cache stores compressed tarballs; the local install directory stores unpacked files which are larger and more volatile.

**Include enough specificity in the key that stale entries expire quickly.** A key with a lock file hash creates a new entry every time dependencies change. If you change dependencies frequently, old entries accumulate. They'll be evicted by LRU, but if you're near the 10 GB limit, you can add an explicit cache version prefix to force a clean sweep:

```yaml
key: v2-${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}
```

Increment `v2` to `v3` to immediately stop using any previously written `v2` entries.

**Use `actions/cache/save` with `if: always()` for jobs that run long test suites.** By default, the save step only runs if the main job succeeded. For long-running jobs where you want to preserve the partially-warm state even on failure, use the split step pattern with `if: always()` on the save step.

***

## Closing

The cache key is three things: runner OS, tool version or ecosystem identifier, and lock file hash. The `restore-keys` chain is how you trade exactness for hit rate - a stale cache that installs a 50-package delta is faster than a cold install every time. Branch scoping keeps feature caches from polluting `main`, and the fallback to `main` means new branches don't start cold. Matrix builds need one cache namespace per combination - omit the matrix variable and you're sharing state across jobs that shouldn't share it.

This is five minutes of work per workflow. The return is measured in CI minutes per week, compounded across every developer on every push. Most teams treat cache key design as an afterthought, which is why most teams have 30% hit rates when they could have 90%.

Write the key correctly. Add the fallback chain. Scope it to the branch. That's the whole thing.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
