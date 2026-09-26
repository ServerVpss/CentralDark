# COMANDO - troubleshooting-system.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\packages\installer\src\wizard\validation\troubleshooting-system.js
**SHA:** 685cb74af4ebf70c
**Timestamp:** 2026-08-28T02:19:01.156949
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- 'Run: npm audit fix',
- 'Run: npm audit fix --force (if needed)',
- 'Run: chmod 600 .env',

### Gaps
- ENV_FILE_MISSING: {
- CORE_CONFIG_MISSING: {
- GITIGNORE_CRITICAL_MISSING: {
- CRITICAL_DEPS_MISSING: {

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Troubleshooting System
 * Task 1.8.6: Provides actionable troubleshooting for errors
 *
 * @module wizard/validation/troubleshooting-system
 */

const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Troubleshooting database
 * Maps error codes to detailed troubleshooting information
 */
const TROUBLESHOOTING_DATABASE = {
  ENV_FILE_MISSING: {
    problem: '.env file not found',
    causes: [
      'Environment configuration step failed',
      'File creation permissions issue',
      '.env accidentally deleted',
    ],
    solutions: [
      'Re-run wizard: npx @SynkraAI/aios@latest init',
      'Manually create .env from template: cp .env.example .env',
      'Check file permissions in project directory',
    ],
    docs: 'https://docs.SynkraAI.com/installation/environment',
    priority: 'critical',
  },

  CORE_CONFIG_MISSING: {
    problem: 'core-config.yaml not found',
    causes: [
      'Environment configuration step failed',
      '.aios-core directory missing',
      'File creation failed',
    ],
    solutions: [
      'Re-run wizard: npx @SynkraAI/aios@latest init',
      'Check .aios-core directory exists',
      'Manually create from template',
    ],
    docs: 'https://docs.SynkraAI.com/configuration/core-config',
    priority: 'high',
  },

  MCP_HEALTH_CHECK_FAILED: {
    problem: 'MCP health check failed',
    causes: [
      'API key missing or invalid',
      'Network connectivity issues',
      'MCP service temporarily unavailable',
      'Package not installed correctly',
    ],
    solutions: [
      'Verify API key in .env file',
      'Test network: curl https://api.service.com/health',
      'Retry MCP installation: npm run install:mcps',
      'Check MCP service status',
      'Verify npx can access package: npx -y [package-name] --version',
    ],
    docs: 'https://docs.SynkraAI.com/mcps/troubleshooting',
    priority: 'medium',
  },

  ALL_MCP_HEALTH_CHECKS_FAILED: {
    problem: 'All MCP health checks failed',
    causes: [
      'Network connectivity issue',
      'MCPs not installed correctly',
      'Configuration file corrupted',
      'API keys not configured',
    ],
    solutions: [
      'Check internet connection',
      'Re-run MCP installation',
      'Verify .mcp.json syntax',
      'Configure API keys in .env',
      'Delete .mcp.json and reinstall',
    ],
    docs: 'https://docs.SynkraAI.com/mcps/troubleshooting',
    priority: 'high',
  },

  GITIGNORE_CRITICAL_MISSING: {
    problem: '.gitignore missing critical entries',
    causes: [
      '.gitignore not created during setup',
      '.gitignore manually edited incorrectly',
      'Git not initialized',
    ],
    solutions: [
      'Add missing entries to .gitignore',
      'Copy from template: .env, node_modules, *.key, *.pem',
      'Initialize git if needed: git init',
    ],
    docs: 'https://docs.SynkraAI.com/security/gitignore',
    priority: 'high',
  },

  DEPS_INSTALL_FAILED: {
    problem: 'Dependencies installation failed',
    causes: [
      'Network connectivity issues',
      'Package manager not installed',
      'npm/yarn registry unavailable',
      'Disk space insufficient',
    ],
    solutions: [
      'Check internet connection',
      'Verify package manager installed: npm --version',
      'Clear cache: npm cache clean --force',
      'Try different package manager: yarn or pnpm',
      'Check disk space: df -h (Unix) or dir (Windows)',
    ],
    docs: 'https://docs.SynkraAI.com/installation/dependencies',
    priority: 'critical',
  },

  CRITICAL_DEPS_MISSING: {
    problem: 'Critical dependencies missing',
    causes: [
      'Dependency installation incomplete',
      'node_modules corrupted',
      'Package installation failed silently',
    ],
    solutions: [
      'Delete node_modules: rm -rf node_modules',
      'Delete lock file: rm package-lock.json',
      'Reinstall: npm install',
      'Try clean install: npm ci',
    ],
    docs: 'https://docs.SynkraAI.com/installation/dependencies',
    priority: 'high',
  },

  VULNERABILITIES_FOUND: {
    problem: 'Security vulnerabilities found in dependencies',
    causes: [
      'Outdated packages with known vulnerabilities',
      'Transitive dependencies with security issues',
    ],
    solutions: [
      'Run: npm audit fix',
      'Run: npm audit fix --force (if needed)',
      'Update packages: npm update',
      'Review: npm audit for details',
    ],
    docs: 'https://docs.npmjs.com/cli/v8/commands/npm-audit',
    priority: 'medium',
  },

  ENV_PERMISSIONS_INSECURE: {
    problem: '.env file permissions too permissive',
    causes: [
      'File created with default permissions',
      'Permissions not set during installation',
    ],
    solutions: [
      'Run: chmod 600 .env',
      'Verify: ls -la .env',
    ],
    docs: 'https://docs.SynkraAI.com/security/file-permissions',
    priority: 'medium',
  },
};

/**
 * Offer troubleshooting for errors
 *
 * @param {Array} errors - Array 
```