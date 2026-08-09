'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const { _internals } = require('./contexto-centraldark.cjs');

const repoRoot = path.resolve(__dirname, '..', '..');
const aprendizadosPath = path.join(repoRoot, 'docs/CONSCIENCIA/APRENDIZADOS.md');

function titulosCanonicos() {
  const raw = fs.readFileSync(aprendizadosPath, 'utf8');
  return raw
    .split(/\n### /)
    .slice(1)
    .map((bloco) => bloco.split('\n')[0].replace(/^-?\d+\.?\s*/, '').trim())
    .filter(Boolean);
}

test('ultimosAprendizados devolve o fim do canônico, não o começo truncado', () => {
  const todos = titulosCanonicos();
  assert.ok(todos.length >= 4, 'fixture canônica precisa ter mais de três aprendizados');

  const esperado = todos.slice(-3);
  const observado = _internals.ultimosAprendizados(3);

  assert.deepEqual(observado, esperado);
  assert.notEqual(observado[0], todos[0]);
});

test('ultimosAprendizados inclui o aprendizado mais novo', () => {
  const todos = titulosCanonicos();
  const observado = _internals.ultimosAprendizados(1);

  assert.deepEqual(observado, [todos.at(-1)]);
});
