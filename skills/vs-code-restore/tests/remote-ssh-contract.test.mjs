import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const source = fs.readFileSync(path.join(root, 'src', 'extension.ts'), 'utf8');
const remote = fs.readFileSync(path.join(root, 'src', 'remote-terminal.ts'), 'utf8');

test('Remote-SSH is an explicit dependency', () => {
  assert.ok(pkg.extensionDependencies?.includes('ms-vscode-remote.remote-ssh'));
});

test('connection preserves the exact alias that passed the probe', () => {
  assert.match(source, /let succeeded: \(typeof VPS_ROUTES\)\[number\] \| null/);
  assert.match(source, /succeeded = route/);
  assert.match(source, /\{ host: succeeded\.alias \}/);
});

test('uses the Remote-SSH command surface exposed by 0.128.0', () => {
  assert.match(source, /opensshremotes\.openEmptyWindow/);
  assert.doesNotMatch(source, /remote-ssh\.connectToHost/);
});

test('paired receiver stays loopback-only and requires local consent', () => {
  assert.match(remote, /candidate\.listen\(port, "127\.0\.0\.1"/);
  assert.match(remote, /LOCAL_CONSENT_DENIED/);
  assert.match(remote, /showWarningMessage/);
});
