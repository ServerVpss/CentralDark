# COMANDO - optimization-report-template.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\nvidia\skills\omniverse-usd-performance-tuning\references\optimization-report\references\optimization-report-template.md
**SHA:** 0f6f29bc44fc5a95
**Timestamp:** 2026-08-26T18:40:06.036188
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- - [ ] If user takes the "exit" branch at Phase 2e gate: skip to Phase 6e and write a structural-only report.

### Ouro Bruto (primeiros 5000 chars)
```
<!-- SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved. -->
<!-- SPDX-License-Identifier: Apache-2.0 -->

# Optimization Report Template - Per-Phase Data Collection Checklist

> **Source:** Derived from `../scripts/optimization-report.schema.json` (canonical contract). This reference is the agent's "first read" - it tells you which fields you must populate by end-of-flow so each phase can collect against the final data contract.

---

## Why this exists

The `optimization-report` skill is the final-step producer that emits a JSON document conforming to `../scripts/optimization-report.schema.json` plus Markdown and static HTML summaries. To avoid the failure pattern "we got to the end and realized we never collected X", the agent should read this template **at the START of the flow** so every phase knows which baseline + after fields it owes the report.

This is a navigation aid, not a replacement for the `optimization-report` skill body or the schema itself.

## The contract (lifted from `../scripts/optimization-report.schema.json`)

Required top-level fields:

| Field | Type | Source phase | Notes |
|---|---|---|---|
| `asset_name` | string | Phase 0 | Set early; the basename of the input asset usually suffices. |
| `input_path` | string | Phase 0 | Optional in schema, but capture it for traceability. |
| `output_path` | string | Phase 5 | Path to the optimized stage root from Phase 5d (or `null` for diagnosis-only / structural-only path). |
| `timestamp` | string (ISO 8601) | Phase 6e | Set when the report writes. |
| `verdict` | enum: `improved \| neutral \| regressed \| mixed` | Phase 6c | From `compare-profiles`. Use `structural-only` semantically when SO was unavailable (degraded path) and document it in `notes`. |
| `optimization_score` | number 0-10 | Phase 6e | Stage Optimization Score. Compute deterministically as `round(sum(group.score * group.weight) / sum(group.weight), 1)` across scored stage/composition groups only. Exclude `score=null` and `weight=0` groups. Runtime metrics are not score inputs. |
| `score_scope` | enum: `stage_optimization` | Phase 6e | Makes the score scope explicit so readers do not confuse it with full runtime performance. |
| `score_label` | enum | Phase 6e | Human score band from `optimization_score`: `excellent >= 9.0`, `strong >= 7.5`, `moderate >= 5.5`, `neutral >= 4.5`, `mixed >= 2.5`, `regressed < 2.5`. |
| `reasoning` | string | Phase 6e | One to two paragraphs explaining why the agent chose this optimization approach for the asset, based on evidence and tradeoffs. |
| `measurement_context` | object | Phases 0, 1a, 6a | Context for stage/composition measurements: runtime, cache policy, sample count, stage-open method. |
| `runtime_profiling` | object | Phase 6e | Optional Omniperf/runtime-profiler handoff for RAM, VRAM, FPS, frame time, shader, renderer, and GPU metrics. |
| `metric_groups[]` | array | Phase 6e | Stage headline areas such as composition load, structure, instancing, storage footprint, and validation. |
| `artifacts` | object | Phase 6e | Paths to generated JSON, Markdown, and static HTML reports. |
| `metrics[]` | array | Phases 1a + 6a | Each metric: `name`, `before`, `after`, `change_pct`, `verdict`. |
| `operations[]` | array | Phases 4 + 5 | Each op: `order`, `name`, `method`, `result`. |
| `validators[]` | array | Phases 2c + 6b | Each validator entry: `name`, `issues`, `notes`; `issues` is the count of reported findings for that row. |

## Per-phase collection checklist

The agent should populate against this checklist as it moves through the flow.

### Phase 0 - Bring-up

Populate immediately after the runtime is chosen:

- [ ] `asset_name` (basename of input)
- [ ] `input_path`
- [ ] Record runtime choice (Kit or standalone) and install path in `notes` for traceability (not a schema field).
- [ ] Start `measurement_context` with runtime choice, cache state, sample count, stage-open method, and warmup policy when known.

### Phase 1 - Open and characterize

- [ ] `metrics[]` - **baseline** entries with `before` populated, `after` left null until Phase 6.
  - Suggested baseline metrics:
    - `stage_open_seconds` (Phase 1a profile)
    - `prim_count`, `mesh_count`, `material_count` (from SA Phase 1.1-1.4 - 1b)
    - `layer_count`, `total_size_bytes` (SA Phase 1.3 - 1b)
    - `instance_count`, `instance_ratio` (SA Phase 1.4 - 1b)
    - `reference_count`, `payload_count`, `time_sample_count`, `extent_coverage`, `instanceable_reference_count`, `prototype_count` when available.

Do not treat RAM, VRAM, FPS, or frame time as stage-score inputs. Those belong
in `runtime_profiling`, ideally via Omniperf dashboard/artifacts.

### Phase 2 - Composition / discovery / restructure decision

- [ ] `validators[]` - first entries (validator name + issue count from Phase 2c sweep). One row per validator that ran.
- [ ] If user takes the "exit" branch at Phase 2e gate: skip to Phase 6e and write a structural-only
```