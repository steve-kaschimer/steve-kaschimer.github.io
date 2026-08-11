# Getting Started with Azure DevOps for .NET

Azure DevOps' YAML pipelines feel familiar if you already know GitHub Actions -- steps, stages, triggers -- but the vocabulary and structure are genuinely different underneath, and the payoff for learning them is real specifically where Azure is your deployment target: native Azure service connections, deep App Service/Container Apps/AKS deployment tasks, and governance features that don't require an enterprise upgrade tier the way some competitors do.

This guide covers setting up an Azure Pipelines YAML pipeline for .NET, bootstrapping caching and multi-stage build/deploy structure, the core patterns for Azure-native deployment, and the best practices that take advantage of what Azure DevOps specifically does well. By the end you'll have a pipeline that's fast, secure, and deeply integrated with Azure if that's your deployment target.

If you're deciding between CI/CD platforms first, a comparison of the top CI/CD platforms for .NET covers where Azure DevOps fits relative to GitHub Actions, GitLab CI, TeamCity, and Jenkins.

## What You'll Need

- An Azure DevOps organization and project
- A repository -- Azure Repos, or a connected GitHub repository (Azure Pipelines works with both)

## Your First Pipeline

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'ubuntu-latest'

steps:
  - task: UseDotNet@2
    inputs:
      version: '8.0.x'

  - script: dotnet restore
  - script: dotnet build --configuration Release --no-restore
  - script: dotnet test --configuration Release --no-build
```

This is a working CI pipeline, structurally similar in spirit to a GitHub Actions workflow -- a `trigger` instead of `on`, `steps` with `task`/`script` entries instead of `uses`/`run`, but the same underlying idea: restore, build, test on every push to `main`.

## Bootstrapping the Ideal Environment

### Cache NuGet packages

```yaml
steps:
  - task: Cache@2
    inputs:
      key: 'nuget | "$(Agent.OS)" | **/packages.lock.json'
      restoreKeys: |
        nuget | "$(Agent.OS)"
      path: $(NUGET_PACKAGES)
    displayName: Cache NuGet packages

  - script: dotnet restore
```

The `Cache@2` task is Azure Pipelines' equivalent of `actions/setup-dotnet`'s built-in caching -- keying off your lock files means the cache correctly invalidates when dependencies actually change.

### Multi-stage pipelines for build and deploy

```yaml
stages:
  - stage: Build
    jobs:
      - job: BuildAndTest
        pool:
          vmImage: 'ubuntu-latest'
        steps:
          - task: UseDotNet@2
            inputs:
              version: '8.0.x'
          - script: dotnet restore
          - script: dotnet build --configuration Release --no-restore
          - script: dotnet test --configuration Release --no-build
          - script: dotnet publish -c Release -o $(Build.ArtifactStagingDirectory)
          - publish: $(Build.ArtifactStagingDirectory)
            artifact: drop

  - stage: Deploy
    dependsOn: Build
    jobs:
      - deployment: DeployToAzure
        environment: production
        pool:
          vmImage: 'ubuntu-latest'
        strategy:
          runOnce:
            deploy:
              steps:
                - download: current
                  artifact: drop
                - task: AzureWebApp@1
                  inputs:
                    azureSubscription: 'my-service-connection'
                    appType: webApp
                    appName: 'myapp-api'
                    package: '$(Pipeline.Workspace)/drop/**/*.zip'
```

Stages give you the same CI/CD separation GitHub Actions achieves with separate jobs and `environment` gates -- `dependsOn: Build` ensures deployment only runs after a successful build, and the `environment: production` reference enables the same kind of approval gating.

### Set up an Azure service connection instead of static credentials

In Azure DevOps: **Project Settings → Service connections → New service connection → Azure Resource Manager**, using workload identity federation rather than a service principal with a stored secret. This is Azure DevOps' equivalent of GitHub Actions' OIDC pattern -- short-lived, federated authentication rather than a long-lived static credential.

### Configure approval gates on environments

**Pipelines → Environments → production → Approvals and checks**: add required approvers before a deployment to that environment can proceed -- the same manual gate concept as GitHub Actions' environment protection rules, configured through Azure DevOps' UI instead of YAML.

## Core Workflow

- **Use multi-stage YAML pipelines to keep build and deploy logically separated**, the same discipline that applies to any CI/CD platform in this series.
- **Use service connections with workload identity federation rather than stored service principal secrets**, for the same security reasons OIDC matters in GitHub Actions.
- **Take advantage of native Azure deployment tasks** (`AzureWebApp@1`, `AzureContainerApps@1`, and similar) rather than shelling out to raw Azure CLI commands for common deployment targets -- they handle a lot of the underlying complexity for you.

## Verifying Your Setup

1. **Caching reduces build time on subsequent runs** -- compare cached vs. uncached run duration
2. **Multi-stage pipelines correctly gate deployment on a successful build** -- confirm `dependsOn` prevents deployment from running if the build stage fails
3. **Service connections authenticate without a stored secret** -- confirm workload identity federation is configured and deployment tasks authenticate successfully
4. **Approval gates actually pause deployment** -- confirm a deployment to a gated environment waits for approval rather than proceeding automatically

## Best Practices

**Use workload identity federation for Azure service connections instead of service principal secrets.** This is Azure DevOps' equivalent of GitHub Actions' OIDC recommendation -- short-lived, federated credentials instead of long-lived static secrets.

**Cache NuGet packages via the `Cache@2` task.** The same time-saving benefit as GitHub Actions' built-in caching, just requiring an explicit task rather than a flag on `setup-dotnet`.

**Use native Azure deployment tasks for common targets (App Service, Container Apps, AKS).** They encapsulate meaningful complexity that you'd otherwise be reimplementing via raw Azure CLI scripting.

**Configure environment approval gates for production deployments.** The same enforced human checkpoint concept as GitHub Actions' required reviewers, worth setting up before anything deploys to a sensitive target.

**If your builds are Windows-heavy, confirm you're taking advantage of Azure DevOps' typically lower per-minute cost for Windows runners** compared to alternatives -- this is a real, measurable cost difference worth factoring into platform decisions.

## Comparison with GitHub Actions

| | Azure DevOps | GitHub Actions |
| --- | --- | --- |
| YAML structure | `trigger`/`stages`/`jobs`/`steps` with `task`/`script` | `on`/`jobs`/`steps` with `uses`/`run` |
| Azure deployment | Deepest, native tasks for most Azure services | Strong via OIDC + `azure/login`, less native |
| Windows build cost | Often cheapest | Standard GitHub-hosted pricing |
| Credential federation | Workload identity federation via service connections | OIDC |
| Repo requirement | Azure Repos or GitHub | GitHub specifically |

If you're weighing a move from GitHub Actions specifically because of Azure deployment depth or Windows build cost, both are genuine, measurable reasons -- the trade-off is adopting Azure DevOps' distinct YAML vocabulary and, if you stay on GitHub for source control, running CI/CD on a different platform than your repo host.

## Frequently Asked Questions

### Can I use Azure DevOps if my code is on GitHub, not Azure Repos?

Yes -- Azure Pipelines connects to GitHub repositories directly, so you don't need to migrate source control to use Azure DevOps for CI/CD. The integration is solid, though slightly less seamless than using Azure Repos natively.

### What's the Azure DevOps equivalent of GitHub Actions' OIDC?

Workload identity federation, configured through a service connection in **Project Settings → Service connections**. It provides the same benefit -- short-lived, federated authentication instead of a long-lived static service principal secret -- just through Azure DevOps' own configuration flow rather than YAML-based OIDC claims.

### How do multi-stage pipelines work compared to GitHub Actions' job dependencies?

Azure DevOps' `stages` with `dependsOn` serve the same purpose as GitHub Actions' `needs` between jobs -- ensuring one stage only runs after another completes successfully. The YAML structure differs, but the underlying dependency-gating concept is the same.

### Is Azure DevOps actually cheaper than GitHub Actions?

For Windows-heavy build workloads specifically, yes, typically -- cost comparisons consistently show Azure DevOps as the cheaper option per build minute for Windows runners. For Linux-based builds, the cost difference is less pronounced, and the right comparison depends on your actual workload mix.

### Do I need Azure DevOps if I'm not deploying to Azure?

Not particularly -- its strongest differentiation is specifically Azure-native deployment integration and Windows build cost. If you're not deploying to Azure and don't have Windows-heavy build needs, GitHub Actions (if your code is on GitHub) or another platform may be a more natural fit without a compelling reason to add Azure DevOps into the mix.

### How do I set up an approval gate before a production deployment?

Configure it under **Pipelines → Environments → [your environment] → Approvals and checks**, adding required approvers. A deployment job referencing that environment will pause and wait for approval before proceeding, the same enforced human checkpoint GitHub Actions provides via environment protection rules.

### What's the most common mistake in a first Azure DevOps setup for .NET?

Using a service principal with a stored secret for Azure service connections instead of workload identity federation, missing the same security benefit OIDC provides in GitHub Actions. The second common mistake is not using the `Cache@2` task for NuGet packages, leaving builds slower than necessary on every run.
