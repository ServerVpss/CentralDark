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
