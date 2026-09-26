# COMANDO - squad-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\squad-checklist.md
**SHA:** 88987bdd450a3f09
**Timestamp:** 2026-08-28T13:25:22.517679
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: "(api[_-]?key|apikey)\\s*[:=]\\s*['\"][^'\"]{20,}"
- pattern: "(secret|password|passwd|pwd)\\s*[:=]\\s*['\"][^'\"]{8,}"
- pattern: "(bearer|authorization|auth_token)\\s*[:=]\\s*['\"][^'\"]{20,}"
- pattern: "(jwt[_-]?secret|signing[_-]?key)\\s*[:=]\\s*['\"][^'\"]{16,}"
- pattern: "(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}"
- pattern: "aws[_-]?secret[_-]?access[_-]?key\\s*[:=]\\s*['\"][^'\"]{40}"
- pattern: "\"type\":\\s*\"service_account\""
- pattern: "DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[^;]+"
- pattern: "\\b(eval|exec)\\s*\\("
- pattern: "subprocess\\.(call|run|Popen).*shell\\s*=\\s*True"

### Ouro Bruto (primeiros 5000 chars)
```
# Squad Validation Checklist v3.1

This checklist validates AIOS squads using a **tiered, context-aware approach** based on analysis of well-structured squads.

> **Nota:** Exemplos neste documento são ilustrativos. Substitua pelo seu contexto.

---

## QUICK REFERENCE

```yaml
validation_tiers:
  tier_1_structure: "Pass/Fail gates - BLOCKING"
  tier_2_coverage: "Ratio requirements - BLOCKING"
  tier_3_quality: "Weighted scoring - THRESHOLD 7.0"
  tier_4_contextual: "Squad-type specific - CONDITIONAL"

squad_types:
  expert: "Mind clones with distinct personalities (Copy, Storytelling)"
  pipeline: "Sequential phase orchestration (Books, MMOS)"
  hybrid: "Process automation with heuristics (HybridOps)"

final_score: "(Tier 3 × 0.8) + (Tier 4 × 0.2)"
pass_threshold: 7.0
excellence_threshold: 9.0
```

---

## STEP 0: SQUAD TYPE DETECTION

Before validating, determine the squad type:

### Detection Criteria

| Signal | Expert | Pipeline | Hybrid |
|--------|--------|----------|--------|
| Multiple agents with distinct personas | ✅ | ❌ | ⚠️ |
| Single orchestrator + many tasks | ❌ | ✅ | ❌ |
| Sequential phase execution | ⚠️ | ✅ | ✅ |
| Mind clones (real people) | ✅ | ❌ | ❌ |
| Heuristic-based validation | ❌ | ⚠️ | ✅ |
| Process automation focus | ❌ | ❌ | ✅ |

### Auto-Detection Rules

```yaml
detect_expert_squad:
  conditions:
    - agents_count >= 5
    - agents_based_on_real_people: true
    - voice_dna_present_in_agents: "> 50%"
  examples: ["copy", "storytelling", "legal"]

detect_pipeline_squad:
  conditions:
    - has_orchestrator_agent: true
    - has_sequential_phases: true
    - tasks_count > agents_count * 3
  examples: ["pipeline-type squads"]

detect_hybrid_squad:
  conditions:
    - has_process_focus: true
    - has_heuristic_validation: true
    - agents_per_phase: "~1"
  examples: ["hybrid-ops", "etl"]
```

**Detected Type:** [ ] Expert | [ ] Pipeline | [ ] Hybrid

---

## TIER 1: STRUCTURE (Pass/Fail - BLOCKING)

These are hard requirements. ANY failure = squad rejected.

### 1.1 Configuration

- [ ] `config.yaml` exists in squad root
- [ ] `config.yaml` is valid YAML (no parse errors)
- [ ] Required fields present: `name`, `version`, `description`, `entry_agent`
- [ ] `name` uses kebab-case
- [ ] `version` follows semver (X.Y.Z)

### 1.2 Entry Point

- [ ] `entry_agent` references existing file in `agents/`
- [ ] Entry agent can be activated without errors
- [ ] Entry agent has `commands` section with at least `*help`

### 1.3 File References

- [ ] All files referenced in `config.yaml` dependencies exist
- [ ] All files referenced in agent `dependencies` sections exist
- [ ] No broken symlinks or missing imports

### 1.4 Directory Structure

- [ ] `agents/` directory exists (minimum 1 agent)
- [ ] `tasks/` directory exists if referenced
- [ ] `checklists/` directory exists if tasks are complex
- [ ] `data/` directory exists if referenced

### 1.5 Cross-Reference Validation (BLOCKING)

**Check that internal references are valid:**

```yaml
cross_reference_checks:
  - id: "XREF-001"
    name: "Handoff targets exist"
    check: "All handoff_to references point to existing agents"
    severity: BLOCKING

  - id: "XREF-002"
    name: "Task references valid"
    check: "All tasks referenced in agents/workflows exist in tasks/"
    severity: BLOCKING

  - id: "XREF-003"
    name: "Template references valid"
    check: "All templates referenced in tasks exist in templates/"
    severity: WARNING

  - id: "XREF-004"
    name: "Checklist references valid"
    check: "All checklists referenced in tasks exist in checklists/"
    severity: WARNING

  - id: "XREF-005"
    name: "Data file references valid"
    check: "All data files referenced in agents/tasks exist in data/"
    severity: WARNING
```

| Check | Status | Missing References |
|-------|--------|-------------------|
| Handoff targets | [ ] PASS [ ] FAIL | ___ |
| Task references | [ ] PASS [ ] FAIL | ___ |
| Template references | [ ] PASS [ ] WARN | ___ |
| Checklist references | [ ] PASS [ ] WARN | ___ |
| Data file references | [ ] PASS [ ] WARN | ___ |

### 1.6 Security Scan (BLOCKING)

**Check for accidentally exposed secrets and sensitive data.**

**Reference:** OWASP Secrets Management Cheat Sheet

#### Category 1: API Keys & Tokens (HIGH)

```yaml
api_key_checks:
  - id: "SEC-001"
    name: "No hardcoded API keys"
    pattern: "(api[_-]?key|apikey)\\s*[:=]\\s*['\"][^'\"]{20,}"
    examples:
      - "api_key: '[REDIGIDO-PRESERVACAO]'"
      - "apiKey = \"AIzaSyD-1234567890abcdef\""
    severity: BLOCKING

  - id: "SEC-002"
    name: "No hardcoded secrets/passwords"
    pattern: "(secret|password|passwd|pwd)\\s*[:=]\\s*['\"][^'\"]{8,}"
    examples:
      - "secret: 'mySecretPassword123'"
      - "password = \"admin123456\""
    severity: BLOCKING

  - id: "SEC-003"
    name: "No bearer/auth tokens"
    pattern: "(bearer|authorization|auth_token)\\s*[:=]\\s*['\"][^'\"]{20,}"
    examples:
      - "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6
```