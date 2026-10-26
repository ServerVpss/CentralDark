import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { appendSuccessful, latestSuccessful, nextPatch, readLedger } from './centraldark-build-ledger.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ledger = readLedger(path.join(root, 'resources', 'build-history.json'));

test('marco historico do builder 1.0.0 tem prova e nao declara deploy', () => {
  assert.equal(ledger.schema, 'centraldark.desktop-builder-ledger/v1');
  assert.equal(ledger.entries.length, 1);
  const first = ledger.entries[0];
  assert.equal(first.builder_version, '1.0.0');
  assert.equal(first.build_status, 'PASS');
  assert.equal(first.runtime_status, 'LOCAL_SMOKE_PASS');
  assert.equal(first.deploy_status, 'NOT_PROVEN');
  assert.match(first.source_commit, /^9051151[a-f0-9]{33}$/);
  assert.match(first.artifacts.installer.sha256, /^[a-f0-9]{64}$/);
  assert.match(first.artifacts.executable.sha256, /^[a-f0-9]{64}$/);
  assert.equal(new Date(first.validated_at).toISOString(), '2026-10-25T10:47:07.000Z');
});

test('versao aumenta apenas por build PASS, sem duplicar', () => {
  assert.equal(nextPatch(latestSuccessful(ledger).builder_version), '1.0.1');
  assert.throws(() => nextPatch('unknown'), /INVALID_SEMVER/);
  const candidate = {
    ...ledger.entries[0], id: 'builder-1.0.1-candidate', builder_version: '1.0.1', app_version: '1.0.1',
    runtime_status: 'NOT_PROVEN', validated_at: null,
  };
  const appended = appendSuccessful(ledger, candidate);
  assert.equal(appended.entries.length, 2);
  assert.equal(ledger.entries.length, 1);
  assert.throws(() => appendSuccessful(appended, candidate), /DUPLICATE_BUILD/);
  assert.throws(() => appendSuccessful(ledger, { ...candidate, build_status: 'FAIL' }), /BUILD_PASS_REQUIRED/);
});

test('desktop exibe historico pelo IPC restrito com receita fixa', () => {
  const main = readFileSync(path.join(root, 'electron', 'main', 'index.ts'), 'utf8');
  const preload = readFileSync(path.join(root, 'electron', 'preload', 'index.ts'), 'utf8');
  const cockpit = readFileSync(path.join(root, 'app', 'components', 'centraldark', 'CentralDarkCockpitShell.client.tsx'), 'utf8');
  const ui = readFileSync(path.join(root, 'app', 'components', 'centraldark', 'CentralDarkBuilderHistory.client.tsx'), 'utf8');
  const rebuild = readFileSync(path.join(root, 'scripts', 'centraldark-rebuild.mjs'), 'utf8');
  assert.match(main, /centraldark:builders:get/);
  assert.match(main, /centraldark:builders:rebuild/);
  assert.match(main, /trustedBuilderCaller\(event\)/);
  assert.match(preload, /getBuilderHistory/);
  assert.match(preload, /requestBuilderRebuild/);
  assert.match(cockpit, /<CentralDarkBuilderHistory bridge=\{getBridge\(\)\}/);
  assert.match(ui, /Rebuild Windows/);
  assert.match(ui, /window\.confirm/);
  assert.match(ui, /America\/Bahia/);
  assert.match(rebuild, /WORKTREE_DIRTY_USE_DEDICATED_CLEAN_WORKTREE/);
  assert.match(rebuild, /--frozen-lockfile --prod=false/);
  assert.match(rebuild, /BUILD_PASS_RUNTIME_PENDING/);
  assert.doesNotMatch(rebuild, /git push|git merge|gh pr merge/);
});

test('verificador nao executa build sem --execute', () => {
  const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(packageJson.version, '1.0.0');
  assert.equal(packageJson.scripts['centraldark:rebuild:win'], 'node scripts/centraldark-rebuild.mjs --execute');
  assert.equal(packageJson.scripts['centraldark:builders:verify'], 'node scripts/centraldark-rebuild.mjs --verify');
});
