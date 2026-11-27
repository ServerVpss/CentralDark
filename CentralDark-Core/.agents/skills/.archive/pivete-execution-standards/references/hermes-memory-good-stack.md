# Hermes memory good stack (2026)

## Secret in one line
Short facts in prompt · full history in SQLite · procedures in skills · optional ONE external provider for auto-recall.

## Four official layers
1. **Prompt memory (hot)** — `MEMORY.md` (~2200) + `USER.md` (~1375) under profile `memories/`. Frozen snapshot at session start. Agent-curated via `memory` tool. Full = error, must consolidate same turn.
2. **Session archive (cold)** — `state.db` FTS5 + `session_search`. Episodic: "what did we do about X". Not auto-injected every turn.
3. **Skills (procedural)** — `skills/` + `skill_manage` + `/learn` + curator. Real self-improve loop. Prefer skills over stuffing MEMORY with workflows.
4. **External provider (optional)** — at most one: holographic (local SQLite), hindsight (graph/reflect), honcho (user modeling), openviking, mem0, supermemory, byterover, retaindb, memori. Additive to built-in; never two externals.

## Pivete policy (REGRAS #17)
Winner: **B = native MEMORY/USER + 3T NUCLEO (HOJE/SEMANA/REGRAS)**.
Hindsight/extra provider: only if real pain (auto-recall / semantic rephrase). Avoid dual retain/recall confusion.

Promotion map:
```text
stable preference/fact  → USER.md / MEMORY.md
mission / hot state     → HOJE.md
maturing pattern        → SEMANA.md
stable tested rule      → REGRAS.md
repeatable procedure    → skill
past conversation       → session_search
```

## Hygiene (what X + docs agree on)
- Dense entries, not diaries.
- Skip trivial / re-searchable / raw dumps / session ephemera.
- MEMORY on disk can be large while **injection limit** still 2200 — curate what the tool manages.
- Mid-session writes hit disk now, system prompt next session.
- Skills ≠ memory: skills = how; memory = who/what/env.

## Commands
```bash
hermes -p pivete memory status
hermes -p pivete memory setup    # pick provider when authorized
hermes -p pivete memory off
```

## Safe upgrade order (Casa first)
1. Hygiene only (B stack).
2. Holographic local if needed (zero extra dep).
3. Hindsight local if graph/reflect needed.
4. Honcho if multi-profile user modeling.

## Do not
- Dump Grok session novels into MEMORY.md.
- Run two external providers.
- Confuse GitHub `docs/CONSCIENCIA/` (project memory) with profile runtime memory without hierarchy.
- Treat "provider installed" as "provider active" — check `memory status`.
