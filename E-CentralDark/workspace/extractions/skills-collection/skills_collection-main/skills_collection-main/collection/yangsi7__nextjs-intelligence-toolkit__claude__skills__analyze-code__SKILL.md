---
name: analyze-code
description: Intelligence-first code analysis for bugs, architecture, performance, and security. Use proactively when investigating code issues, tracing dependencies, or understanding system behavior. MUST query project-intel.mjs before reading files.
---

# Code Analysis Skill

## Overview

This skill performs comprehensive code analysis using an **intel-first approach** - always querying project-intel.mjs before reading full files, achieving 80-95% token savings.

**Core principle:** Query intel → Verify with MCP → Report with evidence

**Announce at start:** "I'm using the analyze-code skill to investigate this issue."

---

## Quick Reference

| Phase | Key Activities | Token Budget | Output |
|-------|---------------|--------------|--------|
| **1. Scope** | Define objective, bounds, success criteria | ~200 tokens | analysis-spec.md |
| **2. Intel Queries** | Search, symbols, dependencies via project-intel.mjs | ~500 tokens | /tmp/intel_*.json |
| **3. MCP Verification** | Verify findings with authoritative sources | ~300 tokens | Evidence block |
| **4. Report** | Generate CoD^Σ trace report | ~1000 tokens | report.md |

**Total: ~2000 tokens vs 20000+ for direct file reading**

---

## Workflow Files

**Detailed Workflows**:
- **@.claude/skills/analyze-code/workflows/analysis-workflow.md** - Complete Phases 1-4 (scope, intel queries, MCP verification, report generation)

**Reference Materials**:
- **@.claude/skills/analyze-code/references/decision-trees.md** - 3 analysis type decision trees (bug diagnosis, architecture, performance)
- **@.claude/skills/analyze-code/references/enforcement-rules.md** - 3 non-negotiable rules (no naked claims, intel before reading, MCP for authority)
- **@.claude/skills/analyze-code/references/failure-modes.md** - 5 common failures with solutions

---

## Templates You Will Use

- **@.claude/templates/analysis-spec.md** - Scope definition (Phase 1)
- **@.claude/templates/report.md** - Final analysis report (Phase 4)
- **@.claude/templates/mcp-query.md** - Optional MCP queries (Phase 3)

---

## Intelligence Tool Guide

- **@.claude/shared-imports/project-intel-mjs-guide.md** - Complete project-intel.mjs usage

---

## The Process (Overview)

**See:** @.claude/skills/analyze-code/workflows/analysis-workflow.md for complete details

Copy this checklist to track progress:

```
Analysis Progress:
- [ ] Phase 1: Scope (analysis-spec.md created)
- [ ] Phase 2: Intel Queries (4 query types executed)
- [ ] Phase 3: MCP Verification (findings verified)
- [ ] Phase 4: Report (CoD^Σ trace complete)
```

### Phase 1: Define Scope

**Create analysis-spec.md** using template to define:

1. **Objective**: What question are we answering?
   - "Why does LoginForm re-render infinitely?"
   - "What causes 500 error on checkout?"
   - "Is there circular dependency in auth module?"

2. **Scope**: What's in/out of scope?
   - In-Scope: Specific components, files, functions
   - Out-of-Scope: Backend, database, third-party APIs

3. **Success Criteria**: How do we know when done?
   - "Root cause identified with file:line reference"
   - "Complete dependency graph generated"
   - "Performance bottleneck located"

**Enforcement Checklist:**
- [ ] Objective is clear and answerable
- [ ] In-scope/out-of-scope explicitly defined
- [ ] Success criteria are testable

---

### Phase 2: Execute Intel Queries

**CRITICAL:** Execute ALL intel queries BEFORE reading any files.

**4 Required Query Types:**

1. **Project Overview** (if first analysis in session):
   ```bash
   project-intel.mjs --overview --json > /tmp/analysis_overview.json
   ```
   Purpose: Understand project structure, entry points, file counts
   Tokens: ~50

2. **Search for Relevant Files**:
   ```bash
   project-intel.mjs --search "<pattern>" --type <filetype> --json > /tmp/analysis_search.json
   ```
   Purpose: Locate files related to objective
   Tokens: ~100

3. **Symbol Analysis** (for each relevant file):
   ```bash
   project-intel.mjs --symbols <filepath> --json > /tmp/analysis_symbols_<filename>.json
   ```
   Purpose: Understand functions/classes without reading full file
   Tokens: ~150 per file

4. **Dependency Tracing**:
   ```bash
   # What does this file import?
   project-intel.mjs --dependencies <filepath> --direction upstream --json > /tmp/analysis_deps_up.json

   # What imports this file?
   project-intel.mjs --dependencies <filepath> --direction downstream --json > /tmp/analysis_deps_down.json
   ```
   Purpose: Understand dependencies and impact
   Tokens: ~200 total

**Token Comparison:**
- Reading full LoginForm.tsx (1000 lines): ~3000 tokens
- Intel queries + targeted read (30 lines): ~300 tokens
- **Savings: 90%**

**Enforcement Checklist:**
- [ ] All 4 query types executed
- [ ] Intel results saved to /tmp/ for evidence
- [ ] No files read before intel queries complete

**See:** @.claude/skills/analyze-code/workflows/analysis-workflow.md for complete query examples

---

### Phase 3: MCP Verification

Verify findings with authoritative sources:

**When to Use Each MCP:**

| MCP Tool | Use For | Example |
|----------|---------|---------|
| **Ref** | Library/framework behavior | React hooks, Next.js routing, TypeScript |
| **Supabase** | Database schema, RLS policies | Table structure, column types |
| **Shadcn** | Component design patterns | shadcn/ui component usage |
| **Chrome** | Runtime behavior validation | E2E testing, browser behavior |

**MCP Verification Pattern:**
```markdown
## Intel Finding
[What intelligence queries revealed]

## MCP Verification
**Tool:** [Which MCP tool]
**Query:** [Exact query executed]
**Result:** [What authoritative source says]

## Comparison
- **Intel shows:** [From project-intel.mjs]
- **Docs require:** [From MCP verification]
- **Conclusion:** [Agreement or discrepancy]
```

**Enforcement Checklist:**
- [ ] At least 1 MCP verification for non-trivial findings
- [ ] MCP results documented in Evidence section
- [ ] Discrepancies between intel and MCP flagged

**See:** @.claude/skills/analyze-code/workflows/analysis-workflow.md for complete verification examples

---

### Phase 4: Generate Report

Create comprehensive report using **@.claude/templates/report.md**

**Required: CoD^Σ Trace**

Every report MUST include complete reasoning chain with symbolic operators:

```markdown
## CoD^Σ Trace

**Claim:** [Your conclusion with file:line reference]

**Trace:**
```
Step 1: → IntelQuery("search <pattern>")
  ↳ Source: project-intel.mjs --search "<pattern>" --type <type>
  ↳ Data: [What was found]
  ↳ Tokens: [Token count]

Step 2: ⇄ IntelQuery("analyze symbols")
  ↳ Source: project-intel.mjs --symbols <file>
  ↳ Data: [Functions/classes found with line numbers]
  ↳ Tokens: [Token count]

Step 3: → TargetedRead(lines X-Y)
  ↳ Source: Read <file> (lines X-Y only)
  ↳ Data: [Relevant code excerpt]
  ↳ Tokens: [Token count]

Step 4: ⊕ MCPVerify("<tool>")
  ↳ Tool: <MCP tool> - "<query>"
  ↳ Data: [What authoritative source says]
  ↳ Tokens: [Token count]

Step 5: ∘ Conclusion
  ↳ Logic: [Reasoning from data to conclusion]
  ↳ Root Cause: <file>:<line> - [What's wrong]
  ↳ Fix: [How to resolve]
```
**Total Tokens:** [Sum] (vs [baseline] for reading full files)
**Savings:** [Percentage]
```
```

**Report Sections:**

1. **Summary** (max 200 tokens): Key finding, root cause with file:line, recommended fix
2. **CoD^Σ Trace** (as shown above): Complete reasoning chain, token counts, savings
3. **Evidence**: All intel query results, MCP verification, targeted file excerpts
4. **Recommendations**: Specific fixes, implementation guidance, testing approach

**File Naming:** `YYYYMMDD-HHMM-report-<id>.md`

**Enforcement Checklist:**
- [ ] Report uses template structure
- [ ] CoD^Σ trace complete
- [ ] Every claim has file:line or MCP evidence
- [ ] Recommendations are specific
- [ ] Total report ≤ 1000 tokens when populated

**See:** @.claude/skills/analyze-code/workflows/analysis-workflow.md for complete report examples

---

## Decision Trees for Different Analysis Types

**See:** @.claude/skills/analyze-code/references/decision-trees.md

**Summary:**

- **Tree 1: Bug Diagnosis** - Search error → Locate function → Trace dependencies → Find discrepancy → Verify with MCP → Report
- **Tree 2: Architecture Analysis** - Get overview → Identify entry points → Trace dependencies → Build graph → Analyze patterns → Report
- **Tree 3: Performance Analysis** - Search slow operations → Trace data flow → Identify bottlenecks → Measure impact → Verify best practices → Report

Choose based on user's request type. Can combine multiple trees for complex analyses.

---

## Enforcement Rules

**See:** @.claude/skills/analyze-code/references/enforcement-rules.md

**Summary:**

### Rule 1: No Naked Claims
Every claim MUST have file:line reference and evidence from intelligence queries or MCP verification.

### Rule 2: Intel Before Reading
Query project-intel.mjs BEFORE reading any files. Achieve 90-97% token savings.

### Rule 3: MCP for Authority
Verify library/framework behavior with authoritative MCP sources, not memory or assumptions.

**These rules are non-negotiable. Violations invalidate the analysis.**

---

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Skipping intel queries | 10-100x token waste | Enforce Phase 2 before any reads |
| Vague conclusions | Not actionable | Always include file:line references |
| No MCP verification | Incorrect assumptions | Verify library behavior with Ref MCP |
| Incomplete CoD^Σ trace | Can't verify reasoning | Document every reasoning step |

---

## Success Metrics

**Token Efficiency:**
- Intel-first: 500-2000 tokens per analysis
- Direct reading: 5000-20000 tokens
- **Target: 80%+ savings** ✓

**Accuracy:**
- Root cause identified: 95%+
- MCP verified: 100% for library issues

**Completeness:**
- All claims evidenced: 100%
- CoD^Σ trace complete: 100%

---

## When to Use This Skill

**Use analyze-code when:**
- User reports a bug or error
- User asks "why does X happen?"
- User wants to understand system architecture
- User suspects performance issues
- User needs dependency analysis

**Don't use when:**
- Simple syntax questions (no analysis needed)
- User wants to write new code (use planning skill)
- User wants to implement a fix (use execution skill)

---

## Prerequisites

Before using this skill:
- ✅ PROJECT_INDEX.json exists (run `/index` if missing)
- ✅ project-intel.mjs is executable
- ✅ Code to analyze exists in repository
- ⚠️ For external library analysis: MCP tools configured (Ref, Context7)

---

## Dependencies

**Depends On**:
- None (this skill is standalone and doesn't require other skills to run first)

**Integrates With**:
- **debug-issues skill**: Use after this skill if analysis reveals bugs
- **create-implementation-plan skill**: Use after this skill to plan fixes/enhancements

**Tool Dependencies**:
- project-intel.mjs (intelligence queries)
- MCP Ref tool (library documentation)
- MCP Context7 tool (external docs)

---

## Next Steps

After analysis completes, typical next steps:

**If bugs found**:
```
analyze-code → debug-issues skill → create-implementation-plan skill → implement-and-verify skill
```

**If performance issues found**:
```
analyze-code → create-implementation-plan skill (optimization) → implement-and-verify skill
```

**If architecture review**:
```
analyze-code → create-implementation-plan skill (refactoring) → implement-and-verify skill
```

**Commands to invoke**:
- `/bug` - If analysis reveals specific bugs
- `/plan` - To create implementation plan for fixes
- `/implement` - After plan exists, to execute changes

---

## Failure Modes

**See:** @.claude/skills/analyze-code/references/failure-modes.md

**Summary of 5 Common Failures:**

1. **PROJECT_INDEX.json Missing** - Solution: Run `/index`
2. **Intelligence Queries Return No Results** - Solution: Regenerate index, broaden search
3. **MCP Tools Not Available** - Solution: Configure .mcp.json, use workaround
4. **Analysis Scope Too Broad** - Solution: Define narrow scope in analysis-spec.md
5. **CoD^Σ Evidence Missing** - Solution: Save intel results, complete CoD^Σ trace

**Diagnostic Workflow**: Check index → Check queries → Check MCP → Check scope → Check evidence

---

## Related Skills & Commands

**Direct Integration**:
- **debug-issues skill** - Use after this skill when bugs are identified
- **create-implementation-plan skill** - Use after analysis to plan changes
- **/analyze command** - User-facing command that invokes this skill
- **code-analyzer subagent** - Subagent that routes to this skill

**Workflow Context**:
- Position: Can be used at any time (analysis is standalone)
- Triggers: User mentions "analyze", "review", "understand", "architecture"
- Output: report.md or analysis-spec.md using templates

---

## Agent Integration

**Subagent Usage**:

When the code-analyzer subagent delegates work to this skill, it provides:
- Initial problem statement
- Suspected file locations (if known)
- Context from user conversation

This skill then:
1. Creates analysis-spec.md from provided context
2. Executes intelligence queries
3. Generates report with CoD^Σ trace
4. Returns findings to subagent

**Task Tool Example**:
```python
# From code-analyzer subagent
Task(
    subagent_type="code-analyzer",
    description="Analyze infinite render bug",
    prompt="""
    @.claude/skills/analyze-code/SKILL.md

    User reports: LoginForm component re-renders infinitely

    Use intelligence-first approach:
    1. Query project-intel.mjs for LoginForm location
    2. Analyze symbols to find hooks
    3. Verify React patterns with MCP Ref
    4. Generate report with CoD^Σ trace

    Output: Complete report.md with root cause and fix
    """
)
```

---

## Version

**Version:** 1.1.0
**Last Updated:** 2025-10-23
**Change Log**:
- v1.1.0 (2025-10-23): Refactored to progressive disclosure pattern (<500 lines)
- v1.0.0 (2025-10-19): Initial version

**Owner:** Claude Code Intelligence Toolkit
