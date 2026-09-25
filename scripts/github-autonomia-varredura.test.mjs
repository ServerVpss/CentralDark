import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  classifyFailure,
  eligibleSummary,
  guardSweep,
  noticeTargets,
  sanitizeNotice,
  shouldMaterializeAuthority,
} from "./github-autonomia-varredura.mjs";
import { DEFAULT_REQUIRED_WORKFLOWS, sealReceipt } from "./github-autonomia-promocao.mjs";

const INTENT_BODY = [
  "Intent-Authorized: SEGREDO/CHEFE",
  "Merge-Policy: AUTO_SQUASH_IF_CLEAN",
  "Intent-Scope: TESTE_CANONICO",
  "Writer: GPT-5.6-Sol",
  "Writer-Scope: TESTE_CANONICO",
].join("\n");

function pr(overrides = {}) {
  return {
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

test("promotor materializa selo somente para intenção confiável ainda sem label", () => {
  assert.equal(shouldMaterializeAuthority(pr(), "ServerVpss/CentralDark"), true);
  assert.equal(shouldMaterializeAuthority(pr({ labels: [{ name: "👑 PERMITO-SEGREDO" }] }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ body: "sem autorização" }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ draft: true }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ user: { login: "intruso" } }), "ServerVpss/CentralDark"), false);
  assert.equal(shouldMaterializeAuthority(pr({ head: { repo: { full_name: "outro/fork" } } }), "ServerVpss/CentralDark"), false);
});

test("label canônica permito-segredo continua elegível no modo adversarial", () => {
  assert.equal(
    eligibleSummary(pr({ body: "sem recibo", labels: [{ name: "permito-segredo" }] }), "ServerVpss/CentralDark"),
    true,
  );
});

test("marcadores legados não concedem mais elegibilidade", () => {
  assert.equal(eligibleSummary(pr({ body: "PERMITO SEGREDO" }), "ServerVpss/CentralDark"), false);
  assert.equal(eligibleSummary(pr({ body: "PERMITO PIVETE" }), "ServerVpss/CentralDark"), false);
  assert.equal(
    eligibleSummary(pr({ body: "sem recibo", labels: [{ name: "permito-pivete" }] }), "ServerVpss/CentralDark"),
    false,
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

test("guard mantém somente recibo 6/6 verde e move os demais para deferred", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "centraldark-green-first-"));
  const workflows = DEFAULT_REQUIRED_WORKFLOWS.map((name) => ({ name, state: "PASS" }));
  const receipt = (decision, items = workflows) => sealReceipt({
    schema: "centraldark.autonomia-promocao.v2",
    generated_at: new Date().toISOString(),
    repository: "ServerVpss/CentralDark",
    candidates: [{ decision, head_sha: "a".repeat(40), workflows: items }],
  });
  try {
    await writeFile(path.join(dir, "receipt-pr-1.json"), JSON.stringify(receipt("READY")));
    await writeFile(path.join(dir, "receipt-pr-2.json"), JSON.stringify(receipt("DEFERRED", workflows)));
    await writeFile(path.join(dir, "receipt-pr-3.json"), JSON.stringify(receipt("READY", workflows.slice(0, 5))));
    assert.deepEqual(await guardSweep(dir), ["receipt-pr-2.json", "receipt-pr-3.json"]);
    assert.doesNotReject(() => readFile(path.join(dir, "receipt-pr-1.json")));
    assert.doesNotReject(() => readFile(path.join(dir, "deferred", "receipt-pr-2.json")));
    assert.doesNotReject(() => readFile(path.join(dir, "deferred", "receipt-pr-3.json")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
