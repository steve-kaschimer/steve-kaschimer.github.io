# Getting Started with AWS ECS/Fargate for .NET Deployment

ECS paired with Fargate is AWS's answer to the same problem Azure Container Apps solves -- run containers without managing a cluster -- but it asks you to make one decision Azure's platform doesn't: EC2-backed ECS or Fargate. That choice determines whether you're managing the underlying compute yourself or handing it entirely to AWS, and it's worth making deliberately rather than defaulting to whichever example you copied first.

This guide covers deploying a .NET application to ECS with Fargate, bootstrapping the task definition and service configuration that matter for .NET workloads specifically, the core deployment workflow, and the best practices for taking advantage of AWS's ecosystem integration without adding unnecessary operational complexity. By the end you'll have a serverless container deployment integrated with the rest of your AWS infrastructure.

If you're deciding between deployment options first, a comparison of the top ways to deploy .NET apps covers where AWS ECS/Fargate fits relative to Docker + Kubernetes, Azure Container Apps, .NET Aspire's deploy workflow, and IIS.

## What You'll Need

- An AWS account
- AWS CLI installed and configured with appropriate credentials
- A containerized .NET application pushed to a container registry (Amazon ECR is the natural choice)

## Pushing Your Image to ECR

```bash
aws ecr create-repository --repository-name myapp-api

aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com

docker tag myapp-api:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp-api:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp-api:latest
```

## Bootstrapping the Ideal Environment

### Define a task definition

```json
{
  "family": "myapp-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "myapp-api",
      "image": "<account-id>.dkr.ecr.us-east-1.amazonaws.com/myapp-api:latest",
      "portMappings": [{ "containerPort": 8080, "protocol": "tcp" }],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/myapp-api",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "secrets": [
        {
          "name": "ConnectionStrings__Default",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:<account-id>:secret:db-connection-string"
        }
      ]
    }
  ]
}
```

Referencing AWS Secrets Manager via `secrets` rather than embedding connection strings directly keeps sensitive configuration out of the task definition itself -- the same discipline that applies across every deployment option in this series.

```bash
aws ecs register-task-definition --cli-input-json file://task-definition.json
```

### Configure health checks in your .NET app

```csharp
builder.Services.AddHealthChecks();
var app = builder.Build();
app.MapHealthChecks("/health");
```

### Create the ECS service

```bash
aws ecs create-service \
  --cluster myapp-cluster \
  --service-name myapp-api-service \
  --task-definition myapp-api \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=<target-group-arn>,containerName=myapp-api,containerPort=8080"
```

Pairing the ECS service with an Application Load Balancer target group is the standard pattern for routing external traffic -- the load balancer also performs health checks against your `/health` endpoint to determine which tasks are ready to receive traffic.

### Choosing between Fargate and EC2-backed ECS

Fargate removes server management entirely -- you specify CPU and memory for your task, and AWS handles the underlying compute. EC2-backed ECS gives you more control (and potentially lower cost at scale) at the price of managing the underlying EC2 instances yourself. Start with Fargate unless you have a specific, informed reason to manage the compute layer directly.

## Core Workflow

- **Register a new task definition revision for each deployment**, rather than modifying one in place -- this preserves a clean history and makes rollback straightforward.
- **Update the service to use the new task definition revision**, letting ECS handle the rolling deployment and health-check-gated traffic shift automatically.
- **Use CloudWatch Logs (configured via the task definition's `logConfiguration`) for centralized log aggregation**, rather than relying on ephemeral container logs for anything beyond local debugging.

```bash
aws ecs update-service \
  --cluster myapp-cluster \
  --service myapp-api-service \
  --task-definition myapp-api:2
```

## Verifying Your Setup

1. **The service registers healthy targets with the load balancer** -- confirm the target group shows healthy targets, not just running tasks
2. **Secrets are referenced via Secrets Manager, not embedded in the task definition** -- confirm sensitive values use `valueFrom`, not plain `environment` entries
3. **Logs flow to CloudWatch correctly** -- confirm application logs are visible in the configured log group
4. **Rolling deployments complete without downtime** -- confirm a new task definition revision deploys with the load balancer correctly shifting traffic to healthy new tasks before old ones terminate

## Best Practices

**Start with Fargate unless you have a specific reason to manage EC2 instances directly.** The operational simplicity is worth the (often modest) cost premium for most workloads, especially early on.

**Reference AWS Secrets Manager for sensitive configuration**, not plain environment variables in the task definition. This is a small amount of extra setup for a meaningful security improvement, consistent with every other deployment option in this series.

**Configure CloudWatch Logs from the start.** Container logs disappear when a task stops -- centralized logging is not optional for any real production troubleshooting.

**Pair ECS services with an Application Load Balancer and configure health checks correctly.** Without them, ECS has no reliable way to know whether a task is actually ready to serve traffic.

**Register new task definition revisions per deployment rather than editing existing ones.** This preserves a clean audit trail and makes rollback to a known-good revision straightforward.

## Comparison with Azure Container Apps

| | AWS ECS/Fargate | Azure Container Apps |
| --- | --- | --- |
| Cloud | AWS | Azure |
| Compute model choice | Fargate (serverless) or EC2-backed | Serverless only |
| Ecosystem integration | IAM, VPC, CloudWatch, Secrets Manager | Azure Monitor, Key Vault, Application Insights |
| .NET-specific tooling | Solid, less .NET-centric than Azure's offerings | Deep, especially via Aspire/azd |
| Scale-to-zero | Requires more manual configuration | Native |

Both deliver a comparable managed-container experience -- the deciding factor is almost always which cloud ecosystem the rest of your infrastructure and team expertise already live in, not a meaningful capability gap between the two platforms.

## Frequently Asked Questions

### Should I use Fargate or EC2-backed ECS?

Start with Fargate unless you have a specific, informed reason to manage the underlying compute yourself -- it removes server management entirely, letting you specify CPU/memory per task rather than provisioning and patching EC2 instances. EC2-backed ECS offers more control and potentially lower cost at scale, at the cost of that added operational responsibility.

### How do I keep secrets like database connection strings secure in ECS?

Reference AWS Secrets Manager (or Systems Manager Parameter Store) via the `secrets` array in your task definition, using `valueFrom` to point at the secret's ARN, rather than embedding the actual value in the task definition's `environment` section.

### Does ECS support scaling to zero like Azure Container Apps?

Not as natively -- ECS services typically maintain a minimum desired count above zero. Achieving scale-to-zero-like behavior requires more manual configuration (such as scheduled scaling or custom automation), whereas Azure Container Apps supports it as a first-class, simpler configuration option.

### How does ECS know when a task is healthy and ready for traffic?

Through health checks configured on the Application Load Balancer's target group, which ECS uses to determine whether a task should receive traffic. Configure your .NET application's `/health` endpoint and point the target group's health check at it.

### What's the difference between updating a service and registering a new task definition?

You always register a new task definition revision to reflect a code or configuration change, then update the service to point at that new revision -- ECS handles the rolling deployment. Editing an existing task definition in place isn't how ECS is designed to work; revisions are immutable once registered.

### Is AWS ECS as well-documented for .NET specifically as Azure's options?

Generally less so -- AWS's documentation and tooling investment is broader and less .NET-centric than Azure's, which makes sense given Azure's tighter integration with the Microsoft ecosystem. ECS itself is mature and well-documented in general, just with somewhat thinner .NET-specific guidance compared to Azure Container Apps or App Service.

### What's the most common mistake in a first ECS/Fargate deployment?

Not configuring CloudWatch Logs from the start, leading to a frustrating debugging experience once a task fails and its ephemeral logs are gone. The second common mistake is embedding secrets directly in the task definition instead of referencing Secrets Manager, leaving sensitive values in plain text within deployment configuration.
