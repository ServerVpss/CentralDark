# COMANDO - github-autonomia-promocao.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\github-autonomia-promocao.test.mjs
**SHA:** b2e50b872e269d10
**Timestamp:** 2026-08-28T02:57:32.964778
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- const missing = allGreen.slice(0, -1);
- assert.match(validation.errors.join(" "), /REQUIRED_TOKEN_MISSING:[REDIGIDO-PRESERVACAO]);
- const missing = evaluate(pr);

### Ouro Bruto (primeiros 5000 chars)
```
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
    workflowRuns: [],
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
  const
```