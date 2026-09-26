# COMANDO - semantic-merge-engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\execution\semantic-merge-engine.js
**SHA:** 548e79289ee4ccc0
**Timestamp:** 2026-08-28T02:01:56.495844
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const prompt = this.buildMergePrompt(conflict, context);
- this.dryRun = config.dryRun || false;

### Padroes
- const regexPattern = pattern

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Semantic Merge Engine
 * Story 8.3 - Enhanced Implementation
 *
 * AI-powered semantic merge system for resolving conflicts between
 * parallel agent work. Analyzes code at semantic level (functions, imports,
 * classes) rather than line-by-line to enable intelligent merge resolution.
 *
 * Architecture:
 * 1. SemanticAnalyzer - Extracts semantic elements from code
 * 2. ConflictDetector - Detects conflicts using compatibility rules
 * 3. AutoMerger - Resolves simple conflicts deterministically
 * 4. AIResolver - Uses Claude for complex conflict resolution
 * 5. MergeOrchestrator - Coordinates the complete pipeline
 *
 * Based on Auto-Claude's merge system architecture.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const yaml = require('js-yaml');

// ============================================================================
// TYPES & ENUMS
// ============================================================================

const ChangeType = {
  IMPORT_ADDED: 'import_added',
  IMPORT_REMOVED: 'import_removed',
  IMPORT_MODIFIED: 'import_modified',
  FUNCTION_ADDED: 'function_added',
  FUNCTION_REMOVED: 'function_removed',
  FUNCTION_MODIFIED: 'function_modified',
  CLASS_ADDED: 'class_added',
  CLASS_REMOVED: 'class_removed',
  CLASS_MODIFIED: 'class_modified',
  VARIABLE_ADDED: 'variable_added',
  VARIABLE_REMOVED: 'variable_removed',
  VARIABLE_MODIFIED: 'variable_modified',
  JSX_ADDED: 'jsx_added',
  JSX_MODIFIED: 'jsx_modified',
  COMMENT_ADDED: 'comment_added',
  COMMENT_MODIFIED: 'comment_modified',
  STYLE_ADDED: 'style_added',
  STYLE_MODIFIED: 'style_modified',
  CONFIG_MODIFIED: 'config_modified',
  UNKNOWN: 'unknown',
};

const MergeStrategy = {
  COMBINE: 'combine', // Both changes can coexist
  TAKE_NEWER: 'take_newer', // Take the more recent change
  TAKE_LARGER: 'take_larger', // Take the more comprehensive change
  AI_REQUIRED: 'ai_required', // Needs AI to resolve
  HUMAN_REQUIRED: 'human_required', // Too complex, needs human
};

const ConflictSeverity = {
  LOW: 'low', // Auto-mergeable
  MEDIUM: 'medium', // AI can likely resolve
  HIGH: 'high', // AI required with review
  CRITICAL: 'critical', // Human intervention required
};

const MergeDecision = {
  AUTO_MERGED: 'auto_merged',
  AI_MERGED: 'ai_merged',
  NEEDS_HUMAN_REVIEW: 'needs_human_review',
  FAILED: 'failed',
};

// ============================================================================
// SEMANTIC ANALYZER
// ============================================================================

class SemanticAnalyzer {
  constructor() {
    this.patterns = {
      // JavaScript/TypeScript patterns
      jsImport:
        /^(?:import\s+(?:(?:\{[^}]*\}|\*\s+as\s+\w+|\w+)(?:\s*,\s*)?)+\s+from\s+['"][^'"]+['"]|import\s+['"][^'"]+['"])/gm,
      jsFunction:
        /(?:(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[^=])\s*=>|(\w+)\s*:\s*(?:async\s+)?(?:function|\([^)]*\)\s*=>))/gm,
      jsClass: /(?:export\s+)?class\s+(\w+)(?:\s+extends\s+\w+)?/gm,
      jsVariable: /(?:export\s+)?(?:const|let|var)\s+(\w+)\s*=/gm,

      // JSX patterns
      jsxComponent: /<(\w+)(?:\s[^>]*)?\/?>/gm,

      // Python patterns
      pyImport: /^(?:from\s+\S+\s+import\s+.+|import\s+.+)$/gm,
      pyFunction: /^(?:async\s+)?def\s+(\w+)\s*\(/gm,
      pyClass: /^class\s+(\w+)(?:\([^)]*\))?:/gm,

      // CSS patterns
      cssSelector: /^([.#]?\w[\w-]*(?:\s*[,>+~]\s*[.#]?\w[\w-]*)*)\s*\{/gm,
      cssProperty: /^\s*([\w-]+)\s*:/gm,
    };
  }

  /**
   * Analyze semantic differences between two versions of a file
   * @param {string} filePath - Path to file
   * @param {string} before - Content before changes
   * @param {string} after - Content after changes
   * @param {string} taskId - Task identifier
   * @returns {Object} FileAnalysis with semantic changes
   */
  analyzeDiff(filePath, before, after, taskId = null) {
    const ext = path.extname(filePath).toLowerCase();
    const language = this.detectLanguage(ext);

    const beforeElements = this.extractElements(before, language);
    const afterElements = this.extractElements(after, language);

    const changes = this.computeChanges(beforeElements, afterElements, language);

    return {
      filePath,
      taskId,
      language,
      changes,
      functionsModified: changes
        .filter((c) => c.changeType.includes('function'))
        .map((c) => c.target),
      functionsAdded: changes
        .filter((c) => c.changeType === ChangeType.FUNCTION_ADDED)
        .map((c) => c.target),
      importsAdded: changes
        .filter((c) => c.changeType === ChangeType.IMPORT_ADDED)
        .map((c) => c.target),
      totalLinesChanged: this.countChangedLines(before, after),
    };
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(ext) {
    const languageMap = {
      '.js': 'javascript',
  
```