import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import { auditarFinalizacao } from '../agents/Critic/agent.mjs';

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

test('RED: UNKNOWN explícito não pode fechar a missão', () => {
  const r = auditarFinalizacao({
    missao: 'resolver incerteza',
    decisao: concluir('UNKNOWN'),
    historico: historicoFactual(),
  });
  assert.equal(r.aprovado, false);
  assert.equal(r.receipt.status, 'BLOCKED');
  assert.match(r.parecer, /estado semântico/i);
});

test('RED: ausência de estado semântico não pode fechar a missão', () => {
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
  }
});

test('decisor e orquestrador possuem contrato machine-readable de colapso', async () => {
  const decisor = await readFile(new URL('./decisor.mjs', import.meta.url), 'utf8');
  const orchestrator = await readFile(new URL('./orchestrator.mjs', import.meta.url), 'utf8');

  for (const estado of ['TESTE', 'FATO', 'FAIL', 'BLOCKED', 'CHEFE_SEGREDO_NECESSARIO']) {
    assert.match(decisor, new RegExp(estado));
  }
  assert.match(decisor, /estado/);
  assert.match(orchestrator, /CHEFE_SEGREDO_NECESSARIO/);
  assert.match(orchestrator, /terminalState = 'BLOCKED'/);
});
