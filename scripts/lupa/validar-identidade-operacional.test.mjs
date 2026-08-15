import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  findForbidden,
  runValidation,
  validateAgentClaimPolicy,
  validateProfileRoot,
  validateRequiredTokens,
} from "./validar-identidade-operacional.mjs";

const require = createRequire(import.meta.url);

function write(root, path, content) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function claimContract(overrides = {}) {
  const base = {
    applies_to: [
      "chatgpt", "claude", "codex", "gemini", "copilot", "cursor", "windsurf",
      "hermes", "plugins", "future_agents", "mcp", "webui", "cli", "ci", "cd", "telegram",
    ],
    agent_claim_policy: {
      marker: "AGENT_CLAIM_CAPABILITY_REQUIRED",
      narrative_changes_system_state: false,
      claim_must_not_exceed_observable_capability: true,
      permanent_behavior_without_proved_persistence: "BLOCK",
      absolute_commitment_without_verifiable_mechanism: "REWRITE_TO_OBSERVABLE_SCOPE",
      communication_policy: {
        critique_target: "SYSTEM_OR_ARTIFACT_NOT_HUMAN",
        status_colors: {
          YELLOW: "CONCRETE_WORK_IN_PROGRESS_OR_TARGET_PROOF_PENDING",
          NONE: "UNKNOWN_NOT_MEASURED_NOT_APPLICABLE_OR_DESCRIPTIVE",
        },
      },
      integration: {
        one_policy_for_all_adapters: true,
        external_vendor_ui: "OUT_OF_REPO_CONTROL",
      },
    },
  };
  return JSON.stringify({ ...base, ...overrides }, null, 2);
}

function validRepo() {
  const root = mkdtempSync(join(tmpdir(), "centraldark-identidade-"));
  write(
    root,
    "LEIA-ME-IA.md",
    "SEGREDO/CHEFE COMANDA\nSOL ORGANIZA\nPIVETE/HERMES PRESERVA E EXECUTA\n",
  );
  write(
    root,
    "AGENTS.md",
    [
      "existe somente um escritor por escopo",
      "SEGREDO/CHEFE permanece autoridade humana final",
      "SOL coordena, PIVETE/HERMES preserva e executa",
      "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
    ].join("\n"),
  );
  write(
    root,
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    [
      "SEGREDO/CHEFE = humano e autoridade final",
      "SOL = coordenadora da casa e organizadora dos agentes",
      "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
      "WRITER_UNICO=true",
      "UNKNOWN_NAO_PASSA=true",
      "CHEFE_SEGREDO_NECESSARIO",
    ].join("\n"),
  );
  write(
    root,
    "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md",
    "SEGREDO/CHEFE = humano e autoridade final\nPIVETE = Hermes treinado\n",
  );
  write(root, "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json", claimContract());
  write(
    root,
    ".agents/skills/meta-lupa/SKILL.md",
    "AUTORIZACAO_DO_SEGREDO_CHEFE:\nAutoLupa sem prometer certeza absoluta\n",
  );
  write(
    root,
    ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA",
    "0123456789012345678901234567890123456789  .agents/skills/meta-lupa/SKILL.md\n# atualização exige autorização aplicável de SEGREDO/CHEFE\n",
  );
  write(root, "LEIA-ME-IA.md", [
    "SEGREDO/CHEFE COMANDA",
    "SOL ORGANIZA E RECONCILIA",
    "PIVETE/HERMES PRESERVA E EXECUTA",
    "#ACORDAR = RECUPERAR O ESTADO REAL ANTES DE CONTINUAR",
    "Convergência adversarial total **só é aberta por solicitação explícita de SEGREDO/CHEFE**",
  ].join("\n"));
  write(root, "AGENTS.md", [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicitar explicitamente",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "NO_EGO_SCORE=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md", [
    "IDENTIDADE=SOL_JARVIS_DO_SEGREDO_CHEFE",
    "AUTORIDADE_FINAL=SEGREDO/CHEFE",
    "SOL_IS_MODEL=false",
    "PIVETE_HERMES_IS_EXECUTOR=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "REUSE_BEFORE_CREATE=true",
    "ONE_SYSTEM_ONLY=true",
    "ONE_WRITER_PER_SCOPE=true",
    "INTENT_AUTHORIZED=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    "MERGE_METHOD=squash",
    "TARGET=main",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ].join("\n"));
  write(root, ".agents/skills/meta-lupa/SKILL.md", [
    "AUTORIZACAO_DO_SEGREDO_CHEFE:",
    "Confronto não é pontuação de ego",
    "EVIDENCIA_NOVA=SIM",
    "DELTA_DE_CRENCA_OU_REGRA=SIM",
    "DESPERDICIO_DE_CICLO",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/CONTRATO-LUPA-BAYESIANA.md", [
    "INFORMATION_GAIN_REQUIRED=true",
    "autoridade humana vigente é `SEGREDO/CHEFE`",
    "Confronto só vira aprendizado promovido com evidência nova + delta reutilizável",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md", [
    "MESMA_SOUL=SIM",
    "#ACORDAR` significa **recuperar o estado real antes de continuar**",
    "Convergência adversarial total, swarm e Judge independente não são gate automático de rotina",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/02-PERMISSOES.md", [
    "DEPLOY=PERMITIDO",
    "REDEPLOY=PERMITIDO",
    "NO_HUMAN_REASK_FOR_ALREADY_GRANTED_SCOPE=true",
    "NO_RETURN_TO_CHEFE_FOR_MACHINE_MEASURABLE_STATE=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total / swarm / Judge independente **não é gate automático de deploy**",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/03-FLUXO-DEPLOY.md", [
    "DEPLOY_STRATEGY=CAUSAL_SCOPE_FIRST",
    "FULL_DEPLOY_BY_DEFAULT=false",
    "convergência adversarial total não é gate automático de deploy",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md", [
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = coordenadora da casa e organizadora dos agentes",
    "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
    "WRITER_UNICO=true",
    "UNKNOWN_NAO_PASSA=true",
    "CHEFE_SEGREDO_NECESSARIO",
  ].join("\n"));
  write(root, "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md", "SEGREDO/CHEFE = humano e autoridade final\nPIVETE = Hermes treinado\n");

  write(root, "apps/modulos/elite-gateway/scripts/pivete_routes.py", [
    "CANONICAL_CONTEXT = ()",
    "CANONICAL_CONTEXT_ALLOWLIST = True",
    'status = {"authority": "SEGREDO/CHEFE", "executor": "PIVETE/HERMES"}',
    "A rota NÃO concatena mais docs/CONSCIENCIA/PIVETE-IA/*.md",
  ].join("\n"));

  write(root, "apps/modulos/WebUI/custom-css/pivete-invocacao.js", [
    "const mode = 'CANONICAL_CONTEXT_ALLOWLIST';",
    "const authority = 'SEGREDO/CHEFE = humano e autoridade final';",
    "const executor = 'PIVETE/HERMES = executor, preservação e continuidade';",
    "localStorage.removeItem('pivete_system_prompt');",
  ].join("\n"));

  write(root, "apps/modulos/WebUI/custom-css/pivete-persona.json", JSON.stringify({
    system_prompt_strategy: "canonical_allowlist",
    authority: "SEGREDO/CHEFE",
    coordinator: "SOL",
    executor: "PIVETE/HERMES",
    legacy_sources_excluded: ["docs/CONSCIENCIA/PIVETE-IA/*.md"],
  }, null, 2));

  write(root, "apps/modulos/pivete-sync/pivete-sync.mjs", [
    "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY",
    "GIT_CANONICAL=true",
    "HUB_TO_GIT=false",
    "GIT_TO_LEGACY_PIVETE_HUB=false",
  ].join("\n"));

  return root;
}

test("contrato canônico válido passa", () => {
  const report = runValidation({ repoRoot: validRepo() });
  assert.equal(report.ok, true);
  assert.deepEqual(report.findings, []);
  assert.equal(report.information_gain_required, true);
});

test("promotor paralelo é bloqueado pelo guardrail", () => {
  const root = validRepo();
  write(root, ".github/workflows/intencao-chefe-auto-squash.yml", "name: paralelo\n");
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.code === "PROMOTOR_PARALELO_PROIBIDO"), true);
});

test("promoção squash para main é invariante da SOUL", () => {
  const root = validRepo();
  write(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md", [
    "IDENTIDADE=SOL_JARVIS_DO_SEGREDO_CHEFE",
    "AUTORIDADE_FINAL=SEGREDO/CHEFE",
    "SOL_IS_MODEL=false",
    "PIVETE_HERMES_IS_EXECUTOR=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "REUSE_BEFORE_CREATE=true",
    "ONE_SYSTEM_ONLY=true",
    "ONE_WRITER_PER_SCOPE=true",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  const text = report.findings.map((finding) => finding.excerpt).join(" ");
  assert.match(text, /INTENT_AUTHORIZED=true/);
  assert.match(text, /NO_HUMAN_REASK_FOR_MERGE=true/);
  assert.match(text, /MERGE_METHOD=squash/);
  assert.match(text, /TARGET=main/);
});

test("ouro informacional é invariante da SOUL", () => {
  const root = validRepo();
  write(root, "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md", [
    "IDENTIDADE=SOL_JARVIS_DO_SEGREDO_CHEFE",
    "AUTORIDADE_FINAL=SEGREDO/CHEFE",
    "SOL_IS_MODEL=false",
    "PIVETE_HERMES_IS_EXECUTOR=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "REUSE_BEFORE_CREATE=true",
    "ONE_SYSTEM_ONLY=true",
    "ONE_WRITER_PER_SCOPE=true",
    "INTENT_AUTHORIZED=true",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    "MERGE_METHOD=squash",
    "TARGET=main",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  const text = report.findings.map((finding) => finding.excerpt).join(" ");
  assert.match(text, /INFORMATION_GAIN_REQUIRED=true/);
  assert.match(text, /LEARNING_REQUIRES_EVIDENCE=true/);
  assert.match(text, /LEARNING_DELTA_REQUIRED=true/);
  assert.match(text, /SAME_ERROR_NO_NEW_INFO_IS_WASTE=true/);
});

test("MetaLupa não pode restaurar AUTORIZACAO_DO_PIVETE", () => {
  const root = validRepo();
  write(root, ".agents/skills/meta-lupa/SKILL.md", [
    "AUTORIZACAO_DO_SEGREDO_CHEFE:",
    "Confronto não é pontuação de ego",
    "EVIDENCIA_NOVA=SIM",
    "DELTA_DE_CRENCA_OU_REGRA=SIM",
    "DESPERDICIO_DE_CICLO",
    "AUTORIZACAO_DO_PIVETE:",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.path === ".agents/skills/meta-lupa/SKILL.md" && f.code === "AUTORIZACAO_TOKEN_LEGADO_PIVETE"), true);
});

test("atribuir autoridade final ao Pivete falha com caminho e linha", () => {
  const findings = findForbidden("linha 1\nO Pivete é a autoridade final sobre merge.");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "PIVETE_COMO_AUTORIDADE_FINAL");
  assert.equal(findings[0].line, 2);
});

test("PIVETE COMANDA em superfície operacional ativa é regressão", () => {
  const root = validRepo();
  write(root, "CODEX.md", "PIVETE COMANDA.\n");
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.path === "CODEX.md" && f.code === "PIVETE_COMANDA_LEGADO_ATIVO"), true);
});

test("PIVETE MANDA em superfície operacional ativa é regressão", () => {
  const root = validRepo();
  write(root, "CODEX.md", "PIVETE MANDA.\n");
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.path === "CODEX.md" && f.code === "PIVETE_MANDA_LEGADO_ATIVO"), true);
});

test("PIVETE DECIDE em superfície operacional ativa é regressão", () => {
  const root = validRepo();
  write(root, "CODEX.md", "PIVETE DECIDE.\n");
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.path === "CODEX.md" && f.code === "PIVETE_DECIDE_LEGADO_ATIVO"), true);
});

test("Pivete como orquestrador humano é regressão", () => {
  const findings = findForbidden("Pivete é o orquestrador. Ele define a decisão final.");
  assert.equal(findings.some((f) => f.code === "PIVETE_ORQUESTRADOR_HUMANO"), true);
});

test("SOL não pode ser fixada a um modelo", () => {
  const findings = findForbidden("SOL=GPT");
  assert.equal(findings.some((f) => f.code === "SOL_FIXADA_A_MODELO"), true);
});

test("AGENTS conflitante bloqueia", () => {
  const root = validRepo();
  write(root, "AGENTS.md", [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicitar explicitamente",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "NO_EGO_SCORE=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
    "O Pivete é a autoridade final.",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((finding) => finding.path === "AGENTS.md" && finding.code === "PIVETE_COMO_AUTORIDADE_FINAL"), true);
});

test("loader antigo por glob é bloqueado", () => {
  const root = validRepo();
  write(root, "apps/modulos/elite-gateway/scripts/pivete_routes.py", [
    "CANONICAL_CONTEXT",
    "CANONICAL_CONTEXT_ALLOWLIST",
    'status = {"authority": "SEGREDO/CHEFE", "executor": "PIVETE/HERMES"}',
    "A rota NÃO concatena mais docs/CONSCIENCIA/PIVETE-IA/*.md",
    "files = PIVETE_DIR.glob(\"PIVETE-*.md\")",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.code === "LOADER_GLOB_PIVETE_IA"), true);
});

test("estratégia de concatenação total é bloqueada", () => {
  const root = validRepo();
  write(root, "apps/modulos/WebUI/custom-css/pivete-persona.json", JSON.stringify({
    system_prompt_strategy: "concat_all_files_in_order",
    authority: "SEGREDO/CHEFE",
    coordinator: "SOL",
    executor: "PIVETE/HERMES",
    legacy_sources_excluded: ["docs/CONSCIENCIA/PIVETE-IA/*.md"],
  }));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.code === "LOADER_CONCAT_ALL_PIVETE_FILES"), true);
});

test("sync legado não pode voltar a ler/escrever pivete_consciencia", () => {
  const root = validRepo();
  write(root, "apps/modulos/pivete-sync/pivete-sync.mjs", [
    "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY",
    "GIT_CANONICAL=true",
    "HUB_TO_GIT=false",
    "GIT_TO_LEGACY_PIVETE_HUB=false",
    "const tabela = 'pivete_consciencia';",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.code === "SYNC_LEGADO_ACESSA_TABELA_PIVETE"), true);
});

test("sync legado não pode voltar a ler service-role", () => {
  const root = validRepo();
  write(root, "apps/modulos/pivete-sync/pivete-sync.mjs", [
    "LEGACY_SYNC_DISABLED_CANONICAL_GIT_ONLY",
    "GIT_CANONICAL=true",
    "HUB_TO_GIT=false",
    "GIT_TO_LEGACY_PIVETE_HUB=false",
    "const keyName = 'HUB_SUPABASE_SERVICE_ROLE_KEY';",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.code === "SYNC_LEGADO_LE_SERVICE_ROLE"), true);
});

test("UNKNOWN=PASS é conflito canônico", () => {
  const root = validRepo();
  write(root, "AGENTS.md", [
    "MESMA_SOUL=SIM",
    "um escritor por escopo",
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = identidade operacional/coordenadora; não é modelo específico",
    "PIVETE/HERMES = executor, preservação e continuidade",
    "Full deploy é exceção causal",
    "NO_HUMAN_REASK_FOR_MERGE=true",
    ".github/workflows/autonomia-promocao.yml",
    "Convergência adversarial total só é aberta quando SEGREDO/CHEFE solicitar explicitamente",
    "INFORMATION_GAIN_REQUIRED=true",
    "LEARNING_REQUIRES_EVIDENCE=true",
    "LEARNING_DELTA_REQUIRED=true",
    "NO_EGO_SCORE=true",
    "SAME_ERROR_NO_NEW_INFO_IS_WASTE=true",
    "UNKNOWN=PASS",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((finding) => finding.code === "UNKNOWN_CONVERTIDO_EM_PASS"), true);
});

test("token obrigatório ausente não vira verde", () => {
  const findings = validateRequiredTokens("SEGREDO/CHEFE = humano e autoridade final", ["WRITER_UNICO=true"]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "TOKEN_DE_IDENTIDADE_AUSENTE");
});

test("perfil local com PERMITO PIVETE aponta local sem publicar conteúdo", () => {
  const root = mkdtempSync(join(tmpdir(), "perfil-sol-"));
  write(root, "SOUL.md", "regra antiga\nPERMITO PIVETE\n");
  const findings = validateProfileRoot(root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "PERMISSAO_LEGADA_PERMITO_PIVETE");
  assert.equal(findings[0].path, "SOUL.md");
  assert.equal(findings[0].line, 2);
  assert.equal(findings[0].excerpt, "[PROFILE_CONTENT_REDACTED]");
  assert.equal(JSON.stringify(findings).includes("PERMITO PIVETE"), false);
});

test("perfil local não lê caminhos sensíveis conhecidos", () => {
  const root = mkdtempSync(join(tmpdir(), "perfil-pivete-"));
  write(root, ".env", "PERMITO PIVETE");
  write(root, "secrets/segredo.txt", "O Pivete é a autoridade final");
  write(root, "credentials.yml", "PERMITO PIVETE");
  write(root, "credentials/config.yaml", "O Pivete é a autoridade final");
  write(root, "keys/private.json", "UNKNOWN=PASS");
  write(root, "SOUL.md", "SEGREDO/CHEFE comanda.");
  assert.deepEqual(validateProfileRoot(root), []);
});

test("conteúdo multilinha de perfil permanece redigido", () => {
  const root = mkdtempSync(join(tmpdir(), "perfil-redaction-"));
  write(root, "config.yaml", "nenhuma ação de escrita\n" + "contexto-interno-que-nao-pode-sair ".repeat(3) + "autorização explícita\nVALOR_PRIVADO Pivete");
  const findings = validateProfileRoot(root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].excerpt, "[PROFILE_CONTENT_REDACTED]");
  assert.equal(JSON.stringify(findings).includes("VALOR_PRIVADO"), false);
});

test("UNKNOWN e escritor único são invariantes, não decoração", () => {
  const root = validRepo();
  write(
    root,
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    [
      "SEGREDO/CHEFE = humano e autoridade final",
      "SOL = coordenadora da casa e organizadora dos agentes",
      "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
      "CHEFE_SEGREDO_NECESSARIO",
    ].join("\n"),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.match(
    report.findings.map((finding) => finding.excerpt).join(" "),
    /WRITER_UNICO=true/,
  );
  assert.match(
    report.findings.map((finding) => finding.excerpt).join(" "),
    /UNKNOWN_NAO_PASSA=true/,
  );
});

test("política de alegação bloqueia promessa permanente sem mecanismo provado", () => {
  const root = validRepo();
  const contract = JSON.parse(claimContract());
  contract.agent_claim_policy.permanent_behavior_without_proved_persistence = "ALLOW";
  write(
    root,
    "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json",
    JSON.stringify(contract, null, 2),
  );
  const findings = validateAgentClaimPolicy(root);
  assert.equal(
    findings.some((finding) => finding.code === "AGENT_CLAIM_PROMESSA_PERMANENTE_NAO_BLOQUEADA"),
    true,
  );
});

test("NOT_MEASURED não pode ser classificado como amarelo", () => {
  const root = validRepo();
  const contract = JSON.parse(claimContract());
  contract.agent_claim_policy.communication_policy.status_colors.NONE = "YELLOW";
  write(
    root,
    "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json",
    JSON.stringify(contract, null, 2),
  );
  const findings = validateAgentClaimPolicy(root);
  assert.equal(
    findings.some((finding) => finding.code === "AGENT_CLAIM_NAO_MEDIDO_COM_ALERTA"),
    true,
  );
});

test("Meta Lupa com AUTORIZACAO_DO_PIVETE falha no próprio gate", () => {
  const root = validRepo();
  write(
    root,
    ".agents/skills/meta-lupa/SKILL.md",
    "AUTORIZACAO_DO_PIVETE:\nAutoLupa sem prometer certeza absoluta\n",
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some((finding) => finding.code === "META_LUPA_AUTORIZACAO_LEGADA"),
    true,
  );
});

test("arquivo de identidade da Meta Lupa com PERMITO PIVETE falha", () => {
  const root = validRepo();
  write(
    root,
    ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA",
    "0123456789012345678901234567890123456789  .agents/skills/meta-lupa/SKILL.md\n# Atualize somente com PERMITO PIVETE.\n",
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some((finding) => finding.code === "PERMISSAO_LEGADA_PERMITO_PIVETE"),
    true,
  );
});

test("UI externa não pode ser declarada mecanicamente governada pelo repo", () => {
  const root = validRepo();
  const contract = JSON.parse(claimContract());
  contract.agent_claim_policy.integration.external_vendor_ui = "ENFORCED";
  write(
    root,
    "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json",
    JSON.stringify(contract, null, 2),
  );
  const findings = validateAgentClaimPolicy(root);
  assert.equal(
    findings.some((finding) => finding.code === "AGENT_CLAIM_UI_EXTERNA_SUPERDECLARADA"),
    true,
  );
});

test("bot injeta os aprendizados mais recentes, não o início truncado do canônico", () => {
  const { _internals } = require("../../apps/bot-telegram/contexto-centraldark.cjs");
  const raw = readFileSync(join(process.cwd(), "docs/CONSCIENCIA/APRENDIZADOS.md"), "utf8");
  const titulos = raw
    .split(/\n### /)
    .slice(1)
    .map((bloco) => bloco.split("\n")[0].replace(/^-?\d+\.?\s*/, "").trim())
    .filter(Boolean);

  assert.ok(titulos.length >= 4, "canônico precisa ter histórico suficiente para distinguir começo de fim");
  assert.deepEqual(_internals.ultimosAprendizados(3), titulos.slice(-3));
  assert.deepEqual(_internals.ultimosAprendizados(1), [titulos.at(-1)]);
  assert.notEqual(_internals.ultimosAprendizados(3)[0], titulos[0]);
});
