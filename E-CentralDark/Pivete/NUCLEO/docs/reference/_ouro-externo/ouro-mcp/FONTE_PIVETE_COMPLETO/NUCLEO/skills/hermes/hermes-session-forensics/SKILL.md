---
name: hermes-session-forensics
description: "Use when locating Hermes CLI/session/Kanban logs."
---

# Hermes session forensics (profile pivete)

Class-level skill for **locating logs** and **rebuilding stop-state** on Windows profile `pivete`. Read-only by default.

## When to use

- "onde ficam os logs da CLI / sessão / terminal"
- "procura em paralelo nos dumps"
- "aonde parou a MetaLupa / AUTOLUPA"
- blocked Kanban card needs log+runs evidence
- session recovery across compaction (`request_dump_*`)

## Log map

| Kind | Path |
|------|------|
| Agent | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\logs\agent.log` (+ rotations) |
| Errors | `...\logs\errors.log` |
| Gateway | `...\logs\gateway.log`, `gateway-stdio.log` |
| CLI history | `...\profiles\pivete\.hermes_history` |
| Session dumps | `...\profiles\pivete\sessions\request_dump_*.json` |
| Sessions index | `...\sessions\sessions.json` |
| Session DB | `...\state.db` |
| Kanban worker logs | `C:\Users\danda\AppData\Local\hermes\kanban\logs\t_*.log` |
| Kanban workspaces | `...\kanban\workspaces\t_*` |

Long house arc dumps: `request_dump_20260804_201550_046af4_*.json`.

## Workflow

1. Identify session id (`session_search` browse/discover or `sessions.json`).
2. Grep agent/errors with absolute `C:/` paths via `terminal` if `search_files` IO-errors on Windows.
3. For Kanban blocks: `hermes kanban show|runs|log <id>` — classify from **log evidence**, not title.
4. Cross-check HOJE/SEMANA/CARTAO-MESTRE for deposited fios.
5. Report: path + last proven state + next minimal proof step.

## MetaLupa stop-state (as of 2026-08-05)

- Fio: `ATUALIZAR_E_SINCRONIZAR_METALUPA_LOCAL` = DEPOSITADA_NAO_INICIADA.
- Skill path: `profiles\pivete\skills\meta-lupa\` (**user-owned** — curator cannot auto-patch; recommend `hermes curator adopt meta-lupa` if content must change).
- Card `t_35432f15` AUTOLUPA_CANO **blocked**: WORKER_CRASH + HTTP 429 (see kanban log).
- XP system **exists inside MetaLupa** (XP-1..6, `references/uso-ledger.jsonl`, AutoLupa ponto-fixo). Not a skill named "instinto superior". Not free-running self-rewrite.

## Kanban write authority (related)

Active gate for stabilizer/canary writes: `PERMITO SEGREDO` + `SEGREDO/CHEFE`.  
`PERMITO PIVETE` alone = BLOCKED on that gate.  
Canary cleanup: `archive` then `archive --rm` (no `cancel` verb).  
Parse card status with `^\s*status:\s*(\S+)` only — full show text still contains "blocked" in history.

Full Kanban stabilizer: skill `kanban-inventory` + `scripts/drift_detector.py`.  
Detail also under `kanban-inventory/references/session-logs-and-metalupa-state.md`.

## Pitfalls

- Do not invent skill `instinto superior`.
- Image-only claims may leave **no FTS text** — say AUSENTE_NO_TEXTO, not "never existed".
- Title inference for blocks = false green; always open log/runs.
- User-owned skills (meta-lupa) are off-limits to autonomous curator patch.

## Quick commands

```bash
ls "%LOCALAPPDATA%\hermes\profiles\pivete\logs"
grep -niE "meta.?lupa|autolupa" "%LOCALAPPDATA%\hermes\profiles\pivete\logs\agent.log" | tail -40
hermes kanban list
hermes kanban show t_35432f15
hermes kanban log t_35432f15
```
