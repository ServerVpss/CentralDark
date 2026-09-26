# MISSAO - permission-modes.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\guides\permission-modes.md
**SHA:** 8584e299658ad128
**Timestamp:** 2026-08-28T02:02:36.346346
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- │  Execute: ❌         │  Execute: ⚠️ confirm│  Execute: ✅       │
- - execute: npm install lodash
- - execute: npm test
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
# Permission Modes Guide

> Control how much autonomy AIOS agents have over your system.

---

## Overview

Permission Modes let you control the level of autonomy AIOS agents have. Whether you're exploring a new codebase or running fully autonomous builds, there's a mode for your workflow.

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 EXPLORE         │  ⚠️ ASK             │  ⚡ AUTO           │
│  Safe browsing      │  Confirm changes    │  Full autonomy    │
├─────────────────────────────────────────────────────────────┤
│  Read: ✅            │  Read: ✅            │  Read: ✅          │
│  Write: ❌           │  Write: ⚠️ confirm  │  Write: ✅         │
│  Execute: ❌         │  Execute: ⚠️ confirm│  Execute: ✅       │
│  Delete: ❌          │  Delete: ⚠️ confirm │  Delete: ✅        │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Start

```bash
# Check current mode
*mode

# Switch to explore mode (safe)
*mode explore

# Switch to ask mode (balanced - default)
*mode ask

# Switch to auto mode (yolo)
*mode auto
# or
*yolo
```

---

## Modes Explained

### 🔍 Explore Mode

**Best for:** First-time exploration, learning a codebase, read-only audits

```
*mode explore
```

In Explore mode:

- ✅ Read any file
- ✅ Search the codebase
- ✅ Run read-only commands (git status, ls, etc.)
- ❌ Cannot write or edit files
- ❌ Cannot run potentially destructive commands
- ❌ Cannot execute build/deploy operations

**Example blocked operations:**

- `Write` / `Edit` tools
- `git push`, `git commit`
- `npm install`
- `rm`, `mv`, `mkdir`

---

### ⚠️ Ask Mode (Default)

**Best for:** Daily development, balanced safety and productivity

```
*mode ask
```

In Ask mode:

- ✅ Read any file
- ⚠️ Write operations require confirmation
- ⚠️ Execute operations require confirmation
- ⚠️ Destructive operations require explicit approval

**Confirmation flow:**

```
⚠️ Confirmation Required

Operation: write
Tool: Edit

File: `src/components/Button.tsx`

[Proceed] [Skip] [Switch to Auto]
```

---

### ⚡ Auto Mode

**Best for:** Power users, autonomous builds, trusted workflows

```
*mode auto
# or
*yolo
```

In Auto mode:

- ✅ Full read access
- ✅ Full write access
- ✅ Full execute access
- ✅ No confirmations required

**Warning:** Use with caution. The agent can modify and delete files without asking.

---

## Mode Indicator

Your current mode is always visible in the agent greeting:

```
🏛️ Aria (Architect) ready! [⚠️ Ask]

Quick Commands:
...
```

The badge shows:

- `[🔍 Explore]` - Read-only mode
- `[⚠️ Ask]` - Confirmation mode (default)
- `[⚡ Auto]` - Full autonomy mode

---

## Configuration

Mode is persisted in `.aios/config.yaml`:

```yaml
permissions:
  mode: ask # explore | ask | auto
```

---

## Operation Classification

The system classifies operations into 4 types:

| Type        | Examples                                        |
| ----------- | ----------------------------------------------- |
| **read**    | `Read`, `Glob`, `Grep`, `git status`, `ls`      |
| **write**   | `Write`, `Edit`, `mkdir`, `touch`, `git commit` |
| **execute** | `npm install`, `npm run`, task execution        |
| **delete**  | `rm`, `git reset --hard`, `DROP TABLE`          |

### Safe Commands (Always Allowed)

These commands are always allowed, even in Explore mode:

```bash
# Git (read-only)
git status, git log, git diff, git branch

# File system (read-only)
ls, pwd, cat, head, tail, wc, find, grep

# Package info
npm list, npm outdated, npm audit

# System info
node --version, npm --version, uname, whoami
```

### Destructive Commands (Extra Caution)

These trigger delete classification and require explicit approval even in Ask mode:

```bash
rm -rf
git reset --hard
git push --force
DROP TABLE
DELETE FROM
TRUNCATE
```

---

## ADE Integration

The Autonomous Development Engine (ADE) respects permission modes:

| Mode        | ADE Behavior                    |
| ----------- | ------------------------------- |
| **Explore** | Plans only, no execution        |
| **Ask**     | Batches operations for approval |
| **Auto**    | Full autonomous execution       |

### Batch Approval in Ask Mode

When running autonomous workflows, operations are grouped:

```
⚠️ Batch Confirmation

The following 5 operations will be executed:
- write: Create src/components/NewFeature.tsx
- write: Update src/index.ts
- execute: npm install lodash
- write: Add tests/newFeature.test.ts
- execute: npm test

[Approve All] [Review Each] [Cancel]
```

---

## Best Practices

### For New Users

1. Start with `*mode explore` to safely browse
2. Switch to `*mode ask` when ready to make changes
3. Use `*mode auto` only when confident

### For CI/CD

Set mode in automation:

```yaml
# .github/workflows/aios.yml
- name: Run AIOS
  run: |
    echo "permissions:\n  mode: auto" > .aios/config.yaml
    aios run build
```

### For Teams

- Default to `ask` mode in shared environments
- Use `explore` for code reviews
- Reserve 
```