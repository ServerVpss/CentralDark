# OUTRO - aios-validator.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\aios-validator.js
**SHA:** a48d7e1a6f33ed8f
**Timestamp:** 2026-08-28T02:02:12.337765
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const filePattern = files.length > 0 ? files.join(' ') : '.';

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * AIOS-FullStack Validation System
 *
 * Provides multi-layer validation:
 * - ESLint code quality
 * - TypeScript type checking
 * - Story file structure validation
 *
 * Refactored to use execa for cross-platform compatibility
 */

const { execaSync } = require('execa');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Terminal colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function printHeader(message) {
  console.log(`\n${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${message}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}${'='.repeat(60)}${colors.reset}\n`);
}

function printSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function printError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function printWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

function printInfo(message) {
  console.log(`${colors.blue}ℹ ${message}${colors.reset}`);
}

/**
 * Validate story file structure
 */
async function validateStoryFile(storyPath) {
  printHeader('Story File Validation');

  const errors = [];

  try {
    if (!fs.existsSync(storyPath)) {
      printError(`Story file not found: ${storyPath}`);
      return { success: false, errors: [`File not found: ${storyPath}`] };
    }

    const content = fs.readFileSync(storyPath, 'utf-8');

    // Check for required sections
    const requiredSections = [
      '# Story',
      '## Problem Statement',
      '## Proposed Solution',
      '## Acceptance Criteria',
    ];

    for (const section of requiredSections) {
      if (!content.includes(section)) {
        errors.push(`Missing required section: ${section}`);
      }
    }

    if (errors.length > 0) {
      printError('Story file validation failed:');
      errors.forEach(err => console.log(`  - ${err}`));
      return { success: false, errors };
    }

    printSuccess('Story file structure is valid');
    return { success: true, errors: [] };

  } catch (error) {
    printError(`Story file validation error: ${error.message}`);
    return { success: false, errors: [`Validation error: ${error.message}`] };
  }
}

/**
 * Run ESLint validation
 */
async function runESLint(files = []) {
  printHeader('ESLint Validation');

  const errors = [];

  try {
    const filePattern = files.length > 0 ? files.join(' ') : '.';
    // ESLint 9.x: removed compact formatter from core, using default (stylish)

    execaSync('npx', ['eslint', filePattern, '--cache', '--cache-location', '.eslintcache'], {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    printSuccess('ESLint validation passed');
    return { success: true, errors: [] };

  } catch (error) {
    const output = error.stdout || error.stderr || '';

    if (output) {
      printError('ESLint found issues:');
      console.log('\n' + output);
      errors.push('ESLint validation failed');
    } else {
      printError(`ESLint execution error: ${error.message}`);
      errors.push(`ESLint error: ${error.message}`);
    }

    return { success: false, errors };
  }
}

/**
 * Run TypeScript type checking
 */
async function runTypeScript() {
  printHeader('TypeScript Type Checking');

  const errors = [];

  try {
    execaSync('npx', ['tsc', '--noEmit'], {
      stdio: 'pipe',
      encoding: 'utf8',
    });

    printSuccess('TypeScript validation passed');
    return { success: true, errors: [] };

  } catch (error) {
    const output = error.stdout || error.stderr || '';

    if (output) {
      printError('TypeScript found type errors:');
      console.log('\n' + output);
      errors.push('TypeScript validation failed');
    } else {
      printError(`TypeScript execution error: ${error.message}`);
      errors.push(`TypeScript error: ${error.message}`);
    }

    return { success: false, errors };
  }
}

/**
 * Validate YAML files
 */
async function validateYAML(files = []) {
  printHeader('YAML Validation');

  const errors = [];
  const yamlFiles = files.length > 0
    ? files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
    : [];

  if (yamlFiles.length === 0) {
    printInfo('No YAML files to validate');
    return { success: true, errors: [] };
  }

  for (const file of yamlFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      yaml.load(content);
      printSuccess(`Valid YAML: ${file}`);
    } catch (error) {
      printError(`Invalid YAML in ${file}: ${error.message}`);
      errors.push(`YAML error in ${file}: ${error.message}`);
    }
  }

  return { success: errors.length === 0, errors };
}

/**
 * Main validation orchestrator
 */
async function validate(options = {}) {
  const {
    type = 'all',
    files = [],
    storyPath = null,
  } = options;

  printHeader(`AIOS-FullStac
```