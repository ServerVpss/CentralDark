// #OBSERVACOES# @owner=mcp-One-Heart @doc_ref=docs/RECEIPTS/2026-10-25-ONE-HEART-SUPABASE-SIGNALS.md
// A mesma API /heartbeat agrega resumos existentes: sem novo scheduler, tabela ou Edge Function.
// Somente servidor pode ler SUPABASE_SERVICE_ROLE_KEY. Nenhuma chave/linha detalhada vai ao cliente.
const CACHE_MS = 30_000;
const REQUEST_TIMEOUT_MS = 1_500;
const EDGE_FRESH_MS = 300_000;
const PULSE_FRESH_MS = 180_000;
let cacheUntil = 0;
let cachePromise = null;

const REQUIRED_RADAR = new Set([
  "github","liveFabric","grafoVivo","omniRouter","apiHealth","heartbeat",
  "omniModels","receipts","casaSite","screenpipe","screenpipeVps","actions",
]);
const SOURCES = [
  ["edge", "/rest/v1/edge_function_health?select=checked_at,total_functions,online_count,offline_count,error_count,all_healthy&order=checked_at.desc&limit=1"],
  ["modules", "/rest/v1/module_health_status?select=health_label,last_check_at&order=last_check_at.desc&limit=100"],
  ["radar", "/rest/v1/radar_pulses?select=source,status,measured_at,ttl_seconds&order=measured_at.desc&limit=50"],
];

function config(env) {
  const url = String(env.HUB_SUPABASE_URL || env.SUPABASE_URL || "").trim().replace(/\/$/, "");
  const key = String(env.HUB_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || "").trim();
  let safe = false;
  try { safe = new URL(url).hostname.endsWith(".supabase.co") && new URL(url).protocol === "https:"; } catch {}
  return {url, key, safe};
}
const fresh = (date, now, maxMs) => {
  const ms = Date.parse(String(date || ""));
  return Number.isFinite(ms) && ms <= now && now - ms <= maxMs;
};
const countNumber = (n) => Number.isFinite(Number(n)) ? Number(n) : 0;
function snapshot(results, now) {
  const [edge, modules, radar] = results;
  const lastEdge = edge?.[0] || null;
  const edgeFresh = fresh(lastEdge?.checked_at, now, EDGE_FRESH_MS);
  const edgeStatus = !edgeFresh ? "UNKNOWN" : (
    lastEdge.all_healthy === true && countNumber(lastEdge.offline_count) === 0 && countNumber(lastEdge.error_count) === 0
      ? "PASS" : "FAIL");
  const currentModules = Array.isArray(modules) ? modules.filter(m => fresh(m.last_check_at, now, 86_400_000)) : [];
  const moduleErrors = currentModules.filter(m => /degraded|error|fail|offline|unhealthy/i.test(String(m.health_label || ""))).length;
  const moduleUnknown = currentModules.filter(m => !/^(healthy|pass|green|verde|online)$/i.test(String(m.health_label || "")) &&
    !/degraded|error|fail|offline|unhealthy/i.test(String(m.health_label || ""))).length;
  const freshRadar = new Map();
  for (const item of Array.isArray(radar) ? radar : []) {
    if (!item?.source || freshRadar.has(item.source)) continue;
    const ttl = Math.min(300, Math.max(1, countNumber(item.ttl_seconds) || 120));
    if (fresh(item.measured_at, now, ttl * 1000)) freshRadar.set(item.source, item.status);
  }
  const radarFailures = [...freshRadar.values()].filter(s => s === "FAIL" || s === "ANOMALY").length;
  const radarComplete = [...REQUIRED_RADAR].every(source => freshRadar.get(source) === "PASS");
  return {
    owner: "supabase",
    state: edgeStatus === "FAIL" || radarFailures > 0 || moduleErrors > 0 ? "FAIL" :
      edgeStatus === "PASS" && currentModules.length > 0 && moduleUnknown === 0 && radarComplete ? "PASS" : "UNKNOWN",
    edge_functions: {
      state: edgeStatus,
      measured_at: lastEdge?.checked_at || null,
      total: lastEdge ? countNumber(lastEdge.total_functions) : null,
      online: lastEdge ? countNumber(lastEdge.online_count) : null,
      offline: lastEdge ? countNumber(lastEdge.offline_count) : null,
      errors: lastEdge ? countNumber(lastEdge.error_count) : null,
    },
    modules: {state: currentModules.length === 0 || moduleUnknown > 0 ? "UNKNOWN" : moduleErrors > 0 ? "FAIL" : "OBSERVED",
      measured: currentModules.length, errors: moduleErrors},
    radar: {state: freshRadar.size === 0 ? "UNKNOWN" : radarFailures > 0 ? "FAIL" : radarComplete ? "PASS" : "PARTIAL",
      sources_fresh: freshRadar.size, failures: radarFailures},
  };
}
async function load({env, fetcher, now}) {
  const {url, key, safe} = config(env);
  if (!safe || !key) return {
    owner: "supabase", state: "UNKNOWN", reason: "SOURCE_NOT_CONFIGURED",
    edge_functions: {state:"UNKNOWN",measured_at:null,total:null,online:null,offline:null,errors:null},
    modules:{state:"UNKNOWN",measured:0,errors:0},radar:{state:"UNKNOWN",sources_fresh:0,failures:0},
  };
  const headers = {Accept:"application/json", apikey:key};
  if (!key.startsWith("sb_secret_") && !key.startsWith("sb_publishable_")) headers.Authorization = "Bearer " + key;
  const results = await Promise.all(SOURCES.map(async ([,path]) => {
    try {
      const resp = await fetcher(url + path,{headers,signal:AbortSignal.timeout(REQUEST_TIMEOUT_MS)});
      if (!resp.ok) return null;
      const rows = await resp.json();
      return Array.isArray(rows) ? rows : null;
    } catch { return null; }
  }));
  return snapshot(results, now);
}
export async function getOneHeartSupabaseSignals(opts={}) {
  const cacheEnabled = !Object.keys(opts).length;
  if (cacheEnabled && cachePromise && Date.now() < cacheUntil) return cachePromise;
  const run = load({
    env: opts.env || process.env,
    fetcher: opts.fetcher || fetch,
    now: opts.now ?? Date.now(),
  }).catch(() => ({owner:"supabase",state:"UNKNOWN",reason:"READ_FAILED"}));
  if (cacheEnabled) {
    cachePromise = run;
    cacheUntil = Date.now() + CACHE_MS;
  }
  return run;
}