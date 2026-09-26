# COMANDO - registry-healer.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\ids\registry-healer.js
**SHA:** 8e68b00f5291b793
**Timestamp:** 2026-08-28T02:01:59.368632
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param {boolean} [options.dryRun=false] - Report what would be healed without modifying
- const { autoOnly = true, dryRun = false } = options;

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
'use strict';

/**
 * Registry Healer - Self-Healing Data Integrity
 *
 * Detects and auto-fixes data integrity issues in the entity registry:
 * - Missing files (CRITICAL, non-auto-healable)
 * - Checksum mismatches (HIGH, auto-healable)
 * - Orphaned usedBy references (MEDIUM, auto-healable)
 * - Orphaned dependency references (MEDIUM, auto-healable)
 * - Missing keywords (LOW, auto-healable)
 * - Stale lastVerified timestamps (LOW, auto-healable)
 *
 * @module core/ids/registry-healer
 * @version 1.0.0
 * @story IDS-4a (Self-Healing Registry: Data Integrity)
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const crypto = require('crypto');

const { RegistryLoader } = require(path.resolve(__dirname, 'registry-loader.js'));
const {
  computeChecksum,
  extractKeywords,
  REPO_ROOT,
  REGISTRY_PATH,
} = require(path.resolve(__dirname, '../../development/scripts/populate-entity-registry.js'));

// ─── Constants ─────────────────────────────────────────────────────

const HEALING_LOG_PATH = path.resolve(REPO_ROOT, '.aios-core/data/registry-healing-log.jsonl');
const HEALING_BACKUP_DIR = path.resolve(REPO_ROOT, '.aios-core/data/registry-backups/healing');
const MAX_HEALING_LOG_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_BACKUPS = 10;
const STALE_DAYS_THRESHOLD = 7;

const SEVERITY_ORDER = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

// ─── Healing Rules Configuration ───────────────────────────────────

const HEALING_RULES = [
  {
    id: 'missing-file',
    description: 'Referenced file does not exist on disk',
    severity: 'critical',
    autoHealable: false,
    manualAction: 'Verify file location or remove entity from registry',
  },
  {
    id: 'checksum-mismatch',
    description: 'File content changed since last verification',
    severity: 'high',
    autoHealable: true,
  },
  {
    id: 'orphaned-usedBy',
    description: 'usedBy reference points to non-existent entity',
    severity: 'medium',
    autoHealable: true,
  },
  {
    id: 'orphaned-dependency',
    description: 'dependency reference points to non-existent entity',
    severity: 'medium',
    autoHealable: true,
  },
  {
    id: 'missing-keywords',
    description: 'Entity has no keywords for searchability',
    severity: 'low',
    autoHealable: true,
  },
  {
    id: 'stale-verification',
    description: `Entity not verified in over ${STALE_DAYS_THRESHOLD} days`,
    severity: 'low',
    autoHealable: true,
  },
];

// ─── Helper Functions ──────────────────────────────────────────────

/**
 * Calculate the number of days since a given ISO date string.
 * @param {string|undefined} dateStr - ISO date string
 * @returns {number} Days elapsed (Infinity if no date)
 */
function daysSince(dateStr) {
  if (!dateStr) return Infinity;
  const then = new Date(dateStr).getTime();
  if (isNaN(then)) return Infinity;
  return (Date.now() - then) / (1000 * 60 * 60 * 24);
}

/**
 * Build a flat map of all entity IDs from the registry's nested structure.
 * Returns { entityId: { category, ...entityData } }
 * @param {object} entities - Registry entities (nested by category)
 * @returns {Map<string, object>} Flat map entityId -> entity data
 */
function buildEntityIndex(entities) {
  const index = new Map();
  if (!entities) return index;

  for (const [category, categoryEntities] of Object.entries(entities)) {
    if (!categoryEntities || typeof categoryEntities !== 'object') continue;
    for (const [entityId, entityData] of Object.entries(categoryEntities)) {
      index.set(entityId, { ...entityData, _category: category, _entityId: entityId });
    }
  }
  return index;
}

// ─── RegistryHealer Class ──────────────────────────────────────────

class RegistryHealer {
  /**
   * @param {object} options
   * @param {string} [options.registryPath] - Path to entity-registry.yaml
   * @param {string} [options.repoRoot] - Repository root
   * @param {string} [options.healingLogPath] - Path to healing log
   * @param {string} [options.backupDir] - Path to healing backup directory
   */
  constructor(options = {}) {
    this._registryPath = options.registryPath || REGISTRY_PATH;
    this._repoRoot = options.repoRoot || REPO_ROOT;
    this._healingLogPath = options.healingLogPath || HEALING_LOG_PATH;
    this._backupDir = options.backupDir || HEALING_BACKUP_DIR;
    this._loader = new RegistryLoader(this._registryPath);
    this._notificationManager = null;
  }

  /**
   * Lazy-load the NotificationManager to avoid hard dependency failures.
   * @returns {object|null} NotificationManager instance or null
   */
  _getNotificationManager() {
    if (this._notificationManager !== undefined && this._notificationManager !== null) {
      return this._notificationManager;
    }
    try {
      const { NotificationManager } = require(
        path.resolve(__dirname, '../quality-gates/notification-manager.js'),
      );
      this._notificationManager = new NotificationManager({
        channel
```