# COMANDO - personalized-checklist-template.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\personalized-checklist-template.md
**SHA:** de6c7f9713448a7e
**Timestamp:** 2026-08-28T02:02:20.838077
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: |
- run: |

### Ouro Bruto (primeiros 5000 chars)
```
# {Agent ID} - {Checklist Title}

**Agent:** {AgentName} ({Archetype})
**Purpose:** {Brief description of what this checklist validates}
**When to Use:** {When this checklist should be executed}

---

## Overview

{1-2 sentence explanation of checklist purpose and scope}

**Completion Criteria:** All checkboxes marked with [x] before proceeding.

---

## Pre-Execution Checks

**Purpose:** Validate prerequisites before starting main workflow

- [ ] {Standard prerequisite check 1 - same across all agents}
- [ ] {Standard prerequisite check 2 - same across all agents}
- [ ] {Standard prerequisite check 3 - same across all agents}
- [ ] {Agent-specific prerequisite if needed}

---

## Execution Validation

**Purpose:** Verify correct execution during workflow

### Phase 1: {Phase Name}

- [ ] {Validation item 1}
- [ ] {Validation item 2}
- [ ] {Validation item 3}

### Phase 2: {Phase Name}

- [ ] {Validation item 4}
- [ ] {Validation item 5}
- [ ] {Validation item 6}

---

## Quality Checks

**Purpose:** Ensure output meets quality standards

### Code Quality (if applicable)

- [ ] All tests passing ({tests.total} tests)
- [ ] Code coverage ≥ {threshold}% (current: {coverage}%)
- [ ] Linting clean (0 errors, 0 warnings)
- [ ] No console.log or debug statements
- [ ] No commented-out code blocks

### Documentation Quality

- [ ] All public functions documented
- [ ] README updated if needed
- [ ] Inline comments for complex logic
- [ ] Change log entry added

### Security & Performance

- [ ] No secrets in code
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Performance benchmarks met
- [ ] Memory leaks checked

---

## Post-Execution Review

**Purpose:** Final validation before completion

- [ ] {Standard review item 1}
- [ ] {Standard review item 2}
- [ ] {Standard review item 3}
- [ ] Output follows standardized template
- [ ] Duration and token metrics recorded
- [ ] All dependencies satisfied

---

## Metrics Validation

**Required metrics tracked:**

- [ ] **Duration:** {duration} recorded
- [ ] **Tokens Used:** {tokens.total} recorded
- [ ] **Tests:** {tests.passed}/{tests.total} ratio calculated
- [ ] **Coverage:** {coverage}% measured
- [ ] **Linting:** Status recorded

**Task-specific metrics (if applicable):**

- [ ] {Metric 1}: {value} recorded
- [ ] {Metric 2}: {value} recorded

---

## Agent-Specific Guidance

**{AgentName} ({Archetype}) Note:**

{PERSONALITY_SLOT: Personalized guidance based on archetype}

**Examples by archetype:**

### Builder (Dex)
> "Se algum teste falhou, refatore até passar. Não entregue código quebrado. Construa com qualidade desde o início."

### Guardian (Quinn)
> "Valide edge cases extras além dos listados. Proteção nunca é demais. Cada checklist é uma linha de defesa."

### Balancer (Pax)
> "Equilibre velocidade com qualidade. Se precisar escolher, priorize o que agrega mais valor ao usuário final."

### Visionary (Morgan)
> "Pense 3 sprints à frente. Cada decisão agora impacta a arquitetura futura. Planeje pensando em escala."

### Flow Master (River)
> "Adapte a checklist ao contexto. Se algo não faz sentido neste caso específico, documente e ajuste o processo."

---

## Failure Protocols

### If Pre-Execution Checks Fail

**Action:** HALT workflow immediately

**Steps:**
1. Document which check failed
2. Notify user with {PERSONALITY_SLOT: personalized error message}
3. Wait for resolution before proceeding

**Personalized error messages:**
- **Builder:** "⚠️ Pré-requisitos faltando. Não posso construir sem fundação sólida."
- **Guardian:** "⚠️ Pré-condições não satisfeitas. Bloqueando execução por segurança."
- **Balancer:** "⚠️ Falta consenso nos pré-requisitos. Vamos alinhar antes de prosseguir."

### If Execution Validation Fails

**Action:** Roll back to last stable state

**Steps:**
1. Identify failed validation item
2. Determine root cause
3. Fix issue
4. Re-run validation
5. Continue only when all items pass

### If Quality Checks Fail

**Action:** Refactor until standards met

**Steps:**
1. Prioritize CRITICAL issues (security, breaking changes)
2. Address HIGH issues (performance, major bugs)
3. Document MEDIUM/LOW issues for backlog
4. Re-validate after fixes

---

## Reporting Template

After completing checklist, generate report using standardized format:

```markdown
## 📊 Checklist Execution Report

**Agent:** {agent.name} ({agent.persona_profile.archetype})
**Checklist:** {checklist.name}
**Started:** {timestamp.start}
**Completed:** {timestamp.end}
**Duration:** {duration}
**Tokens Used:** {tokens.total} total

---

### Status
{PERSONALITY_SLOT: status_message}

**Examples:**
- ✅ "Checklist completa! Todos os 24 itens validados." (Builder)
- ✅ "Validação rigorosa concluída. Zero pendências." (Guardian)
- ✅ "Checklist equilibrada. Priorizei itens críticos." (Balancer)

### Results
- **Total Items:** {total_items}
- **Completed:** {completed_items} ✅
- **Failed:** {failed_items} ❌
- **Skipped:** {skipped_items} ⚠️

### Failed I
```