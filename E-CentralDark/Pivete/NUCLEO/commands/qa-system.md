# COMANDO - QA-SYSTEM.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\agent-flows\QA-SYSTEM.md
**SHA:** 87a54e3c8da88fa5
**Timestamp:** 2026-08-28T02:02:31.989554
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- | CRITICAL | `SEC-`, `DATA-` | Auto-fix ou bloquear | Gate = FAIL |
- | HIGH | `PERF-`, `REL-` | Auto-fix ou documentar | Gate = FAIL |
- | MEDIUM | `MNT-`, `TEST-` | Tech debt issue | Gate = CONCERNS |
- | LOW | `DOC-`, `ARCH-` | Nota no review | Gate = PASS |

### Ouro Bruto (primeiros 5000 chars)
```
# Sistema do Agente @qa

> **Versao:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @qa (Quinn - Guardian)
> **Status:** Documentacao Oficial

---

## Visao Geral

O agente **@qa (Quinn)** e o Test Architect & Quality Advisor do AIOS. Seu papel e fornecer analise abrangente de qualidade, decisoes de quality gates e recomendacoes acionaveis para equipes de desenvolvimento.

**Arquetipo:** Guardian (Virgem)
**Tom de Comunicacao:** Analitico, sistematico, educacional, pragmatico
**Vocabulario Caracteristico:** validar, verificar, garantir, proteger, auditar, inspecionar, assegurar

### Principios Core

1. **Profundidade Conforme Necessario** - Ir fundo baseado em sinais de risco, manter conciso quando baixo risco
2. **Rastreabilidade de Requisitos** - Mapear todas stories para testes usando padroes Given-When-Then
3. **Testes Baseados em Risco** - Avaliar e priorizar por probabilidade x impacto
4. **Atributos de Qualidade** - Validar NFRs (seguranca, performance, confiabilidade)
5. **Avaliacao de Testabilidade** - Avaliar controlabilidade, observabilidade, debuggabilidade
6. **Governanca de Gates** - Fornecer decisoes claras PASS/CONCERNS/FAIL/WAIVED com justificativa
7. **Excelencia Consultiva** - Educar atraves de documentacao, nunca bloquear arbitrariamente
8. **Integracao CodeRabbit** - Usar revisao automatizada para detectar problemas precocemente

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @qa

| Arquivo | Comando | Proposito |
|---------|---------|-----------|
| `.aios-core/development/tasks/qa-gate.md` | `*gate {story}` | Criar arquivo de decisao de quality gate |
| `.aios-core/development/tasks/qa-review-story.md` | `*review {story}` | Revisao completa de story com decisao de gate |
| `.aios-core/development/tasks/qa-test-design.md` | `*test-design {story}` | Criar cenarios de teste abrangentes |
| `.aios-core/development/tasks/qa-risk-profile.md` | `*risk-profile {story}` | Gerar matriz de avaliacao de risco |
| `.aios-core/development/tasks/qa-nfr-assess.md` | `*nfr-assess {story}` | Validar requisitos nao-funcionais |
| `.aios-core/development/tasks/qa-trace-requirements.md` | `*trace {story}` | Mapear requisitos para testes (Given-When-Then) |
| `.aios-core/development/tasks/qa-generate-tests.md` | `*generate-tests` | Gerar suites de teste automaticamente |
| `.aios-core/development/tasks/qa-run-tests.md` | `*run-tests` | Executar suite de testes com gate de qualidade |
| `.aios-core/development/tasks/qa-backlog-add-followup.md` | `*backlog-add` | Adicionar follow-ups ao backlog |
| `.aios-core/development/tasks/qa-create-fix-request.md` | `*create-fix-request {story}` | Gerar documento de fix request para @dev |

### Arquivos de Tasks Secundarias do @qa

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/tasks/qa-browser-console-check.md` | Verificar erros no console do browser |
| `.aios-core/development/tasks/qa-evidence-requirements.md` | Requisitos de evidencia para QA |
| `.aios-core/development/tasks/qa-false-positive-detection.md` | Deteccao de falsos positivos |
| `.aios-core/development/tasks/qa-fix-issues.md` | Task para @dev aplicar fixes de QA |
| `.aios-core/development/tasks/qa-library-validation.md` | Validacao de bibliotecas |
| `.aios-core/development/tasks/qa-migration-validation.md` | Validacao de migracoes |
| `.aios-core/development/tasks/qa-review-build.md` | Revisao de builds |
| `.aios-core/development/tasks/qa-security-checklist.md` | Checklist de seguranca |
| `.aios-core/development/tasks/qa-review-proposal.md` | Revisao de propostas |

### Arquivos de Definicao do Agente

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/agents/qa.md` | Definicao completa do agente QA |
| `.claude/commands/AIOS/agents/qa.md` | Comando Claude Code para ativar @qa |

### Arquivos de Workflow

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/workflows/qa-loop.yaml` | Orquestrador do loop QA (Review -> Fix -> Re-review) |

### Arquivos de Time

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/development/agent-teams/team-qa-focused.yaml` | Configuracao do time focado em QA (@dev, @qa, @github-devops) |

### Arquivos de Dados (Outputs)

| Arquivo | Proposito |
|---------|-----------|
| `docs/qa/gates/` | Arquivos de decisao de quality gate |
| `docs/qa/assessments/` | Avaliacoes de risco, NFR e trace |
| `docs/qa/coderabbit-reports/` | Relatorios de revisao do CodeRabbit |
| `docs/qa/backlog-archive-{YYYY-MM}.md` | Arquivo de itens completados |

### Arquivos de Configuracao

| Arquivo | Proposito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Configuracao central (qa.qaLocation, etc.) |
| `.aios-core/development/data/technical-preferences.md` | Preferencias tecnicas para QA |

---

## Flowchart: Sistema Completo de QA

```mermaid
flowchart TB
    subgraph TRIGGERS["Gatilhos de QA"]
        DEV_DONE["@dev marca story<br/>Ready for Review"]
        MANUAL["Usuario executa<b
```

---

# COMANDO - qa-system.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\aios-agent-flows\qa-system.md
**SHA:** 77b905827aa3049b
**Timestamp:** 2026-08-28T02:02:32.351768
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- | CRITICAL | `SEC-`, `DATA-` | Auto-fix ou bloquear | Gate = FAIL |
- | HIGH | `PERF-`, `REL-` | Auto-fix ou documentar | Gate = FAIL |
- | MEDIUM | `MNT-`, `TEST-` | Tech debt issue | Gate = CONCERNS |
- | LOW | `DOC-`, `ARCH-` | Nota no review | Gate = PASS |

### Ouro Bruto (primeiros 5000 chars)
```
# Sistema do Agente @qa

> **Versão:** 1.0.0
> **Criado:** 2026-02-04
> **Owner:** @qa (Quinn - Guardian)
> **Status:** Documentação Oficial

---

## Visão Geral

O agente **@qa (Quinn)** e o Test Architect & Quality Advisor do AIOS. Seu papel e fornecer analise abrangente de qualidade, decisoes de quality gates e recomendacoes acionaveis para equipes de desenvolvimento.

**Arquetipo:** Guardian (Virgem)
**Tom de Comunicacao:** Analitico, sistematico, educacional, pragmatico
**Vocabulario Caracteristico:** validar, verificar, garantir, proteger, auditar, inspecionar, assegurar

### Principios Core

1. **Profundidade Conforme Necessario** - Ir fundo baseado em sinais de risco, manter conciso quando baixo risco
2. **Rastreabilidade de Requisitos** - Mapear todas stories para testes usando padroes Given-When-Then
3. **Testes Baseados em Risco** - Avaliar e priorizar por probabilidade x impacto
4. **Atributos de Qualidade** - Validar NFRs (seguranca, performance, confiabilidade)
5. **Avaliacao de Testabilidade** - Avaliar controlabilidade, observabilidade, debuggabilidade
6. **Governanca de Gates** - Fornecer decisoes claras PASS/CONCERNS/FAIL/WAIVED com justificativa
7. **Excelencia Consultiva** - Educar atraves de documentacao, nunca bloquear arbitrariamente
8. **Integracao CodeRabbit** - Usar revisao automatizada para detectar problemas precocemente

---

## Lista Completa de Arquivos

### Arquivos Core de Tasks do @qa

| Arquivo | Comando | Propósito |
|---------|---------|-----------|
| `.aios-core/development/tasks/qa-gate.md` | `*gate {story}` | Criar arquivo de decisao de quality gate |
| `.aios-core/development/tasks/qa-review-story.md` | `*review {story}` | Revisao completa de story com decisao de gate |
| `.aios-core/development/tasks/qa-test-design.md` | `*test-design {story}` | Criar cenarios de teste abrangentes |
| `.aios-core/development/tasks/qa-risk-profile.md` | `*risk-profile {story}` | Gerar matriz de avaliacao de risco |
| `.aios-core/development/tasks/qa-nfr-assess.md` | `*nfr-assess {story}` | Validar requisitos não-funcionais |
| `.aios-core/development/tasks/qa-trace-requirements.md` | `*trace {story}` | Mapear requisitos para testes (Given-When-Then) |
| `.aios-core/development/tasks/qa-generate-tests.md` | `*generate-tests` | Gerar suites de teste automaticamente |
| `.aios-core/development/tasks/qa-run-tests.md` | `*run-tests` | Executar suite de testes com gate de qualidade |
| `.aios-core/development/tasks/qa-backlog-add-followup.md` | `*backlog-add` | Adicionar follow-ups ao backlog |
| `.aios-core/development/tasks/qa-create-fix-request.md` | `*create-fix-request {story}` | Gerar documento de fix request para @dev |

### Arquivos de Tasks Secundarias do @qa

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/tasks/qa-browser-console-check.md` | Verificar erros no console do browser |
| `.aios-core/development/tasks/qa-evidence-requirements.md` | Requisitos de evidencia para QA |
| `.aios-core/development/tasks/qa-false-positive-detection.md` | Deteccao de falsos positivos |
| `.aios-core/development/tasks/qa-fix-issues.md` | Task para @dev aplicar fixes de QA |
| `.aios-core/development/tasks/qa-library-validation.md` | Validacao de bibliotecas |
| `.aios-core/development/tasks/qa-migration-validation.md` | Validacao de migracoes |
| `.aios-core/development/tasks/qa-review-build.md` | Revisao de builds |
| `.aios-core/development/tasks/qa-security-checklist.md` | Checklist de seguranca |
| `.aios-core/development/tasks/qa-review-proposal.md` | Revisao de propostas |

### Arquivos de Definição do Agente

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/agents/qa.md` | Definição completa do agente QA |
| `.claude/commands/AIOS/agents/qa.md` | Comando Claude Code para ativar @qa |

### Arquivos de Workflow

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/workflows/qa-loop.yaml` | Orquestrador do loop QA (Review -> Fix -> Re-review) |

### Arquivos de Time

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/development/agent-teams/team-qa-focused.yaml` | Configuracao do time focado em QA (@dev, @qa, @github-devops) |

### Arquivos de Dados (Outputs)

| Arquivo | Propósito |
|---------|-----------|
| `docs/qa/gates/` | Arquivos de decisao de quality gate |
| `docs/qa/assessments/` | Avaliacoes de risco, NFR e trace |
| `docs/qa/coderabbit-reports/` | Relatorios de revisao do CodeRabbit |
| `docs/qa/backlog-archive-{YYYY-MM}.md` | Arquivo de itens completados |

### Arquivos de Configuracao

| Arquivo | Propósito |
|---------|-----------|
| `.aios-core/core-config.yaml` | Configuracao central (qa.qaLocation, etc.) |
| `.aios-core/development/data/technical-preferences.md` | Preferencias tecnicas para QA |

---

## Flowchart: Sistema Completo de QA

```mermaid
flowchart TB
    subgraph TRIGGERS["Gatilhos de QA"]
        DEV_DONE["@dev marca story<br/>Ready for Review"]
        MANUAL["Usuario executa<b
```