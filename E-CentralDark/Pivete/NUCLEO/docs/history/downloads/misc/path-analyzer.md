# OUTRO - path-analyzer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\path-analyzer.js
**SHA:** e0bb41724b45c511
**Timestamp:** 2026-08-28T02:02:13.497852
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern: /`\.aios-core\/[^`]+`/g, type: 'code-ref' },
- { pattern: /tasks\/([a-z0-9-]+)\.md/gi, type: 'task' },
- { pattern: /templates\/([a-z0-9-]+)\.(yaml|yml|md)/gi, type: 'template' },
- { pattern: /checklists\/([a-z0-9-]+)\.md/gi, type: 'checklist' },
- { pattern: /scripts\/([a-z0-9-]+)\.js/gi, type: 'script' },
- { pattern: /data\/([a-z0-9-]+)\.(md|yaml|yml|json)/gi, type: 'data' },
- { pattern: /schemas\/([a-z0-9-]+)\.(json|js)/gi, type: 'schema' },
- { pattern: /^\s+-\s+([a-z0-9-]+\.(?:md|yaml|yml|js))$/gim, type: 'dependency-item' },

### Gaps
- lines.push(`     └─ Missing: ${ref.reference} (type: ${ref.type})`);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * AIOS Path Analyzer
 * Story 2.2: Analyzes dependencies between assets and detects broken references
 *
 * Usage:
 *   node path-analyzer.js [--verbose] [--json] [--fix] [--output path]
 *
 * @module path-analyzer
 */

const fs = require('fs').promises;
const path = require('path');

// Reference patterns to detect
const REFERENCE_PATTERNS = [
  // Markdown code refs to .aios-core
  { pattern: /`\.aios-core\/[^`]+`/g, type: 'code-ref' },
  // Task references
  { pattern: /tasks\/([a-z0-9-]+)\.md/gi, type: 'task' },
  // Template references (yaml, yml, md)
  { pattern: /templates\/([a-z0-9-]+)\.(yaml|yml|md)/gi, type: 'template' },
  // Checklist references
  { pattern: /checklists\/([a-z0-9-]+)\.md/gi, type: 'checklist' },
  // Script references
  { pattern: /scripts\/([a-z0-9-]+)\.js/gi, type: 'script' },
  // Data file references
  { pattern: /data\/([a-z0-9-]+)\.(md|yaml|yml|json)/gi, type: 'data' },
  // Schema references
  { pattern: /schemas\/([a-z0-9-]+)\.(json|js)/gi, type: 'schema' },
  // Direct file paths in dependencies section
  { pattern: /^\s+-\s+([a-z0-9-]+\.(?:md|yaml|yml|js))$/gim, type: 'dependency-item' },
];

// Asset directories for path resolution
const ASSET_DIRS = {
  task: '.aios-core/development/tasks',
  template: '.aios-core/product/templates',
  checklist: '.aios-core/product/checklists',
  script: '.aios-core/infrastructure/scripts',
  data: '.aios-core/development/data',
  schema: '.aios-core/schemas',
  agent: '.aios-core/development/agents',
};

/**
 * Find all files to analyze
 */
async function findFilesToAnalyze(rootPath) {
  const files = [];
  const dirsToScan = [
    { dir: '.aios-core/development/agents', type: 'agent' },
    { dir: '.aios-core/development/tasks', type: 'task' },
    { dir: '.aios-core/product/templates', type: 'template' },
    { dir: '.aios-core/product/checklists', type: 'checklist' },
  ];

  for (const { dir, type } of dirsToScan) {
    const fullDir = path.join(rootPath, dir);
    try {
      const entries = await fs.readdir(fullDir);
      for (const entry of entries) {
        if (entry.endsWith('.md') || entry.endsWith('.yaml') || entry.endsWith('.yml')) {
          files.push({
            path: path.join(dir, entry),
            fullPath: path.join(fullDir, entry),
            type,
          });
        }
      }
    } catch (e) {
      // Directory doesn't exist
    }
  }

  return files;
}

/**
 * Extract references from file content
 */
function extractReferences(content, filePath) {
  const references = [];

  for (const { pattern, type } of REFERENCE_PATTERNS) {
    // Reset regex
    pattern.lastIndex = 0;

    let match;
    while ((match = pattern.exec(content)) !== null) {
      const fullMatch = match[0];
      let refName = match[1] || fullMatch;

      // Clean up the reference
      refName = refName.replace(/^`|`$/g, '');

      // Skip if it's a self-reference
      if (refName === path.basename(filePath)) continue;

      references.push({
        type,
        reference: refName,
        fullMatch,
        position: match.index,
      });
    }
  }

  return references;
}

/**
 * Resolve reference to actual file path
 */
function resolveReference(ref, rootPath) {
  // If it's a full path already
  if (ref.reference.startsWith('.aios-core/')) {
    return path.join(rootPath, ref.reference);
  }

  // If it's a dependency item (just filename)
  if (ref.type === 'dependency-item') {
    // Try to find in common locations
    const possibleDirs = Object.values(ASSET_DIRS);
    for (const dir of possibleDirs) {
      const fullPath = path.join(rootPath, dir, ref.reference);
      return fullPath; // Return first match attempt
    }
  }

  // Resolve based on type
  const dirMap = {
    task: ASSET_DIRS.task,
    template: ASSET_DIRS.template,
    checklist: ASSET_DIRS.checklist,
    script: ASSET_DIRS.script,
    data: ASSET_DIRS.data,
    schema: ASSET_DIRS.schema,
  };

  const baseDir = dirMap[ref.type];
  if (baseDir) {
    // Extract just the filename if it includes directory
    const filename = ref.reference.includes('/') ? path.basename(ref.reference) : ref.reference;
    return path.join(rootPath, baseDir, filename);
  }

  return null;
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Analyze a single file
 */
async function analyzeFile(file, rootPath) {
  const content = await fs.readFile(file.fullPath, 'utf-8');
  const references = extractReferences(content, file.path);

  const analysis = {
    file: file.path,
    type: file.type,
    references: [],
    brokenReferences: [],
    validReferences: [],
  };

  for (const ref of references) {
    const resolvedPath = resolveReference(ref, rootPath);

    if (resolvedPath) {
      const exists = await fileExists(resolvedPath);
      const relativePath = path.relative(rootPath, resolvedPath);

      const refInfo = {
  
```