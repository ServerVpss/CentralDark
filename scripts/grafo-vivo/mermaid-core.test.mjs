import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditGraphRelations,
  buildGraphProjection,
  cleanGraphLabel,
  computeGraphFingerprint,
  extractGraphFingerprint,
} from './mermaid-core.mjs';

const graph = {
  nodes: [
    { id: 'api', label: 'API', group: 'core', type: 'gateway', status: 'online', pm2: 'api' },
    { id: 'worker', label: 'Worker', group: 'monitoramento', status: 'stopped', pm2: 'worker' },
    { id: 'storage', label: 'Storage', type: 'storage' },
  ],
  edges: [
    { from: 'api', to: 'worker', label: 'jobs' },
    { from: 'worker', to: 'storage', label: 'write' },
  ],
  stats: { total_nodes: 3, total_edges: 2, online: 1, offline: 1, processos_vivos: 2, gateway_req_15min: 7 },
};

test('fingerprint ignora ordem mas muda com estado material', () => {
  const reordered = {
    ...graph,
    nodes: [...graph.nodes].reverse(),
    edges: [...graph.edges].reverse(),
  };
  assert.equal(computeGraphFingerprint(graph), computeGraphFingerprint(reordered));

  const changed = structuredClone(graph);
  changed.nodes[0].status = 'stopped';
  assert.notEqual(computeGraphFingerprint(graph), computeGraphFingerprint(changed));
});

test('projecao gera Mermaid derivado e valida arestas declaradas', () => {
  const projection = buildGraphProjection(graph);
  assert.equal(projection.validation.ok, true);
  assert.match(projection.mermaid, /^flowchart LR/);
  assert.match(projection.mermaid, /api\["🟢 API"\]/);
  assert.match(projection.mermaid, /worker\["🔴 Worker"\]/);
  assert.match(projection.mermaid, /api -->\|jobs\| worker/);
});

test('auditoria encontra dangling, duplicacao, self-loop, ciclo e isolado', () => {
  const candidate = {
    nodes: [{ id: 'a' }, { id: 'b' }, { id: 'isolado' }],
    edges: [
      { from: 'a', to: 'b', label: 'x' },
      { from: 'a', to: 'b', label: 'x' },
      { from: 'b', to: 'a', label: 'volta' },
      { from: 'a', to: 'a', label: 'self' },
      { from: 'a', to: 'missing', label: 'dangling' },
    ],
  };
  const audit = auditGraphRelations(candidate);
  assert.equal(audit.dangling_edges.length, 1);
  assert.equal(audit.duplicate_edges.length, 1);
  assert.equal(audit.self_loops.length, 1);
  assert.deepEqual(audit.cycle_nodes, ['a', 'b']);
  assert.deepEqual(audit.isolated_nodes, ['isolado']);
});

test('labels nao injetam tag/script ou delimitadores Mermaid', () => {
  const cleaned = cleanGraphLabel('X<script>alert(1)</script>["z"]');
  assert.equal(cleaned.includes('<'), false);
  assert.equal(cleaned.includes('>'), false);
  assert.equal(cleaned.includes('['), false);
  assert.equal(cleaned.includes(']'), false);
  assert.equal(cleaned.includes('"'), false);
});

test('extrai fingerprint do receipt existente', () => {
  const fp = 'a'.repeat(64);
  assert.equal(extractGraphFingerprint(`x\nGRAPH_FINGERPRINT=${fp}\ny\n`), fp);
  assert.equal(extractGraphFingerprint('sem receipt'), null);
});
