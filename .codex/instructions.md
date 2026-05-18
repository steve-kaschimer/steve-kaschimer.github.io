# Codex Project Instructions

This repository uses the AI-SDLC Framework v0.13.0.
This file is `.codex/instructions.md`.

## Primary Guidance Sources

1. `AGENTS.md` (project-wide operating guidance)
2. `.specify/memory/constitution.md` (project principles and constraints)
3. `docs/` (architecture, product, and team context)
4. `specs/` (feature requirements, plans, and tasks)

## Workflow

Follow the Spec Kit loop using shared skills from `.agents/skills/speckit-*/SKILL.md`:

- `/speckit-aisdlc-bootstrap`
- `/speckit-specify`
- `/speckit-aisdlc-mockup`
- `/speckit-clarify`
- `/speckit-plan`
- `/speckit-tasks`
- `/speckit-analyze`
- `/speckit-implement`
- `/speckit-checklist`
- `/speckit-aisdlc-promote`

Legacy `.codex/prompts/` installs are no longer the primary integration path.

## Skills

- Preinstalled: `.agents/skills/skill-creator`
- Add more: `npx skills add https://github.com/anthropics/skills --skill <skill-name>`
- Docs: https://skills.sh/

## Managed Context

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
once it has been generated.
<!-- SPECKIT END -->
