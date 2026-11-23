#!/usr/bin/env node
import test from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {
  CC2003_SOURCE,
  discoverPdfByIdentity,
  inspectArtifact,
  resolvePdfReference,
} from './pdf-conformance-cc2003.mjs';

const CANONICAL = path.resolve('docs/CONSCIENCIA/04-MCP-E-CONECTORES/tlc23.pdf');

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'centraldark-cc2003-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('fonte canônica possui a identidade CC2003 esperada', () => {
  const result = inspectArtifact(CANONICAL);
  assert.equal(result.status, 'PROVED_IN_SCOPE');
  assert.equal(result.sizeBytes, CC2003_SOURCE.expectedSizeBytes);
  assert.equal(result.sha256, CC2003_SOURCE.expectedSha256);
});

test('mesmo SHA e tamanho com nome diferente continua sendo o mesmo artefato', () => {
  withTempDir((dir) => {
    const renamed = path.join(dir, 'qualquer-nome-de-upload.pdf');
    cpSync(CANONICAL, renamed);

    const direct = inspectArtifact(renamed);
    assert.equal(direct.status, 'PROVED_IN_SCOPE');
    assert.equal(path.basename(direct.path), 'qualquer-nome-de-upload.pdf');

    const discovered = discoverPdfByIdentity({ roots: [dir] });
    assert.equal(discovered.status, 'PROVED_IN_SCOPE');
    assert.equal(discovered.resolution, 'DISCOVERED_BY_IDENTITY');
    assert.equal(path.basename(discovered.path), 'qualquer-nome-de-upload.pdf');
  });
});

test('mesmo nome com bytes diferentes falha fechado', () => {
  withTempDir((dir) => {
    const misleading = path.join(dir, 'tlc23.pdf');
    const canonicalBytes = readFileSync(CANONICAL);
    const tampered = Buffer.from(canonicalBytes);
    tampered[0] = tampered[0] ^ 0xff;
    writeFileSync(misleading, tampered);

    const result = inspectArtifact(misleading);
    assert.equal(result.status, 'REFUTED_IN_SCOPE');
    assert.equal(result.reason, 'BYTE_IDENTITY_MISMATCH');
  });
});

test('path vazio resolve identidade conhecida em local autorizado', () => {
  withTempDir((dir) => {
    const renamed = path.join(dir, 'tlc23(99).pdf');
    cpSync(CANONICAL, renamed);

    const result = resolvePdfReference('', { roots: [dir] });
    assert.equal(result.status, 'PROVED_IN_SCOPE');
    assert.equal(result.resolution, 'DISCOVERED_BY_IDENTITY');
  });
});

test('path vazio sem identidade conhecida preserva UNKNOWN', () => {
  withTempDir((dir) => {
    writeFileSync(path.join(dir, 'outro.pdf'), Buffer.from('not-cc2003'));
    const result = resolvePdfReference('', { roots: [dir] });
    assert.equal(result.status, 'UNKNOWN');
    assert.equal(result.reason, 'KNOWN_IDENTITY_NOT_FOUND_IN_AUTHORIZED_ROOTS');
  });
});
