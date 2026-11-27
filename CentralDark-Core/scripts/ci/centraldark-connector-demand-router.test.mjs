import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CONNECTORS,
  LOCALES,
  RULE_ZERO_ORDER,
  planConnectorActivation,
  routeDemand,
} from './centraldark-connector-demand-router.mjs';

test('lists known connector registry without secrets', () => {
  const names = Object.keys(CONNECTORS);

  assert.equal(names.includes('GitHub'), true);
  assert.equal(names.includes('Gmail'), true);
  assert.equal(names.includes('Google_Calendar'), true);
  assert.equal(names.includes('Google_Contacts'), true);
  assert.equal(names.includes('Google_Drive'), true);
  assert.equal(names.includes('Remote_Desktop_Commander'), true);
  assert.equal(names.includes('files'), true);

  for (const config of Object.values(CONNECTORS)) {
    assert.match(config.secretPolicy, /^NO_SECRET/);
  }
});

test('rule zero order remains explicit', () => {
  assert.deepEqual(RULE_ZERO_ORDER, [
    'CHEFE_INTENT',
    'CENTRALDARK',
    'LIVE_STATE',
    'ALIGNMENT',
    'MINIMAL_DELTA',
    'EVIDENCE',
    'COUNTERPROOF',
    'REALITY_JUDGE',
  ]);
});

test('multilingual axes are metadata, not separate systems', () => {
  assert.deepEqual(LOCALES, ['pt-BR', 'en-US', 'es']);
});

test('repo and PR demand routes to GitHub only, not every connector', () => {
  const routed = routeDemand('medir PR issue workflow no repo GitHub');

  assert.deepEqual(routed, ['GitHub']);
});

test('Casa uses native Tailscale/MCP; RDC is fallback only', () => {
  const routed = routeDemand('medir casa windows runtime local terminal');
  assert.deepEqual(routed, ['CentralDark_Casa_Tailscale']);
  const plan = planConnectorActivation({ demand: 'medir casa windows runtime local terminal' });
  assert.deepEqual(plan.casaRoute.primary, ['TAILSCALE_PRIVATE_ROUTE', 'MCP_REMOTE_OAUTH', 'HERMES_SHELL']);
  assert.equal(plan.casaRoute.fallback, 'RDC_DESKTOP_COMMANDER');
  assert.equal(plan.casaRoute.fallbackAutoExecuted, false);
  assert.equal(plan.casaRoute.runtimeStatus, 'REMEASURE_AT_RUNTIME');
  assert.equal(routed.includes('GitHub'), false);
});

test('explicit mention of vendor does not silently start fallback', () => {
  const plan = planConnectorActivation({ demand: 'remote desktop commander' });
  assert.equal(plan.connectors[0].name, 'CentralDark_Casa_Tailscale');
  assert.ok(!plan.connectors.some(item => item.name === 'Remote_Desktop_Commander'));
  assert.equal(plan.casaRoute.fallbackActivation, 'ONLY_IF_PRIMARY_FAILED_AND_AUTHORIZED_AND_DEVICE_ONLINE');
});

test('attachments route to files connector', () => {
  const routed = routeDemand('classificar PDF ZIP print e anexo da conversa');

  assert.equal(routed.includes('files'), true);
});

test('webhook request is allowed only with connector support and schema discovery', () => {
  const plan = planConnectorActivation({
    demand: 'GitHub PR workflow via webhook sob demanda',
    requestedWebhook: true,
  });

  assert.equal(plan.status, 'ROUTED_ON_DEMAND');
  assert.equal(plan.connectors.some((item) => item.name === 'GitHub' && item.webhookAction === 'DISCOVER_SCHEMA_BEFORE_CREATE'), true);
});

test('webhook request fails closed for connectors without webhook support', () => {
  const plan = planConnectorActivation({
    demand: 'Google Drive arquivo via webhook sob demanda',
    requestedWebhook: true,
  });

  assert.equal(plan.status, 'ROUTED_ON_DEMAND');
  assert.equal(plan.connectors.some((item) => item.name === 'Google_Drive' && item.webhookAction === 'BLOCKED_NO_WEBHOOK_SCHEMA_FOR_CONNECTOR'), true);
});

test('unknown demand does not activate all connectors', () => {
  const plan = planConnectorActivation({ demand: 'faça tudo transcendental', requestedWebhook: true });

  assert.equal(plan.status, 'UNKNOWN_DEMAND');
  assert.deepEqual(plan.connectors, []);
  assert.equal(plan.forbidden.includes('ACTIVATE_ALL_CONNECTORS_BLINDLY'), true);
});
