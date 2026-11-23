import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const repo = process.cwd();
const script = path.join(repo, 'scripts/memory-linker/inbox-sentinel.mjs');

test('inbox sentinel classifies material and stays dry-run', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inbox-sentinel-'));
  const inbox = path.join(tmp, 'inbox');
  const report = path.join(tmp, 'report.json');
  fs.mkdirSync(inbox);
  fs.writeFileSync(path.join(inbox, 'README.md'), 'ignore me');
  fs.writeFileSync(path.join(inbox, '.gitkeep'), '');
  fs.writeFileSync(path.join(inbox, '2026-09-13-fonte-chefe-teste.md'), '# matéria\nsem segredo\n');
  const run = spawnSync(process.execPath, [script, '--dry-run', '--inbox', inbox, '--report', report], {
    cwd: repo,
    encoding: 'utf8',
  });
  assert.equal(run.status, 0, run.stderr);
  const parsed = JSON.parse(fs.readFileSync(report, 'utf8'));
  assert.equal(parsed.count, 1);
  assert.equal(parsed.direct_canonical_mutation, false);
  assert.equal(parsed.apply_allowed, false);
  assert.equal(parsed.items[0].status, 'PENDING_DREAM_REVIEW');
  assert.equal(parsed.items[0].kanban.reason, 'DRY_RUN');
});

test('inbox sentinel blocks secret-like material', () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inbox-sentinel-secret-'));
  const inbox = path.join(tmp, 'inbox');
  const report = path.join(tmp, 'report.json');
  fs.mkdirSync(inbox);
  const fakeSecret = `sk-${'abcdefghijklmnopqrstuvwxyz'}`;
  fs.writeFileSync(path.join(inbox, 'bad.md'), `token=${fakeSecret}`);
  const run = spawnSync(process.execPath, [script, '--dry-run', '--inbox', inbox, '--report', report], {
    cwd: repo,
    encoding: 'utf8',
  });
  assert.equal(run.status, 2, run.stderr);
  const parsed = JSON.parse(fs.readFileSync(report, 'utf8'));
  assert.equal(parsed.items[0].status, 'BLOCKED_SECRET_RISK');
  assert.equal(parsed.items[0].secret_risk, true);
});
