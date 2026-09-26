# OUTRO - populate-entity-registry.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\populate-entity-registry.js
**SHA:** 836f1261d296a949
**Timestamp:** 2026-08-28T02:02:03.956744
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const globPattern = path.posix.join(absBase.replace(/\\/g, '/'), config.glob);

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const fg = require('fast-glob');
const crypto = require('crypto');

const REPO_ROOT = path.resolve(__dirname, '../../..');
const REGISTRY_PATH = path.resolve(__dirname, '../../data/entity-registry.yaml');

const SCAN_CONFIG = [
  { category: 'tasks', basePath: '.aios-core/development/tasks', glob: '**/*.md', type: 'task' },
  { category: 'templates', basePath: '.aios-core/product/templates', glob: '**/*.{yaml,yml,md}', type: 'template' },
  { category: 'scripts', basePath: '.aios-core/development/scripts', glob: '**/*.{js,mjs}', type: 'script' },
  { category: 'modules', basePath: '.aios-core/core', glob: '**/*.{js,mjs}', type: 'module' },
  { category: 'agents', basePath: '.aios-core/development/agents', glob: '**/*.{md,yaml,yml}', type: 'agent' },
  { category: 'checklists', basePath: '.aios-core/development/checklists', glob: '**/*.md', type: 'checklist' },
  { category: 'data', basePath: '.aios-core/data', glob: '**/*.{yaml,yml,md}', type: 'data' }
];

const ADAPTABILITY_DEFAULTS = {
  agent: 0.3,
  module: 0.4,
  template: 0.5,
  checklist: 0.6,
  data: 0.5,
  script: 0.7,
  task: 0.8
};

function computeChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return 'sha256:' + crypto.createHash('sha256').update(content).digest('hex');
}

function extractEntityId(filePath) {
  return path.basename(filePath, path.extname(filePath));
}

function extractKeywords(filePath, content) {
  const name = path.basename(filePath, path.extname(filePath));
  const parts = name.split(/[-_.]/g).filter((p) => p.length > 1);

  const headerMatch = content.match(/^#\s+(.+)/m);
  if (headerMatch) {
    const headerWords = headerMatch[1]
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !['the', 'and', 'for', 'with', 'this', 'that', 'from'].includes(w));
    parts.push(...headerWords.slice(0, 5));
  }

  return [...new Set(parts.map((p) => p.toLowerCase()))];
}

function extractPurpose(content, filePath) {
  const purposeMatch = content.match(/^##\s*Purpose\s*\n+([\s\S]*?)(?=\n##|\n---|\n$)/im);
  if (purposeMatch) {
    return purposeMatch[1].trim().split('\n')[0].substring(0, 200);
  }

  const descMatch = content.match(/(?:description|purpose|summary)[:]\s*(.+)/i);
  if (descMatch) {
    return descMatch[1].trim().substring(0, 200);
  }

  const headerMatch = content.match(/^#\s+(.+)/m);
  if (headerMatch) {
    return headerMatch[1].trim().substring(0, 200);
  }

  return `Entity at ${path.relative(REPO_ROOT, filePath)}`;
}

function detectDependencies(content, entityId) {
  const deps = new Set();

  const requireMatches = content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g);
  for (const m of requireMatches) {
    const reqPath = m[1];
    if (reqPath.startsWith('.') || reqPath.startsWith('/')) {
      const base = path.basename(reqPath, path.extname(reqPath));
      if (base !== entityId) deps.add(base);
    }
  }

  const importMatches = content.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g);
  for (const m of importMatches) {
    const impPath = m[1];
    if (impPath.startsWith('.') || impPath.startsWith('/')) {
      const base = path.basename(impPath, path.extname(impPath));
      if (base !== entityId) deps.add(base);
    }
  }

  const depListMatch = content.match(/dependencies:\s*\n((?:\s+-\s+.+\n)*)/);
  if (depListMatch) {
    const items = depListMatch[1].matchAll(/-\s+(.+)/g);
    for (const item of items) {
      const dep = item[1].trim().replace(/\.md$/, '');
      if (dep !== entityId) deps.add(dep);
    }
  }

  return [...deps];
}

function scanCategory(config) {
  const absBase = path.resolve(REPO_ROOT, config.basePath);

  if (!fs.existsSync(absBase)) {
    console.warn(`[IDS] Directory not found: ${config.basePath} — skipping`);
    return {};
  }

  const globPattern = path.posix.join(absBase.replace(/\\/g, '/'), config.glob);
  const files = fg.sync(globPattern, { onlyFiles: true, absolute: true });

  const entities = {};
  const seenIds = new Set();

  for (const filePath of files) {
    const entityId = extractEntityId(filePath);

    if (seenIds.has(entityId)) {
      console.warn(`[IDS] Duplicate entity ID "${entityId}" at ${path.relative(REPO_ROOT, filePath)} — skipping`);
      continue;
    }
    seenIds.add(entityId);

    let content = '';
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch {
      console.warn(`[IDS] Could not read ${filePath} — skipping`);
      continue;
    }

    const relPath = path.relative(REPO_ROOT, filePath).replace(/\\/g, '/');
    const keywords = extractKeywords(filePath, content);
    const purpose = extractPurpose(content, filePath);
    const dependencies = detectDependencies(content, entityId);
    const checksum = computeChecksum(filePath);
    const defaultScore = ADAPTABILITY_DEFAULTS[config.type] || 0.5;

    entities[entityId] = {
      path: relPath,
      t
```