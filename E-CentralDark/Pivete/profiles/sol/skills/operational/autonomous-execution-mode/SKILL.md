---
name: autonomous-execution-mode
version: "1.0.0"
description: "User demands autonomous operation without chat interruption."
trigger: "User requests autonomous silent monitoring; reuse existing infra."
author: "Hermes Agent"
license: "MIT"
tags: ["operational", "autonomy", "monitoring", "silent-mode"]
related_skills: ["autonomous-ai-agents", "centraldark-operational-discipline", "operational-communication"]
---

# Autonomous Execution Mode

## Overview

Operate in **silent autonomous mode** when the user explicitly demands:
- No chat interruptions during execution
- Goal persistence without re-confirmation
- Silent monitoring (PRs, commits, dependencies)
- "So faz", "fui", "gira", "autonomia"

This mode is **NOT** about creating new tools — it's about **orchestrating existing infrastructure** toward a standing goal while respecting the user's silence preference.

## When to Use

- User says "autonomia", "so faz", "não me manda msg", "fui"
- Standing goal is defined (e.g., "500 PRs", "monitor until 18:00")
- User wants monitoring without interruption
- User wants agent to use existing skills/infra autonomously

## When NOT to Use

- User asks for chat interaction
- Goal is undefined or ambiguous
- Execution requires user input/dialogue
- One-off task that doesn't warrant persistent monitoring

## Protocol

### 1. Silence First

- **DO NOT** send chat messages during autonomous operation unless critical failure occurs
- **DO** record state changes in logs/internal state
- **DO** respect "fui" / "vai" as signal to stop interrupting

### 2. Goal Persistence

- Maintain standing goal across context resets if possible
- Re-acquire goal from conversation history if needed
- Do not treat goal as "completed" until user confirms or metric is reached

### 3. Reuse Existing Infrastructure

- Prefer existing skills (CentralDark skills, dependabot, etc.) over creating new tools
- Use GitHub (commits/PRs) as communication channel when user prefers
- Leverage existing monitoring loops rather than ad-hoc checks

### 4. Minimal Intervention

- Act only when goal state changes or critical threshold is hit
- Avoid "updating" the user on progress unless asked
- Record deltas internally; expose only on request or completion
- User style: baianês ultra-conciso; no texto longo. Default: execute then report, NOT explain then ask.
- Communication: PR/delta first, chat second when user sets COMITE_NO_PR_NAO_NO_CHAT.
- Parallelism: batches of independent tool calls are allowed; "20 frentes" means independent reads/measurements, not unlimited parallel mutation.
- State verification: before declaring state, measure VPS + remote + source of truth (GitHub). Do not conclude from local-only evidence.
- Worktree/pr ambiguity: if a worktree appears broken/locked, verify PR/branch state on remote and reflog before assuming agent failure. Abandon only after proof, not on first signal.

## Pitfalls

| # | Pitfall | Fix |
|---|---------|-----|
| 1 | Interrupting user despite "não me manda msg" | Respect silence preference; log internally |
| 2 | Treating goal as complete without verification | Validate against actual metric (e.g., PR count) |
| 3 | Creating new tools instead of reusing existing | Check existing skills/infra first (REUSE_BEFORE_CREATE) |
| 4 | Losing goal across context reset | Re-acquire from history or re-establish from standing instructions |
| 5 | Over-communicating progress | Only report on completion or critical failure |
| 6 | Empty/partial response after tool calls | After any tool call returns results, you MUST process them and produce a substantive continuation — never return an empty response, a truncated response, or a response that leaves the task unresolved. Tool results are inputs to the next action, not endpoints. If synthesis collapses after gathering tool results, retry synthesis before returning anything. An empty response after tool execution is a failure mode, not a neutral pause. |
| 7 | Treating mid-loop paste as new task instead of mission delta | When the user sends a paste mid-execution (especially under MEGAZORD/AUTO mode), treat it as a continuation delta of the current mission, not a reason to stop, reconfirm, or restart. Process the delta, integrate it into the loop state, and continue. The paste is fuel for the ongoing mission, not a circuit breaker. |

## References

- `references/no-interruption-protocol.md` — Protocol for silent operation
- `references/goal-persistence.md` — Maintaining goals across sessions
- `references/reuse-existing-infra.md` — Orchestrating existing skills/infra

## Example

User: "AUTONOMIA ATE AS 18 HRS. USA SKILS DA CENTRAL DARK. NAO ME MANDA MSG."

Agent action:
1. Confirm goal: Monitor PRs/commits until 18:00 BR
2. Enable silent mode: No chat interruption
3. Use existing skills: CentralDark skills for monitoring
4. Record state: Internal log of state changes
5. Stop at 18:00: Deliver summary if requested, otherwise wait

**BOOT:** `AUTONOMOUS_EXECUTION_MODE`
