# DECISAO - utility-integration-guide.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\pt\architecture\utility-integration-guide.md
**SHA:** c9c49908c3533e83
**Timestamp:** 2026-08-28T02:02:38.985692
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- **Padrão:** Auxiliar de Agente (agentes dev, qa)
- **Padrão:** Execução de Task (agentes dev, github-devops)
- **Padrão:** Auxiliar de Agente + Execução de Task
- **Padrão:** Utilitário de Documentação (agentes architect, docs)
- **Padrão:** Varia (Auxiliar de Agente ou Framework)

### Ouro Bruto (primeiros 5000 chars)
```
<!-- Tradução: PT-BR | Original: /docs/en/architecture/utility-integration-guide.md | Sincronização: 2026-01-26 -->

# Guia de Integração de Utilitários

> 🌐 [EN](../../architecture/utility-integration-guide.md) | **PT** | [ES](../../es/architecture/utility-integration-guide.md)

---

**Versão:** 1.0.0
**Criado em:** 2025-10-29
**Autores:** Sarah (@po), Winston (@architect)
**Propósito:** Definir padrões para integração de scripts utilitários no framework AIOS

---

## O que é Integração de Utilitários?

**Definição:** Integração de utilitários é o processo de tornar um script utilitário órfão **descobrível, documentado e utilizável** dentro do framework AIOS.

Um utilitário é considerado **totalmente integrado** quando:
1. ✅ **Registrado** no core-config.yaml
2. ✅ **Referenciado** por pelo menos um agente ou task
3. ✅ **Documentado** com propósito e uso
4. ✅ **Testado** para garantir que carrega sem erros
5. ✅ **Descobrível** através dos mecanismos do framework

---

## Padrões de Integração

### Padrão 1: Utilitário Auxiliar de Agente

**Quando Usar:** Utilitário fornece funções auxiliares que agentes usam diretamente

**Passos de Integração:**
1. Adicionar utilitário ao array `dependencies.utils` do agente alvo
2. Documentar propósito do utilitário no arquivo do agente
3. Registrar no core-config.yaml se ainda não estiver
4. Testar que o agente carrega com sucesso com o utilitário

**Exemplo: util-batch-creator**

```yaml
# .aios-core/agents/dev.yaml
id: dev
name: Agente de Desenvolvimento
dependencies:
  utils:
    - batch-creator  # Cria lotes de tasks relacionadas
    - code-quality-improver
```

**Arquivos Modificados:**
- `.aios-core/agents/{agent}.yaml` (adicionar a dependencies.utils)
- `.aios-core/core-config.yaml` (registrar se necessário)
- `.aios-core/utils/README.md` (documentar utilitário)

---

### Padrão 2: Utilitário de Execução de Task

**Quando Usar:** Utilitário é chamado por uma task durante execução

**Passos de Integração:**
1. Identificar ou criar task que usa o utilitário
2. Adicionar referência do utilitário na seção `execution.utils` da task
3. Documentar como a task usa o utilitário
4. Registrar no core-config.yaml se ainda não estiver
5. Testar execução da task com o utilitário

**Exemplo: util-commit-message-generator**

```yaml
# .aios-core/tasks/generate-commit-message.md
id: generate-commit-message
name: Gerar Mensagem de Commit
execution:
  utils:
    - commit-message-generator  # Utilitário principal para esta task
  steps:
    - Analisar mudanças staged
    - Gerar mensagem de commit semântica usando util
    - Apresentar mensagem ao usuário para aprovação
```

**Arquivos Modificados:**
- `.aios-core/tasks/{task}.md` (adicionar execution.utils)
- `.aios-core/agents/{agent}.yaml` (adicionar task à lista executes)
- `.aios-core/core-config.yaml` (registrar se necessário)
- `.aios-core/utils/README.md` (documentar utilitário)

---

### Padrão 3: Utilitário de Infraestrutura do Framework

**Quando Usar:** Utilitário é usado pelo framework em si, não diretamente por agentes/tasks

**Passos de Integração:**
1. Registrar no core-config.yaml na categoria apropriada
2. Documentar no utils/README.md como "utilitário de framework"
3. Adicionar à documentação do framework
4. Testar que utilitário carrega no contexto do framework

**Exemplo: util-elicitation-engine**

```yaml
# .aios-core/core-config.yaml
utils:
  framework:
    - elicitation-engine  # Usado pelo workflow de criação de agente
    - aios-validator
```

**Arquivos Modificados:**
- `.aios-core/core-config.yaml` (registrar em framework)
- `.aios-core/utils/README.md` (documentar como utilitário de framework)
- Docs do framework (se aplicável)

---

### Padrão 4: Utilitário de Documentação/Análise

**Quando Usar:** Utilitário realiza análise ou geração de documentação

**Passos de Integração:**
1. Adicionar aos utils do agente relevante (geralmente architect, qa, ou agente docs)
2. Criar ou atualizar task que usa o utilitário
3. Documentar formato de análise/saída
4. Registrar no core-config.yaml

**Exemplo: util-documentation-synchronizer**

```yaml
# .aios-core/agents/architect.yaml
dependencies:
  utils:
    - documentation-synchronizer  # Mantém docs sincronizados com código
    - dependency-analyzer
```

**Arquivos Modificados:**
- `.aios-core/agents/{agent}.yaml`
- `.aios-core/tasks/{task}.md` (se criar task)
- `.aios-core/core-config.yaml`
- `.aios-core/utils/README.md`

---

## Workflow de Integração

### Processo Padrão (para todos os padrões):

```
1. ANALISAR
   ├─ Inspecionar código do utilitário para entender propósito
   ├─ Identificar categoria do utilitário (auxiliar, executor, analisador, etc.)
   └─ Determinar padrão de integração apropriado

2. MAPEAR
   ├─ Identificar agente(s) alvo que devem usar o utilitário
   ├─ Identificar ou criar task(s) que chamam o utilitário
   └─ Documentar decisão de mapeamento

3. INTEGRAR
   ├─ Adicionar referência do utilitário aos arquivos de agente/task
   ├─ Registra
```