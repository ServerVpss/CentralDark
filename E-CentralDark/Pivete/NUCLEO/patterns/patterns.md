# PADRAO - patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\hyperframes\skills\hyperframes\patterns.md
**SHA:** 9a31458068668a16
**Timestamp:** 2026-08-26T18:31:10.881301
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- data-start="0"
- data-start="0"
- <div class="slide" data-start="0" data-duration="30" data-track-index="3">...</div>
- <div class="slide" data-start="30" data-duration="25" data-track-index="3">...</div>
- <div class="slide" data-start="55" data-duration="20" data-track-index="3">...</div>
- data-start="0"
- data-start="0"
- data-start="el-1"
- <img id="el-3" data-start="5" data-duration="4" data-track-index="1" src="..." />
- <audio id="el-4" data-start="0" data-duration="30" data-track-index="2" src="..." />

### Ouro Bruto (primeiros 5000 chars)
```
# Composition Patterns

## Picture-in-Picture (Video in a Frame)

Animate a wrapper div for position/size. The video fills the wrapper. The wrapper has NO data attributes.

```html
<div
  id="pip-frame"
  style="position:absolute;top:0;left:0;width:1920px;height:1080px;z-index:50;overflow:hidden;"
>
  <video
    id="el-video"
    data-start="0"
    data-duration="60"
    data-track-index="0"
    src="talking-head.mp4"
    muted
    playsinline
  ></video>
</div>
```

```js
tl.to(
  "#pip-frame",
  { top: 700, left: 1360, width: 500, height: 280, borderRadius: 16, duration: 1 },
  10,
);
tl.to("#pip-frame", { left: 40, duration: 0.6 }, 30);
```

## Title Card with Fade

```html
<div
  id="title-card"
  data-start="0"
  data-duration="5"
  data-track-index="5"
  style="display:flex;align-items:center;justify-content:center;background:#111;z-index:60;"
>
  <h1 style="font-size:64px;color:#fff;opacity:0;">My Video Title</h1>
</div>
```

```js
tl.to("#title-card h1", { opacity: 1, duration: 0.6 }, 0.3);
tl.to("#title-card", { opacity: 0, duration: 0.5 }, 4);
```

## Slide Show with Section Headers

Use separate elements on the same track, each with its own time range. Slides auto-mount/unmount based on `data-start`/`data-duration`.

```html
<div class="slide" data-start="0" data-duration="30" data-track-index="3">...</div>
<div class="slide" data-start="30" data-duration="25" data-track-index="3">...</div>
<div class="slide" data-start="55" data-duration="20" data-track-index="3">...</div>
```

## Top-Level Composition Example

```html
<div
  id="comp-1"
  data-composition-id="my-video"
  data-start="0"
  data-duration="60"
  data-width="1920"
  data-height="1080"
>
  <!-- Primitive clips -->
  <video
    id="el-1"
    data-start="0"
    data-duration="10"
    data-track-index="0"
    src="..."
    muted
    playsinline
  ></video>
  <video
    id="el-2"
    data-start="el-1"
    data-duration="8"
    data-track-index="0"
    src="..."
    muted
    playsinline
  ></video>
  <img id="el-3" data-start="5" data-duration="4" data-track-index="1" src="..." />
  <audio id="el-4" data-start="0" data-duration="30" data-track-index="2" src="..." />

  <!-- Sub-compositions loaded from files -->
  <div
    id="el-5"
    data-composition-id="intro-anim"
    data-composition-src="compositions/intro-anim.html"
    data-start="0"
    data-track-index="3"
  ></div>

  <div
    id="el-6"
    data-composition-id="captions"
    data-composition-src="compositions/caption-overlay.html"
    data-start="0"
    data-track-index="4"
  ></div>

  <script>
    // Just register the timeline — framework auto-nests sub-compositions
    const tl = gsap.timeline({ paused: true });
    window.__timelines["my-video"] = tl;
  </script>
</div>
```

```ction', async () => {}); }
    } catch (e) {
      await step.do('auto reject', async () => await this.env.DB.prepare('UPDATE approvals SET status = ? WHERE id = ?').bind('auto-rejected', event.instanceId).run());
    }
  }
}
```

## Testing Workflows

### Setup

```typescript
// vitest.config.ts
import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';

export default defineWorkersConfig({
  test: {
    poolOptions: {
      workers: {
        wrangler: { configPath: './wrangler.jsonc' }
      }
    }
  }
});
```

### Introspection API

```typescript
import { introspectWorkflowInstance } from 'cloudflare:test';

const instance = await env.MY_WORKFLOW.create({ params: { userId: '123' } });
const introspector = await introspectWorkflowInstance(env.MY_WORKFLOW, instance.id);

// Wait for step completion
const result = await introspector.waitForStepResult({ name: 'fetch user', index: 0 });

// Mock step behavior
await introspector.modify(async (m) => {
  await m.mockStepResult({ name: 'api call' }, { mocked: true });
});
```

## Best Practices

### ✅ DO

1. **Granular steps**: One API call per step (unless proving idempotency)
2. **Idempotency**: Check-then-execute; use idempotency keys
3. **Deterministic names**: Use static or step-output-based names
4. **Return state**: Persist via step returns, not variables
5. **Always await**: `await step.do()`, avoid dangling promises
6. **Deterministic conditionals**: Base on `event.payload` or step outputs
7. **Store large data externally**: R2/KV for >1 MiB, return refs
8. **Batch creation**: `createBatch()` for multiple instances

### ❌ DON'T

1. **One giant step**: Breaks durability & retry control
2. **State outside steps**: Lost on hibernation
3. **Mutate events**: Events immutable, return new state
4. **Non-deterministic logic outside s
```oined", player: newPlayer})));
  }

  async onMessage(conn: Connection, msg: WSMessage) {
    const m = JSON.parse(ms
```

---

# PADRAO - patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\temporal\skills\temporal-developer\references\core\patterns.md
**SHA:** 26c11545cd7d8bc3
**Timestamp:** 2026-08-26T18:42:18.414412
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Execute: Refund payment (step 2 compensation)
- Execute: Release inventory (step 1 compensation)
- Run:

### Ouro Bruto (primeiros 5000 chars)
```
# Temporal Workflow Patterns

## Overview

Common patterns for building robust Temporal workflows.
See the language-specific references for the language you are working in:
- `references/{language}/{language}.md` for the root level documentation for that language
- `references/{language}/patterns.md` for language-specific example code of the patterns in this file.

## Signals

**Purpose**: Send data to a running workflow asynchronously (fire-and-forget).

**When to Use**:
- Human approval workflows
- Adding items to a workflow's queue
- Notifying workflow of external events
- Live configuration updates

**Characteristics**:
- Asynchronous - sender doesn't wait for response
- Can mutate workflow state
- Durable - signals are persisted in history
- Can be sent before workflow starts (signal-with-start)

**Example Flow**:
```
Client                    Workflow
  │                          │
  │──── signal(approve) ────▶│
  │                          │ (updates state)
  │                          │
  │◀──── (no response) ──────│
```

**Note:** A related but distinct pattern to signals is async activity completion. This is an advanced feature, which you may consider if the external system that would deliver the signal is unreliable and might fail to Signal, or
you want the external process to Heartbeat or receive Cancellation. If this may be the case, look at language-specific advanced features for your SDK language (`references/{your_language}/advanced-features.md`).

## Queries

**Purpose**: Read workflow state synchronously without modifying it.

**When to Use**:
- Building dashboards showing workflow progress
- Health checks and monitoring
- Debugging workflow state
- Exposing current status to external systems

**Characteristics**:
- Synchronous - caller waits for response
- Read-only - must not modify state
- Not recorded in history
- Executes on the worker, not persisted
- Can run even on completed workflows

**Example Flow**:
```
Client                    Workflow
  │                          │
  │──── query(status) ──────▶│
  │                          │ (reads state)
  │◀──── "processing" ───────│
```

## Updates

**Purpose**: Modify workflow state and receive a response synchronously.

**When to Use**:
- Operations that need confirmation (add item, return count)
- Validation before accepting changes
- Replace signal+query combinations
- Request-response patterns within workflow

**Characteristics**:
- Synchronous - caller waits for completion
- Can mutate state AND return values
- Supports validators to reject invalid updates before they even get persisted into history
- **Validators must NOT mutate workflow state or block** (no activities, sleeps, or commands) — they are read-only, similar to query handlers
- Recorded in history

**Example Flow**:
```
Client                    Workflow
  │                          │
  │──── update(addItem) ────▶│
  │                          │ (validates, modifies state)
  │◀──── {count: 5} ─────────│
```

## Child Workflows

**When to Use**:
- Prevent history from growing too large
- Isolate failure domains (child can fail without failing parent)
- Different retry policies for different parts

**Characteristics**:
- Own history (doesn't bloat parent)
- Independent lifecycle options (ParentClosePolicy)
- Can be cancelled independently
- Results returned to parent

**Parent Close Policies**:
- `TERMINATE` - Child terminated when parent closes (default)
- `ABANDON` - Child continues running independently
- `REQUEST_CANCEL` - Cancellation requested but not forced

**Note:** Do not need to use child workflows simply for breaking complex logic down into smaller pieces. Standard programming abstractions within a workflow can already be used for that.

## Continue-as-New

**Purpose**: Prevent unbounded history growth by "restarting" with fresh history.

**When to Use**:
- Long-running workflows (entity workflows, subscriptions)
- Workflows with many iterations
- When history approaches 10,000+ events
- Periodic cleanup of accumulated state

**How It Works**:
```
Workflow (history: 10,000 events)
    │
    │ continueAsNew(currentState)
    ▼
New Workflow Execution (history: 0 events)
    │ (same workflow ID, fresh history)
    │ (receives currentState as input)
```

**Best Practice**: Check `historyLength` or `continueAsNewSuggested` periodically.

## Saga Pattern

**Purpose**: Distributed transactions with compensation for failures.

**When to Use**:
- Multi-step operations that span services
- Operations requiring rollback on failure
- Financial transactions, order processing
- Booking systems with multiple reservations

**How It Works**:
```
Step 1: Reserve inventory
  └─ Compensation: Release inventory

Step 2: Charge payment
  └─ Compensation: Refund payment

Step 3: Ship order
  └─ Compensation: Cancel shipment

On failure at step 3:
  Execute: Refund payment (step 2 compensation)
  Execute: Release inventory (step 1 compensation)
```

**Implementation Pattern**:
1. Tr
```

---

# PADRAO - patterns.md
**Origem:** E:\\CentralDark\\_MAPA_CASA\\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.extracted_aiox-core\aiox-core\.aios\patterns.md
**SHA:** 20721a760b2726c8
**Timestamp:** 2026-08-26T19:43:46.465694
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Files using this pattern:** apps/dashboard/src/stores/agent-store.ts
- **Files using this pattern:** apps/dashboard/src/stores/projects-store.ts
- **Files using this pattern:** apps/dashboard/src/components/github/GitHubPanel.tsx
- **Files using this pattern:** tools/health-dashboard/src/hooks/useHealthData.js
- **Files using this pattern:** apps/dashboard/src/app/api/github/route.ts
- **Files using this pattern:** apps/dashboard/src/components/agents/AgentCard.tsx
- **Files using this pattern:** apps/dashboard/src/components/agents/AgentCard.tsx
- **Files using this pattern:** tests/agents/backward-compatibility.test.js
- **Files using this pattern:** packages/installer/tests/integration/environment-configuration.test.js
- **Files using this pattern:** packages/installer/tests/integration/wizard-detection.test.js

### Ouro Bruto (primeiros 5000 chars)
```
# Project Patterns

> Auto-generated from codebase analysis
> Last updated: 2026-01-29T03:28:41.980Z

## Table of Contents

- [State Management](#state-management)
- [API Calls](#api-calls)
- [Error Handling](#error-handling)
- [Components](#components)
- [Data Access](#data-access)
- [Testing](#testing)
- [Hooks](#hooks)
- [Utilities](#utilities)

## State Management

### Zustand Store

```typescript
import { create } from 'zustand';

interface UIState {
  isOpen: boolean;
  toggle: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  isOpen: false,
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}));
```

**When to use:** Client-side state that does not need persistence (UI state, temporary data).

**Files using this pattern:** apps/dashboard/src/stores/agent-store.ts

---

### Zustand Store with Persist

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectsState {
  data: Data | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  reset: () => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      data: null,
      loading: false,
      error: null,
      fetchData: async () => {
        set({ loading: true, error: null });
        try {
          const data = await api.get('/example');
          set({ data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },
      reset: () => set({ data: null, loading: false, error: null }),
    }),
    { name: 'aios-core' }
  )
);
```

**When to use:** Any domain state that needs persistence across sessions (settings, preferences, cached data).

**Files using this pattern:** apps/dashboard/src/stores/projects-store.ts

---

## API Calls

### SWR Data Fetching

```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useData(id: string) {
  const { data, error, isLoading, mutate } = useSWR<DataType>(
    id ? `/api/data/${id}` : null,
    fetcher,
    {
      refreshInterval: 5000,
      revalidateOnFocus: true,
      dedupingInterval: 2000,
    }
  );

  return {
    data,
    isLoading,
    isError: error,
    refresh: mutate,
  };
}
```

**When to use:** Client-side data fetching with automatic cache management and real-time sync.

**Files using this pattern:** apps/dashboard/src/components/github/GitHubPanel.tsx

---

### Fetch with Error Handling

```typescript
async function fetchData<T>(url: string, options?: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}
```

**When to use:** Simple API calls without external libraries.

**Files using this pattern:** tools/health-dashboard/src/hooks/useHealthData.js

---

## Error Handling

### Try-Catch with Context

```typescript
async function operation(params: Params): Promise<Result> {
  try {
    const result = await performOperation(params);
    return result;
  } catch (error) {
    console.error(`Error in operation [${params.id}]:`, error);
    throw new Error(`Failed to perform operation: ${error.message}`);
  }
}
```

**When to use:** Any async operation that needs proper error tracking.

**Files using this pattern:** apps/dashboard/src/app/api/github/route.ts

---

## Components

### Memoized Component

```typescript
import { memo } from 'react';

interface CardProps {
  title: string;
  description: string;
  onClick?: () => void;
}

export const Card = memo(function Card({ title, description, onClick }: CardProps) {
  return (
    <div className="card" onClick={onClick}>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
});
```

**When to use:** Components that receive the same props frequently and are expensive to render.

**Files using this pattern:** apps/dashboard/src/components/agents/AgentCard.tsx

---

### Conditional Class Names

```typescript
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', disabled, children }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'rounded font-medium transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'md' && 'px-
```

---

# PADRAO - patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\patterns.md
**SHA:** 447ea50e9c7483d4
**Timestamp:** 2026-08-28T02:02:06.671799
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Riscos
- blocker: true
- blocker: false
- blocker: false
- blocker: true

### Ouro Bruto (primeiros 5000 chars)
```
# Learned Patterns Management

## Purpose

View, manage, and review learned workflow patterns captured by the Workflow Intelligence System (WIS). Patterns are learned from successful workflow executions and boost suggestion confidence.

## Task Definition (AIOS Task Format V1.0)

```yaml
task: patterns()
agent: "@dev"
responsável: Dex (Developer)
responsavel_type: Agente
atomic_layer: Workflow

elicit: false

inputs:
  - name: subcommand
    type: enum
    required: false
    default: list
    options: [list, stats, prune, review]
    description: Action to perform

  - name: status
    type: enum
    required: false
    options: [pending, active, promoted, deprecated]
    description: Filter patterns by status

  - name: limit
    type: number
    required: false
    default: 10
    description: Maximum patterns to display

  - name: help
    type: flag
    required: false
    default: false
    description: Show usage documentation

outputs:
  - name: patterns
    type: array
    destino: Console
    persistido: false

  - name: stats
    type: object
    destino: Console
    persistido: false
```

---

## Pre-Conditions

```yaml
pre-conditions:
  - [ ] Learning module is available
    tipo: pre-condition
    blocker: true
    validação: Check workflow-intelligence/learning module loads
    error_message: "Pattern learning module not available."

  - [ ] Pattern storage exists
    tipo: pre-condition
    blocker: false
    validação: Check .aios-core/data/learned-patterns.yaml exists
    error_message: "No patterns stored yet."
```

---

## Implementation Steps

### Step 1: Check Help Flag
```javascript
if (args.help) {
  displayHelp();
  return;
}
```

### Step 2: Load Learning Module
```javascript
const learning = require('.aios-core/workflow-intelligence/learning');
const store = learning.getDefaultStore();
```

### Step 3: Execute Subcommand

#### List Patterns
```javascript
if (args.subcommand === 'list' || !args.subcommand) {
  const data = store.load();
  let patterns = data.patterns;

  // Filter by status if provided
  if (args.status) {
    patterns = patterns.filter(p => p.status === args.status);
  }

  // Sort by occurrences (descending)
  patterns.sort((a, b) => (b.occurrences || 1) - (a.occurrences || 1));

  // Limit results
  patterns = patterns.slice(0, args.limit || 10);

  displayPatternList(patterns);
}
```

#### Show Stats
```javascript
if (args.subcommand === 'stats') {
  const stats = store.getStats();
  displayStats(stats);
}
```

#### Prune Patterns
```javascript
if (args.subcommand === 'prune') {
  const result = store.prune();
  console.log(`✓ Pruned ${result.pruned} patterns. ${result.remaining} remaining.`);
}
```

#### Review Patterns
```javascript
if (args.subcommand === 'review') {
  const pendingPatterns = store.getByStatus('pending');

  if (pendingPatterns.length === 0) {
    console.log('No patterns pending review.');
    return;
  }

  // Interactive review (uses elicitation)
  for (const pattern of pendingPatterns) {
    const action = await promptReviewAction(pattern);
    if (action === 'quit') break;

    store.updateStatus(pattern.id, action === 'promote' ? 'active' : action);
    console.log(`✓ Pattern ${action}d.`);
  }
}
```

---

## Help Text

```text
Usage: *patterns [subcommand] [options]

Manage learned workflow patterns.

Subcommands:
  list     List all learned patterns (default)
  stats    Show pattern statistics
  prune    Remove stale/low-value patterns
  review   Interactive review of pending patterns

Options:
  --status <status>  Filter by status (pending, active, promoted, deprecated)
  --limit <n>        Limit results (default: 10)
  --help             Show this help message

Examples:
  *patterns                          # List top 10 patterns
  *patterns list --status active     # List active patterns only
  *patterns stats                    # Show statistics
  *patterns prune                    # Remove stale patterns
  *patterns review                   # Review pending patterns

Pattern Lifecycle:
  1. pending  - Newly captured, awaiting review
  2. active   - Validated, used in suggestions
  3. promoted - High-value, prioritized in suggestions
  4. deprecated - Marked for removal
```

---

## Output Formats

### List Output
```text
Learned Patterns (15 total)
═══════════════════════════

Top Patterns by Occurrence:
1. validate-story-draft → develop → review-qa
   Occurrences: 12 | Success: 95% | Status: promoted
   Workflow: story_development | Last seen: 2h ago

2. develop → review-qa → apply-qa-fixes
   Occurrences: 8 | Success: 88% | Status: active
   Workflow: story_development | Last seen: 1d ago

3. create-story → validate-story-draft → develop
   Occurrences: 6 | Success: 100% | Status: active
   Workflow: story_creation | Last seen: 3d ago

Showing 3 of 15 patterns. Use --limit to see more.
```

### Stats Output
```text
Pattern Learning Statistics
═══════════════════════════

Storage:
  Total patterns: 15
  Max patterns: 100
  Util
```

---

# PADRAO - patterns.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\marketplace-cache\783232b622f8182e\plugins\plugin-dev\skills\hook-development\references\patterns.md
**SHA:** cb607fca192bfa89
**Timestamp:** 2026-08-28T02:53:37.627892
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- Load project-specific context at session start:

### Ouro Bruto (primeiros 5000 chars)
```
# Common Hook Patterns

This reference provides common, proven patterns for implementing Claude Code hooks. Use these patterns as starting points for typical hook use cases.

## Pattern 1: Security Validation

Block dangerous file writes using prompt-based hooks:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "File path: $TOOL_INPUT.file_path. Verify: 1) Not in /etc or system directories 2) Not .env or credentials 3) Path doesn't contain '..' traversal. Return 'approve' or 'deny'."
        }
      ]
    }
  ]
}
```

**Use for:** Preventing writes to sensitive files or system directories.

## Pattern 2: Test Enforcement

Ensure tests run before stopping:

```json
{
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Review transcript. If code was modified (Write/Edit tools used), verify tests were executed. If no tests were run, block with reason 'Tests must be run after code changes'."
        }
      ]
    }
  ]
}
```

**Use for:** Enforcing quality standards and preventing incomplete work.

## Pattern 3: Context Loading

Load project-specific context at session start:

```json
{
  "SessionStart": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/load-context.sh"
        }
      ]
    }
  ]
}
```

**Example script (load-context.sh):**
```bash
#!/bin/bash
cd "$CLAUDE_PROJECT_DIR" || exit 1

# Detect project type
if [ -f "package.json" ]; then
  echo "📦 Node.js project detected"
  echo "export PROJECT_TYPE=nodejs" >> "$CLAUDE_ENV_FILE"
elif [ -f "Cargo.toml" ]; then
  echo "🦀 Rust project detected"
  echo "export PROJECT_TYPE=rust" >> "$CLAUDE_ENV_FILE"
fi
```

**Use for:** Automatically detecting and configuring project-specific settings.

## Pattern 4: Notification Logging

Log all notifications for audit or analysis:

```json
{
  "Notification": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/log-notification.sh"
        }
      ]
    }
  ]
}
```

**Use for:** Tracking user notifications or integration with external logging systems.

## Pattern 5: MCP Tool Monitoring

Monitor and validate MCP tool usage:

```json
{
  "PreToolUse": [
    {
      "matcher": "mcp__.*__delete.*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Deletion operation detected. Verify: Is this deletion intentional? Can it be undone? Are there backups? Return 'approve' only if safe."
        }
      ]
    }
  ]
}
```

**Use for:** Protecting against destructive MCP operations.

## Pattern 6: Build Verification

Ensure project builds after code changes:

```json
{
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Check if code was modified. If Write/Edit tools were used, verify the project was built (npm run build, cargo build, etc). If not built, block and request build."
        }
      ]
    }
  ]
}
```

**Use for:** Catching build errors before committing or stopping work.

## Pattern 7: Permission Confirmation

Ask user before dangerous operations:

```json
{
  "PreToolUse": [
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Command: $TOOL_INPUT.command. If command contains 'rm', 'delete', 'drop', or other destructive operations, return 'ask' to confirm with user. Otherwise 'approve'."
        }
      ]
    }
  ]
}
```

**Use for:** User confirmation on potentially destructive commands.

## Pattern 8: Code Quality Checks

Run linters or formatters on file edits:

```json
{
  "PostToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "bash ${CLAUDE_PLUGIN_ROOT}/scripts/check-quality.sh"
        }
      ]
    }
  ]
}
```

**Example script (check-quality.sh):**
```bash
#!/bin/bash
input=$(cat)
file_path=$(echo "$input" | jq -r '.tool_input.file_path')

# Run linter if applicable
if [[ "$file_path" == *.js ]] || [[ "$file_path" == *.ts ]]; then
  npx eslint "$file_path" 2>&1 || true
fi
```

**Use for:** Automatic code quality enforcement.

## Pattern Combinations

Combine multiple patterns for comprehensive protection:

```json
{
  "PreToolUse": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate file write safety"
        }
      ]
    },
    {
      "matcher": "Bash",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Validate bash command safety"
        }
      ]
    }
  ],
  "Stop": [
    {
      "matcher": "*",
      "hooks": [
        {
          "type": "prompt",
          "prompt": "Verify tests run and build succeeded"
        }
      ]
    }
  ],
  "SessionStart": [
 
```