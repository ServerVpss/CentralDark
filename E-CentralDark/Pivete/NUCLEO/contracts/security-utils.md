# CONTRATO - security-utils.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\utils\security-utils.js
**SHA:** 6b26ebf9c2deb631
**Timestamp:** 2026-08-28T02:02:02.249833
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const windowStart = now - this.windowMs;
- const windowStart = now - this.windowMs;

### Padroes
- return !dangerousPatterns.some(pattern => pattern.test(value));

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Security Utilities for Synkra AIOS
 * Provides centralized security functions for input validation and sanitization
 *
 * @module security-utils
 * @version 1.0.0
 * @created 2025-12-05 (Story 4.1)
 */

const path = require('path');

/**
 * Validates a file path to prevent path traversal attacks
 *
 * @param {string} filePath - The path to validate
 * @param {Object} options - Validation options
 * @param {string} [options.basePath] - Base path to restrict operations to
 * @param {boolean} [options.allowAbsolute=false] - Whether to allow absolute paths
 * @returns {Object} Validation result with {valid: boolean, normalized: string, errors: string[]}
 */
function validatePath(filePath, options = {}) {
  const result = {
    valid: true,
    normalized: null,
    errors: [],
  };

  // Check for null/undefined input
  if (!filePath || typeof filePath !== 'string') {
    result.valid = false;
    result.errors.push('Path must be a non-empty string');
    return result;
  }

  // Normalize the path
  const normalized = path.normalize(filePath);
  result.normalized = normalized;

  // Check for path traversal attempts (../ or ..\)
  if (filePath.includes('..') || normalized.includes('..')) {
    result.valid = false;
    result.errors.push('Path traversal detected: ".." is not allowed');
  }

  // Check for null bytes (null byte injection)
  if (filePath.includes('\0')) {
    result.valid = false;
    result.errors.push('Null byte detected in path');
  }

  // Check for absolute paths if not allowed
  if (!options.allowAbsolute && path.isAbsolute(normalized)) {
    result.valid = false;
    result.errors.push('Absolute paths are not allowed');
  }

  // If basePath is provided, ensure the resolved path stays within it
  if (options.basePath && result.valid) {
    const resolvedPath = path.resolve(options.basePath, normalized);
    const resolvedBase = path.resolve(options.basePath);

    if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
      result.valid = false;
      result.errors.push('Path escapes the allowed base directory');
    }
  }

  return result;
}

/**
 * Sanitizes user input to prevent injection attacks
 *
 * @param {string} input - The input to sanitize
 * @param {string} type - Type of sanitization ('general'|'filename'|'identifier'|'shell'|'html')
 * @returns {string} Sanitized input
 */
function sanitizeInput(input, type = 'general') {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove null bytes from all inputs
  let sanitized = input.replace(/\0/g, '');

  switch (type) {
    case 'filename':
      // Allow only safe filename characters
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_.]/g, '_');
      // Prevent hidden files/directories
      sanitized = sanitized.replace(/^\.+/, '');
      break;

    case 'identifier':
      // Allow only alphanumeric, dash, and underscore
      sanitized = sanitized.replace(/[^a-zA-Z0-9\-_]/g, '_');
      break;

    case 'shell':
      // Escape shell special characters
      sanitized = sanitized.replace(/[;&|`$(){}[\]<>!#*?\\'"]/g, '');
      break;

    case 'html':
      // Escape HTML entities
      sanitized = sanitized
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
      break;

    case 'general':
    default:
      // Basic sanitization - remove control characters except newlines and tabs
      // eslint-disable-next-line no-control-regex
      sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      break;
  }

  return sanitized;
}

/**
 * Validates JSON input safely
 *
 * @param {string} jsonString - JSON string to validate and parse
 * @param {Object} options - Options
 * @param {number} [options.maxSize=1048576] - Maximum allowed size in bytes (default 1MB)
 * @param {number} [options.maxDepth=10] - Maximum allowed nesting depth
 * @returns {Object} Result with {valid: boolean, data: any, error: string}
 */
function validateJSON(jsonString, options = {}) {
  const { maxSize = 1048576, maxDepth = 10 } = options;
  const result = {
    valid: true,
    data: null,
    error: null,
  };

  // Check for null/undefined input
  if (!jsonString || typeof jsonString !== 'string') {
    result.valid = false;
    result.error = 'JSON input must be a non-empty string';
    return result;
  }

  // Check size limit
  if (jsonString.length > maxSize) {
    result.valid = false;
    result.error = `JSON exceeds maximum size of ${maxSize} bytes`;
    return result;
  }

  // Parse JSON
  try {
    result.data = JSON.parse(jsonString);
  } catch (error) {
    result.valid = false;
    result.error = `Invalid JSON: ${error.message}`;
    return result;
  }

  // Check nesting depth
  const depth = getObjectDepth(result.data);
  if (depth > maxDepth) {
    result.valid = false;
    result.error = `JSON nesting depth (${depth
```