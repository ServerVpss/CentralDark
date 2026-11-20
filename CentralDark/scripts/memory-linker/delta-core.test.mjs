#!/usr/bin/env node

import assert from 'node:assert/strict';
import test from 'node:test';

import {
  canonicalizeFindings,
  findingFingerprint,
  informationGain,
} from './delta-core.mjs';

function findings(overrides = {}) {
  return {
    orfas: ['B', 'A'],
    brokenLinks: {
      Z: ['origem-2', 'origem-1'],
      A: ['origem-3'],
    },
    noConexoes: ['N2', 'N1'],
    semFrontmatter: ['F2', 'F1'],
    unsafePaths: ['U2', 'U1'],
    ...overrides,
  };
}

test('ordem diferente nao fabrica informacao nova', () => {
  const a = findings();
  const b = {
    orfas: ['A', 'B'],
    brokenLinks: {
      A: ['origem-3'],
      Z: ['origem-1', 'origem-2'],
    },
    noConexoes: ['N1', 'N2'],
    semFrontmatter: ['F1', 'F2'],
    unsafePaths: ['U1', 'U2'],
  };

  assert.equal(findingFingerprint(a), findingFingerprint(b));
});

test('duplicacao dentro do mesmo achado e comprimida antes do fingerprint', () => {
  const normalized = canonicalizeFindings(findings({
    orfas: ['A', 'A', 'B'],
    brokenLinks: { Z: ['origem-1', 'origem-1'], A: ['origem-3'] },
    unsafePaths: ['U1', 'U1'],
  }));

  assert.deepEqual(normalized.orfas, ['A', 'B']);
  assert.deepEqual(normalized.brokenLinks.Z, ['origem-1']);
  assert.deepEqual(normalized.unsafePaths, ['U1']);
});

test('novo achado muda fingerprint e gera ganho informacional', () => {
  const before = findingFingerprint(findings());
  const after = findingFingerprint(findings({ orfas: ['A', 'B', 'C'] }));

  assert.notEqual(before, after);
  assert.equal(informationGain(before, after), true);
});

test('mesmo fingerprint significa saturacao e STOP', () => {
  const fingerprint = findingFingerprint(findings());
  assert.equal(informationGain(fingerprint, fingerprint), false);
});

test('primeira observacao tem ganho informacional', () => {
  const fingerprint = findingFingerprint(findings());
  assert.equal(informationGain(null, fingerprint), true);
});

test('unsafe path novo conta como informacao material', () => {
  const before = findingFingerprint(findings({ unsafePaths: [] }));
  const after = findingFingerprint(findings({ unsafePaths: ['docs/CONSCIENCIA/x.md:PATH_SYMLINK_FORBIDDEN'] }));

  assert.notEqual(before, after);
  assert.equal(informationGain(before, after), true);
});

test('fingerprint atual ausente falha fechado', () => {
  assert.throws(() => informationGain('abc', ''), /CURRENT_FINGERPRINT_REQUIRED/);
});
