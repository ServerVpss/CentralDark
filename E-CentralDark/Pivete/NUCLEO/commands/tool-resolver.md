# COMANDO - tool-resolver.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\tool-resolver.js
**SHA:** 94a5ab46dc1939d8
**Timestamp:** 2026-08-28T02:02:14.557788
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const semverPattern = /^\d+\.\d+\.\d+$/;

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const glob = require('glob');

/**
 * ToolResolver - Resolves and loads AIOS tools from file system
 *
 * Features:
 * - Map-based caching for performance (<5ms cached lookups)
 * - Search path priority: expansion pack → common → core
 * - Glob-based file resolution
 * - Schema validation
 * - Health checking (tool_call, command, http methods)
 * - Schema version auto-detection
 *
 * Target Performance: <50ms for uncached resolution
 */
class ToolResolver {
  constructor() {
    // Map-based cache for fast lookups
    this.cache = new Map();

    // Base search paths (in priority order)
    this.basePaths = [
      'aios-core/tools',
      'common/tools',
      // Expansion pack paths added dynamically during resolution
    ];
  }

  /**
   * Resolve a tool by name
   *
   * @param {string} toolName - Tool identifier (e.g., 'clickup', 'github-cli')
   * @param {object} context - Resolution context (optional)
   * @param {string} context.expansionPack - Specific expansion pack to search
   * @returns {object} Tool definition with schema_version detected
   * @throws {Error} If tool not found or validation fails
   */
  async resolveTool(toolName, context = {}) {
    // 1. Check cache first (performance: <5ms cached)
    const cacheKey = `${context.expansionPack || 'core'}:${toolName}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // 2. Build search paths (expansion pack → core priority)
    const searchPaths = [];
    if (context.expansionPack) {
      searchPaths.push(`expansion-packs/${context.expansionPack}/tools`);
    }
    searchPaths.push(...this.basePaths);

    // 3. Find tool file using glob (searches subdirectories)
    let toolPath = null;
    for (const basePath of searchPaths) {
      const candidates = glob.sync(`${basePath}/**/${toolName}.yaml`);
      if (candidates.length > 0) {
        toolPath = candidates[0];
        break;
      }
    }

    if (!toolPath) {
      throw new Error(`Tool '${toolName}' not found in search paths: ${searchPaths.join(', ')}`);
    }

    // 4. Load and parse YAML
    const toolContent = await fs.readFile(toolPath, 'utf8');
    let toolDef = yaml.load(toolContent);

    // Extract tool object if wrapped (handles both formats)
    if (toolDef.tool) {
      toolDef = toolDef.tool;
    }

    // 5. Validate schema
    await this.validateToolSchema(toolDef);

    // 6. Detect schema version (auto-detection if not specified)
    if (!toolDef.schema_version) {
      toolDef.schema_version = this.detectSchemaVersion(toolDef);
    }

    // 7. Health check if configured
    if (toolDef.health_check) {
      const healthy = await this.checkHealth(toolDef);
      if (!healthy && toolDef.health_check.required) {
        throw new Error(`Required tool '${toolName}' health check failed`);
      }
      toolDef._healthStatus = healthy ? 'healthy' : 'unhealthy';
    }

    // 8. Cache and return (target: <50ms total)
    this.cache.set(cacheKey, toolDef);
    return toolDef;
  }

  /**
   * Validate tool schema structure
   *
   * @param {object} tool - Tool definition
   * @throws {Error} If required fields missing or invalid
   */
  async validateToolSchema(tool) {
    // Required fields for all tools
    const requiredFields = ['id', 'type', 'name', 'version', 'description'];

    for (const field of requiredFields) {
      if (!tool[field]) {
        throw new Error(`Tool missing required field: ${field}`);
      }
    }

    // Validate type enum
    const validTypes = ['mcp', 'cli', 'local', 'meta'];
    if (!validTypes.includes(tool.type)) {
      throw new Error(`Invalid tool type '${tool.type}'. Must be one of: ${validTypes.join(', ')}`);
    }

    // Validate version format (basic semver check)
    const semverPattern = /^\d+\.\d+\.\d+$/;
    if (!semverPattern.test(tool.version)) {
      throw new Error(`Invalid version format '${tool.version}'. Expected semantic versioning (e.g., 1.0.0)`);
    }

    // Validate schema_version if present (support both string and numeric formats)
    if (tool.schema_version) {
      const version = typeof tool.schema_version === 'number'
        ? tool.schema_version
        : parseFloat(tool.schema_version);

      if (![1.0, 2.0].includes(version)) {
        throw new Error(`Invalid schema_version '${tool.schema_version}'. Must be '1.0' or '2.0'`);
      }
    }

    // v2.0 specific validation
    if (tool.schema_version === '2.0' || tool.schema_version === 2.0) {
      await this.validateV2Schema(tool);
    }
  }

  /**
   * Validate v2.0 schema-specific features
   *
   * @param {object} tool - Tool definition
   * @throws {Error} If v2.0 features are invalid
   */
  async validateV2Schema(tool) {
    // Validate executable_knowledge if present
    if (tool.executable_knowledge) {
      const { helpers, processors, validators } = tool.executable_knowledge;

      // Validate helpers
      if
```