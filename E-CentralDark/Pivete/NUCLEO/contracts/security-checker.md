# CONTRATO - security-checker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\development\scripts\security-checker.js
**SHA:** 8eb3952f865a045b
**Timestamp:** 2026-08-28T02:02:03.950479
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: pattern.source,
- pattern: pattern.source,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Security Checker for AIOS Developer Meta-Agent
 * Validates generated code and configurations for security vulnerabilities
 */

const path = require('path');
const yaml = require('js-yaml');

class SecurityChecker {
  constructor() {
    // Patterns that indicate potential security issues
    this.dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
      /setTimeout\s*\([^,]+,/gi,
      /setInterval\s*\([^,]+,/gi,
      /require\s*\([^'"]/gi, // Dynamic require
      /import\s*\(/gi, // Dynamic import
      /child_process/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
      /\.\.\/\.\.\//g, // Path traversal
      /process\.env/gi,
      /__dirname/gi,
      /__filename/gi,
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /;\s*DROP\s+TABLE/gi,
      /;\s*DELETE\s+FROM/gi,
      /UNION\s+SELECT/gi,
      /OR\s+1\s*=\s*1/gi,
      /'\s+OR\s+'/gi,
    ];

    // Command injection patterns
    this.commandInjectionPatterns = [
      /[;&|`$()]/g,
      /\$\{.*\}/g,
      />|</g,
    ];

    // Safe patterns that should be allowed
    this.safePatterns = {
      'eval': [
        /\/\*.*eval.*\*\//gs, // eval in comments
        /\/\/.*eval/g, // eval in single-line comments
        /".*eval.*"/g, // eval in strings
        /'.*eval.*'/g,
      ]
    };
  }

  /**
   * Validate generated code for security vulnerabilities
   * @param {string} code - The code to validate
   * @param {string} [language='javascript'] - The programming language
   * @returns {Object} Validation results with valid flag, errors, warnings, and suggestions
   */
  validateCode(code, language = 'javascript') {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate input
    if (!code || typeof code !== 'string') {
      results.valid = false;
      results.errors.push({
        type: 'invalid_input',
        message: 'Code must be a non-empty string'
      });
      return results;
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        // Check if it's in a safe context
        let isSafe = false;
        const patternName = pattern.source.split('\\')[0];
        
        if (this.safePatterns[patternName]) {
          for (const safePattern of this.safePatterns[patternName]) {
            if (code.match(safePattern)) {
              isSafe = true;
              break;
            }
          }
        }

        if (!isSafe) {
          results.valid = false;
          results.errors.push({
            type: 'dangerous_pattern',
            pattern: pattern.source,
            matches: matches,
            message: `Dangerous pattern detected: ${matches[0]}`,
            line: this._getLineNumber(code, matches.index)
          });
        }
      }
    }

    // Check for SQL injection (if applicable)
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      for (const pattern of this.sqlInjectionPatterns) {
        if (pattern.test(code)) {
          results.valid = false;
          results.errors.push({
            type: 'sql_injection',
            pattern: pattern.source,
            message: 'Potential SQL injection vulnerability detected'
          });
        }
      }
    }

    // Validate input sanitization
    if (code.includes('req.body') || code.includes('req.query') || code.includes('req.params')) {
      if (!code.includes('sanitize') && !code.includes('validate') && !code.includes('escape')) {
        results.warnings.push({
          type: 'input_validation',
          message: 'User input detected without explicit sanitization'
        });
      }
    }

    return results;
  }

  /**
   * Validate YAML configuration for security issues
   */
  validateYAML(yamlContent) {
    const results = {
      valid: true,
      errors: [],
      warnings: []
    };

    try {
      const parsed = yaml.load(yamlContent);
      
      // Check for dangerous YAML features
      if (yamlContent.includes('!!') && !yamlContent.includes('!!str')) {
        results.warnings.push({
          type: 'yaml_tags',
          message: 'YAML tags detected - ensure they are safe'
        });
      }

      // Validate structure
      this.validateYAMLStructure(parsed, results);
      
    } catch (error) {
      results.valid = false;
      results.errors.push({
        type: 'yaml_parse',
        message: `YAML parsing error: ${error.message}`
      });
    }

    return results;
  }

  /**
   * Validate YAML structure recursively
   */
  validateYAMLStructure(obj, results, path = '') {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check for command injection in string values
        if (typeof value === 'string') {

```

---

# CONTRATO - security-checker.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\security-checker.js
**SHA:** 467c7366b60460ef
**Timestamp:** 2026-08-28T02:02:14.206648
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- pattern: pattern.source,
- pattern: pattern.source,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Security Checker for AIOS Developer Meta-Agent
 * Validates generated code and configurations for security vulnerabilities
 */

const path = require('path');
const yaml = require('js-yaml');

class SecurityChecker {
  constructor() {
    // Patterns that indicate potential security issues
    this.dangerousPatterns = [
      /eval\s*\(/gi,
      /Function\s*\(/gi,
      /new\s+Function/gi,
      /setTimeout\s*\([^,]+,/gi,
      /setInterval\s*\([^,]+,/gi,
      /require\s*\([^'"]/gi, // Dynamic require
      /import\s*\(/gi, // Dynamic import
      /child_process/gi,
      /exec\s*\(/gi,
      /spawn\s*\(/gi,
      /\.\.\/\.\.\//g, // Path traversal
      /process\.env/gi,
      /__dirname/gi,
      /__filename/gi,
    ];

    // SQL injection patterns
    this.sqlInjectionPatterns = [
      /;\s*DROP\s+TABLE/gi,
      /;\s*DELETE\s+FROM/gi,
      /UNION\s+SELECT/gi,
      /OR\s+1\s*=\s*1/gi,
      /'\s+OR\s+'/gi,
    ];

    // Command injection patterns
    this.commandInjectionPatterns = [
      /[;&|`$()]/g,
      /\$\{.*\}/g,
      />|</g,
    ];

    // Safe patterns that should be allowed
    this.safePatterns = {
      'eval': [
        /\/\*.*eval.*\*\//gs, // eval in comments
        /\/\/.*eval/g, // eval in single-line comments
        /".*eval.*"/g, // eval in strings
        /'.*eval.*'/g,
      ],
    };
  }

  /**
   * Validate generated code for security vulnerabilities
   * @param {string} code - The code to validate
   * @param {string} [language='javascript'] - The programming language
   * @returns {Object} Validation results with valid flag, errors, warnings, and suggestions
   */
  validateCode(code, language = 'javascript') {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
    };

    // Validate input
    if (!code || typeof code !== 'string') {
      results.valid = false;
      results.errors.push({
        type: 'invalid_input',
        message: 'Code must be a non-empty string',
      });
      return results;
    }

    // Check for dangerous patterns
    for (const pattern of this.dangerousPatterns) {
      const matches = code.match(pattern);
      if (matches) {
        // Check if it's in a safe context
        let isSafe = false;
        const patternName = pattern.source.split('\\')[0];
        
        if (this.safePatterns[patternName]) {
          for (const safePattern of this.safePatterns[patternName]) {
            if (code.match(safePattern)) {
              isSafe = true;
              break;
            }
          }
        }

        if (!isSafe) {
          results.valid = false;
          results.errors.push({
            type: 'dangerous_pattern',
            pattern: pattern.source,
            matches: matches,
            message: `Dangerous pattern detected: ${matches[0]}`,
            line: this._getLineNumber(code, matches.index),
          });
        }
      }
    }

    // Check for SQL injection (if applicable)
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) {
      for (const pattern of this.sqlInjectionPatterns) {
        if (pattern.test(code)) {
          results.valid = false;
          results.errors.push({
            type: 'sql_injection',
            pattern: pattern.source,
            message: 'Potential SQL injection vulnerability detected',
          });
        }
      }
    }

    // Validate input sanitization
    if (code.includes('req.body') || code.includes('req.query') || code.includes('req.params')) {
      if (!code.includes('sanitize') && !code.includes('validate') && !code.includes('escape')) {
        results.warnings.push({
          type: 'input_validation',
          message: 'User input detected without explicit sanitization',
        });
      }
    }

    return results;
  }

  /**
   * Validate YAML configuration for security issues
   */
  validateYAML(yamlContent) {
    const results = {
      valid: true,
      errors: [],
      warnings: [],
    };

    try {
      const parsed = yaml.load(yamlContent);
      
      // Check for dangerous YAML features
      if (yamlContent.includes('!!') && !yamlContent.includes('!!str')) {
        results.warnings.push({
          type: 'yaml_tags',
          message: 'YAML tags detected - ensure they are safe',
        });
      }

      // Validate structure
      this.validateYAMLStructure(parsed, results);
      
    } catch (error) {
      results.valid = false;
      results.errors.push({
        type: 'yaml_parse',
        message: `YAML parsing error: ${error.message}`,
      });
    }

    return results;
  }

  /**
   * Validate YAML structure recursively
   */
  validateYAMLStructure(obj, results, path = '') {
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const currentPath = path ? `${path}.${key}` : key;
        
        // Check for command injection in string values
        if (typeof value === 'st
```