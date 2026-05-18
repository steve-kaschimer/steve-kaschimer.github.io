<!-- AI-SDLC:AGENTS START -->
# AI-SDLC Framework v0.13.0

## Overview

This project uses Spec Kit v0.8.11 plus the AI-SDLC core preset, context extension, and workflow.

## Quick Reference

### Before Any Implementation

1. **Bootstrap context if needed**: `.agents/prompts/bootstrap-context-repo.md`
2. **Read project context**: `docs/README.md`
3. **Check for specs**: `specs/{feature-name}/`
4. **Use skills**: start with preinstalled `skill-creator`, then add more via `npx skills`
5. **Follow patterns**: apply spec + project guidance
6. **Verify**: tests, security, and docs before completion

### Preinstalled Skill

- Included by `aisdlc init`: `.agents/skills/skill-creator`
- Linked into selected agent-native skills directories when supported

### Add More Skills

- Learn more: https://skills.sh/
- Install additional skills:
  `npx skills add https://github.com/anthropics/skills --skill <skill-name>`

### Spec-Kit Prompts

Spec Kit is installed under `.specify/`. Skills-enabled agents expose the workflow as `speckit-*` skills, while markdown-based agents expose `/speckit.*` commands.

- `.agents/prompts/bootstrap-context-repo.md` - AI-SDLC bootstrap prompt for durable repo context
- `/speckit.aisdlc.bootstrap` - Bootstrap durable project context for a brownfield repo
- `/speckit.constitution` - Create/update the project constitution at `.specify/memory/constitution.md`
- `/speckit.specify` - Create/update a feature spec (typically `specs/{feature-name}/spec.md`)
- `/speckit.aisdlc.mockup` - Generate static UI mockups and handoff notes for UI-relevant specs
- `/speckit.clarify` - Ask focused questions to remove ambiguity before planning/implementing
- `/speckit.plan` - Produce a technical plan from a spec (typically `specs/{feature-name}/plan.md`)
- `/speckit.tasks` - Break a plan into implementable tasks (typically `specs/{feature-name}/tasks.md`)
- `/speckit.implement` - Implement the next task(s) from tasks while consulting project context + installed skills
- `/speckit.checklist` - Run a pre-finish checklist (tests, security, docs, edge cases)
- `/speckit.analyze` - Analyze the existing codebase to inform planning/changes
- `/speckit.taskstoissues` - Convert `tasks.md` into GitHub issues (optional)
- `/speckit.aisdlc.promote` - Promote durable implementation knowledge back into `docs/` and feature context

Canonical templates, scripts, extensions, presets, and workflows live under `.specify/`.

Recommended sequence:

1. `.agents/prompts/bootstrap-context-repo.md` or `/speckit.aisdlc.bootstrap`
2. `/speckit.specify` -> optional `/speckit.aisdlc.mockup` for UI specs -> `/speckit.clarify` -> `/speckit.plan` -> `/speckit.tasks` -> `/speckit.analyze` (per feature)
3. `/speckit.implement` -> `/speckit.checklist`
4. `/speckit.aisdlc.promote` (capture durable context updates)

Use `/speckit.constitution` when bootstrap has not been run yet or when the constitution needs an intentional rewrite.

## Project Constitution

See `.specify/memory/constitution.md` for project-specific guidelines and decisions.

## Project Context

Long-lived context lives in `docs/` (start with `docs/README.md`).

## Project Name

`steve-kaschimer.github.io`

## Managed Context

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
once it has been generated.
<!-- SPECKIT END -->
<!-- AI-SDLC:AGENTS END -->
