import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatHermesEvent, notifyViaHermes } from './hermes-notify.mjs';

const EVENT = {
  type: 'ALERT',
  area: 'Workflows',
  title: 'Workflow vermelho: codex-validate',
  issueNumber: 715,
  url: 'https://github.com/ServerVpss/CentralDark/issues/715',
};

function fakeSpawn(result) {
  return () => result;
}

test('formata ALERT sem incluir detalhe cru', () => {
  const card = formatHermesEvent({ ...EVENT, detalhe: 'segredo-que-nao-deve-ir' });
  assert.match(card.title, /Sentinela/);
  assert.match(card.message, /#715/);
  assert.doesNotMatch(card.message, /segredo-que-nao-deve-ir/);
});

test('formata RECOVERY de forma distinta', () => {
  const card = formatHermesEvent({ ...EVENT, type: 'RECOVERY' });
  assert.match(card.title, /recuperação/i);
  assert.match(card.message, /RECUPERAÇÃO/);
});

test('stdout enviado -> SENT', () => {
  const r = notifyViaHermes(EVENT, { spawn: fakeSpawn({ status: 0, stdout: '[notify] enviado\n', stderr: '' }) });
  assert.equal(r.status, 'SENT');
});

test('sem token -> UNAVAILABLE, nunca SENT', () => {
  const r = notifyViaHermes(EVENT, { spawn: fakeSpawn({ status: 0, stdout: '[notify] sem token válido de bot — modo silencioso\n', stderr: '' }) });
  assert.equal(r.status, 'UNAVAILABLE');
});

test('falha Telegram -> FAILED', () => {
  const r = notifyViaHermes(EVENT, { spawn: fakeSpawn({ status: 0, stdout: '', stderr: '[notify] telegram falhou 500' }) });
  assert.equal(r.status, 'FAILED');
});

test('saída ambígua -> UNKNOWN, nunca falso verde', () => {
  const r = notifyViaHermes(EVENT, { spawn: fakeSpawn({ status: 0, stdout: '[notify] executado', stderr: '' }) });
  assert.equal(r.status, 'UNKNOWN');
});

test('processo não-zero -> FAILED', () => {
  const r = notifyViaHermes(EVENT, { spawn: fakeSpawn({ status: 2, stdout: '', stderr: 'boom' }) });
  assert.equal(r.status, 'FAILED');
});

test('tipo inválido falha fechado', () => {
  assert.throws(() => formatHermesEvent({ ...EVENT, type: 'KEEP' }), /ALERT ou RECOVERY/);
});
