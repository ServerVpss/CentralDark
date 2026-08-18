import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';
import { buildHouseInventory, INVENTORY_GROUPS, renderInventoryModule } from '../../apps/modulos/hub/scripts/house-inventory-core.mjs';

const ROOT = resolve(process.cwd());
const CONTRACT = readFileSync(resolve(ROOT, 'scripts/memory-linker/SOURCE-DELTA.md'), 'utf8');
const CATALOG_SYNC = readFileSync(resolve(ROOT, 'supabase/functions/catalog-sync/index.ts'), 'utf8');
const MCP_CLIENT = readFileSync(resolve(ROOT, 'apps/modulos/hub/src/services/mcp-client.ts'), 'utf8');
const BUTTON = readFileSync(resolve(ROOT, 'apps/modulos/hub/src/components/catalog/SyncButton.tsx'), 'utf8');
const HUB_COMMAND = readFileSync(resolve(ROOT, 'apps/modulos/hub/supabase/functions/hub-command/index.ts'), 'utf8');
const HUB_PAGE = readFileSync(resolve(ROOT, 'apps/modulos/hub/src/HubPage.tsx'), 'utf8');
const INVENTORY_UI = readFileSync(resolve(ROOT, 'apps/modulos/hub/src/components/inventory/InventoryTab.tsx'), 'utf8');
const HUB_PACKAGE = readFileSync(resolve(ROOT, 'apps/modulos/hub/package.json'), 'utf8');

test('SOURCE_DELTA permanece um só motor com adapters e fonte sem autoridade', () => {
  for (const marker of [
    'ONE_SOURCE_DELTA_ENGINE=true',
    'SOURCE_ADAPTERS_NOT_SEPARATE_MINERS=true',
    'SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true',
    'MINING_WITHIN_ACTIVE_INTENT=AUTOMATIC',
    'NO_NEW_INFORMATION=STOP',
    'NO_SILENT_ERROR=true',
  ]) assert.ok(CONTRACT.includes(marker), `missing ${marker}`);
});

test('catalog-sync é o owner físico do SOURCE_DELTA e usa conditional request', () => {
  for (const marker of [
    "from '../_shared/source-delta.mjs'",
    "from '../_shared/operational-error.mjs'",
    'conditionalHeaders(previous)',
    'response.status === 304',
    "Deno.env.get('SOURCE_GITHUB_REPOS')",
    "github-release:${repo}",
    'pending_refinery',
  ]) assert.ok(CATALOG_SYNC.includes(marker), `missing catalog-sync marker ${marker}`);
});

test('botão HUB chama catalog-sync real e não ressuscita /tools/sync inexistente', () => {
  assert.ok(MCP_CLIENT.includes("hubAuth.functions.invoke('catalog-sync'"));
  assert.ok(!MCP_CLIENT.includes('/tools/sync'));
  assert.ok(BUTTON.includes('Buscar / Aplicar Melhorias'));
  assert.ok(BUTTON.includes('DELTA_FOUND'));
  assert.ok(BUTTON.includes('ABSORBED'));
  assert.ok(BUTTON.includes('REJECTED'));
  assert.ok(BUTTON.includes('STATUS'));
});

test('hub-command não engole parse nem falha de auditoria', () => {
  assert.ok(HUB_COMMAND.includes("stage: 'PARSE_REQUEST_JSON'"));
  assert.ok(HUB_COMMAND.includes("stage: 'AUDIT_WRITE_AFTER_MISSION_CREATE'"));
  assert.ok(HUB_COMMAND.includes('partial_success: true'));
  assert.ok(!HUB_COMMAND.includes('.then(() => {}, () => {})'));
  assert.ok(!HUB_COMMAND.includes('.catch(() => ({}))'));
});

test('Inventário da Casa deriva owners reais sem criar segunda verdade', () => {
  const inventory = buildHouseInventory(ROOT, { revision: 'TEST_HEAD' });
  assert.equal(inventory.source_of_truth, 'REPOSITORY_OWNERS');
  assert.equal(inventory.second_truth, false);
  assert.equal(inventory.source_is_authority, false);
  assert.deepEqual([...inventory.groups], [...INVENTORY_GROUPS]);
  assert.ok(inventory.total > 15, `inventário pequeno demais: ${inventory.total}`);

  const ids = new Set(inventory.items.map((item) => item.id));
  assert.equal(ids.size, inventory.items.length, 'IDs duplicados no inventário');

  for (const item of inventory.items) {
    assert.ok(item.name.length > 0 && item.name.length <= 240, `nome inválido ${item.id}`);
    assert.ok(item.summary.length <= 240, `resumo gordo ${item.id}`);
    assert.ok(existsSync(resolve(ROOT, item.owner)), `owner inexistente ${item.id}: ${item.owner}`);
    assert.ok(existsSync(resolve(ROOT, item.proof)), `prova inexistente ${item.id}: ${item.proof}`);
    assert.ok(['CURRENT_OWNER', 'HISTORICAL_RECORD'].includes(item.temporal_scope), `escopo temporal inválido ${item.id}`);
  }

  for (const required of [
    'skill:meta-lupa',
    'meta:META_LUPA',
    'meta:META_MINERACAO',
    'meta:META_METACOGNICAO_OPERACIONAL',
    'mining:source-delta',
    'artifact:capability-compiler',
    'crystal:fixed-point',
  ]) assert.ok(ids.has(required), `poder obrigatório ausente: ${required}`);

  const fixedPointRecords = inventory.items.filter((item) => item.type === 'FIXED_POINT_RECORD');
  const miningCandidates = inventory.items.filter((item) => item.type === 'LEARNING_CANDIDATE');
  assert.ok(fixedPointRecords.length > 0, 'ledger real não expôs fixed points registrados');
  assert.ok(miningCandidates.length > 0, 'ledger real não expôs candidatos/minérios registrados');
  for (const item of [...fixedPointRecords, ...miningCandidates]) {
    assert.equal(item.owner, '.agents/skills/meta-lupa/references/uso-ledger.jsonl');
    assert.equal(item.temporal_scope, 'HISTORICAL_RECORD');
    assert.ok(item.recorded_at, `registro sem tempo ${item.id}`);
    assert.ok(!/runtime atual/i.test(item.status));
  }
  for (const item of miningCandidates) {
    assert.equal(item.summary, 'Candidato histórico preservado no ledger; conteúdo detalhado permanece on-demand no owner.');
  }

  const rendered = renderInventoryModule(inventory);
  assert.ok(rendered.includes('export const HOUSE_INVENTORY'));
  assert.ok(rendered.includes('REPOSITORY_OWNERS'));
  assert.ok(rendered.includes('HISTORICAL_RECORD'));
  assert.ok(!rendered.includes('Erro:'));
  assert.ok(!rendered.includes('Correção:'));
});

test('HUB expõe Inventário visível, admin e com o mesmo botão de mineração', () => {
  assert.ok(HUB_PAGE.includes("value=\"inventory\""));
  assert.ok(HUB_PAGE.includes('🧬 Inventário'));
  assert.ok(HUB_PAGE.includes('<RoleGuard requiredRole="admin"><InventoryTab /></RoleGuard>'));
  assert.ok(INVENTORY_UI.includes('Inventário da Casa'));
  assert.ok(INVENTORY_UI.includes('<SyncButton />'));
  assert.ok(INVENTORY_UI.includes('Skills'));
  assert.ok(INVENTORY_UI.includes('Aprendizados'));
  assert.ok(INVENTORY_UI.includes('Mineração'));
  assert.ok(INVENTORY_UI.includes('Cristais'));
  assert.ok(INVENTORY_UI.includes('Artefatos'));
  assert.ok(INVENTORY_UI.includes('histórico registrado'));
  assert.ok(INVENTORY_UI.includes('o Inventário é índice, não segunda verdade'));

  const pkg = JSON.parse(HUB_PACKAGE);
  assert.equal(pkg.scripts.predev, 'node scripts/generate-house-inventory.mjs');
  assert.equal(pkg.scripts.prebuild, 'node scripts/generate-house-inventory.mjs');
  assert.equal(pkg.scripts['inventory:generate'], 'node scripts/generate-house-inventory.mjs');
});
