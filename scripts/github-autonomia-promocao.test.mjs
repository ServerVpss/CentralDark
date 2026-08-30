import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_WAIT_TIMEOUT_MS,
  FAST_MERGE_POLICY,
  CANONICAL_MAP_PATH,
  authorizationFor,
  evaluateCandidate,
  executionProvenance,
  intentReceipt,
  scanPullFiles,
  sealReceipt,
  selectLatestNonSkipped,
  verifySealedReceipt,
  waitAgeMs,
  waitTimeoutMsFromEnv,
  workflowVerdicts,
  validateCanonicalSnapshot,
} from "./github-autonomia-promocao.mjs";
import {
  DEFAULT_REQUIRED_WORKFLOWS as GREEN_REQUIRED_WORKFLOWS,
  greenDecision as greenGuardDecision,
} from "./github-autonomia-green-guard.mjs";

const INTENT_BODY = [
  "Intent-Authorized: SEGREDO/CHEFE",
  `Merge-Policy: ${FAST_MERGE_POLICY}`,
  "Intent-Scope: TESTE_CANONICO",
  "Writer: GPT-5.6-Sol",
  "Writer-Scope: TESTE_CANONICO",
].join("\n");

function prFixture(overrides = {}) {
  return {
    number: 99,
    title: "fix: exemplo",
    body: INTENT_BODY,
    state: "open",
    draft: false,
    mergeable: true,
    mergeable_state: "clean",
    labels: [],
    user: { login: "segredounlock" },
    head: {
      sha: "a".repeat(40),
      ref: "fix/exemplo",
      repo: { full_name: "ServerVpss/CentralDark" },
    },
    base: { sha: "b".repeat(40), ref: "main" },
    ...overrides,
  };
}

function successfulRuns(required) {
  return required.map((name, index) => ({
    id: index + 1,
    name,
    run_number: index + 10,
    status: "completed",
    conclusion: "success",
  }));
}

function evaluate(pr = prFixture(), overrides = {}) {
  return evaluateCandidate({
    pr,
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: ["gate-a", "gate-b"],
    workflowRuns: successfulRuns(["gate-a", "gate-b"]),
    unresolvedThreads: 0,
    securityFindings: [],
    canonicalValidation: {
      verdict: "PASS",
      errors: [],
      map_blob_sha: "c".repeat(40),
      summary: { total: 2, passed: 2, failed: 0, consumers_total: 2, consumers_passed: 2 },
    },
    ...overrides,
  });
}

function canonicalFixture() {
  const identitySha = "d".repeat(40);
  const map = {
    schema_version: 1,
    source_of_truth: CANONICAL_MAP_PATH,
    sectors: [{ id: "core", label: "Core", paths: ["scripts/"] }],
    consolidated_areas: [{ path: "scripts/", reason: "owner" }],
    canonical_contracts: [
      {
        id: "entrypoint",
        source: "LEIA-ME-IA.md",
        consumers: ["AGENTS.md"],
        required_tokens: ["CENTRALDARK_AI_BOOT"],
      },
      {
        id: "identity",
        source: ".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA",
        target: ".agents/skills/meta-lupa/SKILL.md",
        identity: "git_blob_sha1",
        consumers: ["AGENTS.md"],
        required_tokens: ["AUTOLUPA_CANONICAL_SHA"],
        forbidden_tokens: ["SKILL_COMMIT_SHA:"],
      },
    ],
    forbidden_roots: [],
    historical_roots: [],
    validation_entrypoints: ["apps/modulos/mapeamento/core/validar-mapa.mjs"],
    consolidation_evidence_policy: {
      enabled: true,
      legacy_without_proof: "PROTECTED_UNPROVEN",
      efficacy_100_requires_denominator: true,
    },
  };
  const files = new Map([
    [CANONICAL_MAP_PATH, { content: JSON.stringify(map), sha: "a".repeat(40) }],
    ["LEIA-ME-IA.md", { content: "owner", sha: "b".repeat(40) }],
    ["AGENTS.md", { content: "CENTRALDARK_AI_BOOT\nAUTOLUPA_CANONICAL_SHA", sha: "c".repeat(40) }],
    [".agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA", {
      content: `${identitySha} .agents/skills/meta-lupa/SKILL.md\n# comentário operacional permitido\n`,
      sha: "e".repeat(40),
    }],
    [".agents/skills/meta-lupa/SKILL.md", { content: "skill", sha: identitySha }],
  ]);
  return { map, files, identitySha };
}

test("recibo de intenção completo é autorização canônica do fast path", () => {
  const receipt = intentReceipt(prFixture());
  assert.equal(receipt.valid, true);
  assert.equal(receipt.authority, "SEGREDO/CHEFE");
  assert.equal(receipt.mergePolicy, FAST_MERGE_POLICY);
  assert.equal(receipt.intentScope, "TESTE_CANONICO");

  const auth = authorizationFor(prFixture());
  assert.equal(auth.authorized, true);
  assert.equal(auth.viaBody, true);
  assert.equal(auth.viaLabel, false);
  assert.equal(auth.source, "pr-body:intent-authorized");
  assert.equal(auth.authority, "SEGREDO/CHEFE");
});

test("recibo separa conector, executor e Hermes sem inventar runtime", () => {
  const provenance = executionProvenance({
    GITHUB_WORKFLOW: "Autonomia — promoção segura",
    GITHUB_RUN_ID: "123",
    GITHUB_ACTOR: "segredounlock",
    RUNNER_ENVIRONMENT: "self-hosted",
    RUNNER_NAME: "casa-linux",
    RUNNER_OS: "Linux",
  });
  assert.equal(provenance.connector_role, "PHYSICAL_ACCESS_PATH");
  assert.equal(provenance.connector_transport, "GITHUB_API");
  assert.equal(provenance.executor, "GITHUB_ACTIONS_RUNNER");
  assert.equal(provenance.runner_name, "casa-linux");
  assert.equal(provenance.hermes_runtime, "UNKNOWN_NOT_ATTESTED_BY_GITHUB_RECEIPT");
});

test("recibo incompleto não autoriza", () => {
  const pr = prFixture({ body: "Intent-Authorized: SEGREDO/CHEFE\nMerge-Policy: AUTO_SQUASH_IF_CLEAN" });
  assert.equal(intentReceipt(pr).valid, false);
  assert.equal(authorizationFor(pr).authorized, false);
});

test("label visual canônica autoriza", () => {
  const auth = authorizationFor(prFixture({ body: "sem recibo", labels: [{ name: "👑 PERMITO-SEGREDO" }] }));
  assert.equal(auth.authorized, true);
  assert.equal(auth.viaLabel, true);
  assert.equal(auth.viaBody, false);
  assert.equal(auth.source, "github-label:👑 PERMITO-SEGREDO");
});

test("alias textual permito-segredo continua compatível sem virar segunda label", () => {
  for (const name of ["permito-segredo", "PERMITO-SEGREDO", "👑 permito-segredo"]) {
    const auth = authorizationFor(prFixture({ body: "sem recibo", labels: [{ name }] }));
    assert.equal(auth.authorized, true);
    assert.equal(auth.viaLabel, true);
    assert.equal(auth.source, "github-label:👑 PERMITO-SEGREDO");
  }
});

test("PERMITO SEGREDO/PIVETE no body é histórico e não autoriza", () => {
  for (const body of ["PERMITO SEGREDO", "PERMITO PIVETE"]) {
    const auth = authorizationFor(prFixture({ body, labels: [] }));
    assert.equal(auth.authorized, false);
    assert.equal(auth.historicalBodyMarker, true);
  }
  const legacyLabel = authorizationFor(prFixture({ body: "sem recibo", labels: [{ name: "permito-pivete" }] }));
  assert.equal(legacyLabel.authorized, false);
  assert.equal(legacyLabel.legacy, true);
});

test("fast path espera todos os workflows obrigatórios do mesmo HEAD", () => {
  const missing = evaluate(prFixture(), { workflowRuns: [] });
  assert.equal(missing.mode, "FAST");
  assert.equal(missing.decision, "WAIT");
  assert.equal(missing.workflows.every((item) => item.state === "MISSING"), true);
  assert.match(missing.waits.join(" "), /WORKFLOW_MISSING/);

  const ready = evaluate();
  assert.equal(ready.mode, "FAST");
  assert.equal(ready.decision, "READY");
  assert.equal(ready.workflows.every((item) => item.state === "PASS"), true);
});

test("green-first revalida o READY e exige todos os gates no mesmo conjunto", () => {
  const ready = evaluate();
  assert.equal(ready.decision, "READY");

  const allGreen = successfulRuns(GREEN_REQUIRED_WORKFLOWS);
  assert.equal(greenGuardDecision(allGreen, GREEN_REQUIRED_WORKFLOWS).green, true);

  const missing = allGreen.slice(0, -1);
  assert.equal(greenGuardDecision(missing, GREEN_REQUIRED_WORKFLOWS).green, false);

  const pending = structuredClone(allGreen);
  pending[0].status = "queued";
  pending[0].conclusion = null;
  assert.equal(greenGuardDecision(pending, GREEN_REQUIRED_WORKFLOWS).green, false);

  const failed = structuredClone(allGreen);
  failed[1].conclusion = "failure";
  assert.equal(greenGuardDecision(failed, GREEN_REQUIRED_WORKFLOWS).green, false);

  const cancelled = structuredClone(allGreen);
  cancelled[2].conclusion = "cancelled";
  assert.equal(greenGuardDecision(cancelled, GREEN_REQUIRED_WORKFLOWS).green, false);
});

test("juiz emite mapa, todos os contratos e consumidores presos ao HEAD", async () => {
  const { files, map } = canonicalFixture();
  const result = await validateCanonicalSnapshot({
    headSha: "f".repeat(40),
    readSnapshot: async (path) => files.get(path) || null,
    trustedMap: map,
    trustedMapBlobSha: "a".repeat(40),
  });

  assert.equal(result.verdict, "PASS");
  assert.equal(result.map_status, "PASS");
  assert.equal(result.summary.total, 2);
  assert.equal(result.summary.passed, 2);
  assert.equal(result.summary.consumers_total, 2);
  assert.equal(result.summary.consumers_passed, 2);
  assert.deepEqual(result.contracts.map((contract) => contract.id), ["entrypoint", "identity"]);
  assert.equal(result.contracts[1].identity.status, "PASS");
});

test("token ausente em consumidor impede READY e não vira papagaio verde", async () => {
  const { files, map } = canonicalFixture();
  files.set("AGENTS.md", { content: "sem os tokens", sha: "c".repeat(40) });
  const validation = await validateCanonicalSnapshot({
    headSha: "f".repeat(40),
    readSnapshot: async (path) => files.get(path) || null,
    trustedMap: map,
  });

  assert.equal(validation.verdict, "FAIL");
  assert.match(validation.errors.join(" "), /REQUIRED_TOKEN_MISSING:CENTRALDARK_AI_BOOT/);
  const result = evaluate(prFixture(), { canonicalValidation: validation });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /CANONICAL_VALIDATION_FAILED/);
});

test("identidade da MetaLupa divergente do blob real bloqueia promoção", async () => {
  const { files, map } = canonicalFixture();
  files.set(".agents/skills/meta-lupa/SKILL.md", { content: "mudou", sha: "9".repeat(40) });
  const validation = await validateCanonicalSnapshot({
    headSha: "f".repeat(40),
    readSnapshot: async (path) => files.get(path) || null,
    trustedMap: map,
  });

  assert.equal(validation.verdict, "FAIL");
  assert.match(validation.errors.join(" "), /IDENTITY_BLOB_MISMATCH/);
  assert.equal(validation.contracts.find((contract) => contract.id === "identity").identity.status, "FAIL");
});

test("PR não pode reduzir o denominador de contratos definido pela base confiável", async () => {
  const { files, map } = canonicalFixture();
  const headMap = structuredClone(map);
  headMap.canonical_contracts[0].consumers = [];
  files.set(CANONICAL_MAP_PATH, { content: JSON.stringify(headMap), sha: "1".repeat(40) });
  const validation = await validateCanonicalSnapshot({
    headSha: "f".repeat(40),
    readSnapshot: async (path) => files.get(path) || null,
    trustedMap: map,
  });
  assert.equal(validation.verdict, "FAIL");
  assert.match(validation.errors.join(" "), /MAP_CONTRACT_DENOMINATOR_REDUCED/);
});

test("ausência do recibo canônico do mapa é bloqueio explícito", () => {
  const result = evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
  });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /CANONICAL_VALIDATION_MISSING/);
});

test("fast path ignora thread comum mas não CHANGES_REQUESTED explícito", () => {
  const common = evaluate(prFixture(), { unresolvedThreads: 9 });
  assert.equal(common.decision, "READY");

  const blocked = evaluate(prFixture(), { blockingReview: true });
  assert.equal(blocked.decision, "BLOCKED");
  assert.match(blocked.reasons.join(" "), /CHANGES_REQUESTED/);
});

test("fast path continua fail-closed para conflito, fork e autor externo", () => {
  const conflict = evaluate(prFixture({ mergeable: false, mergeable_state: "dirty" }));
  assert.equal(conflict.decision, "BLOCKED");
  assert.match(conflict.reasons.join(" "), /MERGE_CONFLICT/);

  const external = evaluate(prFixture({
    user: { login: "intruso" },
    head: { sha: "a".repeat(40), ref: "fork", repo: { full_name: "outro/fork" } },
  }));
  assert.equal(external.decision, "BLOCKED");
  assert.match(external.reasons.join(" "), /AUTHOR_NOT_TRUSTED/);
  assert.match(external.reasons.join(" "), /HEAD_EXTERNAL_REPOSITORY/);
});

test("scanner bloqueia caminho sensível e segredo literal, não documentação comum", () => {
  const findings = scanPullFiles([
    { filename: "docs/README.md", patch: "+ use Authorization apenas como nome de header" },
    { filename: ".env.production", patch: "+SAFE=placeholder" },
    { filename: "src/config.js", patch: `+const x = "ghp_${"A".repeat(36)}"` },
  ]);
  assert.equal(findings.some((x) => x.startsWith("SENSITIVE_PATH:.env.production")), true);
  assert.equal(findings.some((x) => x.startsWith("GITHUB_TOKEN_LITERAL:src/config.js")), true);
  assert.equal(findings.some((x) => x.includes("docs/README.md")), false);

  const result = evaluate(prFixture(), { securityFindings: findings });
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /SECURITY_FINDING/);
});

test("branch atrás da main pede atualização automática antes do merge", () => {
  const result = evaluate(prFixture(), { baseUpdateRequired: true });
  assert.equal(result.decision, "UPDATE_REQUIRED");
});

test("mergeability pendente espera; conflito nunca vira WAIT verde", () => {
  const waiting = evaluate(prFixture({ mergeable: null, mergeable_state: "unknown" }));
  assert.equal(waiting.decision, "WAIT");
  assert.match(waiting.waits.join(" "), /MERGEABILITY_PENDING/);

  const conflict = evaluate(prFixture({ mergeable: false, mergeable_state: "dirty" }));
  assert.equal(conflict.decision, "BLOCKED");
});

test("modo adversarial por label visual preserva workflows e contraprova completos", () => {
  const pr = prFixture({ body: "sem recibo", labels: [{ name: "👑 PERMITO-SEGREDO" }] });
  const missing = evaluate(pr, { workflowRuns: [] });
  assert.equal(missing.mode, "ADVERSARIAL");
  assert.equal(missing.decision, "WAIT");
  assert.match(missing.waits.join(" "), /WORKFLOW_MISSING/);

  const ready = evaluate(pr, { workflowRuns: successfulRuns(["gate-a", "gate-b"]) });
  assert.equal(ready.decision, "READY");
  assert.equal(ready.workflows.every((x) => x.state === "PASS"), true);
});

test("hold explícito bloqueia sem apagar autorização", () => {
  const result = evaluate(prFixture({ labels: [{ name: "hold" }] }));
  assert.equal(result.authorization.authorized, true);
  assert.equal(result.decision, "BLOCKED");
  assert.match(result.reasons.join(" "), /BLOCKING_LABEL:hold/);
});

test("seleção de workflow ignora skipped mais novo e usa execução real", () => {
  const selected = selectLatestNonSkipped([
    { id: 1, name: "gate", run_number: 20, status: "completed", conclusion: "skipped" },
    { id: 2, name: "gate", run_number: 19, status: "completed", conclusion: "success" },
  ], "gate");
  assert.equal(selected.id, 2);
  assert.deepEqual(workflowVerdicts([], ["gate"]), [{ name: "gate", state: "MISSING", run_id: null, conclusion: null }]);
});

test("recibo selado é preso ao hash e expira", () => {
  const generated = new Date("2026-08-14T03:00:00.000Z");
  const sealed = sealReceipt({
    schema: "centraldark.autonomia-promocao.v2",
    generated_at: generated.toISOString(),
    repository: "ServerVpss/CentralDark",
    candidates: [],
  });
  assert.equal(verifySealedReceipt(sealed, generated.getTime() + 14 * 60 * 1000).repository, "ServerVpss/CentralDark");
  assert.throws(() => verifySealedReceipt(sealed, generated.getTime() + 16 * 60 * 1000), /RECEIPT_EXPIRED/);
  const adulterated = structuredClone(sealed);
  adulterated.receipt.repository = "outro/repo";
  assert.throws(() => verifySealedReceipt(adulterated, generated.getTime()), /RECEIPT_HASH_INVALID/);
});

test("janela adversarial de espera continua configurável", () => {
  assert.equal(waitAgeMs(prFixture({ updated_at: "2026-08-14T02:00:00.000Z" })), null);
  assert.equal(waitTimeoutMsFromEnv({}), DEFAULT_WAIT_TIMEOUT_MS);
  assert.equal(waitTimeoutMsFromEnv({ BOT_WAIT_TIMEOUT_MINUTES: "10" }), 600000);
});
