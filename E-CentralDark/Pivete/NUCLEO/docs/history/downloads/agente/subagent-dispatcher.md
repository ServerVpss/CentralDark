# AGENTE - subagent-dispatcher.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\execution\subagent-dispatcher.js
**SHA:** 7bc03f948ccedfb0
**Timestamp:** 2026-08-28T02:01:56.468306
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = this.buildPrompt(agentId, task, context);
- let prompt = `You are ${agentId}, a specialized agent in the AIOS framework.\n\n`;
- const escapedPrompt = prompt.replace(/'/g, "'\\''");

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Subagent Dispatcher
 * Story 10.2 - Parallel Agent Execution
 * Story GEMINI-INT.3 - Multi-Provider Support
 *
 * Dispatches tasks to specialized subagents based on task type.
 * Supports multiple AI providers (Claude, Gemini) with routing and fallback.
 * Injects relevant context from Memory Layer.
 */

const EventEmitter = require('events');
const { spawn } = require('child_process');
const _path = require('path');

// Import AI Provider Factory
let AIProviderFactory;
try {
  AIProviderFactory = require('../../infrastructure/integrations/ai-providers');
} catch {
  AIProviderFactory = null;
}

// Import dependencies with fallbacks
let MemoryQuery, GotchasMemory;
try {
  MemoryQuery = require('../memory/memory-query');
} catch {
  MemoryQuery = null;
}
try {
  GotchasMemory = require('../memory/gotchas-memory');
} catch {
  GotchasMemory = null;
}

class SubagentDispatcher extends EventEmitter {
  constructor(config = {}) {
    super();

    // Agent mapping: task type → agent
    this.agentMapping = config.agentMapping || {
      database: '@data-engineer',
      db: '@data-engineer',
      migration: '@data-engineer',
      api: '@dev',
      backend: '@dev',
      frontend: '@dev',
      component: '@dev',
      feature: '@dev',
      bugfix: '@dev',
      test: '@qa',
      testing: '@qa',
      review: '@qa',
      deploy: '@devops',
      infrastructure: '@devops',
      ci: '@devops',
      architecture: '@architect',
      design: '@architect',
      documentation: '@pm',
      docs: '@pm',
      planning: '@pm',
      analysis: '@analyst',
      research: '@analyst',
    };

    // Default agent when no match
    this.defaultAgent = config.defaultAgent || '@dev';

    // AI Provider configuration (Story GEMINI-INT.3)
    this.providerMapping = config.providerMapping || {
      // Tasks that benefit from Claude's deep reasoning
      '@architect': 'claude',
      '@analyst': 'claude',
      security: 'claude',

      // Tasks that work well with Gemini's speed
      '@dev': 'auto', // Use configured default
      '@qa': 'gemini',
      '@pm': 'gemini',
      documentation: 'gemini',
      formatting: 'gemini',
    };

    // Default provider (from config or claude)
    this.defaultProvider = config.defaultProvider || 'claude';

    // Enable multi-provider features
    this.multiProviderEnabled = config.multiProviderEnabled !== false;

    // Parallel execution mode
    this.parallelMode = config.parallelMode || 'fallback'; // fallback, race, consensus, best-of

    // Retry configuration
    this.maxRetries = config.maxRetries || 2;
    this.retryDelay = config.retryDelay || 2000;

    // Dependencies
    this.memoryQuery = config.memoryQuery || (MemoryQuery ? new MemoryQuery() : null);
    this.gotchasMemory = config.gotchasMemory || (GotchasMemory ? new GotchasMemory() : null);

    // Dispatch log
    this.dispatchLog = [];
    this.maxLogSize = 100;

    // Root path for project
    this.rootPath = config.rootPath || process.cwd();
  }

  /**
   * Dispatch a task to the appropriate subagent
   * @param {Object} task - Task to dispatch
   * @param {Object} context - Execution context
   * @returns {Promise<Object>} - Dispatch result
   */
  async dispatch(task, context = {}) {
    const agentId = this.resolveAgent(task);
    const startTime = Date.now();

    // Resolve provider (Story GEMINI-INT.3)
    const providerName = this.resolveProvider(task, agentId);

    // Create dispatch record
    const dispatchRecord = {
      id: `dispatch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      agentId,
      provider: providerName,
      startedAt: new Date().toISOString(),
      attempts: 0,
    };

    this.emit('dispatch_started', dispatchRecord);
    this.log('dispatch_started', dispatchRecord);

    // Enrich context
    const enrichedContext = await this.enrichContext(task, context);
    dispatchRecord.contextSize = JSON.stringify(enrichedContext).length;

    // Execute with retries
    let lastError = null;
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      dispatchRecord.attempts = attempt;

      try {
        const result = await this.spawnSubagent(agentId, task, enrichedContext);

        dispatchRecord.completedAt = new Date().toISOString();
        dispatchRecord.success = result.success;
        dispatchRecord.duration = Date.now() - startTime;
        dispatchRecord.outputSize = result.output?.length || 0;

        this.emit('dispatch_completed', dispatchRecord);
        this.log('dispatch_completed', dispatchRecord);

        return {
          success: result.success,
          output: result.output,
          agentId,
          taskId: task.id,
          duration: dispatchRecord.duration,
          filesModified: result.filesModified || [],
        };
      } catch (error) {
        lastError = error;

        this.log('dispatch_attempt_failed', {
          ...dispatchRecord,
          attempt,
          error: 
```