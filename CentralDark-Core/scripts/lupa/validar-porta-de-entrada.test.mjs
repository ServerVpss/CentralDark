import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {posix} from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const source = readFileSync(new URL('./validar-porta-de-entrada.mjs', import.meta.url), 'utf8');
const parserStart = source.indexOf('function caminhosCitados(texto) {');
const parserEnd = source.indexOf('\nfunction canonicos()', parserStart);
const gateStart = source.indexOf('for (const entrypoint of ENTRADAS) {');
const gateEnd = source.indexOf('\nconst canonicalDocuments = canonicos();', gateStart);
assert.ok(parserStart >= 0 && parserEnd > parserStart && gateStart >= 0 && gateEnd > gateStart);
const parser = source.slice(parserStart, parserEnd);
const entrypointGate = source.slice(gateStart, gateEnd);

function checkReferences(text, existing = []) {
  const files = new Map([['AGENTS.md', text], ...existing.map(path => [path, 'existing owner\n'])]);
  const context = {posix, ENTRADAS: ['AGENTS.md'], errors: [],
    existe: path => files.has(path), ler: path => files.get(path) || ''};
  vm.runInNewContext(parser + '\n' + entrypointGate, context);
  return Array.from(context.errors);
}

test('skill fragment selects the existing file without becoming a filename', () => {
  const path = '.agents/skills/centraldark-operational-method/SKILL.md';
  const text = `[método](${path}#protocolo-operacional-aprovado-pelo-chefe--execução-direta-e-contraprova-02112026)`;
  assert.deepEqual(checkReferences(text, [path]), []);
});

test('governance fragment keeps the canonical file check', () => {
  const path = 'docs/GOVERNANCA/REGRA-SECRETS-E-VARIAVEIS.md';
  const text = `[receita](${path}#mvp-e-teste-autorizado--autonomia-sem-bloqueio-artificial-16112026)`;
  assert.deepEqual(checkReferences(text, [path]), []);
});

test('a fragment never makes a missing owner pass', () => {
  assert.deepEqual(checkReferences('[missing](docs/missing-owner.md#section)'),
    ['CAMINHO_MORTO:AGENTS.md:docs/missing-owner.md']);
});

test('a missing reference without a fragment remains blocked', () => {
  assert.deepEqual(checkReferences('[missing](docs/missing-owner.md)'),
    ['CAMINHO_MORTO:AGENTS.md:docs/missing-owner.md']);
});

test('external URLs and local-section links do not become checkout paths', () => {
  assert.deepEqual(checkReferences('[source](https://example.invalid/owner.md#section) [here](#section)'), []);
});

test('an anchored root entrypoint resolves within the same checkout', () => {
  assert.deepEqual(checkReferences('[agents](AGENTS.md#section)'), []);
});
