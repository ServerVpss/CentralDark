import assert from "node:assert/strict";
import test from "node:test";

import {
  AUTO_READY_POLICY,
  CANONICAL_AUTHORITY_LABEL,
  CANONICAL_AUTOMATION_LABEL,
  CANONICAL_GIT_LABEL,
  REQUIRED_PROMOTION_SEAL_LABELS,
  autoReadyState,
  classifyFailure,
  dependencyNumbers,
  eligibleSummary,
  noticeTargets,
  promotionSealReceipt,
  promotionSealState,
  sanitizeNotice,
  shouldMaterializeAuthority,
} from "./github-autonomia-varredura.mjs";

const INTENT_BODY = [
  "Intent-Authorized: SEGREDO/CHEFE",
  "Merge-Policy: AUTO_SQUASH_IF_CLEAN",
  "Intent-Scope: TESTE_CANONICO",
  "Writer: GPT-5.6-Sol",
  "Writer-Scope: TESTE_CANONICO",
].join("\n");

function pr(overrides = {}) {
  return {
    number: 999,
    node_id: "PR_TESTE",
    state: "open",
    draft: false,
    title: "fix: canário",
    body: INTENT_BODY,
    labels: [],
    user: { login: "segredounlock" },
    base: { ref: "main" },
    head: { repo: { full_name: "ServerVpss/CentralDark" } },
    ...overrides,
  };
}

test("recibo de intenção torna PR confiável elegível sem reask", () => {
  assert.equal(eligibleSummary(pr(), "ServerVpss/CentralDark"), true);
  assert.equal(eligibleSummary(pr({ draft: true }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ body: "sem autorização" }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ user: { login: "intruso" } }), "ServerVpss/CentralDark"), false);
});

test("selo canônico sintetiza autoridade + canal Git + automação", () => {
  const pending = promotionSealState(pr(), "ServerVpss/CentralDark");
  assert.equal(pending.eligible, true);
  assert.equal(pending.complete, false);
  assert.deepEqual(pending.missingLabels, [
    CANONICAL_AUTHORITY_LABEL,
    CANONICAL_GIT_LABEL,
    CANONICAL_AUTOMATION_LABEL,
  ]);

  const sealed = promotionSealState(pr({
    labels: REQUIRED_PROMOTION_SEAL_LABELS.map((name) => ({ name })),
  }), "ServerVpss/CentralDark");
  assert.equal(sealed.eligible, true);
  assert.equal(sealed.complete, true);
  assert.deepEqual(sealed.missingLabels, []);
});

test("selo exige recibo completo e política de merge conhecida", () => {
  assert.equal(promotionSealReceipt(pr()).valid, true);
  assert.equal(promotionSealReceipt(pr({
    body: INTENT_BODY.replace("AUTO_SQUASH_IF_CLEAN", "GREEN_FIRST"),
  })).valid, true);
  assert.equal(promotionSealReceipt(pr({
    body: INTENT_BODY.replace("AUTO_SQUASH_IF_CLEAN", "GREEN_FIRST_6_OF_6_THEN_SQUASH"),
  })).valid, true);
  assert.equal(promotionSealReceipt(pr({
    body: INTENT_BODY.replace("AUTO_SQUASH_IF_CLEAN", "MERGE_SEM_CATRACA"),
  })).valid, false);
  assert.equal(promotionSealReceipt(pr({ body: "sem recibo" })).valid, false);
});

test("draft automatizado só é gerenciável com opt-in explícito + selo completo", () => {
  const body = [
    INTENT_BODY,
    `Auto-Ready: ${AUTO_READY_POLICY}`,
    "Depends-On: #983, #984",
  ].join("\n");
  const managed = autoReadyState(pr({
    draft: true,
    body,
    labels: REQUIRED_PROMOTION_SEAL_LABELS.map((name) => ({ name })),
  }), "ServerVpss/CentralDark");
  assert.equal(managed.managed, true);
  assert.deepEqual(managed.dependencies, [983, 984]);
  assert.deepEqual(managed.missingLabels, []);

  const humanDraft = autoReadyState(pr({
    draft: true,
    labels: REQUIRED_PROMOTION_SEAL_LABELS.map((name) => ({ name })),
  }), "ServerVpss/CentralDark");
  assert.equal(humanDraft.managed, false);

  const incompleteSeal = autoReadyState(pr({
    draft: true,
    body,
    labels: [{ name: CANONICAL_AUTHORITY_LABEL }],
  }), "ServerVpss/CentralDark");
  assert.equal(incompleteSeal.managed, false);
});

test("depends-on deduplica, ignora self-reference e não inventa dependência", () => {
  assert.deepEqual(dependencyNumbers(pr()), []);
  assert.deepEqual(dependencyNumbers(pr({
    number: 985,
    body: `${INTENT_BODY}\nDepends-On: #983 #983, #985, #984`,
  })), [983, 984]);
});

test("promotor materializa autoridade somente como parte do selo confiável", () => {
  assert.equal(shouldMaterializeAuthority(pr(), "ServerVpss/CentralDark"), true);
  assert.equal(shouldMaterializeAuthority(pr({ labels: [{ name: "👑 PERMITO-SEGREDO" }] }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ body: "sem autorização" }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ draft: true }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ user: { login: "intruso" } }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ head: { repo: { full_name: "outro/fork" } } }), "ServerVpss/CentralDark"), false);
});

test("label de autoridade sozinha permite investigação mas não fecha selo de promoção", () => {
  const candidate = pr({ body: "sem recibo", labels: [{ name: "permito-segredo" }] });
  assert.equal(eligibleSummary(candidate, "ServerVpss/CentralDark"), true);
  const seal = promotionSealState(candidate, "ServerVpss/CentralDark");
  assert.equal(seal.eligible, false);
  assert.equal(seal.complete, false);
});

test("marcadores legados não concedem mais elegibilidade", () => {
  assert.equal(eligibleSummary(pr({ body: "PERMITO SEGREDO" }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ body: "PERMITO PIVETE" }), "ServerVpss/CentralDark"), false);
  assert.equal(
    eligibleSummary(pr({ body: "sem recibo", labels: [{ name: "permito-pivete" }] }), "ServerVpss/CentralDark"),
    false,
  );
});

test("fork e base diferente de main são bloqueados pelo selo", () => {
  assert.equal(
    eligibleSummary(pr({ head: { repo: { full_name: "outro/fork" } } }), "ServerVpss/CentralDark"),
    false,
  );
  assert.equal(eligibleSummary(pr({ base: { ref: "dev" } }), "ServerVpss/CentralDark"), false);
  assert.equal(promotionSealState(pr({ base: { ref: "dev" } }), "ServerVpss/CentralDark").eligible, false);
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

test("classificação de falha é determinística", () => {
  assert.equal(classifyFailure("HTTP 429 rate limit exceeded"), "RATE_LIMITED");
  assert.equal(classifyFailure("insufficient_quota: billing hard limit"), "CREDITS_EXHAUSTED");
  assert.equal(classifyFailure("401 Bad credentials"), "TOKEN_DENIED");
  assert.equal(classifyFailure("ETIMEDOUT ao chamar provedor"), "PROVIDER_DOWN");
  assert.equal(classifyFailure("REVIEW_THREADS_UNAVAILABLE:660"), "GITHUB_GRAPHQL_UNAVAILABLE");
  assert.equal(classifyFailure("coisa nunca vista"), "UNKNOWN_FAILURE");
});

test("ausência de segredo de notificação é reportada, nunca assumida", () => {
  assert.deepEqual(noticeTargets({}), { telegram: false, webhook: false });
  assert.deepEqual(
    noticeTargets({ TELEGRAM_BOT_TOKEN: "x", TELEGRAM_CHAT_ID: "y" }),
    { telegram: true, webhook: false },
  );
});
