import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { auditarFinalizacao } from '../agents/Critic/agent.mjs';
import { validarDecisao } from './decisor.mjs';

const historicoFactual = () => [{
  etapa_titulo: 'status',
  ferramenta: 'git',
  args: { acao: 'status' },
  resultado: 'clean',
  ok: true,
}];

const concluir = (estado) => ({
  terminou: true,
  estado,
  ferramenta: 'notificar_progresso',
  args: { mensagem: 'missão encerrada' },
  _modelo_usado: 'test-model',
});

test('UNKNOWN explícito não pode fechar a missão', () => {
  const r = auditarFinalizacao({
    missao: 'resolver incerteza',
    decisao: concluir('UNKNOWN'),
    historico: historicoFactual(),
  });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.match(r.parecer, /estado semântico/i);
});

test('ausência de estado semântico não pode fechar a missão', () => {
  const decisao = concluir(undefined);
  delete decisao.estado;
  const r = auditarFinalizacao({
    missao: 'resolver incerteza',
    decisao,
    historico: historicoFactual(),
  });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.match(r.parecer, /estado semântico/i);
});

test('FATO continua elegível ao gate de evidência existente', () => {
  const r = auditarFinalizacao({
    missao: 'consultar status',
    decisao: concluir('FATO'),
    historico: historicoFactual(),
  });
  assert.equal(r.aprovado, true);
  assert.equal(r.receipt.status, 'PASS');
  assert.equal(r.receipt.semantic_state, 'FATO');
});

test('TESTE, FAIL, BLOCKED e CHEFE_SEGREDO_NECESSARIO não viram PASS final', () => {
  for (const estado of ['TESTE', 'FAIL', 'BLOCKED', 'CHEFE_SEGREDO_NECESSARIO']) {
    const r = auditarFinalizacao({
      missao: 'resolver incerteza',
      decisao: concluir(estado),
      historico: historicoFactual(),
    });
    assert.equal(r.aprovado, false, estado);
    assert.equal(r.receipt.status, 'BLOCKED', estado);
    assert.equal(r.receipt.semantic_state, estado, estado);
  }
});

test('decisor rejeita UNKNOWN, ausência e terminou=true fora de FATO', () => {
  assert.throws(() => validarDecisao({ estado: 'UNKNOWN', terminou: false }), /estado semântico inválido/);
  assert.throws(() => validarDecisao({ terminou: false }), /estado semântico inválido/);
  assert.throws(() => validarDecisao({ estado: 'TESTE', terminou: true }), /não pode encerrar missão/);
  assert.throws(() => validarDecisao({ estado: 'BLOCKED', terminou: true }), /não pode encerrar missão/);
});

test('decisor aceita somente os cinco estados de colapso', () => {
  for (const estado of ['TESTE', 'FATO', 'FAIL', 'BLOCKED', 'CHEFE_SEGREDO_NECESSARIO']) {
    const decisao = validarDecisao({ estado, terminou: false, ferramenta: 'ler_arquivo', args: {} });
    assert.equal(decisao.estado, estado);
  }
});

test('cache legado inválido é descartado antes de bloquear o fallback', async () => {
  const decisor = await readFile(new URL('./decisor.mjs', import.meta.url), 'utf8');
  const inicio = decisor.indexOf('function verCache(k)');
  const fim = decisor.indexOf('function salvarCache', inicio);
  const trecho = decisor.slice(inicio, fim);

  assert.ok(inicio >= 0);
  assert.ok(fim > inicio);
  assert.match(trecho, /return validarDecisao\(it\.valor\)/);
  assert.match(trecho, /catch\s*\{/);
  assert.match(trecho, /cache\.delete\(k\)/);
  assert.match(trecho, /return null/);
});

test('rejeição do gate final mantém o orquestrador no loop e CONCLUIDA nasce depois do gate', async () => {
  const orchestrator = await readFile(new URL('./orchestrator.mjs', import.meta.url), 'utf8');
  const reject = orchestrator.indexOf('if (!finalizacao.aprovado)');
  const pass = orchestrator.indexOf("terminalState = 'CONCLUIDA'", reject);
  const trecho = orchestrator.slice(reject, pass);

  assert.ok(reject >= 0);
  assert.ok(pass > reject);
  assert.match(trecho, /terminal_state: 'RUNNING'/);
  assert.match(trecho, /continue;/);
  assert.doesNotMatch(trecho, /terminalState = 'CONCLUIDA'/);
});
