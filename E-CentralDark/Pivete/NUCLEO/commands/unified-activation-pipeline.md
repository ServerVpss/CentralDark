# COMANDO - unified-activation-pipeline.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\unified-activation-pipeline.js
**SHA:** 2a66e09c4f778c22
**Timestamp:** 2026-08-28T02:02:04.406784
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const pipelineStart = Date.now();
- const start = Date.now();
- const start = Date.now();

### Contratos
- const featureGate = loadProModule('license/feature-gate');

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Unified Activation Pipeline - Single Entry Point for All 12 Agents
 *
 * Story ACT-6: Eliminates divergence between Path A (9 agents) and Path B (3 agents)
 * by providing a single activation pipeline with identical context richness for ALL agents.
 *
 * Story ACT-11: Pipeline Performance Optimization & Loader Prioritization
 * - Tiered loading: Critical > High > Best-effort (instead of flat Promise.all)
 * - Per-loader profiling via _profileLoader() with context.metrics output
 * - Partial greeting support (between full and fallback)
 * - Configurable timeout budgets via core-config.yaml and env vars
 * - CoreConfig shared with GreetingBuilder to eliminate double read
 *
 * Story ACT-12: Native Language Delegation
 * - Language handling delegated to Claude Code's native `language` setting in settings.json
 * - Removed language extraction/propagation from pipeline
 * - FALLBACK_PHRASES simplified to single English FALLBACK_PHRASE constant
 *
 * Architecture (ACT-11 Tiered):
 *   Phase 0: Load CoreConfig (shared, fast)
 *   Phase 1 (Critical, 80ms): AgentConfigLoader — greeting is broken without this
 *   Phase 2 (High, parallel with remaining budget): PermissionMode + GitConfigDetector
 *   Phase 3 (Best-effort, parallel with remaining budget): SessionContext + ProjectStatus
 *   Sequential: GreetingPreferenceManager, ContextDetector, WorkflowNavigator
 *   Final: GreetingBuilder.buildGreeting(enrichedContext)
 *
 * Performance Targets (ACT-11):
 *   - Pipeline p50 (warm): <150ms
 *   - Pipeline p95 (cold): <250ms
 *   - Fallback rate: <5%
 *
 * @module development/scripts/unified-activation-pipeline
 * @see greeting-builder.js - Core greeting class
 * @see generate-greeting.js - CLI wrapper (now thin wrapper around this pipeline)
 */

'use strict';

const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const yaml = require('js-yaml');

const GreetingBuilder = require('./greeting-builder');
const { AgentConfigLoader } = require('./agent-config-loader');
const SessionContextLoader = require('../../core/session/context-loader');
const { loadProjectStatus } = require('../../infrastructure/scripts/project-status-loader');
const GitConfigDetector = require('../../infrastructure/scripts/git-config-detector');
const { PermissionMode } = require('../../core/permissions');
const GreetingPreferenceManager = require('./greeting-preference-manager');
const ContextDetector = require('../../core/session/context-detector');
const WorkflowNavigator = require('./workflow-navigator');
// BUG-1 fix (INS-1): Graceful degradation when pro-detector is not available
// In installed projects, bin/utils/pro-detector.js does not exist
let isProAvailable, loadProModule;
try {
  ({ isProAvailable, loadProModule } = require('../../../bin/utils/pro-detector'));
} catch {
  isProAvailable = () => false;
  loadProModule = () => null;
}

/**
 * ACT-11: Loader importance tiers with per-tier timeout budgets.
 * Tier 1 (Critical) must complete for a meaningful greeting.
 * Tier 2 (High) adds important visual elements (badge, branch).
 * Tier 3 (Best-effort) adds optional context (status, session).
 * @type {Object}
 */
const LOADER_TIERS = {
  critical: {
    loaders: ['agentConfig'],
    timeout: 80,
    description: 'Agent identity — greeting is broken without this',
  },
  high: {
    loaders: ['permissionMode', 'gitConfig'],
    timeout: 120,
    description: 'Permission badge + branch name — visually degraded without these',
  },
  bestEffort: {
    loaders: ['sessionContext', 'projectStatus'],
    timeout: 180,
    description: 'Session awareness + project status — greeting works fine without these',
  },
};

/**
 * Default total pipeline timeout (ms).
 * Can be overridden via core-config.yaml pipeline.timeout_ms or AIOS_PIPELINE_TIMEOUT env var.
 * @type {number}
 */
const DEFAULT_PIPELINE_TIMEOUT_MS = 500;

/**
 * All 12 supported agent IDs.
 * @type {string[]}
 */
const ALL_AGENT_IDS = [
  'dev', 'qa', 'architect', 'pm', 'po', 'sm',
  'analyst', 'data-engineer', 'ux-design-expert',
  'devops', 'aios-master', 'squad-creator',
];

/**
 * ACT-12: Fallback phrase for minimal greeting (English-only safety net).
 * Language handling is delegated to Claude Code's native `language` setting in settings.json.
 * @type {string}
 */
const FALLBACK_PHRASE = 'Type `*help` to see available commands.';

class UnifiedActivationPipeline {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.greetingBuilder = options.greetingBuilder || new GreetingBuilder();
    this.preferenceManager = options.preferenceManager || new GreetingPreferenceManager();
    this.contextDetector = options.contextDetector || new ContextDetector();
    this.workflowNavigator = options.workflowNavigator || new WorkflowNavigator();
    this.gitConfigDetector = options.gitConfigDetector || new GitConfigDetector();
  }

  /**
   * Static convenience method — creates instance and activates
```