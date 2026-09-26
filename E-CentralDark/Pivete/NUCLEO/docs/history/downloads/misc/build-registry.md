# OUTRO - build-registry.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\registry\build-registry.js
**SHA:** cf1b56fb98a0fa67
**Timestamp:** 2026-08-28T02:02:00.748649
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: '.aios-core/development/tasks/**/*.md',
- pattern: '.aios-core/product/templates/**/*.md',
- pattern: '.aios-core/infrastructure/scripts/**/*.js',
- pattern: '.aios-core/product/checklists/**/*.md',
- pattern: '.aios-core/development/workflows/**/*.yaml',
- pattern: '.aios-core/core/data/**/*.md',
- pattern: '.aios-core/core/data/**/*.yaml',

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Service Registry Builder
 *
 * Scans AIOS modules and builds the service registry JSON file.
 * Extracts metadata from tasks, templates, scripts, checklists, and workflows.
 *
 * @module build-registry
 * @version 1.0.0
 * @created Story 2.6 - Service Registry Creation
 */

const fs = require('fs').promises;
const path = require('path');
const { glob } = require('glob');

// Registry version
const REGISTRY_VERSION = '1.0.0';

// Source directories to scan
const SCAN_SOURCES = [
  {
    pattern: '.aios-core/development/tasks/**/*.md',
    category: 'task',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: (filePath) => {
      const parts = filePath.split('/');
      const filename = parts[parts.length - 1];
      // Extract agent prefix (e.g., dev-, qa-, po-)
      const prefixMatch = filename.match(/^([a-z]+)-/);
      if (prefixMatch) {
        return prefixMatch[1];
      }
      // Extract db- prefix for database tasks
      if (filename.startsWith('db-')) {
        return 'database';
      }
      // Check for specific keywords
      if (filename.includes('create')) return 'creation';
      if (filename.includes('modify') || filename.includes('edit')) return 'modification';
      if (filename.includes('audit') || filename.includes('validate')) return 'validation';
      if (filename.includes('analyze')) return 'analysis';
      return 'general';
    },
  },
  {
    pattern: '.aios-core/product/templates/**/*.md',
    category: 'template',
    taskFormat: 'TEMPLATE',
    subcategoryExtractor: (filePath) => {
      if (filePath.includes('ide-rules')) return 'ide-rules';
      if (filePath.includes('personalized')) return 'personalized';
      return 'document';
    },
  },
  {
    pattern: '.aios-core/infrastructure/scripts/**/*.js',
    category: 'script',
    taskFormat: 'SCRIPT',
    subcategoryExtractor: (filePath) => {
      const filename = path.basename(filePath, '.js');
      if (filename.includes('validator') || filename.includes('checker')) return 'validation';
      if (filename.includes('analyzer')) return 'analysis';
      if (filename.includes('generator')) return 'generation';
      if (filename.includes('manager')) return 'management';
      if (filename.includes('config') || filename.includes('loader')) return 'configuration';
      if (filename.includes('test')) return 'testing';
      return 'utility';
    },
    skipArchived: true,
  },
  {
    pattern: '.aios-core/product/checklists/**/*.md',
    category: 'checklist',
    taskFormat: 'CHECKLIST',
    subcategoryExtractor: () => 'quality',
  },
  {
    pattern: '.aios-core/development/workflows/**/*.yaml',
    category: 'workflow',
    taskFormat: 'WORKFLOW',
    subcategoryExtractor: (filePath) => {
      const filename = path.basename(filePath, '.yaml');
      if (filename.includes('brownfield')) return 'brownfield';
      if (filename.includes('greenfield')) return 'greenfield';
      return 'general';
    },
  },
  {
    pattern: '.aios-core/core/data/**/*.md',
    category: 'data',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: () => 'knowledge',
  },
  {
    pattern: '.aios-core/core/data/**/*.yaml',
    category: 'data',
    taskFormat: 'TASK-FORMAT-V1',
    subcategoryExtractor: () => 'configuration',
  },
];

/**
 * Convert filename to kebab-case ID
 */
function toKebabId(filename) {
  return filename
    .replace(/\.(md|js|yaml|yml)$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Convert kebab-case to title case
 */
function toTitleCase(kebab) {
  return kebab
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Extract description from markdown file (first paragraph)
 */
async function extractMarkdownDescription(filePath, baseDir) {
  try {
    const fullPath = path.join(baseDir, filePath);
    const content = await fs.readFile(fullPath, 'utf8');
    const lines = content.split('\n');

    // Find first non-empty, non-header line
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('---')) {
        // Clean up markdown formatting
        return trimmed
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/`/g, '')
          .slice(0, 200);
      }
    }
    return 'No description available';
  } catch (_error) {
    return 'No description available';
  }
}

/**
 * Extract description from JS file (JSDoc or first comment)
 */
async function extractJSDescription(filePath, baseDir) {
  try {
    const fullPath = path.join(baseDir, filePath);
    const content = await fs.readFile(fullPath, 'utf8');

    // Look for JSDoc @description or first line after /**
    const jsdocMatch = content.match(/\/\*\*[\s\S]*?\*\//);
    if (jsdocMatch) {
      const jsdoc = jsdocMatch[0];
      // Extract description
      const descMatch = jsdoc.match(/@description\s+(.+?)(?=\n\s*\*\s*@|\*\/)/s);
      i
```