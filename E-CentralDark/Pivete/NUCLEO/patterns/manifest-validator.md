# PADRAO - manifest-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\manifest\manifest-validator.js
**SHA:** cedcf107a742d0ae
**Timestamp:** 2026-08-28T02:01:59.465698
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Manifest Validator
 *
 * Validates manifest CSV files for integrity, schema compliance,
 * and file existence checks.
 *
 * @module manifest-validator
 * @version 1.0.0
 * @story 2.13 - Manifest System
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Parse CSV content into rows
 * Handles quoted values that may contain newlines
 * @param {string} content - CSV content
 * @returns {object} Parsed CSV with header and rows
 */
function parseCSV(content) {
  const records = parseCSVContent(content);
  if (records.length === 0) {
    return { header: [], rows: [] };
  }

  const header = records[0];
  const rows = records.slice(1).map((values, index) => {
    const row = {};
    header.forEach((col, i) => {
      row[col] = values[i] || '';
    });
    row._lineNumber = index + 2; // 1-based, accounting for header
    return row;
  });

  return { header, rows };
}

/**
 * Parse entire CSV content handling multi-line quoted values
 * @param {string} content - CSV content
 * @returns {string[][]} Array of records (each record is array of values)
 */
function parseCSVContent(content) {
  const records = [];
  let currentRecord = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentValue += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRecord.push(currentValue);
      currentValue = '';
    } else if (char === '\n' && !inQuotes) {
      // End of record
      currentRecord.push(currentValue);
      if (currentRecord.some(v => v !== '')) {
        records.push(currentRecord);
      }
      currentRecord = [];
      currentValue = '';
    } else if (char === '\r') {
      // Skip carriage return
      continue;
    } else {
      currentValue += char;
    }
  }

  // Don't forget the last field and record
  if (currentValue !== '' || currentRecord.length > 0) {
    currentRecord.push(currentValue);
    if (currentRecord.some(v => v !== '')) {
      records.push(currentRecord);
    }
  }

  return records;
}

/**
 * Parse a single CSV line handling quoted values
 * @param {string} line - CSV line
 * @returns {string[]} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Manifest Validator class
 */
class ManifestValidator {
  constructor(options = {}) {
    this.basePath = options.basePath || process.cwd();
    this.aiosCoreDir = path.join(this.basePath, '.aios-core');
    this.manifestDir = path.join(this.aiosCoreDir, 'manifests');
    this.verbose = options.verbose || false;
  }

  /**
   * Validate all manifests
   * @returns {Promise<object>} Validation results
   */
  async validateAll() {
    const results = {
      agents: null,
      workers: null,
      tasks: null,
      summary: {
        totalManifests: 3,
        valid: 0,
        invalid: 0,
        missing: [],
        orphan: [],
      },
    };

    try {
      // Validate all manifests in parallel
      const [agents, workers, tasks] = await Promise.all([
        this.validateManifest('agents.csv', this.getAgentsSchema()),
        this.validateManifest('workers.csv', this.getWorkersSchema()),
        this.validateManifest('tasks.csv', this.getTasksSchema()),
      ]);

      results.agents = agents;
      results.workers = workers;
      results.tasks = tasks;

      // Build summary
      [agents, workers, tasks].forEach(r => {
        if (r.valid) results.summary.valid++;
        else results.summary.invalid++;
        results.summary.missing.push(...r.missingFiles);
        results.summary.orphan.push(...r.orphanFiles);
      });

    } catch (error) {
      results.error = error.message;
    }

    return results;
  }

  /**
   * Validate a single manifest file
   * @param {string} filename - Manifest filename
   * @param {object} schema - Schema definition
   * @returns {Promise<object>} Validation result
   */
  async validateManifest(filename, schema) {
    const filePath = path.join(this.manifestDir, filename);
    const result = {
      filename,
      path: filePath,
      valid: true,
      errors: [],
      warnings: [],
      rowCount: 0,
      missingFiles: [],
      orphanFiles: [],
    };

    try {
      // Check file exists
      try {
        awai
```