<!-- AI-SDLC:AGENTS START -->
# AI-SDLC Framework v0.13.0

## Overview

This project uses Spec Kit v0.8.13, installed self-contained under `.claude/` for Claude Code.

## Quick Reference

### Before Any Implementation

1. **Read project context**: `docs/README.md`
2. **Check for specs**: `specs/{feature-name}/`
3. **Follow patterns**: apply spec + project guidance
4. **Verify**: tests, security, and docs before completion

### Spec-Driven Commands

Available as Claude Code skills (`.claude/skills/*/SKILL.md`), invoked as slash commands:

- `/constitution` - Create/update the project constitution at `.claude/memory/constitution.md`
- `/specify` - Create/update a feature spec (typically `specs/{feature-name}/spec.md`)
- `/clarify` - Ask focused questions to remove ambiguity before planning/implementing
- `/plan` - Produce a technical plan from a spec (typically `specs/{feature-name}/plan.md`)
- `/tasks` - Break a plan into implementable tasks (typically `specs/{feature-name}/tasks.md`)
- `/implement` - Implement the next task(s) from tasks while consulting project context
- `/checklist` - Run a pre-finish checklist (tests, security, docs, edge cases)
- `/analyze` - Analyze the existing codebase to inform planning/changes
- `/taskstoissues` - Convert `tasks.md` into GitHub issues (optional)

The git extension (`/git-feature`, `/git-commit`, `/git-initialize`, `/git-remote`, `/git-validate`) runs automatically via hooks configured in `.claude/extensions.yml` - e.g. `/specify` creates a feature branch first, and most commands auto-commit afterward.

Canonical templates, scripts, extensions, and config live under `.claude/`.

Recommended sequence:

1. `/constitution` (first time, or when project principles change)
2. `/specify` -> `/clarify` -> `/plan` -> `/tasks` -> `/analyze` (per feature)
3. `/implement` -> `/checklist`

## Project Constitution

See `.claude/memory/constitution.md` for project-specific guidelines and decisions.

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
