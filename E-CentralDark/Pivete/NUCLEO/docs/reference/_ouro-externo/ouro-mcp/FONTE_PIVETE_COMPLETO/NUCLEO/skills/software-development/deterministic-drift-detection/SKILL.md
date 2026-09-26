---
name: deterministic-drift-detection
description: Detect drift via canonical contracts and six-class taxonomy.
trigger: Use when detecting drift in stateful systems requiring canonical contracts, dynamic discovery, evidence-based classification, and deterministic six-class taxonomy.
---
# Deterministic Drift Detection – Class-Level Methodology

## Purpose

Provide a reusable, deterministic framework for detecting drift between a **canonical contract** (source of truth) and **runtime reality** in any stateful system. Enforces: canonical contracts with separated hashes, dynamic discovery over hardcoded values, evidence-based classification, upstream/owned separation, six-class drift taxonomy, idempotent read-only default.

## When to Use

- Building a drift detector for Kanban, configuration, database schema, API contracts, or any versioned surface
- Need to prove system state matches a known-good baseline before autonomous operation
- Must distinguish between safe adapter changes vs. upstream breaking changes
- Require deterministic, reproducible classification with clear remediation paths

## Core Principles

### 1. Canonical Contract Structure

Every contract MUST separate four hash domains:

| Hash | Purpose | Stability |
|------|---------|-----------|
| `DATABASE_SCHEMA_HASH` | Schema-only (CREATE statements) | Changes only on migration |
| `ADAPTER_CODE_HASH` | Owned adapter/skill code | Changes on every skill edit |
| `CONTRACT_HASH` | Canonical expectations (commands, columns, statuses, transitions) | Changes only when contract updated |
| `RUNTIME_SNAPSHOT_HASH` | Captured runtime state (ephemeral, for debugging) | Changes every capture |

**Never** use raw live DB hash as contract — it conflates data with schema.

### 2. Dynamic Discovery Over Hardcoding

| Anti-pattern | Correct Pattern |
|--------------|-----------------|
| `KANBAN_URL = "http://localhost:8648/..."` | Probe ports at runtime, use first responding |
| `CLI_VERSION = "v0.20.0"` | `hermes --version` → parse first line only |
| `COLUMN_NAMES = [...]` | Read from upstream constants (`VALID_STATUSES`) |
| `BLOCK_KINDS = [...]` | Read from upstream `VALID_BLOCK_KINDS` |

### 3. Evidence-Based Classification

**Never** infer blockage class from card title alone.

**Always** classify from:
- `hermes kanban show <ID>` → diagnostics, events
- `hermes kanban runs <ID>` → outcomes, errors
- `hermes kanban log <ID>` → provider errors, stack traces

Example mapping from this session:

| Card | Primary Class | Secondary Class | Evidence |
|------|---------------|-----------------|----------|
| `t_6c3d5e16` | WORKER_CRASH | PROVIDER_RATE_LIMIT | 5 crashed runs (pid not alive) + HTTP 429 in logs |
| `t_35432f15` | WORKER_CRASH | CAPABILITY_MISSING | 6 crashed runs + "Unknown provider" + HTTP 429 |

### 4. Six-Class Drift Taxonomy

| Class | Meaning | Auto-Correct? | Upstream Write? |
|-------|---------|---------------|-----------------|
| `NO_CHANGE` | Runtime matches contract | N/A | No |
| `SAFE_ADAPTER_DRIFT` | Only owned adapter code changed | Yes (if tests pass) | No |
| `UPSTREAM_DRIFT` | Upstream changed (version, commands, board) | Adapt contract/selectors if deterministic | **Never** |
| `AMBIGUOUS_DRIFT` | Multiple simultaneous changes, cause unclear | **No** — human decision | **Never** |
| `BROKEN_CONTRACT` | Runtime violates contract (invalid status, etc.) | Restore owned LAST_KNOWN_GOOD | **Never** |
| `BLOCKED` | Unclassifiable condition | **No** | **Never** |

### 5. Pipeline: CAPTURE → NORMALIZE → COMPARE → CLASSIFY → DECIDE → REPORT

```python
# CAPTURE: Probe runtime (CLI, DB, HTTP, ports)
captured = capture_runtime()

# NORMALIZE: Sort lists, strip volatile fields
normalized = normalize(captured)

# COMPARE: Diff against canonical contract
differences = compare(normalized, contract)

# CLASSIFY: Map differences to one of six classes
classification = classify(differences)

# DECIDE: Determine actions + unknowns
actions, unknowns = decide(classification, differences)

# REPORT: Emit structured drift report
report = DriftReport(...)
```

### 6. Upstream/Owned Separation

| Layer | Ownership | Write Permission |
|-------|-----------|------------------|
| Upstream (Hermes install, vendor code) | Donors | **READ_ONLY** |
| Owned adapter (skill, selectors, rules, contracts) | Pivete/profile | Single writer |
| Canonical extension points (DB, CLI, skill system) | Shared | Via official API only |

**Rule:** All adaptations live in ONE folder owned by the operator. No parallel v1/v2/v3 structures.

### 7. Idempotent Read-Only Default

- Detector **never** writes to the observed system in default mode
- `sqlite3.connect(..., mode=ro)` for schema inspection only
- No `INSERT`/`UPDATE`/`DELETE`/`COMMIT` in detector code
- Write actions require explicit `PERMITO PIVETE` authorization

## Implementation Checklist (from this session)

- [x] Canonical contract JSON with all required fields
- [x] Four separated hashes (schema, adapter, contract, runtime)
- [x] Dynamic URL/port discovery
- [x] CLI version/command discovery via `--help`
- [x] Upstream constants import (VALID_STATUSES, VALID_BLOCK_KINDS)
- [x] Six-class classifier with decision logic
- [x] Drift detector script (pure Python, deterministic)
- [x] Tests: NO_CHANGE, SAFE_ADAPTER_DRIFT, UPSTREAM_DRIFT, BROKEN_CONTRACT, AMBIGUOUS_DRIFT, IDEMPOTENCE
- [x] Zero Kanban writes in readonly mode
- [x] Evidence-based card classification (logs + runs)
- [x] Contract hash persistence (LAST_KNOWN_GOOD)

## Common Pitfalls

1. **Hardcoding ports/URLs** — Always probe at runtime
2. **Using full `hermes --version` output** — Normalize to first line only
3. **Classifying from card title** — Use `show`/`runs`/`log` for evidence
4. **Conflating schema hash with data hash** — Schema only = CREATE statements
5. **Writing to upstream** — All adaptations in owned folder only
6. **Auto-correcting AMBIGUOUS_DRIFT** — Block and escalate to human
7. **Missing BLOCK_RECURRENCE_LIMIT handling** — Upstream has `BLOCK_RECURRENCE_LIMIT=2`, respect it
8. **Ignoring circuit breaker signals** — `failure_limit=2`, `consecutive_failures` counter

## References

- `references/kanban-drift-case-study.md` — Full implementation log from Hermes Kanban session
- `references/drift-classification-rules.md` — Detailed classification heuristics per error class
- `references/contract-template.json` — Minimal contract template for new surfaces
- `scripts/drift_detector_template.py` — Reusable detector skeleton
- `templates/canonical-contract.json` — Contract structure template

## Related Skills

- `meta-lupa` — Verification/validation technique (MetaLupa) that this methodology complements
- `hermes-pivete-local-ops` — Local Hermes operations context
- `organize-memory` — Memory management for drift history

## Version History

- 1.0.0 (2026-08-05): Initial methodology extracted from Hermes Kanban stabilizer mission (FASES 2-4)