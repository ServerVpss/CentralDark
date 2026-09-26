# MISSAO - diagnose-installation.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\aiox-core\.aios-core\scripts\diagnostics\diagnose-installation.js
**SHA:** 2ed72ea41e3e40c1
**Timestamp:** 2026-08-28T02:02:23.144045
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- console.log('    📥 Run: npm install -g npm@latest');
- '    📝 Run: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser',

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env node
/**
 * AIOS-Core Installation Diagnostic Tool
 *
 * Run this script to diagnose installation issues:
 *   node diagnose-installation.js
 *
 * Or directly from URL:
 *   npx https://raw.githubusercontent.com/SynkraAI/aios-core/main/tools/diagnose-installation.js
 */

const { execSync, spawnSync: _spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

const REQUIRED_NODE = '18.0.0';
const REQUIRED_NPM = '9.0.0';

console.log('');
console.log('╔══════════════════════════════════════════════════════════════════╗');
console.log('║          AIOS-Core Installation Diagnostic Tool                  ║');
console.log('╚══════════════════════════════════════════════════════════════════╝');
console.log('');

// Helper functions
function exec(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch (_e) {
    return null;
  }
}

function compareVersions(v1, v2) {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((parts1[i] || 0) > (parts2[i] || 0)) return 1;
    if ((parts1[i] || 0) < (parts2[i] || 0)) return -1;
  }
  return 0;
}

function checkMark(ok) {
  return ok ? '✓' : '✗';
}

let hasErrors = false;
let hasWarnings = false;

// 1. System Information
console.log('── System Information ──────────────────────────────────────────────');
console.log(`  Platform:     ${os.platform()} (${os.arch()})`);
console.log(`  OS:           ${os.type()} ${os.release()}`);
console.log(`  Hostname:     ${os.hostname()}`);
console.log(`  Home:         ${os.homedir()}`);
console.log(`  User:         ${os.userInfo().username}`);
console.log('');

// 2. Node.js Check
console.log('── Node.js ─────────────────────────────────────────────────────────');
const nodeVersion = exec('node --version');
if (nodeVersion) {
  const nodeVer = nodeVersion.replace('v', '');
  const nodeOk = compareVersions(nodeVer, REQUIRED_NODE) >= 0;
  console.log(
    `  ${checkMark(nodeOk)} Version:     ${nodeVersion} (required: >= v${REQUIRED_NODE})`,
  );
  if (!nodeOk) {
    console.log(
      `    ⚠️  ERROR: Node.js version too old! Please upgrade to v${REQUIRED_NODE} or higher.`,
    );
    console.log('    📥 Download: https://nodejs.org/');
    hasErrors = true;
  }
  const nodePath = exec('where node') || exec('which node');
  console.log(`  Path:         ${nodePath ? nodePath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ Node.js:    NOT INSTALLED');
  console.log('    ⚠️  ERROR: Node.js is required!');
  console.log('    📥 Download: https://nodejs.org/');
  hasErrors = true;
}
console.log('');

// 3. npm Check
console.log('── npm ─────────────────────────────────────────────────────────────');
const npmVersion = exec('npm --version');
if (npmVersion) {
  const npmOk = compareVersions(npmVersion, REQUIRED_NPM) >= 0;
  console.log(`  ${checkMark(npmOk)} Version:     v${npmVersion} (required: >= v${REQUIRED_NPM})`);
  if (!npmOk) {
    console.log('    ⚠️  ERROR: npm version too old! Please upgrade.');
    console.log('    📥 Run: npm install -g npm@latest');
    hasErrors = true;
  }
  const npmPath = exec('where npm') || exec('which npm');
  console.log(`  Path:         ${npmPath ? npmPath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ npm:        NOT INSTALLED');
  console.log('    ⚠️  ERROR: npm is required!');
  hasErrors = true;
}
console.log('');

// 4. npx Check
console.log('── npx ─────────────────────────────────────────────────────────────');
const npxVersion = exec('npx --version');
if (npxVersion) {
  console.log(`  ✓ Version:     v${npxVersion}`);
  const npxPath = exec('where npx') || exec('which npx');
  console.log(`  Path:         ${npxPath ? npxPath.split('\n')[0] : 'NOT FOUND'}`);
} else {
  console.log('  ✗ npx:        NOT FOUND');
  console.log('    ⚠️  ERROR: npx is required! Usually comes with npm.');
  hasErrors = true;
}
console.log('');

// 5. Git Check
console.log('── Git ─────────────────────────────────────────────────────────────');
const gitVersion = exec('git --version');
if (gitVersion) {
  console.log(`  ✓ Version:     ${gitVersion.replace('git version ', 'v')}`);
} else {
  console.log('  ✗ Git:        NOT INSTALLED');
  console.log('    ⚠️  WARNING: Git is recommended for full functionality.');
  console.log('    📥 Download: https://git-scm.com/');
  hasWarnings = true;
}
console.log('');

// 6. npm Configuration
console.log('── npm Configuration ───────────────────────────────────────────────');
const npmPrefix = exec('npm config get prefix');
const npmCache = exec('npm config get cache');
const npmRegistry = exec('npm config get registry');
console.log(`  Prefix:       ${npmPrefix || 'NOT SET'}`);
console.log(`  Cache:        ${npmCache || 'NOT SET'}`);
console.log(`  Registry:     ${npmRegistry || 'NOT SET'}`);

// Check if prefix is in PATH
if (npmPrefix) {
  const pathEnv 
```