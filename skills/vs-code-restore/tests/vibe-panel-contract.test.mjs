import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const panel = fs.readFileSync(path.join(root, 'src', 'vibe-panel.ts'), 'utf8');
const extension = fs.readFileSync(path.join(root, 'src', 'extension.ts'), 'utf8');

test('Vibe Coding view is registered in the existing extension owner', () => {
  const views = pkg.contributes?.views?.explorer ?? [];
  assert.ok(views.some(view => view.id === 'centraldark.vibeCoding' && view.type === 'webview'));
  assert.match(extension, /registerWebviewViewProvider\('centraldark\.vibeCoding'/);
});

test('human actions are exposed in natural PT-BR labels', () => {
  for (const label of [
    'Conectar ao servidor',
    'Testar a conexão',
    'Parear este VS Code',
    'Ver status e PIDs',
    'Compilar a extensão',
  ]) {
    assert.match(panel, new RegExp(label));
  }
});

test('natural language reuses existing commands instead of a second executor', () => {
  assert.match(panel, /centraldark\.connectVpsSsh/);
  assert.match(panel, /centraldark\.remoteTerminalPair/);
  assert.match(panel, /centraldark\.remoteTerminalStatus/);
  assert.match(panel, /centraldark\.buildExtension/);
});

test('VSIX metadata identifies the canonical repository', () => {
  assert.equal(pkg.repository?.url, 'https://github.com/ServerVpss/CentralDark.git');
  assert.equal(pkg.repository?.directory, 'skills/vs-code-restore');
});
