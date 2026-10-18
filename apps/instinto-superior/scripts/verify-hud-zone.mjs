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
  assert.doesNotMatch(zone, /\.catch\(\s*\(\)\s*=>\s*\{\s*\}\s*\)/);
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
test("centro de integridade exibe owners e estados sem falsa prova", () => {
  assert.ok(zone.includes('id="cd-integridade-estado"'));
  for (const campo of [
    "estado?.github", "estado?.mainSha", "estado?.deploy", "estado?.vpsSha",
    "estado?.apiHealth", "estado?.casaSite", "estado?.screenpipe",
    "estado?.receipts", "estado?.nextCursor", "estado?.fonte", "estado?.atualizadoEm",
  ]) {
    assert.ok(zone.includes(campo), "projeção sem fonte: " + campo);
  }
  for (const marca of [
    "Central de Integridade · Compasso Único", "!CENTRALDARK", "#ACORDAR",
    "!CALIBRAR", "#CRISTALIZAR", "LOCK_ENFORCEMENT = UNKNOWN",
    "CI_EXACT_HEAD = UNKNOWN", "não envia comandos",
    "apps/instinto-superior/src/lib/cockpit.functions.ts",
  ]) {
    assert.ok(zone.includes(marca), "rótulo/limite ausente: " + marca);
  }
  assert.ok(zone.includes("SEM READBACK NESTA CONSULTA"));
  assert.ok(zone.includes('situacao === "PASS"'));
  assert.ok(zone.includes('situacao === "FAIL" || situacao === "BLOCKED"'));
  assert.doesNotMatch(zone, /\bspawn\s*\(|\bexecSync\s*\(/);
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
  assert.match(infra, /export function GavetaForja\s*\(/);
  assert.ok(infra.includes('TabsTrigger value="gavetas"'));
  assert.ok(infra.includes("GavetaForja />"));
  assert.ok(zone.includes("<GavetaForja mainShaAtual={estado?.mainSha} />"));
  assert.ok(infra.includes("MAIN_SYNCED ≠ RUNTIME_LOADED"));
  assert.ok(infra.includes("MAIN_AVANCOU"));
  assert.ok(infra.includes("CURRENT_MAIN_SHA_UNKNOWN_NESTA_ABA"));
  assert.ok(infra.includes("SHA_MAIN_COINCIDE"));

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
  assert.equal(catalogo.automation_owners.length, 10);
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


test("Tool Call Lens cadastrado na gaveta reaproveita os owners com 4 gates", () => {
  const catalogo = JSON.parse(read("apps/instinto-superior/src/data/forja-gaveta.snapshot.json"));
  const infra = read("apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx");
  const receita = catalogo.automation_owners.find(x => x.id === "TOOL_CALL_LENS");
  assert.ok(receita, "receita TOOL_CALL_LENS nao encontrada na gaveta");
  assert.equal(receita.owner, "apps/modulos/mcp/src/audit-logger.js");
  assert.equal(receita.fases.length, 4);
  assert.deepEqual(receita.fases.map(x => x.id), ["CONSTRUIR", "INSTALAR", "CONECTAR", "PROVAR"]);
  assert.ok(receita.fases.every(x => x.owner && x.comprovar && x.estado));
  assert.ok(receita.receita.includes("forja-tool-call-lens-4-fases.ps1"));
  assert.ok(receita.recibo.includes("TOOL-CALL-LENS-DESKTOP-COMMANDER-RECEITA.md"));
  assert.ok(infra.includes('aria-label="Quatro etapas da Forja"'));
  assert.ok(infra.includes("automacaoAtual.fases.map"));
  assert.ok(infra.includes("Tool Call Lens"));
  assert.ok(infra.includes("Copiar receita · não executar"));
});

test("gaveta cataloga receitas A-Z e mostra estado do terminal sem autoexec", () => {
  const catalogo = JSON.parse(read("apps/instinto-superior/src/data/forja-gaveta.snapshot.json"));
  const infra = read("apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx");
  assert.equal(catalogo.automation_owners.length, 10);
  assert.equal(new Set(catalogo.automation_owners.map(r => r.id)).size, 10);
  assert.ok(catalogo.automation_owners.every(r => r.owner && r.receita && r.nome));
  assert.ok(infra.includes("receitasAlfabeticas"));
  assert.ok(infra.includes('localeCompare(b.nome, "pt-BR"'));
  assert.ok(infra.includes("receitasFiltradas"));
  assert.ok(infra.includes("forja-receitas-busca"));
  assert.ok(infra.includes("String(posicao).padStart(2"));
  assert.ok(infra.includes("Receitas tipadas catalogadas"));
  assert.ok(infra.includes("RDC_DESKTOP_COMMANDER"));
  assert.ok(infra.includes("INTERACTIVE_ATTACH_UNKNOWN"));
  assert.ok(infra.includes("DC_SESSION_NONE"));
  assert.ok(infra.includes("nenhuma mensagem foi despachada"));
  assert.ok(!infra.includes("execSync("));
  assert.ok(!infra.includes("child_process"));
});

test("Escola contextual herda gramática e não cria runtime de ensino", () => {
  const grammar = read("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml");
  const escola = read("docs/CONSCIENCIA/ESCOLA-HERMES-CASA.md");
  const estudo = read("apps/instinto-superior/src/components/central/EstudoPorCriterios.tsx");
  assert.match(grammar, /TEACHING_MUST_FOLLOW_CURRENT_INTENT: true/);
  assert.match(escola, /A Escola não é um segundo sistema/);
  for (const estado of ['id: "STALE"', 'id: "FAIL"', 'id: "MERGED"']) assert.ok(estudo.includes(estado));
  assert.ok(estudo.includes('id: "nao-sei"'));
  assert.ok(estudo.includes('aria-live="polite"'));
  assert.ok(estudo.includes("exemplo didático, não uma medição real"));
  assert.ok(estudo.includes("não registra respostas"));
  assert.doesNotMatch(estudo, /\blocalStorage\b|\bfetch\s*\(|\bexecSync\s*\(|\bsendText\s*\(/);
  assert.ok(cockpit.includes('<EstudoPorCriterios contexto="visao" />'));
  assert.ok(cockpit.includes('<EstudoPorCriterios contexto="forja" />'));
  assert.equal(cockpit.split('import { EstudoPorCriterios }').length - 1, 1);
});
test("OAuth Broker traduzido para humano antes do detalhe técnico, com fonte e status limitados", () => {
  const obs = read("apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx");
  const conex = read("apps/instinto-superior/src/lib/conexoes.functions.ts");
  assert.ok(obs.includes('id="oauth-broker-title"'));
  assert.ok(obs.includes("Porteiro das conexões"));
  assert.ok(obs.includes("É o porteiro da CentralDark"));
  assert.ok(obs.includes('responsabilidade="Gerenciar as autorizações'));
  const cartao = read("apps/instinto-superior/src/components/central/CartaoResponsabilidade.tsx");
  assert.ok(cartao.includes("Por baixo do capô · detalhes técnicos"));
  assert.ok(cartao.includes("Responsabilidade:"));
  assert.ok(cartao.includes("Fonte da prova:"));
  assert.ok(obs.includes('useServerFn(lerConexoesCentralDark)'));
  assert.ok(obs.includes('queryKey: ["centraldark", "contas-conexoes"]'));
  assert.ok(obs.includes("90_000"));
  assert.ok(obs.includes("O estado do catálogo não comprova"));
  assert.ok(conex.includes('requireSupabaseAuth'));
  assert.ok(conex.includes('.eq("role", "admin")'));
  assert.doesNotMatch(obs, /POSTHOG_PERSONAL_API_KEY|TAILSCALE_API_KEY/);
});
test("contrato único de cartões exige função humana, owner, responsabilidade e fonte", () => {
  const grammar = read("docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOL-GRAMATICA-DE-ENSINO.yml");
  const card = read("apps/instinto-superior/src/components/central/CartaoResponsabilidade.tsx");
  const obs = read("apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx");
  assert.ok(grammar.includes("schema: centraldark.cockpit.responsabilidade.v1"));
  for (const field of [
    "nomeHumano", "nomeTecnico", "paraQueServe", "responsabilidade",
    "ownerTecnico", "estado", "escopoEstado", "fonteDaProva",
    "consultaEm", "detalheTecnico", "limiteDaProva"
  ]) {
    assert.match(card, new RegExp("^  " + field + ":", "m"), "campo obrigatório: " + field);
    assert.ok(grammar.includes("    - " + field), "gramática: " + field);
  }
  assert.ok(card.includes('data-card-contract="centraldark.cockpit.responsabilidade.v1"'));
  assert.ok(card.indexOf("{paraQueServe}") < card.indexOf("Por baixo do capô"));
  assert.ok(card.includes("Responsabilidade:"));
  assert.ok(card.includes("Fonte da prova:"));
  assert.ok(card.includes("Limite da prova:"));
  assert.ok(obs.includes('Record<(typeof sinais)[number]["label"], Metadados>'));
  assert.ok(obs.includes("] as const;"));
  assert.ok(obs.includes("sinaisComResponsabilidade.map"));
  assert.ok(obs.includes('<CartaoResponsabilidade key={s.nomeTecnico} {...s} />'));
  assert.ok(obs.includes("STALE/UNKNOWN"));
  assert.ok(obs.includes("consultaEm: d?.atualizadoEm ?? null"));
  assert.ok(obs.includes("consultaEm={conexoes.data?.medidoEm ?? null}"));
  assert.ok(obs.includes("CATALOG_PASS") === false);
  assert.doesNotMatch(card, /fetch\s*\(|localStorage|sessionStorage|process\.env/);
});
test("catálogo único de provedores e sininho mantêm limites de prova", () => {
  const src = read("apps/modulos/mcp/src/tools/core/mcp-admin.js");
  const dist = read("apps/modulos/mcp/dist/tools/core/mcp-admin.js");
  const cockpit = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
  const admin = read("apps/instinto-superior/src/components/central/PainelAdminCentralDark.tsx");
  const bell = read("apps/instinto-superior/src/components/central/CentralNotificacoes.tsx");
  const hook = read("apps/instinto-superior/src/hooks/useNotificationsLog.ts");
  const config = JSON.parse(read("MODULES/HUB/controls/notifications-and-sensors.json"));
  for (const name of ["CentralDark", "Cloudflare", "Figma", "Gmail",
    "Google Drive", "Lovable", "Notion", "PostHog",
    "Remote Desktop Commander", "Supabase", "Writing Style"]) {
    assert.ok(src.includes('label: "' + name + '"'));
    assert.ok(dist.includes('label: "' + name + '"'));
  }
  const block = (code) => code.slice(code.indexOf("const DELEGATED_PROVIDER_CAPABILITIES"), code.indexOf("const ROUTE_LAWS"));
  assert.equal(block(src), block(dist));
  assert.ok(src.includes("providerCapabilitiesReturned"));
  assert.ok(src.includes("CATALOGUED != AUTHORIZED != EXECUTABLE != PROVED"));
  assert.ok(cockpit.includes('autenticado ? <CentralNotificacoes modo="sininho"'));
  assert.ok(admin.includes('<TabsTrigger value="notificacoes">'));
  assert.ok(admin.includes('<CentralNotificacoes modo="painel" />'));
  assert.ok(cockpit.includes('abaInicial={abaAdminInicial}'));
  assert.ok(admin.includes('defaultValue={abaInicial}'));
  assert.ok(bell.includes("useNotificationsLog(periodo)"));
  assert.ok(hook.includes('.from("notifications_log")'));
  assert.ok(hook.includes('"postgres_changes"'));
  assert.ok(hook.includes("setRealtimeStatus"));
  assert.ok(config.dispatch.delivery_modes.includes("single"));
  assert.ok(config.dispatch.delivery_modes.includes("parallel"));
  assert.equal(config.dispatch.targets.harness_specialist.status, "ADAPTER_REQUIRED");
  assert.equal(config.dispatch.notifications_are_not_execution, true);
  assert.doesNotMatch(bell, /localStorage|sessionStorage|\/notify-telegram/);
});

test("microdeploy visivel no owner existente e fail-closed sem prova de runtime", () => {
  const ui = read("apps/instinto-superior/src/components/central/SistemaCentralDark.tsx");
  const backend = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  const script = read("scripts/micro_deploy.sh");
  const contrato = read("docs/CONSCIENCIA/MICRO-DEPLOY/README.md");
  assert.ok(ui.includes("function MicroDeployReadiness("));
  assert.ok(ui.includes("<MicroDeployReadiness estado={estado} atualizando={atualizando} atualizar={atualizar} />"));
  assert.ok(ui.includes("STALE/UNKNOWN"));
  assert.ok(ui.includes("const deployAllowed = false;"));
  assert.ok(ui.includes("Worktrees e runners"));
  assert.ok(ui.includes("Rollback pronto"));
  assert.ok(ui.includes("Remedir sinais"));
  assert.ok(backend.includes('const deploy: Estado = "UNKNOWN";'));
  assert.ok(backend.includes('medirApi("/api/microdeploy/receipts/index.json")'));
  assert.ok(script.includes('blocked "REAL_MODE_REQUIRES_COMPONENT_ADAPTER"'));
  assert.ok(contrato.includes("Micro-deploy é por escopo afetado"));
  assert.doesNotMatch(ui, /\bexecSync\b|\bspawn\s*\(|\blocalStorage\b|\bfetch\s*\(/);
});

test("ciclo antirregressao ZENDRIVE / Marketplace preserva owner, acesso e provas", () => {
  const design = read("apps/instinto-superior/src/components/central/DesignCenter.tsx");
  const cockpit = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
  const manifest = JSON.parse(read("skills/vs-code-restore/package.json"));
  const extension = read("skills/vs-code-restore/src/extension.ts");

  // CONSTRUIR: o cockpit e a extensao sao os owners existentes.
  assert.equal((design.match(/id="galeria-extensoes"/g) || []).length, 1);
  assert.ok(design.includes('id="galeria-extensoes"'));
  assert.ok(design.includes("Marketplace de capacidades"));
  assert.ok(design.includes('data-cd-flow="instinto.DesignCenter.extensao-zendrive-cli"'));
  assert.ok(design.includes("fonte " + manifest.version));
  assert.ok(manifest.contributes.commands.some(c => c.command === "centraldark.zendriveCli"));
  assert.ok(extension.includes("registerCommand('centraldark.zendriveCli'"));

  // CONECTAR: acesso autenticado e mesmo terminal / funil, sem outro executor.
  assert.ok(design.includes('{autenticado ? <TabsTrigger value="extensoes">'));
  assert.ok(design.includes('autenticado ? (\n          <TabsContent value="extensoes"'));
  assert.ok(cockpit.includes('autenticado={autenticado}'));
  assert.ok(extension.includes("terminal.show(false)"));
  const focus = extension.slice(extension.indexOf("function focusExistingCliTerminal"),
    extension.indexOf("function loadMap"));
  assert.ok(!focus.includes("createTerminal("));
  for (const name of ["onDidStartTerminalShellExecution", "onDidEndTerminalShellExecution",
    "LOGS-VS-CODE.log"]) assert.ok(extension.includes(name), "evento/funil: " + name);
  assert.ok(!focus.includes("process.env.OPENAI_API_KEY"));

  // PROVAR: recibos reais sao escopados; UI nunca pode declarar provider live.
  assert.ok(design.includes("/tree/main/skills/vs-code-restore"));
  assert.ok(design.includes("/pull/1820"));
  assert.ok(design.includes("não provado ao vivo"));
  assert.ok(design.includes("Build e deploy do cockpit são provas separadas"));
  assert.ok(!design.includes("ChatGPT API conectada e autenticada"));
});


// Anti-regressão do Marketplace dentro da esteira existente (npm prebuild/prebuild:vps).
// Isto prova contratos SOURCE, não instalação remota nem resposta HTTP do cockpit.
test("regressao do Marketplace ZENDRIVE — construir, instalar, conectar e provar sem falso verde", () => {
  const design = read("apps/instinto-superior/src/components/central/DesignCenter.tsx");
  const shell = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
  const admin = read("apps/instinto-superior/src/routes/_authenticated/sala-controle.tsx");
  const extManifest = JSON.parse(read("skills/vs-code-restore/package.json"));
  const extension = read("skills/vs-code-restore/src/extension.ts");
  const bridge = read("scripts/casa/vscode-log-bridge.ps1");
  const ingest = read("scripts/vps/ingest-vscode-log.mjs");
  const funnel = read("apps/modulos/mcp/src/log-funnel.js");
  const pkg = JSON.parse(read("apps/instinto-superior/package.json"));

  // 1. CONSTRUIR: mesma árvore visual, entrada privada e único registro.
  assert.match(design, /\{autenticado\s*\?\s*<TabsTrigger value="extensoes">/);
  assert.match(design, /\{autenticado\s*\?\s*\(\s*<TabsContent value="extensoes"/);
  assert.equal(design.split('data-cd-flow="instinto.DesignCenter.extensao-zendrive-cli"').length - 1, 1);
  assert.match(shell, /<DesignCenter[^>]*autenticado=\{autenticado\}/);
  assert.match(admin, /verificarAdmin/);
  assert.match(admin, /if \(!q\.data\?\.admin\)/);
  assert.match(admin, /return <CockpitShell autenticado \/>/);

  // 2. INSTALAR: contrato do pacote existente, não confundir manifesto com instalação.
  assert.equal(extManifest.name, "centraldark-vscode-restore");
  assert.ok(extManifest.contributes.commands.some(c => c.command === "centraldark.zendriveCli"));
  assert.match(extension, /registerCommand\('centraldark\.zendriveCli', focusExistingCliTerminal\)/);
  assert.match(extension, /terminal\.show\(false\)/);
  const focusSource = extension.split("function focusExistingCliTerminal(): void {")[1]
    ?.split("\nfunction ")[0] ?? "";
  assert.ok(focusSource.length > 0);
  assert.doesNotMatch(focusSource, /createTerminal\(|sendText\(|spawn\(|execSync\(/);
  assert.ok(design.includes("fonte " + extManifest.version), "ficha usa versão incompatível com manifesto da main");

  // 3. CONECTAR: canal único e metadados; nenhuma sessão/cookie/chat ao funil.
  assert.match(extension, /onDidStartTerminalShellExecution/);
  assert.match(extension, /onDidEndTerminalShellExecution/);
  assert.match(extension, /terminalLogPath/);
  assert.match(extension, /LOGS-VS-CODE\.log/);
  assert.match(bridge, /ingest-vscode-log\.mjs/);
  assert.match(bridge, /StrictHostKeyChecking=yes/);
  assert.match(ingest, /log-funnel/);
  assert.match(funnel, /event|log/i);
  const telemetry = extension.split("function emitTerminalMetadata(")[1]
    ?.split("\nfunction ")[0] ?? "";
  assert.ok(telemetry.length > 0);
  assert.doesNotMatch(telemetry, /commandLine|readFileSync|readText|cookie|session\.access_token/);

  // 4. PROVAR: a interface não pode promover source para runtime/deploy.
  assert.match(design, /<SeloEstado estado="UNKNOWN" \/>/);
  assert.match(design, /não provado ao vivo/);
  assert.match(design, /Build e deploy do cockpit são provas separadas/);
  assert.ok(design.includes("/pull/1820"));
  assert.ok(!design.includes("Instalar em todos os computadores"));
  assert.equal(pkg.scripts.prebuild, "npm run verify:hud");
  assert.equal(pkg.scripts["prebuild:vps"], "npm run verify:hud");

  // Contraprova: se a aba deixar de ser privada, o teste discriminante reprova.
  const privateTab = /\{autenticado\s*\?\s*<TabsTrigger value="extensoes">/;
  assert.equal(privateTab.test(design), true);
  assert.equal(privateTab.test(design.replace('{autenticado ? <TabsTrigger value="extensoes">', '<TabsTrigger value="extensoes">')), false);
});


/**
 * 🧬 Michelin (metáfora de qualidade, sem afiliação com o guia):
 * 1 estrela = fonte/build íntegros; 2 = CI + integração no MESMO SHA;
 * 3 = runtime autenticado, Casa↔VPS e contraprova VISUAL no mesmo SHA.
 * Evidência não recebida NÃO é sucesso. O teste local só valida o contrato.
 */
function avaliarTresEstrelasMichelin(prova, head, agora) {
  const shaValido = s => typeof s === "string" && /^[a-f0-9]{40}$/.test(s);
  if (!shaValido(head)) return { estrelas: 0, pendencias: ["MAIN_SHA_NAO_MEDIDO"] };
  const mesmaVersao = item => item?.head_sha === head;
  const passou = item => mesmaVersao(item) && item?.state === "PASS";
  const recente = item => {
    const ts = Date.parse(item?.measured_at ?? "");
    return Number.isFinite(ts) && ts <= agora && agora - ts <= 3_600_000;
  };
  const pendencias = [];
  let estrelas = 0;

  if (!(passou(prova?.source) &&
    prova.source?.unit_tests === "PASS" &&
    prova.source?.lint === "PASS" &&
    prova.source?.build === "PASS" &&
    prova.source?.authenticated_boundary === "PASS")) {
    pendencias.push("ESTRELA_1_SOURCE_BUILD_AUTH");
    return { estrelas, pendencias };
  }
  estrelas = 1;

  if (!(mesmaVersao(prova?.ci) &&
    prova.ci?.status === "completed" &&
    prova.ci?.conclusion === "success" &&
    passou(prova?.integration) &&
    prova.integration?.idempotency === "PASS" &&
    prova.integration?.no_duplicate_owner === true)) {
    pendencias.push("ESTRELA_2_CI_INTEGRATION_SAME_SHA");
    return { estrelas, pendencias };
  }
  estrelas = 2;

  if (!(passou(prova?.deploy) && recente(prova.deploy) &&
    passou(prova?.visual) && recente(prova.visual) &&
    prova.visual?.authenticated === true &&
    passou(prova?.casa_vps) && recente(prova.casa_vps) &&
    passou(prova?.vscode_logs) && recente(prova.vscode_logs) &&
    typeof prova?.visual?.receipt_id === "string" && !!prova.visual.receipt_id &&
    typeof prova?.casa_vps?.receipt_id === "string" && !!prova.casa_vps.receipt_id &&
    typeof prova?.vscode_logs?.receipt_id === "string" && !!prova.vscode_logs.receipt_id)) {
    pendencias.push("ESTRELA_3_DEPLOY_VISUAL_CASA_VPS_RECEIPTS");
    return { estrelas, pendencias };
  }
  return { estrelas: 3, pendencias };
}

test("🧬 padrão Michelin 3 estrelas: mesmo SHA, regressão e runtime sem falso PASS", () => {
  const head = "a".repeat(40);
  const agora = Date.parse("2026-10-17T05:00:00Z");
  const medir = p => avaliarTresEstrelasMichelin(p, head, agora);
  const fonte = { head_sha: head, state: "PASS", unit_tests: "PASS",
    lint: "PASS", build: "PASS", authenticated_boundary: "PASS" };
  const ci = { head_sha: head, status: "completed", conclusion: "success" };
  const integration = { head_sha: head, state: "PASS",
    idempotency: "PASS", no_duplicate_owner: true };
  const evento = { head_sha: head, state: "PASS",
    measured_at: "2026-10-17T04:45:00Z", receipt_id: "receipt-test" };
  const completa = { source: fonte, ci, integration,
    deploy: evento, casa_vps: evento, vscode_logs: evento,
    visual: { ...evento, authenticated: true } };
  assert.equal(medir({}).estrelas, 0);
  assert.equal(avaliarTresEstrelasMichelin(completa, null, agora).estrelas, 0);
  assert.equal(medir({ source: fonte }).estrelas, 1);
  assert.equal(medir({ source: fonte, ci: { ...ci, conclusion: "cancelled" }, integration }).estrelas, 1);
  assert.equal(medir({ source: fonte, ci: { ...ci, head_sha: "b".repeat(40) }, integration }).estrelas, 1);
  assert.equal(medir({ source: fonte, ci, integration }).estrelas, 2);
  assert.equal(medir(completa).estrelas, 3);
  assert.equal(medir({ ...completa, deploy: { ...evento, measured_at: "2026-10-15T04:00:00Z" } }).estrelas, 2);
  assert.equal(medir({ ...completa, visual: { ...evento, authenticated: false } }).estrelas, 2);
  assert.equal(medir({ ...completa, vscode_logs: { ...evento, state: "UNKNOWN" } }).estrelas, 2);
  assert.equal(medir({ ...completa, casa_vps: { ...evento, head_sha: "b".repeat(40) } }).estrelas, 2);
  assert.equal(medir({ ...completa, visual: { ...evento, authenticated: true, receipt_id: "" } }).estrelas, 2);
  assert.equal(medir({ ...completa, source: { ...fonte, build: "UNKNOWN" } }).estrelas, 0);
  assert.equal(medir({ ...completa, ci: { ...ci, status: "queued" } }).estrelas, 1);
  // Sem recibos operacionais no CI: nunca anunciar três estrelas por este teste isolado.
  console.log("MICHELIN_3_ESTRELAS=CRITERIOS_TESTADOS; CERTIFICACAO_RUNTIME=NAO_EMITIDA");
});


test("🧬 Michelin aparece no HUD único sem autocertificação ou workflow paralelo", () => {
  const hud = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");
  const workflow = read(".github/workflows/test.yml");
  const agents = read("AGENTS.md");
  assert.equal(hud.split('id="cd-michelin-3-estrelas"').length - 1, 1);
  for (const label of ["☆ 1 · Construir", "☆☆ 2 · Integrar", "☆☆☆ 3 · Provar",
    "ESTRELA NÃO ATESTADA", "SEM CERTIFICAÇÃO RUNTIME NESTA CONSULTA",
    "NEXT_CURSOR", "mesmo SHA"]) {
    assert.ok(hud.includes(label), "HUD Michelin sem critério: " + label);
  }
  assert.ok(hud.includes("estado?.build"));
  assert.ok(hud.includes("estado?.actions"));
  assert.ok(hud.includes("estado?.deploy"));
  assert.ok(workflow.includes('MICHELIN_STAR_1=SOURCE_BUILD_PASS SAME_SHA=$GITHUB_SHA'));
  assert.ok(workflow.includes("MICHELIN_STAR_2=CI_CONCLUSION_AND_INTEGRATION_RECEIPTS_REQUIRED"));
  assert.ok(workflow.includes("MICHELIN_STAR_3=DEPLOY_VISUAL_CASA_VPS_RECEIPTS_REQUIRED"));
  assert.ok(workflow.indexOf("npm run build:vps") < workflow.indexOf("MICHELIN_STAR_1="));
  assert.ok(agents.includes("Michelin — três estrelas de qualidade comprovada"));
  assert.ok(agents.includes("MERGED != DEPLOYED"));
  assert.ok(!hud.includes("MICHELIN_AUTO_3_STARS=PASS"));
});


test("🪬 Puppeteer Michelin: Chromium real é smoke, nunca três estrelas", async () => {
  const { classifyVisualEvidence, validateVisualTarget, MICHELIN_SCOPE } =
    await import("./puppeteer-michelin-smoke.mjs");
  const sha = "a".repeat(40);
  const viewport = { httpStatus: 200, ready: true, hasContent: true,
    horizontalOverflow: false, originMatched: true, pageErrors: 0 };
  const normal = { sourceSha: sha, executableFound: true, libraryLoaded: true,
    viewports: [{ ...viewport, name: "desktop" }, { ...viewport, name: "mobile" }] };
  const ok = classifyVisualEvidence(normal);
  assert.equal(ok.state, "PASS");
  assert.equal(ok.scope, MICHELIN_SCOPE);
  assert.equal(ok.certifiesStars, 0);
  const cases = [
    [{ ...normal, sourceSha: null }, "BLOCKED"],
    [{ ...normal, executableFound: false }, "BLOCKED"],
    [{ ...normal, libraryLoaded: false }, "BLOCKED"],
    [{ ...normal, runtimeError: "SCREENSHOT_FAILED" }, "BLOCKED"],
    [{ ...normal, viewports: [viewport] }, "BLOCKED"],
    [{ ...normal, viewports: [{ ...viewport, httpStatus: null }, viewport] }, "BLOCKED"],
    [{ ...normal, viewports: [{ ...viewport, httpStatus: 502 }, viewport] }, "FAIL"],
    [{ ...normal, viewports: [{ ...viewport, originMatched: false }, viewport] }, "FAIL"],
    [{ ...normal, viewports: [{ ...viewport, ready: false }, viewport] }, "FAIL"],
    [{ ...normal, viewports: [{ ...viewport, hasContent: false }, viewport] }, "FAIL"],
    [{ ...normal, viewports: [{ ...viewport, horizontalOverflow: true }, viewport] }, "FAIL"],
    [{ ...normal, viewports: [{ ...viewport, pageErrors: 1 }, viewport] }, "FAIL"],
  ];
  for (const [probe, expected] of cases) {
    const verdict = classifyVisualEvidence(probe);
    assert.equal(verdict.state, expected);
    assert.equal(verdict.certifiesStars, 0);
  }
  assert.ok(validateVisualTarget("http://127.0.0.1:4179/"));
  assert.ok(validateVisualTarget("https://admin.centralldark.com/"));
  for (const unsafe of ["https://evil.example/", "http://admin.centralldark.com/",
    "https://admin.centralldark.com.evil.example/", "file:///etc/passwd",
    "http://127.0.0.1.evil.example/", "http://localhost:4179/?token=example"]) {
    assert.equal(validateVisualTarget(unsafe), null);
  }
  const source = read("apps/instinto-superior/scripts/puppeteer-michelin-smoke.mjs");
  const workflow = read(".github/workflows/test.yml");
  assert.match(source, /puppeteer-core/);
  assert.match(source, /puppeteer-public-/);
  assert.match(source, /certifiesStars: 0/);
  assert.doesNotMatch(source, /--no-sandbox|userDataDir:|page\.setCookie/);
  assert.match(workflow, /puppeteer-michelin-smoke\.mjs/);
  assert.match(workflow, /MICHELIN_PUPPETEER_VISUAL=PASS/);
  assert.match(workflow, /RUNTIME_INSTALL_CONNECT_PROVE=NOT_COVERED_BY_THIS_JOB/);
  assert.doesNotMatch(workflow, /MICHELIN_STAR_3=PASS/);
});
test("host health não transfere estado de Screenpipe entre Casa e VPS", () => {
  const collector = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  const obs = read("apps/instinto-superior/src/components/central/ObservabilidadeCentralDark.tsx");
  const hud = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");
  for (const contract of [
    "origemLocalScreenpipe()", 'hostScreenpipe === "CASA"',
    'hostScreenpipe === "VPS"', "SONDA_NAO_EXECUTADA",
    'screenpipe: screenpipeCasa.estado', 'screenpipeVps: screenpipeVps.estado',
    'screenpipeCasaMedidoEm:', 'screenpipeVpsMedidoEm:',
    'screenpipeFonte: screenpipeCasaFonte', 'screenpipeVpsFonte,',
    'screenpipeIdentificado(screenpipe)', 'dependencias["ffmpeg"]',
    'apiHealthFonte:', 'apiHealthServico:', 'apiHealthMedidoEm:',
    'desktopVps: "UNKNOWN"',
  ]) {
    assert.ok(collector.includes(contract), "ausente em cockpit.functions: " + contract);
  }
  assert.ok(!collector.includes("screenpipe: screenpipeMedido.estado"),
    "VPS loopback nunca pode aparecer como Screenpipe Casa");
  for (const label of [
    'label: "Screenpipe Casa"', 'label: "Screenpipe VPS"',
    'label: "Desktop Commander Casa"', 'label: "Desktop Commander VPS"',
    'd?.apiHealthFonte', 'd?.apiHealthServico', 'd?.apiHealthMedidoEm',
    'd?.screenpipeFonte', 'd?.screenpipeVpsFonte',
  ]) {
    assert.ok(obs.includes(label), "falta no painel: " + label);
  }
  assert.ok(hud.includes('["Screenpipe VPS", estado?.screenpipeVps'));
  assert.ok(hud.includes('["Desktop Commander VPS", estado?.desktopVps'));
  assert.ok(hud.includes('["👁️ Screenpipe VPS", estado?.screenpipeVps'));
});

test("microdeploy do Cockpit nunca vende sync Git como deploy comprovado", () => {
  const fonte = read("apps/instinto-superior/src/components/central/AutoSyncButton.tsx");
  assert.ok(fonte.includes("MICRODEPLOY_GUARD_20261018"));
  assert.ok(fonte.includes("Sync Git não prova deploy"));
  assert.ok(fonte.includes("Micro-Deploy ${microDeployMode} BLOQUEADO"));
  assert.doesNotMatch(fonte, /Micro-Deploy \$\{microDeployMode\} ok/);
  const handler = fonte.match(/const handleMicroDeploy = \(\) => \{[\s\S]*?\n  \}/);
  assert.ok(handler, "handler do botão não identificado");
  assert.doesNotMatch(handler[0], /(?:await\s+)?(?:handleSync|runSync|execSync|fetch)\s*\(/);
  assert.ok(fonte.includes("const handleSync = async"), "não apagar sync existente");
});


test("TelePainel permanece produto próprio; matriz Admin ocupa o mesmo HUD sem publicar casca Cliente", () => {
  assert.ok(zone.includes('id="cd-admin-capabilities"'));
  assert.ok(zone.includes('id="cd-hud-legacy-owner-inventory"'));
  assert.ok(zone.includes("O TelePainel continua sendo um produto próprio"));
  assert.ok(zone.includes("Versão estável · NÃO LIBERADA"));
  assert.ok(zone.includes("RUNTIME UNKNOWN"));
  assert.ok(zone.includes("SOURCE_IN_CODE != WIRED != TESTED != DEPLOYED"));
  const rows = zone.match(/\{ origem: "[^"]+", destino: "[^"]+", owner: "[^"]+", status: "(?:PARCIAL|NAO_INTEGRADO)" \}/g) ?? [];
  assert.equal(rows.length, 15, "15 entradas preservadas da Sidebar TelePainel");
  assert.equal(new Set(rows).size, 15);
  assert.ok(zone.includes("telepainelAdminCapabilities.map"));
  assert.ok(!zone.includes("git reset --hard"));
});


test("Casa canonical K and four-stage collector receipt", () => {
  const launcher = read("apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat");
  const bridge = read("scripts/casa/vscode-log-bridge.ps1");
  const ingest = read("scripts/vps/ingest-vscode-log.mjs");
  for (const field of ["EXPECTED_ROOT=K:", "BLOCKED_LEGACY_OR_NONCANONICAL_PATH",
    "BLOCKED_NOT_GIT_CHECKOUT", "npm ci", "--port 3000 --strictPort"]) {
    assert.ok(launcher.includes(field), field);
  }
  assert.ok(!launcher.includes('cd /d "E:'));
  for (const stage of ["[switch]$Bootstrap", "BUILD=PASS_SOURCE_PARSE_AND_GIT_ROOT_K",
    "INSTALL=PASS_EXISTING_SCHEDULED_TASK", "CONNECT=PASS_",
    "PROVE=PASS_COLLECTOR_METADATA_", "BROWSER_AUTOMATION_E2E=UNPROVEN",
    "FIXED_POINT=COLLECTOR_ONLY"]) assert.ok(bridge.includes(stage), stage);
  assert.ok(bridge.includes("chromium(_headless_shell)?-"));
  assert.ok(bridge.includes("$parsed.playwright.revision -eq"));
  assert.ok(ingest.includes("const playwrightReceipt = playwrightProbe == null"));
  assert.ok(ingest.includes("playwright: playwrightReceipt"));
  assert.ok(!ingest.includes("playwright: playwrightProbe,"));
});
