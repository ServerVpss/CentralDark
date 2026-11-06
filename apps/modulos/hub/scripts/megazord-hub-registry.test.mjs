import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
const registryFile = path.join(root, 'MODULES/HUB/hub-connections.registry.json');
const cardFile = path.join(root, 'apps/modulos/hub/src/components/dashboard/MegazordHubCard.tsx');
const data = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
const byId = (id) => data.connections.find((entry) => entry.id === id);

test('registry unico, tipado e sem falsa ativacao', () => {
  assert.equal(data.schema, 'centraldark.modules.hub.connections.v1');
  assert.ok(Array.isArray(data.connections) && data.connections.length > 0);
  assert.equal(new Set(data.connections.map((item) => item.id)).size, data.connections.length);
  for (const item of data.connections) {
    assert.equal(typeof item.id, 'string');
    assert.equal(typeof item.label, 'string');
    assert.equal(typeof item.owner, 'string');
    assert.equal(typeof item.enabled, 'boolean');
    assert.equal(typeof item.proof_state, 'string');
    assert.equal(typeof item.status_surface, 'string');
    assert.ok(!/(token|password|secret|api[_-]?key)\s*[:=]/i.test(item.notes ?? ''), item.id);
  }
});

test('nucleo da Casa nao e aprovado por HTTP 200', () => {
  const casa = byId('casa-segredo-control-plane');
  assert.ok(casa);
  assert.equal(casa.proof_state, 'HTTP_200_ENGINE_DISCONNECTED');
  assert.equal(casa.sector, 'CONTROL_PLANE_LOCAL');
  assert.ok(fs.existsSync(path.join(root, casa.owner)));
});

test('notebook e setor candidato, nao agente remoto autenticado', () => {
  const notebook = byId('notebook-agentes-execution-node');
  assert.ok(notebook);
  assert.equal(notebook.enabled, false);
  assert.equal(notebook.proof_state, 'LAN_UNREACHABLE_INBOUND_RADMIN_OPEN_UNAUTHENTICATED');
  assert.equal(notebook.sector, 'EXECUTION_NODE_CANDIDATE');
  assert.ok(fs.existsSync(path.join(root, notebook.owner)));
  assert.ok(fs.existsSync(path.join(root, notebook.navigation_contract)));
  assert.ok(fs.existsSync(path.join(root, notebook.plug_contract)));
});

test('cartao Megazord consome o registro em vez de manter lista paralela', () => {
  const ui = fs.readFileSync(cardFile, 'utf8');
  assert.match(ui, /hub-connections\.registry\.json\?raw/);
  assert.match(ui, /registry\.connections\.map/);
  assert.match(ui, /REGISTRY_INVALID/);
  assert.match(ui, /Catálogo incorporado no build, não saúde ao vivo/);
  assert.doesNotMatch(ui, /const connections\s*=\s*\[/);
});
