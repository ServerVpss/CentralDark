# AGENTE - agent-config-loader.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\agent-config-loader.js
**SHA:** 53aa76c1711bb063
**Timestamp:** 2026-08-28T02:02:03.493005
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- // Pattern: indent + "- " + command (may have {args}) + ": " + description

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Agent Config Loader
 *
 * Loads agent-specific configuration with lazy loading and performance tracking.
 * Part of Story 6.1.2.6: Framework Configuration System
 *
 * @module agent-config-loader
 */

const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { globalConfigCache } = require('../../core/config/config-cache');
const { trackConfigLoad } = require('../../infrastructure/scripts/performance-tracker');

/**
 * Agent configuration requirements cache
 */
let agentRequirements = null;

/**
 * Loads agent configuration requirements
 *
 * @returns {Promise<Object>} Agent requirements configuration
 */
async function loadAgentRequirements() {
  if (agentRequirements) {
    return agentRequirements;
  }

  const requirementsPath = path.join(process.cwd(), '.aios-core', 'data', 'agent-config-requirements.yaml');

  try {
    const content = await fs.readFile(requirementsPath, 'utf8');
    agentRequirements = yaml.load(content);
    return agentRequirements;
  } catch (error) {
    console.warn(`⚠️ Could not load agent requirements: ${error.message}`);
    console.warn('   Falling back to default requirements');
    return { agents: {} };
  }
}

/**
 * Agent Config Loader Class
 *
 * Loads agent-specific configuration with lazy loading
 */
class AgentConfigLoader {
  constructor(agentId) {
    this.agentId = agentId;
    this.requirements = null;
    this.cache = globalConfigCache;
  }

  /**
   * Load requirements for this agent
   *
   * @returns {Promise<Object>} Agent requirements
   */
  async loadRequirements() {
    if (this.requirements) {
      return this.requirements;
    }

    const allRequirements = await loadAgentRequirements();
    this.requirements = allRequirements.agents?.[this.agentId] || allRequirements.agents?.default || this.getDefaultRequirements();

    return this.requirements;
  }

  /**
   * Get default requirements if not configured
   *
   * @returns {Object} Default requirements
   */
  getDefaultRequirements() {
    return {
      config_sections: ['dataLocation'],
      files_loaded: [],
      lazy_loading: {},
      performance_target: '<150ms',
    };
  }

  /**
   * Load configuration for this agent
   *
   * @param {Object} coreConfig - Core configuration object
   * @param {Object} options - Load options
   * @param {boolean} options.skipCache - Skip cache and force reload
   * @param {boolean} options.trackPerformance - Track performance (default: true)
   * @returns {Promise<Object>} Agent-specific configuration
   */
  async load(coreConfig, options = {}) {
    const startTime = Date.now();
    const skipCache = options.skipCache || false;
    const trackPerformance = options.trackPerformance !== false;

    // Load requirements
    await this.loadRequirements();

    // Build agent config
    const agentConfig = {};
    const sectionsLoaded = [];
    let totalSize = 0;
    let cacheHit = false;

    // Load required config sections
    for (const section of this.requirements.config_sections || []) {
      if (coreConfig[section] !== undefined) {
        agentConfig[section] = coreConfig[section];
        sectionsLoaded.push(section);

        // Estimate size
        const sectionSize = JSON.stringify(coreConfig[section]).length;
        totalSize += sectionSize;
      }
    }

    // Load required files (with lazy loading logic)
    const filesToLoad = this.getFilesToLoad();
    const fileContents = {};

    for (const filePath of filesToLoad) {
      const content = await this.loadFile(filePath, skipCache);
      fileContents[filePath] = content;

      if (content.fromCache) {
        cacheHit = true;
      }

      totalSize += content.size || 0;
    }

    // Measure load time
    const loadTime = Date.now() - startTime;

    // Track performance
    if (trackPerformance) {
      trackConfigLoad({
        agentId: this.agentId,
        loadTime,
        configSize: totalSize,
        cacheHit,
        sectionsLoaded,
      });

      this.logPerformance(loadTime);
    }

    return {
      config: agentConfig,
      files: fileContents,
      loadTime,
      configSize: totalSize,
      sectionsLoaded,
      cacheHit,
    };
  }

  /**
   * Get list of files to load based on lazy loading rules
   *
   * @returns {string[]} Array of file paths to load
   */
  getFilesToLoad() {
    const files = [];
    const filesLoaded = this.requirements.files_loaded || [];

    for (const fileEntry of filesLoaded) {
      // Parse file entry (can be string or object)
      const fileConfig = typeof fileEntry === 'string'
        ? { path: fileEntry, lazy: false }
        : fileEntry;

      const { path: filePath, lazy, condition } = fileConfig;

      // Apply lazy loading rules
      if (lazy && !this.shouldLoadLazy(condition)) {
        continue; // Skip lazy-loaded file
      }

      files.push(filePath);
    }

    return files;
  }

  /**
   * Check if lazy-loaded file should be loaded
   *
   * @param {string} cond
```