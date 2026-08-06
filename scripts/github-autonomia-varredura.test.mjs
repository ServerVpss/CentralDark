import assert from "node:assert/strict";
import test from "node:test";

import {
  classifyFailure,
  eligibleSummary,
  noticeTargets,
  sanitizeNotice,
} from "./github-autonomia-varredura.mjs";

function pr(overrides = {}) {
  return {
    state: "open",
    draft: false,
    title: "fix: canário",
    body: "PERMITO SEGREDO",
    labels: [],
    user: { login: "segredounlock" },
    base: { ref: "main" },
    head: { repo: { full_name: "ServerVpss/CentralDark" } },
    ...overrides,
  };
}

test("aceita apenas PR autorizado, confiável e não draft", () => {
  assert.equal(eligibleSummary(pr(), "ServerVpss/CentralDark"), true);
  assert.equal(eligibleSummary(pr({ draft: true }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ body: "sem autorização" }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ user: { login: "intruso" } }), "ServerVpss/CentralDark"), false);
});

test("label canônica permito-segredo autoriza", () => {
  assert.equal(
    eligibleSummary(pr({ body: "sem marcador", labels: [{ name: "permito-segredo" }] }), "ServerVpss/CentralDark"),
    true,
  );
});

test("marcador antigo permanece compatível durante migração", () => {
  assert.equal(
    eligibleSummary(pr({ body: "PERMITO PIVETE" }), "ServerVpss/CentralDark"),
    true,
  );
  assert.equal(
    eligibleSummary(pr({ body: "sem marcador", labels: [{ name: "permito-pivete" }] }), "ServerVpss/CentralDark"),
    true,
  );
});

test("fork e base diferente de main são bloqueados", () => {
  assert.equal(
    eligibleSummary(pr({ head: { repo: { full_name: "outro/fork" } } }), "ServerVpss/CentralDark"),
    false,
  );
  assert.equal(eligibleSummary(pr({ base: { ref: "dev" } }), "ServerVpss/CentralDark"), false);
});

test("nenhuma credencial escapa para log, comentário ou Telegram", () => {
  const bruto = [
    "Bearer ghp_" + "A".repeat(36),
    "github_pat_" + "B".repeat(30),
    "token 123456789:" + "C".repeat(35),
  ].join(" ");
  const limpo = sanitizeNotice(bruto);
  assert.equal(/gh[pousr]_/.test(limpo), false);
  assert.equal(/github_pat_/.test(limpo), false);
  assert.equal(limpo.includes("[REDACTED]"), true);
});

test("classificação de falha é determinística, sem IA no caminho crítico", () => {
  assert.equal(classifyFailure("HTTP 429 rate limit exceeded"), "RATE_LIMITED");
  assert.equal(classifyFailure("insufficient_quota: billing hard limit"), "CREDITS_EXHAUSTED");
  assert.equal(classifyFailure("401 Bad credentials"), "TOKEN_DENIED");
  assert.equal(classifyFailure("ETIMEDOUT ao chamar provedor"), "PROVIDER_DOWN");
  assert.equal(classifyFailure("REVIEW_THREADS_UNAVAILABLE:660"), "GITHUB_GRAPHQL_UNAVAILABLE");
  assert.equal(classifyFailure("coisa nunca vista"), "UNKNOWN_FAILURE");
});

test("ausência de segredo de notificação é reportada, nunca assumida como enviada", () => {
  assert.deepEqual(noticeTargets({}), { telegram: false, webhook: false });
  assert.deepEqual(
    noticeTargets({ TELEGRAM_BOT_TOKEN: "x", TELEGRAM_CHAT_ID: "y" }),
    { telegram: true, webhook: false },
  );
});
