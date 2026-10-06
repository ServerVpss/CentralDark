#!/usr/bin/env node
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, '../..');
const outputPath = path.join(repoRoot, 'docs/HUD/CENTRALDARK-HUD-INVENTORY.json');
const args = new Set(process.argv.slice(2));

const POLICY = Object.freeze({
  current_over_history: true,
  unknown_is_not_pass: true,
  action_is_not_proof: true,
  documented_is_not_executed: true,
  seal_live_separation: true,
  seal_is_last_valid_proof_fingerprint_rollback: true,
  live_is_current_measurement_timestamp_source: true,
  one_path_failure_is_not_system_failure: true,
  reuse_before_create: true,
  one_system_only: true,
  one_writer_per_scope: true,
  reality_is_judge: true,
});

function read(relativePath) {
  return fs.readFileSync(path.join(repoRoot, relativePath), 'utf8');
}

function readJson(relativePath) {
  return JSON.parse(read(relativePath));
}

function exists(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sha256File(relativePath) {
  return sha256(read(relativePath));
}

function trackedFiles() {
  return execFileSync('git', ['-C', repoRoot, 'ls-files', '-z'], { encoding: 'utf8' })
    .split('\0')
    .filter(Boolean)
    .sort();
}

function lineNumber(text, index) {
  return text.slice(0, index).split('\n').length;
}

function stripMarkup(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^{}]{0,120}\}/g, ' ')
    .replace(/&[a-zA-Z0-9#]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
}

function safeId(parts) {
  return sha256(parts.join('|')).slice(0, 16);
}

function sectorOf(relativePath) {
  const parts = relativePath.split('/');
  if (relativePath.startsWith('docs/HUD/')) return 'HUD';
  if (relativePath.startsWith('docs/CONSCIENCIA/')) return 'CONSCIENCIA';
  if (relativePath.startsWith('docs/ARQUITETURA/')) return 'ARQUITETURA';
  if (relativePath.startsWith('.agents/')) return 'AGENTS';
  if (relativePath.startsWith('.github/')) return 'GITHUB';
  if (relativePath.startsWith('scripts/')) return 'SCRIPTS';
  if (relativePath.startsWith('apps/modulos/') && parts[2]) return 'APP:' + parts[2];
  if (relativePath.startsWith('experiments/')) return 'EXPERIMENTS';
  if (relativePath.startsWith('src/')) return 'ROOT_UI';
  return parts[0]?.toUpperCase() || 'REPO';
}

function sortByOwnerLine(items) {
  return items.sort((a, b) =>
    String(a.owner || '').localeCompare(String(b.owner || ''), 'pt-BR') ||
    Number(a.line || 0) - Number(b.line || 0) ||
    String(a.id || '').localeCompare(String(b.id || ''), 'pt-BR'));
}

function collectSkills(files) {
  return files
    .filter((file) => file.startsWith('.agents/skills/') && file.endsWith('/SKILL.md'))
    .map((owner) => {
      const relative = owner.slice('.agents/skills/'.length, -'/SKILL.md'.length);
      return {
      id: 'skill:' + relative,
      name: relative,
      owner,
      sector: 'SKILLS',
      proof_source: owner,
      seal_state: 'OWNER_PRESENT',
      live_state: 'UNKNOWN_UNTIL_AGENT_LOAD_READBACK',
      fingerprint: sha256File(owner),
    };
    });
}

function collectAgents(files) {
  const records = [];
  for (const owner of files.filter((file) => /^\.agents\/skills\/[^/]+\/agents\/openai\.yaml$/.test(file))) {
    const text = read(owner);
    const display = text.match(/^\s*display_name:\s*(.+)$/m)?.[1]?.trim() || owner.split('/')[2];
    records.push({
      id: 'agent-surface:' + safeId([owner]),
      name: display,
      owner,
      sector: 'AGENTS',
      proof_source: owner,
      seal_state: 'OWNER_PRESENT',
      live_state: 'UNKNOWN_UNTIL_AGENT_RUNTIME_READBACK',
      fingerprint: sha256(text),
    });
  }
  for (const owner of files.filter((file) => /^\.agents\/[^/]+\.json$/.test(file))) {
    let parsed;
    try { parsed = readJson(owner); } catch { continue; }
    const participants = parsed?.metadata?.participantes;
    if (!Array.isArray(participants)) continue;
    for (const name of participants.filter((value) => typeof value === 'string' && value.trim())) {
      records.push({
        id: 'agent-agreement:' + safeId([owner, name]),
        name: name.trim(),
        owner,
        sector: 'AGENTS',
        proof_source: owner,
        seal_state: 'AGREEMENT_REGISTERED',
        live_state: 'UNKNOWN_UNTIL_AGENT_RUNTIME_READBACK',
        fingerprint: sha256(JSON.stringify({ owner, name })),
      });
    }
  }
  return sortByOwnerLine(records);
}

function collectWorkflows(files) {
  return files
    .filter((file) => /^\.github\/workflows\/.+\.ya?ml$/.test(file))
    .map((owner) => {
      const text = read(owner);
      const name = text.match(/^name:\s*(.+)$/m)?.[1]?.trim() || path.basename(owner);
      const runners = [...text.matchAll(/^\s*runs-on:\s*(.+)$/gm)].map((m) => m[1].trim());
      const actions = [...text.matchAll(/^\s*uses:\s*([^\s#]+)/gm)].map((m) => m[1].trim());
      const secrets = [...new Set([...text.matchAll(/secrets\.([A-Z0-9_]+)/g)].map((m) => m[1]))].sort();
      const vars = [...new Set([...text.matchAll(/vars\.([A-Z0-9_]+)/g)].map((m) => m[1]))].sort();
      return {
        id: 'workflow:' + path.basename(owner),
        name,
        owner,
        sector: 'GITHUB_ACTIONS',
        proof_source: owner,
        seal_state: 'OWNER_PRESENT',
        live_state: 'UNKNOWN_UNTIL_GITHUB_RUN_READBACK',
        dependencies: { runners, actions, secret_names: secrets, variable_names: vars },
        fingerprint: sha256(text),
      };
    })
    .sort((a, b) => a.owner.localeCompare(b.owner, 'pt-BR'));
}

function collectUiSignals(files) {
  const roots = /^(apps\/|src\/|docs\/HUD\/|experiments\/aionui-centraldark-instinto-superior\/|MODULES\/HUB\/)/;
  const sourceFiles = files.filter((file) => roots.test(file) && /\.(tsx|jsx|html)$/.test(file));
  const records = [];
  const seen = new Set();
  const push = (owner, text, index, kind, label) => {
    const line = lineNumber(text, index);
    const normalized = stripMarkup(label) || kind;
    const key = [owner, line, kind, normalized].join('|');
    if (seen.has(key)) return;
    seen.add(key);
    records.push({
      id: 'ui:' + safeId([key]),
      kind,
      label: normalized,
      owner,
      line,
      sector: sectorOf(owner),
      proof_source: owner + ':' + line,
      seal_state: 'DISCOVERED_FROM_OWNER',
      live_state: 'UNKNOWN_UNTIL_SURFACE_READBACK',
      dependencies: [],
    });
  };

  for (const owner of sourceFiles) {
    const text = read(owner);
    for (const match of text.matchAll(/<(?:button|Button)\b[^>]*>([\s\S]{0,360}?)<\/(?:button|Button)>/g)) {
      push(owner, text, match.index, 'button', match[1]);
    }
    for (const match of text.matchAll(/<TabsTrigger\b[^>]*\bvalue=["']([^"']+)["'][^>]*>([\s\S]{0,240}?)<\/TabsTrigger>/g)) {
      push(owner, text, match.index, 'tab', match[2] || match[1]);
    }
    for (const match of text.matchAll(/\bdata-tab=["']([^"']+)["']/g)) {
      push(owner, text, match.index, 'tab', match[1]);
    }
    for (const match of text.matchAll(/<(SidebarMenuButton|DropdownMenuItem|CommandItem|NavigationMenuLink)\b[^>]*>([\s\S]{0,280}?)<\/\1>/g)) {
      push(owner, text, match.index, 'navigation', match[2] || match[1]);
    }
    for (const match of text.matchAll(/<h[1-3]\b[^>]*>([\s\S]{0,220}?)<\/h[1-3]>/g)) {
      push(owner, text, match.index, 'section', match[1]);
    }
  }
  return sortByOwnerLine(records);
}

function collectGenealogy(files) {
  const lineageFiles = files
    .filter((file) => /lineage/i.test(path.basename(file)) && file.endsWith('.json'))
    .map((owner) => ({ owner, fingerprint: sha256File(owner), sector: sectorOf(owner) }))
    .sort((a, b) => a.owner.localeCompare(b.owner, 'pt-BR'));

  const nodes = [];
  const owner = 'docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json';
  if (exists(owner)) {
    const lineage = readJson(owner);
    if (lineage.genesis) {
      nodes.push({ ...lineage.genesis, lineage_owner: owner, node_kind: 'GENESIS' });
    }
    for (const node of Array.isArray(lineage.nodes) ? lineage.nodes : []) {
      nodes.push({ ...node, lineage_owner: owner, node_kind: 'LEARNING_NODE' });
    }
  }
  return {
    lineage_files: lineageFiles,
    nodes,
    node_count: nodes.length,
    fingerprint: sha256(JSON.stringify({ lineageFiles, nodes })),
  };
}

function collectMetabolism(files) {
  const claimsOwner = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json';
  const claimsJson = exists(claimsOwner) ? readJson(claimsOwner) : {};
  const claims = Object.entries(claimsJson.claims || {})
    .map(([claim_key, value]) => ({
      claim_key,
      owner: value?.owner || claimsOwner,
      status: value?.status || value?.state_proved || 'REGISTERED',
      dependency_fingerprint: value?.dependency_fingerprint || value?.proven_path_replay?.dependency_fingerprint || null,
      receipt_ref: value?.receipt_ref || null,
      evidence_ref: value?.evidence_ref || null,
      next_cursor: value?.next_cursor || value?.proven_path_replay?.next_cursor || null,
      proof_source: claimsOwner,
      seal_state: 'PROVEN_CLAIM_REGISTERED',
      live_state: 'CLAIM_SCOPED_REMEASURE_WHEN_MUTABLE',
    }))
    .sort((a, b) => a.claim_key.localeCompare(b.claim_key, 'pt-BR'));

  const receipts = files
    .filter((file) => /^docs\/CONSCIENCIA\/RECEIPTS\/.+/.test(file))
    .map((owner) => ({ owner, fingerprint: sha256File(owner), proof_source: owner }))
    .sort((a, b) => a.owner.localeCompare(b.owner, 'pt-BR'));

  const recipeOwners = files
    .filter((file) =>
      /^(docs\/ARQUITETURA\/CENTRALDARK-TRIGGER-FABRIC\/|CENTRALDARK_AI_BOOT\.yaml$)/.test(file) &&
      /(RECIPE|RECEITA|TRIGGER|MASTER-CYCLE|ENGINE_BINDING|SEMANTIC-GREEN|PROVEN-|BOOT)/i.test(path.basename(file)))
    .map((owner) => ({ owner, fingerprint: sha256File(owner), proof_source: owner }))
    .sort((a, b) => a.owner.localeCompare(b.owner, 'pt-BR'));

  return {
    proven_claims_owner: claimsOwner,
    proven_claims: claims,
    receipts,
    recipe_owners: recipeOwners,
    fingerprint: sha256(JSON.stringify({ claims, receipts, recipeOwners })),
  };
}

function collectDeterminism(files) {
  const deterministicOwners = files
    .filter((file) =>
      /determin/i.test(file) ||
      file === 'scripts/trigger-fabric/verify_repo_contract.py' ||
      file === 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-EXECUTABLE-RECIPE.yml' ||
      file === 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json')
    .map((owner) => ({ owner, sector: sectorOf(owner), fingerprint: sha256File(owner) }))
    .sort((a, b) => a.owner.localeCompare(b.owner, 'pt-BR'));

  const lockOwner = 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-DETERMINISTIC-LOCK.yml';
  const lockText = exists(lockOwner) ? read(lockOwner) : '';
  const invariants = [...lockText.matchAll(/^\s{2}([a-z0-9_]+):\s*(true|false|[A-Z0-9_:-]+)\s*$/gmi)]
    .map((m) => ({ key: m[1], value: m[2] }));

  return {
    lock_owner: lockOwner,
    invariants,
    owners: deterministicOwners,
    fingerprint: sha256(JSON.stringify({ invariants, deterministicOwners })),
  };
}

function collectRoutes() {
  const owner = 'apps/modulos/mcp/src/tools/core/mcp-admin.js';
  if (!exists(owner)) return [];
  const text = read(owner);
  const start = text.indexOf('AUTHORIZED_ROUTE_CATALOG');
  const end = start >= 0 ? text.indexOf(']);', start) : -1;
  const block = start >= 0 && end > start ? text.slice(start, end + 3) : text;
  const routes = [];
  for (const raw of block.split(/\r?\n/).filter((line) => /\{\s*id:\s*"/.test(line))) {
    const field = (name) => raw.match(new RegExp(name + ':\\s*"([^"]+)"'))?.[1] || null;
    const id = field('id');
    if (!id) continue;
    routes.push({
      id,
      transport: field('transport'),
      binding: field('binding'),
      capability: field('capability'),
      source: field('source'),
      runtime_state_policy: field('runtimeState') || 'MEASURE_AT_RUNTIME',
      owner,
      proof_source: owner,
      seal_state: 'CATALOGED_AUTHORIZED_ROUTE',
      live_state: 'MEASURE_AT_RUNTIME',
    });
  }
  return routes.sort((a, b) => a.id.localeCompare(b.id, 'pt-BR'));
}

function collectSeals() {
  const owner = 'docs/HUD/HUD.html';
  if (!exists(owner)) return [];
  const text = read(owner);
  const parts = text.split('<div class="cadeado-card selado">').slice(1);
  return parts.map((part, index) => {
    const sample = part.slice(0, 2200);
    const name = stripMarkup(sample.match(/class="cadeado-nome">([\s\S]*?)<\/span>/)?.[1]) || 'Selo ' + (index + 1);
    const meta = stripMarkup(sample.match(/class="cadeado-meta">([\s\S]*?)<\/div>/)?.[1]);
    const proof = stripMarkup(sample.match(/class="cadeado-prova">([\s\S]*?)<\/div>/)?.[1]);
    return {
      id: 'seal:' + safeId([name, owner]),
      name,
      owner,
      sector: 'HUD',
      proof_source: proof || owner,
      summary: meta,
      seal_state: 'SEALED_BASELINE',
      live_state: 'UNKNOWN_UNTIL_RUNTIME_PROBE',
      rollback: 'REUSE_LAST_PROVEN_RECIPE_OR_OWNER',
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}

function buildInventory() {
  const files = trackedFiles();
  const skills = collectSkills(files);
  const agents = collectAgents(files);
  const workflows = collectWorkflows(files);
  const uiSignals = collectUiSignals(files);
  const genealogy = collectGenealogy(files);
  const metabolism = collectMetabolism(files);
  const determinism = collectDeterminism(files);
  const routes = collectRoutes();
  const seals = collectSeals();

  const summary = {
    tracked_files: files.length,
    skills: skills.length,
    agents: agents.length,
    workflows: workflows.length,
    ui_signals: uiSignals.length,
    ui_buttons: uiSignals.filter((item) => item.kind === 'button').length,
    ui_tabs: uiSignals.filter((item) => item.kind === 'tab').length,
    ui_navigation: uiSignals.filter((item) => item.kind === 'navigation').length,
    ui_sections: uiSignals.filter((item) => item.kind === 'section').length,
    genealogy_nodes: genealogy.node_count,
    lineage_files: genealogy.lineage_files.length,
    proven_claims: metabolism.proven_claims.length,
    receipts: metabolism.receipts.length,
    recipe_owners: metabolism.recipe_owners.length,
    deterministic_owners: determinism.owners.length,
    routes: routes.length,
    sealed_baselines: seals.length,
  };

  const stableCore = {
    policy: POLICY,
    summary,
    skills,
    agents,
    workflows,
    ui_signals: uiSignals,
    genealogy,
    metabolism,
    determinism,
    routes,
    seals,
  };

  return {
    schema: 'centraldark.hud-machine-inventory.v1',
    status: 'DERIVED_MACHINE_PROJECTION_NOT_AUTHORITY',
    source_of_truth: 'ServerVpss/CentralDark@main',
    owner: 'scripts/hud/generate-hud-inventory.mjs',
    consumer_hud: 'docs/HUD/HUD.html',
    consumer_pr_mother: '.github/workflows/selo-fabric.yml',
    canonical_agent: '.agents/skills/centraldark-capability-hud/SKILL.md',
    policy: POLICY,
    inventory_fingerprint: sha256(JSON.stringify(stableCore)),
    summary,
    genealogy,
    metabolism,
    determinism,
    agents,
    skills,
    workflows,
    routes,
    seals,
    ui: {
      signal_schema: 'button|tab|navigation|section',
      signals: uiSignals,
    },
  };
}

function validate(inventory) {
  const failures = [];
  const require = (condition, message) => { if (!condition) failures.push(message); };
  require(inventory.summary.skills > 0, 'skills_empty');
  require(inventory.summary.workflows > 0, 'workflows_empty');
  require(inventory.summary.ui_signals > 0, 'ui_signals_empty');
  require(inventory.summary.genealogy_nodes > 0, 'genealogy_empty');
  require(inventory.summary.proven_claims > 0, 'proven_claims_empty');
  require(inventory.summary.deterministic_owners > 0, 'deterministic_owners_empty');
  require(inventory.summary.sealed_baselines > 0, 'seals_empty');
  require(inventory.routes.some((route) => route.id === 'RDC_DESKTOP_COMMANDER'), 'rdc_route_missing');
  require(inventory.routes.some((route) => route.id === 'SCREENPIPE_LOCAL_SENSOR'), 'screenpipe_route_missing');
  require(inventory.routes.some((route) => route.id === 'HERMES_DELEGATED_COMMIT_PATH'), 'hermes_delegate_route_missing');
  require(inventory.ui.signals.every((item) => item.owner && item.proof_source && item.seal_state && item.live_state), 'ui_signal_contract_incomplete');
  require(inventory.policy.seal_live_separation === true, 'seal_live_policy_missing');
  return failures;
}

const inventory = buildInventory();
const failures = validate(inventory);
if (failures.length) {
  console.error('HUD_INVENTORY_SELF_TEST=FAIL ' + failures.join(','));
  process.exit(2);
}
console.log('HUD_INVENTORY_SELF_TEST=PASS');

const payload = JSON.stringify(inventory, null, 2) + '\n';
if (args.has('--write')) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, payload, 'utf8');
  console.log('HUD_INVENTORY_WRITE=PASS path=' + path.relative(repoRoot, outputPath));
}
if (args.has('--check')) {
  if (!fs.existsSync(outputPath)) {
    console.error('HUD_INVENTORY_CHECK=FAIL reason=missing_output');
    process.exit(3);
  }
  const current = fs.readFileSync(outputPath, 'utf8');
  if (current !== payload) {
    console.error('HUD_INVENTORY_CHECK=FAIL reason=stale_output expected_fingerprint=' + inventory.inventory_fingerprint);
    process.exit(4);
  }
  console.log('HUD_INVENTORY_CHECK=PASS fingerprint=' + inventory.inventory_fingerprint);
}
if (!args.has('--write') && !args.has('--check')) {
  console.log(JSON.stringify({ fingerprint: inventory.inventory_fingerprint, summary: inventory.summary }, null, 2));
}
