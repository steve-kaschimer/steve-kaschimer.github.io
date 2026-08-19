---
author: Steve Kaschimer
date: 2028-04-11
image: /images/posts/2028-04-11-hero.webp
image_alt: "Five columns of abstract deployment glyphs positioned along a horizontal axis running from self-managed infrastructure on the left to fully hands-off managed platforms on the right."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition is five vertical columns of equal width separated by thin hairline rules, each column topped by a distinct abstract glyph rendered in flat geometry: a dense interconnected node cluster with a small steering-wheel accent implying full manual control, a lighter single container glyph fading gently at the edges implying scale-to-zero, a similar container glyph with a small toggle beside it implying a compute-model choice, a target-agnostic funnel glyph feeding into three small differently-shaped output icons, and a traditional server-tower glyph standing apart from the others with no cloud element attached. Beneath the glyphs, a shared horizontal axis labeled in monospaced type runs from 'self-managed' on the left to 'fully managed' on the right, with a small glowing teal dot positioned at a different point under each column. Mood is comparative, engineering-first, and non-partisan. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic cloud clip art used as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Four of these five paths are container-based, so 'do we use containers' isn't the real question. The differentiator is how much orchestration and operational burden you keep versus hand to a managed platform. A practical breakdown of five ways .NET applications actually reach production."
tags: ["dotnet", "deployment", "containers", "platform-engineering", "devops"]
title: "The Top 5 Ways to Deploy .NET Apps Compared: Which One Should You Choose?"
---



Deployment decisions in .NET used to mean picking a Windows Server and installing IIS. That's still a real, valid option - but it's now one of at least five genuinely different paths, and the honest starting point for this comparison is the same one that came up in the Microservices architecture article: the right amount of deployment infrastructure depends entirely on how much operational control you actually need, not on which option sounds most modern. A team running Kubernetes for a service that gets 500 requests a day is spending real engineering time on infrastructure that isn't the actual problem.

This guide compares five ways .NET applications get deployed to production in 2026: Docker + Kubernetes (self-managed orchestration), Azure Container Apps, AWS ECS/Fargate, .NET Aspire's cloud-native deploy workflow, and traditional IIS. The first four are all container-based at their core - the real differentiator between them is how much of the orchestration and operational burden you're taking on yourself versus handing to a managed platform, not whether containers are involved at all. This series continues with dedicated getting-started walkthroughs for each deployment path.

## Quick Comparison

| | Docker + Kubernetes | Azure Container Apps | AWS ECS/Fargate | .NET Aspire (deploy workflow) | IIS |
| --- | --- | --- | --- | --- | --- |
| **Category** | Self-managed container orchestration | Serverless containers, managed | Managed container orchestration (AWS) | Dev-to-cloud tooling layer, target-agnostic | Traditional Windows web server |
| **Operational overhead** | High - you manage the cluster | Low - no cluster to manage | Low-moderate, depending on Fargate vs. EC2 | Low, since it generates manifests for your chosen target | Low, but Windows Server maintenance is its own burden |
| **Portability** | Highest - runs anywhere Kubernetes runs | Lower - Azure-specific | Lower - AWS-specific | High - can target ACA, AKS, Kubernetes manifests, or Docker Compose | None - Windows-specific |
| **Best for** | Multi-tenant platforms, complex stateful workloads, teams needing full control | Azure-first teams wanting cloud-native without cluster management | AWS-first teams wanting managed container orchestration | Teams wanting a consistent dev-to-cloud experience regardless of final target | Legacy Windows Server environments, on-premises hosting |

## Docker + Kubernetes

Most powerful, most portable. Self-hosted or managed (AKS, EKS). Highest portability, manifests, Helm, images vendor-neutral. Full control over networking, scaling, advanced patterns (DaemonSets, proxies, ingress).

Right for complex requirements, multi-tenant, GPU, stateful with fine-grained storage. Massive, mature ecosystem (Prometheus, Grafana, meshes, operators).

Real, ongoing operational overhead. Overkill for smaller workloads. .NET-specific config (graceful shutdown, health checks, limits) common source of issues. Steepest learning curve.

## Azure Container Apps

Serverless container platform. Deploy image, Azure handles scaling/networking/infrastructure. No cluster to manage.

Genuinely serverless, eliminates Kubernetes operational cost. Deep .NET Aspire integration. Auto-scales, scales to zero. Migration path to AKS (images don't change).

Limitations vs. Kubernetes (no DaemonSets, privileged containers, GPU selection, advanced networking). Designed for stateless. Azure lock-in, migration is model change, not config.

## AWS ECS/Fargate

AWS's managed container orchestration. Removes cluster management like ACA. Deep AWS integration (IAM, VPC, CloudWatch, ALB).

Middle ground: ECS-on-EC2 (control) or ECS-on-Fargate (serverless). Well-documented, mature, huge workload track record.

AWS lock-in. Thinner .NET-specific tooling than Azure options. ECS-on-EC2 vs. Fargate decision added vs. ACA's simpler model.

## .NET Aspire (Deploy Workflow)

Not a deployment target, a workflow layer. Generates Docker Compose, Kubernetes manifests, Bicep templates, custom output from same Aspire model.

One source of truth, multiple targets. First-class Azure via `azd` (provisioning to deployment). Reduces local-to-cloud friction for multi-service .NET. Extensible publishers.

Not a target itself, you still choose underlying target (ACA, AKS, cluster). Best for Azure via `azd`; other targets less mature. Conceptual layer for non-Aspire teams.

## IIS

Legitimate option for Windows Server-based .NET. Reverse proxy for Kestrel (out-of-process) or direct hosting (less common).

Natural fit for Windows Server organizations. No containerization or orchestration learning curve. Deep Windows-specific auth (Windows Auth, Active Directory). Fully supported in production.

No cloud-native portability. Manual scaling. Common gotcha: .NET Core Hosting Bundle must be installed separately (500 errors on first deploy). Increasingly outlier for new projects.

**Choose this when:** you're deploying into an existing Windows Server environment, need deep Windows-specific integration (Active Directory, Windows Authentication), or your organization's operational expertise and infrastructure are already built around IIS.

## How to Decide

A few heuristics that cover most real-world decisions:

**Requirements are genuinely complex - multi-tenant, stateful, specific hardware needs?** Kubernetes' control surface is worth its operational cost specifically for this class of problem, not as a default starting point.

**Azure-first, want cloud-native deployment without managing a cluster?** Azure Container Apps is purpose-built for exactly this, with a well-defined upgrade path to AKS if you outgrow it later.

**AWS-first, want the equivalent managed container experience?** ECS with Fargate is the natural analog, deeply integrated with the rest of AWS's ecosystem.

**Already using .NET Aspire for local development?** Its deploy workflow (`aspire publish`/`aspire deploy`) carries that same model through to production, particularly smoothly for Azure via `azd`.

**Deploying into existing Windows Server infrastructure, or need deep Windows-specific integration?** IIS remains a completely legitimate, well-supported choice - not a legacy fallback, but the right fit for a real class of environments.

The single most common mistake across all five options isn't picking the wrong one outright - it's reaching for more infrastructure than the actual workload needs. A low-traffic internal tool doesn't need Kubernetes; a genuinely complex, multi-tenant platform will eventually outgrow Azure Container Apps' limitations. Match the operational commitment to the actual problem, and be honest about which one you're solving.

## Frequently Asked Questions

### Should I default to Kubernetes for a new .NET project?

Usually not, unless you have a concrete, specific reason - multi-tenant complexity, stateful workloads needing fine control, or hardware requirements a serverless container platform doesn't support. For most new projects, a managed serverless container platform (Azure Container Apps or AWS ECS/Fargate) delivers most of the containerized benefits with meaningfully less operational overhead.

### What's the actual difference between Azure Container Apps and AKS?

Azure Container Apps is serverless - no cluster to manage, with real limitations (no DaemonSets, limited node configuration, less networking control) in exchange for that simplicity. AKS is full Kubernetes, giving you the complete control surface at the cost of managing the cluster yourself. The migration path between them is well-defined since your container images don't change, only the orchestration layer around them.

### Is .NET Aspire's deploy workflow a replacement for choosing an actual deployment target?

No - it's a tooling layer on top of whatever target you choose, generating Docker Compose files, Kubernetes manifests, or Bicep templates from the same application model. You still need to decide where those artifacts actually get deployed; Aspire just makes that transition from local development smoother and more consistent, particularly for Azure via `azd`.

### Is IIS still a reasonable choice for new .NET projects in 2026?

For most new, cloud-native projects, container-based options are now the more common default. IIS remains completely reasonable specifically for organizations already running Windows Server infrastructure or needing deep Windows-specific integration (Active Directory, Windows Authentication) - it's not obsolete, just no longer the default assumption the way it once was.

### What's the most common mistake when deploying ASP.NET Core to IIS?

Forgetting to install the .NET Core Hosting Bundle on the Windows Server separately from deploying the application itself - this is a frequently reported cause of confusing 500 Internal Server Errors on a first deployment, since the application code is correct but the server lacks the runtime component needed to host it.

### Should I choose AWS ECS or Azure Container Apps if I'm not committed to a cloud platform yet?

Let your broader cloud platform decision drive this rather than the reverse - both offer a comparable value proposition (managed containers without cluster management), so the more important question is which cloud ecosystem the rest of your infrastructure, team expertise, and existing services are already built around.

### Does choosing a serverless container platform (ACA or ECS/Fargate) lock me into that cloud forever?

It's real lock-in in the sense that migrating away means adopting a different deployment and orchestration model, not a configuration change - but your actual container images remain portable. If you build with portable patterns (avoiding cloud-specific SDKs baked directly into application code, for instance), migrating the orchestration layer later is a real but bounded project, not a full rewrite.


---

C# or .NET question? Ask away.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
