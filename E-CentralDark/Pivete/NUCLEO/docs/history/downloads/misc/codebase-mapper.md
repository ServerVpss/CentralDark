# OUTRO - codebase-mapper.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\codebase-mapper.js
**SHA:** dc3fdaea27fb37e3
**Timestamp:** 2026-08-28T02:02:12.749531
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- return CONFIG.excludeFiles.some(pattern => {
- return patterns.some(pattern => pattern.test(content));

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Codebase Mapper
 *
 * Story: 7.2 - Codebase Mapper
 * Epic: Epic 7 - Memory Layer
 *
 * Generates comprehensive maps of the codebase for context generation.
 * Used by the Context Generator (Epic 4) to understand project structure.
 *
 * Features:
 * - AC1: Located in `.aios-core/infrastructure/scripts/`
 * - AC2: Generates: services, directories, patterns, conventions, dependencies
 * - AC3: Output: `.aios/codebase-map.json`
 * - AC4: Automatic updates after significant merges
 * - AC5: Command `*map-codebase` available globally
 * - AC6: Used by Context Generator (Epic 4)
 * - AC7: Excludes node_modules, .git, build outputs
 *
 * @author @architect (Aria)
 * @version 1.0.0
 */

const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');

// ═══════════════════════════════════════════════════════════════════════════════════
//                              CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════════

const CONFIG = {
  // AC3: Output path
  outputPath: '.aios/codebase-map.json',
  // Schema version
  schemaVersion: '1.0',
  // Default max depth
  defaultMaxDepth: 5,
  // AC7: Directories to exclude
  excludeDirs: [
    'node_modules',
    '.git',
    'dist',
    'build',
    'out',
    '.next',
    '.nuxt',
    '.svelte-kit',
    'coverage',
    '.cache',
    '.parcel-cache',
    '.turbo',
    '__pycache__',
    '.pytest_cache',
    'venv',
    '.venv',
    'env',
    '.env',
    'vendor',
    'tmp',
    'temp',
    'logs',
  ],
  // File patterns to exclude
  excludeFiles: [
    '*.log',
    '*.lock',
    '*.map',
    '.DS_Store',
    'Thumbs.db',
    '*.min.js',
    '*.min.css',
    '*.chunk.js',
    '*.bundle.js',
  ],
  // File extensions to analyze for patterns
  codeExtensions: [
    '.js', '.mjs', '.cjs',
    '.ts', '.tsx', '.jsx',
    '.py', '.rb', '.go',
    '.java', '.kt', '.scala',
    '.rs', '.cpp', '.c', '.h',
    '.vue', '.svelte',
  ],
  // Config file names to detect
  configFiles: [
    'package.json',
    'tsconfig.json',
    'vite.config.ts',
    'vite.config.js',
    'next.config.js',
    'next.config.mjs',
    'nuxt.config.ts',
    'webpack.config.js',
    '.eslintrc',
    '.eslintrc.js',
    '.prettierrc',
    'jest.config.js',
    'vitest.config.ts',
    'turbo.json',
    'pnpm-workspace.yaml',
    'lerna.json',
    'nx.json',
    'docker-compose.yml',
    'Dockerfile',
    '.env.example',
    'pyproject.toml',
    'Cargo.toml',
    'go.mod',
    'Gemfile',
  ],
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              PATTERN DETECTORS
// ═══════════════════════════════════════════════════════════════════════════════════

/**
 * Pattern detection rules for common frameworks and conventions
 */
const PatternDetectors = {
  // State management patterns
  stateManagement: {
    'zustand': {
      patterns: [/import.*from ['"]zustand['"]/, /create\s*\(/],
      files: ['**/stores/**', '**/store/**'],
    },
    'redux': {
      patterns: [/import.*from ['"]@reduxjs\/toolkit['"]/, /createSlice\(/, /configureStore\(/],
      files: ['**/store/**', '**/slices/**', '**/reducers/**'],
    },
    'mobx': {
      patterns: [/import.*from ['"]mobx['"]/, /@observable/, /@action/],
      files: ['**/stores/**'],
    },
    'vuex': {
      patterns: [/import.*from ['"]vuex['"]/, /createStore\(/],
      files: ['**/store/**'],
    },
    'pinia': {
      patterns: [/import.*from ['"]pinia['"]/, /defineStore\(/],
      files: ['**/stores/**'],
    },
    'context-api': {
      patterns: [/createContext\(/, /useContext\(/],
      files: ['**/contexts/**', '**/context/**'],
    },
  },

  // API patterns
  apiPatterns: {
    'fetch-wrapper': {
      patterns: [/export.*fetch/, /async.*fetch\(/],
      files: ['**/lib/api.*', '**/utils/api.*', '**/services/api.*'],
    },
    'axios': {
      patterns: [/import.*from ['"]axios['"]/, /axios\.create\(/],
      files: ['**/lib/axios.*', '**/services/**'],
    },
    'react-query': {
      patterns: [/import.*from ['"]@tanstack\/react-query['"]/, /useQuery\(/, /useMutation\(/],
      files: ['**/hooks/**', '**/queries/**'],
    },
    'swr': {
      patterns: [/import.*from ['"]swr['"]/, /useSWR\(/],
      files: ['**/hooks/**'],
    },
    'trpc': {
      patterns: [/import.*from ['"]@trpc\//, /trpc\.router\(/],
      files: ['**/trpc/**', '**/server/routers/**'],
    },
    'graphql': {
      patterns: [/import.*from ['"]@apollo\/client['"]/, /gql`/, /useQuery\(/],
      files: ['**/graphql/**', '**/*.graphql'],
    },
  },

  // Testing patterns
  testingPatterns: {
    'jest': {
      patterns: [/describe\(/, /it\(/, /test\(/, /expect\(/],
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    'vitest': {
      patterns: [/import.*from ['"]vitest['"]/, /vi\.fn\(/],
      files: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*'],
    },
    'rea
```