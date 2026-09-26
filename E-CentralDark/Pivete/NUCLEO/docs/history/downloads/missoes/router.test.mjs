#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { routeQaContext, scoreEntry, validateManifest, loadManifest } from "../runtime/router.mjs";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

describe("router — match real e manifest seguro", () => {
  it("seleciona heurística de falha e preserva missão", async () => {
    const result = await routeQaContext({
      event: "TEST_FAILED",
      evidence: { error: "trailer no rodapé não foi reconhecido", command: "node --test" },
      mission: { id: "PR664", state: "INVARIAVEL", nextState: "VERDE" },
      workspace: { path: "/tmp/wt", branch: "fix/x", head: "abc" },
    });
    assert.ok(result.matchCount > 0 && result.matchCount <= 3);
    assert.equal(result.inconclusive, false);
    assert.equal(result.mission.id, "PR664");
    assert.equal(result.workspace.head, "abc");
    assert.ok(result.matches.some((match) => match.id === "failure"));
    const clamped = await routeQaContext({ event: "TEST_FAILED", mission: { id: "M" }, evidence: { error: "timeout regression parser checkpoint" } }, { maxMatches: 99 });
    assert.ok(clamped.matchCount <= 3);
  });

  it("prioridade sozinha não inventa match — regressão do falso verde anterior", async () => {
    const result = await routeQaContext({ event: "XYZ_UNKNOWN_FOO_999", evidence: { error: "zzzzz_xyzzy" } });
    assert.equal(result.matchCount, 0);
    assert.equal(result.inconclusive, true);
  });

  it("score mantém prioridade apenas como desempate", () => {
    const noTrigger = scoreEntry({ triggers: ["timeout"], priority: 100 }, "texto sem correspondência");
    assert.equal(noTrigger.triggerScore, 0);
    const match = scoreEntry({ triggers: ["timeout"], priority: 1 }, "TIMEOUT no processo");
    assert.equal(match.triggerScore, 1);
    assert.ok(match.score > 10);
  });

  it("ordenação é determinística", async () => {
    const event = { event: "TEST_FAILED", evidence: { error: "timeout regression parser" } };
    const a = await routeQaContext(event);
    const b = await routeQaContext(event);
    assert.deepEqual(a.matches, b.matches);
    assert.equal(a.manifestHash, b.manifestHash);
  });

  it("manifest rejeita ID duplicado", () => {
    assert.throws(() => validateManifest([
      { id: "a", name: "A", path: "a.md", triggers: ["a"], priority: 1 },
      { id: "a", name: "B", path: "b.md", triggers: ["b"], priority: 1 },
    ]), /ID_DUPLICATE/);
    assert.throws(() => validateManifest([
      { id: "a", name: "A", path: "same.md", triggers: ["a"], priority: 1 },
      { id: "b", name: "B", path: "same.md", triggers: ["b"], priority: 1 },
    ]), /PATH_DUPLICATE/);
  });

  it("manifest rejeita path traversal", () => {
    assert.throws(() => validateManifest([
      { id: "a", name: "A", path: "../segredo.md", triggers: ["a"], priority: 1 },
    ]), /PATH_TRAVERSAL/);
  });

  it("loadManifest bloqueia documento indexado inexistente", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "qa-manifest-"));
    await fs.writeFile(path.join(root, "manifest.json"), JSON.stringify([
      { id: "ausente", name: "Ausente", path: "ausente.md", triggers: ["ausente"], priority: 1 },
    ]));
    await assert.rejects(() => loadManifest({ root }), /MANIFEST_TARGET_MISSING/);
  });

  it("manifest rejeita gatilho vazio", () => {
    assert.throws(() => validateManifest([
      { id: "a", name: "A", path: "a.md", triggers: [], priority: 1 },
    ]), /TRIGGERS_EMPTY/);
  });
});
