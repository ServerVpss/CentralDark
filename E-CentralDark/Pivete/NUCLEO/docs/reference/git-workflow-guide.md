# REFERENCIA - git-workflow-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\git-workflow-guide.md
**SHA:** b6aa0639cddc05a8
**Timestamp:** 2026-08-28T02:02:38.430592
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- run: npm run lint
- run: npm run typecheck
- run: npm run test:coverage
- run: node .aios-core/utils/aios-validator.js stories
- run: node .aios-core/utils/custom-validator.js

### Ouro Bruto (primeiros 5000 chars)
```
<!--
  Tradução: PT-BR
  Original: /docs/en/git-workflow-guide.md
  Última sincronização: 2026-01-26
-->

# Guia de Workflow Git do AIOS

> 🌐 [EN](../git-workflow-guide.md) | **PT** | [ES](../es/git-workflow-guide.md)

---

_Story: 2.2-git-workflow-implementation.yaml_

## Índice

- [Visão Geral](#visão-geral)
- [Arquitetura de Defesa em Profundidade](#arquitetura-de-defesa-em-profundidade)
- [Camada 1: Validação Pre-commit](#camada-1-validação-pre-commit)
- [Camada 2: Validação Pre-push](#camada-2-validação-pre-push)
- [Camada 3: Pipeline CI/CD](#camada-3-pipeline-cicd)
- [Proteção de Branch](#proteção-de-branch)
- [Workflow Diário](#workflow-diário)
- [Solução de Problemas](#solução-de-problemas)
- [Dicas de Performance](#dicas-de-performance)

## Visão Geral

O Synkra AIOS implementa uma estratégia de validação de **Defesa em Profundidade** com três camadas progressivas que detectam problemas antecipadamente e garantem a qualidade do código antes do merge.

### Por Que Três Camadas?

1. **Feedback rápido** - Detecta problemas imediatamente durante o desenvolvimento
2. **Validação local** - Sem dependência de cloud para verificações básicas
3. **Validação autoritativa** - Portão final antes do merge
4. **Consistência de stories** - Garante que o desenvolvimento está alinhado com as stories

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                     Workflow do Desenvolvedor                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 1: Hook Pre-commit (Local - <5s)                     │
│ ✓ ESLint (qualidade de código)                              │
│ ✓ TypeScript (verificação de tipos)                         │
│ ✓ Cache habilitado                                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 2: Hook Pre-push (Local - <2s)                       │
│ ✓ Validação de checkboxes da story                          │
│ ✓ Consistência de status                                    │
│ ✓ Seções obrigatórias                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│ Camada 3: GitHub Actions CI (Cloud - 2-5min)                │
│ ✓ Todas as verificações de lint/tipos                       │
│ ✓ Suíte completa de testes                                  │
│ ✓ Cobertura de código (≥80%)                                │
│ ✓ Validação de stories                                      │
│ ✓ Proteção de branch                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
                      ┌──────────────┐
                      │ Pronto para  │
                      │    Merge     │
                      └──────────────┘
```

## Arquitetura de Defesa em Profundidade

### Camada 1: Pre-commit (Local - Rápido)

**Meta de Performance:** <5 segundos
**Gatilho:** `git commit`
**Localização:** `.husky/pre-commit`

**O que valida:**

- Qualidade de código ESLint
- Verificação de tipos TypeScript
- Erros de sintaxe
- Problemas de importação

**Como funciona:**

```bash
# Acionado automaticamente no commit
git add .
git commit -m "feat: add feature"

# Executa:
# 1. ESLint com cache (.eslintcache)
# 2. Compilação incremental TypeScript (.tsbuildinfo)
```

**Benefícios:**

- ⚡ Feedback rápido (<5s)
- 💾 Cache para velocidade
- 🔒 Previne commits de código quebrado
- 🚫 Sem sintaxe inválida no histórico

### Camada 2: Pre-push (Local - Validação de Stories)

**Meta de Performance:** <2 segundos
**Gatilho:** `git push`
**Localização:** `.husky/pre-push`

**O que valida:**

- Completude de checkboxes da story vs status
- Seções obrigatórias da story presentes
- Consistência de status
- Registros do dev agent

**Como funciona:**

```bash
# Acionado automaticamente no push
git push origin feature/my-feature

# Valida todos os arquivos de story em docs/stories/
```

**Regras de Validação:**

1. **Consistência de Status:**

```yaml
# ❌ Inválido: completada mas tarefas incompletas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[ ] Task 2"  # Erro!

# ✅ Válido: todas as tarefas completadas
status: "completed"
tasks:
  - "[x] Task 1"
  - "[x] Task 2"
```

2. **Seções Obrigatórias:**

- `id`
- `title`
- `description`
- `acceptance_criteria`
- `status`

3. **Fluxo de Status:**

```
ready → in progress → Ready for Review → completed
```

### Camada 3: CI/CD (Cloud - Autoritativo)

**Performance:** 2-5 minutos
**Gatilho:** Push para qualquer branch, criação de PR
**Plataforma:** 
```