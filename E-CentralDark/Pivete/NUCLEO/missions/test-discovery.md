# MISSAO - test-discovery.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\infrastructure\scripts\test-discovery.js
**SHA:** 04038aa49ae51569
**Timestamp:** 2026-08-28T02:02:14.255098
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- this.emit('run:start', { command, args: fullArgs });
- this.emit('run:complete', result);
- this.emit('run:error', { error: error.message });
- runner.on('run:start', (data) => this.emit('run:start', data));
- runner.on('run:complete', (data) => this.emit('run:complete', data));
- runner.on('run:error', (data) => this.emit('run:error', data));

### Padroes
- const remainingPattern = patternParts.join('/');
- if (pattern === '**' || pattern === '*') return true;

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Test Discovery
 * Gap Analysis Implementation
 *
 * Auto-detects test frameworks, test files, and provides
 * intelligent test execution capabilities.
 */

const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const { execSync, spawn } = require('child_process');

/**
 * Test framework configurations
 */
const FRAMEWORKS = {
  jest: {
    name: 'Jest',
    configFiles: ['jest.config.js', 'jest.config.ts', 'jest.config.json', 'jest.config.mjs'],
    packageKey: 'jest',
    testPatterns: [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.jsx',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
    ],
    runCommand: 'npx jest',
    coverageFlag: '--coverage',
    watchFlag: '--watch',
    selectiveFlag: '--findRelatedTests',
  },
  vitest: {
    name: 'Vitest',
    configFiles: ['vitest.config.js', 'vitest.config.ts', 'vite.config.js', 'vite.config.ts'],
    packageKey: 'vitest',
    testPatterns: ['**/*.test.js', '**/*.test.ts', '**/*.spec.js', '**/*.spec.ts'],
    runCommand: 'npx vitest run',
    coverageFlag: '--coverage',
    watchFlag: '--watch',
    selectiveFlag: '--related',
  },
  mocha: {
    name: 'Mocha',
    configFiles: ['.mocharc.js', '.mocharc.json', '.mocharc.yaml', 'mocha.opts'],
    packageKey: 'mocha',
    testPatterns: ['test/**/*.js', 'test/**/*.ts', '**/*.test.js', '**/*.spec.js'],
    runCommand: 'npx mocha',
    coverageFlag: '', // Uses nyc separately
    watchFlag: '--watch',
    selectiveFlag: '--grep',
  },
  pytest: {
    name: 'Pytest',
    configFiles: ['pytest.ini', 'pyproject.toml', 'setup.cfg', 'conftest.py'],
    packageKey: 'pytest',
    testPatterns: ['test_*.py', '*_test.py', 'tests/**/*.py'],
    runCommand: 'pytest',
    coverageFlag: '--cov',
    watchFlag: '', // Uses pytest-watch
    selectiveFlag: '-k',
  },
  rspec: {
    name: 'RSpec',
    configFiles: ['.rspec', 'spec/spec_helper.rb'],
    packageKey: 'rspec',
    testPatterns: ['spec/**/*_spec.rb'],
    runCommand: 'bundle exec rspec',
    coverageFlag: '', // Uses simplecov
    watchFlag: '', // Uses guard
    selectiveFlag: '--example',
  },
  go: {
    name: 'Go Test',
    configFiles: ['go.mod'],
    packageKey: null, // Built-in
    testPatterns: ['**/*_test.go'],
    runCommand: 'go test',
    coverageFlag: '-cover',
    watchFlag: '', // Uses gowatch
    selectiveFlag: '-run',
  },
  phpunit: {
    name: 'PHPUnit',
    configFiles: ['phpunit.xml', 'phpunit.xml.dist'],
    packageKey: 'phpunit',
    testPatterns: ['tests/**/*Test.php', '**/*Test.php'],
    runCommand: 'vendor/bin/phpunit',
    coverageFlag: '--coverage-text',
    watchFlag: '', // Uses phpunit-watcher
    selectiveFlag: '--filter',
  },
  junit: {
    name: 'JUnit',
    configFiles: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    packageKey: 'junit',
    testPatterns: ['**/Test*.java', '**/*Test.java', '**/*Tests.java'],
    runCommand: 'mvn test',
    coverageFlag: '', // Uses jacoco
    watchFlag: '',
    selectiveFlag: '-Dtest=',
  },
  playwright: {
    name: 'Playwright',
    configFiles: ['playwright.config.js', 'playwright.config.ts'],
    packageKey: '@playwright/test',
    testPatterns: ['**/*.spec.js', '**/*.spec.ts', 'e2e/**/*.js', 'e2e/**/*.ts'],
    runCommand: 'npx playwright test',
    coverageFlag: '',
    watchFlag: '',
    selectiveFlag: '--grep',
    type: 'e2e',
  },
  cypress: {
    name: 'Cypress',
    configFiles: ['cypress.config.js', 'cypress.config.ts', 'cypress.json'],
    packageKey: 'cypress',
    testPatterns: [
      'cypress/e2e/**/*.cy.js',
      'cypress/e2e/**/*.cy.ts',
      'cypress/integration/**/*.js',
    ],
    runCommand: 'npx cypress run',
    coverageFlag: '',
    watchFlag: '',
    selectiveFlag: '--spec',
    type: 'e2e',
  },
};

/**
 * FrameworkDetector - Detects test frameworks in use
 */
class FrameworkDetector {
  constructor(rootPath) {
    this.rootPath = rootPath;
  }

  /**
   * Detect all test frameworks in the project
   */
  async detect() {
    const detected = [];

    // Check package.json for Node.js projects
    const packageJson = this.readPackageJson();

    for (const [frameworkId, config] of Object.entries(FRAMEWORKS)) {
      const detection = {
        id: frameworkId,
        name: config.name,
        confidence: 0,
        configFile: null,
        inPackageJson: false,
        type: config.type || 'unit',
      };

      // Check config files
      for (const configFile of config.configFiles) {
        const configPath = path.join(this.rootPath, configFile);
        if (fs.existsSync(configPath)) {
          detection.configFile = configFile;
          detection.confidence += 50;
          break;
        }
      }

      // Check package.json
      if (packageJson && config.packageKey) {
        const deps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        };
        if (deps[config.packageKey]) {
          detection.inPackageJson = true;
 
```