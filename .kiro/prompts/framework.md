# AI-SDLC Framework v0.13.0

This project uses the AI-SDLC Framework for spec-driven development with preinstalled and external skills.

## Before Implementing Any Task

1. **Read project context**: Start with `docs/README.md`
2. **Check for specs**: Look in `specs/` directory for feature specifications
3. **Use relevant skills**: Start with preinstalled `skill-creator`, then add more as needed
4. **Fallback guidance**: Use project docs and shared framework context in `.agents/`

## Preinstalled Skill

- `.agents/skills/skill-creator`

## Add More Skills

- https://skills.sh/
- `npx skills add https://github.com/anthropics/skills --skill <skill-name>`

## Spec-Kit Commands

Spec Kit assets are installed under `.specify/`. Use the following prompts:

- `speckit.specify` - Create or update a spec
- `speckit.clarify` - Clarify requirements
- `speckit.plan` - Create a technical plan
- `speckit.tasks` - Break a plan into tasks
- `speckit.implement` - Implement from tasks
- `speckit.analyze` - Analyze spec consistency
- `speckit.checklist` - Generate quality checklists
- `speckit.constitution` - Update project constitution
- `speckit.taskstoissues` - Convert tasks to GitHub issues
- `speckit.aisdlc.bootstrap` - Bootstrap durable project context for a brownfield repo
- `speckit.aisdlc.mockup` - Generate static UI mockups for UI-relevant specs
- `speckit.aisdlc.promote` - Promote durable context updates after planning or implementation

## Implementation Workflow

1. Read the spec (if exists)
2. Identify task type
3. Apply preinstalled skill guidance, then any additional installed skills
4. Implement and test
5. Document changes

## Project Constitution

Project-specific rules: `.specify/memory/constitution.md`

## Managed Context

<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
once it has been generated.
<!-- SPECKIT END -->
