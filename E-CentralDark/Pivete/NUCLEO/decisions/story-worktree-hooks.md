# DECISAO - story-worktree-hooks.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\story-worktree-hooks.js
**SHA:** 8c45c7bb4993d54f
**Timestamp:** 2026-08-28T02:02:14.286485
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * - onStoryStart: Auto-creates worktree when story moves to "In Progress"

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node

/**
 * Story-Worktree Integration Hooks
 * Story 1.4: Integrates WorktreeManager with story lifecycle
 *
 * Hooks:
 * - onStoryStart: Auto-creates worktree when story moves to "In Progress"
 * - onStoryDone: Offers merge or cleanup when story moves to "Done"
 *
 * @module story-worktree-hooks
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// Lazy load WorktreeManager to avoid circular deps
let WorktreeManager = null;

/**
 * Load configuration from core-config.yaml
 */
async function loadConfig(rootPath) {
  const configPath = path.join(rootPath, '.aios-core', 'core-config.yaml');
  try {
    const content = await fs.readFile(configPath, 'utf-8');
    return yaml.load(content);
  } catch (e) {
    return {};
  }
}

/**
 * Get worktree settings from config
 */
function getWorktreeSettings(config) {
  const defaults = {
    enabled: true,
    autoCreate: 'on_story_start', // on_story_start | manual | never
    autoCleanup: 'manual', // on_story_done | manual | never
    maxWorktrees: 10,
    staleDays: 30,
  };

  const settings = config?.autoClaude?.worktree || {};
  return { ...defaults, ...settings };
}

/**
 * Extract story ID from story file path or content
 */
function extractStoryId(storyPath, content) {
  // Try from filename first (e.g., story-1.4.md -> 1.4)
  const filenameMatch = path.basename(storyPath).match(/story[_-]?([\d.-]+)/i);
  if (filenameMatch) {
    return `story-${filenameMatch[1]}`;
  }

  // Try from content (e.g., # Story 1.4: Title)
  const contentMatch = content?.match(/^#\s*Story\s+([\d.]+)/im);
  if (contentMatch) {
    return `story-${contentMatch[1]}`;
  }

  // Fallback to sanitized filename
  return path.basename(storyPath, '.md').replace(/[^a-z0-9-]/gi, '-');
}

/**
 * Get story status from content
 */
function getStoryStatus(content) {
  const statusMatch = content.match(/\*\*Status:\*\*\s*([^\n]+)/i);
  if (statusMatch) {
    return statusMatch[1].trim().toLowerCase();
  }
  return 'unknown';
}

/**
 * Hook: Called when story moves to "In Progress"
 *
 * @param {string} rootPath - Project root
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Hook options
 * @returns {Promise<Object>} Result with worktree info or skip reason
 */
async function onStoryStart(rootPath, storyPath, options = {}) {
  const config = await loadConfig(rootPath);
  const settings = getWorktreeSettings(config);

  // Check if worktree auto-creation is enabled
  if (!settings.enabled) {
    return { skipped: true, reason: 'Worktree feature disabled in config' };
  }

  if (settings.autoCreate === 'never') {
    return { skipped: true, reason: 'autoCreate set to never' };
  }

  if (settings.autoCreate === 'manual' && !options.force) {
    return { skipped: true, reason: 'autoCreate set to manual (use --force to override)' };
  }

  // Load WorktreeManager
  if (!WorktreeManager) {
    WorktreeManager = require('./worktree-manager');
  }

  const manager = new WorktreeManager(rootPath, {
    maxWorktrees: settings.maxWorktrees,
    staleDays: settings.staleDays,
  });

  // Read story to get ID
  const content = await fs.readFile(storyPath, 'utf-8');
  const storyId = extractStoryId(storyPath, content);

  // Check if worktree already exists
  const exists = await manager.exists(storyId);
  if (exists) {
    const existing = await manager.get(storyId);
    return {
      skipped: true,
      reason: 'Worktree already exists',
      warning: true,
      worktree: existing,
    };
  }

  // Create worktree
  try {
    const worktree = await manager.create(storyId);
    return {
      success: true,
      action: 'created',
      storyId,
      worktree,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      storyId,
    };
  }
}

/**
 * Hook: Called when story moves to "Done"
 *
 * @param {string} rootPath - Project root
 * @param {string} storyPath - Path to story file
 * @param {Object} options - Hook options
 * @returns {Promise<Object>} Result with available actions
 */
async function onStoryDone(rootPath, storyPath, options = {}) {
  const config = await loadConfig(rootPath);
  const settings = getWorktreeSettings(config);

  if (!settings.enabled) {
    return { skipped: true, reason: 'Worktree feature disabled in config' };
  }

  // Load WorktreeManager
  if (!WorktreeManager) {
    WorktreeManager = require('./worktree-manager');
  }

  const manager = new WorktreeManager(rootPath, {
    maxWorktrees: settings.maxWorktrees,
    staleDays: settings.staleDays,
  });

  // Read story to get ID
  const content = await fs.readFile(storyPath, 'utf-8');
  const storyId = extractStoryId(storyPath, content);

  // Check if worktree exists
  const exists = await manager.exists(storyId);
  if (!exists) {
    return {
      skipped: true,
      reason: 'No worktree found for this story',
      storyId,
    };
  }

  const worktree = await manager.get(storyId);

```