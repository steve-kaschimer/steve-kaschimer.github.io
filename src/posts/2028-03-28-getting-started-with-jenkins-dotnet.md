---
author: Steve Kaschimer
date: 2028-03-28
image: /images/posts/2028-03-28-hero.webp
image_alt: "A standalone server-rack glyph with a pipeline running independently beside it, not fused or connected to any repository outline, emphasizing infrastructure owned entirely separately."
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. Composition centers on a small server-rack glyph on the left, rendered as three stacked rectangles, with a thin pipeline outline running beside it but deliberately not touching or merging with any repository shape, emphasizing infrastructure owned and operated entirely independently. A small wrench-free maintenance-clock icon sits near the base, implying ongoing operational responsibility. Mood is self-hosted, capable, and deliberately unmanaged. Avoid: vendor logos, brand colors, circuit-board textures, gears, or generic checkmark clip art as the dominant motif."
layout: post.njk
site_title: Tech Notes
summary: "Jenkins asks more of you before your first pipeline even runs than any other CI/CD platform - provisioning the server, installing plugins, configuring agents. A setup guide for Declarative Pipeline syntax, Docker agents, and the real ongoing infrastructure cost behind the free software."
tags: ["dotnet", "ci-cd", "devops", "platform-engineering", "tooling"]
title: "Getting Started with Jenkins for .NET"
---

Jenkins asks more of you before your first pipeline even runs than any other platform in this comparison - you're provisioning the server, installing plugins, and configuring agents yourself, work that GitHub Actions or GitLab CI hands you for free the moment you push a YAML file. That upfront cost is exactly the trade this guide is honest about: Jenkins' Groovy-based Jenkinsfiles are genuinely more expressive for complex build logic than any YAML alternative, but that expressiveness sits on top of infrastructure you now own and maintain.

This guide covers installing Jenkins and configuring it for .NET builds, bootstrapping a Jenkinsfile with the plugins and agent setup that matter, the core declarative pipeline patterns, and the best practices for keeping a self-hosted Jenkins instance from becoming its own maintenance burden. By the end you'll have a working .NET pipeline and a clear-eyed understanding of the operational commitment behind it.

If you're deciding between CI/CD platforms first, [a comparison of the top CI/CD platforms for .NET](/posts/2028-02-29-top-5-cicd-platforms-dotnet-compared/) covers where Jenkins fits relative to GitHub Actions, Azure DevOps, GitLab CI, and TeamCity.

## What You'll Need

- A server (VM, container, or physical machine) to host Jenkins - this is genuinely your infrastructure to provision and maintain
- Java (Jenkins' runtime dependency)
- Docker, if you plan to run builds in containers rather than directly on the Jenkins host or dedicated agents

## Installing Jenkins

```bash
# Debian/Ubuntu example
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc]" \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt-get update
sudo apt-get install jenkins
```

Or, for a faster evaluation setup, run Jenkins in Docker:

```bash
docker run -d -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts
```

Complete the setup wizard at `http://localhost:8080`, install suggested plugins, and create an admin user.

## Installing .NET Support

Install the **.NET SDK** on the Jenkins agent(s) that will run builds - either directly on the host, or by using a Docker-based agent with the .NET SDK image:

```bash
# Direct install on a Jenkins agent (Linux example)
wget https://dot.net/v1/dotnet-install.sh
chmod +x dotnet-install.sh
./dotnet-install.sh --channel 8.0
```

## Your First Jenkinsfile

```groovy
// Jenkinsfile
pipeline {
    agent any

    stages {
        stage('Restore') {
            steps {
                sh 'dotnet restore'
            }
        }
        stage('Build') {
            steps {
                sh 'dotnet build --configuration Release --no-restore'
            }
        }
        stage('Test') {
            steps {
                sh 'dotnet test --configuration Release --no-build'
            }
        }
    }
}
```

This is Jenkins' Declarative Pipeline syntax - `pipeline`, `stages`, `steps` - committed as a `Jenkinsfile` in your repository, the same "pipeline as code" principle GitHub Actions' YAML or GitLab's `.gitlab-ci.yml` follow, just expressed in Groovy.

## Bootstrapping the Ideal Environment

### Use a Docker agent for consistent, isolated build environments

```groovy
pipeline {
    agent {
        docker { image 'mcr.microsoft.com/dotnet/sdk:8.0' }
    }

    stages {
        stage('Build') {
            steps {
                sh 'dotnet restore'
                sh 'dotnet build --configuration Release'
            }
        }
    }
}
```

Running builds in a Docker agent using the official .NET SDK image avoids the "works on my Jenkins host but not elsewhere" class of problem that comes from builds depending on whatever happens to be installed directly on a specific agent.

### Cache NuGet packages across builds

```groovy
pipeline {
    agent any
    environment {
        NUGET_PACKAGES = "${WORKSPACE}/.nuget/packages"
    }
    stages {
        stage('Restore') {
            steps {
                sh 'dotnet restore'
            }
        }
    }
}
```

Jenkins doesn't have a first-class, declarative cache mechanism the way GitHub Actions or GitLab CI do - caching typically relies on persistent workspace directories or agent-level persistence, similar in spirit to TeamCity's approach, requiring more manual configuration to get right.

### Multi-stage pipeline with a manual approval gate

```groovy
pipeline {
    agent any
    stages {
        stage('Build and Test') {
            steps {
                sh 'dotnet restore'
                sh 'dotnet build --configuration Release --no-restore'
                sh 'dotnet test --configuration Release --no-build'
            }
        }
        stage('Approval') {
            steps {
                input message: 'Deploy to production?'
            }
        }
        stage('Deploy') {
            steps {
                sh 'echo Deploying to production'
            }
        }
    }
}
```

The `input` step pauses the pipeline and waits for a human to approve before continuing - Jenkins' built-in equivalent of GitHub Actions' required reviewers or Azure DevOps' environment approval gates.

### Use credentials binding instead of hardcoded secrets

```groovy
stage('Deploy') {
    steps {
        withCredentials([string(credentialsId: 'azure-client-secret', variable: 'AZURE_SECRET')]) {
            sh 'echo Deploying with credential'
        }
    }
}
```

Jenkins' Credentials plugin stores secrets encrypted and injects them into the pipeline only for the steps that need them, rather than being hardcoded in the Jenkinsfile or exposed in logs.

## Core Workflow

- **Use Docker agents for build consistency**, avoiding dependence on whatever happens to be installed on a specific long-lived Jenkins agent.
- **Commit the Jenkinsfile to your repository**, the same pipeline-as-code principle every platform in this comparison follows.
- **Use `input` steps for manual approval gates**, and Jenkins' Credentials plugin for any secrets a pipeline needs, rather than hardcoding sensitive values.

## Verifying Your Setup

1. **Builds run consistently regardless of which agent picks them up** - confirm Docker-based agents produce identical results to direct-install agents, or standardize on one approach
2. **Credentials are properly injected and not exposed in logs** - confirm `withCredentials` correctly masks sensitive values in build output
3. **Approval gates actually pause the pipeline** - confirm an `input` step waits for manual action before proceeding to deployment
4. **The Jenkins instance itself is being maintained** - confirm plugin updates, security patches, and agent health are part of an ongoing maintenance routine, not a one-time setup task

## Best Practices

**Budget real, ongoing time for Jenkins maintenance, not just initial setup.** Plugin updates, security patches, and agent management are continuous responsibilities - this is the actual cost behind Jenkins' "free" software, and it's worth planning for explicitly rather than discovering later.

**Use Docker-based agents for build consistency.** This avoids configuration drift between agents and makes your build environment reproducible and portable, closer to the consistency GitHub Actions or GitLab CI provide by default through their managed runner images.

**Use the Credentials plugin for all secrets, never hardcoded values in a Jenkinsfile.** This is table stakes for any CI/CD platform, and Jenkins' credential binding mechanism handles it correctly once configured.

**Take full advantage of Groovy's expressiveness for genuinely complex pipeline logic**, since this is Jenkins' real differentiator over YAML-based alternatives - conditional logic, shared libraries, and dynamic pipeline generation are all more natural here than in a purely declarative YAML format.

**Consider whether Jenkins' operational overhead is actually justified for your team's situation before committing.** It remains the right choice for organizations with strict infrastructure control requirements and existing operational capacity - be honest about whether that describes your team before choosing it purely for its flexibility.

## Comparison with GitHub Actions

| | Jenkins | GitHub Actions |
| --- | --- | --- |
| Hosting | Self-hosted, your infrastructure | Cloud (GitHub-hosted or self-hosted runners) |
| Configuration language | Groovy (Jenkinsfile) | YAML |
| Expressiveness for complex logic | Higher - Groovy is a full language | Lower - YAML with limited expressions/conditionals |
| Setup and maintenance cost | Real, ongoing (server, plugins, agents) | Minimal - managed by GitHub |
| Migration tooling | N/A | Official Importer CLI supports migrating from Jenkins (~70-90% accuracy) |

If you're currently on Jenkins and evaluating whether to migrate, GitHub's Actions Importer is a real, practical starting point - but the reverse decision (choosing Jenkins fresh) should be driven by a genuine need for its flexibility and self-hosted control, not familiarity alone.

## Frequently Asked Questions

### Is Jenkins actually free?

The software itself is free and open source, but infrastructure and maintenance are a real, ongoing cost - server hosting, plugin updates, security patching, and agent management all require time and money. Estimates put this at $800-2,500/month for a 20-person team once compute, storage, and engineer maintenance time are factored in.

### How do I cache NuGet packages in Jenkins?

Jenkins doesn't have a first-class declarative caching mechanism like GitHub Actions' `cache-dependency-path` or GitLab's `cache` block - the common approach is persisting a packages directory within the workspace or relying on agent-level file system persistence across builds, which requires more manual setup to get right.

### Should I use Docker agents or install .NET directly on Jenkins agents?

Docker agents are generally the better choice for build consistency - they avoid dependence on whatever happens to be installed on a specific long-lived agent, and they're portable in the same way container-based builds are portable across the other platforms in this comparison.

### How do I add a manual approval step before deployment in Jenkins?

Use the `input` step within a pipeline stage, which pauses execution and waits for a human to approve (or reject) before the pipeline continues - Jenkins' built-in mechanism for the same kind of approval gate GitHub Actions provides through required reviewers on environments.

### Can I migrate from Jenkins to GitHub Actions if the maintenance burden becomes too much?

Yes - GitHub's official Actions Importer CLI specifically supports migrating from Jenkins, with reported conversion accuracy in the 70-90% range for typical pipelines. It's a genuine, practical path if Jenkins' operational overhead has become disproportionate to the customization you're actually using.

### Why would I choose Jenkins over a YAML-based CI tool for a new .NET project?

Primarily for genuinely complex pipeline logic that Groovy expresses more naturally than YAML, or for organizational requirements around self-hosted infrastructure control that a managed platform can't satisfy. For most new, simpler projects, the operational overhead isn't justified relative to what a managed platform like GitHub Actions provides out of the box.

### What's the most common mistake in a first Jenkins setup for .NET?

Underestimating the ongoing maintenance commitment - treating Jenkins as a one-time setup rather than infrastructure requiring continuous plugin updates, security patches, and agent management. The second common mistake is running builds directly on inconsistent, long-lived agents instead of using Docker agents for reproducible, portable build environments.
