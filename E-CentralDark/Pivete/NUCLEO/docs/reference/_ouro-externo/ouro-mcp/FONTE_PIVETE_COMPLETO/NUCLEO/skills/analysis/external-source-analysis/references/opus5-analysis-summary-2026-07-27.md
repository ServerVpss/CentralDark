# OPUS-5.md Analysis Summary — 27/07/2026

## Source File Metadata
- **File**: `OPUS-5.md` (attached in session)
- **Size**: 202,762 bytes / 2,049 lines
- **SHA256**: `f8bc6dee5b23b926d3cb87a5b2dfc197feea6bfd82119f4a796b767a8da2ec41`
- **Classification**: External source (Anthropic Claude Opus 5 system prompt)

## Classification Summary (140 items, 5 classes)

| Class | Label | Count | Action |
|-------|-------|-------|--------|
| A | Princípio Reutilizável | 19 | Extract & implement |
| B | Equivalente Já Existe | 28 | Confirm, don't duplicate |
| C | Lacuna Real | 16 | Close in existing stack |
| D | Exclusivo Plataforma | 40 | Reject (won't run in our runtime) |
| E | Não Verificado / Temporal | 36 | Reject (temporal/platform-specific) |
| **Total** | | **140** | **76 rejected, 19 extractable, 16 gaps** |

---

## 10 Extracted Formulas (76 D/E items → 10 formulas)

| Formula | Origin Items (D/E) | Mechanism | Target Stack Location |
|---------|-------------------|-----------|----------------------|
| F1: Versioned Memory | Memory API, Conversation mgmt, Stateful apps (D) | Append-only ledger + if_version + conflicts + auto-merge on staleness | 3 temps + ledger META LUPA |
| F2: Dynamic Discovery + Opt-in | MCP Apps, suggest_connectors, MCP registry (D/E) | Registry → keyword search → suggest → user chooses → connect | Gateway/router + skills discovery |
| F3: Sandbox + Artifacts | Computer Use, Artifacts (D) | Isolated exec (bash_tool) + inline render (SVG/HTML/React) + CSS vars | claude-design + bash_tool + visualize:show_widget |
| F4: External Search + Citations | Web Search, antml:cite (D) | web_search → web_fetch → original sources → cite antml:cite (doc-sent) → 1 quote/source, ≤15 words | web_search/web_fetch skills + citation rules |
| F5: Binary Ingestion + Extraction | PDF/base64 upload, File handling (D) | Upload → detect type → extractor (pdf-reading, file-reading, vision) → structured text | file-reading/pdf-reading/vision_analyze |
| F6: History + Summary + Recovery | Conversation mgmt, History, Summary (D/E) | 3 temps (HOJE/SEMANA/REGRAS) + SESSION.md + ledger append-only + recovery: read plan → today → week → logs → real state → reconstruct | 3 temps + SESSION.md + ledger META LUPA |
| F7: Persistent State Between Turns | Stateful apps, Game state (D) | Serialized state (JSON) + append-only persistence + versioning + fixed-point recovery | MEMORY.md + ledger META LUPA + AUTOLUPA |
| F8: Typed Validated Output | Structured outputs XML/JSON, Citation format (D/E) | Schema (JSON Schema/design-md) → validation → typed output → safe parsing → error = retry with schema | design-md skill + validation schemas + meta_lupa.py contracts |
| F9: Graceful Shutdown | end_conversation flow, warning flow, confirmation (E) | Warning → redirect attempts → explicit warning → confirmation → clean shutdown | BOOT protocol / FIO_DA_MISSAO / handoff protocol |
| F10: Async Investigation | suggest_research, background investigation (E) | "Start research" button → 5-10 min autonomous workflow → multi-source search → cross-reference → sourced report → user decides | background-output-log skill + delegate_task |

---

## 4-Block Comparison Results

| Block | Gold (A) | Exists (B) | Gap (C) | Rejected (D+E) | Verdict |
|-------|----------|------------|---------|----------------|---------|
| 1. Tool Routing | 5 | 3 | **3 (CRITICAL)** | 21 | 🟡 CONDICIONAR |
| 2. Versioned Memory | 6 | 11 | **2** | 6 | 🟡 CONDICIONAR |
| 3. Blameless Correction | 6 | 4 | **1** | 3 | 🟢 APROVAR |
| 4. Visual Decision | 8 | 7 | **2** | 11 | 🟢 APROVAR |

---

## 3 Critical Gaps (Immediate Action)

| # | Gap | Target Location | OPUS Evidence |
|---|-----|-----------------|---------------|
| 1 | Explicit tool decision tree (Step 0-3) | `HERMES-CORE` / gateway | Step 0: visual? → Step 1: MCP fit? → Step 2: file? → Step 3: Visualizer |
| 2 | Explicit versioning (`if_version` + auto-merge) | 3 Temperatures (`motor/03-memoria/`) | `memory_read` → `if_version` mandatory, auto-merge on staleness |
| 3 | Explicit forbidden memory phrases | `SOUL.md` / `04-COMUNICACAO.md` | "I remember", "Based on my memories", "From memory", "In my memory", "According to my knowledge" |

---

## Rejected Content Summary (Classes D+E = 76 items)

### Class D — Platform Exclusive (40 items)
Memory API, MCP Apps, Computer Use, File handling, Artifacts, Anthropic API in artifacts, Structured outputs, Web Search tool, PDF/base64 upload, Conversation management, Stateful apps, Error handling, Citation format, Profile injection

### Class E — Temporal/Platform-Specific (36 items)
Model strings (Opus 5, Fable 5, Mythos 5, Haiku 4.5), Mythos tier/Glasswing, Anthropic products (Code, Cowork, Chrome, Excel, PPT, Design, Tag), Knowledge cutoff May 2026, Copyright examples (WaPost, Let It Go, Addison Rae), User wellbeing (crisis, self-harm, eating disorders), PII categories, Image search blocked categories, MCP registry examples, suggest_connectors/research, end_conversation flow, Anthropic API config

---

## Integration Map (Formulas → CentralDark Stack)

```
CentralDark Stack
├── gateway/router          → F2 (discovery) + F4 (search+citations)
├── HERMES-CORE             → F1 (memory via ledger) + F9 (BOOT protocol)
├── motor/03-memoria/       → F1 (if_version) + F6 (3 temps) + F7 (ledger)
├── motor/06-ferramentas/   → F3 (bash_tool+claude-design) + F4 (web_search) + F5 (file/pdf/vision) + F10 (background-output-log)
├── skills/                 → F3 (claude-design) + F8 (design-md) + F10 (background-output-log)
├── SOUL.md / 04-COMUNICACAO.md → F9 (BOOT/FIO_DA_MISSAO)
└── META LUPA (ledger)      → F1 (append-only) + F7 (fixed point)
```

---

## META LUPA Formal Record

```
usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d
BEGIN=2026-07-27T03:07:40Z
FINAL=2026-07-27T03:13:28Z
LEDGER=uso-ledger.jsonl (52 events, 0 orphans, 0 bad_hash)
AUTOLUPA=PONTO_FIXO_ATINGIDO=sim
VERDICT=CONDICIONAR
```

---

## Key Decision

**CONDICIONAR** — The OPUS-5.md contains 4 reusable principles already 80-95% covered in our stack. 16 gaps identified (3 critical). 76 items from Classes D/E rejected entirely.

**Decision**: Close 3 critical gaps in existing artifacts; document 13 minor gaps for backlog; reject 100% of Classes D/E.

---

*Generated: 2026-07-27 via META LUPA formal (usage_id=c7ed6a32db5eb816fe63123eecf4bf8f0aef3d1f67630aee99be6a108944605d)*
*Full comparison: `references/opus5-vs-centraldark-comparison-2026-07-27.md`*
*Classification script: `classify_opus.py`*
*Comparison script: `compare_4blocks.py`*