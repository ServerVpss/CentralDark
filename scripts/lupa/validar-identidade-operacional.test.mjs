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
  write(
    root,
    "LEIA-ME-IA.md",
    "SEGREDO/CHEFE COMANDA\nSOL ORGANIZA\nPIVETE/HERMES PRESERVA E EXECUTA\n",
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

test("token obrigatório ausente não vira verde", () => {
  const findings = validateRequiredTokens("SEGREDO/CHEFE = humano e autoridade final", [
    "WRITER_UNICO=true",
  ]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "TOKEN_DE_IDENTIDADE_AUSENTE");
});

test("perfil local com PERMITO PIVETE é apontado exatamente", () => {
  const root = mkdtempSync(join(tmpdir(), "perfil-sol-"));
  write(root, "SOUL.md", "regra antiga\nPERMITO PIVETE\n");
  const findings = validateProfileRoot(root);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "PERMISSAO_LEGADA_PERMITO_PIVETE");
  assert.equal(findings[0].path, "SOUL.md");
  assert.equal(findings[0].line, 2);
});

test("perfil local não lê caminho sensível", () => {
  const root = mkdtempSync(join(tmpdir(), "perfil-pivete-"));
  write(root, ".env", "PERMITO PIVETE");
  write(root, "secrets/segredo.txt", "O Pivete é a autoridade final");
  write(root, "SOUL.md", "SEGREDO/CHEFE comanda.");
  assert.deepEqual(validateProfileRoot(root), []);
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
