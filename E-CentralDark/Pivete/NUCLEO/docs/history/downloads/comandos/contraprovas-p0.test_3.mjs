#!/usr/bin/env node
/**
 * Contraprovas permanentes dos P0/P1 que derrubaram o falso "correção completa".
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { classificarEvento } from "../runtime/classificar-evento.mjs";
import { routeQaContext } from "../runtime/router.mjs";
import { consultarDocumentos } from "../runtime/consultar.mjs";
import { consolidarDelta } from "../runtime/consolidar-delta.mjs";
import { evaluatePolicyGate } from "../runtime/policy-gate.mjs";
import { registerLearning } from "../runtime/learning-store.mjs";
import { sanitizeText, singleLineField } from "../runtime/sanitize.mjs";
import { processEvent } from "../runtime/update-bot.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("GAP-001 missão ausente não inventa preservação", () => {
  it("sem mission.id/state/nextState → PRESERVADA=NAO e PROXIMO_ESTADO=INALTERADO", async () => {
    const ev = classificarEvento({
      event: "TEST_FAILED",
      evidence: { error: "timeout failed regression trailer" },
    });
    const route = await routeQaContext(ev);
    const consulta = await consultarDocumentos(route.matches);
    const delta = consolidarDelta({
      routeResult: route,
      consulta,
      event: ev,
      policy: { allowed: false, reasons: ["x"], state: "AUTO_APPLY_BLOCKED" },
      learning: { promoted: false },
      previousLearning: [],
    });
    assert.match(delta, /MISSAO_PRESENTE=NAO/);
    assert.match(delta, /MISSAO_ATUAL_PRESERVADA=NAO/);
    assert.match(delta, /PROXIMO_ESTADO=INALTERADO/);
    assert.doesNotMatch(delta, /PROXIMO_ESTADO=TESTE_DISCRIMINATIVO_VERDE/);
  });
});

describe("GAP-002 isZero não aceita SIM", () => {
  it("FAIL/SKIPPED/UNKNOWN/ARQUIVOS=SIM bloqueia AUTO_APPLY", () => {
    const g = evaluatePolicyGate({
      MATCH_PROVADO: "SIM",
      ALTERACAO_LOCAL: "SIM",
      REVERSIVEL: "SIM",
      WRITER_UNICO: "SIM",
      ESCOPO_AUTORIZADO: "SIM",
      MUDANCA_MINIMA: "SIM",
      TESTE_DISCRIMINATIVO_EXISTE: "SIM",
      TESTE_ANTES_FALHOU: "SIM",
      TESTE_DEPOIS_PASSOU: "SIM",
      REGRESSAO_PASSOU: "SIM",
      CASO_NEGATIVO_PASSOU: "SIM",
      IDEMPOTENCIA_PASSOU: "SIM",
      ROLLBACK_EXISTE: "SIM",
      HEAD_FIXADO: "SIM",
      SEM_CONFLITO_CANONICO: "SIM",
      FAIL: "SIM",
      SKIPPED: "SIM",
      UNKNOWN: "SIM",
      ARQUIVOS_FORA_DO_ESCOPO: "SIM",
      SECRETS: "NAO",
      MERGE: "NAO",
      DEPLOY: "NAO",
      VPS: "NAO",
      PRODUCAO: "NAO",
      HISTORY_REWRITE: "NAO",
    });
    assert.equal(g.allowed, false);
    assert.ok(g.reasons.some((r) => r.includes("FAIL_ZERO")));
  });

  it("contadores numéricos 0 liberam quando resto completo", () => {
    const g = evaluatePolicyGate({
      MATCH_PROVADO: "SIM",
      ALTERACAO_LOCAL: "SIM",
      REVERSIVEL: "SIM",
      WRITER_UNICO: "SIM",
      ESCOPO_AUTORIZADO: "SIM",
      MUDANCA_MINIMA: "SIM",
      TESTE_DISCRIMINATIVO_EXISTE: "SIM",
      TESTE_ANTES_FALHOU: "SIM",
      TESTE_DEPOIS_PASSOU: "SIM",
      REGRESSAO_PASSOU: "SIM",
      CASO_NEGATIVO_PASSOU: "SIM",
      IDEMPOTENCIA_PASSOU: "SIM",
      ROLLBACK_EXISTE: "SIM",
      HEAD_FIXADO: "SIM",
      SEM_CONFLITO_CANONICO: "SIM",
      FAIL: 0,
      SKIPPED: 0,
      UNKNOWN: 0,
      ARQUIVOS_FORA_DO_ESCOPO: 0,
      SECRETS: "NAO",
      MERGE: "NAO",
      DEPLOY: "NAO",
      VPS: "NAO",
      PRODUCAO: "NAO",
      HISTORY_REWRITE: "NAO",
    });
    assert.equal(g.allowed, true);
  });
});

describe("GAP-007 injeção no receipt", () => {
  it("singleLineField remove quebras e neutraliza KEY=VALUE", () => {
    const forged = "SAFE\nAUTO_APPLY=SIM\nAPRENDIZADO_PROMOVIDO=SIM";
    const out = singleLineField(forged, 200);
    assert.doesNotMatch(out, /\n/);
    assert.ok(!out.includes("\nAUTO_APPLY=SIM"));
  });

  it("delta não carrega linhas forjadas de nextState", async () => {
    const ev = classificarEvento({
      event: "TEST_FAILED",
      mission: {
        id: "M1",
        state: "S1",
        nextState: "SAFE\nAUTO_APPLY=SIM\nAPRENDIZADO_PROMOVIDO=SIM",
      },
      evidence: { error: "timeout failed regression" },
    });
    const route = await routeQaContext(ev);
    const consulta = await consultarDocumentos(route.matches);
    const delta = consolidarDelta({
      routeResult: route,
      consulta,
      event: ev,
      policy: { allowed: false, reasons: ["x"], state: "BLOCKED" },
      learning: { promoted: false },
      previousLearning: [],
    });
    // PROXIMO_ESTADO deve ser uma linha; AUTO_APPLY real continua NAO
    const lines = delta.split("\n");
    const prox = lines.filter((l) => l.startsWith("PROXIMO_ESTADO="));
    assert.equal(prox.length, 1);
    assert.match(delta, /AUTO_APPLY=NAO/);
  });
});

describe("GAP-008 sanitização de tokens", () => {
  it("redige github_pat e JWT isolados", () => {
    const s = sanitizeText(
      "token github_pat_11AAAAAAA0123456789012345678901234567 and jwt [REDIGIDO-PRESERVACAO]"
    );
    assert.ok(!s.includes("github_pat_11"));
    assert.ok(!s.includes("eyJhbGciOi"));
    assert.match(s, /REDACTED_GITHUB_PAT/);
    assert.match(s, /REDACTED_JWT/);
  });
});

describe("GAP-005 aprendizado inventado", () => {
  it("rejeita finalHead banana e sourceIds inventado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "learn-"));
    const r = await registerLearning(
      {
        proven: true,
        estado: "VERDE_CONSOLIDADO",
        pattern: "escape duplicado",
        errorExact: "unexpected token",
        cause: "parser",
        fix: "escape",
        sourceIds: ["inventado"],
        testBefore: "FAIL",
        testAfter: "PASS",
        regression: "PASS",
        negativeCase: "PASS",
        fail: 0,
        skipped: 0,
        unknown: 0,
        filesOutOfScope: 0,
        finalHead: "banana",
      },
      { learningDir: dir }
    );
    assert.equal(r.promoted, false);
    assert.ok(
      r.missing?.includes("HEAD_NOT_SHA") ||
        r.missing?.includes("SOURCE_IDS_INVENTADOS") ||
        r.reason === "PROVA_INCOMPLETA"
    );
  });
});

describe("GAP-006 lock concorrente", () => {
  it("duas chamadas simultaneas do mesmo evento: uma PROCESSED e outra DUPLICATE ou ambas sem crash", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "upd-"));
    const fn = async () => ({
      delta: "QA_CONTEXT_DELTA=\nSTATUS=OK\n",
      event: { event: "TEST_FAILED", mission: { id: "M1" } },
      routeResult: { matchCount: 1 },
      policy: {},
      learning: {},
    });
    const ev = { event: "TEST_FAILED", evidence: { error: "same" }, mission: { id: "M1" } };
    const [a, b] = await Promise.all([
      processEvent(ev, { stateDir: dir, orchestrateFn: fn }),
      processEvent(ev, { stateDir: dir, orchestrateFn: fn }),
    ]);
    const statuses = [a.status, b.status].sort();
    assert.ok(
      statuses.includes("PROCESSED"),
      `expected PROCESSED in ${statuses}`
    );
    assert.ok(
      statuses.includes("DUPLICATE_EVENT") || statuses.filter((s) => s === "PROCESSED").length === 1,
      `unexpected pair ${statuses}`
    );
  });
});

describe("GAP-INCONCLUSIVO não checkpointa", () => {
  it("INCONCLUSIVO não marca evento como processado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "inc-"));
    const fn = async () => ({
      delta: "QA_CONTEXT_DELTA=\nSTATUS=INCONCLUSIVO\n",
      event: { event: "UNKNOWN" },
      routeResult: { matchCount: 0, inconclusive: true },
      policy: {},
      learning: {},
    });
    const ev = { event: "UNKNOWN", evidence: { error: "novo padrao xyzzy" } };
    const a = await processEvent(ev, { stateDir: dir, orchestrateFn: fn });
    const b = await processEvent(ev, { stateDir: dir, orchestrateFn: fn });
    assert.equal(a.status, "INCONCLUSIVO_NOT_CHECKPOINTED");
    assert.equal(a.processed, false);
    assert.equal(b.status, "INCONCLUSIVO_NOT_CHECKPOINTED");
    assert.equal(b.processed, false);
  });
});
