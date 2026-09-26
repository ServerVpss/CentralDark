# DECISAO - executor-matrix-checklist.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\aiox-core\squads\squad-creator\checklists\executor-matrix-checklist.md
**SHA:** efd7a2502c9b41d2
**Timestamp:** 2026-08-28T13:25:21.227675
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: HO-EP-002

### Ouro Bruto (primeiros 5000 chars)
```
# Executor Matrix Validation Checklist

> **Pattern Reference:** HO-EP-xxx (Executor Patterns)
> **Source:** AIOS Executor Matrix Standard
> **Version:** 1.0.0
> **Updated:** 2026-01-24

Este checklist valida a correta atribuicao de executores em tasks de squads.

---

## 1. Validacao dos 4 Tipos de Executor

### 1.1 Human (HO-EP-001)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Human` | |
| [ ] Task requer julgamento critico ou decisao estrategica | |
| [ ] Task envolve criatividade nao-padronizada | |
| [ ] Task requer relacionamentos interpessoais | |
| [ ] Task envolve negociacao ou persuasao | |
| [ ] Custo alto ($$) justificado pelo valor | |
| [ ] Velocidade lenta e aceitavel para o contexto | |

**Caracteristicas Human:**
- **Custo:** $$$ (Alto - tempo humano e valioso)
- **Velocidade:** Lenta (horas a dias)
- **Forca:** Julgamento, criatividade, empatia, intuicao
- **Fraqueza:** Inconsistencia, fadiga, escalabilidade limitada

---

### 1.2 Agent (AI) (HO-EP-002)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Agent` | |
| [ ] Task requer analise de grande volume de dados | |
| [ ] Task requer geracao de conteudo estruturado | |
| [ ] Task requer reconhecimento de padroes | |
| [ ] Task requer velocidade de execucao | |
| [ ] Output e auditavel e validavel | |
| [ ] Fallback para Hybrid definido | |

**Caracteristicas Agent:**
- **Custo:** $$$$ (Alto - tokens AI)
- **Velocidade:** Rapida (segundos a minutos)
- **Forca:** Analise, geracao, padroes, escala
- **Fraqueza:** Alucinacao, falta de contexto real-world

---

### 1.3 Hybrid (HO-EP-003)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Hybrid` | |
| [ ] AI assiste na execucao | |
| [ ] Humano valida o resultado | |
| [ ] Handoff entre AI e humano definido | |
| [ ] Criterios de validacao claros | |
| [ ] Tempo de resposta humana considerado | |

**Caracteristicas Hybrid:**
- **Custo:** $$ (Moderado - AI + supervisao)
- **Velocidade:** Moderada (minutos a horas)
- **Forca:** Combina escala AI com julgamento humano
- **Fraqueza:** Complexidade de coordenacao

---

### 1.4 Worker (HO-EP-004)

| Criterio | Status |
|----------|--------|
| [ ] Executor marcado como `execution_type: Worker` | |
| [ ] Task e 100% deterministica | |
| [ ] Task nao requer julgamento | |
| [ ] Task e baseada em APIs ou file operations | |
| [ ] Idempotencia garantida | |
| [ ] Retry logic implementado | |
| [ ] Logs e auditoria habilitados | |

**Caracteristicas Worker:**
- **Custo:** $ (Baixo - computacao pura)
- **Velocidade:** Muito rapida (milissegundos a segundos)
- **Forca:** Consistencia, velocidade, custo, escala infinita
- **Fraqueza:** Zero adaptabilidade, requer especificacao perfeita

---

## 2. Matriz de Decisao Rapida

Use esta matriz para determinar o tipo de executor correto:

| Requisito da Task | Executor Correto | Justificativa |
|-------------------|------------------|---------------|
| `requires_creativity` | **Human** | Criatividade genuina requer mente humana |
| `requires_judgment` | **Human** ou **Hybrid** | Julgamento critico nao deve ser delegado |
| `requires_speed` | **Agent** ou **Worker** | Automacao e mais rapida que humanos |
| `requires_consistency` | **Worker** | Determinismo garante consistencia |
| `requires_validation` | **Hybrid** | AI produz, humano valida |
| `requires_learning` | **Agent** | AI pode adaptar com novos dados |
| `requires_negotiation` | **Human** | Relacionamentos sao humanos |
| `requires_empathy` | **Human** | Empatia genuina requer humano |
| `requires_scale` | **Agent** ou **Worker** | Humanos nao escalam |
| `requires_cost_efficiency` | **Worker** | Menor custo por operacao |

---

## 3. Checklist de Atribuicao Correta

### 3.1 Pre-Atribuicao

| Criterio | Status |
|----------|--------|
| [ ] Task anatomy completa (8 campos obrigatorios) | |
| [ ] Inputs e outputs claramente definidos | |
| [ ] Acceptance criteria especificados | |
| [ ] Estimativa de tempo realista | |
| [ ] Dependencias mapeadas | |

### 3.2 Analise de Requisitos

| Criterio | Status |
|----------|--------|
| [ ] Requisitos da task listados | |
| [ ] Matriz de decisao consultada | |
| [ ] Tipo de executor selecionado | |
| [ ] Justificativa documentada (`rationale` field) | |

### 3.3 Validacao da Atribuicao

| Criterio | Status |
|----------|--------|
| [ ] Executor tem capacidade para a task | |
| [ ] Custo e aceitavel para o valor gerado | |
| [ ] Velocidade atende SLA do workflow | |
| [ ] Fallback definido (se aplicavel) | |
| [ ] Pattern ID referenciado (HO-EP-xxx) | |

### 3.4 Exemplo de Atribuicao Correta

```yaml
- id: "analyze-briefing"
  task_name: "Analisar Completude do Briefing"
  execution_type: Agent
  responsible_executor: "@briefing-analyzer"
  executor:
    type: Agent
    pattern: HO-EP-002
    rationale: "Analise de padroes em documento estruturado"
    fallback: Hybrid
    fallback_trigger: "co
```