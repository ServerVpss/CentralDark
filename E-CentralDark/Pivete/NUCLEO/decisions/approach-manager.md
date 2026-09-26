# DECISAO - approach-manager.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\approach-manager.js
**SHA:** 5b55493c14debde4
**Timestamp:** 2026-08-28T02:02:12.347776
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: decision,

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Approach Manager
 *
 * Story: 5.3 - Current Approach Tracker
 * Epic: Epic 5 - Recovery & Learning System
 *
 * Manages current approach tracking for implementation attempts.
 * Enables stuck detection comparison and suggests alternatives.
 *
 * Features:
 * - AC1: recovery/current-approach.md updated before each attempt
 * - AC2: Documents approach summary, key decisions, files being modified
 * - AC3: Referenced by stuck detection for comparison
 * - AC4: Cleaned automatically after success
 * - AC5: Used to suggest alternatives when stuck
 * - AC6: Template structured for consistency
 * - AC7: History maintained in approach-history.json
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
  // AC6: Template file location
  templatePath: '.aios-core/product/templates/current-approach-tmpl.md',
  // AC1: Current approach file name
  currentApproachFile: 'current-approach.md',
  // AC7: History file name
  historyFile: 'approach-history.json',
  // Recovery directory name
  recoveryDir: 'recovery',
  // Maximum history entries per subtask
  maxHistoryPerSubtask: 10,
};

// ═══════════════════════════════════════════════════════════════════════════════════
//                              APPROACH MANAGER CLASS
// ═══════════════════════════════════════════════════════════════════════════════════

class ApproachManager {
  /**
   * Create a new ApproachManager instance
   *
   * @param {Object} options - Configuration options
   * @param {string} options.storyId - Story ID (e.g., 'STORY-42')
   * @param {string} [options.recoveryPath] - Custom recovery directory path
   * @param {string} [options.rootPath] - Project root path (defaults to cwd)
   */
  constructor(options) {
    if (!options?.storyId) {
      throw new Error('storyId is required');
    }

    this.storyId = options.storyId;
    this.rootPath = options.rootPath || process.cwd();

    // AC1: Set recovery path
    if (options.recoveryPath) {
      this.recoveryPath = path.isAbsolute(options.recoveryPath)
        ? options.recoveryPath
        : path.join(this.rootPath, options.recoveryPath);
    } else {
      this.recoveryPath = path.join(
        this.rootPath,
        'docs/stories',
        this.storyId,
        CONFIG.recoveryDir
      );
    }

    // File paths
    this.currentApproachPath = path.join(this.recoveryPath, CONFIG.currentApproachFile);
    this.historyPath = path.join(this.recoveryPath, CONFIG.historyFile);
    this.templatePath = path.join(this.rootPath, CONFIG.templatePath);

    // In-memory cache
    this._currentApproaches = new Map();
    this._history = null;
  }

  /**
   * Initialize recovery directory structure
   * @private
   */
  async _ensureRecoveryDir() {
    if (!fs.existsSync(this.recoveryPath)) {
      await fsPromises.mkdir(this.recoveryPath, { recursive: true });
    }
  }

  /**
   * Load template file
   * @private
   * @returns {string} Template content
   */
  _loadTemplate() {
    if (fs.existsSync(this.templatePath)) {
      return fs.readFileSync(this.templatePath, 'utf-8');
    }

    // Fallback template if file not found
    return `# Current Approach: Subtask {{subtaskId}}

## Summary
{{approach_summary}}

## Key Decisions
{{#each decisions}}
- {{this}}
{{/each}}

## Files Being Modified
{{#each files}}
- \`{{this.path}}\` ({{this.action}})
{{/each}}

## Expected Challenges
{{#each expectedChallenges}}
- {{this}}
{{/each}}

## Started At
{{startedAt}}

## Attempt Number
{{attemptNumber}}
`;
  }

  /**
   * Simple template rendering (Handlebars-like syntax)
   * @private
   * @param {string} template - Template string
   * @param {Object} data - Data to render
   * @returns {string} Rendered content
   */
  _renderTemplate(template, data) {
    let result = template;

    // Handle simple placeholders {{key}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      if (data[key] !== undefined) {
        return String(data[key]);
      }
      return match;
    });

    // Handle {{#each array}}...{{/each}} blocks
    result = result.replace(
      /\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g,
      (match, arrayKey, itemTemplate) => {
        const array = data[arrayKey];
        if (!Array.isArray(array) || array.length === 0) {
          return '- (none specified)';
        }

        return array
          .map((item) => {
            if (typeof item === 'string') {
              return itemTemplate.replace(/\{\{this\}\}/g, item).trim();
            }
            // Handle object items
            let rendered = itemTemplate;
            for (const [key, value] of Object.entries(item)) {
              rendered
```