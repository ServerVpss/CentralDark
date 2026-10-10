import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Teste em diretório temporário isolado: nenhum snapshot/serviço real é modificado.
test('Mega Painel no One Heart: fonte, frescor, sanitização e sem falso verde', async () => {
  const home = await mkdtemp(join(tmpdir(), 'centraldark-status-api-test-'));
  const source = join(dirname(fileURLToPath(import.meta.url)), 'status-api.mjs');
  await copyFile(source, join(home, 'status-api.mjs'));
  const { buildStatusOverview, buildStatusDetail } = await import(pathToFileURL(join(home, 'status-api.mjs')).href);
  const at = new Date('2026-10-10T22:00:00.000Z');
  try {
    const empty = await buildStatusOverview({ now: at });
    assert.equal(empty.schema, 'centraldark.status-one-heart.v1');
    assert.equal(empty.coverage.total, 8);
    assert.equal(empty.coverage.observed, 0);
    assert.equal(empty.coverage.unknown, 8);
    assert.equal(empty.status, 'PARTIAL');
    assert.equal(await buildStatusDetail('../.env', { now: at }), null);

    await writeFile(join(home, 'painel-data.json'), JSON.stringify({
      project: { phase: 'MEASURED', currentTask: 'corrigir health', overallProgress: null },
      events: [{ time: '2026-10-10T21:59:00Z', titulo: 'Commit', detalhe: 'authorization:top_secret_value' }],
      iaTimeline: [],
      updatedAt: '2026-10-10T21:59:00Z',
    }));
    await writeFile(join(home, 'mcp-health.json'), JSON.stringify({
      updatedAt: '2026-10-10T21:59:00Z',
      lastCheck: { status: 'unknown', httpCode: 503, latencyMs: 55 },
      last24h: { checks: 0, failures: 0, autoRestarts: 0, uptimePct: 100 },
    }));
    await writeFile(join(home, 'graph-data.json'), JSON.stringify({
      updatedAt: '2026-10-10T21:59:00Z',
      nodes: [{ host: 'private-node', token: 'would_leak' }],
      edges: [{ source: 'private-node', target: 'secret-target' }],
      stats: { total_nodes: 10, total_edges: 14, compass_links_broken: 0 },
    }));
    const fresh = await buildStatusOverview({ now: at });
    assert.equal(fresh.coverage.observed, 3);
    assert.equal(fresh.sections.projeto.state, 'OBSERVED');
    assert.equal(fresh.sections.grafo.state, 'OBSERVED');
    assert.equal(fresh.sections.grafo.data.total_nodes, 10);
    assert.equal(fresh.sections.grafo.data.total_edges, 14);
    assert.equal(fresh.sections.mcp_24h.data.last_24h.uptime_pct, null);
    assert(!JSON.stringify(fresh).includes('would_leak'), 'internal node details must not escape');
    assert(!JSON.stringify(fresh).includes('top_secret_value'), 'credential-like text must be redacted');
    const detail = await buildStatusDetail('grafo', { now: at });
    assert.equal(detail.section, 'grafo');
    assert.equal(detail.state, 'OBSERVED');
    const old = await buildStatusOverview({ now: new Date('2026-10-12T22:00:00Z') });
    assert.equal(old.sections.grafo.state, 'STALE');
    assert.equal(old.sections.projeto.state, 'STALE');
    assert.equal(old.coverage.observed, 0);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
