# The Top 5 Ways to Deploy .NET Apps Compared: Which One Should You Choose?

Deployment decisions in .NET used to mean picking a Windows Server and installing IIS. That's still a real, valid option -- but it's now one of at least five genuinely different paths, and the honest starting point for this comparison is the same one that came up in the Microservices architecture article: the right amount of deployment infrastructure depends entirely on how much operational control you actually need, not on which option sounds most modern. A team running Kubernetes for a service that gets 500 requests a day is spending real engineering time on infrastructure that isn't the actual problem.

This guide compares five ways .NET applications get deployed to production in 2026: Docker + Kubernetes (self-managed orchestration), Azure Container Apps, AWS ECS/Fargate, .NET Aspire's cloud-native deploy workflow, and traditional IIS. The first four are all container-based at their core -- the real differentiator between them is how much of the orchestration and operational burden you're taking on yourself versus handing to a managed platform, not whether containers are involved at all.

If you want hands-on setup guides after deciding, this series includes dedicated getting-started walkthroughs for each deployment path in .NET.

## Quick Comparison

| | Docker + Kubernetes | Azure Container Apps | AWS ECS/Fargate | .NET Aspire (deploy workflow) | IIS |
| --- | --- | --- | --- | --- | --- |
| **Category** | Self-managed container orchestration | Serverless containers, managed | Managed container orchestration (AWS) | Dev-to-cloud tooling layer, target-agnostic | Traditional Windows web server |
| **Operational overhead** | High -- you manage the cluster | Low -- no cluster to manage | Low-moderate, depending on Fargate vs. EC2 | Low, since it generates manifests for your chosen target | Low, but Windows Server maintenance is its own burden |
| **Portability** | Highest -- runs anywhere Kubernetes runs | Lower -- Azure-specific | Lower -- AWS-specific | High -- can target ACA, AKS, Kubernetes manifests, or Docker Compose | None -- Windows-specific |
| **Best for** | Multi-tenant platforms, complex stateful workloads, teams needing full control | Azure-first teams wanting cloud-native without cluster management | AWS-first teams wanting managed container orchestration | Teams wanting a consistent dev-to-cloud experience regardless of final target | Legacy Windows Server environments, on-premises hosting |

## Docker + Kubernetes

Running .NET applications as containers orchestrated by Kubernetes -- whether self-hosted, or via a managed offering like Azure Kubernetes Service (AKS) or AWS EKS -- remains the most powerful and most portable option in this comparison, and also the one with the steepest real operational cost.

**Strengths:**

- The highest portability of any option here -- Kubernetes manifests, Helm charts, and container images are genuinely vendor-neutral, running identically on AKS, EKS, GKE, or on-premises
- Full control over networking, scaling policies, node configuration, and advanced patterns (DaemonSets, sidecar proxies, custom ingress controllers) that managed serverless container platforms don't expose
- The right choice for genuinely complex requirements -- multi-tenant platforms, GPU workloads, stateful services needing fine-grained storage control
- A massive, mature ecosystem of tooling (Prometheus, Grafana, service meshes, operators) that works across any Kubernetes distribution without vendor lock-in

**Weaknesses:**

- Real, ongoing operational overhead -- cluster maintenance, upgrades, and troubleshooting are genuine engineering time, not a one-time setup cost
- Significant overkill for smaller workloads -- a team spending a meaningful share of its time on cluster maintenance for a low-traffic service is spending that time on infrastructure, not the actual business problem
- Getting graceful shutdown, health checks, and resource limits configured correctly for .NET workloads specifically is a common source of production issues if not done deliberately
- The steepest learning curve of any option in this comparison, even before considering .NET-specific configuration

**Choose this when:** your requirements genuinely need Kubernetes' control surface -- multi-tenant complexity, stateful workloads, specific node/hardware requirements -- and you have (or are willing to build) the operational capacity to run it well.

## Azure Container Apps

Azure Container Apps (ACA) is Microsoft's serverless container platform -- you deploy a container image, and Azure handles scaling, networking, and the underlying infrastructure without you managing a cluster at all. It's specifically positioned as the answer for teams who want cloud-native deployment without Kubernetes' operational weight.

**Strengths:**

- Genuinely serverless -- no cluster to provision, patch, or maintain, which eliminates the largest operational cost of the Kubernetes path entirely
- Deep integration with .NET Aspire's deployment tooling, making it the most natural target for Aspire-based multi-service applications specifically within the Azure ecosystem
- Scales automatically based on demand, including scaling to zero for genuinely idle services -- a real cost advantage for workloads with variable or low traffic
- A well-defined migration path to AKS if you eventually do need Kubernetes' full control surface -- the container images themselves don't change, only how they're orchestrated

**Weaknesses:**

- Real limitations compared to full Kubernetes: no DaemonSets, no privileged containers, no GPU node pool selection, and less granular networking control (no custom ingress controllers or advanced network policies)
- Primarily designed for stateless workloads -- persistent storage options are less flexible than AKS, even with Dapr's state management support layered in
- Azure-specific, meaning genuine platform lock-in -- migrating away means adopting a different deployment model entirely, not a configuration change

**Choose this when:** you're Azure-first, want cloud-native deployment without cluster management overhead, and your workload doesn't need Kubernetes' most advanced capabilities -- which describes a large share of real .NET applications.

## AWS ECS/Fargate

Amazon ECS (Elastic Container Service), typically paired with Fargate for serverless compute, is AWS's answer to managed container orchestration -- conceptually similar to Azure Container Apps' value proposition, but within the AWS ecosystem and with its own distinct operational model.

**Strengths:**

- Removes cluster management the same way ACA does when paired with Fargate, letting AWS handle the underlying compute without you provisioning or patching servers
- Deep integration with the rest of AWS's ecosystem -- IAM, VPC networking, CloudWatch, and Application Load Balancer all integrate natively
- A reasonable middle ground between EC2-based ECS (more control, more management) and Fargate (fully serverless), letting teams choose their own point on that trade-off
- Well-documented and mature, with a long production track record across a huge range of workload types

**Weaknesses:**

- AWS-specific, the same category of lock-in Azure Container Apps carries for Azure -- a genuine platform commitment, not a portable choice
- .NET-specific tooling and documentation is comparatively thinner than the Azure-native options, reflecting AWS's broader, less .NET-centric ecosystem focus
- Choosing between ECS-on-EC2 and ECS-on-Fargate adds a real decision point that Azure Container Apps' simpler model doesn't require

**Choose this when:** you're AWS-first and want managed container orchestration without Kubernetes' operational weight -- the natural choice for teams already invested in AWS's broader ecosystem.

## .NET Aspire (Deploy Workflow)

.NET Aspire's local development story -- covered in this series' Microservices architecture guide -- is well known. Less widely understood is that Aspire 9.2+ also includes a genuine deployment workflow (`aspire publish` and `aspire deploy`) that generates deployment artifacts for multiple targets from the same application model, making it less a deployment target itself and more a consistent layer on top of wherever you're actually deploying.

**Strengths:**

- Generates Docker Compose files, Kubernetes manifests, Bicep templates, or custom publisher output from the same underlying Aspire application model -- one source of truth, multiple possible deployment targets
- For Azure specifically, `azd` (Azure Developer CLI) has first-class Aspire support, handling the entire workflow from provisioning through deployment in one coherent path
- Meaningfully reduces the friction between local development and cloud deployment that used to be a genuine pain point for multi-service .NET applications
- The extensible publisher model means teams aren't locked into Aspire's default output format if they need something more customized

**Weaknesses:**

- This isn't a deployment target in the same sense as the other four options -- it's a workflow layer, meaning you still need to understand and choose an actual target (ACA, AKS, a Kubernetes cluster) underneath it
- Most mature and well-documented specifically for Azure via `azd` -- other targets are supported but with less first-class tooling investment behind them
- Adds a real conceptual layer for teams not already using Aspire for local development, which may not be worth adopting purely for its deployment tooling alone

**Choose this when:** you're already using .NET Aspire for local multi-service development and want that same consistent model to carry through to deployment, particularly if Azure Container Apps or AKS is your actual target.

## IIS

Internet Information Services remains a completely legitimate deployment option for .NET applications running on Windows Server -- either as the reverse proxy in front of Kestrel (out-of-process hosting) or, less commonly today, hosting the application directly in-process.

**Strengths:**

- The natural fit for organizations already running Windows Server infrastructure, with mature, well-understood operational tooling built up over decades
- No containerization or orchestration learning curve required -- for teams without that expertise already, IIS can be the lower-friction starting point
- Deep integration with Windows-specific authentication (Windows Authentication, Active Directory) that's more natural here than in a containerized, cloud-native deployment
- Still fully supported and actively used in real production enterprise environments, not a legacy-only option

**Weaknesses:**

- No cloud-native portability at all -- an IIS deployment is tied to Windows Server, full stop, with none of the "runs anywhere" flexibility containers provide
- Scaling is manual and comparatively slow -- adding capacity means provisioning another Windows Server and configuring a load balancer, nothing like the automatic, on-demand scaling containerized options offer
- A common, easy-to-miss deployment issue: the .NET Core Hosting Bundle needs to be installed on the Windows Server separately from the application itself, and forgetting it is a frequent cause of confusing 500 errors on first deploy
- Increasingly the outlier choice for new projects, as the broader .NET ecosystem's tooling and documentation investment shifts toward containerized, cloud-native deployment

**Choose this when:** you're deploying into an existing Windows Server environment, need deep Windows-specific integration (Active Directory, Windows Authentication), or your organization's operational expertise and infrastructure are already built around IIS.

## How to Decide

A few heuristics that cover most real-world decisions:

**Requirements are genuinely complex -- multi-tenant, stateful, specific hardware needs?** Kubernetes' control surface is worth its operational cost specifically for this class of problem, not as a default starting point.

**Azure-first, want cloud-native deployment without managing a cluster?** Azure Container Apps is purpose-built for exactly this, with a well-defined upgrade path to AKS if you outgrow it later.

**AWS-first, want the equivalent managed container experience?** ECS with Fargate is the natural analog, deeply integrated with the rest of AWS's ecosystem.

**Already using .NET Aspire for local development?** Its deploy workflow (`aspire publish`/`aspire deploy`) carries that same model through to production, particularly smoothly for Azure via `azd`.

**Deploying into existing Windows Server infrastructure, or need deep Windows-specific integration?** IIS remains a completely legitimate, well-supported choice -- not a legacy fallback, but the right fit for a real class of environments.

The single most common mistake across all five options isn't picking the wrong one outright -- it's reaching for more infrastructure than the actual workload needs. A low-traffic internal tool doesn't need Kubernetes; a genuinely complex, multi-tenant platform will eventually outgrow Azure Container Apps' limitations. Match the operational commitment to the actual problem, and be honest about which one you're solving.

## Frequently Asked Questions

### Should I default to Kubernetes for a new .NET project?

Usually not, unless you have a concrete, specific reason -- multi-tenant complexity, stateful workloads needing fine control, or hardware requirements a serverless container platform doesn't support. For most new projects, a managed serverless container platform (Azure Container Apps or AWS ECS/Fargate) delivers most of the containerized benefits with meaningfully less operational overhead.

### What's the actual difference between Azure Container Apps and AKS?

Azure Container Apps is serverless -- no cluster to manage, with real limitations (no DaemonSets, limited node configuration, less networking control) in exchange for that simplicity. AKS is full Kubernetes, giving you the complete control surface at the cost of managing the cluster yourself. The migration path between them is well-defined since your container images don't change, only the orchestration layer around them.

### Is .NET Aspire's deploy workflow a replacement for choosing an actual deployment target?

No -- it's a tooling layer on top of whatever target you choose, generating Docker Compose files, Kubernetes manifests, or Bicep templates from the same application model. You still need to decide where those artifacts actually get deployed; Aspire just makes that transition from local development smoother and more consistent, particularly for Azure via `azd`.

### Is IIS still a reasonable choice for new .NET projects in 2026?

For most new, cloud-native projects, container-based options are now the more common default. IIS remains completely reasonable specifically for organizations already running Windows Server infrastructure or needing deep Windows-specific integration (Active Directory, Windows Authentication) -- it's not obsolete, just no longer the default assumption the way it once was.

### What's the most common mistake when deploying ASP.NET Core to IIS?

Forgetting to install the .NET Core Hosting Bundle on the Windows Server separately from deploying the application itself -- this is a frequently reported cause of confusing 500 Internal Server Errors on a first deployment, since the application code is correct but the server lacks the runtime component needed to host it.

### Should I choose AWS ECS or Azure Container Apps if I'm not committed to a cloud platform yet?

Let your broader cloud platform decision drive this rather than the reverse -- both offer a comparable value proposition (managed containers without cluster management), so the more important question is which cloud ecosystem the rest of your infrastructure, team expertise, and existing services are already built around.

### Does choosing a serverless container platform (ACA or ECS/Fargate) lock me into that cloud forever?

It's real lock-in in the sense that migrating away means adopting a different deployment and orchestration model, not a configuration change -- but your actual container images remain portable. If you build with portable patterns (avoiding cloud-specific SDKs baked directly into application code, for instance), migrating the orchestration layer later is a real but bounded project, not a full rewrite.
