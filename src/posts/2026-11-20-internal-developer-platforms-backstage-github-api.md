---
author: Steve Kaschimer
date: 2026-11-20
image_prompt: "A dark-mode technical editorial illustration on a near-black background with cobalt blue, teal, and amber accents. In the center, a service-catalog grid of small card icons, each showing a service name, an owner avatar placeholder, and a tiny health-status dot. Above the grid, a 'catalog-info.yaml' file icon connects down into the grid with a bright teal line. To the left, a cluster of GitHub repository icons (folder-with-branch symbol) feeds into a labeled 'GitHub Entity Provider' node with a sync/refresh icon, which connects to the catalog grid with a dashed auto-discovery line. To the right, a small padlock-and-key icon labeled 'GitHub App - read-only' sits beside the entity provider node. Below, a thin timeline shows 'repo created' and 'repo archived' event dots feeding back into the sync node. The mood is orderly and current - a catalog that stays true because it's wired to the source of truth, not maintained by hand."
layout: post.njk
site_title: Tech Notes
summary: "A service catalog maintained by hand goes stale the day after someone forgets to update it - the fix isn't better discipline, it's wiring the catalog to a source of truth that updates itself. This post covers deploying Backstage with the GitHub integration, writing catalog-info.yaml for a real service, auto-discovering catalog entries from GitHub repos with the GitHub Entity Provider, keeping the catalog in sync via GitHub Actions when repos are created or archived, and setting up a GitHub App that gives Backstage read-only access without a long-lived PAT."
tags: ["developer-platform", "backstage", "github", "platform-engineering", "developer-productivity"]
title: "Internal Developer Platforms with GitHub: Backstage, Service Catalog, and the GitHub API"
---

A service catalog answers a question every engineering org eventually needs answered fast: what services exist, who owns them, and where's the code. The failure mode almost every catalog eventually hits isn't a missing feature - it's staleness. Someone stands up a new service, forgets to register it in the catalog, and six months later there are three services nobody outside their team knows exist. A catalog maintained by hand decays at the rate people forget to update it, which is to say: continuously.

Backstage, the CNCF-graduated developer portal originally built at Spotify, is the most widely adopted answer to "what does our service catalog look like," and GitHub is its most natural data source when your repos already carry most of the metadata a catalog needs - ownership via CODEOWNERS, activity via commit history, lifecycle state via archived/active status. Wiring Backstage to read that directly, instead of asking teams to duplicate it into a separate catalog UI, is what keeps the catalog accurate without becoming another chore nobody does.

***

## Deploying Backstage with the GitHub Integration

A minimal Backstage instance starts from the standard scaffolding, with GitHub configured as an integration in `app-config.yaml`:

```yaml
# app-config.yaml
integrations:
  github:
    - host: github.com
      apps:
        - appId: ${GITHUB_APP_ID}
          clientId: ${GITHUB_APP_CLIENT_ID}
          clientSecret: ${GITHUB_APP_CLIENT_SECRET}
          webhookSecret: ${GITHUB_APP_WEBHOOK_SECRET}
          privateKey: ${GITHUB_APP_PRIVATE_KEY}

catalog:
  providers:
    github:
      providerId:
        organization: 'your-org'
        catalogPath: '/catalog-info.yaml'
        filters:
          branch: 'main'
          repoSlug: '.*'
        schedule:
          frequency: { minutes: 30 }
          timeout: { minutes: 3 }
```

The `providers.github` block is the auto-discovery configuration covered below - Backstage doesn't wait for someone to manually register a service, it periodically scans the org for `catalog-info.yaml` files and ingests what it finds.

***

## Writing `catalog-info.yaml` for a Real Service

Every catalog entry is a YAML file living in the repo it describes, checked in alongside the code the same way a `README.md` is:

```yaml
# catalog-info.yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: payments-api
  description: Handles payment processing and refunds for the checkout flow.
  annotations:
    github.com/project-slug: your-org/payments-api
  tags:
    - payments
    - node
    - tier-1
spec:
  type: service
  lifecycle: production
  owner: team-payments
  system: checkout
  dependsOn:
    - resource:default/payments-db
    - component:default/fraud-detection-service
```

`dependsOn` is what makes the catalog more than a directory listing - Backstage renders it as an actual dependency graph, so "what breaks if `fraud-detection-service` goes down" is a query against the catalog, not a question that needs a tribal-knowledge Slack thread to answer. `owner` maps to a Backstage Group entity, usually synced from the same GitHub team that owns the repo, so ownership in the catalog and ownership in GitHub's access model don't drift apart from each other.

***

## Auto-Discovery with the GitHub Entity Provider

The `catalog.providers.github` config above is the GitHub Entity Provider doing the actual discovery work: on the configured schedule, it lists every repo in the org matching the filters, checks each for a `catalog-info.yaml` at the configured path, and ingests or updates the corresponding catalog entity. A new repo with a `catalog-info.yaml` on `main` appears in the catalog within the next scheduled sync - no one has to know Backstage exists to be correctly represented in it, as long as the file is there.

This is the mechanism that actually solves the staleness problem, and it's worth being precise about what it does and doesn't solve: it guarantees the catalog reflects what's *in* `catalog-info.yaml`, automatically. It does not guarantee `catalog-info.yaml` itself is accurate - a service whose `owner` field was never updated after a team reorg is still wrong, just automatically and consistently wrong. Auto-discovery removes "nobody registered the service," not "the metadata is stale," and treating those as the same problem is how a team ends up with an auto-synced catalog that's confidently incorrect.

***

## Keeping the Catalog in Sync on Repo Lifecycle Events

The scheduled sync above (every 30 minutes) is good enough for most cases, but a repo archived at 9am shouldn't show as an active service in the catalog until the next scheduled poll happens to catch it. A lightweight GitHub Actions workflow, triggered on the org's repo lifecycle events via a webhook relay, can push an immediate refresh:

```yaml
name: Notify Backstage of Repo Change

on:
  repository:
    types: [created, archived, unarchived]

permissions: {}

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger catalog refresh
        run: |
          curl -X POST "${{ secrets.BACKSTAGE_URL }}/api/catalog/refresh" \
            -H "Authorization: Bearer ${{ secrets.BACKSTAGE_REFRESH_TOKEN }}" \
            -H "Content-Type: application/json" \
            -d "{\"entityRef\": \"component:default/${{ github.event.repository.name }}\"}"
```

An archived repo without this immediate hook just shows as active for up to the scheduling window (30 minutes here) - a real but bounded gap, worth closing for org-level "which services are actually live" queries that get run against the catalog for decommissioning or cost reviews, less critical for the everyday "where's the code for X" lookups the catalog handles the rest of the time.

***

## A GitHub App Instead of a PAT

The `integrations.github.apps` block in `app-config.yaml` uses a GitHub App, not a personal access token, and this is a deliberate security choice worth keeping: a PAT is tied to whichever individual created it - it inherits their full permission set, breaks the day they leave the org or rotate their credentials, and shows up in audit logs as that person's identity even when Backstage is what's actually acting. A GitHub App has its own scoped permission set (read-only access to repository contents and metadata is all the catalog integration needs), its own identity in audit logs, and survives any individual's departure without a broken integration to debug during their offboarding.

Registering the app (org **Settings → Developer settings → GitHub Apps**) with `Contents: Read`, `Metadata: Read`, and `Administration: Read` (for archived-status visibility) is the minimum scope for the catalog provider above - resist the urge to grant write scopes "in case Backstage needs them later." A catalog integration that only reads has a much smaller blast radius if the app's credentials are ever compromised than one that can also push to repos.

***

## Closing

The part of this setup that actually prevents catalog rot isn't Backstage's UI - it's that the catalog's source of truth is a file living in the same repo as the code it describes, discovered automatically rather than registered by hand. `catalog-info.yaml` gets reviewed on the same PRs as the code, gets a `git blame` like anything else in the repo, and shows up in the catalog without anyone needing to remember a separate registration step. What Backstage adds on top - the dependency graph, the unified search, the templated scaffolding for new services - is real value, but the staleness fix underneath all of it is just: stop keeping the catalog somewhere other than where the code already lives.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
