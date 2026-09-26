---
name: analyze-code
description: Intelligence-first code analysis for bugs, architecture, performance, and security. Use proactively when investigating code issues, tracing dependencies, or understanding system behavior. MUST query project-intel.mjs before reading files.
---

# Code Analysis Skill

## Overview

This skill performs comprehensive code analysis using an **intel-first approach** - always querying project-intel.mjs before reading full files, achieving 80-95% token savings.

**Core principle:** Query intel → Verify with MCP → Report with evidence

**Announce at start:** "I'm using the analyze-code skill to investigate this issue."

## Quick Reference

| Phase | Key Activities | Token Budget | Output |
|-------|---------------|--------------|--------|
| **1. Scope** | Define objective, bounds, success criteria | ~200 tokens | analysis-spec.md |
| **2. Intel Queries** | Search, symbols, dependencies via project-intel.mjs | ~500 tokens | /tmp/intel_*.json |
| **3. MCP Verification** | Verify findings with authoritative sources | ~300 tokens | Evidence block |
| **4. Report** | Generate CoD^Σ trace report | ~1000 tokens | report.md |

**Total: ~2000 tokens vs 20000+ for direct file reading**

## Templates You Will Use

- **@.claude/templates/analysis-spec.md** - Scope definition (Phase 1)
- **@.claude/templates/report.md** - Final analysis report (Phase 4)
- **@.claude/templates/mcp-query.md** - Optional MCP queries (Phase 3)

## Intelligence Tool Guide

- **@.claude/shared-imports/project-intel-mjs-guide.md** - Complete project-intel.mjs usage

## The Process

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

**Enforcement:**
- [ ] Objective is clear and answerable
- [ ] In-scope/out-of-scope explicitly defined
- [ ] Success criteria are testable

**Example:**
```markdown
---
spec_id: "analysis-login-rerender"
type: "bug-diagnosis"
---

## Objective
Identify why LoginForm component re-renders infinitely in development.

## Scope
**In-Scope:**
- LoginForm component (src/components/LoginForm.tsx)
- useEffect hooks and dependencies
- State management related to login

**Out-of-Scope:**
- Backend API endpoints
- Database queries
- Production environment

## Success Criteria
- [ ] Root cause identified with specific file:line
- [ ] Fix approach validated with React docs (MCP)
- [ ] CoD^Σ trace shows complete reasoning chain
```

### Phase 2: Execute Intel Queries

**CRITICAL:** Execute ALL intel queries BEFORE reading any files.

#### Query 1: Project Overview (if first analysis)
```bash
project-intel.mjs --overview --json > /tmp/analysis_overview.json
```
**Purpose:** Understand project structure, entry points, file counts
**Tokens:** ~50

#### Query 2: Search for Relevant Files
```bash
project-intel.mjs --search "<pattern>" --type <filetype> --json > /tmp/analysis_search.json
```
**Purpose:** Locate files related to objective
**Tokens:** ~100

**Example:**
```bash
# For "login form" analysis
project-intel.mjs --search "login" --type tsx --json
# Result: Found LoginForm.tsx, LoginButton.tsx, LoginAPI.ts
```

#### Query 3: Symbol Analysis
For each relevant file:
```bash
project-intel.mjs --symbols <filepath> --json > /tmp/analysis_symbols_<filename>.json
```
**Purpose:** Understand functions/classes without reading full file
**Tokens:** ~150 per file

**Example:**
```bash
project-intel.mjs --symbols src/components/LoginForm.tsx --json
# Result: LoginForm at line 12, useEffect at line 45, useState at line 15
```

#### Query 4: Dependency Tracing
For key files:
```bash
# What does this file import?
project-intel.mjs --dependencies <filepath> --direction upstream --json > /tmp/analysis_deps_up.json

# What imports this file?
project-intel.mjs --dependencies <filepath> --direction downstream --json > /tmp/analysis_deps_down.json
```
**Purpose:** Understand dependencies and impact
**Tokens:** ~200 total

**Now you know WHERE to look** - read only targeted lines using `sed -n 'X,Yp'`

**Token Comparison:**
- Reading full LoginForm.tsx (1000 lines): ~3000 tokens
- Intel queries + targeted read (30 lines): ~300 tokens
- **Savings: 90%**

**Enforcement:**
- [ ] All 4 query types executed
- [ ] Intel results saved to /tmp/ for evidence
- [ ] No files read before intel queries complete

### Phase 3: MCP Verification

Verify findings with authoritative sources:

#### When to Use Each MCP

| MCP Tool | Use For | Example |
|----------|---------|---------|
| **Ref** | Library/framework behavior | React hooks, Next.js routing, TypeScript |
| **Supabase** | Database schema, RLS policies | Table structure, column types |
| **Shadcn** | Component design patterns | shadcn/ui component usage |
| **Chrome** | Runtime behavior validation | E2E testing, browser behavior |

#### MCP Verification Pattern

```markdown
## Intel Finding
useEffect at src/LoginForm.tsx:45 has dependency [state]

## MCP Verification
**Tool:** Ref MCP
**Query:** ref_search_documentation "React useEffect dependencies"
**Result:** Official React docs confirm dependencies should include all values referenced in effect body

## Comparison
- **Intel shows:** [state]
- **Docs require:** [state, setState, callback]
- **Conclusion:** Missing dependencies confirmed ✓
```

**Enforcement:**
- [ ] At least 1 MCP verification for non-trivial findings
- [ ] MCP results documented in Evidence section
- [ ] Discrepancies between intel and MCP flagged

### Phase 4: Generate Report

Create comprehensive report using **@.claude/templates/report.md**

#### Required: CoD^Σ Trace

Every report MUST include complete reasoning chain:

```markdown
## CoD^Σ Trace

**Claim:** LoginForm re-renders infinitely due to incomplete useEffect dependencies

**Trace:**
```
Step 1: → IntelQuery("search login")
  ↳ Source: project-intel.mjs --search "login" --type tsx
  ↳ Data: Found LoginForm.tsx, LoginButton.tsx, LoginAPI.ts
  ↳ Tokens: 100

Step 2: ⇄ IntelQuery("analyze symbols")
  ↳ Source: project-intel.mjs --symbols src/components/LoginForm.tsx
  ↳ Data: LoginForm at line 12, useEffect at line 45
  ↳ Tokens: 150

Step 3: → TargetedRead(lines 40-60)
  ↳ Source: sed -n '40,60p' src/components/LoginForm.tsx
  ↳ Data: useEffect(() => { setUser({...user, lastLogin: Date.now()}) }, [user])
  ↳ Tokens: 100

Step 4: ⊕ MCPVerify("React docs")
  ↳ Tool: Ref MCP - "React useEffect dependencies"
  ↳ Data: "Every value referenced inside effect must be in dependency array"
  ↳ Tokens: 200

Step 5: ∘ Conclusion
  ↳ Logic: Effect depends on [user] but mutates user → infinite loop
  ↳ Root Cause: src/components/LoginForm.tsx:47 - incomplete dependency array
  ↳ Fix: Use functional setState or remove user from dependencies
```
**Total Tokens:** 550 (vs 3000+ for reading full file)
```

#### Report Sections

1. **Summary** (max 200 tokens)
   - Key finding
   - Root cause with file:line
   - Recommended fix

2. **CoD^Σ Trace** (as shown above)
   - Complete reasoning chain
   - Token count for each step
   - Final token savings calculation

3. **Evidence**
   - All intel query results
   - MCP verification results
   - Targeted file excerpts

4. **Recommendations**
   - Specific, actionable fixes
   - Implementation guidance
   - Testing approach

#### File Naming

Save as: `YYYYMMDD-HHMM-report-<id>.md`

Example: `20250119-1430-report-login-infinite-render.md`

**Enforcement:**
- [ ] Report uses template structure
- [ ] CoD^Σ trace complete
- [ ] Every claim has file:line or MCP evidence
- [ ] Recommendations are specific
- [ ] Total report ≤ 1000 tokens when populated

## Analysis Type Decision Trees

### Tree 1: Bug Diagnosis

```
User reports error/bug
    ↓
1. Search for error message/symptom keywords (project-intel.mjs --search)
    ↓
2. Locate function/component with issue (--symbols)
    ↓
3. Trace dependencies upstream (what does it use?)
    ↓
4. Find discrepancy (missing check, wrong data)
    ↓
5. Verify with MCP if library-related
    ↓
6. Report with root cause at file:line
```

### Tree 2: Architecture Analysis

```
User wants to understand system design
    ↓
1. Get project overview (project-intel.mjs --overview)
    ↓
2. Identify entry points
    ↓
3. Trace dependencies from entry points (--dependencies --downstream)
    ↓
4. Build dependency graph
    ↓
5. Analyze patterns:
   - Circular dependencies?
   - Deep nesting?
   - Tight coupling?
    ↓
6. Report with visualization (mermaid diagram)
```

### Tree 3: Performance Analysis

```
User reports slow operation
    ↓
1. Search for suspected slow operations (queries, loops)
    ↓
2. Trace data flow from source to sink
    ↓
3. Identify bottlenecks:
   - N+1 queries?
   - Unnecessary re-renders?
   - Large data processing?
    ↓
4. Measure impact (how many times called?)
    ↓
5. Verify best practices with MCP
    ↓
6. Report with optimization recommendations
```

## Enforcement Rules

### Rule 1: No Naked Claims

**❌ Violation:**
```
The login form has a bug in the useEffect.
```

**✓ Correct:**
```
The login form has a bug at src/LoginForm.tsx:45 in the useEffect hook.

Evidence:
- Intel Query: project-intel.mjs --symbols src/LoginForm.tsx
- Result: useEffect at line 45 with dependency [state]
- MCP Verify: Ref MCP confirms dependencies should include all referenced values
- Targeted Read: Lines 40-50 show effect mutates state while depending on it
```

### Rule 2: Intel Before Reading

**❌ Violation:**
```bash
# Agent reads entire file (1000 lines, ~3000 tokens)
cat src/LoginForm.tsx
```

**✓ Correct:**
```bash
# Agent queries intel first (~50 tokens)
project-intel.mjs --symbols src/LoginForm.tsx --json
# Result: LoginForm at line 12, useEffect at 45

# Read ONLY relevant lines (~100 tokens)
sed -n '40,60p' src/LoginForm.tsx
```
**Token Savings:** 96% reduction

### Rule 3: MCP for Authority

**❌ Violation:**
```
Based on my knowledge, useEffect should include all dependencies.
```

**✓ Correct:**
```
MCP Verification (Ref): ref_search_documentation "React useEffect dependencies"
Official React docs confirm: "Every value referenced inside effect must be in dependency array."
Source: https://react.dev/reference/react/useEffect
```

## Common Pitfalls

| Pitfall | Impact | Solution |
|---------|--------|----------|
| Skipping intel queries | 10-100x token waste | Enforce Phase 2 before any reads |
| Vague conclusions | Not actionable | Always include file:line references |
| No MCP verification | Incorrect assumptions | Verify library behavior with Ref MCP |
| Incomplete CoD^Σ trace | Can't verify reasoning | Document every reasoning step |

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

## Related Skills & Commands

- **Debugging skill** - For specific bug diagnosis workflows
- **Planning skill** - For creating implementation plans after analysis
- **/analyze command** - User-invoked analysis (can invoke this skill)

## Version

**Version:** 1.0
**Last Updated:** 2025-10-19
**Owner:** Claude Code Intelligence Toolkit
