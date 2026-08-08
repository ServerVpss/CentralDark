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

const PORTABILITY = [
  "MODEL_IS_REPLACEABLE=true",
  "WRITER_ROLE_IS_NOT_MODEL=true",
  "ONE_WRITER_PER_SCOPE=true",
  "CHIEF_ORDER_CAN_TRIGGER_HANDOFF=true",
  "WRITER_UNAVAILABLE_DOES_NOT_BLOCK_MISSION=true",
  "DETERMINISTIC_FIRST=true",
  "AI_FALLBACK_BY_CAPABILITY=true",
  "UNKNOWN_NEVER_PASS=true",
];

const UNKNOWN_PROGRESS = [
  "UNKNOWN_NAO_ESTACIONA=true",
  "UNKNOWN_SELF_LOOP=FORBIDDEN",
  "UNKNOWN_TRANSITIONS=TESTE|FATO|FAIL|BLOCKED|CHEFE_SEGREDO_NECESSARIO",
  "CHEFE_NAO_CARREGA_CARGA_DA_PROVA=true",
  "CHEFE_NAO_E_OBJETO_DA_PROVA=true",
  "IA_PROVA_SUAS_PROPRIAS_AFIRMACOES=true",
  "IA_PROVA_SEU_PROPRIO_TRABALHO=true",
];

function write(root, path, content) {
  const absolute = join(root, path);
  mkdirSync(join(absolute, ".."), { recursive: true });
  writeFileSync(absolute, content, "utf8");
}

function jeitoCorreto(overrides = {}) {
  const tokens = [
    "SEGREDO/CHEFE = humano e autoridade final",
    "SOL = coordenadora da casa e organizadora dos agentes",
    "PIVETE/HERMES = mordomo de casa, executor e guardião da continuidade",
    "WRITER_UNICO=true",
    "UNKNOWN_NAO_PASSA=true",
    ...UNKNOWN_PROGRESS,
    "CHEFE_SEGREDO_NECESSARIO",
  ];
  const remove = new Set(overrides.remove || []);
  return tokens.filter((token) => !remove.has(token)).join("\n");
}

function validRepo() {
  const root = mkdtempSync(join(tmpdir(), "centraldark-identidade-"));
  write(
    root,
    "LEIA-ME-IA.md",
    [
      "SEGREDO/CHEFE COMANDA",
      "SOL ORGANIZA",
      "PIVETE/HERMES PRESERVA E EXECUTA",
      ...PORTABILITY,
    ].join("\n"),
  );
  write(
    root,
    "AGENTS.md",
    [
      "existe somente um escritor por escopo",
      "SEGREDO/CHEFE permanece autoridade humana final",
      "SOL coordena, PIVETE/HERMES preserva e executa",
      "CAPTURE → SANITIZE + HASH → DECIDE → APPLY → JUDGE → CHEFE → RECEIPT + LEARNING → LOOP",
      ...PORTABILITY,
    ].join("\n"),
  );
  write(root, "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md", jeitoCorreto());
  write(
    root,
    "docs/CONSCIENCIA/DICIONARIO-PIVETE-GITHUB.md",
    "SEGREDO/CHEFE = humano e autoridade final\nPIVETE = Hermes treinado\n",
  );
  write(
    root,
    "docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md",
    [
      "WRITER_ROLE",
      "WRITER_SCOPE",
      "WRITER_INSTANCE",
      "MODEL_IS_REPLACEABLE=true",
      "WRITER_UNAVAILABLE_DOES_NOT_BLOCK_MISSION=true",
      "CHIEF_ORDER_CAN_TRIGGER_HANDOFF=true",
    ].join("\n"),
  );
  return root;
}

test("contrato canônico válido passa", () => {
  const report = runValidation({ repoRoot: validRepo() });
  assert.equal(report.ok, true);
  assert.deepEqual(report.findings, []);
  assert.equal(report.model_rule, "MODEL_IS_REPLACEABLE");
  assert.equal(report.fallback_rule, "AI_FALLBACK_BY_CAPABILITY");
  assert.equal(report.unknown_rule, "UNKNOWN_NAO_PASSA+UNKNOWN_NAO_ESTACIONA");
  assert.equal(report.proof_rule, "IA_PROVA_SUAS_PROPRIAS_AFIRMACOES_E_TRABALHO");
});

test("atribuir autoridade final ao Pivete falha com caminho e linha", () => {
  const findings = findForbidden("linha 1\nO Pivete é a autoridade final sobre merge.");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "PIVETE_COMO_AUTORIDADE_FINAL");
  assert.equal(findings[0].line, 2);
});

test("model lock explícito é conflito canônico", () => {
  const findings = findForbidden("MODEL_LOCK=TRUE");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "MODEL_LOCK_ATIVO");
});

test("modelo comercial não pode virar autoridade", () => {
  const findings = findForbidden("GPT-5.5 = AUTORIDADE_FINAL");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "MODELO_COMO_AUTORIDADE");
});

test("portabilidade ausente bloqueia o canônico", () => {
  const root = validRepo();
  write(
    root,
    "LEIA-ME-IA.md",
    [
      "SEGREDO/CHEFE COMANDA",
      "SOL ORGANIZA",
      "PIVETE/HERMES PRESERVA E EXECUTA",
      ...PORTABILITY.filter((token) => token !== "MODEL_IS_REPLACEABLE=true"),
    ].join("\n"),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some(
      (finding) => finding.path === "LEIA-ME-IA.md" && finding.excerpt === "MODEL_IS_REPLACEABLE=true",
    ),
    true,
  );
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
      ...PORTABILITY,
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
      ...PORTABILITY,
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

test("UNKNOWN_NAO_PASSA sozinho não satisfaz não-estacionamento", () => {
  const root = validRepo();
  write(
    root,
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    jeitoCorreto({ remove: ["UNKNOWN_NAO_ESTACIONA=true"] }),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(
    report.findings.some(
      (finding) =>
        finding.path === "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md" &&
        finding.excerpt === "UNKNOWN_NAO_ESTACIONA=true",
    ),
    true,
  );
});

test("contrato de transição UNKNOWN ausente bloqueia", () => {
  const root = validRepo();
  const token = "UNKNOWN_TRANSITIONS=TESTE|FATO|FAIL|BLOCKED|CHEFE_SEGREDO_NECESSARIO";
  write(
    root,
    "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
    jeitoCorreto({ remove: [token] }),
  );
  const report = runValidation({ repoRoot: root });
  assert.equal(report.ok, false);
  assert.equal(report.findings.some((finding) => finding.excerpt === token), true);
});

test("UNKNOWN não pode declarar self-loop", () => {
  const findings = findForbidden("UNKNOWN -> UNKNOWN");
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "UNKNOWN_SELF_LOOP_DECLARADO");
});

test("carga de prova permanece no organismo", () => {
  for (const token of [
    "CHEFE_NAO_CARREGA_CARGA_DA_PROVA=true",
    "CHEFE_NAO_E_OBJETO_DA_PROVA=true",
    "IA_PROVA_SUAS_PROPRIAS_AFIRMACOES=true",
    "IA_PROVA_SEU_PROPRIO_TRABALHO=true",
  ]) {
    const root = validRepo();
    write(
      root,
      "docs/CONSCIENCIA/JEITO-CORRETO-DO-PIVETE.md",
      jeitoCorreto({ remove: [token] }),
    );
    const report = runValidation({ repoRoot: root });
    assert.equal(report.ok, false);
    assert.equal(report.findings.some((finding) => finding.excerpt === token), true);
  }
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
  assert.match(
    report.findings.map((finding) => finding.excerpt).join(" "),
    /UNKNOWN_NAO_ESTACIONA=true/,
  );
  assert.match(
    report.findings.map((finding) => finding.excerpt).join(" "),
    /IA_PROVA_SEU_PROPRIO_TRABALHO=true/,
  );
});
