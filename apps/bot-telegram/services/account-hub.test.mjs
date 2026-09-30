import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const hub = require('./account-hub.cjs');

test('status humano diferencia verde, expirado e não autorizado', () => {
  assert.equal(hub.humanStatus({ status: 'active', last_test_status: 'pass' }).icon, '🟢');
  assert.equal(
    hub.humanStatus({ status: 'active', expires_at: '2000-01-01T00:00:00Z' }).icon,
    '🟠',
  );
  assert.equal(hub.humanStatus({ status: 'unauthorized' }).icon, '🔴');
});

test('URL de autorização usa a rota pública esperada', () => {
  const url = hub.oauthUrl('github', '12345');
  assert.match(url, /\/oauth\/github\/start/);
  assert.match(url, /user_id=12345/);
});

test('render de provider ignora campos não projetados', () => {
  const snapshot = {
    ok: true,
    providers: [{ id: 'claude', display_name: 'Claude', auth_type: 'api_key' }],
    connections: [{
      id: '11111111-1111-1111-1111-111111111111',
      provider_id: 'claude',
      account_label: 'Principal',
      status: 'active',
      last_test_status: 'pass',
      internal_material: 'DO_NOT_RENDER',
    }],
  };

  const output = hub.renderProvider(snapshot, 'claude');
  assert.match(output, /Conectado e testado/);
  assert.doesNotMatch(output, /DO_NOT_RENDER/);
  assert.match(output, /NOT_EXECUTED/);
});

test('pool Claude evita conta já visitada e escolhe próxima saudável', () => {
  const snapshot = { connections: [
    { id: 'a', provider_id: 'claude', account_label: 'Principal', status: 'active', last_test_status: 'pass' },
    { id: 'b', provider_id: 'claude', account_label: 'Reserva', status: 'active', last_test_status: 'pass' },
  ] };
  const plan = hub.planFailover(snapshot, 'claude', { visitedIds: ['a'] });
  assert.equal(plan.state, 'ACCOUNT_CANDIDATE');
  assert.equal(plan.candidate.id, 'b');
  assert.equal(plan.candidate.label, 'Reserva');
});

test('LIMIT_REACHED não troca conta sem permissão explícita do provider', () => {
  const snapshot = { connections: [
    { id: 'b', provider_id: 'claude', status: 'active', last_test_status: 'pass' },
  ] };
  assert.equal(hub.planFailover(snapshot, 'claude', { failureReason: 'LIMIT_REACHED' }).state, 'BLOCKED_POLICY');
  assert.equal(hub.planFailover(snapshot, 'claude', { failureReason: 'LIMIT_REACHED', providerAllowsLimitFailover: true }).state, 'ACCOUNT_CANDIDATE');
});

test('fallback Free só aparece quando explicitamente disponível', () => {
  const snapshot = { connections: [] };
  assert.equal(hub.planFailover(snapshot, 'claude').state, 'POOL_EXHAUSTED');
  const plan = hub.planFailover(snapshot, 'claude', { freeTierAvailable: true });
  assert.equal(plan.state, 'FALLBACK_FREE');
  assert.equal(plan.fallback, 'FREE_TIER');
});
