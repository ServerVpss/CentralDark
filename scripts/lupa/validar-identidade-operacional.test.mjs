import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  findForbidden,
  runValidation,
  validateProfileRoot,
  validateRequiredTokens,
} from "./validar-identidade-operacional.mjs";

function write(root, path, content) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function validRepo() {
  const root = mkdtempSync(join(tmpdir(), "centraldark-identidade-"));
  write(root, "LEIA-ME-IA.md", "SEGREDO/CHEFE COMANDA\nSOL ORGANIZA\nPIVETE/HERMES PRESERVA E EXECUTA\n");
  write(root, "AGENTS.md", [
    "existe somente um escritor por escopo",
    "SEGREDO/CHEFE permanece autoridade humana final",
    "SOL coordena, PIVETE/HERMES preserva e executa",
    "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
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

test("PIVETE COMANDA em superfície operacional ativa é regressão", () => {
  const root = validRepo();
  write(root, "CODEX.md", "PIVETE COMANDA.\n");
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((f) => f.path === "CODEX.md" && f.code === "PIVETE_COMANDA_LEGADO_ATIVO"), true);
});

test("Pivete como orquestrador humano é regressão", () => {
  const findings = findForbidden("Pivete é o orquestrador. Ele define a decisão final.");
  assert.equal(findings.some((f) => f.code === "PIVETE_ORQUESTRADOR_HUMANO"), true);
});

test("AGENTS conflitante com LEIA-ME-IA bloqueia", () => {
  const root = validRepo();
  write(root, "AGENTS.md", [
    "existe somente um escritor por escopo",
    "SEGREDO/CHEFE permanece autoridade humana final",
    "SOL coordena, PIVETE/HERMES preserva e executa",
    "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
    "O Pivete é a autoridade final.",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((finding) => finding.path === "AGENTS.md" && finding.code === "PIVETE_COMO_AUTORIDADE_FINAL"), true);
});

test("UNKNOWN=PASS é conflito canônico", () => {
  const root = validRepo();
  write(root, "AGENTS.md", [
    "existe somente um escritor por escopo",
    "SEGREDO/CHEFE permanece autoridade humana final",
    "SOL coordena, PIVETE/HERMES preserva e executa",
    "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
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
  write(root, "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md", [
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = coordenadora da casa e organizadora dos agentes",
    "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
    "CHEFE_SEGREDO_NECESSARIO",
  ].join("\n"));
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.match(report.findings.map((finding) => finding.excerpt).join(" "), /WRITER_UNICO=true/);
  assert.match(report.findings.map((finding) => finding.excerpt).join(" "), /UNKNOWN_NAO_PASSA=true/);
});
