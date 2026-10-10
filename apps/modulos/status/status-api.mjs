// CentralDark · Mega Painel na API existente (sem servidor ou writer novo).
// Donor: apps/modulos/status/*.json. Snapshots são históricos até prova de frescor.
// O servidor Hermes Core já existente importa esta projeção; nunca expor arquivos brutos.
import { readFile, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const FILE_LIMIT = 512 * 1024;
const SOURCES = Object.freeze({
  projeto: ['painel-data.json', 5 * 60_000],
  infraestrutura: ['infra-vivo.json', 2 * 60_000],
  mcp_24h: ['mcp-health.json', 2 * 60_000],
  diagnostico_ias: ['ai-diag.json', 2 * 60_000],
  conselho: ['conselho-vivo.json', 5 * 60_000],
  capsula: ['capsula-data.json', 5 * 60_000],
  mcp_legado: ['mcp-status.json', 2 * 60_000],
  grafo: ['graph-data.json', 30 * 60_000],
});
const number = (v) => typeof v === 'number' && Number.isFinite(v) ? v : null;
const truth = (v) => typeof v === 'boolean' ? v : null;
function safeText(value, limit = 180) {
  if (typeof value !== 'string') return null;
  return value.slice(0, limit)
    .replace(/(bearer\s+)[^\s]+/gi, '$1[REDACTED]')
    .replace(/((?:token|secret|password|api[_-]?key|authorization)\s*[:=]\s*)[^\s,;]+/gi, '$1[REDACTED]');
}
function iso(value) {
  if (typeof value !== 'string') return null;
  const d = Date.parse(value);
  return Number.isFinite(d) ? new Date(d).toISOString() : null;
}
const brief = (value) => ({
  status: safeText(value?.status, 60),
  source: safeText(value?.source, 90),
});
const recent = (rows, max, kind) => (Array.isArray(rows) ? rows.slice(0, max) : []).map((row) => {
  if (kind === 'event') return {
    at: iso(row.time),
    title: safeText(row.titulo),
    detail: safeText(row.detalhe, 240),
    sector: safeText(row.area, 80),
    sha: /^[0-9a-f]{7,40}$/i.test(row.sha || '') ? row.sha : null,
  };
  if (kind === 'ia') return {
    at: iso(row.time), agent: safeText(row.ia, 100),
    action: safeText(row.action, 220), sector: safeText(row.area, 80),
    status: safeText(row.status, 50),
  };
  return { name: safeText(row.name, 85), status: safeText(row.status, 50),
    restarts: number(row.restarts), cpu: number(row.cpu), mem_mb: number(row.mem_mb) };
});
function project(d) {
  return {
    updated_at: iso(d.updatedAt),
    phase: safeText(d.project?.phase),
    current_task: safeText(d.project?.currentTask, 220),
    state_source: safeText(d.project?.stateSource, 80),
    progress_pct: number(d.project?.overallProgress),
    event_count_in_snapshot: Array.isArray(d.events) ? d.events.length : 0,
    events: recent(d.events, 30, 'event'),
    ia_timeline: recent(d.iaTimeline, 30, 'ia'),
    milestones: (Array.isArray(d.milestones) ? d.milestones.slice(0, 30) : []).map(x => ({
      title: safeText(x.title || x.name), status: safeText(x.status, 50),
      percent: number(x.percent),
    })),
    // Dados legados opcionais. A ausência é explícita, nunca card verde.
    source_presence: Object.fromEntries(['maturity','agents','iasVivas','aiSuggestions','nextSteps',
      'iaCards','botCards','sectorCards','tarefasAtivas','humanReview','linearSync',
      'handoffAtual','segurancaArea'].map(k => [k, Object.hasOwn(d, k)])),
  };
}
function infrastructure(d) {
  return {
    updated_at: iso(d.updatedAt),
    cpu_load: { one_min: number(d.load?.['1m']), five_min: number(d.load?.['5m']) },
    memory: { total_gb: number(d.mem?.total_gb), used_gb: number(d.mem?.used_gb),
      used_pct: number(d.mem?.used_pct) },
    disk: { used_pct: number(d.disk?.used_pct) },
    processes: { online: number(d.pm2?.online), stopped: number(d.pm2?.stopped),
      errored: number(d.pm2?.errored), total: number(d.pm2?.total),
      items: recent(d.pm2?.procs, 55, 'process') },
    mcp: { ok: truth(d.mcp?.ok), version: safeText(d.mcp?.version, 60),
      tool_count: number(d.mcp?.toolCount) },
  };
}
function health(d) {
  return {
    updated_at: iso(d.updatedAt),
    last_check: { http: number(d.lastCheck?.httpCode),
      latency_ms: number(d.lastCheck?.latencyMs), status: safeText(d.lastCheck?.status, 40) },
    last_24h: { checks: number(d.last24h?.checks), failures: number(d.last24h?.failures),
      restarts: number(d.last24h?.autoRestarts),
      // Não converter contador zero nem snapshot antigo em 100% disponível.
      uptime_pct: number(d.last24h?.checks) > 0 ? number(d.last24h?.uptimePct) : null },
    last_failure_at: iso(d.lastFailureAt),
  };
}
function diag(d) {
  return { updated_at: iso(d.gerado_em),
    measured: { ok: number(d.placar?.ok), total: number(d.placar?.total),
      state: safeText(d.placar?.saude, 80) },
    probes: Object.fromEntries(Object.entries(d.testes || {}).slice(0, 20)
      .map(([k, v]) => [k, { ok: truth(v.ok), http: number(v.status), ms: number(v.ms) }])),
  };
}
function council(d) {
  return { updated_at: iso(d.atualizadoEm),
    debates: number(d.stats?.totalDebates), evolutions: number(d.stats?.totalEvolucoes),
    recent_debates: (Array.isArray(d.ultimosDebates) ? d.ultimosDebates.slice(0, 8) : [])
      .map(x => ({ at: iso(x.quando), summary: safeText(x.preview, 170) })) };
}
function graph(d) {
  return {
    updated_at: iso(d.updatedAt),
    total_nodes: number(d.stats?.total_nodes),
    total_edges: number(d.stats?.total_edges),
    monitored: number(d.stats?.monitorados),
    online: number(d.stats?.online),
    offline: number(d.stats?.offline),
    gateway_req_15min: number(d.stats?.gateway_req_15min),
    compass_links_total: number(d.stats?.compass_links_total),
    compass_links_broken: number(d.stats?.compass_links_broken),
    // Segurança: os nomes, endereços e ligações do grafo não são expostos na API pública.
  };
}
function capsule(d) {
  return { updated_at: iso(d.generated_at_utc), source_event_count: number(d.source?.event_count),
    source_run_count: number(d.source?.run_count),
    state: safeText(d.capsule?.status, 80), reason: safeText(d.capsule?.reason, 80),
    promoted: truth(d.capsule?.ready_for_promotion),
    xp_valid: number(d.learning?.xp_valid), false_green: number(d.learning?.false_green_count) };
}
const PICK = {
  projeto: project, infraestrutura: infrastructure, mcp_24h: health,
  diagnostico_ias: diag, conselho: council, capsula: capsule,
  grafo: graph,
  mcp_legado: d => ({ checked_at: iso(d.checado_em), status: safeText(d.status, 60),
    process_status: safeText(d.pm2_status, 60) }),
};
async function source(name, currentMs) {
  const [filename, ttl] = SOURCES[name];
  const path = join(ROOT, filename); // Nome de arquivo definido em código; não vem do request.
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size > FILE_LIMIT) throw new Error('SOURCE_INVALID');
    const data = JSON.parse(await readFile(path, 'utf8'));
    if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('JSON_OBJECT_REQUIRED');
    const view = PICK[name](data);
    const observed = view.updated_at || view.checked_at || null;
    const age = observed ? currentMs - Date.parse(observed) : null;
    const fresh = age != null && age >= 0 && age <= ttl;
    return { state: fresh ? 'OBSERVED' : 'STALE', source: filename,
      observed_at: observed, age_seconds: age == null ? null : Math.round(age / 1000),
      ttl_seconds: Math.round(ttl / 1000), data: view };
  } catch (error) {
    const code = error?.code === 'ENOENT' ? 'SOURCE_MISSING' : 'SOURCE_UNREADABLE';
    return { state: 'UNKNOWN', source: filename, observed_at: null,
      age_seconds: null, ttl_seconds: Math.round(ttl / 1000), data: null, reason: code };
  }
}
export async function buildStatusOverview({ now = new Date() } = {}) {
  const at = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(at.getTime())) throw new Error('INVALID_CLOCK');
  const names = Object.keys(SOURCES);
  const values = await Promise.all(names.map(name => source(name, at.getTime())));
  const sections = Object.fromEntries(names.map((name, i) => [name, values[i]]));
  const observed = values.filter(x => x.state === 'OBSERVED').length;
  const stale = values.filter(x => x.state === 'STALE').length;
  const missing = values.filter(x => x.state === 'UNKNOWN').length;
  return { ok: true, schema: 'centraldark.status-one-heart.v1',
    owner: 'apps/modulos/status', api_owner: 'HERMES-CORE/core/orchestrator.mjs',
    generated_at: at.toISOString(), status: observed === values.length ? 'OBSERVED' : 'PARTIAL',
    // Identifica cobertura da API, NÃO a saúde de todos os serviços.
    coverage: { total: names.length, observed, stale, unknown: missing },
    sections, realtime_policy: 'SNAPSHOT_WITH_FRESHNESS_NOT_RUNTIME_CERTIFICATION',
    next_cursor: missing ? 'RECOVER_MISSING_STATUS_PRODUCERS' : stale ?
      'REFRESH_STALE_STATUS_PRODUCERS' : 'VERIFY_CONSUMER_READBACK' };
}
export async function buildStatusDetail(name, options) {
  if (!Object.hasOwn(SOURCES, name || '')) return null;
  const snapshot = await buildStatusOverview(options);
  return { ok: true, schema: snapshot.schema, owner: snapshot.owner,
    generated_at: snapshot.generated_at, section: name, ...snapshot.sections[name] };
}
