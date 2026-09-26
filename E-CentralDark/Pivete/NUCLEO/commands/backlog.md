# COMANDO - backlog.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\stories\backlog.md
**SHA:** 0a492e2ba8365b1e
**Timestamp:** 2026-08-28T02:02:40.383827
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- - [x] Decisão: Synkra como nome do projeto

### Contratos
- **Key Questions to Investigate:**
- - ~~**SQS-5:** SquadSyncService (10-12h)~~ ✅ **DONE** (QA Gate: PASS 96/100)

### Riscos
- **BLOCKER:** Requer validação do @architect (Aria) para questões arquiteturais (Q1-Q4 no Epic).

### Ouro Bruto (primeiros 5000 chars)
```
# Backlog

**Generated:** 2025-12-05T18:00:00.000Z
**Updated:** 2026-02-06T12:00:00.000Z
**Total Items:** 17 (active)
**Current Sprint:** 19 (CI Optimization & Cost Reduction) 🚀 IN PROGRESS
**Stories Completed:** 49 (Story 3.11c, Story 5.10, Story OSR-2, Story OSR-3, Story OSR-6, Story OSR-7, Story OSR-8, Story OSR-9, **Story OSR-10**, Story 6.9, Story 6.10, Story 6.11, Story 6.12, Story 6.13, **Story 6.16**, **Story 6.18**, **Story 6.19**, Story SQS-0, Story SQS-1, Story SQS-2, Story SQS-3, Story SQS-4, **Story SQS-5**, **Story SQS-6**, **Story SQS-7**, **Story SQS-8**, Story SQS-9, **Story SQS-10**, **Story WIS-2**, **Story WIS-3**, **Story WIS-4**, **Story WIS-5**, **Story WIS-9**, **Story WIS-10**, **Story WIS-11**, **Story WIS-15**, **Story TD-1**, **Story TD-2**, **Story TD-3**, **Story TD-4**, **Story TD-5**, TD-6/YAML via TD-2, **Story HCS-1**, **Story HCS-2**, Story 3.0, Story 4.1, **Story TD-6**, **Story PRO-1**, **Story PRO-5**, **Story PRO-6**)
**Latest Release:** [v3.10.0](https://github.com/SynkraAI/aios-core/releases/tag/v3.10.0) (2025-12-30)

> **Roadmap Sync Reminder:** When completing sprints, update the [AIOS Public Roadmap](https://github.com/orgs/SynkraAI/projects/1) and [ROADMAP.md](../../ROADMAP.md). See sync checklist in ROADMAP.md.

---

## 📊 Summary by Type

- 📌 **Follow-up**: 0
- 🔧 **Technical Debt**: 16 (3 existing + 11 from XREF analysis + 2 from QA INS-3.1)
- ✨ **Enhancement**: 6 (2 existing + 2 from XREF analysis + 1 PO task + 1 handoff investigation)
- 🔴 **Critical**: 1 (@qa broken task references)
- ✅ **Resolved**: 53 (includes 4 archived Sprint 4 items: 1732891500001, 1732891500002, 1732891500003, 1732978800001)
- ❌ **Obsolete**: 1 (removed from active backlog)
- 📁 **Archived**: 4 items moved to `backlog/archive/` on 2026-01-04

---

## 🔴 Critical (1 item)

### Fix @qa Agent 9 Broken Task References (ID: 1738700000001) - 📍 BACKLOG

> **Source:** [AIOS-XREF-001](active/AIOS-XREF-001.story.md) Cross-Reference Analysis
> **Created:** 2026-02-05 | **Priority:** 🔴 Critical | **Sprint:** TBD

**Problem:** The `@qa` agent definition (`agents/qa.md`) references 9 task files using non-prefixed names that do NOT match actual filenames on disk.

| Agent Reference | Actual File on Disk | Status |
|----------------|---------------------|--------|
| `generate-tests.md` | `qa-generate-tests.md` | BROKEN |
| `manage-story-backlog.md` | `qa-backlog-add-followup.md` | BROKEN |
| `nfr-assess.md` | `qa-nfr-assess.md` | BROKEN |
| `review-proposal.md` | `qa-review-proposal.md` | BROKEN |
| `review-story.md` | `qa-review-story.md` | BROKEN |
| `risk-profile.md` | `qa-risk-profile.md` | BROKEN |
| `run-tests.md` | `qa-run-tests.md` | BROKEN |
| `test-design.md` | `qa-test-design.md` | BROKEN |
| `trace-requirements.md` | `qa-trace-requirements.md` | BROKEN |

**Impact:** If dependency resolution does NOT apply automatic prefix fallback, @qa commands fail to find task files.

**Fix:** Update `agents/qa.md` to use the full prefixed names matching actual files.

**Effort:** 1 hour | **Tags:** `xref-analysis`, `broken-reference`, `qa-agent`

---

### ~~OSR-10: Release Checklist Final~~ - ✅ COMPLETE

**Status:** ✅ Released as v2.2.3 (2025-12-22)
**Release:** [v2.2.3](https://github.com/SynkraAI/aios-core/releases/tag/v2.2.3)

**Completed Tasks:**
1. [x] **@devops:** Execute GitHub manual config (5 items) ✅
2. [x] **@dev:** Run smoke test on clean clone ✅
3. [x] **@po:** Create release notes ✅
4. [x] **Stakeholder:** Final GO approval ✅
5. [x] **@devops:** Execute release (tag, publish) ✅

**Result:** 🎉 Epic OSR Complete - AIOS is Open-Source Ready!

---

## ✨ Enhancement (4 items)

| ID | Type | Title | Priority | Related Story | Effort | Tags | Created By | Sprint |
|----|------|-------|----------|---------------|--------|------|------------|--------|
| 1733400000001 | ✨ Enhancement | Investigation: Squads System Enhancement | 🟡 Medium | **[Epic SQS](../epics/current/epic-sqs-squad-system.md)** | 56-72 hours | `epic`, `squads`, `architecture`, `cli`, `loader`, `synkra` | @po | Sprint 7 |
| 1733400000002 | ✨ Enhancement | Investigation: Refatorar hybrid-ops Squad com Process Mapping Framework | 🟡 Medium | - | 4-8 hours | `investigation`, `squad`, `hybrid-ops`, `process-mapping`, `pedro-valerio` | @po | TBD |
| 1738600000057 | ✨ Enhancement | Investigation: Separate Core, Configuration, and User Extensions | 🟡 Medium | [Issue #57](https://github.com/SynkraAI/aios-core/issues/57) | 8-16 hours | `investigation`, `architecture`, `config`, `extensions`, `immutability` | @architect | TBD |
| 1738700000099 | ✨ Enhancement | PO Task: Story Lifecycle Closure (*close-story) | 🟢 Low | Story PRO-5 retrospective | 2-4 hours | `po-agent`, `story-lifecycle`, `backlog-management`, `automation` | @po | ✅ Done |
| 1738700000014 | ✨ Enhancement | Investigation: Universal Handoff System (`/handoff @agent`) | 🟡 Medium | AIOS-TRACE-001 | 8-16 hours | `investigation`, `handoff`, `cross-agent`, `context-transfer`, `claude-co
```