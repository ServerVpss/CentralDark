# MISSAO - operation-guard.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\core\permissions\operation-guard.js
**SHA:** f9b1b1bd547145c0
**Timestamp:** 2026-08-28T02:02:00.317518
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- byOperation: { read: 0, write: 0, execute: 0, delete: 0 },

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Operation Guard
 *
 * Intercepts tool operations and enforces permission rules
 * based on current permission mode.
 *
 * @module permissions/operation-guard
 * @version 1.0.0
 */

const { PermissionMode } = require('./permission-mode');

class OperationGuard {
  /**
   * Commands that are always safe (read-only operations)
   */
  static SAFE_COMMANDS = [
    // Git read operations
    'git status',
    'git log',
    'git diff',
    'git branch',
    'git show',
    'git ls-files',
    'git remote -v',

    // File system read operations
    'ls',
    'pwd',
    'cat',
    'head',
    'tail',
    'wc',
    'find',
    'grep',
    'which',
    'file',
    'stat',

    // Package manager read operations
    'npm list',
    'npm outdated',
    'npm audit',
    'npm view',
    'npm search',
    'yarn list',
    'yarn info',
    'bun pm ls',

    // Version checks
    'node --version',
    'npm --version',
    'yarn --version',
    'bun --version',
    'git --version',
    'python --version',
    'python3 --version',

    // System info
    'uname',
    'whoami',
    'hostname',
    'date',
    'uptime',
    'df -h',
    'free -h',
    'env',
    'printenv',

    // Network read operations
    'curl -I',
    'ping -c',
    'nslookup',
    'dig',

    // Process info
    'ps aux',
    'top -l 1',
    'htop',

    // gh CLI read operations
    'gh auth status',
    'gh repo view',
    'gh pr list',
    'gh pr view',
    'gh issue list',
    'gh issue view',
    'gh api',
  ];

  /**
   * Patterns that indicate destructive operations
   */
  static DESTRUCTIVE_PATTERNS = [
    // File deletion
    /\brm\s+(-[rf]+\s+)?/,
    /\brmdir\b/,
    /\bunlink\b/,

    // Git destructive operations
    /\bgit\s+reset\s+--hard\b/,
    /\bgit\s+push\s+--force\b/,
    /\bgit\s+push\s+-f\b/,
    /\bgit\s+clean\s+-[fd]+/,
    /\bgit\s+checkout\s+\.\s*$/,
    /\bgit\s+restore\s+\.\s*$/,
    /\bgit\s+stash\s+drop\b/,
    /\bgit\s+branch\s+-[dD]\b/,

    // Database destructive operations
    /\bDROP\s+(TABLE|DATABASE|INDEX|VIEW)\b/i,
    /\bDELETE\s+FROM\b/i,
    /\bTRUNCATE\b/i,
    /\bALTER\s+TABLE\b.*\bDROP\b/i,

    // System destructive
    /\bkill\s+-9\b/,
    /\bkillall\b/,
    /\bshutdown\b/,
    /\breboot\b/,

    // Package manager destructive
    /\bnpm\s+uninstall\b/,
    /\byarn\s+remove\b/,
    /\bbun\s+remove\b/,
  ];

  /**
   * Patterns that indicate write operations
   */
  static WRITE_PATTERNS = [
    // Redirects
    /[^<]>/, // > but not <>
    />>/,

    // File creation/modification
    /\bmkdir\b/,
    /\btouch\b/,
    /\bmv\b/,
    /\bcp\b/,
    /\bln\b/,
    /\bchmod\b/,
    /\bchown\b/,

    // Editors
    /\bsed\s+-i\b/,
    /\bawk\s+-i\b/,

    // Git write operations
    /\bgit\s+add\b/,
    /\bgit\s+commit\b/,
    /\bgit\s+push\b/,
    /\bgit\s+merge\b/,
    /\bgit\s+rebase\b/,
    /\bgit\s+cherry-pick\b/,
    /\bgit\s+stash\b/,

    // Package manager write operations
    /\bnpm\s+install\b/,
    /\bnpm\s+i\b/,
    /\bnpm\s+ci\b/,
    /\byarn\s+add\b/,
    /\byarn\s+install\b/,
    /\bbun\s+install\b/,
    /\bbun\s+add\b/,
  ];

  /**
   * Create an OperationGuard instance
   * @param {PermissionMode} permissionMode - Permission mode instance
   */
  constructor(permissionMode = null) {
    this.permissionMode = permissionMode || new PermissionMode();
    this.operationLog = [];
  }

  /**
   * Classify an operation type based on tool and parameters
   * @param {string} tool - Tool name (Read, Write, Edit, Bash, etc.)
   * @param {Object} params - Tool parameters
   * @returns {string} Operation type (read, write, execute, delete)
   */
  classifyOperation(tool, params = {}) {
    // Read-only tools
    if (['Read', 'Glob', 'Grep', 'WebFetch', 'WebSearch'].includes(tool)) {
      return 'read';
    }

    // Write tools
    if (['Write', 'Edit', 'NotebookEdit'].includes(tool)) {
      return 'write';
    }

    // Task tool - depends on subagent type
    if (tool === 'Task') {
      const readOnlyAgents = ['Explore', 'Plan', 'claude-code-guide'];
      if (readOnlyAgents.includes(params.subagent_type)) {
        return 'read';
      }
      return 'execute';
    }

    // Bash needs deeper analysis
    if (tool === 'Bash') {
      return this.classifyBashCommand(params.command || '');
    }

    // MCP tools - generally execute
    if (tool.startsWith('mcp__')) {
      return 'execute';
    }

    // Default to read (safe)
    return 'read';
  }

  /**
   * Classify a bash command
   * @param {string} command - Bash command string
   * @returns {string} Operation type
   */
  classifyBashCommand(command) {
    const normalizedCmd = command.trim().toLowerCase();

    // Check safe commands first (most specific match)
    for (const safe of OperationGuard.SAFE_COMMANDS) {
      if (normalizedCmd.startsWith(safe.toLowerCase())) {
        return 'read';
      }
    }

    // Check destructive patterns
    for (const pattern of OperationGuard.DESTRUCTIVE_PATTERNS) {
      if (pattern.test(comman
```