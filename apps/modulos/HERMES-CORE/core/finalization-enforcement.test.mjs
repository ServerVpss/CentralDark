import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./orchestrator.mjs', import.meta.url), 'utf8');

test('orquestrador importa e aplica o gate final antes de registrar conclusão', () => {
  assert.match(source, /auditarFinalizacao/);
  const finish = source.indexOf('if (terminou)');
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })', finish);
  const block = source.indexOf('if (!finalizacao.aprovado)', gate);
  const conclude = source.indexOf('registrarConclusao();', block);

  assert.ok(finish >= 0, 'bloco terminou=true deve existir');
  assert.ok(gate > finish, 'gate final deve rodar dentro da proposta de conclusão');
  assert.ok(block > gate, 'veredito do gate deve ser verificado');
  assert.ok(conclude > block, 'registrarConclusao só pode ocorrer depois do gate');
});

test('conclusão bloqueada continua a missão em vez de quebrar o loop', () => {
  const block = source.indexOf('if (!finalizacao.aprovado)');
  const passLog = source.indexOf('finalization gate PASS', block);
  const trecho = source.slice(block, passLog);
  assert.match(trecho, /continue;/);
  assert.doesNotMatch(trecho, /registrarConclusao\(\)/);
});

test('reprovação ou indisponibilidade do Critic não vira verde', () => {
  assert.match(source, /resultadoAprovadoPeloCritic\(resultado, parecer\)/);
  assert.match(source, /critic falhou \(fail-closed\)/);
  assert.doesNotMatch(source, /critic falhou \(ignorado\)/);
  assert.match(source, /const entrada = \{ etapa_titulo, ferramenta, args, resultado: resultado\.saida, ok: etapaAprovada \}/);
});

test('receipt final é persistido antes do veredito de conclusão', () => {
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })');
  const writeReceipt = source.indexOf('writeFile(finalReceiptPath', gate);
  const conclude = source.indexOf('registrarConclusao();', gate);
  assert.ok(writeReceipt > gate);
  assert.ok(conclude > writeReceipt);
});
