---
name: ufc-orchestration
description: Use this skill when receiving any task that might benefit from parallel execution. Auto-detects parallelizable work patterns based on task description and suggests optimal execution strategy (Claude sub-agents, Codex handoff, or direct implementation). Invoke BEFORE starting implementation of multi-file tasks.
---

# UFC-Pokedex Task Orchestration

You are an expert at analyzing tasks and determining optimal execution strategies for the UFC-Pokedex codebase. Your goal is to detect parallelization opportunities and recommend the best approach.

## When to Use This Skill

Invoke this skill BEFORE starting implementation when the task:
- Mentions "all", "every", "multiple", or "across"
- Spans 3+ files or multiple modules
- Involves both backend and frontend changes
- Requires data pipeline execution (scraper → load → API)
- Involves testing multiple components
- User explicitly asks about parallelization

## Auto-Detection Algorithm

### Step 1: Keyword Analysis

Scan the task description for trigger keywords:

**High-Confidence Parallel Triggers:**
- "all services" / "every service"
- "all components" / "every component"
- "across all" / "throughout"
- "update all" / "add to every"
- "multiple modules" / "several files"

**Sequential Triggers (Do NOT parallelize):**
- "migration" / "migrate"
- "depends on" / "after that"
- "then" / "first... then..."
- "in order" / "sequentially"

**Codex-Suitable Triggers (Mechanical work):**
- "rename" / "find and replace"
- "add docstrings" / "add comments"
- "add logging" / "add caching decorator"
- "boilerplate" / "mechanical"
- "same pattern" / "copy to all"

### Step 2: Scope Estimation

Estimate the scope based on task keywords:

| Task Pattern | Estimated Files | Layer(s) |
|--------------|-----------------|----------|
| "new endpoint" | 4-6 | API, Service, Repository, Schema |
| "new frontend feature" | 3-5 | Components, Hooks, Pages |
| "full-stack feature" | 6-10 | Backend + Frontend |
| "add field to scraper" | 5-7 | Scraper, Models, Migration, API |
| "update all services" | 8-12 | Services layer only |
| "add tests for X" | 2-4 per module | Tests |

### Step 3: Dependency Analysis

Check for dependency chains that FORCE sequential execution:

**Sequential Chains in UFC-Pokedex:**
1. **Schema Change Chain**: Migration → Load Data → API Update → Type Generation → Frontend
2. **Scraper Pipeline**: fighters_list → fighter_detail → validation → load
3. **Type Safety Chain**: Pydantic Schema → FastAPI → OpenAPI → TypeScript Types
4. **Test Chain**: Unit → Integration → E2E (if E2E depends on data)

**Independent Modules (Safe to Parallelize):**
- `fighter_service` ↔ `event_service` ↔ `stats_service` (independent)
- `FighterCard` ↔ `EventCard` ↔ `StatsCard` (independent components)
- Backend tests ↔ Frontend tests (independent test suites)
- Scraper spiders for different data types (fighters_list ↔ events_list)

### Step 4: Strategy Selection

Based on analysis, select one of four strategies:

## Execution Strategies

### Strategy A: Parallel Claude Sub-agents

**Use `superpowers:subagent-driven-development` skill**

**When to use:**
- 3+ independent subtasks requiring judgment
- Complex logic or architectural decisions needed
- Code review between tasks is valuable
- Different expertise needed per subtask

**UFC-Pokedex examples:**
- "Add fighter comparison feature" → 3 agents (API, Service, Frontend)
- "Implement new ranking system" → 2 agents (Backend logic, Frontend display)
- "Add comprehensive tests" → N agents (one per module)

**Output format:**
```
I recommend Strategy A: Parallel Claude Sub-agents

Subtasks:
1. [Backend API + Service] - Claude agent with backend context
2. [Frontend Components] - Claude agent with frontend context
3. [Integration Tests] - Claude agent after 1 & 2 complete

Proceed with `superpowers:subagent-driven-development`?
```

### Strategy B: Parallel Codex Agents

**Use `/handoffcodex` command**

**When to use:**
- Mechanical, repetitive changes across many files
- Clear pattern to apply (no judgment needed)
- Same transformation applied N times
- Bulk operations (rename, add decorator, etc.)

**UFC-Pokedex examples:**
- "Add @cached decorator to all service methods"
- "Add error handling to all repository methods"
- "Rename fighter_id to fighter_uuid everywhere"
- "Add docstrings to all public functions"

**Output format:**
```
I recommend Strategy B: Codex Handoff

This is a mechanical task suitable for Codex:
- Pattern: [describe pattern]
- Files: ~[N] files in [directories]
- Transformation: [describe change]

Proceed with `/handoffcodex`?
```

### Strategy C: Sequential Implementation

**Direct implementation with ordered steps**

**When to use:**
- Clear dependency chain exists
- Later steps depend on earlier results
- Data pipeline execution
- Migration-related changes

**UFC-Pokedex examples:**
- "Add new field from scraper to API" → Scraper → Migration → Repository → Service → API → Types → Frontend
- "Run weekly scraper and load data" → Scrape → Validate → Load
- "Update database schema" → Migration → Seed → Verify

**Output format:**
```
I recommend Strategy C: Sequential Implementation

Dependency chain detected:
1. [Step 1] - must complete first
2. [Step 2] - depends on step 1
3. [Step 3] - depends on step 2
...

I'll implement these in order. Proceed?
```

### Strategy D: Direct Implementation

**No parallelization needed**

**When to use:**
- Task touches 1-2 files
- Simple, clear change
- No opportunity for parallelization
- Quick fix or small enhancement

**UFC-Pokedex examples:**
- "Fix typo in README"
- "Update single component styling"
- "Add one test case"
- "Fix bug in specific function"

**Output format:**
```
This is a straightforward task (touches [N] files).
No parallelization needed - I'll implement directly.
```

## UFC-Pokedex Specific Patterns

### Backend Patterns

| Pattern | Detection | Strategy | Files |
|---------|-----------|----------|-------|
| New endpoint (simple) | "add endpoint", "new route" | C (Sequential) | 4-5 |
| New endpoint (complex) | "add feature with..." | A (Claude parallel) | 6+ |
| Service update | "update X service" | D (Direct) | 1-2 |
| Multi-service update | "all services", "every service" | B (Codex) | 8-12 |
| Repository refactor | "update repositories" | B (Codex) | 5-8 |

### Frontend Patterns

| Pattern | Detection | Strategy | Files |
|---------|-----------|----------|-------|
| Single component | "update X component" | D (Direct) | 1-2 |
| Component family | "all cards", "every page" | B (Codex) | 5-10 |
| New feature | "add X to UI" | A or C | 3-5 |
| Styling sweep | "update styles", "dark mode" | B (Codex) | 10+ |

### Data Pipeline Patterns

| Pattern | Detection | Strategy | Notes |
|---------|-----------|----------|-------|
| Full scrape | "run scraper" | C (Sequential) | fighters_list → details |
| Load data | "load data", "reload" | C (Sequential) | validate → load |
| Add scraper field | "new field from scraper" | C (Sequential) | 5-step chain |
| Parallel spiders | "scrape fighters and events" | A (Claude parallel) | Independent spiders |

### Testing Patterns

| Pattern | Detection | Strategy | Notes |
|---------|-----------|----------|-------|
| Unit tests (one module) | "test X" | D (Direct) | 1-3 files |
| Unit tests (multi-module) | "add tests for all" | A (Claude parallel) | Per-module agents |
| E2E tests | "end-to-end", "Playwright" | C (Sequential) | MCP required |
| Test coverage sweep | "increase coverage" | B (Codex) | Mechanical |

## MCP Constraint (CRITICAL)

**Playwright MCP tasks MUST run sequentially:**
- Browser automation cannot be parallelized
- E2E tests must run one at a time
- Screenshots/snapshots are sequential operations

If task involves Playwright/MCP:
- Do NOT suggest parallel execution for MCP portions
- Can parallelize non-MCP work alongside sequential MCP work

## Decision Output Template

When this skill is invoked, always output:

```
## Task Analysis

**Task**: [Summarize the task]
**Scope**: [N files / M modules / L layers]
**Pattern Detected**: [Layer-based / Module-based / Pipeline / Simple]
**Dependencies**: [None / Chain: X → Y → Z]

## Recommendation

**Strategy**: [A: Claude Parallel / B: Codex / C: Sequential / D: Direct]
**Reason**: [Why this strategy fits]

### Execution Plan

[If A or B - list subtasks/agents]
[If C - list ordered steps]
[If D - describe direct approach]

**Proceed with this approach?**
```

## Quick Reference

```
Task has "all/every/multiple" + mechanical change? → Strategy B (Codex)
Task has "all/every/multiple" + needs judgment?   → Strategy A (Claude parallel)
Task mentions "migration/depends/then/after"?     → Strategy C (Sequential)
Task touches 1-2 files?                           → Strategy D (Direct)
Task involves Playwright/MCP?                     → Sequential for MCP portions
```

## Related Resources

- See `CLAUDE.md` → "Sub-Agent Orchestration" section for project-level guidance
- See `superpowers:subagent-driven-development` skill for Claude parallel execution
- Use `/handoffcodex` command for Codex delegation
- See `.claude/skills/managing-dev-environment/` for environment setup
