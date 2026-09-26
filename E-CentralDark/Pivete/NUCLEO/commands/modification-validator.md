# COMANDO - modification-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\modification-validator.js
**SHA:** dc4d46220c92b968
**Timestamp:** 2026-08-28T02:02:03.904153
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- result.errors.push(`Required field missing: ${field}`);
- result.errors.push(`Required section missing: ${section}`);

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { validateYAML } = require('./yaml-validator');
const DependencyAnalyzer = require('./dependency-analyzer');
const SecurityChecker = require('./security-checker');

/**
 * Validates component modifications before applying them
 */
class ModificationValidator {
  constructor() {
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.securityChecker = new SecurityChecker();
    this.validationRules = {
      agent: this.validateAgentModification.bind(this),
      task: this.validateTaskModification.bind(this),
      workflow: this.validateWorkflowModification.bind(this),
      template: this.validateTemplateModification.bind(this)
    };
  }

  /**
   * Validate a component modification
   * @param {string} componentType - Type of component (agent, task, workflow, etc.)
   * @param {string} originalContent - Original component content
   * @param {string} modifiedContent - Modified component content
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with errors and warnings
   */
  async validateModification(_componentType, originalContent, modifiedContent, options = {}) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      breakingChanges: []
    };

    // Basic validation
    if (!originalContent || !modifiedContent) {
      result.valid = false;
      result.errors.push('Original or modified content is empty');
      return result;
    }

    // Run type-specific validation
    if (this.validationRules[componentType]) {
      const typeResult = await this.validationRules[componentType](
        originalContent,
        modifiedContent,
        options
      );
      this.mergeResults(result, typeResult);
    } else {
      result.warnings.push(`No specific validation rules for component type: ${componentType}`);
    }

    // Run security validation
    const securityResult = await this.validateSecurity(modifiedContent, componentType);
    this.mergeResults(result, securityResult);

    // Check for breaking changes
    const breakingChanges = await this.detectBreakingChanges(
      _componentType,
      originalContent,
      modifiedContent
    );
    result.breakingChanges = breakingChanges;

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate agent modifications
   * @private
   */
  async validateAgentModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      // Parse agent content
      const originalParts = this.parseAgentContent(originalContent);
      const modifiedParts = this.parseAgentContent(modifiedContent);

      // Validate YAML structure
      const yamlValidation = validateYAML(modifiedParts.yaml);
      if (!yamlValidation.valid) {
        result.valid = false;
        result.errors.push(`YAML validation failed: ${yamlValidation.error}`);
        return result;
      }

      const originalMeta = yaml.load(originalParts.yaml);
      const modifiedMeta = yaml.load(modifiedParts.yaml);

      // Check required fields
      const requiredFields = ['name', 'id', 'title', 'icon', 'whenToUse'];
      for (const field of requiredFields) {
        if (!modifiedMeta[field]) {
          result.errors.push(`Required field missing: ${field}`);
        }
      }

      // Validate dependencies
      if (modifiedMeta.dependencies) {
        const depValidation = await this.validateDependencies(modifiedMeta.dependencies);
        this.mergeResults(result, depValidation);
      }

      // Check command structure
      if (modifiedMeta.commands) {
        for (const [cmd, desc] of Object.entries(modifiedMeta.commands)) {
          if (!desc || typeof desc !== 'string') {
            result.errors.push(`Invalid command description for: ${cmd}`);
          }
        }
      }

      // Check for removed commands (breaking change)
      if (originalMeta.commands && modifiedMeta.commands) {
        const removedCommands = Object.keys(originalMeta.commands)
          .filter(cmd => !modifiedMeta.commands[cmd]);
        
        if (removedCommands.length > 0) {
          result.warnings.push(`Commands removed: ${removedCommands.join(', ')}`);
        }
      }

      // Validate markdown content
      const markdownValidation = this.validateMarkdown(modifiedParts.markdown);
      this.mergeResults(result, markdownValidation);

    } catch (_error) {
      result.valid = false;
      result.errors.push(`Failed to parse agent content: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate task modifications
   * @private
   */
  async validateTaskModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check for re
```

---

# COMANDO - modification-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\modification-validator.js
**SHA:** 90bfe600022ae72a
**Timestamp:** 2026-08-28T02:02:13.173089
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- result.errors.push(`Required field missing: ${field}`);
- result.errors.push(`Required section missing: ${section}`);

### Ouro Bruto (primeiros 5000 chars)
```
const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');
const { validateYAML } = require('./yaml-validator');
const DependencyAnalyzer = require('./dependency-analyzer');
const SecurityChecker = require('./security-checker');

/**
 * Validates component modifications before applying them
 */
class ModificationValidator {
  constructor() {
    this.dependencyAnalyzer = new DependencyAnalyzer();
    this.securityChecker = new SecurityChecker();
    this.validationRules = {
      agent: this.validateAgentModification.bind(this),
      task: this.validateTaskModification.bind(this),
      workflow: this.validateWorkflowModification.bind(this),
      template: this.validateTemplateModification.bind(this),
    };
  }

  /**
   * Validate a component modification
   * @param {string} componentType - Type of component (agent, task, workflow, etc.)
   * @param {string} originalContent - Original component content
   * @param {string} modifiedContent - Modified component content
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with errors and warnings
   */
  async validateModification(componentType, originalContent, modifiedContent, options = {}) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      breakingChanges: [],
    };

    // Basic validation
    if (!originalContent || !modifiedContent) {
      result.valid = false;
      result.errors.push('Original or modified content is empty');
      return result;
    }

    // Run type-specific validation
    if (this.validationRules[componentType]) {
      const typeResult = await this.validationRules[componentType](
        originalContent,
        modifiedContent,
        options,
      );
      this.mergeResults(result, typeResult);
    } else {
      result.warnings.push(`No specific validation rules for component type: ${componentType}`);
    }

    // Run security validation
    const securityResult = await this.validateSecurity(modifiedContent, componentType);
    this.mergeResults(result, securityResult);

    // Check for breaking changes
    const breakingChanges = await this.detectBreakingChanges(
      componentType,
      originalContent,
      modifiedContent,
    );
    result.breakingChanges = breakingChanges;

    result.valid = result.errors.length === 0;
    return result;
  }

  /**
   * Validate agent modifications
   * @private
   */
  async validateAgentModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    try {
      // Parse agent content
      const originalParts = this.parseAgentContent(originalContent);
      const modifiedParts = this.parseAgentContent(modifiedContent);

      // Validate YAML structure
      const yamlValidation = validateYAML(modifiedParts.yaml);
      if (!yamlValidation.valid) {
        result.valid = false;
        result.errors.push(`YAML validation failed: ${yamlValidation.error}`);
        return result;
      }

      const originalMeta = yaml.load(originalParts.yaml);
      const modifiedMeta = yaml.load(modifiedParts.yaml);

      // Check required fields
      const requiredFields = ['name', 'id', 'title', 'icon', 'whenToUse'];
      for (const field of requiredFields) {
        if (!modifiedMeta[field]) {
          result.errors.push(`Required field missing: ${field}`);
        }
      }

      // Validate dependencies
      if (modifiedMeta.dependencies) {
        const depValidation = await this.validateDependencies(modifiedMeta.dependencies);
        this.mergeResults(result, depValidation);
      }

      // Check command structure
      if (modifiedMeta.commands) {
        for (const [cmd, desc] of Object.entries(modifiedMeta.commands)) {
          if (!desc || typeof desc !== 'string') {
            result.errors.push(`Invalid command description for: ${cmd}`);
          }
        }
      }

      // Check for removed commands (breaking change)
      if (originalMeta.commands && modifiedMeta.commands) {
        const removedCommands = Object.keys(originalMeta.commands)
          .filter(cmd => !modifiedMeta.commands[cmd]);
        
        if (removedCommands.length > 0) {
          result.warnings.push(`Commands removed: ${removedCommands.join(', ')}`);
        }
      }

      // Validate markdown content
      const markdownValidation = this.validateMarkdown(modifiedParts.markdown);
      this.mergeResults(result, markdownValidation);

    } catch (error) {
      result.valid = false;
      result.errors.push(`Failed to parse agent content: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate task modifications
   * @private
   */
  async validateTaskModification(originalContent, modifiedContent, options) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Check for
```