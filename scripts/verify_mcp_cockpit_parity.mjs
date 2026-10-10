#!/usr/bin/env node
// Paridade de SOURCE: MCP NOC -> Instinto Superior. Não é prova de runtime.
import { readFileSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = process.env.CENTRALDARK_PARITY_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFileSync(join(ROOT, path), 'utf8');
const ADMIN = read('apps/modulos/mcp/src/admin.js');
const PATTERN = read('apps/modulos/mcp/src/admin-patterns-ui.js');
const UI = read('apps/instinto-superior/src/components/central/McpOperacoesCentralDark.tsx');
const ADMIN_VIEW = read('apps/instinto-superior/src/components/central/PainelAdminCentralDark.tsx');
const STATUS_VIEW = read('apps/instinto-superior/src/components/central/SistemaCentralDark.tsx');
const CARDS = read('apps/instinto-superior/src/components/central/MegaPainelLegadoCentralDark.tsx');
const ROUTER = read('apps/modulos/mcp/src/index.js');
function assert(test, reason) {
  if (!test) { console.error('FAIL ' + reason); process.exitCode = 1; }
}
const nav = ADMIN.match(/<nav class="tabs">([\s\S]*?)<\/nav>/)?.[1] || '';
const originalTabs = [...nav.matchAll(/data-p="([^"]+)"/g)].map(x => x[1]);
const injected = PATTERN.split('export const PATTERN_ADMIN_TAB = ')[1]?.split(';')[0] || '';
originalTabs.push(...[...injected.matchAll(/data-p="([^"]+)"/g)].map(x => x[1]));
const original = [...new Set(originalTabs)];
const labels = new Map([
  ['visao','visao'],['tools','ferramentas'],['linear','linear'],
  ['grafo','grafo'],['patterns','padroes'],['commands','comandos'],
  ['audit','auditoria'],['grok','grok'],['buildkite','buildkite'],
  ['conector','conector'],['diag','diagnostico'],['omni','omni'],['tailscale','tailscale'],
]);
assert(original.length === 13, 'ORIGINAL_TABS_CHANGED:' + original.join(','));
for (const id of original) {
  const translated = labels.get(id);
  assert(!!translated, 'OWNER_TAB_NOT_MAPPED:' + id);
  if (translated) assert(UI.includes('["' + translated + '",'), 'COCKPIT_TAB_NOT_PRESENT:' + translated);
}
const cardsBlock = CARDS.match(/const CARDS = \[([\s\S]*?)\] as const;/)?.[1] || '';
const cardCount = [...cardsBlock.matchAll(/^\s*\["/gm)].length;
assert(cardCount === 24, 'MEGAPANEL_CARD_COUNT_' + cardCount);
assert(ADMIN_VIEW.includes('<McpOperacoesCentralDark />'), 'MCP_COCKPIT_NOT_MOUNTED');
assert(STATUS_VIEW.includes('<MegaPainelLegadoCentralDark />'), 'MEGAPANEL_NOT_MOUNTED');
assert(ROUTER.includes('app.post("/admin/api/intent"') &&
  ROUTER.includes('app.post("/admin/api/e2e"') &&
  ROUTER.includes('app.get("/admin"'), 'PROTECTED_MCP_API_OR_LOGIN_REMOVED_BEFORE_PARITY');
console.log(JSON.stringify({
  check: 'MCP_COCKPIT_STATIC_OWNER_PARITY',
  original_nav_entries: originalTabs.length,
  original_unique_tabs: original.length,
  mapped_in_cockpit: original.filter(id => UI.includes('["' + labels.get(id) + '",')).length,
  megapanel_cards: cardCount,
  original_protected_routes_preserved: true,
  syntax_or_source_parity_only: true,
  live_admin_action_parity: 'NOT_PROVEN',
  outcome: process.exitCode ? 'FAIL' : 'PASS',
}));
