#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { orchestrate, selfMap } from "../runtime/orchestrator.mjs";
import { registerLearning } from "../runtime/learning-store.mjs";
import { processEvent } from "../runtime/update-bot.mjs";

const EVENT = {
  event: "TEST_FAILED",
  mission: { id: "RECUPERAR_E_FINALIZAR_PR664", state: "INVARIAVEL", nextState: "TESTE_DISCRIMINATIVO_VERDE" },
  workspace: { path: "E:/wt", branch: "fix/x", head: "94e53e97856bc93e0f5c96aafbb4d08685fd5a92" },
  evidence: { command: "node --test", exitCode: 1, error: "trailer no rodapé não foi reconhecido", changedFiles: ["validator.mjs"] },
};

function fullLearning() {
  return {
    proven: true, estado: "VERDE_CONSOLIDADO", pattern: "trailer rodapé não reconhecido",
    errorExact: "writer null", cause: "escape duplicado", fix: "restaurar regex",
    sourceIds: ["s1", "t1"], testBefore: { status: "FAIL" }, testAfter: { status: "PASS" },
    regression: { status: "PASS" }, negativeCase: { status: "PASS" }, fail: 0, skipped: 0,
    unknown: 0, filesOutOfScope: 0, finalHead: "abc123", reversible: true,
  };
}

describe("orquestrador e atualização entre sessões", () => {
  it("duas execuções iguais preservam o mesmo delta estrutural", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learn-"));
    const a = await orchestrate(EVENT, { learningDir: dir });
    const b = await orchestrate(EVENT, { learningDir: dir });
    assert.deepEqual(a.routeResult.matches, b.routeResult.matches);
    assert.equal(a.event.mission.id, b.event.mission.id);
    assert.match(a.delta, /MISSAO_ATUAL_PRESERVADA=SIM/);
  });

  it("não chama Enxame em falha comum", async () => {
    let calls = 0;
    await orchestrate(EVENT, { enxameRunner: async () => { calls++; return { status: "OK" }; } });
    assert.equal(calls, 0);
  });

  it("chama Enxame somente quando explicitamente solicitado", async () => {
    let calls = 0;
    const result = await orchestrate({ ...EVENT, event: "ENXAME_REQUEST" }, {
      enxameRunner: async () => { calls++; return { status: "ENXAME_UNAVAILABLE", veredito: null, sourcesUsed: [] }; },
    });
    assert.equal(calls, 1);
    assert.match(result.delta, /ENXAME_STATUS=ENXAME_UNAVAILABLE/);
  });

  it("SESSION_RESUME reutiliza aprendizado comprovado", async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learn-"));
    await registerLearning(fullLearning(), { learningDir: dir });
    const result = await orchestrate({
      event: "SESSION_RESUME",
      mission: { id: "M2", state: "RETOMADA", nextState: "CONTINUAR" },
      evidence: { error: "trailer rodapé escape duplicado" },
    }, { learningDir: dir });
    assert.ok(result.previousLearning.length >= 1);
    assert.match(result.delta, /APRENDIZADO_REUTILIZADO=SIM/);
  });

  it("Bot processa evento uma vez e deduplica na segunda sessão", async () => {
    const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-bot-"));
    const learningDir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-learning-"));
    const first = await processEvent(EVENT, { stateDir, learningDir });
    const second = await processEvent(EVENT, { stateDir, learningDir });
    assert.equal(first.status, "PROCESSED");
    assert.equal(second.status, "DUPLICATE_EVENT");
    assert.equal(first.eventId, second.eventId);
  });

  it("evento bloqueado não avança checkpoint e pode ser tentado de novo", async () => {
    const stateDir = await fs.mkdtemp(path.join(os.tmpdir(), "qa-bot-block-"));
    const blockedFn = async () => ({
      delta: "QA_CONTEXT_DELTA=\nSTATUS=BLOCKED_CONTEXT_LOAD",
      event: EVENT, routeResult: {}, policy: {}, learning: {},
    });
    const first = await processEvent(EVENT, { stateDir, orchestrateFn: blockedFn });
    const second = await processEvent(EVENT, { stateDir, orchestrateFn: blockedFn });
    assert.equal(first.status, "BLOCKED_NOT_CHECKPOINTED");
    assert.equal(second.status, "BLOCKED_NOT_CHECKPOINTED");
    assert.equal(first.processed, false);
  });

  it("self-map do pacote está sincronizado", async () => {
    const report = await selfMap({ apply: false });
    assert.equal(report.status, "SYNCED");
    assert.deepEqual(report.missing, []);
  });

  it("self-map aplica documento novo sem duplicar ID", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "qa-map-"));
    await fs.mkdir(path.join(root, "01-KIT"), { recursive: true });
    await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify([
      { id: "guia", name: "Guia", path: "01-KIT/guia.md", triggers: ["guia"], priority: 1 },
    ]));
    await fs.writeFile(path.join(root, "01-KIT", "guia.md"), "# Guia\n");
    await fs.writeFile(path.join(root, "01-KIT", "guia-novo.md"), "# Guia Novo de Mutação\n");
    const dry = await selfMap({ root, apply: false });
    assert.equal(dry.status, "DRIFT");
    const applied = await selfMap({ root, apply: true });
    assert.equal(applied.status, "SYNCED_AFTER_APPLY");
    const manifest = JSON.parse(await fs.readFile(path.join(root, "manifest.json"), "utf8"));
    assert.equal(new Set(manifest.map((entry) => entry.id)).size, manifest.length);
  });
});
