# COMANDO - post-install-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\installer\post-install-validator.js
**SHA:** 91b9cd898fe9186c
**Timestamp:** 2026-08-28T02:19:00.066496
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- * @param {boolean} [options.dryRun=false] - Only report, don't copy
- const dryRun = options.dryRun === true;

### Gaps
- SIGNATURE_MISSING: 'SIGNATURE_MISSING',
- missing: this.stats.missingFiles,
- lines.push(`  ${c.red}Missing:${c.reset}         ${report.summary.missing}`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Post-Installation Validator
 * Validates installation integrity by comparing installed files against SIGNED manifest
 *
 * @module src/installer/post-install-validator
 * @story 6.19 - Post-Installation Validation & Integrity Verification
 * @version 2.0.0 - Security hardened
 *
 * SECURITY MODEL:
 * - Manifest MUST be cryptographically signed before any file access
 * - All paths are validated for containment before filesystem operations
 * - Symlinks are explicitly rejected
 * - Repair operations require source file hash verification
 * - Fail closed on any security violation
 *
 * Features:
 * - Validates all installed files against signed install-manifest.yaml
 * - Verifies SHA256 hashes for integrity checking
 * - Detects missing, corrupted, and extra files
 * - Provides detailed reports with actionable remediation
 * - Supports automatic repair of missing files (with verification)
 * - Cross-platform compatible (Windows, macOS, Linux)
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');
const { hashFile, hashesMatch } = require('./file-hasher');
const { loadAndVerifyManifest } = require('./manifest-signature');

/**
 * Validation result severity levels
 * @enum {string}
 */
const Severity = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

/**
 * Validation issue types
 * @enum {string}
 */
const IssueType = {
  MISSING_FILE: 'MISSING_FILE',
  CORRUPTED_FILE: 'CORRUPTED_FILE',
  EXTRA_FILE: 'EXTRA_FILE',
  MISSING_MANIFEST: 'MISSING_MANIFEST',
  INVALID_MANIFEST: 'INVALID_MANIFEST',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
  SIZE_MISMATCH: 'SIZE_MISMATCH',
  INVALID_PATH: 'INVALID_PATH',
  SYMLINK_REJECTED: 'SYMLINK_REJECTED',
  SIGNATURE_MISSING: 'SIGNATURE_MISSING',
  SIGNATURE_INVALID: 'SIGNATURE_INVALID',
  HASH_ERROR: 'HASH_ERROR',
  SCHEMA_VIOLATION: 'SCHEMA_VIOLATION',
};

/**
 * File categories for prioritized reporting
 * @enum {string}
 */
const FileCategory = {
  CORE: 'core',
  CLI: 'cli',
  DEVELOPMENT: 'development',
  INFRASTRUCTURE: 'infrastructure',
  PRODUCT: 'product',
  WORKFLOW: 'workflow',
  WORKFLOW_INTELLIGENCE: 'workflow-intelligence',
  MONITOR: 'monitor',
  OTHER: 'other',
};

/**
 * Security limits to prevent DoS attacks
 */
const SecurityLimits = {
  MAX_MANIFEST_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILE_COUNT: 50000,
  MAX_SCAN_DEPTH: 50,
  MAX_SCAN_FILES: 100000,
  MAX_PATH_LENGTH: 1024,
};

/**
 * Allowed fields in manifest entries (reject unknown fields)
 */
const ALLOWED_MANIFEST_FIELDS = ['path', 'hash', 'size', 'type'];

/**
 * Allowed type values in manifest entries
 * These represent file categories, not filesystem types
 * Based on actual types used in install-manifest.yaml
 */
const ALLOWED_TYPE_VALUES = [
  // General types
  'file',
  'other',
  // Structural categories
  'cli',
  'core',
  'development',
  'infrastructure',
  'product',
  'workflow',
  'workflow-intelligence',
  'monitor',
  'data',
  'docs',
  'documentation',
  'template',
  'script',
  'config',
  // Content types
  'task',
  'agent',
  'tool',
  'checklist',
  'elicitation',
  'code',
  'manifest',
];

/**
 * Categorize a file path into its functional category
 * @param {string} filePath - Relative file path
 * @returns {FileCategory} - File category
 */
function categorizeFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  if (normalized.startsWith('core/')) return FileCategory.CORE;
  if (normalized.startsWith('cli/')) return FileCategory.CLI;
  if (normalized.startsWith('development/')) return FileCategory.DEVELOPMENT;
  if (normalized.startsWith('infrastructure/')) return FileCategory.INFRASTRUCTURE;
  if (normalized.startsWith('product/')) return FileCategory.PRODUCT;
  if (normalized.startsWith('workflow-intelligence/')) return FileCategory.WORKFLOW_INTELLIGENCE;
  if (normalized.startsWith('monitor/')) return FileCategory.MONITOR;
  if (normalized.includes('workflow')) return FileCategory.WORKFLOW;

  return FileCategory.OTHER;
}

/**
 * Get severity based on file category
 * @param {FileCategory} category - File category
 * @returns {Severity} - Severity level
 */
function getSeverityForCategory(category) {
  const severityMap = {
    [FileCategory.CORE]: Severity.CRITICAL,
    [FileCategory.CLI]: Severity.HIGH,
    [FileCategory.DEVELOPMENT]: Severity.HIGH,
    [FileCategory.INFRASTRUCTURE]: Severity.MEDIUM,
    [FileCategory.PRODUCT]: Severity.MEDIUM,
    [FileCategory.WORKFLOW]: Severity.MEDIUM,
    [FileCategory.WORKFLOW_INTELLIGENCE]: Severity.HIGH,
    [FileCategory.MONITOR]: Severity.MEDIUM,
    [FileCategory.OTHER]: Severity.LOW,
  };

  return severityMap[category] || Severity.LOW;
}

/**
 * Validate that a resolved path is contained within the root directory
 * Prevents path traversal attacks via malicious manifest entries
 *
 * SECURITY: Handles Windows case-insensitivity and alternate data streams
 *
 * @param {string} abso
```