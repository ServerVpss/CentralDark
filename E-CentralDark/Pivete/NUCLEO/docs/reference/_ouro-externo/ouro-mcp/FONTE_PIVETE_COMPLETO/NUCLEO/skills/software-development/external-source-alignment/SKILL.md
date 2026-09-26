---
name: external-source-alignment
description: Analyze external sources (OPUS prompts, platform specs, competitor docs, research papers) to extract reusable gold, classify by 5-class framework, compare against existing stack via 4-block methodology, and integrate only Class A principles without platform contamination.
version: 1.0.0
author: Hermes Pivete
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [external-analysis, gold-extraction, opus-alignment, meta-lupa, classification, integration]
    related_skills: [meta-lupa, hermes-casa-pivete, verification-before-completion, claude-design]
---

# External Source Alignment & Gold Extraction

Analyze external sources (OPUS system prompts, platform specs, competitor docs, research papers) to extract reusable principles, classify by 5-class framework, compare against existing stack via 4-block methodology, and integrate only Class A principles without platform contamination.

## When to Use

- Analyzing OPUS/Claude/Grok system prompts or platform specifications
- Evaluating competitor documentation for reusable patterns
- Assessing research papers for implementation gold
- Any external source claiming "best practices" that might contaminate stack

## 5-Class Classification Framework (Mandatory First Step)

Before promoting ANY content from external source, classify EVERY item:

| Class | Label | Criterion | Action |
|---|---|---|---|
| **A** | `PRINCÍPIO_REUTILIZÁVEL` | Durable method, platform-independent | Promote → extend canonical artifact |
| **B** | `EQUIVALENTE_JÁ_EXISTENTE` | Already exists in stack with identical function | Ignore (no duplication) |
| **C** | `LACUNA_REAL` | Missing or incomplete in stack, with direct evidence | Promote to backlog / close if critical |
| **D** | `EXCLUSIVO_DA_PLATAFORMA` | Tools, paths, APIs, products, policies, contracts specific to source platform | **REJECT** — never promote |
| **E** | `NÃO_VERIFICADO_OU_TEMPORAL` | Models, prices, launches, dates, products without current proof | **REJECT** — never promote |

**Golden Rule:** Never promote Class D or E. Every promotion must pass Gate Mapa Único.

## 4-Block Comparison Methodology

Compare external source vs internal stack across 4 standardized blocks:

| Block | Focus | Internal Reference |
|---|---|---|
| **1. Roteamento Tools** | Selection, verification, fallback, MCP, visual | `HERMES-CORE` / gateway / `validar-mapa.mjs` |
| **2. Memória Versionada** | Read-before-write, versioning, conflicts, merge, 3 temperatures | `motor/03-memoria/`, `AUTOLUPA`, ledger |
| **3. Correção Sem Culpa** | Accountability, self-respect, no infinite apology | `SOUL.md`, `NUCLEO-MORDOMO.md`, AutoLupa |
| **4. Decisão Visual** | Texto → tabela → fluxo → artefato, spec triggers | `PADRAO-CARD-HERMES.md`, `MANUAL.html`, `claude-design` |

### Output per Block

| Column | Content |
|---|---|
| Ouro (A) | Reusable principles to promote |
| Já Existe (B) | Already covered — ignore |
| Lacuna Real (C) | Missing with evidence → promote if critical |
| Rejeitado (D+E) | Platform-specific / temporal — block |

## Criticality Framework → Veredito

| Level | Criterion | Verdict |
|---|---|---|
| **Crítica** | Blocks safe execution / violates golden rule / exposes secret / creates drift | `CONDICIONAR` — close before merge |
| **Menor** | Improves UX/compliance/DX but doesn't block | `APROVAR` + backlog |
| **Backlog** | Nice-to-have / future / non-urgent | Document for future sprint |

**Rule:** Any critical gap → `CONDICIONAR`. Zero critical + only minor → `APROVAR` + backlog. Zero gaps → `APROVAR` clean.

## META LUPA Formal Execution Protocol

Every alignment mission runs full META LUPA:

```
BEGIN (usage_id, mission_id, source_sha256)
  ↓
Classify all items → 5 classes
  ↓
4-block comparison → gaps table
  ↓
Criticality assessment → CONDICIONAR/APROVAR
  ↓
AutoLupa (15 checks) → PONTO_FIXO_ATINGIDO
  ↓
FINAL (ledger append)
  ↓
verify-ledger (ORPHAN=0, BAD_HASH=0)
```

**Required ledger fields in FINAL:** mission_id, HEAD, mode, triggers, risk, error, root_cause, counter_evidence, test/regression, false_green, guardrail, rollback, improvements, residual_risk, files, evidence_hash, XP, level, tier, point_fixed, verdict.

## Anti-Contamination Gates (Mandatory)

1. **Class D/E Rejection** — Zero tolerance. Document rejection count in veredito.
2. **Gate Mapa Único** — Before any promotion: locate function, consumers, routes, equivalents, active legacy.
3. **No Parallel Structures** — Extend canonical artifact; never create v2/v3/parallel skill/doc/memory.
3. **PIVETE Visual Format** — All outputs in PADRAO-CARD-HERMES v1.2 format (arrows, tables, status badges).
4. **META LUPA Formal** — BEGIN/FINAL in ledger, verify-ledger clean (ORPHAN=0, BAD_HASH=0).

## OPUS-Specific Patterns (Learned 2026-07-27)

### Class A Gold from OPUS-5.md (19 items)
- Tool routing decision tree (Step 0-3)
- Versioned memory with if_version + auto-merge
- Correction without self-abasement
- Visual decision: text→table→flow→artifact (spec triggers)
- Privacy guardrails (omit protected/sensitive/identifiable)
- Memory application: relevance test, no meta-commentary
- Forbidden memory phrases ("I remember", "Based on my memories")
- Citation rules (paraphrase, 15-word max, 1 quote/source)
- Tool priority: internal > web_search > web_fetch
- Search scaling (1 / 3-8 / 8-20)
- Visualizer triggers (explicit + proactive + spec)
- Artifact criteria (>20 lines, standalone)
- File creation strategy (short=1 call, long=iterative+skills)
- Skill reading mandatory before file/code/bash
- MCP app suggestion (proactive, value prop, consent)
- Past chats: linguistic cues (possessives, definite articles, past-tense)
- Request evaluation checklist (visual? MCP? file? visualizer?)
- Browser storage ban in artifacts
- Package management (pip --break-system-packages)

### Class C Gaps Found (16 items)
Critical (3): Tool routing tree, versioned memory if_version, forbidden memory phrases
Minor (13): Citation format, tool priority hierarchy, visualizer modules, MCP suggestion protocol, past chats cues, request checklist, artifact thresholds, package management, copyright self-check, harmful content categories, image interleave, connector search, visualizer modules, loading messages, content safety, skill reading unconditional

### Classes D+E Rejected (76 items)
D: Memory API, MCP Apps, Computer Use, File handling, Artifacts, Anthropic API, Structured outputs, Web Search tool, PDF/base64, Conversation mgmt, Stateful apps, Error handling, Citations, Profile injection
E: Model strings, Mythos/Glasswing, Anthropic products, Knowledge cutoff, Copyright examples, Wellbeing, PII categories, Image blocked categories, MCP registry examples, suggest_connectors/research, end_conversation, API config

## Integration Points

| Stack Component | Integration |
|---|---|
| `meta-lupa` | Formal BEGIN/FINAL, AutoLupa, verify-ledger |
| `hermes-casa-pivete` | PIVETE visual format, SOUL alignment, golden rule |
| `verification-before-completion` | Evidence before assertion, verify-ledger |
| `claude-design` | Visual decision, spec triggers, artifact criteria |
| `hermes-agent` | Tool routing, skill reading, gate mapa único |

## Support Files

- `references/opus-5-classification.md` — Full 140-item classification (A=19, B=28, C=16, D=40, E=36)
- `references/4block-comparison.md` — 4-block gap table with criticality
- `templates/alignment-report.md` — Standard output template

## Pitfalls to Avoid

- ❌ Promoting Class D/E "because it looks smart"
- ❌ Skipping 5-class classification (lazy path to contamination)
- ❌ Creating parallel skill/doc/memory for gold that fits existing artifact
- ❌ Calling META LUPA "done" without verify-ledger (ORPHAN=0, BAD_HASH=0)
- ❌ Confusing Class B (exists) with Class A (gold) — B means STOP, don't promote
- ❌ Treating temporal info (model names, prices, dates) as durable gold
- ❌ Skipping verify-ledger after FINAL

## Quick Reference Card

```text
EXTERNAL SOURCE
      ↓
CLASSIFY 5 CLASSES (A/B/C/D/E)
      ↓
4-BLOCK COMPARE (Tools, Memory, Correction, Visual)
      ↓
GAP TABLE + CRITICALITY
      ↓
META LUPA FORMAL (BEGIN → analyze → AutoLupa → FINAL)
      ↓
verify-ledger (ORPHAN=0, BAD_HASH=0)
      ↓
VEREDICTO: CONDICIONAR | APROVAR | BLOQUEAR
      ↓
INTEGRATE CLASS A ONLY → EXTEND CANONICAL
```

---

**Author:** Hermes Pivete (profile pivete)
**Mission:** OPUS-5-MAE-ALIGNMENT-2026-07-27
**Ledger:** usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
**Veredito:** CONDICIONAR (3 critical gaps, 13 minor, 76 rejected)