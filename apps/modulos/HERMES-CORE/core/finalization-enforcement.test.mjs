import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const source = await readFile(new URL('./orchestrator.mjs', import.meta.url), 'utf8');
const executorSource = await readFile(new URL('../agents/Executor/agent.mjs', import.meta.url), 'utf8');
const knowledgeSource = await readFile(new URL('../agents/Knowledge-Collector/agent.mjs', import.meta.url), 'utf8');
const legacyEntrypointSource = await readFile(new URL('../../../../docs/CONSCIENCIA/ARSENAL/hermes-vivo/daemon.mjs', import.meta.url), 'utf8');

test('T1: terminou=true passa pelo gate antes de qualquer conclusão', () => {
  assert.match(source, /auditarFinalizacao/);
  const finish = source.indexOf('if (terminou)');
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })', finish);
  const unavailable = source.indexOf('if (!gateDisponivel)', gate);
  const reject = source.indexOf('if (!finalizacao.aprovado)', unavailable);
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", reject);

  assert.ok(finish >= 0, 'bloco terminou=true deve existir');
  assert.ok(gate > finish, 'gate final deve rodar dentro da proposta de conclusão');
  assert.ok(unavailable > gate, 'indisponibilidade do gate deve ser tratada explicitamente');
  assert.ok(reject > unavailable, 'rejeição normal deve ser separada de indisponibilidade');
  assert.ok(markPass > reject, 'estado CONCLUIDA só pode nascer depois dos dois gates');
});

test('T4: exception/indisponibilidade do gate vira BLOCKED + break', () => {
  const unavailable = source.indexOf('if (!gateDisponivel)');
  const reject = source.indexOf('if (!finalizacao.aprovado)', unavailable);
  assert.ok(unavailable >= 0);
  assert.ok(reject > unavailable);

  const trecho = source.slice(unavailable, reject);
  assert.match(trecho, /terminalState = 'BLOCKED'/);
  assert.match(trecho, /terminalReason = 'FINALIZATION_GATE_UNAVAILABLE'/);
  assert.match(trecho, /break;/);
  assert.doesNotMatch(trecho, /continue;/);
  assert.doesNotMatch(trecho, /terminalState = 'CONCLUIDA'/);
  assert.doesNotMatch(trecho, /MISSÃO CONCLUÍDA/);
});

test('T1: rejeição normal por evidência insuficiente permanece RUNNING e continua buscando prova', () => {
  const reject = source.indexOf('if (!finalizacao.aprovado)');
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", reject);
  const trecho = source.slice(reject, markPass);

  assert.match(trecho, /terminal_state: 'RUNNING'/);
  assert.match(trecho, /terminal_reason: 'FINALIZATION_GATE_BLOCKED'/);
  assert.match(trecho, /continue;/);
  assert.doesNotMatch(trecho, /terminalState = 'BLOCKED'/);
  assert.doesNotMatch(trecho, /registrarConclusao\(\)/);
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

test('T6: qualquer caminho não concluído retorna antes de move/notificação verde', () => {
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

test('receipt final é persistido antes de qualquer veredito de conclusão', () => {
  const gate = source.indexOf('auditarFinalizacao({ missao, decisao, historico })');
  const writeReceipt = source.indexOf('writeFile(finalReceiptPath', gate);
  const unavailable = source.indexOf('if (!gateDisponivel)', gate);
  const markPass = source.indexOf("terminalState = 'CONCLUIDA'", gate);
  assert.ok(writeReceipt > gate);
  assert.ok(unavailable > writeReceipt);
  assert.ok(markPass > writeReceipt);
});

test('BLOCKED fica em em-andamento e retomada automática respeita o bloqueio', () => {
  assert.match(source, /terminal_state === 'BLOCKED'/);
  assert.match(source, /RETOMADA BLOQUEADA/);
  assert.match(source, /missão permanece em-andamento/);
});

test('T14 Executor: aprender persiste no owner único e faz read-back do ledger', () => {
  const start = executorSource.indexOf("case 'aprender':");
  const end = executorSource.indexOf("case 'git':", start);
  const trecho = executorSource.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(trecho, /registrarNoLedger\(/);
  assert.match(trecho, /readFile\(ARSENAL_APRENDIZADOS/);
  assert.doesNotMatch(trecho, /knowledge\/aprendizados\.json/);
  assert.match(trecho, /LEARNING_PERSISTENCE_VERIFIED=true/);
  assert.match(trecho, /learning_ref=/);
  assert.match(knowledgeSource, /export function consultarContexto/);
  assert.match(knowledgeSource, /deduped: true/);
});

test('T15 Hermes aprende etapa material antes da conclusão/fixed point', () => {
  const approved = source.indexOf('const etapaAprovada = resultadoAprovadoPeloCritic');
  const capture = source.indexOf('registrarAprendizadoMaterial({ slug, etapa_titulo, ferramenta, resultado })', approved);
  const learningRef = source.indexOf('entrada.learning_ref = aprendizagem.ref', capture);
  const historyPush = source.indexOf('historico.push(entrada)', learningRef);
  const finalGuard = source.indexOf("if (terminalState !== 'CONCLUIDA')", historyPush);

  assert.ok(approved >= 0);
  assert.ok(capture > approved, 'captura deve ocorrer depois de Executor+Critic aprovarem');
  assert.ok(learningRef > capture, 'learning_ref precisa entrar no histórico');
  assert.ok(historyPush > learningRef, 'histórico só é persistido depois do learning_ref');
  assert.ok(finalGuard > historyPush, 'aprendizado ocorre antes da finalização da missão');
  assert.match(source, /FIXED_POINT é checkpoint de verificação, não gate para capacitação do Hermes/);
});

test('T14 Executor: commit_push falha fechado e só fica verde após ler o HEAD remoto', () => {
  const start = executorSource.indexOf("if (acao === 'commit_push')");
  const end = executorSource.indexOf('return { ok: false, saida: `ação git desconhecida', start);
  const trecho = executorSource.slice(start, end);

  assert.ok(start >= 0 && end > start);
  assert.match(trecho, /bash scripts\/lupa\/writer-safe-push-main\.sh/);
  assert.match(trecho, /REMOTE_HEAD_VERIFIED=\[0-9a-f\]\{[0-9,]+\}/);
  assert.match(trecho, /\.test\(stdout\)/);
  assert.match(trecho, /PUBLISH_BLOCKED_REMOTE_READBACK_MISSING/);
});


test('T16 entrypoint PM2 legado converge no Core e fila antiga não cria segundo Hermes', () => {
  assert.match(legacyEntrypointSource, /legacy-compat-to-hermes-core/);
  assert.match(legacyEntrypointSource, /HERMES-CORE\/core\/orchestrator\.mjs/);
  assert.match(source, /const LEGACY_PENDENTE = '\/root\/CentralDark\/missoes\/pendente'/);
  assert.match(source, /for \(const inbox of \[PENDENTE, LEGACY_PENDENTE\]\)/);
});
