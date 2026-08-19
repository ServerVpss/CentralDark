---
name: brain-memory
description: Record taste signals and apply-evidence events into the observing-memory layer. INVOKE this skill (and call `brain_feedback`) the moment the user expresses a preference, dislike, correction, or rule in dialogue. Separately invoke `brain_apply_evidence` after producing a durable artifact when a preference plausibly applies. SKIP only for casual chat, exploration without a stated rule, read-only inspection, and trivial edits. When a preference plausibly applies but you are unsure, RECORD with `note: "speculative; <reason>"` rather than skipping.
---

# Brain Memory — Observing-Memory Layer

Brain is the agent-writable observing-memory layer. It accumulates user preferences from real signals and learns from real applications.

## When to call `brain_feedback`
Call **once per taste signal** the user expresses:
- Explicit corrections: "don't do X", "stop doing Y", "use A instead of B"
- Stated preferences with outlasting reach: "I prefer X over Y", "always include a CHANGELOG entry"
- Pushback on a specific artifact targeting a *rule*, not a one-off
- A teammate agent or human describing a process rule that should survive future sessions

Parameters:
- `topic`: stable kebab-slug for the rule (reuse existing — call `brain_query --topic <slug>` first)
- `signal`: `positive` (rule to follow) or `negative` (what to avoid)
- `principle`: one-line, imperative-voice agent-readable formulation
- `agent`: your runtime identity
- `scope`: soft category — `writing`, `coding`, `process`, `design`, `infra`, `docs` (narrowest accurate)
- `source`: array of wikilinks to triggering artifacts
- `raw`: the verbatim quote that triggered the signal (strongly recommended)

## When to call `brain_apply_evidence`
Call **once per (preference, artifact) pair**, right after a durable artifact lands.
Discover applicable preferences first via `brain_query`.
Parameters: `pref_id`, `artifact` (wikilink), `result` (`applied`/`violated`), `agent`, `note` (optional).

## When NOT to call
- Casual chat, brainstorming, read-only inspection, trivial edits.
- When unsure if preference applies → record with `note: "speculative; <reason>"`.

## Language
`principle` and `note` must match the **natural language the user has been speaking in this session**. Technical identifiers stay English.

## CLI fallback
When MCP unavailable:
```bash
o2b brain feedback --topic <slug> --signal <positive|negative> --principle "..." --agent <identity>
o2b brain apply-evidence --pref <pref_id> --artifact "[[path]]" --result <applied|violated> --agent <identity>
```
