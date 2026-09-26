#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { evaluatePolicyGate } from "../runtime/policy-gate.mjs";
import {
  createEvidenceReceipt,
  registerLearning,
  loadLearningForPattern,
  validateLearningContract,
} from "../runtime/learning-store.mjs";

const HEAD = "94e53e97856bc93e0f5c96aafbb4d08685fd5a92";

function fullPolicy(overrides = {}) {
  return {
    MATCH_PROVADO: "SIM", ALTERACAO_LOCAL: "SIM", REVERSIVEL: "SIM", WRITER_UNICO: "SIM",
    ESCOPO_AUTORIZADO: "SIM", MUDANCA_MINIMA: "SIM", TESTE_DISCRIMINATIVO_EXISTE: "SIM",
    TESTE_ANTES_FALHOU: "SIM", TESTE_DEPOIS_PASSOU: "SIM", REGRESSAO_PASSOU: "SIM",
    CASO_NEGATIVO_PASSOU: "SIM", IDEMPOTENCIA_PASSOU: "SIM", ROLLBACK_EXISTE: "SIM",
    HEAD_FIXADO: "SIM", SEM_CONFLITO_CANONICO: "SIM", ARQUIVOS_FORA_ESCOPO_ZERO: 0,
    FAIL_ZERO: 0, SKIPPED_ZERO: 0, UNKNOWN_ZERO: 0,
    SECRETS: "NAO", MERGE: "NAO", DEPLOY: "NAO", VPS: "NAO", PRODUCAO: "NAO", HISTORY_REWRITE: "NAO",
    ...overrides,
  };
}

function fullLearning(overrides = {}) {
  return {
    proven: true,
    estado: "VERDE_CONSOLIDADO",
    pattern: "trailer de rodapé não reconhecido",
    errorExact: "parser retornou writer null",
    cause: "escape duplicado alterou a regex",
    fix: "restaurar escape real na regex existente",
    sourceIds: [`receipt:${"0".repeat(64)}`, `commit:${HEAD}`],
    testBefore: { status: "FAIL", exitCode: 1 },
    testAfter: { status: "PASS", exitCode: 0 },
    regression: { status: "PASS" },
    negativeCase: { status: "PASS" },
    fail: 0, skipped: 0, unknown: 0, filesOutOfScope: 0,
    finalHead: HEAD,
    rollback: "restaurar patch preservado",
    ...overrides,
  };
}

async function learningWithReceipt(dir, overrides = {}) {
  const record = fullLearning({ ...overrides, sourceIds: [] });
  const receipt = await createEvidenceReceipt(record, {
    command: "node --test",
    beforeExit: 1,
    afterExit: 0,
    regression: "PASS",
  }, { learningDir: dir });
  record.sourceIds = [receipt.id, `commit:${record.finalHead}`];
  return record;
}

describe("Policy Gate — todos os parafusos", () => {
  it("default bloqueia", () => assert.equal(evaluatePolicyGate({}).allowed, false));
  it("libera apenas contrato completo", () => assert.equal(evaluatePolicyGate(fullPolicy()).allowed, true));
  it("um único critério ausente bloqueia", () => {
    const result = evaluatePolicyGate(fullPolicy({ CASO_NEGATIVO_PASSOU: "NAO" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("CASO_NEGATIVO_PASSOU=NAO"));
  });
  it("área proibida bloqueia mesmo com provas verdes", () => {
    const result = evaluatePolicyGate(fullPolicy({ DEPLOY: "SIM" }));
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.some((reason) => reason.includes("DEPLOY")));
  });
  it("ausência de declaração SECRETS=NAO bloqueia", () => {
    const flags = fullPolicy();
    delete flags.SECRETS;
    const result = evaluatePolicyGate(flags);
    assert.equal(result.allowed, false);
    assert.ok(result.reasons.includes("SECRETS=DESCONHECIDO"));
  });

  it("UNKNOWN textual não é aceito como zero", () => {
    assert.equal(evaluatePolicyGate(fullPolicy({ UNKNOWN_ZERO: "UNKNOWN" })).allowed, false);
  });
});

describe("Learning Store — prova causal, recibo, dedupe e isolamento", () => {
  it("proven=true sozinho não promove — regressão do falso verde anterior", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning({ proven: true, pattern: "x", estado: "VERDE_CONSOLIDADO" }, { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "PROVA_INCOMPLETA");
    assert.ok(result.missing.includes("TESTE_ANTES_FAIL"));
  });

  it("ANTI_PADRAO nunca é promovido", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning({ estado: "ANTI_PADRAO" }), { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "TENTATIVA_VERMELHA");
  });

  it("contrato estrutural completo é válido", () => assert.equal(validateLearningContract(fullLearning()).valid, true));

  it("contadores ausentes não são tratados como zero", () => {
    const record = fullLearning();
    delete record.skipped;
    const result = validateLearningContract(record);
    assert.equal(result.valid, false);
    assert.ok(result.missing.includes("SKIPPED_ZERO"));
  });

  it("sourceId bem formatado sem recibo real não promove", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const result = await registerLearning(fullLearning(), { learningDir: dir });
    assert.equal(result.promoted, false);
    assert.equal(result.reason, "PROVENIENCIA_NAO_COMPROVADA");
  });

  it("promove e reutiliza por padrão causal com recibo content-addressed", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const record = await learningWithReceipt(dir);
    const result = await registerLearning(record, { learningDir: dir });
    assert.equal(result.promoted, true);
    const found = await loadLearningForPattern("escape duplicado regex trailer", { learningDir: dir });
    assert.equal(found.length, 1);
    assert.equal(found[0].id, result.id);
  });

  it("segunda promoção equivalente deduplica com o mesmo ID", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const record = await learningWithReceipt(dir);
    const [first, second] = await Promise.all([
      registerLearning(record, { learningDir: dir }),
      registerLearning(record, { learningDir: dir }),
    ]);
    assert.deepEqual(new Set([first.reason, second.reason]), new Set(["PROVA_COMPLETA", "EVENTO_JA_REGISTRADO"]));
    assert.equal(first.id, second.id);
    const files = (await fs.readdir(dir)).filter((name) => name.endsWith(".json"));
    assert.equal(files.length, 1);
  });

  it("aprendizado armazenado adulterado não é reutilizado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const record = await learningWithReceipt(dir);
    const result = await registerLearning(record, { learningDir: dir });
    const entry = JSON.parse(await fs.readFile(result.path, "utf8"));
    entry.cause = "causa adulterada depois da promoção";
    await fs.writeFile(result.path, `${JSON.stringify(entry, null, 2)}\n`, "utf8");
    assert.deepEqual(await loadLearningForPattern("escape duplicado", { learningDir: dir }), []);
  });

  it("lock antigo de processo ainda vivo não é roubado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const record = await learningWithReceipt(dir);
    const first = await registerLearning(record, { learningDir: dir });
    await fs.unlink(first.path);
    const lock = path.join(dir, ".locks", `${first.id}.lock`);
    await fs.mkdir(path.dirname(lock), { recursive: true });
    await fs.writeFile(lock, JSON.stringify({ pid: process.pid, ts: Date.now() - 60000 }));
    const old = new Date(Date.now() - 60000);
    await fs.utimes(lock, old, old);
    await assert.rejects(
      registerLearning(record, { learningDir: dir, lockOptions: { retries: 0, staleMs: 1 } }),
      /LEARNING_LOCK_TIMEOUT/
    );
  });

  it("arquivo corrompido não vira aprendizado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    await fs.writeFile(path.join(dir, "corrupt.json"), "{quebrado", "utf8");
    assert.deepEqual(await loadLearningForPattern("qualquer", { learningDir: dir }), []);
  });
});
