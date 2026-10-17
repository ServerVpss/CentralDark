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


test("gaveta cataloga receitas A-Z e mostra estado do terminal sem autoexec", () => {
  const catalogo = JSON.parse(read("apps/instinto-superior/src/data/forja-gaveta.snapshot.json"));
  const infra = read("apps/instinto-superior/src/components/central/InfraestruturaSistema.tsx");
  assert.equal(catalogo.automation_owners.length, 9);
  assert.equal(new Set(catalogo.automation_owners.map(r => r.id)).size, 9);
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
  assert.doesNotMatch(obs, /POSTHOG_PERSONAL_API_KEY|TAILSCALE_API_KEY|\bfetch\s*\(/);
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


test("Gênesis aciona regressão via Admin e nunca confunde workflow com deploy", () => {
  const zone = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");
  const admin = read("apps/instinto-superior/src/lib/admin.functions.ts");
  const workflow = read(".github/workflows/test.yml");

  assert.match(zone, /id="cd-genesis-regressoes"/);
  assert.match(zone, /Rodar regressões/);
  assert.match(zone, /useServerFn\(dispararRegressaoGenesis\)/);
  assert.match(zone, /useServerFn\(consultarRegressaoGenesis\)/);
  assert.match(zone, /supabase\.auth\.getSession/);
  assert.match(zone, /SOURCE_PASS ≠ BUILD_PASS ≠ INSTALLED ≠ CONNECTED ≠ EFFECT_PROVED/);
  for (const state of ["CONSTRUIR", "INSTALAR", "CONECTAR", "PROVAR", "UNPROVEN"]) {
    assert.ok(zone.includes(state), "four-stage status: " + state);
  }
  assert.match(admin, /dispararRegressaoGenesis = createServerFn\(\{ method: "POST" \}\)/);
  assert.match(admin, /consultarRegressaoGenesis = createServerFn\(\{ method: "GET" \}\)/);
  assert.match(admin, /requireSupabaseAuth/);
  assert.match(admin, /user_roles/);
  assert.match(admin, /\.eq\("role", "admin"\)/);
  assert.match(admin, /GITHUB_TOKEN_NOT_CONFIGURED/);
  assert.match(admin, /"DISPATCH_ACCEPTED_NOT_EXECUTED"/);
  assert.match(admin, /"SAME_SHA_WORKFLOW"/);
  assert.match(admin, /install: "UNPROVEN", connect: "UNPROVEN", prove: "UNPROVEN"/);
  assert.ok(!zone.includes("execSync("));
  assert.ok(!zone.includes("spawn("));
  assert.ok(!zone.includes("localStorage.setItem('gh"));
  assert.match(workflow, /workflow_dispatch/);
  assert.match(workflow, /SOURCE_REGRESSION=PASS SAME_SHA/);
  assert.match(workflow, /RUNTIME_INSTALL_CONNECT_PROVE=NOT_COVERED_BY_THIS_JOB/);

  // Discriminant: a regressão deve falhar se alguém trocar UNKNOWN por PASS.
  const noFakePass = (source) =>
    source.includes('install: "UNPROVEN", connect: "UNPROVEN", prove: "UNPROVEN"');
  assert.equal(noFakePass(admin), true);
  assert.equal(noFakePass(admin.replace('install: "UNPROVEN", connect: "UNPROVEN"', 'install: "PASS", connect: "UNPROVEN"')), false);
});
