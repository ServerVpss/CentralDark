// Observabilidade híbrida CentralDark — ferramentas read-only.
// Não cria segundo painel, não remove stream bruto e não transforma sensor em autoridade.
import { z } from "zod";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../../../../../");
const ADMINISTRAVEIS = join(REPO_ROOT, "docs/CONSCIENCIA/ADMINISTRAVEIS.json");
const HYBRID_CONTRACT = join(REPO_ROOT, "docs/CONSCIENCIA/CONTRATO-HIBRIDO-GRAFO-LOGS-LOCAL.md");
const DEFAULT_DELTA_URL = process.env.CENTRALDARK_VPS_DELTA_URL || "http://127.0.0.1:8099";
const DEFAULT_SCREENPIPE_URL = process.env.SCREENPIPE_BASE_URL || "http://127.0.0.1:3030";
const ALLOWED_HOSTS = new Set(["127.0.0.1", "localhost", "api.centralldark.com", "mcp.centralldark.com"]);

function ok(data) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function safeUrl(raw, fallback) {
  const value = String(raw || fallback || "").trim();
  const url = new URL(value);
  if (!ALLOWED_HOSTS.has(url.hostname)) throw new Error(`endpoint_not_allowed:${url.hostname}`);
  return url;
}

async function fetchJson(url, timeoutMs = 8000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { json = { raw: text.slice(0, 2000) }; }
  return { ok: res.ok, status: res.status, json };
}

function run(command, args, timeout = 5000) {
  try {
    return execFileSync(command, args, { encoding: "utf8", timeout, stdio: ["ignore", "pipe", "pipe"] }).trim();
  } catch (error) {
    return String(error?.stderr || error?.message || error).slice(0, 4000);
  }
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, "utf8")); } catch { return null; }
}

function administraveisSummary() {
  const registry = readJson(ADMINISTRAVEIS);
  if (!registry) return { present: false, path: ADMINISTRAVEIS };
  return {
    present: true,
    status: registry.status,
    owner: registry.owner,
    panel: registry.panel,
    items: Array.isArray(registry.items) ? registry.items.length : 0,
    ids: Array.isArray(registry.items) ? registry.items.map((item) => item.id).sort() : [],
    policy: registry.policy || {},
  };
}

export const hybridObservabilityTools = [
  {
    name: "vps_kernel_delta_status",
    description: "Consulta o status read-only do delta útil do stream VPS via FastAPI Omni Router. Não substitui /admin/logs/stream e não declara fixed point.",
    annotations: { readOnlyHint: true, title: "VPS Kernel Delta — Status" },
    inputSchema: z.object({
      baseUrl: z.string().url().optional().describe("Endpoint base permitido. Padrão: http://127.0.0.1:8099"),
    }),
    handler: async (input) => {
      try {
        const base = safeUrl(input.baseUrl, DEFAULT_DELTA_URL);
        const result = await fetchJson(new URL("/kernel/vps/delta/health", base));
        return ok({ ...result, endpoint: String(base), authority: false, proof: false, raw_stream_preserved_required: true });
      } catch (error) {
        return ok({ ok: false, status: "UNKNOWN", error: String(error.message || error), authority: false, proof: false });
      }
    },
  },
  {
    name: "vps_kernel_delta_snapshot",
    description: "Lê snapshot sanitizado do delta útil VPS. Mantém stream bruto preservado e serve como sensor para Grafo Vivo/HUD.",
    annotations: { readOnlyHint: true, title: "VPS Kernel Delta — Snapshot" },
    inputSchema: z.object({
      limit: z.number().int().min(20).max(500).default(120).optional(),
      baseUrl: z.string().url().optional(),
    }),
    handler: async (input) => {
      try {
        const base = safeUrl(input.baseUrl, DEFAULT_DELTA_URL);
        const url = new URL("/kernel/vps/delta", base);
        url.searchParams.set("limit", String(input.limit ?? 120));
        const result = await fetchJson(url, 10000);
        return ok({ ...result, endpoint: String(url), authority: false, proof: false, raw_stream_preserved_required: true });
      } catch (error) {
        return ok({ ok: false, status: "UNKNOWN", error: String(error.message || error), authority: false, proof: false });
      }
    },
  },
  {
    name: "screenpipe_status",
    description: "Sonda Screenpipe como sensor opcional. Endpoint 200 não basta: precisa atribuir owner/processo antes de virar evidência material.",
    annotations: { readOnlyHint: true, title: "Screenpipe — Sensor opcional" },
    inputSchema: z.object({
      baseUrl: z.string().url().optional().describe("Padrão: http://127.0.0.1:3030"),
    }),
    handler: async (input) => {
      try {
        const base = safeUrl(input.baseUrl, DEFAULT_SCREENPIPE_URL);
        const health = await fetchJson(new URL("/health", base), 5000);
        const body = JSON.stringify(health.json).toLowerCase();
        const attributed = body.includes("screenpipe");
        return ok({ endpoint: String(base), http: health.status, reachable: health.ok, owner_attributed_to_screenpipe: attributed, status: attributed ? "SENSOR_REACHABLE_ATTRIBUTED" : "REACHABLE_NOT_ATTRIBUTED_OR_UNKNOWN", authority: false, proof: false });
      } catch (error) {
        return ok({ reachable: false, status: "UNKNOWN", error: String(error.message || error), authority: false, proof: false });
      }
    },
  },
  {
    name: "remote_desktop_bridge_status",
    description: "Inventaria o bridge Remote Desktop Commander na VPS por systemd/processos, sem expor token e sem reiniciar nada.",
    annotations: { readOnlyHint: true, title: "Remote Desktop Bridge — Status" },
    inputSchema: z.object({}),
    handler: async () => {
      const units = run("systemctl", ["list-units", "--type=service", "--all", "--no-legend", "centraldark-dc-remote@*.service"]);
      const enabled = run("systemctl", ["list-unit-files", "centraldark-dc-remote@*.service", "--no-legend"]);
      const processes = run("bash", ["-lc", "ps -eo pid,ppid,cmd | grep -Ei 'desktop-commander|centraldark-dc-remote' | grep -v grep | head -80"]);
      return ok({ units, enabled, processes, token_values_returned: false, restart_attempted: false, authority: false, proof: false });
    },
  },
  {
    name: "obsidian_live_graph_status",
    description: "Verifica contrato e registry do Grafo Vivo/Obsidian sem presumir bidirecionalidade. Git segue autoridade técnica; Vault é sensor/control surface até prova T1.",
    annotations: { readOnlyHint: true, title: "Obsidian/Grafo Vivo — Status" },
    inputSchema: z.object({}),
    handler: async () => {
      const vault = process.env.CENTRALDARK_OBSIDIAN_VAULT || process.env.OBSIDIAN_VAULT_PATH || "";
      return ok({
        administraveis: administraveisSummary(),
        hybrid_contract_present: existsSync(HYBRID_CONTRACT),
        docs_brain_present: existsSync(join(REPO_ROOT, "docs/BRAIN")),
        configured_vault: vault || null,
        vault_accessible_from_this_runtime: vault ? existsSync(vault) : false,
        bidirectional_sync_proven: false,
        status: "SOURCE_CONTRACT_PRESENT_RUNTIME_T1_REQUIRED",
        authority: false,
        proof: false,
      });
    },
  },
  {
    name: "centraldark_hybrid_inventory",
    description: "Resumo read-only do inventário híbrido: ADMINISTRAVEIS.json, contrato híbrido, processos Remote, delta VPS e sensores opcionais.",
    annotations: { readOnlyHint: true, title: "CentralDark — Inventário híbrido" },
    inputSchema: z.object({}),
    handler: async () => {
      const remote = run("bash", ["-lc", "systemctl list-units --type=service --all --no-legend 'centraldark-dc-remote@*.service' 2>/dev/null || true"]);
      const pm2 = run("bash", ["-lc", "PM2_HOME=/root/.pm2 pm2 jlist 2>/dev/null | python3 -c 'import sys,json; data=json.load(sys.stdin); print(json.dumps([{\"name\":x.get(\"name\"),\"pid\":x.get(\"pid\"),\"status\":x.get(\"pm2_env\",{}).get(\"status\")} for x in data], ensure_ascii=False))' 2>/dev/null || true"], 8000);
      return ok({
        administraveis: administraveisSummary(),
        hybrid_contract_present: existsSync(HYBRID_CONTRACT),
        remote_desktop_units: remote,
        pm2_snapshot: pm2,
        expected_catalog_expansion: ["vps_kernel_delta_status", "vps_kernel_delta_snapshot", "screenpipe_status", "remote_desktop_bridge_status", "obsidian_live_graph_status", "centraldark_hybrid_inventory"],
        raw_stream_must_remain: true,
        same_panel: "MCP CentralDark · Admin",
        authority: false,
        proof: false,
      });
    },
  },
];
