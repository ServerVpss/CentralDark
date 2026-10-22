import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (relative) => readFileSync(new URL(relative, import.meta.url), "utf8");
const ui = read("../src/components/central/ObservabilidadeCentralDark.tsx");
const admin = read("../src/components/central/PainelAdminCentralDark.tsx");
const shell = read("../src/components/central/CockpitShell.tsx");

test("Tool Call Lens está no owner existente do Cockpit e não cria shell", () => {
  assert.match(ui, /function ToolCallLensMcp\(/);
  assert.match(ui, /<ToolCallLensMcp \/>/);
  assert.match(admin, /<ObservabilidadeCentralDark\s*\/>/);
  assert.match(shell, /PainelAdminCentralDark/);
  const from = ui.indexOf("function ToolCallLensMcp(");
  const to = ui.indexOf("export function ObservabilidadeCentralDark()", from);
  assert.ok(from !== -1 && to > from);
  const lens = ui.slice(from, to);
  assert.doesNotMatch(lens, /(?:execSync|spawn|child_process|writeFileSync|start_process)\s*\(/);
});

test("Tool Call Lens: fonte MCP Admin e zero credencial copiada", () => {
  assert.match(ui, /\/admin\/api\/logs\?q=mcp_tool_call&limit=100/);
  assert.match(ui, /credentials:\s*"include"/);
  assert.match(ui, /MCP_AUDIT/);
  assert.match(ui, /AUTH_REQUIRED/);
  assert.match(ui, /mcp_host_pid/);
  assert.doesNotMatch(ui, /localStorage\.setItem\(\s*["'](?:token|api.?key|authorization)/i);
});

test("Tool Call Lens: controles, estados e limites explícitos", () => {
  for (const expected of [
    "Ao vivo", "Pausar", "Rever / Atualizar", "Recolher", "Expandir",
    "PASS", "FAIL", "UNKNOWN", "Desktop Commander", "refetchInterval",
  ]) {
    assert.ok(ui.includes(expected), `Ausente: ${expected}`);
  }
  assert.match(ui, /refetchInterval: modo === "ao-vivo" \? 5000 : false/);
});

test("Observabilidade preserva rota legada e consulta logs por setor com filtro autenticado", () => {
  const mcp = read("../../modulos/mcp/src/admin.js");
  assert.match(mcp, /import \{ getHarnessWeeklySummary, queryCentralLogs \}/);
  assert.match(mcp, /if \(!isAdmin\(req\)\)/);
  assert.match(mcp, /req\.query\?\.sector != null/);
  assert.match(mcp, /centraldark\.central-logs\.sanitized\.v1/);
  assert.match(mcp, /const rota = String\(req\.query\.rota/);
  assert.match(ui, /function CentralDeLogsSetorizados\(/);
  assert.match(ui, /<CentralDeLogsSetorizados \/>/);
  assert.match(ui, /CENTRAL_LOGS_SECTOR_API_NOT_DEPLOYED/);
  assert.match(ui, /refetchInterval: aoVivo \? 15_000 : false/);
});

test("Gestão de usuários só usa Edge Admin existente e não libera RBAC futuro", () => {
  assert.match(admin, /function AdministracaoUsuariosCentralDark\(/);
  assert.match(admin, /supabase\.functions\.invoke\("admin-users"/);
  assert.match(admin, /const roleWriteReleased = false/);
  assert.match(admin, /<option value="support" disabled>/);
  assert.match(admin, /<option value="agent" disabled>/);
  assert.match(admin, /roleWriteReleased \|\| !contaSelecionavel/);
});

test("Edge Admin Casa respeita profiles.id e não apaga papel antes de atualizar", () => {
  const edge = read("../../../supabase/functions/admin-users/index.ts");
  assert.match(edge, /\.select\("id, full_name, avatar_url"\)\.in\("id", ids\)/);
  assert.match(edge, /\.eq\("id", target\)\.maybeSingle\(\)/);
  const begin = edge.indexOf('case "set_role":');
  const end = edge.indexOf('case "confirm_email":', begin);
  assert.ok(begin !== -1 && end > begin);
  const part = edge.slice(begin, end);
  assert.match(part, /multiple_roles_require_manual_reconciliation/);
  assert.match(part, /\.update\(\{ role: requested \}\)\.eq\("id", original\.id\)/);
  assert.doesNotMatch(part, /\.delete\(\)/);
});

test("Estados amarelos respeitam redução de movimento", () => {
  const state = read("../src/components/central/EstadoCentralDark.tsx");
  assert.match(state, /AUTH_REQUIRED: .*motion-safe:animate-pulse motion-reduce:animate-none/);
  assert.match(ui, /text-amber-500 motion-safe:animate-pulse motion-reduce:animate-none/);
});

