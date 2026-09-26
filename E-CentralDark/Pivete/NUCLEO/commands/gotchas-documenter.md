# COMANDO - gotchas-documenter.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\gotchas-documenter.js
**SHA:** 8fc0003beff9149c
**Timestamp:** 2026-08-28T02:02:13.167676
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const currentPattern = patternParts[0];
- if (currentPattern === '**') {

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Gotchas Documenter
 *
 * Story: 7.4 - Gotchas Documenter
 * Epic: Epic 7 - Memory Layer
 *
 * Automatically extracts gotchas from session insights and consolidates
 * them into a searchable, categorized knowledge base.
 *
 * Features:
 * - AC1: Extracts gotchas from session insights automatically
 * - AC2: Generates `.aios/gotchas.md` consolidated
 * - AC3: Format: Wrong, Right, Reason for each gotcha
 * - AC4: Categorized by area (API, Frontend, Database, etc.)
 * - AC5: Referenced by Self-Critique (Epic 4)
 * - AC6: Updated automatically after session insights
 * - AC7: Command `*list-gotchas` for quick lookup
 *
 * @author @dev (Dex)
 * @version 1.0.0
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // Output paths
  outputPath: '.aios/gotchas.md',
  outputJsonPath: '.aios/gotchas.json',

  // Input paths for scanning
  insightsPaths: [
    'docs/stories/**/insights/*.json',
    'docs/stories/**/session-*.json',
    '.aios/insights/*.json',
  ],

  // Version
  version: '1.0.0',

  // Schema version
  schemaVersion: 'aios-gotchas-v1',
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              ENUMS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Gotcha categories (AC4)
 */
const Category = {
  STATE_MANAGEMENT: 'State Management',
  API: 'API',
  DATABASE: 'Database',
  FRONTEND: 'Frontend/React',
  TESTING: 'Testing',
  BUILD_DEPLOY: 'Build/Deploy',
  TYPESCRIPT: 'TypeScript',
  AUTHENTICATION: 'Authentication',
  PERFORMANCE: 'Performance',
  SECURITY: 'Security',
  OTHER: 'Other',
};

/**
 * Severity levels
 */
const Severity = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

/**
 * Category keywords for auto-detection
 */
const CATEGORY_KEYWORDS = {
  [Category.STATE_MANAGEMENT]: [
    'zustand',
    'redux',
    'state',
    'store',
    'persist',
    'hydration',
    'context',
    'recoil',
    'jotai',
    'mobx',
  ],
  [Category.API]: [
    'fetch',
    'axios',
    'http',
    'endpoint',
    'rest',
    'graphql',
    'api',
    'request',
    'response',
    'cors',
  ],
  [Category.DATABASE]: [
    'sql',
    'postgres',
    'mysql',
    'mongodb',
    'prisma',
    'drizzle',
    'supabase',
    'query',
    'migration',
    'orm',
  ],
  [Category.FRONTEND]: [
    'react',
    'component',
    'hook',
    'useEffect',
    'useState',
    'render',
    'jsx',
    'tsx',
    'dom',
    'css',
    'tailwind',
    'nextjs',
    'next.js',
  ],
  [Category.TESTING]: [
    'test',
    'jest',
    'vitest',
    'mock',
    'stub',
    'expect',
    'assert',
    'coverage',
    'e2e',
    'playwright',
  ],
  [Category.BUILD_DEPLOY]: [
    'build',
    'deploy',
    'ci',
    'cd',
    'webpack',
    'vite',
    'docker',
    'vercel',
    'railway',
    'bundle',
  ],
  [Category.TYPESCRIPT]: [
    'typescript',
    'type',
    'interface',
    'generic',
    'infer',
    'as const',
    'satisfies',
    'enum',
    'tsconfig',
  ],
  [Category.AUTHENTICATION]: [
    'auth',
    'login',
    'logout',
    'session',
    'token',
    'jwt',
    'oauth',
    'password',
    'credential',
  ],
  [Category.PERFORMANCE]: [
    'performance',
    'memory',
    'leak',
    'optimization',
    'cache',
    'lazy',
    'debounce',
    'throttle',
    'memoize',
  ],
  [Category.SECURITY]: [
    'security',
    'xss',
    'csrf',
    'injection',
    'sanitize',
    'escape',
    'vulnerability',
    'encrypt',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              GOTCHAS DOCUMENTER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class GotchasDocumenter {
  /**
   * Create a new GotchasDocumenter instance
   *
   * @param {string} rootPath - Project root path
   * @param {Object} [options] - Configuration options
   * @param {string} [options.outputPath] - Custom output path for gotchas.md
   * @param {boolean} [options.quiet] - Suppress console output
   */
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath || process.cwd();
    this.outputPath = options.outputPath || CONFIG.outputPath;
    this.quiet = options.quiet || false;

    // Initialize gotchas storage
    this.gotchas = new Map(); // id -> gotcha
    this.byCategory = new Map(); // category -> gotcha[]
    this.byStory = new Map(); // storyId -> gotcha[]

    // Statistics
    this.stats = {
      insightsScanned: 0,
      gotchasExtracted: 0,
      gotchasDeduplicated: 0,
      categoriesFound: 0,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════════
  //             
```