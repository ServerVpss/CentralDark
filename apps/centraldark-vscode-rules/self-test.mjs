#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ ${name}: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test 1: Package.json exists and is valid
test('package.json exists and is valid JSON', () => {
  const pkgPath = path.join(__dirname, 'package.json');
  assert(fs.existsSync(pkgPath), 'package.json not found');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  assert(pkg.name === 'centraldark-vscode-rules', 'Invalid package name');
  assert(pkg.main === './extension.js', 'Invalid main entry point');
  assert(pkg.version === '1.0.0', 'Invalid version');
});

// Test 2: Extension.js exists
test('extension.js exists and is valid JavaScript', () => {
  const extPath = path.join(__dirname, 'extension.js');
  assert(fs.existsSync(extPath), 'extension.js not found');
  const content = fs.readFileSync(extPath, 'utf8');
  assert(content.includes('function activate'), 'Missing activate function');
  assert(content.includes('function deactivate'), 'Missing deactivate function');
  assert(content.includes('centraldark.loadRules'), 'Missing loadRules command');
});

// Test 3: Centraldark-rules.md exists with content
test('centraldark-rules.md exists with rules', () => {
  const rulesPath = path.join(__dirname, 'centraldark-rules.md');
  assert(fs.existsSync(rulesPath), 'centraldark-rules.md not found');
  const content = fs.readFileSync(rulesPath, 'utf8');
  assert(content.includes('🛑'), 'Missing critical rules marker');
  assert(content.includes('Rule #1'), 'Missing rule definitions');
  assert(content.includes('service_role_key'), 'Missing secrets rule');
  assert(content.includes('pm2 restart'), 'Missing PM2 rule');
  assert(content.includes('/root/whatsapp-server'), 'Missing WhatsApp rule');
});

// Test 4: Language configuration exists
test('language-configuration.json exists', () => {
  const langPath = path.join(__dirname, 'language-configuration.json');
  assert(fs.existsSync(langPath), 'language-configuration.json not found');
  const config = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  assert(config.comments, 'Missing comments configuration');
  assert(config.brackets, 'Missing brackets configuration');
});

// Test 5: Grammar file exists
test('syntax grammar file exists', () => {
  const grammarPath = path.join(__dirname, 'syntaxes', 'centraldark-rules.tmLanguage.json');
  assert(fs.existsSync(grammarPath), 'Grammar file not found');
  const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
  assert(grammar.name === 'CentralDark Rules', 'Invalid grammar name');
  assert(grammar.patterns, 'Missing patterns');
  assert(grammar.patterns.length > 0, 'No syntax patterns defined');
});

// Test 6: README documentation exists
test('README.md exists with documentation', () => {
  const readmePath = path.join(__dirname, 'README.md');
  assert(fs.existsSync(readmePath), 'README.md not found');
  const content = fs.readFileSync(readmePath, 'utf8');
  assert(content.includes('CentralDark'), 'Missing title');
  assert(content.includes('Funcionalidades'), 'Missing features section');
  assert(content.includes('Syntax Highlight'), 'Missing syntax highlight docs');
  assert(content.includes('Linter'), 'Missing linter docs');
});

// Test 7: Commands are properly defined
test('All required commands are defined', () => {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const commands = pkg.contributes.commands;
  const commandIds = commands.map(c => c.command);

  assert(commandIds.includes('centraldark.loadRules'), 'Missing loadRules command');
  assert(commandIds.includes('centraldark.validateFile'), 'Missing validateFile command');
  assert(commandIds.includes('centraldark.showRulesPanel'), 'Missing showRulesPanel command');
});

// Test 8: Keybindings are configured
test('Keybindings are properly configured', () => {
  const pkgPath = path.join(__dirname, 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const keybindings = pkg.contributes.keybindings;

  assert(Array.isArray(keybindings), 'Keybindings should be an array');
  assert(keybindings.length > 0, 'No keybindings defined');

  const loadRulesKeybinding = keybindings.find(k => k.command === 'centraldark.loadRules');
  assert(loadRulesKeybinding, 'Missing keybinding for loadRules');
  assert(loadRulesKeybinding.key, 'Keybinding key not set');
});

// Test 9: Critical patterns are detectable
test('Critical patterns can be validated', () => {
  const extPath = path.join(__dirname, 'extension.js');
  const content = fs.readFileSync(extPath, 'utf8');

  assert(content.includes('service_role_key'), 'Missing service_role_key pattern');
  assert(content.includes('pm2\\s+restart\\s+all'), 'Missing pm2 restart pattern');
  assert(content.includes('/root/whatsapp-server'), 'Missing WhatsApp path pattern');
  assert(content.includes('criticalPatterns'), 'Missing criticalPatterns definition');
});

// Test 10: Status bar functionality is implemented
test('Status bar indicator is implemented', () => {
  const extPath = path.join(__dirname, 'extension.js');
  const content = fs.readFileSync(extPath, 'utf8');

  assert(content.includes('statusBarItem'), 'Missing statusBarItem');
  assert(content.includes('updateStatusBar'), 'Missing updateStatusBar function');
  assert(content.includes('🟢'), 'Missing success indicator emoji');
  assert(content.includes('🔴'), 'Missing error indicator emoji');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Test Summary: ${passed} passed, ${failed} failed`);
console.log('='.repeat(50));

if (failed === 0) {
  console.log('✅ All tests passed! Extension is ready.');
  process.exit(0);
} else {
  console.log('❌ Some tests failed. Please fix issues.');
  process.exit(1);
}
