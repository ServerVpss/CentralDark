# AGENTE - create-agent.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\tasks\create-agent.md
**SHA:** b7f872ff04b3668c
**Timestamp:** 2026-08-28T02:02:05.333470
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- generate_research_prompt:
- **Example Research Prompt:**
- research_prompt:
- 5. EXECUTE: Follow the workflow in the loaded task file EXACTLY

### Padroes
- > **Principio:** Um agente sem infraestrutura operacional e uma persona sem processo.

### Contratos
- run_quality_gate:

### Principios
- > **Principio:** Um agente sem infraestrutura operacional e uma persona sem processo.

### Gaps
- Missing: specific sales page structure, digital adaptation techniques.
- If a required file is missing:
- missing: 0.0 # File doesn't exist

### Ouro Bruto (primeiros 5000 chars)
```
# Task: Create Squad Agent

**Task ID:** create-agent
**Version:** 3.0
**Purpose:** Create a single domain-specific agent through research, elicitation, validation, and operational infrastructure
**Orchestrator:** @squad-architect
**DNA Specialist:** @oalanicolas
**Process Specialist:** @pedro-valerio
**Mode:** Research-first (never create without research)
**Quality Standard:** AIOS Level (300+ lines, voice_dna, output_examples, command_loader, task files)

**Specialists:**

- **@oalanicolas** → Invoke for DNA extraction (Voice DNA, Thinking DNA, source curation)
  - Use `*extract-dna {specialist}` for complete DNA Mental™ extraction
  - Use `*assess-sources` to classify sources as ouro vs bronze
  - Consult when agent voice feels generic or inauthentic

**Frameworks Used:**

- `data/tier-system-framework.md` → Agent tier classification (Phase 2)
- `data/quality-dimensions-framework.md` → Agent validation (Phase 4)
- `data/decision-heuristics-framework.md` → Quality gate logic (Phase 4)

---

## Step 0: IDS Registry Check (Advisory)

Before proceeding, check the Entity Registry for existing artifacts:

1. Extract intent keywords from user's request
2. Run `FrameworkGovernor.preCheck(intent, 'agent')`
3. If REUSE match found (>=90% relevance):
   - Display match and ask user: "Existing agent found. REUSE instead of creating new?"
4. If ADAPT match found (60-89%):
   - Display adaptation candidate: "Similar agent exists. ADAPT instead of creating new?"
5. If CREATE (no match or user chooses):
   - Log decision with justification and proceed to Step 1
6. If IDS unavailable (timeout/error): Warn and proceed normally

**NOTE:** This step is advisory and does NOT block creation. User always has final decision.

---

## Overview

This task creates a single high-quality agent based on researched methodologies from an elite mind. The key insight: **agents created without research are weak and generic**.

**v3.0 Changes:**

- NEW: Phase 5 — Operational Infrastructure (command_loader, tasks, templates, checklists)
- NEW: Phase 6 — Operational Validation (SC_AGT_004, maturity scoring)
- NEW: Maturity levels (Nivel 1/2/3) with scoring formula
- NEW: @pedro-valerio as Process Specialist reference
- Agents must now ship with operational files, not just persona
- Reference: `aprendizado/32-ANATOMIA-AGENTE-100-PORCENTO-REPLICAVEL.md`

**v2.0 Changes:**

- Mandatory research check before creation
- PHASE-based structure with checkpoints
- Quality gate SC_AGT_001 must pass
- All agents must have voice_dna, output_examples, objection_algorithms

```text
INPUT (agent_purpose + domain + [specialist])
    ↓
[PHASE 0: CONTEXT]
    → Identify target pack
    → Check if specialist-based or generic
    ↓
[PHASE 1: RESEARCH]
    → Check local knowledge (if specialist)
    → Generate research prompt
    → Execute deep research
    ↓
[PHASE 2: EXTRACTION]
    → Extract framework from research
    → Classify tier
    → Define persona
    ↓
[PHASE 3: CREATION]
    → Generate agent using template
    → Include all 6 levels
    → Apply voice_dna
    ↓
[PHASE 4: VALIDATION]
    → Run SC_AGT_001 quality gate
    → Fix blocking issues
    → Save agent file
    ↓
[PHASE 5: OPERATIONAL INFRASTRUCTURE]  ← NEW
    → Generate command_loader
    → Create task stubs per command
    → Create template stubs per output type
    → Create checklist with veto conditions
    → Update agent with Level 0 infrastructure
    ↓
[PHASE 6: OPERATIONAL VALIDATION]  ← NEW
    → Validate all files exist
    → Validate task quality (steps + veto)
    → Calculate maturity score (target >= 7.0)
    ↓
[PHASE 7: HANDOFF]
    → Present summary with operational status
    → Document next steps
    ↓
OUTPUT: Agent file + Operational files + Quality Gate PASS + Maturity Score
```

---

## Inputs

| Parameter         | Type   | Required | Description                           | Example                |
| ----------------- | ------ | -------- | ------------------------------------- | ---------------------- |
| `agent_purpose`   | string | Yes      | What the agent should do              | `"Create sales pages"` |
| `domain`          | string | Yes      | Domain/area of expertise              | `"copywriting"`        |
| `specialist_slug` | string | No       | If based on human expert (snake_case) | `"gary_halbert"`       |
| `specialist_name` | string | No       | Human-readable name                   | `"Gary Halbert"`       |
| `pack_name`       | string | Yes      | Target squad                          | `"copy"`               |

---

## Preconditions

- [ ] Target pack exists at `squads/{pack_name}/`
- [ ] squad-architect agent is active
- [ ] WebSearch tool available (for research)
- [ ] Write permissions for `squads/{pack_name}/agents/`

---

## PHASE 0: CONTEXT

**Duration:** < 1 minute
**Checkpoint:** None (fast validation)
**Mode:** Automatic

### Step 0.1: Identify Target Pack

**Actions:**

```yaml
identify_pack:
  validation:
    - check_path: 'squads/{pack_name}/
```