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
