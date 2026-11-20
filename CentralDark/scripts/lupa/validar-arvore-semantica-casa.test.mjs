import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSemanticName, validateNewDirName } from './validar-arvore-semantica-casa.mjs';

test('aceita endereço 00..09 com nome semântico', () => {
  assert.equal(validateNewDirName('00-INDICE').ok, true);
  assert.equal(validateNewDirName('09-ARTEFATOS-VISUAIS').ok, true);
});

test('bloqueia pasta nova sem endereço numérico', () => {
  assert.deepEqual(validateNewDirName('CONCEITOS'), {
    ok: false,
    reason: 'NEW_DIRECTORY_MUST_USE_00_TO_09_PREFIX'
  });
});

test('bloqueia décimo-primeiro endereço lateral', () => {
  assert.equal(validateNewDirName('10-EXTRA').ok, false);
});

test('bloqueia balde genérico permanente', () => {
  assert.deepEqual(validateNewDirName('04-MISC'), {
    ok: false,
    reason: 'PERMANENT_GENERIC_BUCKET_FORBIDDEN'
  });
  assert.deepEqual(validateNewDirName('04-BACKUP'), {
    ok: false,
    reason: 'PERMANENT_GENERIC_BUCKET_FORBIDDEN'
  });
});

test('normalização preserva semântica e remove acentos', () => {
  assert.equal(normalizeSemanticName('07-APRENDIZADOS-MEMÓRIAS'), 'aprendizados-memorias');
});

test('pasta técnica oculta pode ser exceção local', () => {
  assert.deepEqual(validateNewDirName('.obsidian'), { ok: true, technical: true });
});
