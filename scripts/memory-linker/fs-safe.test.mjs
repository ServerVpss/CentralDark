#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { ensureRegularFileInsideRootSync } from './fs-safe.mjs';

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
