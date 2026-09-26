# PADRAO - pattern-extractor.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\pattern-extractor.js
**SHA:** 3d5f5d45f5bc88e8
**Timestamp:** 2026-08-28T02:02:13.477744
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = this._extractZustandPersistPattern(content, file);
- const pattern = this._extractZustandPattern(content, file);
- const pattern = this._extractReduxSlicePattern(content, file);
- const pattern = this._extractContextPattern(content, file);
- lines.push(`**Files using this pattern:** ${pattern.filesUsing.join(', ')}`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Pattern Extractor
 * Story 7.3: Extracts and documents code patterns from the codebase
 *
 * Analyzes code via AST and regex to detect common patterns,
 * generating a patterns.md file for reference by agents (especially Spec Writer).
 *
 * Usage:
 *   node pattern-extractor.js [command] [options]
 *
 * Commands:
 *   extract         Extract patterns (default)
 *   json            Output as JSON
 *   save            Save to .aios/patterns.md
 *   merge           Merge with existing patterns
 *
 * Options:
 *   --root <path>   Project root (default: cwd)
 *   --output <path> Custom output path
 *   --category <c>  Extract specific category only
 *   --quiet         Suppress output
 *   --help          Show this help message
 *
 * @module pattern-extractor
 */

const fs = require('fs').promises;
const path = require('path');

// Pattern categories
const PATTERN_CATEGORIES = {
  STATE_MANAGEMENT: 'State Management',
  API_CALLS: 'API Calls',
  ERROR_HANDLING: 'Error Handling',
  COMPONENTS: 'Components',
  DATA_ACCESS: 'Data Access',
  TESTING: 'Testing',
  HOOKS: 'Hooks',
  UTILITIES: 'Utilities',
};

// File extensions to analyze
const CODE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'];

// Directories to exclude from scanning
const EXCLUDED_DIRS = [
  'node_modules',
  '.git',
  'dist',
  'build',
  'coverage',
  '.next',
  '.nuxt',
  'tmp',
  'temp',
  '__pycache__',
  '.aios/migration-backup',
];

/**
 * Pattern Extractor Class
 * Scans codebase and extracts common patterns
 */
class PatternExtractor {
  constructor(rootPath, options = {}) {
    this.rootPath = rootPath || process.cwd();
    this.options = options;
    this.patterns = new Map();
    this.fileCache = new Map();
    this.detectedPatterns = [];
  }

  // =============================================================================
  // File Scanning
  // =============================================================================

  /**
   * Scan files with specific extensions
   * @param {string[]} extensions - File extensions to scan
   * @returns {Promise<string[]>} List of file paths
   */
  async scanFiles(extensions = CODE_EXTENSIONS) {
    const files = [];
    await this._walkDirectory(this.rootPath, files, extensions);
    return files;
  }

  /**
   * Walk directory recursively
   * @private
   */
  async _walkDirectory(dir, files, extensions) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        // Skip excluded directories
        if (entry.isDirectory()) {
          if (EXCLUDED_DIRS.includes(entry.name) || entry.name.startsWith('.')) {
            continue;
          }
          await this._walkDirectory(fullPath, files, extensions);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      // Directory not accessible
    }
  }

  /**
   * Read and cache file content
   * @param {string} filePath - Path to file
   * @returns {Promise<string>} File content
   */
  async readFile(filePath) {
    if (this.fileCache.has(filePath)) {
      return this.fileCache.get(filePath);
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      this.fileCache.set(filePath, content);
      return content;
    } catch (error) {
      return null;
    }
  }

  // =============================================================================
  // Pattern Detection
  // =============================================================================

  /**
   * Detect all patterns in the codebase
   * @returns {Promise<Object>} Detected patterns
   */
  async detectPatterns() {
    const files = await this.scanFiles();
    const allPatterns = {};

    // Initialize categories
    for (const category of Object.values(PATTERN_CATEGORIES)) {
      allPatterns[category] = [];
    }

    // Run all detection methods
    const detectors = [
      this.detectStatePatterns.bind(this),
      this.detectAPIPatterns.bind(this),
      this.detectErrorHandlingPatterns.bind(this),
      this.detectComponentPatterns.bind(this),
      this.detectHookPatterns.bind(this),
      this.detectDataAccessPatterns.bind(this),
      this.detectTestingPatterns.bind(this),
      this.detectUtilityPatterns.bind(this),
    ];

    for (const detector of detectors) {
      const patterns = await detector(files);
      for (const pattern of patterns) {
        if (allPatterns[pattern.category]) {
          // Check for duplicates
          const exists = allPatterns[pattern.category].some(
            (p) => p.name === pattern.name
          );
          if (!exists) {
            allPatterns[pattern.category].push(pattern);
          }
        }
      }
    }

    this.detectedPatterns = allPatterns;
    return allPatterns
```