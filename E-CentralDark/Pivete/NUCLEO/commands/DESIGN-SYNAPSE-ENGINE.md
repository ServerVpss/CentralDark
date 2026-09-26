# COMANDO - DESIGN-SYNAPSE-ENGINE.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\docs\architecture\SYNAPSE\docs\DESIGN-SYNAPSE-ENGINE.md
**SHA:** 4bc1ff7b19fd8220
**Timestamp:** 2026-08-28T02:02:32.869496
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- [L6] KEYWORD: No matches (prompt: "fix the login bug")
- this.totalStart = null;
- this.layers[name] = { start: performance.now(), status: 'running' };

### Ouro Bruto (primeiros 5000 chars)
```
# DESIGN — SYNAPSE Engine

> Design Document tecnico para `synapse-engine.js`
> Motor unificado de contexto adaptativo do Synkra AIOS

**Versao:** 1.0.0
**Data:** 2026-02-10
**Status:** Draft para Implementacao
**Autor:** @architect

---

## 1. Interface Publica do synapse-engine.js

### 1.1 Ponto de Entrada (Hook)

```javascript
/**
 * SYNAPSE Engine — Synkra Adaptive Processing & State Engine
 *
 * Registered as UserPromptSubmit hook in .claude/settings.json
 * Reads JSON from stdin, outputs JSON to stdout
 *
 * Input:  { cwd, sessionId, prompt }
 * Output: { hookSpecificOutput: { additionalContext: "<synapse-rules>..." } }
 */

// Hook entry point — called by Claude Code on every user prompt
async function main() {
  const input = readStdin();      // { cwd, sessionId, prompt }
  const result = await process(input);
  writeStdout(result);            // { hookSpecificOutput: { additionalContext } }
}
```

### 1.2 Core API

```javascript
class SynapseEngine {
  /**
   * Process a user prompt and generate synapse-rules
   * @param {Object} input
   * @param {string} input.cwd - Working directory
   * @param {string} input.sessionId - Claude Code session ID
   * @param {string} input.prompt - User prompt text
   * @returns {Promise<string>} Formatted <synapse-rules> XML
   */
  async process(input)

  /**
   * Activate an agent (one-time, richer context)
   * @param {string} agentId - Agent identifier (dev, qa, architect, etc.)
   * @param {Object} options - Activation options
   * @returns {Promise<ActivationResult>} Greeting + enriched context
   */
  async activateAgent(agentId, options)
}
```

### 1.3 Layer Processors

```javascript
/**
 * Each layer is a processor that:
 * - Receives: { prompt, session, config, previousLayers }
 * - Returns: { rules: string[], metadata: object } | null (skip)
 * - Has: timeout budget, fallback strategy
 */

class LayerProcessor {
  /** @abstract */
  async process(context) {}

  /** Timeout in ms for this layer */
  get timeout() {}

  /** Fallback if processing fails */
  fallback(error) {}
}

// Concrete implementations:
class ConstitutionLayer extends LayerProcessor {}    // L0
class GlobalLayer extends LayerProcessor {}          // L1
class AgentScopedLayer extends LayerProcessor {}     // L2
class WorkflowLayer extends LayerProcessor {}        // L3
class TaskLayer extends LayerProcessor {}            // L4
class SquadLayer extends LayerProcessor {}           // L5
class KeywordLayer extends LayerProcessor {}         // L6
class StarCommandLayer extends LayerProcessor {}     // L7
```

### 1.4 Exported Types

```typescript
interface SynapseConfig {
  manifestPath: string;           // .synapse/manifest
  domainsDir: string;             // .synapse/
  sessionsDir: string;            // .synapse/sessions/
  maxContext: number;              // 200000 (token limit)
  staleSessionHours: number;      // 24
  devmode: boolean;               // from manifest
}

interface SessionState {
  uuid: string;
  started: string;                // ISO 8601
  cwd: string;
  label: string;
  title: string | null;
  prompt_count: number;
  last_activity: string;          // ISO 8601
  active_agent: string | null;    // e.g., "dev", "qa"
  active_workflow: string | null; // e.g., "story_development"
  active_squad: string | null;    // e.g., "etl-squad"
  active_task: string | null;     // e.g., "implement-user-auth"
  overrides: Record<string, boolean | null>;
}

interface ActivationResult {
  greeting: string;
  context: EnrichedContext;
  duration: number;               // ms
  quality: 'full' | 'partial' | 'fallback';
  metrics: LoaderMetrics;
}

type ContextBracket = 'FRESH' | 'MODERATE' | 'DEPLETED' | 'CRITICAL';

interface LayerResult {
  rules: string[];
  metadata: {
    layer: number;
    name: string;
    source: string;               // file path or "computed"
    tokens_estimate: number;
  };
}
```

---

## 2. 8-Layer Domain Hierarchy Schema

### 2.1 Layer Specification

| Layer | Nome | Tipo | Ativacao | Desativavel? | Timeout | Token Budget |
|-------|------|------|---------|-------------|---------|-------------|
| L0 | CONSTITUTION | Static | ALWAYS_ON | **Nunca** | 5ms | ~100 tokens |
| L1 | GLOBAL | Static + Dynamic | ALWAYS_ON | Via manifest | 10ms | ~200 tokens |
| L2 | AGENT-SCOPED | Dynamic | Agent ativo | Por session | 15ms | ~300 tokens |
| L3 | WORKFLOW | Dynamic | Workflow state | Por session | 15ms | ~200 tokens |
| L4 | TASK | Dynamic | Task ativa | Por session | 20ms | ~300 tokens |
| L5 | SQUAD | Dynamic | Squad ativo | Por session | 20ms | ~200 tokens |
| L6 | KEYWORD | Dynamic | Prompt keywords | Via EXCLUDE | 15ms | ~200 tokens |
| L7 | STAR-COMMAND | Explicit | `*command` no prompt | N/A | 5ms | ~200 tokens |

**Total budget maximo:** ~1700 tokens (FRESH) a ~2500 tokens (DEPLETED)

### 2.2 Layer Processing Pipeline

```mermaid
flowchart LR
    INPUT["stdin JSON"] --> INIT["Initialize"]
    INIT --> L0["L0: Constitution<br/>5ms | ~100tok"]
    L0 --> L1[
```