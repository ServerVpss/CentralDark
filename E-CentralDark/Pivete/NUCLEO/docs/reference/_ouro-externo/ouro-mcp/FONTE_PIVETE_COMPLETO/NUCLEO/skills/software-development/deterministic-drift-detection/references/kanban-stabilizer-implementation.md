# Kanban Stabilizer — Implementation Log (2026-08-05)

## Mission
CONSTRUIR O ESTABILIZADOR CANÔNICO DO KANBAN DO HERMES — FASES 2-4 completed.

## Scope
Profile: `pivete`
Skill: `kanban-inventory` (existing) → enhanced with contracts, scripts, drift detector
Upstream: `C:\Users\danda\AppData\Local\hermes\hermes-agent\` (READ_ONLY)

## Phases Completed

### FASE 2: Separar Propriedade ✅
| Layer | Path | Permission |
|-------|------|------------|
| Upstream | `hermes-agent\` | READ_ONLY |
| Owned | `skills/productivity/kanban-inventory/` | Single writer (pivete) |
| Extension Points | kanban.db + CLI + skill system | Official APIs only |

### FASE 3: Contrato Determinístico ✅
**File**: `contracts/kanban-contract.json`

**Key Corrections Applied**:
- KANBAN_URL discovered dynamically (port 9119, not hardcoded 8648)
- Four separated hashes: DATABASE_SCHEMA_HASH, ADAPTER_CODE_HASH, CONTRACT_HASH, RUNTIME_SNAPSHOT_HASH
- CLI_VERSION normalized to first line only
- CLI_COMMANDS from `hermes kanban --help` (30 subcommands)
- VALID_STATUSES / VALID_BLOCK_KINDS from upstream constants
- Card classification from EVIDENCE (show/runs/log), never from title

**Hashes**:
```
DATABASE_SCHEMA_HASH: 94fbdc9a83c835eea6156204e9a17ffc504f25030c411d111b60bfa98e8fd6c0
ADAPTER_CODE_HASH: 2ea7a19baf731121b3e88e2e554b2681e53eacfb5cbde0f3a4d824cfb2bd2221
CONTRACT_HASH: 2a888b5b7da53d58420bfbcbcd932756795d95159b620dc0345863eb8b990123
```

### FASE 4: Detector de Drift ✅
**File**: `scripts/drift_detector.py`

**Pipeline**: CAPTURE → NORMALIZE → COMPARE → CLASSIFY → DECIDE → REPORT

**Six Classes Tested**:
| Test | Drift Class | Exit Code | Result |
|------|-------------|-----------|--------|
| Baseline | NO_CHANGE | 0 | ✅ |
| Modify SKILL.md | SAFE_ADAPTER_DRIFT | 0 | ✅ |
| Contract CLI_VERSION | UPSTREAM_DRIFT | 1 | ✅ |
| Contract VALID_STATUSES | BROKEN_CONTRACT | 1 | ✅ |
| CLI_VERSION + BOARD_NAME | AMBIGUOUS_DRIFT | 1 | ✅ |
| SKILL.md + CLI_VERSION | AMBIGUOUS_DRIFT | 1 | ✅ |
| Two runs | NO_CHANGE (idem) | 0 | ✅ |

**Evidence-Based Card Classification**:
| Card | Primary | Secondary | Evidence |
|------|---------|-----------|----------|
| `t_6c3d5e16` | WORKER_CRASH | PROVIDER_RATE_LIMIT | 5 crashed runs, HTTP 429 |
| `t_35432f15` | WORKER_CRASH | CAPABILITY_MISSING | 6 crashed runs, unknown provider, HTTP 429 |
| `t_ae83ea45` | — | — | SHA-256 fixture, DONE |

**Upstream Constants Used**:
- `VALID_STATUSES` (9): triage, todo, scheduled, ready, running, blocked, review, done, archived
- `VALID_BLOCK_KINDS` (4): dependency, needs_input, capability, transient
- `BLOCK_RECURRENCE_LIMIT = 2`
- `failure_limit = 2`
- Circuit breaker: consecutive_failures counter, reset on success

## Files Created in `kanban-inventory/`
```
contracts/kanban-contract.json          # Canonical contract
scripts/drift_detector.py               # Deterministic detector
state/contract_hash.txt                 # LAST_KNOWN_GOOD
state/runtime_snapshot_*.json           # Debug snapshots
state/drift_report_*.json               # 13 test reports
```

## Key Lessons (Embedded in deterministic-drift-detection skill)

1. **Dynamic discovery > hardcoded** — Probe ports, parse CLI, read upstream constants
2. **Four hash separation** — Schema, adapter, contract, runtime snapshot never conflated
3. **Evidence-based classification** — `show`/`runs`/`log` for proof, never title inference
4. **Upstream/owned separation** — Never touch upstream; single owned folder
5. **Six-class taxonomy** — NO_CHANGE, SAFE_ADAPTER_DRIFT, UPSTREAM_DRIFT, AMBIGUOUS_DRIFT, BROKEN_CONTRACT, BLOCKED
6. **Idempotent readonly default** — `sqlite3 mode=ro`, no writes without PERMITO PIVETE
7. **Circuit breaker respect** — failure_limit=2, BLOCK_RECURRENCE_LIMIT=2

## Next Gates (FASE 5+)
- FASE 5: Correção Estabilizadora (9 condições para autocorreção)
- FASE 6: Aprendizado Contínuo Controlado
- FASE 7: Kanban Autônomo (cartões materiais apenas)
- FASE 8: Testes completos (10 cenários)
- FASE 9: Prova de Autonomia (12 critérios)

## Methodology Extracted
Created class-level skill: `deterministic-drift-detection` with:
- `references/kanban-drift-case-study.md` — This log
- `references/drift-classification-rules.md` — 12 error classes with detection patterns
- `references/contract-template.json` — Reusable contract template
- `scripts/drift_detector_template.py` — Reusable detector skeleton
- `templates/canonical-contract.json` — Contract template with placeholders