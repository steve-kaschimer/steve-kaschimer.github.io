# Volume III Assembly Instructions

You are assembling **Volume III** of the **Modern Application Architecture Patterns in .NET** series.

Your input is a packaged Volume III directory or ZIP containing Markdown articles, companion source-code examples, Northstar Architecture Lab stages, downloadable archives, diagrams, images, and supporting README files.

Your job is to unpack the supplied package and produce a clean, publishable Volume III article series with the correct downloadable content attached to the correct articles.

Do not redesign the series.

Do not invent missing articles.

Do not invent source-code downloads.

Do not rewrite article prose unless required to repair obvious formatting problems.

Preserve the author's voice and the intended architectural progression.

---

# 1. Goal

For each Volume III article:

1. Preserve the article's Markdown content.
2. Preserve and validate its frontmatter.
3. Place it in the correct publication sequence.
4. Identify any companion source-code or Northstar download that materially supports it.
5. Add a consistent companion-download section where appropriate.
6. Preserve the intended "pressure before pattern" learning sequence.
7. Generate previous/next navigation.
8. Generate a Volume III index.
9. Validate all internal links, images, and downloadable artifacts.
10. Produce an assembly report.

The final output should be a self-contained directory that can be published or handed to another build/publishing system.

---

# 2. Core Editorial Principle

The series teaches architecture as an evolution.

Preserve this progression whenever the supplied material supports it:

```text
simple system
    ↓
new pressure
    ↓
failure becomes visible
    ↓
pattern introduced
    ↓
trade-offs explored
    ↓
system evolves
```

Do not reorganize the series into a simple alphabetical catalog of patterns.

When a pressure/failure article or lab precedes the implementation article or lab, preserve that relationship.

The key teaching question is:

> What changed that made the simpler architecture insufficient?

---

# 3. Unpack the Volume

Extract the supplied Volume III archive into a working directory.

Preserve the original directory structure during discovery.

Look recursively for:

```text
*.md
*.zip
*.cs
*.csproj
*.sln
*.slnx
*.json
*.yaml
*.yml
*.ps1
*.sh
*.png
*.jpg
*.jpeg
*.svg
*.webp
README*
Dockerfile
compose.yaml
docker-compose.yml
```

Ignore build/cache directories unless explicitly needed:

```text
bin/
obj/
.git/
.vs/
.idea/
node_modules/
TestResults/
```

Do not delete or rename anything during this initial discovery phase.

---

# 4. Identify Volume III Articles

Identify Markdown files that belong to Volume III.

Prefer explicit frontmatter such as:

```yaml
---
title: "Example Article"
slug: "example-article"
series: "Modern Application Architecture Patterns in .NET"
volume: 3
category: "..."
order: 1
dotnet: "10"
csharp: "14"
status: "draft"
---
```

A Markdown file should be treated as a Volume III article when:

- `volume: 3` is present; or
- the surrounding directory and content clearly identify it as Volume III material.

If a file is ambiguous, report it rather than silently guessing.

---

# 5. Determine Canonical Article Order

Use the frontmatter fields:

```text
volume
order
```

to determine publication sequence.

For Volume III, sort articles by ascending `order`.

Do not sort alphabetically.

Do not rely on filesystem order.

If two articles have the same `order`, stop and report:

```text
DUPLICATE_ARTICLE_ORDER
```

If an article is missing `order`, report it rather than inventing a position unless the supplied content makes the intended order completely unambiguous.

---

# 6. Normalize Article Filenames

The preferred assembled filename format is:

```text
NN-slug.md
```

Examples:

```text
01-introducing-volume-iii.md
02-distributed-systems-foundations.md
03-partitioning-and-sharding.md
```

Rules:

- Use a zero-padded article order.
- Use the canonical `slug` from frontmatter.
- Preserve the original source file.
- Rename only the copy placed into the assembled output.

If the article already has the canonical filename, leave it unchanged.

---

# 7. Preserve Frontmatter

Do not remove existing frontmatter.

Validate that each article contains, when supplied:

```yaml
title:
slug:
description:
series:
volume:
category:
order:
dotnet:
csharp:
status:
```

The expected series name is:

```text
Modern Application Architecture Patterns in .NET
```

The current code baseline for the series is:

```text
.NET 10
C# 14
```

Do not change older-version metadata if an article intentionally discusses an older version.

Do not invent missing descriptions, titles, or categories unless they are explicitly provided elsewhere in the supplied package.

---

# 8. Identify Companion Source Code and Downloads

Search the unpacked content for downloadable source code that materially supports each article.

Possible companion artifacts include:

```text
Northstar Architecture Lab ZIPs
standalone example ZIPs
sample projects
solution folders
Docker Compose labs
scripts
focused code examples
```

Match an article to a companion artifact using the strongest available evidence:

1. explicit article metadata;
2. matching article slug;
3. matching pattern name;
4. matching Northstar stage;
5. matching README description;
6. matching download filename;
7. clear semantic relationship.

Do not attach a download simply because its name is vaguely related.

The source code should materially demonstrate the article's concept.

---

# 9. Northstar Architecture Lab Relationships

When Volume III material references the Northstar Architecture Lab, preserve the evolutionary relationship.

Northstar stages may include both:

```text
pressure stage
implementation stage
```

For example:

```text
v8  Integration Event Pressure
v9  Transactional Outbox
```

or:

```text
v20 Read Performance Pressure
v21 Cache-Aside
```

If both are supplied, preserve both in the article.

Do not show only the finished implementation if the prior stage demonstrates why the pattern exists.

---

# 10. Companion Source Code Section

When an article has relevant downloadable source code, add a section near the end of the article.

Use this general format:

```markdown
## Companion Source Code

A runnable or focused example for this article is included with the companion source code.

**Download:** [Download the companion project](../downloads/EXAMPLE.zip)

### What to Try

- Run the example normally.
- Read the included README.
- Reproduce the failure or pressure scenario described in the article.
- Observe how the pattern changes the system's behavior.
```

If the companion is a Northstar stage, include:

```markdown
**Northstar stage:** `v17-resilience-observability`
```

If there are distinct pressure and implementation stages, use:

```markdown
## Try It in Northstar

**Pressure stage:** `v8-integration-event-pressure`

This stage deliberately reproduces the failure that motivates the pattern.

**Implementation stage:** `v9-transactional-outbox`

This stage introduces the pattern and demonstrates the resulting behavior.

[Download the implementation lab](../downloads/northstar-v09-transactional-outbox.zip)
```

Only add this section when the companion material genuinely supports the article.

If no meaningful download exists, do not add an empty source-code section.

---

# 11. Prefer Runnable Examples Where Appropriate

When classifying companion content, think in three categories.

## Runnable Example

Use when the reader can launch the example and observe the pattern.

Typical examples:

```text
CQRS
Transactional Outbox
Inbox / Idempotent Consumer
Saga
Retry
Circuit Breaker
Dead Letter Queue
Cache-Aside
Health Checks
Rate Limiting
Observability
```

## Focused Example

Use for a small project or test suite centered on one concept.

Typical examples:

```text
Value Object
Aggregate
Optimistic Concurrency
Feature Flags
Result pattern
```

## Conceptual Example

Use when a toy implementation would teach the wrong lesson.

Typical examples:

```text
Distributed Lock
Leader Election
Strangler Fig
Sidecar
```

These may use diagrams, tests, infrastructure configuration, or platform examples instead of pretending to be production-ready distributed algorithms.

---

# 12. Preserve Failure Experiments

Where a companion README includes a "break it" or failure scenario, preserve it.

These experiments are part of the teaching material.

Examples may include:

```text
stop RabbitMQ
publish a duplicate event
make Payment decline
make Payment unavailable
delay a dependency
stop a worker
trigger cache expiration
produce a concurrency conflict
disable a sidecar
```

The source-code section should encourage readers to reproduce the relevant failure, not merely run the happy path.

---

# 13. Build the Volume III Article Directory

Assemble articles into:

```text
volume-iii/
└── articles/
    ├── 01-....md
    ├── 02-....md
    ├── 03-....md
    └── ...
```

Every Volume III article should appear exactly once.

Do not include drafts or duplicate revisions unless they are part of the intended canonical series.

If two versions appear to be competing revisions, report them for review rather than silently selecting one.

---

# 14. Build the Downloads Directory

Place downloadable companion archives into:

```text
volume-iii/
└── downloads/
```

Only copy artifacts that are actually referenced by the assembled Volume III articles or index.

Preferred filenames should be readable and stable.

Example:

```text
northstar-v09-transactional-outbox.zip
northstar-v13-saga.zip
northstar-v21-cache-aside.zip
```

If the supplied archive already has a clear canonical filename, it may be preserved.

Do not create fake ZIP files or placeholder downloads.

---

# 15. Preserve Referenced Images and Diagrams

If articles reference diagrams or images, copy them into:

```text
volume-iii/
└── assets/
    ├── images/
    └── diagrams/
```

Update relative Markdown paths as needed.

Validate that every referenced asset exists.

Do not discard images simply because the article can technically render without them.

---

# 16. Generate Previous/Next Navigation

At the end of every article, add navigation based on article `order`.

Use a consistent block such as:

```markdown
---

[← Previous: Previous Article](01-previous-article.md)  
[Volume III Index](../README.md)  
[Next: Next Article →](03-next-article.md)
```

Rules:

- The first article has no Previous link.
- The final article has no Next link.
- The Volume III Index link should always resolve.
- Navigation comes from canonical article order, not filename discovery order.

If an article already contains hand-authored navigation, do not duplicate it. Replace or normalize only when clearly necessary.

---

# 17. Build the Volume III Index

Create:

```text
volume-iii/README.md
```

Use a structure similar to:

```markdown
# Modern Application Architecture Patterns in .NET — Volume III

Volume III continues the series by exploring distributed systems,
cloud architecture, and the forces that appear as applications move
beyond a single process or deployment boundary.

The articles preserve the series' core approach:

> Start simple, expose the pressure, then introduce the pattern that
> earns its complexity.

## Articles

1. [Article One](articles/01-article-one.md)
2. [Article Two](articles/02-article-two.md)
3. [Article Three](articles/03-article-three.md)

...

## Companion Source Code

Articles with runnable or focused examples include direct download links.

The companion examples are designed to demonstrate both:

- the normal behavior; and
- the failure mode that caused the pattern to become useful.
```

Generate the article list automatically from frontmatter.

Do not maintain the list independently from the article files.

---

# 18. Optional Article Entry Details

If useful, the Volume III index may include short descriptions.

Example:

```markdown
1. [Partitioning](articles/01-partitioning.md)  
   Why data and workload partitioning become necessary as scale grows.

2. [Consistent Hashing](articles/02-consistent-hashing.md)  
   How distributed systems place keys while minimizing remapping.
```

Use existing `description` frontmatter.

Do not invent summaries when descriptions are absent.

---

# 19. Optional Download Index

If Volume III contains many companion downloads, create:

```text
volume-iii/DOWNLOADS.md
```

Example:

```markdown
# Volume III Companion Downloads

| Article | Download |
|---|---|
| Transactional Outbox | [Northstar v9](downloads/northstar-v09-transactional-outbox.zip) |
| Saga | [Northstar v13](downloads/northstar-v13-saga.zip) |
| Cache-Aside | [Northstar v21](downloads/northstar-v21-cache-aside.zip) |
```

Only include actual files.

---

# 20. Suggested Final Directory Structure

The assembled result should generally look like:

```text
volume-iii/
│
├── README.md
├── ASSEMBLY-REPORT.md
├── DOWNLOADS.md              # optional
│
├── articles/
│   ├── 01-....md
│   ├── 02-....md
│   ├── 03-....md
│   └── ...
│
├── downloads/
│   ├── companion-example-1.zip
│   ├── companion-example-2.zip
│   └── ...
│
└── assets/
    ├── images/
    └── diagrams/
```

If the supplied content includes code intended to remain expanded rather than zipped, an optional structure is:

```text
volume-iii/
└── source/
```

Do not duplicate large source trees unnecessarily if a downloadable archive already provides the intended artifact.

---

# 21. Preserve Article Prose

Do not rewrite article prose merely to make every article sound identical.

Permitted edits include:

```text
fix broken Markdown
normalize obvious heading mistakes
repair code fences
add navigation
add companion source sections
repair relative artifact links
```

Do not perform broad stylistic rewriting.

Do not shorten or expand articles without explicit instruction.

Do not replace code examples with your own preferred architecture.

---

# 22. Preserve Code Examples

Do not rewrite working C# examples merely to normalize style.

Preserve:

```text
code behavior
pattern intent
comments
failure scenarios
```

The articles target modern .NET and C#, but assembly is not the time for unrelated code modernization.

If a code sample obviously conflicts with its own frontmatter version, report the mismatch.

---

# 23. Validate Article Frontmatter

Before completing assembly, verify for each article:

```text
title exists
slug exists
volume = 3
order exists
order is unique
title is non-empty
slug is non-empty
```

Also check that:

```text
filename order == frontmatter order
filename slug == frontmatter slug
```

Report any mismatch.

---

# 24. Validate Internal Markdown Links

Check every relative Markdown link in every article.

Validate:

```text
linked article exists
linked README exists
linked asset exists
linked download exists
```

If links use heading anchors, validate those where practical.

Broken internal links must be reported.

---

# 25. Validate Download Links

For every generated or existing companion link:

```text
target file exists
target is non-empty
target filename matches intended artifact
```

For ZIP archives, also verify that the file can be opened as a valid ZIP.

Do not generate a link to an artifact that was not found.

---

# 26. Validate Images and Diagrams

Every referenced local image must exist.

Check common Markdown syntax:

```markdown
![Description](../assets/diagrams/example.png)
```

If an image is missing, report it.

Do not remove the image reference just to make validation pass unless explicitly instructed.

---

# 27. Validate Navigation

For each article:

- Previous link points to the previous article.
- Next link points to the next article.
- Volume III Index link resolves.
- First article has no invalid Previous link.
- Last article has no invalid Next link.

If article A links to article B as Next, B should link back to A as Previous.

---

# 28. Validate the Volume III Index

Confirm:

- Every assembled article appears exactly once.
- Article order matches frontmatter order.
- No nonexistent article is listed.
- All links resolve.
- Titles match article frontmatter.

---

# 29. Validate Companion Mappings

For every article with companion content, verify that the artifact actually demonstrates the subject.

When Northstar pressure and implementation stages are supplied, verify that:

```text
pressure stage precedes implementation stage
```

unless the supplied content explicitly says otherwise.

Example:

```text
v8 -> v9
v10 -> v11
v12 -> v13
v20 -> v21
v24 -> v25
v26 -> v27
```

---

# 30. Detect Duplicates

Check for:

```text
duplicate article order
duplicate slug
duplicate canonical filename
multiple source archives mapped to the same artifact without explanation
```

If two article files appear to be different revisions of the same article, report:

```text
REVISION_CONFLICT
```

Do not silently discard one.

---

# 31. Detect Missing Expected Artifacts

If an article explicitly references a companion project that is absent, report:

```text
MISSING_COMPANION_DOWNLOAD
```

If an article references a Northstar stage that is absent, report:

```text
MISSING_NORTHSTAR_STAGE
```

If an image is referenced but absent, report:

```text
MISSING_ASSET
```

Do not invent replacements.

---

# 32. Assembly Report

Create:

```text
volume-iii/ASSEMBLY-REPORT.md
```

Use a clear format such as:

```markdown
# Volume III Assembly Report

## Articles

Articles discovered: 24
Articles assembled: 24
Duplicate orders: 0
Duplicate slugs: 0

## Companion Content

Downloads referenced: 12
Downloads found: 12
Missing downloads: 0

## Assets

Images referenced: 8
Images found: 8
Missing assets: 0

## Links

Internal links checked: 184
Broken internal links: 0

## Navigation

Articles with valid navigation: 24 / 24

## Result

VOLUME_III_ASSEMBLY_COMPLETE
```

If anything is missing, list each issue.

Do not report completion if blocking issues remain.

---

# 33. Blocking Issues

The following should block completion:

```text
missing canonical article
duplicate article order
duplicate slug
broken required internal link
missing referenced companion download
missing referenced image
invalid ZIP download
unresolved competing article revisions
```

When blocked, use:

```text
VOLUME_III_ASSEMBLY_BLOCKED
```

and explain why.

---

# 34. Non-Blocking Warnings

Examples:

```text
article has no companion source code
article has no images
article lacks optional related links
download naming is inconsistent but links work
```

These may be reported without blocking assembly.

---

# 35. Do Not Invent Missing Content

This rule is critical.

If something is missing:

```text
report it
```

Do not:

```text
write a replacement article
invent code
invent a ZIP
guess a download path
make up a Northstar stage
```

unless the user explicitly asks you to create the missing content.

Assembly and authorship are separate tasks.

---

# 36. Do Not Over-Engineer the Output

The goal is a usable article series.

Do not create an elaborate publication framework unless the supplied package explicitly requires one.

The minimum successful output is:

```text
ordered Markdown articles
correct downloadable content
working navigation
working asset links
Volume III index
assembly report
```

Keep the assembly simple and understandable.

---

# 37. Preserve Portability

The resulting Markdown should remain usable outside one specific platform.

Avoid proprietary Markdown syntax unless already present in the source.

The assembled output should be easy to use with:

```text
GitHub
a static-site generator
Next.js
Astro
Hugo
MkDocs
a custom blog engine
```

or another Markdown-based publishing platform.

---

# 38. Preferred Agent Workflow

Follow this exact high-level sequence:

```text
1. Unpack supplied Volume III content.
2. Discover all articles and artifacts.
3. Read article frontmatter.
4. Sort articles by order.
5. Identify companion source/download relationships.
6. Copy articles into canonical article filenames.
7. Copy referenced downloads.
8. Copy referenced assets.
9. Add companion-code sections where appropriate.
10. Add Previous / Index / Next navigation.
11. Generate Volume III README/index.
12. Optionally generate DOWNLOADS.md.
13. Validate articles, links, downloads, images, and navigation.
14. Generate ASSEMBLY-REPORT.md.
15. Report completion or blocking errors.
```

Do not skip validation.

---

# 39. Expected Completion Message

If all required content is successfully assembled and validated, report:

```text
VOLUME_III_ASSEMBLY_COMPLETE
```

Then summarize:

```text
articles assembled
downloads attached
assets copied
broken links
missing artifacts
output directory
```

If blocking errors remain, report:

```text
VOLUME_III_ASSEMBLY_BLOCKED
```

and list them.

---

# 40. Final Instruction to the AI Agent

Your job is not to redesign Volume III.

Your job is to faithfully assemble the supplied pieces into the intended series.

Preserve:

```text
article order
author voice
architectural progression
source-code relationships
pressure-before-pattern teaching flow
```

Attach downloadable content only where it genuinely supports the article.

Keep the final structure simple.

Validate everything you link.

Never hide missing content by inventing it.

When the final directory contains the ordered articles, correct downloads, valid assets, working navigation, the Volume III index, and the assembly report, the job is complete.
