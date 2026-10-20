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
