import assert from "node:assert/strict";
import test from "node:test";

import {
  WRITER_SLUG,
  evaluateWriters,
  looksLikeCredential,
  parseWriterTrailers,
} from "./validar-escritor-unico.mjs";

function commit(sha, message) {
  return { sha, message };
}

test("trailer no rodape e reconhecido", () => {
  const { writer, session } = parseWriterTrailers(
    "fix: algo\n\ncorpo da mensagem\n\nWriter: claude-code\nWriter-Session: s-2026-08-06-01",
  );
  assert.equal(writer, "claude-code");
  assert.equal(session, "s-2026-08-06-01");
});

test("Writer citado no corpo nao vira identidade", () => {
  const { writer } = parseWriterTrailers(
    "fix: algo\n\nWriter: gpt-5.6 foi mencionado aqui no meio\n\nOutra linha de texto corrido.",
  );
  assert.equal(writer, null);
});

test("commit sem trailer REPROVA (estado atual do repo)", () => {
  const result = evaluateWriters([
    commit("d2b4b8129a8a", "test(autonomia): provar autorizacao do SEGREDO na varredura"),
    commit("77cb9e89e726", "fix(autonomia): corrigir diagnostico e reconhecer SEGREDO"),
  ]);
  assert.equal(result.verdict, "FAIL");
  assert.deepEqual(result.problems, [
    "WRITER_TRAILER_MISSING:d2b4b8129a8a",
    "WRITER_TRAILER_MISSING:77cb9e89e726",
  ]);
});

test("dois escritores diferentes na mesma branch REPROVAM", () => {
  const result = evaluateWriters([
    commit("aaaaaaaaaaaa", "feat: a\n\nWriter: claude-code"),
    commit("bbbbbbbbbbbb", "feat: b\n\nWriter: gpt-5-6"),
  ]);
  assert.equal(result.verdict, "FAIL");
  assert.match(result.problems.join(" "), /WRITER_NOT_UNIQUE:claude-code\+gpt-5-6/);
});

test("escritor unico e valido APROVA", () => {
  const result = evaluateWriters([
    commit("aaaaaaaaaaaa", "feat: a\n\nWriter: claude-code"),
    commit("bbbbbbbbbbbb", "feat: b\n\nWriter: claude-code\nWriter-Session: s-01"),
  ]);
  assert.equal(result.verdict, "PASS");
  assert.deepEqual(result.writers, ["claude-code"]);
  assert.deepEqual(result.problems, []);
});

test("slug fora do formato REPROVA", () => {
  assert.equal(WRITER_SLUG.test("Claude Code"), false);
  assert.equal(WRITER_SLUG.test("claude-code"), true);
  const result = evaluateWriters([commit("cccccccccccc", "feat: c\n\nWriter: Claude Code / Opus 5")]);
  assert.equal(result.verdict, "FAIL");
  assert.match(result.problems.join(" "), /WRITER_SLUG_INVALID/);
});

test("sessao com cara de credencial REPROVA e nao vaza valor", () => {
  const result = evaluateWriters([
    commit("dddddddddddd", "feat: d\n\nWriter: claude-code\nWriter-Session: ghp_AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"),
  ]);
  assert.equal(result.verdict, "FAIL");
  assert.match(result.problems.join(" "), /WRITER_SESSION_LOOKS_LIKE_CREDENTIAL/);
  assert.equal(result.commits[0].session, "REDACTED");
  assert.equal(JSON.stringify(result).includes("ghp_"), false);
  assert.equal(looksLikeCredential("s-2026-08-06-01"), false);
});

test("intervalo vazio REPROVA — nada inspecionado nao e aprovacao", () => {
  assert.equal(evaluateWriters([]).verdict, "FAIL");
  assert.deepEqual(evaluateWriters([]).problems, ["NO_COMMITS_INSPECTED"]);
});
