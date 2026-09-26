# COMANDO - git-workflow-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\git-workflow-guide.md
**SHA:** 96b70acf2a2c5e88
**Timestamp:** 2026-08-28T02:02:30.998096
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- **First run:** ~10-15s (no cache)
- run: npm run lint
- run: npm run typecheck
- run: npm run test:coverage
- run: node .aios-core/utils/aios-validator.js stories
- run: node .aios-core/utils/custom-validator.js

### Gaps
- # Missing: description, acceptance_criteria, status

### Ouro Bruto (primeiros 5000 chars)
```
# AIOS Git Workflow Guide

> 🌐 **EN** | [PT](./pt/git-workflow-guide.md) | [ES](./es/git-workflow-guide.md)

---

_Story: 2.2-git-workflow-implementation.yaml_

## Table of Contents

- [Overview](#overview)
- [Defense in Depth Architecture](#defense-in-depth-architecture)
- [Layer 1: Pre-commit Validation](#layer-1-pre-commit-validation)
- [Layer 2: Pre-push Validation](#layer-2-pre-push-validation)
- [Layer 3: CI/CD Pipeline](#layer-3-cicd-pipeline)
- [Branch Protection](#branch-protection)
- [Daily Workflow](#daily-workflow)
- [Troubleshooting](#troubleshooting)
- [Performance Tips](#performance-tips)

## Overview

Synkra AIOS implements a **Defense in Depth** validation strategy with three progressive layers that catch issues early and ensure code quality before merge.

### Why Three Layers?

1. **Fast feedback** - Catch issues immediately during development
2. **Local validation** - No cloud dependency for basic checks
3. **Authoritative validation** - Final gate before merge
4. **Story consistency** - Ensure development aligns with stories

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Pre-commit Hook (Local - <5s)                     │
│ ✓ ESLint (code quality)                                     │
│ ✓ TypeScript (type checking)                                │
│ ✓ Cache enabled                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Pre-push Hook (Local - <2s)                       │
│ ✓ Story checkbox validation                                 │
│ ✓ Status consistency                                         │
│ ✓ Required sections                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ All lint/type checks                                      │
│ ✓ Full test suite                                           │
│ ✓ Code coverage (≥80%)                                      │
│ ✓ Story validation                                          │
│ ✓ Branch protection                                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Merge Ready  │
                      └──────────────┘
```

## Defense in Depth Architecture

### Layer 1: Pre-commit (Local - Fast)

**Performance Target:** <5 seconds
**Trigger:** `git commit`
**Location:** `.husky/pre-commit`

**What it validates:**

- ESLint code quality
- TypeScript type checking
- Syntax errors
- Import issues

**How it works:**

```bash
# Triggered automatically on commit
git add .
git commit -m "feat: add feature"

# Runs:
# 1. ESLint with caching (.eslintcache)
# 2. TypeScript incremental compilation (.tsbuildinfo)
```

**Benefits:**

- ⚡ Fast feedback (<5s)
- 💾 Cached for speed
- 🔒 Prevents broken code commits
- 🚫 No invalid syntax in history

### Layer 2: Pre-push (Local - Story Validation)

**Performance Target:** <2 seconds
**Trigger:** `git push`
**Location:** `.husky/pre-push`

**What it validates:**

- Story checkbox completion vs status
- Required story sections present
- Status consistency
- Dev agent records

**How it works:**

```bash
# Triggered automatically on push
git push origin feature/my-feature

# Validates all story files in docs/stories/
```

**Validation Rules:**

1. **Status Consistency:**

```yaml
# ❌ Invalid: completed but tasks incomplete
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # Error!

# ✅ Valid: all tasks completed
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Required Sections:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Status Flow:**

```
ready → in progress → Ready for Review → completed
```

### Layer 3: CI/CD (Cloud - Authoritative)

**Performance:** 2-5 minutes
**Trigger:** Push to any branch, PR creation
**Platform:** GitHub Actions
**Location:** `.github/workflows/ci.yml`

**Jobs:**

1. **ESLint** (`lint` job)
   - Runs on clean environment
   - No cache dependency

2. **TypeScript** (`typecheck` job)
   - Full type checking
   - No incremental compilation

3. **Tests** (`test` job)
   - Full test suite
   - Coverage reporting
   - 80% threshold enforced

4. **Story Validation** (`story-validation` job)
   - All stories validated
   - Stat
```