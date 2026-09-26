# COMANDO - config-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\wizard\validation\validators\config-validator.js
**SHA:** b02cccf22fb62552
**Timestamp:** 2026-08-28T02:19:03.066065
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const sensitivePattern = /(password|secret|key|token).*=.*[^${]/i;
- const pattern = entry.replace(/\*/g, '.*');

### Gaps
- message: `Recommended environment variable missing: ${varName}`,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Configuration Validator
 * Task 1.8.2: Validates .env, core-config.yaml, and .mcp.json
 *
 * @module wizard/validation/validators/config-validator
 */

const fs = require('fs');
const yaml = require('js-yaml');

/**
 * Validate configurations
 *
 * @param {Object} configContext - Configuration context
 * @param {Object} configContext.env - Environment config result
 * @param {Object} configContext.mcps - MCP installation result
 * @param {string} configContext.coreConfig - Path to core-config.yaml
 * @returns {Promise<Object>} Validation result
 */
async function validateConfigs(configContext = {}) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: [],
  };

  try {
    // Validate .env file format and content (Story 1.6)
    await validateEnvFile(results);

    // Validate core-config.yaml YAML syntax (Story 1.6)
    await validateCoreConfig(results, configContext.coreConfig);

    // Validate .mcp.json schema compliance (Story 1.5)
    await validateMCPConfig(results);

    // Validate .gitignore entries (security)
    await validateGitignore(results);

    return results;
  } catch (error) {
    results.success = false;
    results.errors.push({
      severity: 'critical',
      message: `Configuration validation failed: ${error.message}`,
      code: 'CONFIG_VALIDATION_ERROR',
      details: error.stack,
    });

    return results;
  }
}

/**
 * Validate .env file
 * @private
 */
async function validateEnvFile(results) {
  const envPath = '.env';

  if (!fs.existsSync(envPath)) {
    results.success = false;
    results.errors.push({
      severity: 'critical',
      message: '.env file not found',
      file: envPath,
      code: 'ENV_FILE_MISSING',
    });
    return;
  }

  try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    const validLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#');
    });

    // Check for required variables (basic validation)
    const requiredVars = ['NODE_ENV'];
    const envVars = {};

    validLines.forEach(line => {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        envVars[match[1]] = match[2];
      }
    });

    for (const varName of requiredVars) {
      if (!envVars[varName]) {
        results.warnings.push({
          severity: 'low',
          message: `Recommended environment variable missing: ${varName}`,
          file: envPath,
          code: 'ENV_VAR_MISSING',
        });
      }
    }

    // Security check: Verify no hardcoded sensitive data in comments
    const sensitivePattern = /(password|secret|key|token).*=.*[^${]/i;
    lines.forEach((line, index) => {
      if (sensitivePattern.test(line) && !line.trim().startsWith('#')) {
        results.warnings.push({
          severity: 'medium',
          message: `Possible hardcoded credential on line ${index + 1}`,
          file: envPath,
          line: index + 1,
          code: 'POTENTIAL_HARDCODED_CREDENTIAL',
        });
      }
    });

    results.checks.push({
      component: 'Environment Config',
      file: envPath,
      status: 'success',
      message: `Validated (${validLines.length} variables)`,
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `.env file validation failed: ${error.message}`,
      file: envPath,
      code: 'ENV_VALIDATION_ERROR',
    });
    results.success = false;
  }
}

/**
 * Validate core-config.yaml
 * @private
 */
async function validateCoreConfig(results, configPath = '.aios-core/core-config.yaml') {
  if (!fs.existsSync(configPath)) {
    results.warnings.push({
      severity: 'medium',
      message: 'core-config.yaml not found',
      file: configPath,
      code: 'CORE_CONFIG_MISSING',
    });
    return;
  }

  try {
    const yamlContent = fs.readFileSync(configPath, 'utf8');
    const parsed = yaml.load(yamlContent);

    if (!parsed || typeof parsed !== 'object') {
      results.errors.push({
        severity: 'high',
        message: 'core-config.yaml is empty or invalid',
        file: configPath,
        code: 'CORE_CONFIG_INVALID',
      });
      results.success = false;
      return;
    }

    // Basic schema validation
    const requiredKeys = ['markdownExploder', 'qa', 'prd', 'architecture'];
    const missingKeys = requiredKeys.filter(key => !(key in parsed));

    if (missingKeys.length > 0) {
      results.warnings.push({
        severity: 'low',
        message: `core-config.yaml missing recommended keys: ${missingKeys.join(', ')}`,
        file: configPath,
        code: 'CORE_CONFIG_INCOMPLETE',
      });
    }

    results.checks.push({
      component: 'Core Config',
      file: configPath,
      status: 'success',
      message: 'Valid YAML syntax',
    });
  } catch (error) {
    results.errors.push({
      severity: 'high',
      message: `core-config.yaml parsing failed: ${error.message}`,
     
```