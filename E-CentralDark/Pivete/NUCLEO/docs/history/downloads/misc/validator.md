# OUTRO - validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\ide-sync\validator.js
**SHA:** 356c78125db7f88d
**Timestamp:** 2026-08-28T02:02:14.983530
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing: [],
- missing: 0,
- missing: 0,
- results.summary.missing === 0 && results.summary.drift === 0;
- lines.push(`- Missing: ${ideResult.total.missing}`);

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Validator - Verifies IDE sync status
 * @story 6.19 - IDE Command Auto-Sync System
 */

const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const { getRedirectFilenames } = require('./redirect-generator');

/**
 * Calculate content hash for comparison
 * @param {string} content - File content
 * @returns {string} - SHA256 hash
 */
function hashContent(content) {
  // Normalize line endings for cross-platform consistency
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  return crypto.createHash('sha256').update(normalized, 'utf8').digest('hex');
}

/**
 * Check if a file exists at target path
 * @param {string} filePath - Path to check
 * @returns {boolean} - True if file exists
 */
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

/**
 * Read file content if it exists
 * @param {string} filePath - Path to read
 * @returns {string|null} - File content or null
 */
function readFileIfExists(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath, 'utf8');
    }
  } catch (error) {
    // Ignore read errors
  }
  return null;
}

/**
 * Validate sync status for a single IDE
 * @param {object[]} expectedFiles - Array of {filename, content} expected
 * @param {string} targetDir - Target directory to check
 * @param {object} redirectsConfig - Redirects configuration
 * @returns {object} - Validation result
 */
function validateIdeSync(expectedFiles, targetDir, redirectsConfig) {
  const result = {
    targetDir,
    missing: [],
    drift: [],
    orphaned: [],
    synced: [],
    total: {
      expected: expectedFiles.length,
      missing: 0,
      drift: 0,
      orphaned: 0,
      synced: 0,
    },
  };

  // Track expected filenames
  const expectedFilenames = new Set(expectedFiles.map(f => f.filename));

  // Add redirect filenames to expected
  const redirectFilenames = getRedirectFilenames(redirectsConfig);
  for (const rf of redirectFilenames) {
    expectedFilenames.add(rf);
  }

  // Check each expected file
  for (const expected of expectedFiles) {
    const targetPath = path.join(targetDir, expected.filename);
    const actualContent = readFileIfExists(targetPath);

    if (actualContent === null) {
      // File is missing
      result.missing.push({
        filename: expected.filename,
        path: targetPath,
      });
      result.total.missing++;
    } else {
      // Compare content
      const expectedHash = hashContent(expected.content);
      const actualHash = hashContent(actualContent);

      if (expectedHash !== actualHash) {
        // Content differs (drift)
        result.drift.push({
          filename: expected.filename,
          path: targetPath,
          expectedHash,
          actualHash,
        });
        result.total.drift++;
      } else {
        // File is synced
        result.synced.push({
          filename: expected.filename,
          path: targetPath,
        });
        result.total.synced++;
      }
    }
  }

  // Check for orphaned files (files in target not in expected)
  if (fs.existsSync(targetDir)) {
    try {
      const actualFiles = fs.readdirSync(targetDir).filter(f => f.endsWith('.md'));

      for (const file of actualFiles) {
        if (!expectedFilenames.has(file)) {
          result.orphaned.push({
            filename: file,
            path: path.join(targetDir, file),
          });
          result.total.orphaned++;
        }
      }
    } catch (error) {
      // Ignore directory read errors
    }
  }

  return result;
}

/**
 * Validate sync status for all IDEs
 * @param {object} ideConfigs - Map of IDE name to {expectedFiles, targetDir}
 * @param {object} redirectsConfig - Redirects configuration
 * @returns {object} - Full validation result
 */
function validateAllIdes(ideConfigs, redirectsConfig) {
  const results = {
    ides: {},
    summary: {
      total: 0,
      synced: 0,
      missing: 0,
      drift: 0,
      orphaned: 0,
      pass: true,
    },
  };

  for (const [ideName, config] of Object.entries(ideConfigs)) {
    const ideResult = validateIdeSync(
      config.expectedFiles,
      config.targetDir,
      redirectsConfig
    );

    results.ides[ideName] = ideResult;

    // Update summary
    results.summary.total += ideResult.total.expected;
    results.summary.synced += ideResult.total.synced;
    results.summary.missing += ideResult.total.missing;
    results.summary.drift += ideResult.total.drift;
    results.summary.orphaned += ideResult.total.orphaned;
  }

  // Pass if no missing or drift
  results.summary.pass =
    results.summary.missing === 0 && results.summary.drift === 0;

  return results;
}

/**
 * Format validation result as report string
 * @param {object} results - Validation results
 * @param {boolean} verbose - Include detailed file lists
 * @returns {string} - Formatted report
 */
function formatValidationReport(results, verbose = false) {
  const lines = [];

  lines.push('
```

---

# OUTRO - validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\product\templates\engine\validator.js
**SHA:** 159422012586b659
**Timestamp:** 2026-08-28T02:02:22.195602
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- details = ` (missing: ${params.missingProperty})`;
- const missing = [];

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * JSON Schema Validator Module
 * Validates rendered template output against JSON schemas using Ajv
 *
 * @module validator
 * @version 2.0.0
 */

'use strict';

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs').promises;
const path = require('path');

/**
 * TemplateValidator class for validating template output
 */
class TemplateValidator {
  /**
   * Create a TemplateValidator instance
   * @param {Object} options - Configuration options
   * @param {string} options.schemasDir - Path to schemas directory
   */
  constructor(options = {}) {
    this.schemasDir = options.schemasDir ||
      path.join(process.cwd(), '.aios-core', 'product', 'templates', 'engine', 'schemas');

    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true,
    });

    // Add format validators
    addFormats(this.ajv);

    // Add custom formats
    this.registerCustomFormats();

    // Schema cache
    this.schemas = new Map();
  }

  /**
   * Register custom validation formats
   */
  registerCustomFormats() {
    // Semantic version format
    this.ajv.addFormat('semver', {
      validate: (str) => /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/.test(str),
    });

    // Slug format (URL-safe string)
    this.ajv.addFormat('slug', {
      validate: (str) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str),
    });

    // Story ID format (e.g., "3.6", "12.1")
    this.ajv.addFormat('story-id', {
      validate: (str) => /^\d+\.\d+$/.test(str),
    });

    // Epic ID format (e.g., "EPIC-S3")
    this.ajv.addFormat('epic-id', {
      validate: (str) => /^EPIC-[A-Z0-9]+$/.test(str),
    });
  }

  /**
   * Load a schema by template type
   * @param {string} templateType - Template type (prd, adr, etc.)
   * @returns {Promise<Object>} Loaded schema
   */
  async loadSchema(templateType) {
    if (this.schemas.has(templateType)) {
      return this.schemas.get(templateType);
    }

    // Handle versioned schema aliases (e.g., prd-v2 -> prd-v2.schema.json)
    const schemaAliases = {
      'prd-v2': 'prd-v2',
    };

    const schemaName = schemaAliases[templateType] || templateType;
    const schemaPath = path.join(this.schemasDir, `${schemaName}.schema.json`);

    try {
      const content = await fs.readFile(schemaPath, 'utf-8');
      const schema = JSON.parse(content);
      this.schemas.set(templateType, schema);
      return schema;
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error(`Schema not found for template type: ${templateType}`);
      }
      throw new Error(`Failed to load schema for ${templateType}: ${error.message}`);
    }
  }

  /**
   * Register a schema directly
   * @param {string} templateType - Template type
   * @param {Object} schema - JSON Schema object
   */
  registerSchema(templateType, schema) {
    this.schemas.set(templateType, schema);
    this.ajv.addSchema(schema, templateType);
  }

  /**
   * Validate data against a template schema
   * @param {Object} data - Data to validate
   * @param {string} templateType - Template type for schema lookup
   * @returns {Promise<Object>} Validation result
   */
  async validate(data, templateType) {
    const schema = await this.loadSchema(templateType);

    // Get cached validator or compile and cache it with AJV
    let validate = this.ajv.getSchema(templateType);
    if (!validate) {
      // Register schema with AJV for proper caching using $id or templateType as key
      const schemaId = schema.$id || templateType;
      if (!this.ajv.getSchema(schemaId)) {
        this.ajv.addSchema(schema, templateType);
      }
      validate = this.ajv.getSchema(templateType);

      // Fallback to compile if addSchema didn't work (edge case)
      if (!validate) {
        validate = this.ajv.compile(schema);
      }
    }

    const isValid = validate(data);

    if (isValid) {
      return {
        isValid: true,
        errors: [],
        data,
      };
    }

    return {
      isValid: false,
      errors: this.formatErrors(validate.errors),
      data,
    };
  }

  /**
   * Validate rendered markdown content structure
   * @param {string} content - Rendered markdown content
   * @param {Object} template - Template with metadata
   * @returns {Object} Validation result
   */
  validateStructure(content, template) {
    const errors = [];
    const metadata = template.metadata || {};

    // Check required sections from template metadata
    if (metadata.required_sections) {
      for (const section of metadata.required_sections) {
        const sectionRegex = new RegExp(`^##?\\s+${section}`, 'mi');
        if (!sectionRegex.test(content)) {
          errors.push(`Missing required section: ${section}`);
        }
      }
    }

    // Check for empty required fields
    if (metadata.variables) {
      for (const variable of metadata.variables) {
        if (variable.required) {
          const placeholder = `{{${vari
```

---

# OUTRO - validator.rs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cargo\registry\src\index.crates.io-1949cf8c6b5b557f\schemars-0.9.0\tests\integration\validator.rs
**SHA:** 0e79ea98cc7be611
**Timestamp:** 2026-08-28T02:35:14.628917
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- #[validate(contains(pattern = "substring..."))]
- #[schemars(regex(pattern = hello_regex()))]
- #[schemars(contains(pattern = "substring..."))]

### Ouro Bruto (primeiros 5000 chars)
```
use crate::prelude::*;
use regex::Regex;
use validator::Validate;

const ONE: f32 = 1.0;
const HUNDRED: f32 = 10.0;

// In real code, this would use something like a LazyLock
fn hello_regex() -> Regex {
    Regex::new(r"^[Hh]ello").unwrap()
}

#[derive(JsonSchema, Deserialize, Serialize, Validate)]
pub struct ValidateAttrStruct {
    #[validate(range(min = 1.0, max = 100.0))]
    min_max: f32,
    #[validate(range(min = ONE, max = HUNDRED))]
    min_max2: f32,
    #[validate(regex(path = hello_regex()))]
    regex_str: String,
    #[validate(contains(pattern = "substring..."))]
    contains_str: String,
    #[validate(email)]
    email_address: String,
    #[validate(url)]
    homepage: String,
    #[validate(length(min = 1, max = 100))]
    non_empty_str: String,
    #[validate(length(equal = 2))]
    pair: Vec<String>,
    #[validate(required)]
    required_option: Option<bool>,
    #[validate(required, nested)]
    #[serde(flatten)]
    required_flattened: Option<ValidateAttrInner>,
}

#[derive(JsonSchema, Deserialize, Serialize, Validate)]
pub struct ValidateAttrInner {
    #[validate(range(min = -100, max = 100))]
    x: i32,
}

impl Default for ValidateAttrStruct {
    fn default() -> Self {
        Self {
            min_max: 1.0,
            min_max2: 1.0,
            regex_str: "Hello world".to_owned(),
            contains_str: "Contains substring...".to_owned(),
            email_address: "test@test.test".to_owned(),
            homepage: "http://test.test".to_owned(),
            non_empty_str: "test".to_owned(),
            pair: vec!["a".to_owned(), "b".to_owned()],
            required_option: Some(true),
            required_flattened: Some(ValidateAttrInner { x: 0 }),
        }
    }
}

impl ValidateAttrStruct {
    pub fn invalid_values() -> impl IntoIterator<Item = Self> {
        static MUTATORS: &[fn(&mut ValidateAttrStruct)] = &[
            |v| v.min_max = 0.9,
            |v| v.min_max = 100.1,
            |v| v.min_max2 = 0.9,
            |v| v.min_max2 = 100.1,
            |v| v.regex_str = "fail".to_owned(),
            |v| v.contains_str = "fail".to_owned(),
            |v| v.email_address = "fail".to_owned(),
            |v| v.homepage = "fail".to_owned(),
            |v| v.non_empty_str = String::new(),
            |v| v.pair = Vec::new(),
            |v| v.pair = vec!["a".to_owned(), "b".to_owned(), "c".to_owned()],
            |v| v.required_option = None,
            |v| v.required_flattened = None,
            |v| v.required_flattened = Some(ValidateAttrInner { x: -101 }),
            |v| v.required_flattened = Some(ValidateAttrInner { x: 101 }),
        ];
        MUTATORS.iter().map(|f| {
            let mut result = ValidateAttrStruct::default();
            f(&mut result);
            result
        })
    }
}

#[test]
fn validate_attrs() {
    test!(ValidateAttrStruct)
        .with_validator(|v| v.validate().is_ok())
        .assert_snapshot()
        .assert_allows_ser_roundtrip_default()
        .assert_rejects_invalid(ValidateAttrStruct::invalid_values())
        .assert_matches_de_roundtrip(arbitrary_values());
}

#[allow(dead_code)]
#[derive(JsonSchema)]
#[schemars(rename = "ValidateAttrStruct")]
pub struct SchemarsAttrStruct {
    #[schemars(range(min = 1.0, max = 100.0))]
    min_max: f32,
    #[schemars(range(min = ONE, max = HUNDRED))]
    min_max2: f32,
    #[schemars(regex(pattern = hello_regex()))]
    regex_str: String,
    #[schemars(contains(pattern = "substring..."))]
    contains_str: String,
    #[schemars(email)]
    email_address: String,
    #[schemars(url)]
    homepage: String,
    #[schemars(length(min = 1, max = 100))]
    non_empty_str: String,
    #[schemars(length(equal = 2))]
    pair: Vec<String>,
    #[schemars(required)]
    required_option: Option<bool>,
    #[schemars(required)]
    #[serde(flatten)]
    required_flattened: Option<SchemarsAttrInner>,
}

#[allow(dead_code)]
#[derive(JsonSchema)]
pub struct SchemarsAttrInner {
    #[schemars(range(min = -100, max = 100))]
    x: i32,
}

#[test]
fn schemars_attrs() {
    test!(SchemarsAttrStruct).assert_identical::<ValidateAttrStruct>();
}

```