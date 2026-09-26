# Session logs + MetaLupa state (profile pivete)

Use when Pivete asks where CLI/session/terminal logs live, or where MetaLupa / AUTOLUPA work stopped.

## Log map (Windows, profile pivete)

| Kind | Path |
|------|------|
| Agent CLI log | `C:\Users\danda\AppData\Local\hermes\profiles\pivete\logs\agent.log` (+ `.1`/`.2`/`.3`) |
| Errors | `...\logs\errors.log` |
| Gateway | `...\logs\gateway.log`, `gateway-stdio.log`, `gateway-exit-diag.log` |
| CLI command history | `...\profiles\pivete\.hermes_history` |
| Session dumps (compaction/parallel) | `...\profiles\pivete\sessions\request_dump_*.json` |
| Sessions index | `...\profiles\pivete\sessions\sessions.json` |
| Kanban task worker logs | `C:\Users\danda\AppData\Local\hermes\kanban\logs\` e.g. `t_35432f15.log` |
| Kanban workspaces | `C:\Users\danda\AppData\Local\hermes\kanban\workspaces\` |
| Session DB | `...\profiles\pivete\state.db` |

Long session dump pattern for this house arc: `request_dump_20260804_201550_046af4_*.json`.

## MetaLupa — where it stopped (2026-08-05)

- Disk fio (HOJE/CARD): `ATUALIZAR_E_SINCRONIZAR_METALUPA_LOCAL` = **DEPOSITADA_NAO_INICIADA**.
- Local skill: `C:\Users\danda\AppData\Local\hermes\profiles\pivete\skills\meta-lupa\` (user-owned; curator cannot auto-patch).
- Repo mirror: `E:\CentralDark\Pivete\CentralDark\.agents\skills\meta-lupa\`.
- Kanban card: `t_35432f15` title ~`A tualcizarer AUTOLUPA_CANO` — **blocked**.
- Evidence on that card: WORKER_CRASH (`pid not alive`, consecutive_failures) + PROVIDER_RATE_LIMIT (HTTP 429 usage limit on openai-codex) in `hermes kanban log t_35432f15`.
- Agent log: curator refused autonomous `skill_manage` patch on `meta-lupa` (user-owned).

## MetaLupa XP / auto-improvement (exists, not free-running)

MetaLupa **does** include an XP system — not a separate “instinto superior” skill:

| Piece | Location |
|-------|----------|
| XP-1..XP-6 | `meta-lupa/scripts/meta_lupa.py` + SKILL.md |
| Append-only ledger | `meta-lupa/references/uso-ledger.jsonl` |
| AutoLupa + ponto fixo | `guardrails/validar_selo_ponto_fixo.py` |
| PADRAO-XP lab | `docs/RELATORIOS/2026-07-28-lab-adversarial-metalupa-vs-fable5/PADRAO-XP.md` |

Operational note from 2026-08-02 sessions: XP code + ledger exist; full hot AutoLupa → baseline APROVADA → “XP unlocked” was still pending when AUTOLUPA card blocked. Not silent auto-rewrite of the skill.

Related but not MetaLupa: `fable-loop` (external, fail-closed vs MetaLupa), `pivete-auto-improvement`, Telegram card field `XP:` (display).

## Goku / cabelo prata

No textual FTS/history/HOJE hit for `goku` / `cabelo prata` as of 2026-08-05 search. If it existed, likely image-only (vision) or base64 inside a request_dump — not a named canonical file.

## Pitfalls

- Do not invent skill name `instinto superior` — not installed.
- Do not classify `t_35432f15` from title alone; use log + runs.
- `search_files` on some Windows path forms may IO-error; prefer `terminal` + absolute `C:/` / `E:/` paths for log greps.
