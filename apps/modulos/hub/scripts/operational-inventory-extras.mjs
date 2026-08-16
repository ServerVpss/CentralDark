import fs from 'node:fs';
import path from 'node:path';
import { INVENTORY_GROUPS } from './house-inventory-core.mjs';

const PERSONA_ROOT = 'apps/modulos/WebUI/personas';
const AGENT_ROOT = '.agents';
const SNAPSHOT_ROOT = 'apps/modulos/hub/scripts/inventory-snapshots';
const GROUP_SET = new Set(INVENTORY_GROUPS);

export const OPERATIONAL_INVENTORY_SOURCES = Object.freeze([
  'REPOSITORY_PERSONAS',
  'REPOSITORY_AGENT_AGREEMENTS',
  'SANITIZED_LOCAL_SNAPSHOTS',
]);

function relative(repoRoot, absolutePath) {
  return path.relative(repoRoot, absolutePath).split(path.sep).join('/');
}

function humanize(value) {
  return String(value)
    .replace(/\.[^.]+$/, '')
    .replace(/[_.-]+/g, ' ')
    .replace(/\b\p{L}/gu, (letter) => letter.toUpperCase())
    .trim();
}

function safeId(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'unnamed';
}

function item({
  id,
  name,
  group,
  type,
  status,
  owner,
  consumers = [],
  proof = owner,
  summary,
  source = owner,
  recorded_at = null,
  temporal_scope = 'CURRENT_OWNER',
}) {
  return {
    id,
    name,
    group,
    type,
    status,
    owner,
    where: owner,
    consumers: [...new Set(consumers)].sort(),
    proof,
    source,
    recorded_at,
    temporal_scope,
    summary: String(summary || '').replace(/\s+/g, ' ').trim().slice(0, 240),
  };
}

function scanPersonas(repoRoot) {
  const root = path.resolve(repoRoot, PERSONA_ROOT);
  if (!fs.existsSync(root)) return [];

  return fs.readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.md'))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((entry) => {
      const absolute = path.join(root, entry.name);
      const owner = relative(repoRoot, absolute);
      const text = fs.readFileSync(absolute, 'utf8');
      const heading = text.match(/^#\s+(.+?)\s*$/m)?.[1]?.trim();
      return item({
        id: `persona:${safeId(entry.name)}`,
        name: heading || humanize(entry.name),
        group: 'CAPACIDADES',
        type: 'PERSONA',
        status: 'OWNER_PRESENT',
        owner,
        consumers: ['AGENTES', 'INVENTARIO', 'WEBUI'],
        summary: `Persona física registrada em ${owner}; presença no owner não afirma sessão ativa.`,
      });
    });
}

function scanAgentAgreements(repoRoot) {
  const root = path.resolve(repoRoot, AGENT_ROOT);
  if (!fs.existsSync(root)) return [];

  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })
    .filter((candidate) => candidate.isFile() && candidate.name.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))) {
    const absolute = path.join(root, entry.name);
    const owner = relative(repoRoot, absolute);
    let parsed;
    try {
      parsed = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    } catch {
      continue;
    }
    const participants = parsed?.metadata?.participantes;
    if (!Array.isArray(participants)) continue;
    const agreementStatus = String(parsed?.metadata?.status || 'REGISTERED').toUpperCase();

    for (const participant of participants.filter((value) => typeof value === 'string' && value.trim())) {
      const name = participant.trim();
      found.push(item({
        id: `agent:${safeId(name)}`,
        name,
        group: 'CAPACIDADES',
        type: 'AGENT_PARTICIPANT',
        status: `AGREEMENT_${agreementStatus}`,
        owner,
        consumers: ['INVENTARIO', 'ORQUESTRACAO'],
        summary: 'Agente/participante registrado no acordo da Casa; papel de coordenação registrado, não prova de processo rodando agora.',
      }));
    }
  }
  return found;
}

function snapshotItem(snapshot, owner, definition) {
  return item({
    ...definition,
    owner,
    status: definition.status || 'SNAPSHOT_OBSERVED',
    consumers: definition.consumers || ['INVENTARIO'],
    proof: `${owner} :: ${definition.proof || definition.type}`,
    source: `LOCAL_SNAPSHOT:${snapshot.source_label || path.basename(owner)}`,
    recorded_at: snapshot.observed_at || null,
    temporal_scope: 'HISTORICAL_RECORD',
    summary: `Snapshot local sanitizado — ${definition.summary} ${snapshot.scope_note || ''}`,
  });
}

function expandCodexSnapshot(snapshot, owner) {
  const s = snapshot.summary || {};
  const records = [];
  const push = (definition) => records.push(snapshotItem(snapshot, owner, definition));

  push({
    id: 'codex:snapshot:root',
    name: `Codex Local Snapshot · ${s.root_entries ?? '?'} entradas`,
    group: 'ARTEFATOS',
    type: 'LOCAL_SNAPSHOT',
    summary: `Recorte com ${s.root_entries ?? '?'} entradas na raiz e ${s.uncompressed_bytes ?? '?'} bytes descompactados; conteúdo sensível não foi incorporado.`,
  });
  push({
    id: 'codex:snapshot:threads',
    name: `Codex Threads · ${s.threads_total ?? '?'}`,
    group: 'ARTEFATOS',
    type: 'THREAD_COLLECTION',
    summary: `${s.threads_total ?? '?'} threads registradas: ${s.threads_user ?? '?'} user e ${s.threads_subagent ?? '?'} subagent.`,
  });
  push({
    id: 'codex:snapshot:subagents',
    name: `Codex Subagents · ${s.threads_subagent ?? '?'}`,
    group: 'CAPACIDADES',
    type: 'SUBAGENT_COLLECTION',
    summary: `${s.threads_subagent ?? '?'} threads subagent: ${s.spawn_edges ?? '?'} spawn explícito + ${s.guardians ?? '?'} guardians sem nickname.`,
  });
  push({
    id: 'codex:snapshot:spawned',
    name: `Codex Spawned Subagents · ${s.spawn_edges ?? '?'}`,
    group: 'CAPACIDADES',
    type: 'SPAWNED_SUBAGENT_COLLECTION',
    summary: `${s.spawn_edges ?? '?'} relações pai→filho; ${s.spawn_edges_open ?? '?'} tinham status open no snapshot, sem afirmar processo rodando agora.`,
  });
  push({
    id: 'codex:snapshot:guardians',
    name: `Codex Guardians · ${s.guardians ?? '?'}`,
    group: 'CAPACIDADES',
    type: 'GUARDIAN_COLLECTION',
    summary: `${s.guardians ?? '?'} subagents do tipo guardian, sem nickname individual registrado.`,
  });

  for (const name of snapshot.spawned_agents || []) {
    push({
      id: `codex:snapshot:agent:${safeId(name)}`,
      name,
      group: 'CAPACIDADES',
      type: 'SPAWNED_SUBAGENT',
      proof: 'state_5.sqlite:threads.agent_nickname',
      summary: 'Nickname de subagent spawnado registrado no state store local.',
    });
  }

  const artifactDefinitions = [
    ['user-threads', `Codex User Threads · ${s.threads_user ?? '?'}`, 'THREAD_COLLECTION', `${s.threads_user ?? '?'} threads com origem user.`],
    ['spawn-edges', `Thread Spawn Edges · ${s.spawn_edges ?? '?'}`, 'SPAWN_EDGE_COLLECTION', `${s.spawn_edges ?? '?'} relações parent→child; IDs brutos omitidos.`],
    ['memory-mode', `Memory Mode · ${s.memory_mode_enabled_threads ?? '?'} threads`, 'MEMORY_STATE', `${s.memory_mode_enabled_threads ?? '?'} threads registram memory_mode=enabled.`],
    ['goals', `Goals Store · ${s.goals?.total ?? '?'}`, 'STATE_STORE_SUMMARY', `${s.goals?.total ?? '?'} objetivos: ${s.goals?.active ?? '?'} active, ${s.goals?.blocked ?? '?'} blocked, ${s.goals?.complete ?? '?'} complete e ${s.goals?.usage_limited ?? '?'} usage_limited.`],
    ['memory-jobs', `Memory Jobs · ${s.memory?.jobs ?? '?'}`, 'STATE_STORE_SUMMARY', `${s.memory?.jobs ?? '?'} jobs e ${s.memory?.stage1_outputs ?? '?'} stage1_outputs; memória bruta omitida.`],
    ['queue', `Work Queue · ${s.queue_items ?? '?'}`, 'STATE_STORE_SUMMARY', `${s.queue_items ?? '?'} queued_items neste snapshot.`],
    ['logs', `Logs · ${s.logs?.total ?? '?'}`, 'LOG_STORE_SUMMARY', `${s.logs?.total ?? '?'} eventos: TRACE ${s.logs?.TRACE ?? '?'}, INFO ${s.logs?.INFO ?? '?'}, DEBUG ${s.logs?.DEBUG ?? '?'}, WARN ${s.logs?.WARN ?? '?'} e ERROR ${s.logs?.ERROR ?? '?'}.`],
    ['thread-history', `Thread History · ${s.thread_history?.turns ?? '?'} turns`, 'HISTORY_STORE_SUMMARY', `${s.thread_history?.turns ?? '?'} turns, ${s.thread_history?.items ?? '?'} items e ${s.thread_history?.projection_state ?? '?'} projection_state; mensagens omitidas.`],
    ['sandbox-logs', `Sandbox Logs · ${s.sandbox_logs ?? '?'}`, 'SANDBOX_RECORDS', `${s.sandbox_logs ?? '?'} arquivos sandbox.*.log registrados.`],
    ['sandbox-policy', `Sandbox Policies · ${s.threads_total ?? '?'} threads`, 'SANDBOX_POLICY_SNAPSHOT', `${s.sandbox_disabled_threads ?? '?'} disabled e ${s.sandbox_other_threads ?? '?'} em variantes managed/workspace-write/read-only; caminhos omitidos.`],
    ['global-state', 'Codex Global State', 'GLOBAL_STATE', 'Estado global presente; IDs, títulos e detalhes sensíveis não incorporados.'],
    ['config', 'Codex Config', 'LOCAL_CONFIG', 'Configuração local projetada apenas em metadados seguros de capacidades e ferramentas.'],
  ];
  for (const [id, name, type, summary] of artifactDefinitions) {
    push({ id: `codex:snapshot:${id}`, name, group: 'ARTEFATOS', type, summary });
  }

  for (const store of snapshot.state_stores || []) {
    push({
      id: `codex:snapshot:db:${safeId(store)}`,
      name: humanize(store),
      group: 'ARTEFATOS',
      type: 'SQLITE_STATE_STORE',
      proof: `${store}:sqlite_schema`,
      summary: `${store} é state store local; o Inventário guarda somente estrutura/contagens sanitizadas.`,
    });
  }

  for (const drawer of snapshot.observed_root_directories || []) {
    push({
      id: `codex:snapshot:drawer:${safeId(`${drawer.length}-${drawer}`)}`,
      name: drawer,
      group: 'ARTEFATOS',
      type: 'LOCAL_DRAWER',
      proof: snapshot.root_directory_observation_source || 'USER_SCREENSHOT',
      summary: `Pasta/gaveta local observada na raiz .codex. O nome está registrado; o conteúdo interno não fazia parte do ZIP analisado.`,
    });
  }

  const toolEntries = Object.entries(snapshot.dynamic_tools || {});
  push({
    id: 'codex:snapshot:dynamic-tools',
    name: `Dynamic Tool Bindings · ${toolEntries.reduce((total, [, count]) => total + Number(count || 0), 0)} / ${toolEntries.length} únicos`,
    group: 'FERRAMENTAS',
    type: 'DYNAMIC_TOOL_COLLECTION',
    summary: 'Bindings de ferramentas dinâmicas registrados no state store local.',
  });
  for (const [name, count] of toolEntries) {
    push({
      id: `codex:snapshot:tool:${safeId(name)}`,
      name,
      group: 'FERRAMENTAS',
      type: 'DYNAMIC_TOOL',
      proof: 'state_5.sqlite:thread_dynamic_tools.name',
      summary: `Ferramenta dinâmica com ${count} binding(s) registrados.`,
    });
  }

  for (const plugin of snapshot.plugins || []) {
    push({
      id: `codex:snapshot:plugin:${safeId(plugin)}`,
      name: plugin,
      group: 'FERRAMENTAS',
      type: 'CODEX_PLUGIN',
      proof: 'config.toml:plugins',
      summary: 'Plugin marcado enabled=true no snapshot.',
    });
  }
  for (const server of snapshot.mcp_servers || []) {
    push({
      id: `codex:snapshot:mcp:${safeId(server)}`,
      name: server,
      group: 'FERRAMENTAS',
      type: 'MCP_SERVER',
      proof: 'config.toml:mcp_servers',
      summary: 'Servidor MCP configurado no snapshot.',
    });
  }
  for (const model of snapshot.models || []) {
    push({
      id: `codex:snapshot:model:${safeId(model)}`,
      name: model,
      group: 'FERRAMENTAS',
      type: 'MODEL_CACHE_ENTRY',
      proof: 'models_cache.json:models',
      summary: 'Modelo presente no cache local; cache não prova disponibilidade atual do provedor.',
    });
  }
  for (const marketplace of snapshot.marketplaces || []) {
    push({
      id: `codex:snapshot:marketplace:${safeId(marketplace)}`,
      name: marketplace,
      group: 'FERRAMENTAS',
      type: 'PLUGIN_MARKETPLACE',
      proof: 'config.toml:marketplaces',
      summary: 'Marketplace de plugins configurado no snapshot.',
    });
  }

  push({
    id: 'codex:snapshot:remote-control',
    name: `Remote Control Enrollments · ${s.remote_control_enrollments ?? '?'}`,
    group: 'FERRAMENTAS',
    type: 'REMOTE_CONTROL_SNAPSHOT',
    summary: `${s.remote_control_enrollments ?? '?'} enrollments registrados; URLs, contas e IDs foram omitidos.`,
  });
  if (snapshot.structural_capabilities?.remote_control_client) {
    push({
      id: 'codex:snapshot:remote-control-client',
      name: snapshot.structural_capabilities.remote_control_client,
      group: 'FERRAMENTAS',
      type: 'REMOTE_CONTROL_CLIENT',
      summary: 'Nome de cliente de remote-control observado; detalhes de conexão sanitizados.',
    });
  }
  if (snapshot.structural_capabilities?.computer_use === true) {
    push({
      id: 'codex:snapshot:computer-use',
      name: 'Codex Computer Use',
      group: 'FERRAMENTAS',
      type: 'COMPUTER_USE',
      proof: 'config.toml:notify + node_repl.env',
      summary: 'Configuração referencia o executável de Computer Use e marcador de pipe nativo; caminho/identificador omitidos.',
    });
  }
  if (snapshot.structural_capabilities?.chrome_native_host) {
    push({
      id: 'codex:snapshot:chrome-native-host',
      name: snapshot.structural_capabilities.chrome_native_host,
      group: 'FERRAMENTAS',
      type: 'CHROME_NATIVE_HOST',
      proof: 'chrome-native-hosts.json',
      summary: 'Chrome native host registrado; extension ID e caminhos locais omitidos.',
    });
  }

  return records;
}

function scanSanitizedSnapshots(repoRoot) {
  const root = path.resolve(repoRoot, SNAPSHOT_ROOT);
  if (!fs.existsSync(root)) return [];

  const found = [];
  for (const entry of fs.readdirSync(root, { withFileTypes: true })
    .filter((candidate) => candidate.isFile() && candidate.name.toLowerCase().endsWith('.json'))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))) {
    const absolute = path.join(root, entry.name);
    const owner = relative(repoRoot, absolute);
    const snapshot = JSON.parse(fs.readFileSync(absolute, 'utf8'));
    if (snapshot?.sanitized !== true) {
      throw new Error(`HOUSE_INVENTORY_SNAPSHOT_INVALID path=${owner}`);
    }
    if (snapshot?.kind === 'CODEX_LOCAL_SANITIZED_SNAPSHOT') {
      found.push(...expandCodexSnapshot(snapshot, owner));
      continue;
    }
    throw new Error(`HOUSE_INVENTORY_SNAPSHOT_KIND_UNSUPPORTED path=${owner} kind=${snapshot?.kind ?? 'MISSING'}`);
  }
  return found;
}

export function buildOperationalInventoryExtras(repoRoot) {
  const resolvedRoot = path.resolve(repoRoot);
  const items = [
    ...scanPersonas(resolvedRoot),
    ...scanAgentAgreements(resolvedRoot),
    ...scanSanitizedSnapshots(resolvedRoot),
  ];

  return [...new Map(items.map((entry) => [entry.id, entry])).values()]
    .filter((entry) => GROUP_SET.has(entry.group))
    .sort((a, b) => `${a.group}\u0000${a.name}\u0000${a.id}`.localeCompare(`${b.group}\u0000${b.name}\u0000${b.id}`, 'pt-BR'));
}
