#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { atomicWriteUtf8Sync, ensureRegularFileInsideRootSync } from './fs-safe.mjs';

test('aceita arquivo regular fisicamente dentro da raiz', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-path-safe-'));
  try {
    const root = path.join(base, 'root');
    fs.mkdirSync(root);
    const file = path.join(root, 'nota.md');
    fs.writeFileSync(file, '# ok\n');

    assert.equal(ensureRegularFileInsideRootSync(root, file), fs.realpathSync(file));
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('recusa symlink md mesmo quando o link mora dentro da raiz', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-path-safe-'));
  try {
    const root = path.join(base, 'root');
    fs.mkdirSync(root);
    const outside = path.join(base, 'fora.md');
    fs.writeFileSync(outside, '# nao tocar\n');
    const link = path.join(root, 'atalho.md');
    fs.symlinkSync(outside, link);

    assert.throws(
      () => ensureRegularFileInsideRootSync(root, link),
      /PATH_SYMLINK_FORBIDDEN/,
    );
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('recusa diretorio quando consumidor exige arquivo regular', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-path-safe-'));
  try {
    const root = path.join(base, 'root');
    const nested = path.join(root, 'pasta');
    fs.mkdirSync(nested, { recursive: true });

    assert.throws(
      () => ensureRegularFileInsideRootSync(root, nested),
      /PATH_NOT_REGULAR_FILE/,
    );
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('escrita atomica preserva modo de arquivo existente', () => {
  if (process.platform === 'win32') return;
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-atomic-mode-'));
  try {
    const file = path.join(base, 'nota.md');
    fs.writeFileSync(file, 'antes\n', { mode: 0o644 });
    fs.chmodSync(file, 0o644);

    assert.equal(atomicWriteUtf8Sync(file, 'depois\n'), 'UPDATED');
    assert.equal(fs.statSync(file).mode & 0o777, 0o644);
    assert.equal(fs.readFileSync(file, 'utf8'), 'depois\n');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('arquivo novo usa 0600 por padrao', () => {
  if (process.platform === 'win32') return;
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-atomic-mode-'));
  try {
    const file = path.join(base, 'novo.json');
    assert.equal(atomicWriteUtf8Sync(file, '{}\n'), 'UPDATED');
    assert.equal(fs.statSync(file).mode & 0o777, 0o600);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('escrita atomica recusa substituir symlink existente', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-atomic-link-'));
  try {
    const outside = path.join(base, 'fora.txt');
    fs.writeFileSync(outside, 'intacto\n');
    const link = path.join(base, 'alvo.txt');
    fs.symlinkSync(outside, link);

    assert.throws(
      () => atomicWriteUtf8Sync(link, 'nao escrever\n'),
      /ATOMIC_TARGET_SYMLINK_FORBIDDEN/,
    );
    assert.equal(fs.readFileSync(outside, 'utf8'), 'intacto\n');
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('no-op nao toca conteudo nem mtime', () => {
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-atomic-noop-'));
  try {
    const file = path.join(base, 'igual.txt');
    fs.writeFileSync(file, 'igual\n');
    const beforeMtime = fs.statSync(file).mtimeMs;
    assert.equal(atomicWriteUtf8Sync(file, 'igual\n'), 'UNCHANGED');
    assert.equal(fs.statSync(file).mtimeMs, beforeMtime);
  } finally {
    fs.rmSync(base, { recursive: true, force: true });
  }
});

test('memory executor bloqueia push por padrao e exige MEMORY_GIT_PUSH=1 exato', () => {
  const executor = fs.readFileSync(new URL('./memory-executor-agent.mjs', import.meta.url), 'utf8');
  const guard = "if (process.env.MEMORY_GIT_PUSH !== '1')";
  const blocked = "pushStatus = 'BLOCKED_BY_MEMORY_GIT_PUSH'";
  const push = "execFileSync('git', ['-C', RAIZ, 'push', 'origin', 'main']";

  const guardIndex = executor.indexOf(guard);
  const blockedIndex = executor.indexOf(blocked);
  const pushIndex = executor.indexOf(push);

  assert.ok(guardIndex >= 0, 'MEMORY_GIT_PUSH exact gate must exist');
  assert.ok(blockedIndex > guardIndex, 'blocked status must be inside/after the fail-closed guard');
  assert.ok(pushIndex > blockedIndex, 'git push must only appear after the blocked branch');
  assert.equal(executor.split(push).length - 1, 1, 'there must be exactly one direct push origin/main site');
  assert.match(executor.slice(blockedIndex, pushIndex), /\}\s*else\s*\{/s, 'push must live in the explicit allowed branch');
  assert.doesNotMatch(executor, /MEMORY_GIT_PUSH\s*(?:===|==)\s*['"](?:true|yes|on)['"]/i);
});
