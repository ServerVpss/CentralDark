import assert from "node:assert/strict";
import test from "node:test";

import {
  MAIN_DRIFT_STATES,
  classifyMainDrift,
} from "./github-main-drift-materiality.mjs";
import {
  FAST_MERGE_POLICY,
  evaluateCandidate,
} from "./github-autonomia-promocao.mjs";

const INTENT_BODY = [
  "Intent-Authorized: SEGREDO/CHEFE",
  `Merge-Policy: ${FAST_MERGE_POLICY}`,
  "Intent-Scope: MAIN_DRIFT_MATERIALITY",
  "Writer: GPT-5.6-Sol",
  "Writer-Scope: MAIN_DRIFT_MATERIALITY",
].join("\n");

function prFixture() {
  return {
    number: 1465,
    title: "test: main drift materiality",
    body: INTENT_BODY,
    state: "open",
    draft: false,
    mergeable: true,
    mergeable_state: "clean",
    labels: [],
    user: { login: "segredounlock" },
    head: {
      sha: "a".repeat(40),
      ref: "sol/test-main-drift",
      repo: { full_name: "ServerVpss/CentralDark" },
    },
    base: { sha: "b".repeat(40), ref: "main" },
  };
}

function evaluateWithDrift(baseDrift) {
  return evaluateCandidate({
    pr: prFixture(),
    repository: "ServerVpss/CentralDark",
    trustedAuthors: ["segredounlock"],
    requiredWorkflows: [],
    workflowRuns: [],
    unresolvedThreads: 0,
    reviewThreadsOverflow: false,
    blockingReview: false,
    baseDrift,
    securityFindings: [],
    canonicalValidation: {
      verdict: "PASS",
      errors: [],
      map_blob_sha: "c".repeat(40),
      summary: { total: 1, passed: 1, failed: 0, consumers_total: 1, consumers_passed: 1 },
    },
  });
}

test("behind sozinho não força update quando main mudou fora do escopo", () => {
  const drift = classifyMainDrift({
    behindBy: 8,
    activeFiles: ["apps/modulos/elite-gateway/router.mjs"],
    mainFiles: ["docs/HANDOFF/nota-sem-relacao.md"],
    trustedMap: { canonical_contracts: [], validation_entrypoints: [] },
    mergeBaseSha: "1".repeat(40),
    baseSha: "b".repeat(40),
    headSha: "a".repeat(40),
  });
  assert.equal(drift.state, MAIN_DRIFT_STATES.UNRELATED);
  const result = evaluateWithDrift(drift);
  assert.equal(result.decision, "READY");
  assert.equal(result.base_update_required, false);
});

test("overlap com escopo ativo torna drift material e exige update", () => {
  const drift = classifyMainDrift({
    behindBy: 2,
    activeFiles: ["scripts/github-autonomia-promocao.mjs"],
    mainFiles: ["scripts/github-autonomia-promocao.mjs"],
    trustedMap: { canonical_contracts: [], validation_entrypoints: [] },
  });
  assert.equal(drift.state, MAIN_DRIFT_STATES.MATERIAL);
  assert.match(drift.reasons.join(" "), /ACTIVE_SCOPE_PATH_OVERLAP/);
  const result = evaluateWithDrift(drift);
  assert.equal(result.decision, "UPDATE_REQUIRED");
  assert.equal(result.base_update_required, true);
});

test("mudança em owner global torna drift material mesmo sem overlap local", () => {
  const drift = classifyMainDrift({
    behindBy: 1,
    activeFiles: ["apps/modulos/voice/client.mjs"],
    mainFiles: ["CENTRALDARK_AI_BOOT.yaml"],
    trustedMap: { canonical_contracts: [], validation_entrypoints: [] },
  });
  assert.equal(drift.state, MAIN_DRIFT_STATES.MATERIAL);
  assert.match(drift.reasons.join(" "), /GLOBAL_CANONICAL_PATH_CHANGED/);
});

test("drift impossível de medir fica WAIT e nunca PASS", () => {
  const drift = classifyMainDrift({
    behindBy: 4,
    activeFiles: ["apps/modulos/voice/client.mjs"],
    mainFiles: ["docs/x.md"],
    mainFilesOverflow: true,
    trustedMap: { canonical_contracts: [], validation_entrypoints: [] },
  });
  assert.equal(drift.state, MAIN_DRIFT_STATES.UNKNOWN);
  const result = evaluateWithDrift(drift);
  assert.equal(result.decision, "WAIT");
  assert.match(result.waits.join(" "), /BASE_DRIFT_UNKNOWN/);
});
