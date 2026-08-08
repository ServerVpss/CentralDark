import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./orchestrator.mjs', import.meta.url), 'utf8');

test('T1: terminou=true passa pelo gate antes de qualquer conclusão', () => {
  assert.match(source, /auditarFinalizacao/);
  const finish = source.indexOf('if (terminou)');
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })', finish);
  const block = source.indexOf('if (!finalizacao.aprovado)', gate);
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", block);

  assert.ok(finish >= 0, 'bloco terminou=true deve existir');
  assert.ok(gate > finish, 'gate final deve rodar dentro da proposta de conclusão');
  assert.ok(block > gate, 'veredito do gate deve ser verificado');
  assert.ok(markPass > block, 'estado CONCLUIDA só pode nascer depois do gate');
});

test('T1/T4: conclusão bloqueada ou gate indisponível não encerra a missão', () => {
  const gateCatch = source.indexOf("gate final indisponível:");
  const block = source.indexOf('if (!finalizacao.aprovado)');
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", block);
  const trecho = source.slice(block, markPass);

  assert.ok(gateCatch >= 0);
  assert.match(trecho, /continue;/);
  assert.doesNotMatch(trecho, /registrarConclusao\(\)/);
  assert.doesNotMatch(trecho, /MISSÃO CONCLUÍDA/);
});

test('T2: MAX_FALHAS de Executor/Critic vira BLOCKED e não CONCLUIDA', () => {
  const anchor = source.indexOf("terminalReason = 'MAX_FALHAS_EXECUTOR_OR_CRITIC'");
  assert.ok(anchor >= 0);
  const trecho = source.slice(Math.max(0, anchor - 220), anchor + 260);
  assert.match(trecho, /terminalState = 'BLOCKED'/);
  assert.doesNotMatch(trecho, /terminalState = 'CONCLUIDA'/);
});

test('T3: MAX_FALHAS do decisor vira BLOCKED e não CONCLUIDA', () => {
  const anchor = source.indexOf("terminalReason = 'MAX_FALHAS_DECISOR'");
  assert.ok(anchor >= 0);
  const trecho = source.slice(Math.max(0, anchor - 220), anchor + 220);
  assert.match(trecho, /terminalState = 'BLOCKED'/);
  assert.doesNotMatch(trecho, /terminalState = 'CONCLUIDA'/);
});

test('T5: só CONCLUIDA tenta mover e só move bem-sucedido registra conclusão', () => {
  const guard = source.indexOf("if (terminalState !== 'CONCLUIDA')");
  const move = source.indexOf('moverMissaoParaConcluida(dir, slug, lg)', guard);
  const moveFail = source.indexOf('if (!movida.ok)', move);
  const conclude = source.indexOf('registrarConclusao();', moveFail);
  const finalNotify = source.indexOf('Hermes: MISSÃO CONCLUÍDA 🎉', conclude);

  assert.ok(guard >= 0);
  assert.ok(move > guard);
  assert.ok(moveFail > move);
  assert.ok(conclude > moveFail, 'métrica de conclusão só depois de promoção física bem-sucedida');
  assert.ok(finalNotify > conclude, 'notificação verde só depois do move e da conclusão');
  assert.equal(source.indexOf('moverMissaoParaConcluida(dir, slug, lg)', move + 1), -1, 'move deve ocorrer uma única vez');
});

test('T6: caminho não concluído retorna antes de move/notificação verde', () => {
  const guard = source.indexOf("if (terminalState !== 'CONCLUIDA')");
  const move = source.indexOf('moverMissaoParaConcluida(dir, slug, lg)', guard);
  const trecho = source.slice(guard, move);
  assert.match(trecho, /return \{ ok: false/);
  assert.doesNotMatch(trecho, /MISSÃO CONCLUÍDA/);
});

test('Critic reprovado ou indisponível não vira etapa verde', () => {
  assert.match(source, /resultadoAprovadoPeloCritic\(resultado, parecer\)/);
  assert.match(source, /critic falhou \(fail-closed\)/);
  assert.doesNotMatch(source, /critic falhou \(ignorado\)/);
  assert.match(source, /const entrada = \{ etapa_titulo, ferramenta, args, resultado: resultado\.saida, ok: etapaAprovada \}/);
});

test('receipt final é persistido antes do veredito de conclusão', () => {
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })');
  const writeReceipt = source.indexOf('writeFile(finalReceiptPath', gate);
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", gate);
  assert.ok(writeReceipt > gate);
  assert.ok(markPass > writeReceipt);
});

test('BLOCKED fica em em-andamento e retomada automática respeita o bloqueio', () => {
  assert.match(source, /terminal_state === 'BLOCKED'/);
  assert.match(source, /RETOMADA BLOQUEADA/);
  assert.match(source, /missão permanece em-andamento/);
});
