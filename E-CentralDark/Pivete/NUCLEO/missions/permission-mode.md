# MISSAO - permission-mode.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\permissions\permission-mode.js
**SHA:** 793698141859d964
**Timestamp:** 2026-08-28T02:02:00.321272
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: false,
- execute: 'confirm',
- execute: true,
- mode.permissions.execute === true
- : mode.permissions.execute === 'confirm'

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Permission Mode System
 *
 * Controls agent autonomy level with 3 modes:
 * - explore: Read-only, safe exploration
 * - ask: Confirm before changes (default)
 * - auto: Full autonomy (yolo mode)
 *
 * @module permissions/permission-mode
 * @version 1.0.0
 * @inspired-by Craft Agents OSS
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

class PermissionMode {
  /**
   * Available permission modes with their configurations
   */
  static MODES = {
    explore: {
      name: 'Explore',
      icon: '🔍',
      color: 'blue',
      description: 'Read-only mode - safe exploration',
      shortDescription: 'Safe browsing',
      permissions: {
        read: true,
        write: false,
        execute: false,
        delete: false,
      },
    },
    ask: {
      name: 'Ask',
      icon: '⚠️',
      color: 'yellow',
      description: 'Confirm before changes - balanced approach',
      shortDescription: 'Confirm changes',
      permissions: {
        read: true,
        write: 'confirm',
        execute: 'confirm',
        delete: 'confirm',
      },
    },
    auto: {
      name: 'Auto',
      icon: '⚡',
      color: 'green',
      description: 'Full autonomy - trust mode',
      shortDescription: 'Full speed',
      permissions: {
        read: true,
        write: true,
        execute: true,
        delete: true,
      },
    },
  };

  /**
   * Mode cycle order for quick toggle
   */
  static MODE_CYCLE = ['explore', 'ask', 'auto'];

  constructor(projectRoot = process.cwd()) {
    this.projectRoot = projectRoot;
    this.configPath = path.join(projectRoot, '.aios', 'config.yaml');
    this.currentMode = 'ask'; // default
    this._loaded = false;
  }

  /**
   * Load current mode from config
   * @returns {Promise<string>} Current mode name
   */
  async load() {
    if (this._loaded) return this.currentMode;

    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      const config = yaml.load(configContent) || {};
      this.currentMode = config.permissions?.mode || 'ask';

      // Validate mode
      if (!PermissionMode.MODES[this.currentMode]) {
        console.warn(`Invalid mode "${this.currentMode}" in config, defaulting to "ask"`);
        this.currentMode = 'ask';
      }
    } catch (_error) {
      // Config doesn't exist or is invalid, use default
      this.currentMode = 'ask';
    }

    this._loaded = true;
    return this.currentMode;
  }

  /**
   * Set permission mode
   * @param {string} mode - Mode name (explore, ask, auto)
   * @returns {Promise<Object>} Mode info
   */
  async setMode(mode) {
    // Handle aliases
    if (mode === 'yolo') mode = 'auto';
    if (mode === 'safe') mode = 'explore';
    if (mode === 'balanced') mode = 'ask';

    if (!PermissionMode.MODES[mode]) {
      const validModes = Object.keys(PermissionMode.MODES).join(', ');
      throw new Error(`Invalid mode: "${mode}". Valid modes: ${validModes}`);
    }

    this.currentMode = mode;
    this._loaded = true;

    // Save to config
    await this._saveToConfig(mode);

    return this.getModeInfo();
  }

  /**
   * Cycle to next mode
   * @returns {Promise<Object>} New mode info
   */
  async cycleMode() {
    await this.load();
    const currentIndex = PermissionMode.MODE_CYCLE.indexOf(this.currentMode);
    const nextIndex = (currentIndex + 1) % PermissionMode.MODE_CYCLE.length;
    const nextMode = PermissionMode.MODE_CYCLE[nextIndex];
    return this.setMode(nextMode);
  }

  /**
   * Get current mode information
   * @returns {Object} Mode info with name, icon, description, permissions
   */
  getModeInfo() {
    const mode = PermissionMode.MODES[this.currentMode];
    return {
      mode: this.currentMode,
      ...mode,
    };
  }

  /**
   * Get mode badge for display in greeting
   * @returns {string} Formatted badge like "[⚠️ Ask]"
   */
  getBadge() {
    const mode = PermissionMode.MODES[this.currentMode];
    return `[${mode.icon} ${mode.name}]`;
  }

  /**
   * Check if an operation is allowed
   * @param {string} operation - Operation type (read, write, execute, delete)
   * @returns {Object} { allowed: boolean|'confirm', reason?: string, message?: string }
   */
  canPerform(operation) {
    const mode = PermissionMode.MODES[this.currentMode];
    const permission = mode.permissions[operation];

    if (permission === true) {
      return { allowed: true };
    }

    if (permission === false) {
      return {
        allowed: false,
        reason: `Blocked in ${mode.name} mode`,
        message: `🔒 Operation "${operation}" is blocked in ${mode.name} mode. Use \`*mode ask\` or \`*mode auto\` to enable.`,
      };
    }

    if (permission === 'confirm') {
      return {
        allowed: 'confirm',
        message: `${mode.icon} Operation "${operation}" requires confirmation in ${mode.name} mode.`,
      };
    }

    return {
      allowed: false,
      reason: 'Unknown operation type',
    };
  }

  /**
   * C
```