#!/usr/bin/env node
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { routeQaContext } from "../runtime/router.mjs";
import { consultarDocumentos } from "../runtime/consultar.mjs";
import { consolidarDelta } from "../runtime/consolidar-delta.mjs";
import { classificarEvento } from "../runtime/classificar-evento.mjs";
import { sanitizeText } from "../runtime/sanitize.mjs";

describe("consulta seletiva — progressive disclosure real", () => {
  it("carrega no máximo 3 documentos únicos", async () => {
    const event = classificarEvento({ event: "TEST_FAILED", evidence: { error: "timeout regression parser checkpoint" } });
    const route = await routeQaContext(event);
    const duplicate = route.matches[0] ? [...route.matches, { ...route.matches[0], id: "duplicado" }] : route.matches;
    const consulta = await consultarDocumentos(duplicate, ["timeout", "parser"]);
    assert.ok(consulta.loaded <= 3);
    assert.equal(new Set(consulta.documents.map((doc) => doc.path)).size, consulta.documents.length);
  });

  it("retorna janela relevante e limitada", async () => {
    const event = classificarEvento({ event: "STATE_TRANSITION_ERROR", evidence: { error: "checkpoint missão próximo estado" } });
    const route = await routeQaContext(event);
    const consulta = await consultarDocumentos(route.matches, ["checkpoint", "missão", "estado"], { maxCharsPerDoc: 900 });
    assert.ok(consulta.loaded >= 1);
    assert.ok(consulta.documents.every((doc) => !doc.content || doc.content.length <= 915));
    assert.ok(consulta.documents.some((doc) => doc.selectionMode === "KEYWORD_WINDOWS"));
  });

  it("path traversal é bloqueado sem ler arquivo externo", async () => {
    const consulta = await consultarDocumentos([{ id: "x", name: "X", path: "../segredo.md", score: 10 }], ["x"]);
    assert.equal(consulta.loaded, 0);
    assert.equal(consulta.refused, "ALL_READS_FAILED");
    assert.match(consulta.errors[0].error, /TRAVERSAL/);
  });

  it("falha de leitura não vira STATUS=OK", () => {
    const delta = consolidarDelta({
      routeResult: { event: "TEST_FAILED", matchCount: 1, matches: [{ id: "failure" }], inconclusive: false },
      consulta: { loaded: 0, documents: [], errors: [{ path: "ausente.md", error: "ENOENT" }] },
      event: { mission: { nextState: "S2" } },
      policy: { allowed: false },
    });
    assert.match(delta, /STATUS=BLOCKED_CONTEXT_LOAD/);
    assert.doesNotMatch(delta, /STATUS=OK/);
    assert.match(delta, /AUTO_APPLY=NAO/);
  });

  it("ausência de match retorna INCONCLUSIVO", async () => {
    const event = classificarEvento({ event: "NADA", evidence: { error: "qqqq_xyz" } });
    const route = await routeQaContext(event);
    const consulta = await consultarDocumentos(route.matches);
    const delta = consolidarDelta({ routeResult: route, consulta, event });
    assert.match(delta, /STATUS=INCONCLUSIVO/);
    assert.match(delta, /AUTO_APPLY=NAO/);
  });

  it("sanitizador preserva o nome do campo e remove o valor", () => {
    const clean = sanitizeText("api_key=[REDIGIDO-PRESERVACAO] token:abc123456789");
    assert.match(clean, /api_key=<REDACTED>/i);
    assert.match(clean, /token=<REDACTED>/i);
    assert.doesNotMatch(clean, /segredo-super|abc123/);
  });

  it("delta não expõe segredo trazido no erro", async () => {
    const event = classificarEvento({ event: "TEST_FAILED", evidence: { error: "Authorization: Bearer abcdefghijklmnopqrstuvwxyz" } });
    const route = await routeQaContext(event);
    const consulta = await consultarDocumentos(route.matches, ["authorization"]);
    const delta = consolidarDelta({ routeResult: route, consulta, event, policy: { allowed: false, state: "AUTO_APPLY_BLOCKED", reasons: [] } });
    assert.doesNotMatch(delta, /abcdefghijklmnopqrstuvwxyz/);
    assert.match(delta, /REDACTED/);
  });
});
