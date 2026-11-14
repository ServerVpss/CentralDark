import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import assert from "node:assert/strict";

const root = new URL("../../../", import.meta.url);
const read = p => readFileSync(new URL(p, root), "utf8");
const lineage = JSON.parse(read("docs/CONSCIENCIA/APRENDIZADOS-NEUROLINK-LINEAGE.json"));
const hudInventory = JSON.parse(read("apps/instinto-superior/src/data/hud-migration.snapshot.json"));
const sourceBlob = spawnSync("git", ["show", `${hudInventory.source.main_sha}:${hudInventory.source.path}`], {
  cwd: new URL("../../../", import.meta.url), encoding: "utf8",
});
const cockpit = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
const zone = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");
const syncFunctions = read("apps/instinto-superior/src/lib/sync.functions.ts");


test("HUD vigente vem da main por marcador sem PR fixo nem segredo no browser", () => {
  assert.ok(syncFunctions.includes('const HUD_FUNNEL_MARKER = "CENTRALDARK_HUD_FUNNEL_CONTINUITY"'));
  assert.ok(syncFunctions.includes('process.env["GITHUB_TOKEN"] || process.env["GH_TOKEN"]'));
  assert.ok(syncFunctions.includes('pulls?state=open&per_page=100&page='));
  assert.ok(syncFunctions.includes('execFileSync("gh", ["auth", "status"]'));
  assert.ok(syncFunctions.includes('"GH_CLI"'));
  assert.ok(syncFunctions.includes('"GITHUB_API"'));
  assert.ok(syncFunctions.includes("readHudViaGithubApi"));
  assert.ok(syncFunctions.includes("readHudViaGhCli"));
  assert.ok(zone.includes('import { lerHudVigente } from "@/lib/sync.functions";'));
  assert.ok(zone.includes('queryKey: ["centraldark", "hud-funil-current"]'));
  assert.ok(zone.includes("CENTRALDARK_HUD_FUNNEL_CONTINUITY"));
  assert.ok(zone.includes("GITHUB_TOKEN/GH_TOKEN do ambiente"));
  assert.ok(zone.includes("Nenhum segredo é enviado ao navegador"));
  assert.ok(!zone.includes("process.env"));
  assert.ok(!syncFunctions.includes("ACTIVE_FUNNEL_PR=1977"));
});
// #OBSERVACOES# @owner=apps/instinto-superior/scripts/verify-hud-zone.mjs
// @doc_ref=docs/HUD/README.md @last_updated=2026-11-14T09:34:00Z
// O gate testa o vinculo do leitor PR-comentario com HUD; nao declara runtime publicado.
test("!HUD le comentarios do funil por MISSION_ID e expoe pendencias sem falso PASS", () => {
  const agentes = read("AGENTS.md");
  const contrato = read("docs/HUD/README.md");
  assert.ok(syncFunctions.includes("HUD_MISSION_TAG"));
  assert.ok(syncFunctions.includes("HUD_HALO_RECEIPT"));
  assert.ok(syncFunctions.includes("parseHudRecibos"));
  assert.ok(syncFunctions.includes("lerHudComentariosApi"));
  assert.ok(syncFunctions.includes("lerHudComentariosGh"));
  assert.ok(syncFunctions.includes("CENTRALDARK_HUD_ACTIVE_MISSION"));
  assert.ok(syncFunctions.includes("activeMissionId"));
  assert.ok(syncFunctions.includes("issues/" + '" + pr + "' + "/comments?per_page=100&page="));
  assert.ok(syncFunctions.includes('recibosEstado: atual ? "PASS" : "BLOCKED"'));
  assert.ok(syncFunctions.includes("CONCLUSAO_RELATADA"));
  assert.ok(zone.includes("MISSÃO PERSISTENTE · RECIBO DO GITHUB"));
  assert.ok(zone.includes("hudCurrent.data.missaoAtual.checklist.map"));
  assert.ok(zone.includes("hudCurrent.data.missaoAtual.commentUrl"));
  assert.ok(zone.includes("Caixas refletem declarações nos comentários"));
  assert.ok(agentes.includes("LEITURA INTERCHATS DO FUNIL"));
  assert.ok(contrato.includes("CENTRALDARK_HUD_MISSION_ID"));
  assert.ok(!syncFunctions.includes("ACTIVE_FUNNEL_PR=1977"));
});

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
  assert.match(cockpit, /\{ valor: "genesis", nome: "Gênesis".*soAdmin: true/);
  assert.match(cockpit, /!item\.soAdmin \|\| autenticado/);
  assert.match(cockpit, /autenticado \? \(/);
  assert.ok(cockpit.includes('HudDeterministico estado={dado} atualizar={() => void estado.refetch()} />'));
  assert.equal(cockpit.split('HudDeterministico estado={dado} atualizar={() => void estado.refetch()} />').length - 1, 1);
});

test("replay documental usa snapshot de inventario e blob Git fixado", () => {
  assert.equal(sourceBlob.status, 0);
  assert.ok(sourceBlob.stdout.length > 0);
  assert.equal(hudInventory.source.path, "docs/HUD/HUD.html");
  assert.equal(hudInventory.source.full_migration_proven, false);
  assert.equal(hudInventory.rules.includes("STATIC_INVENTORY_NOT_RUNTIME_PROOF"), true);
  assert.match(zone, /hudMigrationSnapshot/);
  assert.match(zone, /readback/);
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
  // Props opcionais fazem parte da API real; a assinatura exportada e o uso sao verificados abaixo.
  assert.match(infra, /export function GavetaForja\s*\(/);
  assert.ok(infra.includes('TabsTrigger value="gavetas"'));
  assert.ok(infra.includes("GavetaForja />"));
  assert.ok(zone.includes("<GavetaForja {...(estado?.mainSha ? { mainShaAtual: estado.mainSha } : {})} />"));
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
  assert.doesNotMatch(infra, /(?<![A-Za-z])fetch\s*\(/);
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
  // prova de SOURCE (snapshot), não execução das receitas: identidade única por receita
  const idsGaveta = catalogo.automation_owners.map(r => r.id);
  assert.equal(new Set(idsGaveta).size, idsGaveta.length, "ids de receita duplicados na gaveta");
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
  // fetch so e aceito contra a API admin da CentralDark (URL literal), nunca contra provedor direto.
  for (const m of obs.matchAll(/\bfetch\s*\(\s*([^,)]*)/g)) {
    const alvo = m[1].trim();
    const literalAdmin = /^["`]https:\/\/api\.centralldark\.com\//.test(alvo);
    const viaVariavel = /^(rota|url)$/.test(alvo) && obs.includes('"https://api.centralldark.com');
    assert.ok(literalAdmin || viaVariavel, "fetch fora da API admin: " + alvo.slice(0, 60));
  }
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
  assert.equal((cockpit.match(/<CentralNotificacoes modo="sininho"/g) || []).length, 1);
  assert.ok(cockpit.includes('data-cd-header-bell="right-of-account"'));
  assert.ok(cockpit.indexOf('data-cd-header-bell="right-of-account"') > cockpit.indexOf('onSair={sair}'));
  assert.ok(!cockpit.includes('{autenticado ? <span className="[&_button]:!size-8">'));
  assert.ok(cockpit.includes('data-cd-sidebar-resize'));
  assert.ok(cockpit.includes('definirAbaAdminInicial("notificacoes")'));
  assert.ok(cockpit.includes('abaInicial={abaAdminInicial}'));
  assert.ok(cockpit.includes('key={versaoAdmin}'), "segundo clique precisa remontar o painel");
  assert.ok(admin.includes('<TabsTrigger value="notificacoes">'));
  assert.ok(admin.includes('<CentralNotificacoes modo="painel" />'));
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


test("Screenpipe da Casa: origem real e assinatura flexivel sem falso 404 da VPS", () => {
  const sensor = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  const panel = read("apps/instinto-superior/src/components/central/StatusPanel.tsx");
  const from = sensor.indexOf("function screenpipeIdentificado(");
  const until = sensor.indexOf("function saidaScreenpipe(", from);
  assert.ok(from >= 0 && until > from, "assinatura deve permanecer no owner");
  const probe = sensor.slice(from, until);
  assert.match(probe, /"frame_status", "audio_status", "capture_status"/);
  assert.match(probe, /status === "healthy" \? "PASS" : "FAIL"/);
  assert.match(probe, /"HEALTH_SEM_ASSINATURA_SCREENPIPE"/);
  assert.match(probe, /dependencias !== null && objetoJson/);
  assert.match(sensor, /hostScreenpipe !== "UNKNOWN"/);
  assert.match(sensor, /medirReachable\("http:\/\/127\.0\.0\.1:3030\/health"\)/);
  assert.match(sensor, /SONDA_NAO_EXECUTADA/);
  assert.match(panel, /CASA NÃO CONSULTADA/);
  assert.match(panel, /ADAPTER PENDENTE/);
  assert.match(sensor, /desktop: "UNKNOWN"/);
});

test("Screenpipe da Casa: o HUD preserva a prova local sem expor captura bruta", () => {
  const sensor = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  assert.match(sensor, /for \(const campo of \["status", "capture_status", "frame_status", "audio_status"\]\)/);
  assert.match(sensor, /SENSOR: /);
  assert.doesNotMatch(sensor, /fetch\([^)]*\/frames\//);
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

test("linguagem principal do Cockpit traduz estados tecnicos para pessoas", () => {
  const estado = read("apps/instinto-superior/src/components/central/EstadoCentralDark.tsx");
  const cartao = read("apps/instinto-superior/src/components/central/CartaoResponsabilidade.tsx");
  const painel = read("apps/instinto-superior/src/components/central/StatusPanel.tsx");
  const runtime = read("apps/instinto-superior/src/components/central/RuntimeSistema.tsx");
  const conexoes = read("apps/instinto-superior/src/components/central/ConexoesCentralDark.tsx");
  for (const rotulo of ["Funcionando", "Em andamento", "Precisa de ação", "Conecte sua conta", "Ainda não verificado", "Precisa corrigir"]) {
    assert.ok(estado.includes(rotulo), "rotulo humano ausente: " + rotulo);
  }
  assert.ok(estado.includes("Ver detalhes técnicos"));
  assert.ok(cartao.includes("rotuloTecnicoHumano(estado)"));
  assert.ok(painel.includes("Estado atual do sistema"));
  assert.ok(painel.includes("Nenhum sinal de áudio recente"));
  assert.ok(runtime.includes("Sistema e desempenho"));
  assert.ok(conexoes.includes("Ver detalhes técnicos das conexões"));
});

test("Screenpipe Casa projeta apenas metadados recentes no card existente, sem vazar frames", () => {
  const painel = read("apps/instinto-superior/src/components/central/StatusPanel.tsx");
  const sensor = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  for (const campo of ["last_frame_timestamp", "frame_status", "monitors", "frames_db_written", "capture_fps_actual"]) {
    assert.ok(sensor.includes(campo), "fonte real ausente: " + campo);
  }
  assert.ok(sensor.includes("idade <= 30_000"));
  assert.ok(sensor.includes("frameFresco && frameStatus === \"ok\""));
  assert.ok(sensor.includes('sonda.httpStatus === 200'));
  assert.ok(sensor.includes('HISTÓRICO VISUAL: Screenpipe Desktop'));
  assert.ok(painel.includes("Capturas recentes · Screenpipe Casa"));
  assert.ok(painel.includes("d?.screenpipeEvents"));
  assert.ok(painel.includes("Histórico e imagens: Screenpipe Desktop"));
  assert.ok(!sensor.includes('fetch("http://127.0.0.1:3030/frames/'));
  assert.ok(!painel.includes('<img src="http://127.0.0.1:3030/'));
});

test("maquina de estados distingue rota disponível de execução comprovada sem falso verde", () => {
  const painel = read("apps/instinto-superior/src/components/central/StatusPanel.tsx");
  const sensor = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  assert.ok(painel.includes("function LuzProjecao("));
  assert.ok(painel.includes('estado === "RUNNING" && http === 200'));
  assert.ok(painel.includes('erro === "PROJECAO_LOCAL_SEM_CONTRAPROVA_DE_EXECUCAO"'));
  assert.ok(painel.includes("Conexão disponível"));
  assert.ok(painel.includes("Uso recente ainda não verificado"));
  assert.ok(painel.includes('d?.commanderEngine === true && remote === "RUNNING"'));
  assert.ok(painel.includes("Conectado"));
  assert.ok(painel.includes("Pronto para receber uma ação quando necessário."));
  assert.ok(painel.includes('d?.screenpipeDetail === "degraded"'));
  assert.ok(painel.includes("Nenhum sinal de áudio recente"));
  assert.ok(painel.includes("sem prova completa"));
  assert.ok(sensor.includes('const deploy: Estado = "UNKNOWN";'));
  assert.ok(sensor.includes('projecaoNaoRevalidada ? "RUNNING" : "PASS"'));
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
  assert.match(design, /autenticado \? \(\r?\n\s*<TabsContent value="extensoes"/);
  assert.ok(cockpit.includes('autenticado={autenticado}'));
  assert.ok(extension.includes("terminal.show(false)"));
  const focus = extension.slice(extension.indexOf("function focusExistingCliTerminal"),
    extension.indexOf("function loadMap"));
  assert.ok(!focus.includes("createTerminal("));
  for (const name of ["onDidStartTerminalShellExecution", "onDidEndTerminalShellExecution",
    "LOGS-VS-CODE.log"]) assert.ok(extension.includes(name), "evento/funil: " + name);
  assert.ok(!focus.includes("process.env.OPENAI_API_KEY"));
  assert.ok(!focus.includes("process.env.<nome-de-segredo>"));

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

test("🪬 quatro cartões com flip metálico separam CURRENT, offline e verde histórico", () => {
  const panel = read("apps/instinto-superior/src/components/central/StatusPanel.tsx");
  const sensor = read("apps/instinto-superior/src/lib/cockpit.functions.ts");
  const keys = ["casa", "main", "vps", "api"];
  assert.match(panel, /type ChaveSinal = "casa" \| "main" \| "vps" \| "api"/);
  for (const key of keys) {
    assert.ok(panel.includes('chave: "' + key + '"'), "sinal sem face: " + key);
    assert.ok(panel.includes('flip-" + sinal.chave'), "controle de virar ausente");
  }
  assert.match(panel, /rotateY\(180deg\)/);
  assert.match(panel, /backfaceVisibility: "hidden"/);
  assert.match(panel, /motion-safe:transition-transform/);
  assert.match(panel, /aria-pressed=\{virado\}/);
  assert.match(panel, /aria-hidden=\{virado\}/);
  assert.match(panel, /aria-hidden=\{!virado\}/);
  assert.match(panel, /HISTÓRICO · NÃO É ESTADO ATUAL/);
  assert.match(panel, /localStorage\.setItem\(HISTORICO_LOCAL_KEY/);
  assert.match(panel, /q\.dataUpdatedAt < 45_000/);
  assert.match(panel, /d\?\.casaPeerOnline === false/);
  assert.match(panel, /OFFLINE NA MALHA/);
  assert.match(panel, /TAILSCALE · não comprova site local/);
  assert.match(panel, /SHA COINCIDE/);
  assert.match(panel, /SHA NÃO COMPARADO/);
  assert.match(panel, /AUTORIZAÇÃO DO SENSOR/);
  assert.match(panel, /HTTP 200 não atesta tudo/);
  assert.doesNotMatch(panel, /localStorage\.getItem\([^)]*\)\s*\?\s*"PASS"/);
  assert.match(sensor, /async function medirPeerCasa\(/);
  assert.match(sensor, /execFile\)\("tailscale", \["status", "--json"\]/);
  assert.match(sensor, /host === "segredo"/);
  assert.match(sensor, /typeof casa\["Online"\] !== "boolean"/);
  assert.match(sensor, /casaPeerOnline: casaPeer\.online/);
  assert.match(sensor, /casaPeerMedidoEm: casaPeer\.medidoEm/);
  assert.match(sensor, /casaOnly && resposta.status === 200/);
  assert.match(sensor, /peer offline != prova de processo desligado/);
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
// O corpo deste teste foi inserido truncado pelo commit dc97c321d (só as leituras de arquivo, nenhuma asserção) e
// deixava o script sem fechar. Não existe versão completa no histórico. Marcado como pendente em vez de
// fechar um teste vazio, que passaria sem provar nada.
test.todo("regressao do Marketplace ZENDRIVE — construir, instalar, conectar e provar sem falso verde (corpo a reescrever)");

test("Casa canonical K and four-stage collector receipt", () => {
  const launcher = read("apps/instinto-superior/INICIAR-COCKPIT-LOCAL.bat");
  const bridge = read("scripts/casa/vscode-log-bridge.ps1");
  const ingest = read("scripts/vps/ingest-vscode-log.mjs");
  // Contrato vigente (migracao controlada 2026-10-20): raiz K:\, guarda de checkout Git, porta fixa 8080 no autostart,
  // sem npm install nem kill.
  const autostart = read("scripts/casa/instinto-cockpit-autostart.ps1");
  for (const field of ['%~dp0', "rev-parse --is-inside-work-tree", "instinto-cockpit-autostart.ps1"]) {
    assert.ok(launcher.includes(field), field);
  }
  for (const field of ["$port = 8080", "--strictPort"]) assert.ok(autostart.includes(field), field);
  const launcherSemComentarios = launcher.split(/\r?\n/).filter(l => !/^\s*REM\b/i.test(l)).join("\n");
  assert.doesNotMatch(launcherSemComentarios, /npm\s+(?:ci|install)|taskkill|Stop-Process/);
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

test("microdeploy do Cockpit nunca vende sync Git como deploy comprovado", () => {
  const fonte = read("apps/instinto-superior/src/components/central/AutoSyncButton.tsx");
  assert.ok(fonte.includes("deploy ainda não comprovado"));
  assert.ok(fonte.includes("deploy exige recibo"));
  assert.ok(fonte.includes("dispatchPromotion"));
  assert.doesNotMatch(fonte, /Micro-Deploy \$\{microDeployMode\} ok/);
  const handler = fonte.match(/const handleMicroDeploy = async \(\) => \{[\s\S]*?\r?\n  \};?\r?\n/);
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



test("contas e integracoes provam MCP HTTP P0 sem converter historico em acesso vivo", () => {
  const ui = read("apps/instinto-superior/src/components/central/ConexoesCentralDark.tsx");
  const fn = read("apps/instinto-superior/src/lib/conexoes.functions.ts");
  const runtime = read("apps/modulos/mcp/src/index.js");
  for (const name of ["lerSaudeInfraCentralDark", "mcpRecipe", "mcpCatalogo", "statusBroker"]) {
    assert.ok(ui.includes(name), `cockpit sem leitura real: ${name}`);
  }
  assert.ok(ui.includes("REGISTRO ATIVO · TESTE PENDENTE"));
  assert.ok(ui.includes("instâncias STDIO do Hermes"));
  assert.ok(fn.includes("requireSupabaseAuth"));
  assert.ok(fn.includes(".eq(\"role\", \"admin\")"));
  assert.ok(fn.includes('mcpTools.statusHttp === 200'));
  assert.ok(fn.includes('recipe?.["hostedDispatchLocked"] === true'));
  assert.ok(fn.includes('recipe?.["adminAliasLoaded"] === true'));
  assert.ok(fn.includes('recipe?.["codeStatus"] === "RECIPE_FIRST_MATCHED"'));
  assert.ok(runtime.includes('app.get("/health", async'));
  assert.ok(runtime.includes('canonicalRecipeFirstPreflight('));
  assert.ok(runtime.includes('assertNoRetiredCentralDarkHostedDeploy('));
  assert.ok(runtime.includes('proofLevel: recipeReady'));
  assert.doesNotMatch(ui, /acesso verificado em 23\/10/);
});

test("runtime owner wins over stale checkout na leitura P0", () => {
  const source = read("apps/modulos/mcp/src/tools/deploy/centraldark-capabilities.js");
  assert.ok(source.includes("function installedRuntimeRoot()"));
  assert.ok(source.includes("RUNTIME_OWNER_FIRST"));
  assert.ok(source.includes("CHECKOUT_FALLBACK_ONLY_ON_MISSING"));
  assert.ok(source.includes("recipeSource: selected.source"));
});

test("HUD mostra receita P0 a partir do mesmo sensor autentico, sem nova secao", () => {
  const fn = read("apps/instinto-superior/src/lib/conexoes.functions.ts");
  const hud = read("apps/instinto-superior/src/components/central/HudDeterministico.tsx");
  const conexoes = read("apps/instinto-superior/src/components/central/ConexoesCentralDark.tsx");
  assert.ok(hud.includes("lerSaudeInfraCentralDark"));
  assert.ok(hud.includes('["Receita em uso", provaMcp.data?.mcpRecipe ?? "UNKNOWN"'));
  assert.ok(hud.includes("STDIO/Hermes exigem contraprova separada"));
  assert.ok(hud.includes('queryKey: ["centraldark", "saude-hub-mcp"]'));
  assert.ok(conexoes.includes('queryKey: ["centraldark", "saude-hub-mcp"]'));
  assert.ok(fn.includes(".middleware([requireSupabaseAuth])"));
  assert.ok(fn.includes('mcpRecipeEscopo: "MCP_HTTP_ONLY"'));
  assert.equal((hud.match(/\["Receita em uso",/g) || []).length,1);
});

test("Instinto Superior oferece 5 acoes humanas usando owners originais", () => {
  const data = read("apps/instinto-superior/src/data/painel-unico.ts");
  const ui = read("apps/instinto-superior/src/components/central/MapaOwners.tsx");
  const shell = read("apps/instinto-superior/src/components/central/CockpitShell.tsx");
  const names = ["🏠 Início", "✨ Criar", "👁️ Ao vivo", "🔗 Conexões", "📖 Histórico"];
  for (const n of names) assert.ok(data.includes(n), "caminho simples ausente: " + n);
  assert.equal((data.match(/rotulo: "/g) || []).length,5);
  assert.ok(data.includes('id: "ao-vivo", rotulo: "👁️ Ao vivo", aba: "visao"'));
  assert.ok(data.includes("StatusPanel/PapagaioHudMcp/cockpit.functions"));
  assert.ok(data.includes("RASCUNHO_SEM_DESPACHO"));
  assert.ok(data.includes("ABRIR_OWNER_AUTENTICADO"));
  assert.ok(ui.includes("O que você quer fazer hoje?"));
  assert.ok(ui.includes("onNavigate?.(item.aba)"));
  assert.ok(ui.includes("ConexoesCentralDark"));
  assert.ok(ui.includes("item.privado && !autenticado"));
  assert.ok(ui.includes("conexoesAbertas"));
  assert.ok(shell.includes("<MapaOwners onNavigate={definirAbaAtiva} autenticado={autenticado} />"));
  // Cada área deve ter um único gatilho; os sete gatilhos Radix duplicados
  // foram removidos do CockpitShell para evitar IDs/aria-controls repetidos.
  const navegacao = shell.split("const NAVEGACAO_PASTAS = [")[1]?.split("] as const;")[0] ?? "";
  assert.equal((navegacao.match(/\{ valor: "/g) || []).length,28);
  assert.ok(shell.includes('data-cd-flow={"instinto.CockpitShell.aba." + item.valor}'));
  assert.ok(shell.includes('(!item.soAdmin || autenticado)'));
  const icones = shell.split("const ICONES_NAVEGACAO = {")[1]?.split("} satisfies Record<")[0] ?? "";
  const chaves = [...icones.matchAll(/^  (?:"([^"]+)"|([a-z][a-z0-9]*)):/gm)].map((m) => m[1] || m[2]);
  assert.equal(chaves.length, 28, "cada menu original deve ter ícone próprio");
  assert.equal(new Set(chaves).size, 28, "não duplicar entradas do mapeamento");
  const rotas = [...navegacao.matchAll(/\{ valor: "([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual([...chaves].sort(), [...rotas].sort(), "ícones devem corresponder às 28 rotas atuais");
  assert.ok(shell.includes('<IconeItemNavegacao valor={item.valor} />'));
  assert.ok(shell.includes("bg-surface-2") && shell.includes("text-gold"));
  assert.ok(shell.includes("hover:bg-primary/10"));
  assert.ok(shell.includes("focus-visible:bg-primary/10"));
  assert.ok(shell.includes("data-[state=active]:bg-primary/15"));
  assert.ok(shell.includes("data-[state=active]:text-primary"));
  assert.ok(shell.includes("group-data-[collapsible=icon]:justify-center"));
  assert.ok(shell.includes("motion-reduce:transition-none"));
  assert.ok(!shell.includes('className="mr-2 shrink-0 text-xs group-data-[collapsible=icon]:mr-0"'));
  const landing = read("apps/instinto-superior/src/routes/index.tsx");
  assert.ok(landing.includes('rounded-lg border border-border bg-surface-2'));
  assert.ok(landing.includes('text-gold transition-colors group-hover:text-neon-green'));
  const peles = read("apps/instinto-superior/src/styles.css");
  for (const cor of ['data-pele-cockpit="ouro"', 'data-pele-cockpit="ops"', 'data-pele-cockpit="esmeralda"'])
    assert.ok(peles.includes(cor), "pele existente precisa permanecer: " + cor);
});

test("casca preserva sidebar com busca e toggle sem controles centrais duplicados", () => {
  // Delta visual autorizado: lupa e recolher/expandir vivem no header da
  // sidebar existente. O harness superior duplicado nao deve ressurgir.
  assert.match(cockpit, /className="sticky top-0 z-30/);
  assert.match(cockpit, /SidebarProvider open=\{menuAberto\}/);
  assert.match(cockpit, /Sidebar collapsible="icon"/);
  assert.match(cockpit, /aria-label="Pesquisar ferramentas"/);
  assert.match(cockpit, /onClick=\{abrirBuscaNavegacao\}/);
  assert.match(cockpit, /aria-label="Ocultar ou mostrar barra lateral"/);
  assert.equal((cockpit.match(/<SidebarTrigger\b/g) || []).length, 1);
  assert.match(cockpit, /aria-label="Seis pastas da Sala de Controle"/);
  assert.match(cockpit, /type="search" value=\{buscaNavegacao\}/);
  assert.match(cockpit, /focarBuscaAoAbrir/);
  assert.match(cockpit, /data-cd-harness="left-rail"/);
  assert.match(cockpit, /aria-label="Harness auxiliar à direita"/);
  assert.match(cockpit, /data-cd-harness="left-rail" className="fixed right-14 top-1\/2/);
  assert.match(cockpit, /data-cd-harness="right-rail" className="fixed right-1 top-1\/2/);
  assert.equal((cockpit.match(/data-cd-harness="left-rail"/g) || []).length, 1);
  assert.equal((cockpit.match(/data-cd-harness="right-rail"/g) || []).length, 1);
  assert.doesNotMatch(cockpit, /data-cd-harness="left-rail" className="fixed left-1/);
  assert.equal((cockpit.match(/<CentralNotificacoes modo="sininho"/g) || []).length, 1);
  assert.ok(cockpit.includes('data-cd-header-bell="right-of-account"'));
  assert.match(cockpit, /data-cd-sidebar-resize/);
  assert.match(cockpit, /role="separator"/);
  assert.match(cockpit, /aria-label="Arrastar para ajustar largura da barra lateral"/);
  const scrollbarStyles = read("apps/instinto-superior/src/styles.css");
  assert.ok(scrollbarStyles.includes("CENTRALDARK.SCROLLBAR.UNICA"));
  assert.ok(scrollbarStyles.includes('html:has(main[data-pele-cockpit]) body *'));
  assert.ok(scrollbarStyles.includes('scrollbar-color:'));
  assert.ok(scrollbarStyles.includes('scrollbar-gutter: stable'));
  assert.doesNotMatch(cockpit, /cd-sidebar-scrollbar/);
  assert.match(cockpit, /--cd-sidebar-width/);
  assert.match(cockpit, /centraldark\.cockpit\.sidebar-width/);
  assert.doesNotMatch(cockpit, /data-cd-harness="top-rail"/);
  assert.doesNotMatch(cockpit, /data-cd-harness="top-floating"/);
  assert.doesNotMatch(cockpit, /aria-label="Lupa · buscar ferramentas"/);
});

test("jornada evolutiva didatica usa o mesmo cockpit sem XP ficticio", () => {
  const loop = read("docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md");
  assert.match(cockpit, /function JornadaEvolutiva/);
  assert.match(cockpit, /\{ valor: "jornada", nome: "Aprender jogando".*soAdmin: false/);
  assert.match(cockpit, /TabsContent value="jornada"/);
  assert.match(cockpit, /data-cd-flow="instinto.CockpitShell.jornada-evolutiva"/);
  assert.match(cockpit, /!KAIZEN/);
  assert.match(cockpit, /!MULTIBUSSOLA/);
  assert.match(cockpit, /Nível 06 · marco narrativo/);
  assert.match(cockpit, /abrirDestino\("recibos"\)/);
  assert.match(cockpit, /abrirDestino\("forja"\)/);
  assert.match(loop, /Projecao didatica no Cockpit/);
  const bloco = cockpit.split("function JornadaEvolutiva")[1].split("function MenuVisualCentralDark")[0];
  assert.doesNotMatch(bloco, /fetch\(|execSync\(|localStorage/);
});

test("Sync Center usa provas SSH autenticadas no Supabase sem inventar sync ou deploy", () => {
  const center = read("apps/instinto-superior/src/components/central/SyncCenter.tsx");
  const proof = read("apps/instinto-superior/src/components/central/SshBridgeProof.ts");
  assert.match(center, /useSshBridgeProof/);
  assert.match(center, /data-cd-flow="instinto.SyncCenter.ssh-bidirecional-supabase"/);
  assert.match(center, /provasAtuais\[id\]/);
  assert.match(center, /ssh\.rotas\["casa-vps"\]/);
  assert.match(center, /ssh\.rotas\["vps-casa"\]/);
  assert.match(proof, /supabase\.auth\.getSession/);
  assert.match(proof, /\/rest\/v1\/agent_events/);
  assert.match(proof, /area: "eq\.sync-center-ssh"/);
  assert.match(proof, /proof_run_ended_at/);
  assert.match(proof, /ttl_seconds/);
  assert.match(proof, /"AUTH_REQUIRED"/);
  assert.match(proof, /Nao comprova sincronizacao nem deploy|Não prova sincronização nem deploy/);
  assert.doesNotMatch(proof, /service_role|SERVICE_ROLE|SUPABASE_SECRET_KEY/);
});

test("feed vivo de eventos e missoes reutiliza o SyncCenter, Supabase RLS e Realtime", () => {
  const center = read("apps/instinto-superior/src/components/central/SyncCenter.tsx");
  const feed = read("apps/instinto-superior/src/components/central/FeedVivoCentralDark.tsx");
  const recipe = read("docs/ARQUITETURA/CENTRALDARK-CIRCUITO-VIVO-CONEXOES-20261026.md");
  assert.match(center, /<FeedVivoCentralDark \/>/);
  assert.match(feed, /data-cd-flow="instinto.SyncCenter.feed-vivo"/);
  assert.match(feed, /supabase\.auth\.getSession\(\)/);
  assert.match(feed, /agent_events/);
  assert.match(feed, /hub_mission_events/);
  assert.match(feed, /postgres_changes/);
  assert.match(feed, /event: "INSERT"/);
  assert.match(feed, /invalidateQueries/);
  assert.match(feed, /refetchInterval: 60_000/);
  assert.match(feed, /status === "STREAM_ON"/);
  assert.match(recipe, /IDENTIFICAR|Identificar/);
  assert.doesNotMatch(feed, /SERVICE_ROLE|service_role/);
});
