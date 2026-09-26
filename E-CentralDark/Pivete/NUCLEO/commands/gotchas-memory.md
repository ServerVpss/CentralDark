# COMANDO - gotchas-memory.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\memory\gotchas-memory.js
**SHA:** b0fe8524e98e9926
**Timestamp:** 2026-08-28T02:01:59.588497
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- let prompt = '\n## Known Gotchas (Review Before Proceeding)\n\n';

### Padroes
- errorPattern: errorData.message,
- errorPattern: this._extractErrorPattern(errorData.message),
- const pattern = this._extractErrorPattern(errorMessage);
- if (gotcha.trigger.errorPattern === pattern) {
- const pattern = this._extractErrorPattern(errorData.message);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Gotchas Memory
 *
 * Story: 9.4 - Gotchas Memory
 * Epic: Epic 9 - Persistent Memory Layer
 *
 * Enhanced gotchas system with auto-capture of repeated errors,
 * manual addition, and context injection for tasks.
 *
 * Features:
 * - AC1: gotchas-memory.js in .aios-core/core/memory/
 * - AC2: Persists in .aios/gotchas.json and .aios/gotchas.md
 * - AC3: Auto-capture: detects repeated errors (3x same error = gotcha)
 * - AC4: Categories: build, test, lint, runtime, integration, security
 * - AC5: Command *gotcha {description} adds manually
 * - AC6: Command *gotchas lists all gotchas
 * - AC7: Injects relevant gotchas before related tasks
 * - AC8: Severity levels: info, warning, critical
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Output paths
  gotchasJsonPath: '.aios/gotchas.json',
  gotchasMdPath: '.aios/gotchas.md',
  errorTrackingPath: '.aios/error-tracking.json',

  // Auto-capture settings
  repeatThreshold: 3, // Number of times error must repeat to become gotcha
  errorWindowMs: 24 * 60 * 60 * 1000, // 24 hours window for error counting

  // Version
  version: '1.0.0',
  schemaVersion: 'aios-gotchas-memory-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha categories (AC4)
 */
const GotchaCategory = {
  BUILD: 'build',
  TEST: 'test',
  LINT: 'lint',
  RUNTIME: 'runtime',
  INTEGRATION: 'integration',
  SECURITY: 'security',
  GENERAL: 'general',
};

/**
 * Severity levels (AC8)
 */
const Severity = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
};

/**
 * Category keywords for auto-detection
 */
const CATEGORY_KEYWORDS = {
  [GotchaCategory.BUILD]: [
    'build',
    'compile',
    'webpack',
    'vite',
    'esbuild',
    'rollup',
    'bundle',
    'transpile',
    'babel',
    'typescript',
    'tsc',
    'npm run build',
  ],
  [GotchaCategory.TEST]: [
    'test',
    'jest',
    'vitest',
    'mocha',
    'chai',
    'expect',
    'assert',
    'mock',
    'stub',
    'spy',
    'coverage',
    'e2e',
    'playwright',
    'cypress',
  ],
  [GotchaCategory.LINT]: [
    'lint',
    'eslint',
    'prettier',
    'stylelint',
    'tslint',
    'format',
    'code style',
    'indentation',
    'semicolon',
    'quotes',
  ],
  [GotchaCategory.RUNTIME]: [
    'runtime',
    'TypeError',
    'ReferenceError',
    'SyntaxError',
    'null',
    'undefined',
    'crash',
    'exception',
    'stack trace',
  ],
  [GotchaCategory.INTEGRATION]: [
    'api',
    'http',
    'fetch',
    'axios',
    'cors',
    'webhook',
    'database',
    'postgres',
    'mysql',
    'mongodb',
    'supabase',
    'prisma',
  ],
  [GotchaCategory.SECURITY]: [
    'security',
    'xss',
    'csrf',
    'injection',
    'sql injection',
    'auth',
    'authentication',
    'authorization',
    'token',
    'password',
  ],
};

/**
 * Events emitted by GotchasMemory
 */
const Events = {
  GOTCHA_ADDED: 'gotcha_added',
  GOTCHA_REMOVED: 'gotcha_removed',
  GOTCHA_RESOLVED: 'gotcha_resolved',
  ERROR_TRACKED: 'error_tracked',
  AUTO_CAPTURED: 'auto_captured',
  CONTEXT_INJECTED: 'context_injected',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHAS MEMORY CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchasMemory extends EventEmitter {
  /**
   * Create a new GotchasMemory instance
   *
   * @param {string} rootPath - Project root path
   * @param {Object} [options] - Configuration options
   */
  constructor(rootPath, options = {}) {
    super();
    this.rootPath = rootPath || process.cwd();
    this.options = {
      repeatThreshold: options.repeatThreshold || CONFIG.repeatThreshold,
      errorWindowMs: options.errorWindowMs || CONFIG.errorWindowMs,
      quiet: options.quiet || false,
    };

    // Paths
    this.gotchasJsonPath = path.join(this.rootPath, CONFIG.gotchasJsonPath);
    this.gotchasMdPath = path.join(this.rootPath, CONFIG.gotchasMdPath);
    this.errorTrackingPath = path.join(this.rootPath, CONFIG.errorTrackingPath);

    // In-memory storage
    this.gotchas = new Map(); // id -> gotcha
    this.errorTracking = new Map(); // errorHash -> { count, firstSeen, lastSeen, samples }

    // Load existing data
    this._loadGotchas();
    this._loadErrorTracking();
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //                              PUBLIC METHODS
  //
```