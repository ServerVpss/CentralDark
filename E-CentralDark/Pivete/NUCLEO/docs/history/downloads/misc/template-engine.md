# OUTRO - template-engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\template-engine.js
**SHA:** f388469146acad7c
**Timestamp:** 2026-08-28T02:02:04.001552
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- this.variablePattern = /\{\{([^}]+)\}\}/g;
- this.conditionalPattern = /\{\{#IF_([^}]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g;
- this.loopPattern = /\{\{#EACH_([^}]+)\}\}([\s\S]*?)\{\{\/EACH_\1\}\}/g;
- this.escapePattern = /\\\{\{([^}]+)\}\}/g;
- const conditionalStartPattern = /\{\{#IF_([^}]+)\}\}/g;
- const loopStartPattern = /\{\{#EACH_([^}]+)\}\}/g;

### Gaps
- * @returns {Object} Validation result with {valid: boolean, missing: string[]}
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Template Engine for AIOS-FULLSTACK
 * Handles variable substitution, conditionals, and loops for component generation
 * @module template-engine
 */

const fs = require('fs-extra');
const _path = require('path');

class TemplateEngine {
  constructor() {
    this.variablePattern = /\{\{([^}]+)\}\}/g;
    this.conditionalPattern = /\{\{#IF_([^}]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g;
    this.loopPattern = /\{\{#EACH_([^}]+)\}\}([\s\S]*?)\{\{\/EACH_\1\}\}/g;
    this.escapePattern = /\\\{\{([^}]+)\}\}/g;
  }

  /**
   * Process a template string with given variables
   * @param {string} template - The template string
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed template
   */
  process(template, variables = {}) {
    // First, handle escaped braces
    let processed = template.replace(this.escapePattern, '{{$1}}');
    
    // Process loops
    processed = this.processLoops(processed, variables);
    
    // Process conditionals
    processed = this.processConditionals(processed, variables);
    
    // Process simple variables
    processed = this.processVariables(processed, variables);
    
    // Restore escaped braces
    processed = processed.replace(/\{\{ESCAPED_BRACE_(LEFT|RIGHT)\}\}/g, (match, side) => 
      side === 'LEFT' ? '{{' : '}}'
    );
    
    return processed;
  }

  /**
   * Process loop constructs in template
   * @private
   * @param {string} template - Template string
   * @param {Object} variables - Variables object
   * @returns {string} Processed template
   */
  processLoops(template, variables) {
    return template.replace(this.loopPattern, (match, loopVar, content) => {
      const items = this.resolveVariable(loopVar, variables);
      
      // Handle non-array values gracefully
      if (!Array.isArray(items)) {
        console.warn(`[TemplateEngine] Expected array for loop variable '${loopVar}', got ${typeof items}`);
        return '';
      }
      
      return items.map((item, index) => {
        // Create proper loop context with item and metadata
        const loopVars = {
          ...variables,
          ITEM: item,
          INDEX: index,
          FIRST: index === 0,
          LAST: index === items.length - 1,
          [loopVar.replace('_', '')]: item
        };
        
        // Process nested loops and conditionals
        let processedContent = this.processLoops(content, loopVars);
        processedContent = this.processConditionals(processedContent, loopVars);
        processedContent = this.processVariables(processedContent, loopVars);
        
        return processedContent;
      }).join('');
    });
  }

  /**
   * Process conditional constructs in template
   * @private
   */
  processConditionals(template, variables) {
    return template.replace(this.conditionalPattern, (match, condition, content) => {
      const value = this.resolveVariable(condition, variables);
      
      // Check for truthy value
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return content;
      }
      return '';
    });
  }

  /**
   * Process simple variable substitutions
   * @private
   */
  processVariables(template, variables) {
    return template.replace(this.variablePattern, (match, varName) => {
      const value = this.resolveVariable(varName.trim(), variables);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Resolve a variable name to its value
   * @private
   */
  resolveVariable(varName, variables) {
    // Handle nested paths like "user.name"
    const parts = varName.split('.');
    let value = variables;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Validate that a template has all required placeholders
   * @param {string} template - Template to validate
   * @param {string[]} requiredVars - List of required variable names
   * @returns {Object} Validation result with {valid: boolean, missing: string[]}
   */
  validateTemplate(template, requiredVars = []) {
    const foundVars = new Set();
    const missing = [];
    
    // Extract all variable names from template
    let match;
    const allPatterns = [
      this.variablePattern,
      /\{\{#IF_([^}]+)\}\}/g,
      /\{\{#EACH_([^}]+)\}\}/g
    ];
    
    for (const pattern of allPatterns) {
      pattern.lastIndex = 0; // Reset regex
      while ((match = pattern.exec(template)) !== null) {
        foundVars.add(match[1].trim());
      }
    }
    
    // Check for missing required variables
    for (const reqVar of requiredVars) {
      if (!foundVars.has(reqVar)) {
        missing.push(reqVar);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
      found: Array.from(foundVars)
    };
  }

  /**
   * Load and process a template file
   * @param {string} templatePath - Path to template file
   * @
```

---

# OUTRO - template-engine.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\template-engine.js
**SHA:** 93f0b72bd4f5b5e1
**Timestamp:** 2026-08-28T02:02:14.293195
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- this.variablePattern = /\{\{([^}]+)\}\}/g;
- this.conditionalPattern = /\{\{#IF_([^}]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g;
- this.loopPattern = /\{\{#EACH_([^}]+)\}\}([\s\S]*?)\{\{\/EACH_\1\}\}/g;
- this.escapePattern = /\\\{\{([^}]+)\}\}/g;
- const conditionalStartPattern = /\{\{#IF_([^}]+)\}\}/g;
- const loopStartPattern = /\{\{#EACH_([^}]+)\}\}/g;

### Gaps
- * @returns {Object} Validation result with {valid: boolean, missing: string[]}
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Template Engine for Synkra AIOS
 * Handles variable substitution, conditionals, and loops for component generation
 * @module template-engine
 */

const fs = require('fs-extra');
const path = require('path');

class TemplateEngine {
  constructor() {
    this.variablePattern = /\{\{([^}]+)\}\}/g;
    this.conditionalPattern = /\{\{#IF_([^}]+)\}\}([\s\S]*?)\{\{\/IF_\1\}\}/g;
    this.loopPattern = /\{\{#EACH_([^}]+)\}\}([\s\S]*?)\{\{\/EACH_\1\}\}/g;
    this.escapePattern = /\\\{\{([^}]+)\}\}/g;
  }

  /**
   * Process a template string with given variables
   * @param {string} template - The template string
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed template
   */
  process(template, variables = {}) {
    // First, handle escaped braces
    let processed = template.replace(this.escapePattern, '{{$1}}');
    
    // Process loops
    processed = this.processLoops(processed, variables);
    
    // Process conditionals
    processed = this.processConditionals(processed, variables);
    
    // Process simple variables
    processed = this.processVariables(processed, variables);
    
    // Restore escaped braces
    processed = processed.replace(/\{\{ESCAPED_BRACE_(LEFT|RIGHT)\}\}/g, (match, side) => 
      side === 'LEFT' ? '{{' : '}}',
    );
    
    return processed;
  }

  /**
   * Process loop constructs in template
   * @private
   * @param {string} template - Template string
   * @param {Object} variables - Variables object
   * @returns {string} Processed template
   */
  processLoops(template, variables) {
    return template.replace(this.loopPattern, (match, loopVar, content) => {
      const items = this.resolveVariable(loopVar, variables);
      
      // Handle non-array values gracefully
      if (!Array.isArray(items)) {
        console.warn(`[TemplateEngine] Expected array for loop variable '${loopVar}', got ${typeof items}`);
        return '';
      }
      
      return items.map((item, index) => {
        // Create proper loop context with item and metadata
        const loopVars = {
          ...variables,
          ITEM: item,
          INDEX: index,
          FIRST: index === 0,
          LAST: index === items.length - 1,
          [loopVar.replace('_', '')]: item,
        };
        
        // Process nested loops and conditionals
        let processedContent = this.processLoops(content, loopVars);
        processedContent = this.processConditionals(processedContent, loopVars);
        processedContent = this.processVariables(processedContent, loopVars);
        
        return processedContent;
      }).join('');
    });
  }

  /**
   * Process conditional constructs in template
   * @private
   */
  processConditionals(template, variables) {
    return template.replace(this.conditionalPattern, (match, condition, content) => {
      const value = this.resolveVariable(condition, variables);
      
      // Check for truthy value
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        return content;
      }
      return '';
    });
  }

  /**
   * Process simple variable substitutions
   * @private
   */
  processVariables(template, variables) {
    return template.replace(this.variablePattern, (match, varName) => {
      const value = this.resolveVariable(varName.trim(), variables);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Resolve a variable name to its value
   * @private
   */
  resolveVariable(varName, variables) {
    // Handle nested paths like "user.name"
    const parts = varName.split('.');
    let value = variables;
    
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Validate that a template has all required placeholders
   * @param {string} template - Template to validate
   * @param {string[]} requiredVars - List of required variable names
   * @returns {Object} Validation result with {valid: boolean, missing: string[]}
   */
  validateTemplate(template, requiredVars = []) {
    const foundVars = new Set();
    const missing = [];
    
    // Extract all variable names from template
    let match;
    const allPatterns = [
      this.variablePattern,
      /\{\{#IF_([^}]+)\}\}/g,
      /\{\{#EACH_([^}]+)\}\}/g,
    ];
    
    for (const pattern of allPatterns) {
      pattern.lastIndex = 0; // Reset regex
      while ((match = pattern.exec(template)) !== null) {
        foundVars.add(match[1].trim());
      }
    }
    
    // Check for missing required variables
    for (const reqVar of requiredVars) {
      if (!foundVars.has(reqVar)) {
        missing.push(reqVar);
      }
    }
    
    return {
      valid: missing.length === 0,
      missing,
      found: Array.from(foundVars),
    };
  }

  /**
   * Load and process a template file
   * @param {string} templatePath - Path to template file
   * @
```