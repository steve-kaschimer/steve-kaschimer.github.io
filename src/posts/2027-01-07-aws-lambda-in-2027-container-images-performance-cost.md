---
author: Steve Kaschimer
date: 2027-01-07
image: /images/posts/2027-01-07-hero.webp
image_prompt: "A dark-mode technical editorial illustration on a near-black background with electric teal, amber, and off-white accents. The composition is split into two halves by a thin vertical divider. Left half labeled 'ZIP' shows a small flat package icon with a compact size tag '48 MB' in off-white and a fast teal duration bar. Right half labeled 'Container Image' shows a layered stack of rectangles (image layers) with a size tag '1.2 GB' in amber and a slightly longer duration bar. Below the split, a rising-then-flattening curve plots memory on the x-axis against total cost on the y-axis, with a marked sweet-spot dot glowing teal near the knee of the curve. In the lower corner, a monospaced price label '$0.20 / 1M' glows teal. The mood is precise, engineering-first, cost-aware. Avoid: cloud provider logos, brand colors, circuit-board textures, generic gears or dollar-sign clip art."
layout: post.njk
site_title: Tech Notes
summary: "Lambda's $0.20-per-million headline hides the real bill: GB-seconds and cold starts. This 2027 field guide covers container images vs. ZIP, SnapStart, right-sizing memory for CPU, and the break-even math for when to leave Lambda for a container."
tags: ["aws", "serverless", "cost-optimization", "lambda", "devops"]
title: "AWS Lambda in 2027: Container Images, Performance Insights, and the $0.20/Million Invocation Reality"
---

The number everyone quotes is $0.20 per million requests. It's real and cheap - and almost never what your Lambda bill is made of. Request charges are a rounding error next to duration charges: the GB-seconds you burn while the function runs. A function billed at $0.20 per million can easily cost $8 per million in duration, and $20 if provisioned wrong. Ignore the request line; understand the duration line.

The other half of the story is latency, and on Lambda that means cold starts - init cost paid per new execution environment, not per request, but the number users feel if traffic is spiky or the language slow to boot. Cold starts and duration are linked too: the memory setting that fixes one moves the other, and the container image that solves your dependency problem changes both.

This post is the 2027 field guide to the parts that actually cost money: container images vs. ZIP and when each wins, cold-start numbers per language, SnapStart and provisioned concurrency and the trade-off each is really making, right-sizing memory as a way to buy CPU, and the break-even arithmetic that tells you when a function has quietly outgrown Lambda. This is not a Lambda 101 - it assumes you've shipped functions and read a billing dashboard with a raised eyebrow.

***

## ZIP vs. Container Image

Lambda gives you two packaging formats, and the choice is not cosmetic - it changes size limits, build ergonomics, base-image control, and cold-start behavior.

A ZIP deployment is the original model: your handler code plus dependencies, zipped, uploaded (or pulled from S3). The runtime is AWS's - you pick `nodejs22.x` or `python3.13` and AWS supplies the interpreter, OS, and Lambda Runtime API glue. The hard limit is **250 MB unzipped** (code plus layers), generous until you need a native binary, a machine-learning library, or a headless browser, at which point it's a wall.

A container image is an OCI image you build and push to Amazon ECR, then point the function at it. The limit is **10 GB**, and you control the base image and system libraries - but you now own a Dockerfile and an ECR repository, facing the same supply-chain scrutiny as any other container (see [Container Image Security in CI](/posts/2026-07-17-container-image-security-trivy-github-advanced-security/) for a Trivy-plus-SARIF pattern that applies unchanged).

Here is the same Node.js function both ways. ZIP, built with the SAM CLI or a plain `zip`, has no Dockerfile at all - just a directory:

```text
my-function/
├── index.mjs          # exports.handler
├── package.json
└── node_modules/      # npm ci --omit=dev
```

```bash
npm ci --omit=dev
zip -rq function.zip index.mjs node_modules package.json
aws lambda update-function-code \
  --function-name order-processor \
  --zip-file fileb://function.zip
```

The container version uses AWS's Lambda base image, which already contains the Runtime Interface Client - the process that speaks the Lambda Runtime API and invokes your handler:

```dockerfile
FROM public.ecr.aws/lambda/nodejs:22

COPY package*.json ${LAMBDA_TASK_ROOT}/
RUN npm ci --omit=dev

COPY index.mjs ${LAMBDA_TASK_ROOT}/

# handler is <file>.<exported-function>
CMD [ "index.handler" ]
```

```bash
docker build -t order-processor .
docker tag order-processor:latest \
  123456789012.dkr.ecr.us-east-1.amazonaws.com/order-processor:latest
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/order-processor:latest

aws lambda update-function-code \
  --function-name order-processor \
  --image-uri 123456789012.dkr.ecr.us-east-1.amazonaws.com/order-processor:latest
```

Two things are worth internalizing. First, `${LAMBDA_TASK_ROOT}` is where the runtime looks for your handler - copy code there, not to an arbitrary `WORKDIR`. Second, `CMD` is not a shell command; it's the handler reference (`file.export`), overriding the base image's default. A non-AWS base image (Debian, Alpine, distroless) needs the Runtime Interface Client installed yourself, plus the Runtime Interface Emulator for local testing - AWS publishes both. Reach for a custom base only when you genuinely need it.

The old folklore is that container images cold-start much slower than ZIP. That was true years ago, not now: Lambda flattens the image, caches it, and streams only the chunks an invocation touches, so a well-built image cold-starts within a couple hundred milliseconds of the equivalent ZIP. What *does* still hurt: a bloated image with unused layers, and the first invocation after a deploy, which pays a one-time optimization cost. The image you don't ship is the image you don't pay to load.

**Pick ZIP when** your dependencies fit comfortably under 250 MB, you want the fastest possible deploy loop, and you're happy on AWS's managed runtime. **Pick a container image when** you need large or native dependencies, you want local/prod parity via the same image, or you already have a container build pipeline and want Lambda to be one more push target rather than a special case.

***

## Cold Starts, Measured Per Language

A cold start is the init phase: Lambda provisions a new execution environment, loads your code, and runs everything outside the handler (imports, static initializers, connection pools) before the first request is served. You pay for init time on the first request into each environment. Once warm, that environment serves subsequent requests with no init cost until Lambda reclaims it.

The single biggest driver of cold-start time is the runtime's startup model, splitting cleanly into three tiers. The numbers below are representative init durations for minimal-dependency functions at 1024 MB in `us-east-1`; treat them as orders of magnitude, not guarantees.

| Runtime | Cold start (init), minimal deps | Tier |
|---|---|---|
| Rust (`provided.al2023`) | 20-100 ms | Compiled, fast |
| Go (`provided.al2023`) | 80-150 ms | Compiled, fast |
| Python 3.13 | 120-250 ms | Interpreted |
| Node.js 22 | 150-300 ms | Interpreted |
| Container image (Node, lean) | 200-450 ms | Interpreted |
| .NET 8 (no SnapStart) | 600-2,500 ms | JIT/VM, slow |
| Java 21 (no SnapStart) | 1,500-6,000 ms | JVM, slow |
| Java 21 (SnapStart) | 200-600 ms | JVM, snapshot-restored |
| .NET 8 (SnapStart) | 200-500 ms | Snapshot-restored |

Three takeaways. First, for Node and Python the runtime itself is not your problem - a 2-second cold start is almost always your dependency graph (a fat SDK import, an ORM, a bundle you never tree-shook), not the interpreter. Bundle and minify, import only the SDK clients you use, move heavy work out of module scope. Second, Go and Rust are in a different league; a compiled runtime erases the problem if cold start is genuinely your constraint. Third, the JVM and .NET tiers look alarming until you apply SnapStart, which collapses them into the same range as interpreted languages. If you're running Java or .NET without SnapStart, fix that first - it's free for Java.

One note: the init duration CloudWatch reports as `Init Duration` only appears on cold-start invocations. Query it in Log Insights, alarm on the p99. Cold-start regressions are almost always shipped by accident in a dependency bump, invisible until you're watching the right metric.

***

## SnapStart and Provisioned Concurrency

Two features attack cold starts, and they are not the same lever. Confusing them is expensive in both directions.

**SnapStart** takes a Firecracker microVM snapshot of your environment *after* initialization completes, then restores from it on each cold start instead of re-running init. The expensive one-time work - JVM class loading, .NET JIT warm-up, static initialization - happens once at deploy time, and every subsequent cold start restores the pre-warmed image. For Java it turns 4-second cold starts into sub-second ones at **no additional charge**. It now also covers Python and .NET, though those runtimes are billed for snapshot caching and restoration - still cheap, but verify current pricing before assuming it's a no-op.

SnapStart has one sharp edge to design around: the snapshot freezes state. Anything captured during init - a database connection, a cached credential, a seeded random number generator, a "current time" - is restored identically into every environment. A connection pool snapshotted open restores pointing at a socket that no longer exists. The fix is runtime hooks (`beforeCheckpoint`/`afterRestore` in the JVM, equivalent elsewhere): tear down stateful things before the snapshot, re-establish after restore. The classic bug is every environment sharing one snapshotted random seed and generating identical "unique" IDs. Design for it and it's a non-issue; ignore it and it's a production incident.

**Provisioned concurrency** is a different bargain entirely. It keeps N execution environments initialized and warm at all times, so the first N concurrent requests never see a cold start. It doesn't make init faster - it pays to keep init from happening, billed per GB-second for the *entire time it's provisioned*, plus a reduced duration rate for requests it serves.

That "whether or not a request arrives" clause is the whole trade-off: always-on compute cost bolted onto a pay-per-use service. It's right for a narrow case - predictable, latency-sensitive traffic where a cold start is unacceptable, a strict-p99 API, a synchronous checkout path. It's wrong for spiky, low-volume traffic, where you'll pay to keep environments warm that mostly sit idle. If you're reaching for it to fix a slow Java or .NET cold start, try SnapStart first - it may solve the problem for free.

Fix init time first (dependencies, bundling, SnapStart), and add provisioned concurrency only once cold start is already fast and you still need to eliminate it for a known, sustained pattern. Papering over a 4-second init you never optimized is paying twice for one problem.

***

## Right-Sizing Memory = Right-Sizing CPU

The most consequential Lambda setting is memory, and its name is misleading: memory is a proxy, since **CPU scales linearly with what you allocate.** At roughly 1,769 MB you get one full vCPU; below that a fraction of a core, above it up to about six vCPUs at the 10 GB ceiling. Network and disk throughput scale with it too.

This is why "set it to 128 MB to save money" is the most common and most expensive mistake on Lambda. A low memory setting starves a CPU-bound function, it runs longer, and you pay the extra duration - often more than higher memory with a shorter run would have cost. Here is a CPU-bound function (image resize, JSON transform, compression) measured across memory settings, with duration cost per million invocations on x86 (`us-east-1`, $0.0000166667 per GB-second):

| Memory | ~vCPU | Duration | GB-seconds / inv | Duration $ / 1M |
|---|---|---|---|---|
| 128 MB | 0.07 | 3,200 ms | 0.410 | $6.83 |
| 512 MB | 0.29 | 900 ms | 0.450 | $7.50 |
| 1024 MB | 0.58 | 470 ms | 0.470 | $7.83 |
| 1769 MB | 1.00 | 300 ms | 0.518 | $8.63 |
| 3008 MB | 1.70 | 290 ms | 0.852 | $14.20 |

Read the shape of that curve. From 128 MB to 1,769 MB, cost is nearly flat - $6.83 to $8.63 per million - while latency drops by more than 10x, from 3.2 seconds to 300 milliseconds: an enormous latency win for almost no extra money. At 3,008 MB, duration barely improves (290 ms vs. 300 ms - CPU scaling has stopped helping) but cost jumps 65%. That's the knee of the curve; past it you're paying for CPU the function can't use.

The rule: for CPU-bound work, cost is roughly constant across a wide memory band while latency falls sharply, so push memory to the point where duration stops improving, and stop there. 128 MB "to save money" is a false economy - 10x latency for a 20% saving on a bill that's already small.

The exception is **I/O-bound** functions - a handler waiting 200 ms on DynamoDB or an API and computing for 5 ms. CPU buys nothing there; the function is idle, not computing, and more memory just multiplies GB-second cost for time spent blocked. Size memory to the working set and no more. Tell the two apart by measuring: bump memory, watch duration. Falls, you're CPU-bound; flat, you're I/O-bound - stop. Doing this by hand is tedious, which is why AWS Lambda Power Tuning exists - it sweeps memory and plots the cost/latency curve for you (a post of its own, coming). The manual version above catches what matters: starving a CPU-bound function, over-feeding an I/O-bound one.

***

## The Cost Model: Break-Even Analysis

Now the arithmetic that decides whether a function should be on Lambda at all. Lambda's bill has exactly two components:

- **Requests:** $0.20 per 1,000,000 invocations.
- **Duration:** GB-seconds × the per-GB-second rate - $0.0000166667 on x86 in `us-east-1`, or $0.0000133334 on Arm (Graviton), about 20% cheaper and usually a one-line change worth taking.

GB-seconds per invocation is `(memory_MB / 1024) × duration_seconds`. A 1024 MB function running 200 ms: `1.0 × 0.2 = 0.2` GB-seconds, or `0.2 × 0.0000166667 = $0.00000333` duration plus `$0.0000002` request = **$0.00000353** per invocation. Multiply by volume:

| Volume / month | Request $ | Duration $ | Total $ |
|---|---|---|---|
| 1,000,000 | $0.20 | $3.33 | $3.53 |
| 10,000,000 | $2.00 | $33.33 | $35.33 |
| 100,000,000 | $20.00 | $333.33 | $353.33 |
| 1,000,000,000 | $200.00 | $3,333.33 | $3,533.33 |

Notice the request line is 6% of the total at every scale. That's what the "$0.20 per million" headline buries: your bill is duration, and duration is memory times time. Halving either halves the bill; the request charge barely moves.

The break-even question isn't about request volume in the abstract - it's about **utilization**. Lambda's premium is that you pay only when code runs; the flip side is that code running *constantly* pays a premium for always-on compute you could rent more cheaply as a container. Work in units of sustained concurrency: one environment for the 1024 MB / 200 ms function above serves `1 / 0.2 = 5` requests per second continuously busy - about 13,000,000 invocations per month. At $0.00000353 each, one saturated Lambda environment 24/7 costs roughly **$46/month**.

Compare always-on compute delivering the same ~0.58 vCPU and 1 GB: a Fargate task at 0.5 vCPU / 1 GB runs about **$18/month** - so a Lambda environment busy essentially all the time costs about 2.5x its Fargate equivalent. The crossover isn't exact - it depends on memory setting, duration, and container packing efficiency - but the heuristic holds: **Lambda wins until a function would keep one or more environments continuously busy.** Below roughly 40-50% sustained utilization of an always-on instance, Lambda is cheaper and you avoid managing anything; above it, containers pull ahead and the gap widens with volume.

So the answer to "is Lambda cheaper than ECS?" is always "at what utilization?" A function firing 200,000 times a day in bursts, idle the rest of the time, is a perfect Lambda workload - you pay for bursts, nothing for silence. One processing a steady 500 requests per second around the clock is quietly running several always-on cores billed at Lambda's premium rate, and belongs on Fargate or ECS/EC2 behind a queue. The trap: the second function often *started* as the first and grew into an always-on workload without anyone re-checking the math. Re-run the break-even when traffic profiles change, not just at first deploy.

Two adjustments move the line toward Lambda first: switch to Arm (20% off duration), and right-size memory per the previous section. Do both, then decide.

***

<div class="callout-box">

## Decision Checklist

Run this against every function that costs real money or serves latency-sensitive traffic:

- [ ] **Know your bill's shape.** Duration dominates; requests are ~6%. Optimize GB-seconds (memory × time), not request count.
- [ ] **Right-size memory by measurement.** Bump memory, watch duration. If duration falls, you're CPU-bound - keep going to the knee of the curve. If it's flat, you're I/O-bound - stop. Never default to 128 MB "to save money."
- [ ] **Switch to Arm/Graviton** unless a native dependency blocks it - ~20% cheaper duration for the same work.
- [ ] **Track `Init Duration` (p99).** It only logs on cold starts. Alarm on it so a dependency bump can't silently regress cold start.
- [ ] **Fix cold start in order:** trim dependencies and bundle first; apply SnapStart for Java (free) and .NET/Python (cheap); add provisioned concurrency last, only for known sustained latency-critical traffic.
- [ ] **If using SnapStart,** tear down and re-establish stateful resources (connections, credentials, RNG seeds) in the restore hooks - a snapshotted connection or seed is a production bug.
- [ ] **Choose packaging deliberately.** ZIP under 250 MB for the fast path; container image for large/native deps or build parity. Scan container images in CI before they ship.
- [ ] **Re-run the break-even when traffic changes.** Estimate sustained concurrency; if a function keeps one or more environments busy ~24/7 (above ~40-50% utilization of an always-on instance), price it against Fargate/ECS - it has likely outgrown Lambda.
- [ ] **Deploy with OIDC, not stored keys.** Whether you push a ZIP or an ECR image from CI, authenticate with short-lived tokens ([OIDC in GitHub Actions](/posts/2026-06-12-oidc-in-github-actions/)) rather than long-lived AWS credentials.

</div>

Lambda in 2027 is a mature runtime with the sharp edges filed down: container images cold-start about as fast as ZIP, SnapStart neutralizes the JVM's startup penalty, and the pricing model is legible once you look past the request charge. The mistakes that remain are ones of inattention - the function pinned at 128 MB paying 10x latency for a 20% saving, the Java function eating 4-second cold starts because nobody enabled a free feature, the always-on workload that grew out of a bursty one and now pays a serverless premium for server work. None require deep expertise to fix - just measuring the two numbers that matter, `Init Duration` and GB-seconds, and acting on what they say.

***

Questions about profiling a specific function, modeling the break-even for your traffic, or deciding between Lambda and a container for a given workload? Reach out.

[steve.kaschimer@slalom.com](mailto:steve.kaschimer@slalom.com)
