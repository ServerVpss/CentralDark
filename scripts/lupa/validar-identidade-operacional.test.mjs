import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
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
  return root;
}

test("contrato canônico válido passa", () => {
  const report = runValidation({ repoRoot: validRepo() });
  assert.equal(report.ok, true);
  assert.deepEqual(report.findings, []);
});

test("atribuir autoridade final ao Pivete falha com caminho e linha", () => {
  const findings = findForbidden("linha 1\nO Pivete é a autoridade final sobre merge.");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "PIVETE_COMO_AUTORIDADE_FINAL");
  assert.equal(findings[0].line, 2);
});

test("AGENTS conflitante com LEIA-ME-IA bloqueia", () => {
  const root = validRepo();
  write(
    root,
    "AGENTS.md",
    [
      "existe somente um escritor por escopo",
      "SEGREDO/CHEFE permanece autoridade humana final",
      "SOL coordena, PIVETE/HERMES preserva e executa",
      "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
      "O Pivete é a autoridade final.",
    ].join("\n"),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some(
      (finding) => finding.path === "AGENTS.md" && finding.code === "PIVETE_COMO_AUTORIDADE_FINAL",
    ),
    true,
  );
});

test("UNKNOWN=PASS é conflito canônico", () => {
  const root = validRepo();
  write(
    root,
    "AGENTS.md",
    [
      "existe somente um escritor por escopo",
      "SEGREDO/CHEFE permanece autoridade humana final",
      "SOL coordena, PIVETE/HERMES preserva e executa",
      "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
      "UNKNOWN=PASS",
    ].join("\n"),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some((finding) => finding.code === "UNKNOWN_CONVERTIDO_EM_PASS"),
    true,
  );
});

test("token obrigatório ausente não vira verde", () => {
  const findings = validateRequiredTokens("SEGREDO/CHEFE = humano e autoridade final", [
    "WRITER_UNICO=true",
  ]);
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
  write(
    root,
    "config.yaml",
    "nenhuma ação de escrita\n" +
      "contexto-interno-que-nao-pode-sair ".repeat(3) +
      "autorização explícita\nVALOR_PRIVADO Pivete",
  );
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
