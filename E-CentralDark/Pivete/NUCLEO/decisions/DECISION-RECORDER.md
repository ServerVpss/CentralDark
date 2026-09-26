# DECISAO - decision-recorder.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\decision-recorder.js
**SHA:** 678ec39f929398e3
**Timestamp:** 2026-08-28T02:02:03.638476
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.log(`  Tests Run: ${summary.testsRunCount} (${summary.testsPassed} passed, ${summary.testsFailed} failed)`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Decision Recording API
 *
 * Simple API for recording decisions during yolo mode execution.
 * Automatically manages global context and provides convenience methods.
 *
 * @module decision-recorder
 */

const { DecisionContext } = require('./decision-context');
const { generateDecisionLog } = require('./decision-log-generator');
const fs = require('fs').promises;
const _path = require('path');
const yaml = require('js-yaml');

// Global context instance (singleton pattern for yolo mode session)
let globalContext = null;

/**
 * Initialize decision logging for yolo mode session
 *
 * @param {string} agentId - Agent identifier (e.g., 'dev')
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Additional options
 * @param {boolean} options.enabled - Whether to enable logging (default: reads from config)
 * @param {number} options.agentLoadTime - Agent load time in ms
 * @returns {Promise<DecisionContext>} Initialized context
 */
async function initializeDecisionLogging(agentId, storyPath, options = {}) {
  // Load config to check if decision logging is enabled
  let config = {};
  try {
    const configContent = await fs.readFile('.aios-core/core-config.yaml', 'utf8');
    config = yaml.load(configContent);
  } catch (error) {
    console.warn('Warning: Could not load core-config.yaml:', error.message);
  }

  const enabled = options.enabled !== undefined
    ? options.enabled
    : (config.decisionLogging?.enabled !== false);

  if (!enabled) {
    console.log('Decision logging disabled by configuration');
    return null;
  }

  globalContext = new DecisionContext(agentId, storyPath, { ...options, enabled });
  console.log('✅ Decision logging initialized for story:', storyPath);

  return globalContext;
}

/**
 * Record a decision (convenience function)
 *
 * @param {Object} decision - Decision details
 * @param {string} decision.description - What decision was made
 * @param {string} decision.reason - Why this choice was made
 * @param {string[]} decision.alternatives - Other options considered
 * @param {string} decision.type - Decision type
 * @param {string} decision.priority - Priority level
 * @returns {Object|null} Recorded decision or null if logging disabled
 */
function recordDecision(decision) {
  if (!globalContext) {
    console.warn('Warning: Decision logging not initialized, call initializeDecisionLogging() first');
    return null;
  }

  return globalContext.recordDecision(decision);
}

/**
 * Track file modification (convenience function)
 *
 * @param {string} filePath - Path to file
 * @param {string} action - Action performed
 */
function trackFile(filePath, action = 'modified') {
  if (!globalContext) return;
  globalContext.trackFile(filePath, action);
}

/**
 * Track test execution (convenience function)
 *
 * @param {Object} test - Test details
 */
function trackTest(test) {
  if (!globalContext) return;
  globalContext.trackTest(test);
}

/**
 * Update metrics (convenience function)
 *
 * @param {Object} metrics - Metrics to update
 */
function updateMetrics(metrics) {
  if (!globalContext) return;
  globalContext.updateMetrics(metrics);
}

/**
 * Complete decision logging and generate log file
 *
 * @param {string} storyId - Story identifier (e.g., '6.1.2.6.2')
 * @param {string} status - Final status ('completed', 'failed', 'cancelled')
 * @returns {Promise<string|null>} Path to generated log file or null
 */
async function completeDecisionLogging(storyId, status = 'completed') {
  if (!globalContext) {
    console.log('Decision logging not initialized, skipping log generation');
    return null;
  }

  globalContext.complete(status);

  try {
    const logPath = await generateDecisionLog(storyId, globalContext.toObject());
    const summary = globalContext.getSummary();

    console.log('\n📊 Decision Log Summary:');
    console.log(`  Decisions: ${summary.decisionsCount}`);
    console.log(`  Files Modified: ${summary.filesModifiedCount}`);
    console.log(`  Tests Run: ${summary.testsRunCount} (${summary.testsPassed} passed, ${summary.testsFailed} failed)`);
    console.log(`  Duration: ${(summary.duration / 1000).toFixed(1)}s`);
    console.log(`  Status: ${summary.status}`);
    console.log(`  Log: ${logPath}\n`);

    // Update decision log index (Phase 2: Task 5)
    try {
      const { addToIndex } = require('./decision-log-indexer');
      await addToIndex(logPath);
    } catch (indexError) {
      console.warn('Warning: Could not update decision log index:', indexError.message);
      // Non-fatal error - continue even if indexing fails
    }

    // Reset global context for next session
    globalContext = null;

    return logPath;
  } catch (error) {
    console.error('Error generating decision log:', error);
    throw error;
  }
}

/**
 * Get current context (for inspection/debugging)
 *
 * @returns {DecisionContext|null} Current context or null
 */
function getCurrentContext() {
  return globalContext;
}

module.exports = {
  initializ
```

---

# DECISAO - DECISION-RECORDER.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\docs\BRAIN\03-DOCUMENTACAO\AGENTS-LIBRARY\DECISION-RECORDER.md
**SHA:** aea18563451990a8
**Timestamp:** 2026-08-28T02:56:46.806724
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Decisoes
- Pivete: "Registra a decisão: vamos usar timer aleatório em todos os agentes cron"

### Ouro Bruto (primeiros 5000 chars)
```
---
title: "Skill: Registra a Decisão"
date: 2026-06-29
tags: ["skill", "decisao", "memoria", "historico", "registro"]
updated: 2026-06-29
---

# 🤖 SKILL: DECISION-RECORDER

> 🗣️ **Chame assim:** _"Registra a decisão"_, _"Grava essa escolha"_, _"Anota o que decidimos"_
> **Objetivo:** Registrar decisões importantes com contexto, motivo e consequência — para nunca precisar rexplicar por que algo foi feito assim.
> **Tipo:** Memória | **Prioridade:** Alta

---

## Quando usar

Quando tomar uma decisão que vai afetar o sistema ou que pode ser questionada no futuro:
- "Decidimos usar X em vez de Y"
- "Escolhemos não fazer Z porque..."
- "A regra a partir de agora é..."

---

## Como funciona

1. **Capta a decisão** — qual foi a escolha feita
2. **Captura o contexto** — por que essa decisão foi tomada agora
3. **Anota as consequências** — o que muda com essa decisão
4. **Salva em:** `docs/CONSCIENCIA/08-HISTORICO-DECISOES.md`
5. **Se for regra nova:** também atualiza `docs/CONSCIENCIA/02-PERMISSOES.md`
6. **Confirma** para o Pivete com resumo de 2 linhas

---

## Regras de Ouro

**Nunca:** registrar decisão sem motivo — decisão sem "por quê" não serve pra nada
**Sempre:** incluir data, contexto e o que muda a partir dali

---

## Exemplo de uso

```
Pivete: "Registra a decisão: vamos usar timer aleatório em todos os agentes cron"

Agente:
1. Motivo: evitar sobrecarga de API em horários fixos
2. Consequência: agentes rodam em intervalos de 45-110 min
3. Salva em: 08-HISTORICO-DECISOES.md
4. Confirma: "✅ Decisão registrada: timer aleatório em agentes cron (29/06/2026)"
```

---

## Saída esperada

- Entrada nova em `08-HISTORICO-DECISOES.md`
- Formato: data | decisão | motivo | consequência
- Confirmação no chat

---

## Conexões Rápidas

- [[00-AGENTS-INDEX]] — arsenal completo
- [[MEMORY-REGISTRAR]] — para notas gerais (não decisões)
- [[08-HISTORICO-DECISOES]] — onde vai salvar

```