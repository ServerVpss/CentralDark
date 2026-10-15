import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = new URL("../../../", import.meta.url);
const read = p => readFileSync(new URL(p, root), "utf8");
const lineage = JSON.parse(read("docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json"));
const oldHud = read("docs/HUD/HUD.html");
const cockpit = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
const zone = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");

test("Genese usa a mesma fonte canonica sem renumerar UID", () => {
  const n = [lineage.genesis, ...lineage.nodes];
  assert.equal(n[0].uid, "L000");
  assert.equal(n.length, lineage.audit.learning_sections + 1);
  assert.equal(n.at(-1).next_uid, "PENDING_NEXT_CURSOR");
  for (let i = 1; i < n.length; i++) {
    assert.equal(n[i].prev_uid, n[i - 1].uid);
    assert.equal(n[i - 1].next_uid, n[i].uid);
  }
  assert.match(zone, /APRENDIZADOS-NEUROLINK-LINEAGE\.json/);
  assert.match(zone, /BLOCKED_UID_INTEGRITY/);
});

test("zone existente reutilizado com autenticacao", () => {
  assert.match(cockpit, /import \{ HudDeterministico \}/);
  assert.match(cockpit, /TabsTrigger value="hud-legado"/);
  assert.match(cockpit, /autenticado \? \(/);
  assert.ok(cockpit.includes('HudDeterministico estado={dado} atualizar={() => void estado.refetch()} />'));
  assert.equal(cockpit.split('HudDeterministico estado={dado} atualizar={() => void estado.refetch()} />').length - 1, 1);
});

test("replay documental nao inventa execucao nem novos selos", () => {
  assert.match(oldHud, /ENTROU_TEM_QUE_SELAR/);
  assert.match(oldHud, /id="cd-genesis-replay"/);
  assert.match(zone, /Nenhuma tarefa foi enviada/);
  assert.match(zone, /Somente prévia determinística/);
  assert.match(zone, /readback/);
  assert.match(zone, /HISTÓRICO · CURRENT exige readback/);
  assert.doesNotMatch(zone, /fetch\(/);
  assert.doesNotMatch(zone, /sendText\(/);
});


test("Forja Viva mapeia emojis para receitas existentes sem execucao automatica", () => {
  const symbols = ["🔧", "🛠️", "👨🏻‍🔧", "👀", "👁️", "🪡", "🎄",
    "🌞", "🌟", "✨", "☄️", "🔥", "🪛", "⚒️", "🧹"];
  for (const symbol of symbols) {
    assert.ok(zone.includes(symbol), "simbolo ausente: " + symbol);
  }
  for (const capability of ["DIAGNOSTICAR", "MANUTENCAO", "OLHO",
    "LINHAGEM", "ANTECIPACAO", "FORJA_PACOTE", "WORKTREE_CLEANUP"]) {
    assert.ok(zone.includes('id: "' + capability + '"'));
  }
  assert.ok(zone.includes("Copiar receita · não executar"));
  assert.ok(zone.includes('selectedForge') || zone.includes('forgeSelected'));
  assert.ok(zone.includes("SOURCE_DEFINED · RUNTIME_NOT_PROVEN"));
  assert.ok(!zone.includes("execSync("));
  assert.ok(!zone.includes("spawn("));
  assert.ok(!zone.includes("shell.openExternal("));
  assert.ok(!zone.includes(".catch(() => {})"));
  assert.ok(zone.includes('setGenesisCopy("FAILED")'));
  assert.ok(zone.includes("Falha ao copiar; receita continua visível"));
});
test("plug-play valida antes de compilar e exige artefato com integridade", () => {
  const pkg = JSON.parse(read("apps/instinto-superior/package.json"));
  const packager = read("apps/instinto-superior/scripts/build-plugplay.mjs");
  assert.ok(pkg.scripts["verify:hud"].includes("verify-hud-zone.mjs"));
  assert.equal(pkg.scripts["build:plugplay"],
    "npm run verify:hud && npm run build && node scripts/build-plugplay.mjs");
  for (const field of ["SOURCE_FILES_DIRTY_STOP_AND_RECONCILE", "SYMLINK_REJECTED",
    "POMBO-CENTRALDARK", "SHA256SUMS.txt", "REQUIRES_AUTHORIZED_INSTALL_AND_RUNTIME_READBACK"]) {
    assert.ok(packager.includes(field), "packager missing " + field);
  }
  assert.ok(packager.includes("CENTRALDARK_FORGE_ARTIFACTS"));
  assert.ok(!packager.includes("rmSync("));
});
test("o checklist usa a mesma consulta do pai e não vira novo coletor", () => {
  assert.ok(zone.includes("estado?: EstadoCentralDark"));
  assert.ok(zone.includes("estado?.apiHealth"));
  assert.ok(zone.includes("estado?.screenpipe"));
  assert.ok(zone.includes("CHECK-LIST-DIARIO.md"));
  assert.ok(!zone.includes("new WebSocket("));
});


test("🧹 faxina contextual do mesmo HUD nunca elimina trabalho sem receipt", () => {
  const standard = read("docs/CONSCIENCIA/PADRAO-EMOJIS.md");
  const registry = read("docs/ARQUITETURA/CENTRALDARK-FORJA-VIVA/VISUAL-NAMING-REGISTRY.yml");
  const existingSkill = read(".agents/skills/main-pinned-runtime-fast-path/SKILL.md");
  assert.ok(zone.includes('id: "WORKTREE_CLEANUP"'));
  assert.ok(zone.includes('chosenForge?.id === "WORKTREE_CLEANUP"'));
  assert.ok(zone.includes('Estado de limpeza desta interface: UNKNOWN'));
  assert.ok(zone.includes("KEEP_ACTIVE"));
  assert.ok(zone.includes("Quando o CHEFE quiser ver: build e prova visual na Casa existente."));
  assert.ok(zone.includes("Confirmar publicação na main"));
  assert.ok(standard.includes("Lei da vassoura 🧹"));
  assert.ok(registry.includes('faxina_segura: ["🧹"]'));
  assert.ok(existingSkill.includes("RECEIPT_BEFORE_CLEANUP"));
  assert.ok(existingSkill.includes("SCRATCH_SAFE"));
  assert.ok(!zone.includes("git clean -fdx"));
  assert.ok(!zone.includes("rmSync("));
});


test("gaveta canonica cataloga 999 skills e plugins sem fingir execucao", () => {
  const vault = JSON.parse(read("apps/instinto-superior/src/data/forja-gaveta.snapshot.json"));
  const infra = read("apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx");
  const sourceSha = vault.source.sha;
  assert.match(sourceSha, /^[a-f0-9]{40}$/);
  assert.equal(vault.skills.length, vault.counts.total_skills);
  assert.equal(vault.counts.skill_md_agents, 996);
  assert.equal(vault.counts.skill_md_agents_active, 992);
  assert.equal(vault.counts.skill_md_agents_archive, 4);
  assert.equal(vault.counts.skill_md_root, 3);
  assert.equal(vault.counts.total_skills, 999);
  assert.equal(vault.plugins.length, 3);
  assert.equal(vault.gavetas.length, 6);
  assert.equal(vault.legacy.names.length, 10);
  assert.equal(new Set(vault.skills.map(s => s.id)).size, 999);
  assert.ok(vault.skills.every(s => s.estado === "SOURCE_ONLY"));
  assert.ok(infra.includes("export function GavetaForja()"));
  assert.ok(infra.includes('TabsTrigger value="gavetas"'));
  assert.ok(infra.includes("GavetaForja />"));
  assert.ok(zone.includes("<GavetaForja />"));
  assert.ok(infra.includes("MAIN_SYNCED ≠ RUNTIME_LOADED"));
});

test("inventario do HUD cobre quatro abas e preserva fonte legada integral", () => {
  const inventario = JSON.parse(read("apps/instinto-superior/src/data/hud-migration.snapshot.json"));
  assert.equal(inventario.counts.sections, inventario.sections.length);
  assert.equal(inventario.counts.controls, inventario.controls.length);
  assert.equal(inventario.counts.sections, 189);
  assert.equal(inventario.counts.controls, 33);
  assert.equal(inventario.counts.tabs, 4);
  assert.equal(inventario.source.path, "docs/HUD/HUD.html");
  assert.equal(inventario.source.full_migration_proven, false);
  assert.ok(inventario.sections.some(s => s.titulo.includes("Afterburner")));
  assert.ok(inventario.sections.some(s => s.titulo.includes("Skill Auto-Sync")));
  assert.ok(inventario.controls.some(s => s.id === "cd-intent-refresh"));
  assert.ok(inventario.controls.some(s => s.id === "cdr-operator-send"));
  assert.ok(zone.includes('hudMigrationSnapshot.counts.sections'));
  assert.ok(zone.includes("Atualizar estado do cockpit"));
  assert.ok(cockpit.includes("atualizar={() => void estado.refetch()}"));
  assert.ok(!zone.includes("sendText("));
});


test("inventario fisico e ponte de automacoes ficam no harness sem duplicar executor", () => {
  const catalogo = JSON.parse(read("apps/instinto-superior/src/data/forja-gaveta.snapshot.json"));
  const infra = read("apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx");
  assert.equal(catalogo.runtime_snapshots.casa.vscode_extension_folders, 26);
  assert.equal(catalogo.runtime_snapshots.casa.obsidian_k_docs_plugin_folders, 5);
  assert.equal(catalogo.runtime_snapshots.vps.hermes_skill_files, 95);
  assert.equal(catalogo.runtime_snapshots.vps.hermes_plugin_directories, 3);
  assert.equal(catalogo.runtime_snapshots.mcp.catalog_tools, 141);
  assert.equal(catalogo.runtime_snapshots.mcp.catalog_routes, 13);
  assert.equal(catalogo.runtime_snapshots.mcp.skill_listar_entries, 3);
  assert.equal(catalogo.automation_owners.length, 9);
  assert.ok(catalogo.automation_owners.some(x => x.id === "CLAUDE_CODE" &&
    x.estado === "CLAUDE_RUNNING_TERMINAL_UNBOUND" && x.modo === "COPY_ONLY"));
  assert.ok(catalogo.automation_owners.some(x => x.id === "HERMES" &&
    x.estado === "SESSAO_NAO_VINCULADA"));
  assert.ok(infra.includes("automacaoAtual.receita"));
  assert.ok(infra.includes("Copiar receita · não executar"));
  assert.ok(infra.includes("terminal não recebeu a mensagem"));
  assert.ok(!infra.includes("execSync("));
  assert.ok(!infra.includes("fetch("));
});
