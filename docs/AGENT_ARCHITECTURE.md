# Agent Architecture - steve-kaschimer.github.io

---

## Claude Code Implementation Agents (.claude/agents/)

These are specialized execution agents that implement work through the planner → execution → review → documentation pipeline.

### 1. **Planner** (Orchestrator - Main Thread)

**Role**: Design phase - creates plans and dispatches specialists

**Tools**: `Read`, `Glob`, `Grep` (read-only - no execution)

**Model**: Opus

**Responsibilities**:
- Parse requirements and understand scope
- Map affected files and dependencies  
- Design implementation strategy:
  - Which files change (dependency-ordered)
  - Order of operations
  - Test validation
  - Rollback plan
- Dispatch to specialists (Coder, Blog-Writer, etc.)
- Coordinate multi-agent parallel work

**Key Constraint**: Pure design/orchestration. Does **NOT**:
- Execute code or commands
- Write or edit code
- Review code  
- Write blog posts
- Make implementation decisions

---

### 2. **Coder** (Execution Specialist)

**Role**: Implementation phase - executes plans with precision

**Tools**: `Read`, `Edit`, `Write`, `Bash`

**Model**: Sonnet

**Responsibilities**:
- Reads planner's plan completely
- Reads all named files
- Makes edits in dependency order per plan
- Executes the named test
- Returns summary (files changed, test result, blockers)

**Key Principle**: Executes plan exactly. No scope expansion, refactoring, or creativity outside boundaries.

---

### 3. **Reviewer** (Quality Gate)

**Role**: Validation phase - ensures coder matched the plan

**Tools**: `Read`, `Bash`, `Glob`, `Grep`

**Model**: Sonnet

**Responsibilities**:
- Verifies changes match planner's boundaries
- Checks no out-of-scope files were modified
- Runs named test and reports result
- Returns Pass/Fail verdict with specific issues if found

**Key Principle**: Strict gate. Does not approve if plan is incomplete or coder went off-plan. Returns to planner for clarification.

---

### 4. **Blog-Writer** (Content Specialist)

**Role**: Content creation - drafts posts per spec or editorial calendar

**Tools**: `Read`, `Write`, `Edit`, `Grep`

**Model**: Opus

**Responsibilities**:
- Reads editorial plan and similar posts for calibration
- Drafts posts with:
  - Complete front matter (title, date, tags, summary, image metadata)
  - Structured markdown with clear sections
  - Code examples and practical guidance
  - ~2000-3000 words of substantive content for major posts
- Ensures technical accuracy
- Saves to `src/posts/YYYY-MM-DD-slug.md`

**Style**: 
- Terse, precise, practical
- Direct voice ("We found that..." not "It is believed...")
- Deep technical content, not marketing
- Audience: Experienced developers/DevOps engineers

---

### 5. **Scribe** (Documentation Logger)

**Role**: Documentation phase - captures decisions for long-term memory

**Tools**: `Read`, `Edit`, `Write`, `Bash`, `Grep`

**Model**: Sonnet

**Responsibilities**:
- Runs **after** reviewer approves substantial work
- Documents:
  - Architecture decisions (ADRs in `docs/decisions/`)
  - Reusable patterns (in `docs/patterns/`)
  - Configuration changes (`CLAUDE.md`, `README.md`)
  - Editorial learnings (editorial-plan.md notes)
- Creates git commits with clear messages explaining decisions
- Ensures decisions are recoverable without tribal knowledge

**Key Principle**: Captures context so future readers understand why the system was built this way. Runs only after substantial work - minor changes don't require documentation.

---

## Workflow: Planner → Specialists → Loop

```
┌─────────────────┐
│  Task/Issue     │
└────────┬────────┘
         ↓
    ┌────────────────────┐
    │ Planner (Lead)     │
    │ • Parse requirement│
    │ • Map codebase     │
    │ • Design plan      │
    │ • Dispatch         │
    └────────┬───────────┘
             ↓
    ┌────────┴─────────┬──────────────┐
    ↓                  ↓              ↓
┌───────────┐  ┌──────────────┐  ┌────────────┐
│ Coder     │  │ Blog-Writer  │  │ Specialists│
│ Execute   │  │ Write content│  │ Consult    │
└─────┬─────┘  └──────┬───────┘  └──────┬─────┘
      │               │                 │
      └───────────┬───┴─────────────────┘
                  ↓
            ┌──────────────┐
            │ Reviewer     │
            │ Validate diff│
            │ Run test     │
            └──────┬───────┘
                   ↓
            ┌──────┴─────┐
            ↓            ↓
         PASS         FAIL
          │             │
          ↓             ↓
      ┌─────────┐  ┌──────────┐
      │ Scribe  │  │ Planner  │
      │ Docs    │  │ Clarify  │
      └──┬──────┘  │ & Retry  │
         ↓         └──────────┘
      ┌─────────┐
      │  Done   │
      └─────────┘
```

---

## Key Principles

1. **Planner is main thread**: All work flows through planner's design. Specialists execute per plan, don't improvise.

2. **Clear separation of concerns**:
   - **Planner**: Design only (Read, Glob, Grep)
   - **Coder**: Execute exactly (Read, Edit, Write, Bash)
   - **Reviewer**: Validate rigorously (Read, Bash, Glob, Grep)
   - **Blog-Writer**: Write content (Read, Write, Edit, Grep)
   - **Scribe**: Document context (Read, Edit, Write, Bash, Grep)

3. **Boundary enforcement**: Plans explicitly name what changes and what doesn't. Reviewer catches violations.

4. **Test-first thinking**: Every plan must name the test that proves success. If you can't name it, the task isn't ready.

5. **Rollback plans**: Every plan includes how to undo. "git reset" is not a rollback plan - think through the sequence.

6. **Dependency ordering**: Changes flow from dependencies outward (libraries before consumers, foundations before features).

---

## Dispatch Decision Tree

### Code Changes (Features, Refactoring, Bug Fixes)
```
Planner → Design plan (dependencies, order, test, rollback)
        → Coder (execute changes in order)
        → Reviewer (validate against plan)
        → Scribe (if substantial: document decisions)
```

### New Blog Posts
```
Planner → Review editorial calendar & similar posts
        → Blog-Writer (draft full post with front matter)
        → Reviewer (check prose, links, accuracy)
        → Scribe (update editorial-plan.md)
```

### Build/Template Changes
```
Planner → Design plan
        → Coder (implement)
        → Reviewer (validate)
        → Elliot (consult Mr. Robot for architectural review)
        → Scribe (document if pattern is reusable)
```

### CI/CD Workflow Changes
```
Planner → Design plan
        → Coder (implement)
        → Reviewer (validate)
        → Darlene (consult for security review)
        → Scribe (document decision if it sets precedent)
```

### Deployment/Release Changes
```
Planner → Design plan
        → Coder (implement)
        → Reviewer (validate)
        → Romero (consult for deployment review)
        → Scribe (document decision)
```

### Architectural Questions/Security
```
Planner → Consult Elliot (architecture, security, tradeoffs)
        → Redesign if needed
        → Coder (implement)
        → Reviewer (validate)
        → Scribe (document ADR)
```

---

## Invoking Agents

### For Code/Content Tasks
```
Planner, design a plan for [task description]
```

The planner will return a detailed plan, then you dispatch specialists:

```
Coder, implement this plan:
[plan from planner]
```

### For Parallel Work
```
Team, let's tackle [initiative] in parallel.
Coder, implement [task A] per plan below.
Blog-Writer, draft [post] with spec below.
[Plans/specs]
```

### For Review/Validation
```
Reviewer, validate the changes against this plan:
[planner's original plan]
[coder's summary]
```

### For Documentation
```
Scribe, document the decisions from this session:
[context from planner, coder, reviewer]
```

---

## Examples

### Example: Adding a New Post Type

1. **Planner creates plan**:
   - Files: `.eleventy.js`, `src/_layouts/`, new post file, tests
   - Order: Config first, layouts second, example third
   - Test: `npm run deploy` succeeds, new post renders correctly
   - Rollback: Revert these files, git reset

2. **Coder executes**:
   - Modifies `.eleventy.js` to recognize new post type
   - Creates new layout file
   - Creates example post
   - Runs `npm run deploy` - passes

3. **Reviewer validates**:
   - Checks only named files changed ✓
   - Runs test ✓
   - Returns Pass

4. **Scribe documents**:
   - Creates ADR: "Why we added post-type-X"
   - Updates CLAUDE.md with new front-matter fields
   - Commits: "docs: post-type-X decision and layout pattern"

---

## References

- `.claude/agents/*.md` - Agent definitions
- `CLAUDE.md` - Project configuration
- `editorial-plan.md` - Content calendar and work queue
