---
author: Steve Kaschimer
date: 2026-10-23
image: /images/posts/2026-10-23-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with steel blue, amber, and off-white accents. Split composition: on the left, a single persistent server-rack icon labeled 'Self-Hosted Runner' with a faint red crack running through it and a small amber warning icon, connected by a long unbroken line through several job icons labeled 'Job 1', 'Job 2', 'Job 3' - implying shared, lingering state. On the right, a row of ephemeral container icons, each labeled 'Job' with a single lifecycle arrow curving from spawn to destroy beneath it, no lines connecting one to the next. Between the two halves, a thin vertical divider. Below, a small fork-icon PR card with a padlock and 'Approval required' badge. The mood is a security model correction - infrastructure that finally matches GitHub-hosted runners' fresh-VM-per-job guarantee, self-hosted."
layout: post.njk
site_title: Tech Notes
summary: "A self-hosted runner unlocks private network access and custom hardware, and quietly inverts GitHub's security model while doing it: GitHub-hosted runners are destroyed after every job, most self-hosted runners aren't. This post covers the attack surface that's actually different (persistent compromise, fork-PR code execution, secret exfiltration via broader network reach), and four concrete mitigations - ephemeral autoscaling runners via Actions Runner Controller, network egress controls, mandatory approval for external contributor workflows, and repo-scoped runner groups - plus a worked ephemeral runner setup on Azure Container Apps."
tags: ["github-actions", "security", "devsecops", "runners", "platform-engineering"]
title: "GitHub Actions Self-Hosted Runners: Security Hardening for Production Workloads"
---

A self-hosted runner earns its keep two ways: it can reach your private network without a VPN tunnel or a public endpoint, and it can run on hardware GitHub doesn't offer - a GPU for model training, a specific chip architecture, whatever your build actually needs. Both are real, good reasons. Neither is why most teams that stand one up have actually thought about what they gave up to get it.

A GitHub-hosted runner is a freshly provisioned VM, destroyed the moment the job finishes. A self-hosted runner, by default, is a persistent process on a machine that stays up, stays network-connected, and executes whatever the next queued job tells it to - across every job that machine ever picks up, not just one. That's not a self-hosted runner problem exactly; it's the default configuration most teams reach for because it's the simplest one to stand up, and it inverts the isolation property GitHub-hosted runners give you for free.

***

## The Attack Surface That's Actually Different

**Persistent compromise.** A compromised build step on a GitHub-hosted runner ends when the job ends - the VM is gone. On a non-ephemeral self-hosted runner, whatever a compromised job planted (a modified binary in a shared cache, a background process, a stolen credential still valid on disk) is still there for the next job that lands on the same machine. The blast radius isn't one job. It's every job that runner picks up until someone notices.

**Fork PR code execution.** This is the attack GitHub's own documentation calls out specifically: a workflow triggered by `pull_request` from a fork, running on a self-hosted runner, executes the fork's workflow code - meaning an attacker's PR can run arbitrary code on your infrastructure, not GitHub's. Combine this with `pull_request_target` (which runs with access to secrets and checks out the base repo's workflow file, but can be tricked into checking out and executing the PR's *code*) and you have the exact exploit chain that's caused real incidents at real companies. [The permissions-block post](/posts/2026-03-25-github-actions-permissions-block/) covered `GITHUB_TOKEN` scope as one mitigation layer; on a self-hosted runner, the blast radius extends past the token to the machine itself.

**Secret exfiltration via network reach.** The private network access that justified the self-hosted runner in the first place is also the thing a compromised job can pivot through. A GitHub-hosted runner that steals a secret can exfiltrate that secret. A self-hosted runner sitting inside your VPC that steals a secret can use the runner's own network position to reach whatever else is reachable from there - the reason you stood it up is also the reason a compromise on it is worse than a compromise on GitHub's infrastructure.

***

## Mitigation 1: Ephemeral Runners with Autoscaling

The fix for persistent compromise is structural: make the runner ephemeral, so it has the same one-job-then-destroyed lifecycle as a GitHub-hosted runner, just running on your own infrastructure. [Actions Runner Controller](https://github.com/actions/actions-runner-controller) (ARC) is GitHub's own Kubernetes-based solution for this - it provisions runner pods on demand and, in ephemeral mode, tears each one down after exactly one job:

```yaml
# runner-scale-set.yaml
apiVersion: actions.github.com/v1alpha1
kind: AutoscalingRunnerSet
metadata:
  name: prod-runners
  namespace: arc-runners
spec:
  githubConfigUrl: https://github.com/your-org/your-repo
  githubConfigSecret: gh-app-credentials
  minRunners: 0
  maxRunners: 10
  template:
    spec:
      containers:
        - name: runner
          image: ghcr.io/actions/actions-runner:latest
          command: ["/home/runner/run.sh"]
```

`minRunners: 0` means idle capacity costs nothing - pods scale up in response to queued jobs and scale back to zero when the queue is empty. Every pod handles one job and is deleted, so whatever a compromised job touched doesn't persist for the next one. This is the single highest-leverage change on this list: it doesn't require you to change how workflows are written, only how the runner fleet is managed.

***

## Mitigation 2: Network Egress Controls

A self-hosted runner with unrestricted outbound access can exfiltrate to anywhere, and most teams grant exactly that by default because scoping egress takes deliberate effort nobody budgeted for. Apply the same principle [the permissions-block post](/posts/2026-03-25-github-actions-permissions-block/) applied to `GITHUB_TOKEN` scope, to network access instead: default-deny, allow only the specific destinations a build actually needs (package registries, the internal endpoints the job legitimately calls), and log what gets blocked so you can see attempted exfiltration rather than just prevent it silently.

This is worth taking seriously even when it's inconvenient - restrictive egress policies break things that used to work by accident (a build script that quietly pulled from an unexpected mirror, a tool that phones home to check for updates), and the fix each time is to explicitly allowlist the destination, not to open egress back up wholesale.

***

## Mitigation 3: Mandatory Approval for External Contributors

GitHub's built-in control for the fork-PR attack path lives in **Settings → Actions → General → Fork pull request workflows**. The default, "Require approval for first-time contributors," only checks a contributor's history the first time - it does not protect against a contributor who's had one legitimate PR approved and merged, then submits a second PR with a malicious workflow change. Set it to **"Require approval for all outside collaborators"** for any repository where self-hosted runners are in scope for PR-triggered workflows. Every external PR waits for a maintainer to click approve before the workflow runs at all - the one control that stops the fork-PR attack at the source, rather than mitigating what it can reach afterward.

***

## Mitigation 4: Runner Groups Scoped to Specific Repositories

Self-hosted runners registered at the organization level are available to every repository in the org by default unless you scope them. **Runner groups** (org **Settings → Actions → Runner groups**) restrict a pool of runners to an explicit list of repositories - the runner provisioned for your production deployment pipeline shouldn't also be reachable by a workflow in an unrelated internal tools repo that a wider set of people can push to.

This matters most for organizations running a mix of trust levels across repositories - a sensitive deployment pipeline and a low-stakes internal wiki repo should never share a runner pool, even if both are self-hosted for legitimate reasons. A compromised or careless workflow in the lower-trust repo shouldn't have a path to a runner that has credentials or network access meant for the higher-stakes one.

***

## A Concrete Ephemeral Setup: Azure Container Apps

ARC is the natural choice if you're already running Kubernetes. For teams that aren't, Azure Container Apps jobs give the same ephemeral, scale-to-zero shape without a cluster to operate:

```bash
az containerapp job create \
  --name gh-runner-job \
  --resource-group rg-ci \
  --environment ci-environment \
  --trigger-type Event \
  --replica-timeout 1800 \
  --replica-retry-limit 0 \
  --min-executions 0 \
  --max-executions 10 \
  --scale-rule-name github-runner-scaler \
  --scale-rule-type github-runner \
  --scale-rule-metadata \
      githubAPIURL=https://api.github.com \
      owner=your-org \
      runnerScope=repo \
      repos=your-repo \
  --scale-rule-auth "personalAccessToken=gh-pat-secret" \
  --image ghcr.io/actions/actions-runner:latest \
  --secrets "gh-pat-secret=keyvaultref:https://your-vault.vault.azure.net/secrets/gh-runner-pat,identityref:system"
```

The `github-runner` KEDA scaler (built into Container Apps' event-driven scaling) polls for queued jobs matching the configured repo/scope and starts a job execution per queued item - `replica-retry-limit 0` means a failed job doesn't retry on the same instance, and `min-executions 0` means no idle container sits around between jobs. Each execution registers as a fresh runner, picks up exactly one job, and the container is torn down when it completes - the same ephemeral guarantee as ARC's pod-per-job model, without a Kubernetes control plane to maintain.

***

## Closing

None of these four mitigations require giving up what made a self-hosted runner worth the operational cost in the first place - the private network reach and custom hardware are untouched. What they fix is the part that was never actually a deliberate choice: a persistent, always-on machine that every job shares state with, reachable by any external contributor's PR, with no boundary between one repository's runner pool and another's. Ephemeral-by-default, approval-gated, network-scoped, and access-scoped is what makes a self-hosted runner a peer to GitHub's own infrastructure on security, not just on capability.

***

Questions or corrections? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
