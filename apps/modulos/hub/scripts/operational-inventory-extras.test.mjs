import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildOperationalInventoryExtras } from './operational-inventory-extras.mjs';

function write(root, relativePath, content) {
  const target = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

test('indexes personas, agent agreements and sanitized Codex snapshot', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-inventory-'));
  try {
    write(root, 'apps/modulos/WebUI/personas/hermes-system.md', '# HERMES System\n');
    write(root, '.agents/ACORDO.json', JSON.stringify({
      metadata: { status: 'ATIVO', participantes: ['Codex', 'Connector'] },
    }));
    write(root, 'apps/modulos/hub/scripts/inventory-snapshots/local.json', JSON.stringify({
      schema_version: 1,
      kind: 'CODEX_LOCAL_SANITIZED_SNAPSHOT',
      source_label: '.codex.zip',
      observed_at: '2026-08-16T18:26:00Z',
      sanitized: true,
      scope_note: 'Recorte local; não é runtime atual.',
      summary: { threads_total: 3, threads_user: 2, threads_subagent: 1, spawn_edges: 1, guardians: 0, remote_control_enrollments: 0 },
      spawned_agents: ['Bacon'],
      dynamic_tools: { list_threads: 1 },
      plugins: ['browser@openai-bundled'],
      mcp_servers: ['node_repl'],
      models: ['gpt-example'],
      marketplaces: [],
      state_stores: ['state_5.sqlite'],
      observed_root_directories: ['.tmp', 'tmp'],
      root_directory_observation_source: 'USER_SCREENSHOT',
      structural_capabilities: { computer_use: true, chrome_native_host: 'com.openai.codexextension' },
    }));

    const items = buildOperationalInventoryExtras(root);
    assert.ok(items.some((entry) => entry.type === 'PERSONA' && entry.name === 'HERMES System'));
    assert.deepEqual(
      items.filter((entry) => entry.type === 'AGENT_PARTICIPANT').map((entry) => entry.name).sort(),
      ['Codex', 'Connector'],
    );
    assert.ok(items.some((entry) => entry.type === 'SPAWNED_SUBAGENT' && entry.name === 'Bacon'));
    assert.ok(items.some((entry) => entry.type === 'DYNAMIC_TOOL' && entry.name === 'list_threads'));
    assert.ok(items.some((entry) => entry.type === 'COMPUTER_USE'));
    assert.equal(items.filter((entry) => entry.type === 'LOCAL_DRAWER').length, 2);
    assert.deepEqual(items.filter((entry) => entry.type === 'LOCAL_DRAWER').map((entry) => entry.name).sort(), ['.tmp', 'tmp']);
    assert.ok(items.filter((entry) => entry.source.startsWith('LOCAL_SNAPSHOT:')).every((entry) => entry.temporal_scope === 'HISTORICAL_RECORD'));
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('rejects an unsanitized local snapshot', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-inventory-'));
  try {
    write(root, 'apps/modulos/hub/scripts/inventory-snapshots/local.json', JSON.stringify({
      kind: 'CODEX_LOCAL_SANITIZED_SNAPSHOT',
      sanitized: false,
    }));
    assert.throws(() => buildOperationalInventoryExtras(root), /HOUSE_INVENTORY_SNAPSHOT_INVALID/);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});
