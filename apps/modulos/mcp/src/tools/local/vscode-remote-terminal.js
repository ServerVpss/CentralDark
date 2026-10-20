// CentralDark MCP: existing VS Code terminal via private paired device.
// Only an allowlisted HTTPS tailnet endpoint can be contacted; never accept URL from a tool caller.
import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { sanitizeOutgoingText } from "../../lib/sanitize.js";

const DEVICE_ID = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const TOKEN_ENV = /^CENTRALDARK_VSCODE_DEVICE_TOKEN_[A-Z0-9_]{1,64}$/;
const COMMAND_LIMIT = 800;
const REQUEST_MS = 45_000;
const RECEIPT_LIMIT = 4096;
const READ = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false };

function result(value) {
  return { content: [{ type: "text", text: JSON.stringify(value) }] };
}
function errorState(status, detail = null) {
  return result({ ok: false, status, detail, proof: false });
}
// Config holds IDs, private tailnet HTTPS hosts, and *names* of private env vars, never token values.
// No dynamically supplied arbitrary URLs, RFC1918 IPs, redirects, plain HTTP or public domains.
export function readVsCodeDevices(raw = process.env.CENTRALDARK_VSCODE_DEVICES_JSON || "", env = process.env) {
  if (!raw) return [];
  let entries;
  try { entries = JSON.parse(raw); } catch { return []; }
  if (!Array.isArray(entries) || entries.length > 25) return [];
  const ids = new Set();
  const valid = [];
  for (const entry of entries) {
    if (typeof entry?.id !== "string" || !DEVICE_ID.test(entry.id) || ids.has(entry.id)) continue;
    if (typeof entry?.tokenEnv !== "string" || !TOKEN_ENV.test(entry.tokenEnv)) continue;
    if (typeof env[entry.tokenEnv] !== "string" || env[entry.tokenEnv].length < 32) continue;
    try {
      const url = new URL(entry.url);
      if (url.protocol !== "https:" || !url.hostname.endsWith(".ts.net")
        || url.username || url.password || url.port || url.pathname !== "/"
        || url.search || url.hash || url.hostname.length > 253) continue;
      valid.push({ id: entry.id, endpoint: url.origin, tokenEnv: entry.tokenEnv });
      ids.add(entry.id);
    } catch { /* reject malformed endpoint */ }
  }
  return valid;
}
export function findVsCodeDevice(id, entries = readVsCodeDevices()) {
  return entries.find(entry => entry.id === id) || null;
}

async function request(device, pathname, { method = "GET", payload, timeoutMs = REQUEST_MS } = {}) {
  const secret = process.env[device.tokenEnv];
  if (!secret || secret.length < 32) return { ok: false, status: "DEVICE_NOT_PAIRED" };
  try {
    const response = await fetch(device.endpoint + pathname, {
      method,
      redirect: "error",
      headers: {
        Authorization: "Bearer " + secret,
        Accept: "application/json",
        ...(payload ? { "Content-Type": "application/json" } : {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (response.status === 401 || response.status === 403) return { ok: false, status: "DEVICE_AUTH_FAILED" };
    if (!response.ok) return { ok: false, status: "DEVICE_HTTP_" + response.status };
    const responseText = await response.text();
    if (responseText.length > 15000) return { ok: false, status: "DEVICE_RESPONSE_TOO_LARGE" };
    const data = JSON.parse(responseText);
    if (!data || typeof data !== "object" || typeof data.status !== "string") return { ok: false, status: "DEVICE_INVALID_RECEIPT" };
    return data;
  } catch {
    // Timeouts after POST have uncertain effects: never say failed/retry automatically.
    return { ok: false, status: method === "POST" ? "POST_OUTCOME_UNKNOWN" : "DEVICE_UNREACHABLE" };
  }
}

const deviceId = z.string().regex(DEVICE_ID);
export const vscodeRemoteTerminalTools = [
  {
    name: "vscode_remote_devices",
    description: "Inventaria apenas dispositivos VS Code explicitamente pareados na tailnet; conexao != permissao de executar.",
    annotations: { ...READ, title: "VS Code remoto — dispositivos pareados" },
    inputSchema: z.object({}),
    handler: async () => {
      const entries = readVsCodeDevices();
      const observations = await Promise.all(entries.map(async item => {
        const response = await request(item, "/status", { timeoutMs: 3500 });
        return { deviceId: item.id, online: response.ok === true, status: String(response.status || "UNKNOWN"), authenticated: response.ok === true };
      }));
      return result({ ok: true, status: "CATALOG_ONLY", devices: observations, total: observations.length, controlProven: false });
    },
  },
  {
    name: "vscode_remote_terminals",
    description: "Lista PIDs do VS Code em dispositivo autorizado. Nao abre terminal, nao escreve ou expõe segredo.",
    annotations: { ...READ, title: "VS Code remoto — terminais existentes" },
    inputSchema: z.object({ deviceId }),
    handler: async input => {
      const device = findVsCodeDevice(input.deviceId);
      if (!device) return errorState("DEVICE_NOT_PAIRED");
      const data = await request(device, "/terminals", { timeoutMs: 5000 });
      if (!data.ok) return errorState(data.status || "DEVICE_UNREACHABLE");
      const terminals = Array.isArray(data.terminals) ? data.terminals.slice(0, 50) : [];
      return result({ ok: true, status: "LIVE_TERMINAL_READBACK", deviceId: device.id, terminals: terminals.map(t => ({
        pid: Number.isSafeInteger(t.pid) ? t.pid : null,
        name: String(t.name || "").slice(0, 80),
        shellIntegration: t.shellIntegration === true,
      })), executionProven: false });
    },
  },
  {
    name: "vscode_remote_execute",
    description: "ADMIN: executa uma unica ordem aprovada localmente em terminal VS Code EXISTENTE, por PID medido; sem novo terminal, sem replay automatico.",
    annotations: { ...WRITE, title: "VS Code remoto — executar em PID existente" },
    inputSchema: z.object({
      deviceId,
      pid: z.number().int().positive(),
      command: z.string().min(1).max(COMMAND_LIMIT).refine(x => !/[\r\n\0]/.test(x), "Single-line command only"),
      intentId: z.string().min(1).max(100).optional(),
    }),
    handler: async input => {
      const device = findVsCodeDevice(input.deviceId);
      if (!device) return errorState("DEVICE_NOT_PAIRED");
      const requestId = randomUUID();
      const commandHash = createHash("sha256").update(input.command).digest("hex");
      const data = await request(device, "/execute", {
        method: "POST",
        payload: { requestId, at: new Date().toISOString(), pid: input.pid,
          command: input.command, commandHash, intentId: input.intentId || null },
      });
      if (data.requestId !== requestId) return errorState(data.status === "POST_OUTCOME_UNKNOWN" ? "POST_OUTCOME_UNKNOWN" : "CORRELATION_FAILED");
      const exitCode = Number.isSafeInteger(data.exitCode) ? data.exitCode : null;
      const proven = data.status === "EXECUTED" && data.ok === true && exitCode !== null;
      return result({
        ok: proven && exitCode === 0,
        status: proven ? (exitCode === 0 ? "EXECUTED_EXIT_ZERO" : "EXECUTED_NONZERO") : String(data.status || "UNKNOWN"),
        requestId, deviceId: device.id, pid: input.pid, commandSha256: commandHash,
        exitCode, output: sanitizeOutgoingText(String(data.output || "")).slice(0, RECEIPT_LIMIT),
        executionProven: proven, proof: proven, localConsent: data.localConsent === true,
        observedAt: typeof data.observedAt === "string" ? data.observedAt : null,
      });
    },
  },
];
