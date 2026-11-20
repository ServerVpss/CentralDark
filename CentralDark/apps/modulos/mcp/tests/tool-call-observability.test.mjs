import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const logDir = fs.mkdtempSync(path.join(os.tmpdir(), "centraldark-toolcall-"));
process.env.MCP_LOG_DIR = logDir;

const audit = await import("../src/audit-logger.js");
const { log } = await import("../src/log.js");

test("tool-call envelope carries request trace through async work", async () => {
  let envelope;
  await audit.runWithAuditContext({
    mission_id: "MISSION-TOOLCALL",
    correlation_id: "corr-12345678",
    request_id: "request-12345678",
    trace_id: "1234567890abcdef1234567890abcdef",
    span_id: "1234567890abcdef",
    parent_span_id: "fedcba0987654321",
  }, async () => {
    await Promise.resolve();
    envelope = audit.auditToolExecution({
      method: "tools/call",
      toolName: "github_read",
      input: { repo: "ServerVpss/CentralDark" },
      result: { ok: true },
      durationMs: 12,
      exitCode: 0,
      ok: true,
    });
  });

  assert.equal(envelope.schema, "centraldark.mcp.tool-call.v1");
  assert.equal(envelope.mission_id, "MISSION-TOOLCALL");
  assert.equal(envelope.correlation_id, "corr-12345678");
  assert.equal(envelope.request_id, "request-12345678");
  assert.equal(envelope.trace_id, "1234567890abcdef1234567890abcdef");
  assert.equal(envelope.span_id, "1234567890abcdef");
  assert.equal(envelope.status, "PASS");
  assert.equal(envelope.pid, process.pid);
  assert.ok(envelope.call_id);
  assert.ok(envelope.started_at);
  assert.ok(envelope.ended_at);
});

test("tool-call envelope redacts sensitive fields before observers see them", () => {
  let observed;
  const unsubscribe = audit.subscribeAuditEvents((event) => { observed = event; });
  const authFixture = "Bea" + "rer " + "abcdefghijklmnopqrstuvwx";
  audit.auditToolExecution({
    method: "tools/call",
    toolName: "safe_probe",
    input: { authorization: authFixture, password: "segredo" },
    result: { email: "pessoa@example.com", ok: false },
    durationMs: 1,
    ok: false,
  });
  unsubscribe();
  assert.equal(observed.input.authorization, "[REDACTED]");
  assert.equal(observed.input.password, "[REDACTED]");
  assert.equal(observed.result.email, "[REDACTED_EMAIL]");
  assert.equal(observed.status, "FAIL");
});

test("audit event crosses existing log layer used by admin SSE", () => {
  const seen = [];
  const originalInfo = log.info;
  log.info = (msg, meta) => seen.push({ msg, meta });
  try {
    audit.auditToolExecution({ method: "tools/list", toolName: "list_tools", input: {}, result: { toolCount: 7 }, durationMs: 2, ok: true });
  } finally {
    log.info = originalInfo;
  }
  const live = seen.find((entry) => entry.msg === "mcp_tool_execution_live");
  assert.ok(live, "mcp_tool_execution_live must cross the existing log layer");
  assert.equal(live.meta.toolName, "list_tools");
  assert.equal(live.meta.status, "PASS");
});

test("Tool Call Lens reutiliza audit logger no MCP e visual do Cockpit", () => {
  const backend = fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8");
  const visual = fs.readFileSync(new URL("../../../instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx", import.meta.url), "utf8");
  assert.match(backend, /subscribeAuditEvents\(\(evento\) =>/);
  assert.match(backend, /mcp_tool_call/);
  const begin = backend.indexOf("subscribeAuditEvents((evento) =>");
  const end = backend.indexOf("function extrairRota(", begin);
  const observer = backend.slice(begin, end);
  assert.ok(begin >= 0 && end > begin);
  assert.doesNotMatch(observer, /evento\.(?:input|result|error)/);
  for (const campo of ["mcp_host_pid", "durationMs", "correlation_id", "call_id"]) assert.ok(observer.includes(campo));
  for (const marker of ["function ToolCallLensMcp()", "q=mcp_tool_call&limit=100", "MCP_AUDIT", "Pausar", "Rever / Atualizar", "PASS", "FAIL"]) assert.ok(visual.includes(marker), marker);
});

test("CORS usa allowlist de origem e preserva autenticacao admin", () => {
  const src = fs.readFileSync(new URL("../src/index.js", import.meta.url), "utf8");
  const backend = fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8");
  for (const marker of [
    'https://admin.centralldark.com',
    'CENTRALDARK_COCKPIT_ADMIN_READ_ORIGINS',
    'cockpitAdminReadOrigins.has(origin)',
    'path.startsWith("/admin/api/")',
    'path === "/admin/login"',
    'path.startsWith("/device/")',
    'res.setHeader("Access-Control-Allow-Origin", origin)',
    'res.setHeader("Access-Control-Allow-Credentials", "true")',
    'res.vary("Origin")',
  ]) assert.ok(src.includes(marker), marker);
  assert.match(backend, /export function isAdmin\(req\)/);
  assert.match(backend, /export function adminBuscarLogs\(req, res\) \{\s*if \(!isAdmin\(req\)\)/);
});

test("Forja Tool Call Lens preserva quatro gates e nao faz merge/deploy", () => {
  const script = fs.readFileSync(new URL(
    "../../../../skills/vs-code-restore/tools/forja-tool-call-lens-4-fases.ps1",
    import.meta.url,
  ), "utf8");
  assert.ok(script.includes("00_ANTIRREGRESSAO"));
  assert.ok(script.includes("postInstallRegression"));
  assert.ok(script.includes("DIRTY_WORKTREE_OTHER_WRITER"));
  for (const phase of ["01_CONSTRUIR", "02_INSTALAR", "03_CONECTAR", "04_PROVAR"]) {
    assert.ok(script.includes(phase), "fase obrigatoria ausente: " + phase);
  }
  assert.ok(script.includes("ExitCode") || script.includes("LASTEXITCODE"));
  assert.ok(script.includes("CENTRALDARK_SSH_READBACK_OK"));
  assert.ok(script.includes("VSIX_VERSION_READBACK_MISSING"));
  assert.ok(script.includes("E2E_TOOL_CALL_NOT_MEASURED"));
  assert.ok(script.includes("published = $false"));
  assert.ok(script.includes("exit 3"));
  assert.doesNotMatch(script, /git\s+(?:reset|merge|push|clean)|systemctl\s+restart|force.push/i);
});


test("Forja conserva intent-cycle e diagnostico E2E nos owners atuais", () => {
  const backend = fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8");
  const visual = fs.readFileSync(new URL("../../../instinto-superior/src/components/central/McpConsoleCentralDark.tsx", import.meta.url), "utf8");
  for (const marker of ["export function adminIntentRun", "runIntentCycle(req.body", "SAME_ORIGIN_REQUIRED", "ORIGIN_REQUIRED", "export async function adminE2E"]) assert.ok(backend.includes(marker), marker);
  for (const marker of ["Executar diagnóstico MCP E2E", "/admin/api/e2e", "/admin/api/intent"]) assert.ok(visual.includes(marker), marker);
});

test("Inventario ZENDRIVE 20261018 nao transforma rota em falso verde", () => {
  const source = fs.readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
  const routes = source.split("const AUTHORIZED_ROUTE_CATALOG = Object.freeze([")[1]?.split("]);")[0];
  assert.ok(routes, "owner do catalogo existe");
  const ids = [...routes.matchAll(/\{\s*id:\s*"([A-Z0-9_]+)"/g)].map(m => m[1]);
  assert.equal(new Set(ids).size, ids.length, "rotas unicas");
  for (const id of [
    "SSH_VPS_DIRECT", "ZENDRIVE_VSCODE_REMOTE_SSH", "TAILSCALE_PRIVATE_ROUTE",
    "RDC_DESKTOP_COMMANDER", "MCP_VPS_NATIVE_HTTP", "HERMES_SHELL"
  ]) assert.ok(ids.includes(id), "rota nao catalogada: " + id);
  const zendrive = routes.split("\n").find(line => line.includes('id: "ZENDRIVE_VSCODE_REMOTE_SSH"'));
  assert.ok(zendrive);
  assert.match(zendrive, /runtimeState: "MEASURE_AT_RUNTIME"/);
  assert.doesNotMatch(zendrive, /runtimeState: "PASS"/);
  assert.match(routes, /Segredo-VPS\(VPN\)\|segredo-vpss\(fallback-publico\)/);
  for (const id of [
    "ZENDRIVE_SSH_VPN", "VSCODE_INTEGRATED_TERMINAL", "CASA_FORJA_DRIVES",
    "CASA_BROWSER_WINDOWS"
  ]) assert.ok(source.includes('id: "' + id + '"'), "capacidade ausente: " + id);
  assert.match(source, /GUI_TERMINAL_RECEIPT_PENDING/);
  assert.match(source, /WINDOW_TITLE_ONLY_BROWSER_PLUGIN_CONTEXT_UNAVAILABLE/);
});

test("Inventario ZENDRIVE 20261018 tem provas e limites no documento canonico", () => {
  const doc = fs.readFileSync(new URL("../../../../docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md", import.meta.url), "utf8");
  for (const marker of [
    "INVENTARIO-ZENDRIVE-20261018", "SSH_CASA_VPS_PELA_VPN=PASS",
    "SHELL_VPS_CASA=UNKNOWN", "TERMINAL_INTEGRADO_EXEC_RECEIPT=UNKNOWN",
    "BROWSER_TABS_CONTEXT=BLOCKED_ORIGIN", "SCREENPIPE_CASA=DEGRADED",
    "RDC_FALLBACK_PRESERVADO=true"
  ]) assert.ok(doc.includes(marker), "contraprova faltando: " + marker);
});


test("Casa prioriza Tailscale, preserva RDC apenas como fallback", () => {
  const source = fs.readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
  const catalog = source.split("const AUTHORIZED_ROUTE_CATALOG = Object.freeze([")[1]?.split("]);")[0] ?? "";
  assert.ok(catalog.indexOf('id: "TAILSCALE_PRIVATE_ROUTE"') < catalog.indexOf('id: "RDC_DESKTOP_COMMANDER"'));
  assert.match(catalog, /priority: "FALLBACK_ONLY"/);
  assert.match(catalog, /fallbackRequires: "EXPLICIT_CHEFE_OPT_IN_AND_PRIMARY_ROUTE_FAILED_AND_AUTHORIZED_DEVICE_ONLINE"/);
  assert.match(catalog, /id: "MCP_REMOTE_OAUTH"/);
});

test("31 ferramentas RDC mapeadas no catalogo sem liberar execucao automatica", () => {
  const src = fs.readFileSync(new URL("../src/tools/core/mcp-admin.js", import.meta.url), "utf8");
  const segment = src.split("const RDC_EQUIVALENCE_MATRIX = Object.freeze([")[1]?.split("]);")[0];
  assert.ok(segment, "matriz canônica ausente");
  const names = [...segment.matchAll(/"tool":"([a-z_]+)"/g)].map(match => match[1]);
  assert.equal(names.length, 31, "inventario completo da origem");
  assert.equal(new Set(names).size, 31, "ferramentas duplicadas");
  for (const n of ["start_process", "read_file", "kill_process", "list_devices", "get_tool_result", "get_recent_tool_calls", "write_pdf"]) {
    assert.ok(names.includes(n), "ferramenta faltante: " + n);
  }
  assert.match(src, /desktopCommanderEquivalenceCount: RDC_EQUIVALENCE_MATRIX\.length/);
  assert.match(src, /desktopCommanderEquivalences: remoteEquivalences/);
  assert.match(src, /desktopCommanderParity: "PARTIAL_ROUTE_CAPABILITIES_ONLY_NO_CASA_REVERSE_EXEC_PROOF"/);
  assert.match(segment, /"proof":"GUARDED_DESTRUCTIVE_UNTESTED"/);
  const doc = fs.readFileSync(new URL("../../../../docs/ARQUITETURA/CENTRALDARK-REMOTE-MCP-GATEWAY.md", import.meta.url), "utf8");
  assert.ok(doc.includes("31 ferramentas do Desktop Commander: equivalência tipada"));
  for (const name of names) assert.ok(doc.includes("| " + name + " |"), "linha da matriz ausente: " + name);
});

test("UI admin historica convergiu no Cockpit sem perder controles", () => {
  const visual = fs.readFileSync(new URL("../../../instinto-superior/src/components/central/McpConsoleCentralDark.tsx", import.meta.url), "utf8");
  const backend = fs.readFileSync(new URL("../src/admin.js", import.meta.url), "utf8");
  const oauth = fs.readFileSync(new URL("../src/oauth.js", import.meta.url), "utf8");
  for (const marker of [
    "McpAuditoriaFiltrada", "McpFerramentasPorCategoria", "McpConector",
    "McpEmissaoChave", "McpResumoVivo", "McpOperacionalLegado", "Sair do MCP",
    'aria-label="CID"', 'aria-label="Rota"', 'aria-label="Nível"', 'aria-label="Texto livre"',
    "Buscar", "Limpar", "Nova chave · emitir", "/api/mcp", "Hermes ·",
  ]) assert.ok(visual.includes(marker), marker);
  assert.match(backend, /linha\.meta\?\.cid \|\| linha\.meta\?\.correlation_id/);
  assert.match(oauth, /export function handleIssueKey\(req, res\)/);
  assert.doesNotMatch(visual, /https:\/\/mcp\.centralldark\.com\/mcp["']/);
});
