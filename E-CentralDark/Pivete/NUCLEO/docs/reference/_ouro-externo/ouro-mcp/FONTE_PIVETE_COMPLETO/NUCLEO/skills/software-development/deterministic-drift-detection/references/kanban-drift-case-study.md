# Kanban Drift Case Study — Hermes Kanban Stabilizer Mission (2026-08-05)

## Mission Context
FASES 2-4 of "CONSTRUIR O ESTABILIZADOR CANÔNICO DO KANBAN DO HERMES" — build deterministic drift detection for Hermes Kanban without modifying upstream code.

## Key Findings

### Dynamic Discovery (Corrected from Hardcoded)
- **KANBAN_URL**: Port 9119 active (dashboard), not 8648 (Web UI) — discovered via socket probe
- **CLI_VERSION**: `hermes --version` → first line only: "Hermes Agent v0.20.0 (2026.8.3)"
- **CLI_COMMANDS**: Parsed from `hermes kanban --help` (30 subcommands)
- **BOARD_NAME**: `hermes kanban boards show` → "default"
- **VALID_STATUSES**: From upstream `kanban_db.py:102` — 9 statuses
- **VALID_BLOCK_KINDS**: From upstream `kanban_db.py:125` — 4 kinds: dependency, needs_input, capability, transient

### Evidence-Based Card Classification

| Card | Primary | Secondary | Evidence |
|------|---------|-----------|----------|
| `t_6c3d5e16` | WORKER_CRASH | PROVIDER_RATE_LIMIT | 5 crashed runs (different PIDs), HTTP 429 in logs |
| `t_35432f15` | WORKER_CRASH | CAPABILITY_MISSING | 6 crashed runs, "Unknown provider custom:routellm", HTTP 429 |
| `t_ae83ea45` | — | — | SHA-256 fixture test passed, DONE |

**Critical**: Never classify from title alone. Always use `show`/`runs`/`log`.

### Four Hash Separation

| Hash | Value | Purpose |
|------|-------|---------|
| DATABASE_SCHEMA_HASH | `94fbdc9a83c835eea6156204e9a17ffc504f25030c411d111b60bfa98e8fd6c0` | Schema-only (CREATE statements) |
| ADAPTER_CODE_HASH | `2ea7a19baf731121b3e88e2e554b2681e53eacfb5cbde0f3a4d824cfb2bd2221` | Skill code (SKILL.md) |
| CONTRACT_HASH | `2a888b5b7da53d58420bfbcbcd932756795d95159b620dc0345863eb8b990123` | Canonical expectations |
| RUNTIME_SNAPSHOT_HASH | Per-capture | Ephemeral debug snapshot |

### Drift Detection Results (All Tested)

| Test | Drift Class | Exit Code | Notes |
|------|-------------|-----------|-------|
| Baseline (restored state) | NO_CHANGE | 0 | ✅ |
| Modify SKILL.md only | SAFE_ADAPTER_DRIFT | 0 | ✅ |
| Contract CLI_VERSION changed | UPSTREAM_DRIFT | 1 | ✅ |
| Contract VALID_STATUSES reduced | BROKEN_CONTRACT | 1 | ✅ (cards have "blocked" not in VALID_STATUSES) |
| Contract CLI_VERSION + BOARD_NAME | AMBIGUOUS_DRIFT | 1 | ✅ |
| SKILL.md + Contract CLI_VERSION | AMBIGUOUS_DRIFT | 1 | ✅ |
| Two consecutive runs | NO_CHANGE (idem) | 0 | ✅ Idempotent |

### Pipeline Implementation

`scripts/drift_detector.py` — Pure Python, deterministic:
1. **CAPTURE** — Probe runtime (CLI, DB schema, ports, cards)
2. **NORMALIZE** — Sort lists, strip volatile fields
3. **COMPARE** — Diff against canonical contract
4. **CLASSIFY** — Map to one of six classes
5. **DECIDE** — Actions + unknowns per class
6. **REPORT** — Structured JSON report

### Upstream/Owned Separation Enforced

- **Upstream** (READ_ONLY): `C:\Users\danda\AppData\Local\hermes\hermes-agent\` — never modified
- **Owned** (single writer): `skills/productivity/kanban-inventory/` — contracts, selectors, rules, tests, scripts, state
- **Extension points**: kanban.db + CLI + skill system (official APIs only)

### Circuit Breaker Signals (Upstream)

- `failure_limit = 2` (dispatcher level)
- `BLOCK_RECURRENCE_LIMIT = 2` (kanban_db.py:134)
- `consecutive_failures` counter on tasks
- Reset only on successful completion

## Lessons Learned

1. **Port 9119 ≠ 8648** — Dashboard runs on 9119, Web UI on 8648. Probe both.
2. **First line only for version** — Full output includes install dir, Python, SDK.
3. **Schema hash ≠ data hash** — Only CREATE statements, not row contents.
4. **Block kinds are typed** — Upstream enforces 4 VALID_BLOCK_KINDS; legacy NULL allowed.
5. **Block recurrence limit = 2** — Third re-block for same kind → triage.
6. **Worker crash = "pid not alive"** — Not provider error; separate class.
7. **HTTP 429 = PROVIDER_RATE_LIMIT** — But check for "usage limit reached" → PROVIDER_CREDIT_OR_QUOTA.
8. **Unknown provider = CAPABILITY_MISSING** — Config issue, not transient.

## Files Created

```
skills/productivity/kanban-inventory/
├── contracts/kanban-contract.json      # Full canonical contract
├── scripts/drift_detector.py           # Deterministic detector
├── state/contract_hash.txt             # LAST_KNOWN_GOOD
├── state/runtime_snapshot_*.json       # Debug snapshots
└── state/drift_report_*.json           # Test reports (13)
```

## Next Gates

- FASE 5: Correção Estabilizadora (autocorreção condicional, 9 condições)
- FASE 6: Aprendizado Contínuo Controlado
- FASE 7: Kanban Autônomo (cartões materiais apenas)
- FASE 8: Testes completos
- FASE 9: Prova de Autonomia (12 critérios)