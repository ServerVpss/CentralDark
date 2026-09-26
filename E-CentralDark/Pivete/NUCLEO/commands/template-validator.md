# COMANDO - template-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\template-validator.js
**SHA:** 9f9039281dd3b8ca
**Timestamp:** 2026-08-28T02:02:04.006554
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern: /eval\s*\(/, message: 'Template contains eval() - security risk' },
- { pattern: /Function\s*\(/, message: 'Template contains Function() - security risk' },
- { pattern: /require\s*\([^'"]+\)/, message: 'Dynamic require detected - potential security risk' },
- { pattern: /<script/i, message: 'Script tags detected in template' }

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Template Validator for AIOS-FULLSTACK
 * Validates component templates for required structure and placeholders
 * @module template-validator
 */

const fs = require('fs-extra');
const _path = require('path');
const _yaml = require('js-yaml');
const TemplateEngine = require('./template-engine');

class TemplateValidator {
  constructor() {
    this.engine = new TemplateEngine();
    this.requiredVariables = {
      agent: [
        'AGENT_NAME',
        'AGENT_ID', 
        'AGENT_TITLE',
        'AGENT_ICON',
        'WHEN_TO_USE',
        'PERSONA_ROLE',
        'PERSONA_STYLE',
        'PERSONA_IDENTITY',
        'PERSONA_FOCUS'
      ],
      task: [
        'TASK_TITLE',
        'TASK_ID',
        'AGENT_NAME',
        'VERSION',
        'TASK_DESCRIPTION',
        'OUTPUT_DESCRIPTION'
      ],
      workflow: [
        'WORKFLOW_ID',
        'WORKFLOW_NAME',
        'WORKFLOW_DESCRIPTION',
        'WORKFLOW_VERSION',
        'WORKFLOW_TYPE',
        'AUTHOR',
        'CREATED_DATE',
        'LAST_MODIFIED'
      ]
    };
  }

  /**
   * Validate a template file
   * @param {string} templatePath - Path to template file
   * @param {string} templateType - Type of template (agent, task, workflow)
   * @returns {Promise<Object>} Validation result
   */
  async validateTemplateFile(templatePath, templateType) {
    try {
      const template = await fs.readFile(templatePath, 'utf8');
      return this.validateTemplate(template, templateType);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to read template file: ${error.message}`]
      };
    }
  }

  /**
   * Validate a template string
   * @param {string} template - Template content
   * @param {string} templateType - Type of template
   * @returns {Object} Validation result
   */
  validateTemplate(template, templateType) {
    const errors = [];
    const warnings = [];
    
    // Check template type is valid
    if (!this.requiredVariables[templateType]) {
      return {
        valid: false,
        errors: [`Unknown template type: ${templateType}`]
      };
    }
    
    // Validate required variables
    const requiredVars = this.requiredVariables[templateType];
    const validation = this.engine.validateTemplate(template, requiredVars);
    
    if (!validation.valid) {
      errors.push(`Missing required variables: ${validation.missing.join(', ')}`);
    }
    
    // Check for balanced conditionals
    const conditionalCheck = this.checkBalancedConditionals(template);
    if (!conditionalCheck.valid) {
      errors.push(...conditionalCheck.errors);
    }
    
    // Check for balanced loops
    const loopCheck = this.checkBalancedLoops(template);
    if (!loopCheck.valid) {
      errors.push(...loopCheck.errors);
    }
    
    // Template-specific validation
    const specificCheck = this.validateSpecificTemplate(template, templateType);
    if (!specificCheck.valid) {
      errors.push(...specificCheck.errors);
    }
    warnings.push(...specificCheck.warnings);
    
    // Check for potential security issues
    const securityCheck = this.checkSecurityIssues(template);
    if (!securityCheck.valid) {
      errors.push(...securityCheck.errors);
    }
    warnings.push(...securityCheck.warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      variables: this.engine.getTemplateVariables(template)
    };
  }

  /**
   * Check for balanced conditional blocks
   * @private
   */
  checkBalancedConditionals(template) {
    const errors = [];
    const openTags = template.match(/\{\{#IF_([^}]+)\}\}/g) || [];
    const closeTags = template.match(/\{\{\/IF_([^}]+)\}\}/g) || [];
    
    const openConditions = openTags.map(tag => tag.match(/IF_([^}]+)/)[1]);
    const closeConditions = closeTags.map(tag => tag.match(/IF_([^}]+)/)[1]);
    
    // Check each open has a close
    for (const condition of openConditions) {
      if (!closeConditions.includes(condition)) {
        errors.push(`Unclosed conditional: {{#IF_${condition}}}`);
      }
    }
    
    // Check each close has an open
    for (const condition of closeConditions) {
      if (!openConditions.includes(condition)) {
        errors.push(`Unexpected closing tag: {{/IF_${condition}}}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Check for balanced loop blocks
   * @private
   */
  checkBalancedLoops(template) {
    const errors = [];
    const openTags = template.match(/\{\{#EACH_([^}]+)\}\}/g) || [];
    const closeTags = template.match(/\{\{\/EACH_([^}]+)\}\}/g) || [];
    
    const openLoops = openTags.map(tag => tag.match(/EACH_([^}]+)/)[1]);
    const closeLoops = closeTags.map(tag => tag.match(/EACH_([^}]+)/)[1]);
    
    // Check each open has a close
    for (const loop of openLoops) {
      if (!closeLoops.includes(loop)) {
        errors.push(`Unclosed loop: {{#EACH_${loop}}}`);
      }
    }
    
    // Check each close has an open
    for (const loop
```

---

# COMANDO - template-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\template-validator.js
**SHA:** a81f794936e61e93
**Timestamp:** 2026-08-28T02:02:14.214208
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- { pattern: /eval\s*\(/, message: 'Template contains eval() - security risk' },
- { pattern: /Function\s*\(/, message: 'Template contains Function() - security risk' },
- { pattern: /require\s*\([^'"]+\)/, message: 'Dynamic require detected - potential security risk' },
- { pattern: /<script/i, message: 'Script tags detected in template' },

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Template Validator for Synkra AIOS
 * Validates component templates for required structure and placeholders
 * @module template-validator
 */

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const TemplateEngine = require('./template-engine');

class TemplateValidator {
  constructor() {
    this.engine = new TemplateEngine();
    this.requiredVariables = {
      agent: [
        'AGENT_NAME',
        'AGENT_ID', 
        'AGENT_TITLE',
        'AGENT_ICON',
        'WHEN_TO_USE',
        'PERSONA_ROLE',
        'PERSONA_STYLE',
        'PERSONA_IDENTITY',
        'PERSONA_FOCUS',
      ],
      task: [
        'TASK_TITLE',
        'TASK_ID',
        'AGENT_NAME',
        'VERSION',
        'TASK_DESCRIPTION',
        'OUTPUT_DESCRIPTION',
      ],
      workflow: [
        'WORKFLOW_ID',
        'WORKFLOW_NAME',
        'WORKFLOW_DESCRIPTION',
        'WORKFLOW_VERSION',
        'WORKFLOW_TYPE',
        'AUTHOR',
        'CREATED_DATE',
        'LAST_MODIFIED',
      ],
    };
  }

  /**
   * Validate a template file
   * @param {string} templatePath - Path to template file
   * @param {string} templateType - Type of template (agent, task, workflow)
   * @returns {Promise<Object>} Validation result
   */
  async validateTemplateFile(templatePath, templateType) {
    try {
      const template = await fs.readFile(templatePath, 'utf8');
      return this.validateTemplate(template, templateType);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to read template file: ${error.message}`],
      };
    }
  }

  /**
   * Validate a template string
   * @param {string} template - Template content
   * @param {string} templateType - Type of template
   * @returns {Object} Validation result
   */
  validateTemplate(template, templateType) {
    const errors = [];
    const warnings = [];
    
    // Check template type is valid
    if (!this.requiredVariables[templateType]) {
      return {
        valid: false,
        errors: [`Unknown template type: ${templateType}`],
      };
    }
    
    // Validate required variables
    const requiredVars = this.requiredVariables[templateType];
    const validation = this.engine.validateTemplate(template, requiredVars);
    
    if (!validation.valid) {
      errors.push(`Missing required variables: ${validation.missing.join(', ')}`);
    }
    
    // Check for balanced conditionals
    const conditionalCheck = this.checkBalancedConditionals(template);
    if (!conditionalCheck.valid) {
      errors.push(...conditionalCheck.errors);
    }
    
    // Check for balanced loops
    const loopCheck = this.checkBalancedLoops(template);
    if (!loopCheck.valid) {
      errors.push(...loopCheck.errors);
    }
    
    // Template-specific validation
    const specificCheck = this.validateSpecificTemplate(template, templateType);
    if (!specificCheck.valid) {
      errors.push(...specificCheck.errors);
    }
    warnings.push(...specificCheck.warnings);
    
    // Check for potential security issues
    const securityCheck = this.checkSecurityIssues(template);
    if (!securityCheck.valid) {
      errors.push(...securityCheck.errors);
    }
    warnings.push(...securityCheck.warnings);
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      variables: this.engine.getTemplateVariables(template),
    };
  }

  /**
   * Check for balanced conditional blocks
   * @private
   */
  checkBalancedConditionals(template) {
    const errors = [];
    const openTags = template.match(/\{\{#IF_([^}]+)\}\}/g) || [];
    const closeTags = template.match(/\{\{\/IF_([^}]+)\}\}/g) || [];
    
    const openConditions = openTags.map(tag => tag.match(/IF_([^}]+)/)[1]);
    const closeConditions = closeTags.map(tag => tag.match(/IF_([^}]+)/)[1]);
    
    // Check each open has a close
    for (const condition of openConditions) {
      if (!closeConditions.includes(condition)) {
        errors.push(`Unclosed conditional: {{#IF_${condition}}}`);
      }
    }
    
    // Check each close has an open
    for (const condition of closeConditions) {
      if (!openConditions.includes(condition)) {
        errors.push(`Unexpected closing tag: {{/IF_${condition}}}`);
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  /**
   * Check for balanced loop blocks
   * @private
   */
  checkBalancedLoops(template) {
    const errors = [];
    const openTags = template.match(/\{\{#EACH_([^}]+)\}\}/g) || [];
    const closeTags = template.match(/\{\{\/EACH_([^}]+)\}\}/g) || [];
    
    const openLoops = openTags.map(tag => tag.match(/EACH_([^}]+)/)[1]);
    const closeLoops = closeTags.map(tag => tag.match(/EACH_([^}]+)/)[1]);
    
    // Check each open has a close
    for (const loop of openLoops) {
      if (!closeLoops.includes(loop)) {
        errors.push(`Unclosed loop: {{#EACH_${loop}}}`);
      }
    }
    
    // Check each close has an open
    for (const lo
```