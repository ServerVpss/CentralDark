import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'src', 'extension.ts'), 'utf8');

test('Remote-SSH is an explicit extension dependency', () => {
  assert.ok(pkg.extensionDependencies?.includes('ms-vscode-remote.remote-ssh'));
});

test('connection uses the alias that passed the SSH probe', () => {
  assert.match(source, /let succeeded: \(typeof VPS_ROUTES\)\[number\] \| null/);
  assert.match(source, /succeeded = route/);
  assert.match(source, /\{ host: succeeded\.alias \}/);
});

test('Remote-SSH public command surface is used', () => {
  assert.match(source, /opensshremotes\.openEmptyWindow/);
  assert.doesNotMatch(source, /remote-ssh\.connectToHost/);
});
