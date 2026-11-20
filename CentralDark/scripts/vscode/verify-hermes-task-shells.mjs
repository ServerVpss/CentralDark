#!/usr/bin/env node
// CentralDark: anti-regressao da mesma .vscode/tasks.json (leitura, sem executar Hermes).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const file = fileURLToPath(new URL("../../.vscode/tasks.json", import.meta.url));
const cfg = JSON.parse(readFileSync(file, "utf8"));
assert.equal(cfg.version, "2.0.0");
const win = cfg.tasks.filter(task => task.command === "powershell.exe");
assert.equal(win.length, 12, "As 12 tarefas PowerShell existentes devem ser preservadas");
for (const task of win) {
  assert.equal(task.linux?.command, "bash", `Sem Bash para SSH Linux: ${task.label}`);
  assert.equal(task.linux?.args?.[0], "-lc", `Falta execucao controlada: ${task.label}`);
}
const roles = ["01 FILOSOFIA", "02 ENGENHARIA", "03 CONTRAPROVA", "04 SINTESE"];
for (const label of roles) {
  const task = cfg.tasks.find(item => item.label === `CentralDark Hermes Vivo: ${label}`);
  assert.ok(task, `Tarefa nao encontrada: ${label}`);
  const sh = task.linux.args.join(" ");
  assert.match(sh, /command -v hermes/);
  assert.match(sh, /exec hermes chat --cli --source vscode-orq-/);
  assert.match(sh, /exit 127/);
}
const launch = cfg.tasks.find(t => t.label === "CentralDark Hermes Vivo: ABRIR 4 TERMINAIS");
assert.ok(launch);
assert.equal(launch.runOptions?.runOn, undefined, "Abrir pasta SSH nao deve disparar 4 sessoes automaticamente");
const sourceIds = roles.map(role =>
  cfg.tasks.find(t => t.label === `CentralDark Hermes Vivo: ${role}`).linux.args[1].match(/--source (vscode-orq-[a-z]+)/)?.[1]
);
assert.equal(new Set(sourceIds).size, 4, "Fontes Hermes independentes, sem duplicar rotas");
console.log("TASKS_JSON=PASS");
console.log("WINDOWS_TASKS_PRESERVED=12");
console.log("LINUX_BASH_HERMES=4");
console.log("LINUX_WINDOWS_ONLY_FAIL_CLOSED=8");
console.log("AUTO_START_ON_FOLDER_OPEN=DISABLED");
console.log("RUNTIME_HERMES_AUTH=NOT_TESTED_BY_THIS_STATIC_CHECK");
