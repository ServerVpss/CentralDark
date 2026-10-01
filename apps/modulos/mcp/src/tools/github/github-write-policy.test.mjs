import test from "node:test";
import assert from "node:assert/strict";
import {
  centralDarkPrCreationPolicy,
  centralDarkBranchCreationPolicy,
} from "./github-write.js";

const OWNER = "ServerVpss";
const REPO = "CentralDark";

test("CentralDark PR autônomo não nasce Draft por default", () => {
  assert.deepEqual(
    centralDarkPrCreationPolicy({ draft: true, body: "x" }, OWNER, REPO),
    { draft: false, body: "x" },
  );
  assert.deepEqual(
    centralDarkPrCreationPolicy({ body: "x" }, OWNER, REPO),
    { draft: false, body: "x" },
  );
});

test("Draft explícito real exige causa e grava marcador preservável", () => {
  const out = centralDarkPrCreationPolicy(
    { draft: true, body: "x", keepDraftReason: "rascunho humano real" },
    OWNER,
    REPO,
  );
  assert.equal(out.draft, true);
  assert.match(out.body, /KEEP_DRAFT=true/);
  assert.match(out.body, /KEEP_DRAFT_REASON=rascunho humano real/);
});

test("repo externo mantém compatibilidade do draft solicitado", () => {
  assert.equal(
    centralDarkPrCreationPolicy({ draft: true }, "outro", "repo").draft,
    true,
  );
});

test("CentralDark bloqueia branch remota sem causa material", () => {
  assert.throws(
    () => centralDarkBranchCreationPolicy({}, OWNER, REPO),
    /NEW_REMOTE_BRANCH_DEFAULT=false/,
  );
});

test("branch efêmera exige PR Ready no mesmo fluxo", () => {
  assert.throws(
    () => centralDarkBranchCreationPolicy({
      branchPurpose: "PR_REQUIRED",
      lifecycle: "EPHEMERAL_READY_PR_SAME_TURN",
      intent: "corrigir owner",
      scope: "apps/modulos/mcp",
    }, OWNER, REPO),
    /prTitle obrigatório/,
  );

  assert.deepEqual(
    centralDarkBranchCreationPolicy({
      branchPurpose: "PR_REQUIRED",
      lifecycle: "EPHEMERAL_READY_PR_SAME_TURN",
      intent: "corrigir owner",
      scope: "apps/modulos/mcp",
      prTitle: "fix: corrigir owner",
    }, OWNER, REPO),
    {
      mode: "EPHEMERAL_READY_PR_SAME_TURN",
      autoOpenReadyPr: true,
      purpose: "PR_REQUIRED",
      intent: "corrigir owner",
      scope: "apps/modulos/mcp",
    },
  );
});

test("branch persistente precisa declarar lifecycle persistente", () => {
  assert.throws(
    () => centralDarkBranchCreationPolicy({
      branchPurpose: "PERSISTENT_EXPLICIT",
      lifecycle: "EPHEMERAL_READY_PR_SAME_TURN",
      intent: "linha longa explicitamente necessária",
      scope: "owner/x",
      prTitle: "x",
    }, OWNER, REPO),
    /PERSISTENT_BRANCH_REQUIRES_EXPLICIT_OWNER_AND_PURPOSE/,
  );

  assert.equal(
    centralDarkBranchCreationPolicy({
      branchPurpose: "PERSISTENT_EXPLICIT",
      lifecycle: "PERSISTENT_EXPLICIT",
      intent: "linha longa explicitamente necessária",
      scope: "owner/x",
    }, OWNER, REPO).autoOpenReadyPr,
    false,
  );
});
