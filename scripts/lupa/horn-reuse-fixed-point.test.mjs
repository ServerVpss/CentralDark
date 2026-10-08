import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { decideReuse, deriveFixedPoint, evaluateGoalClauses } from "./horn-reuse-fixed-point.mjs";

const CONTRACT_PATH = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const LOGIC_REFERENCE_PATH = "docs/CONSCIENCIA/REFERENCIA-LOGICA-HORN-REUSE-FIXED-POINT.md";
const SOURCE_NAME = "tlc23(2).pdf";
const SOURCE_SHA256 = "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1";

test("base lógica do PDF fica ligada ao owner canônico sem criar segunda autoridade", () => {
  const reference = readFileSync(LOGIC_REFERENCE_PATH, "utf8");
  const contract = JSON.parse(readFileSync(CONTRACT_PATH, "utf8"));

  assert.match(reference, new RegExp(SOURCE_NAME.replace(/[()]/g, "\\$&")));
  assert.ok(reference.includes(SOURCE_SHA256));
  assert.ok(reference.includes(CONTRACT_PATH));
  assert.equal(contract.marker, "REUSE_BEFORE_CREATE_REQUIRED");
  assert.equal(contract.global_continuity_policy?.principles?.REUSE_BEFORE_CREATE, true);
  assert.equal(contract.global_continuity_policy?.principles?.GLOBAL_LEARNING_PROMOTES_TO_CANONICAL_OWNER, true);
});

test("reusa owner existente quando intenção e fit completo coincidem", () => {
  const result = decideReuse({ existingOwner: true, sameIntent: true, fullFit: true });
  assert.equal(result.decision, "REUSE");
  assert.equal(result.fixedPoint, true);
});

test("estende minimamente quando owner existe e fit é parcial", () => {
  const result = decideReuse({ existingOwner: true, sameIntent: true, partialFit: true });
  assert.equal(result.decision, "EXTEND_MINIMALLY");
});

test("cria mínimo somente após gap e inexistência de owner serem provados", () => {
  const result = decideReuse({
    noExistingOwnerProved: true,
    materialGapProven: true,
    extendInsufficient: true,
  });
  assert.equal(result.decision, "CREATE_MINIMAL");
});

test("erro conhecido reaproveita remediação já provada", () => {
  const result = decideReuse({
    errorObserved: true,
    errorSignatureKnown: true,
    knownRemedy: true,
  });
  assert.equal(result.decision, "REUSE");
  assert.ok(result.facts.includes("REUSE_REMEDIATION"));
});

test("remediação nova provada promove aprendizado e chega ao fixed point", () => {
  const result = decideReuse({
    errorObserved: true,
    newRemedyProved: true,
    sameErrorSignature: true,
  });
  assert.ok(result.facts.includes("PROMOTE_LEARNING"));
  assert.ok(result.facts.includes("REUSE_REMEDIATION"));
  assert.equal(result.decision, "REUSE");
  assert.ok(result.rounds >= 2);
});

test("contradição owner existe e não existe falha fechado", () => {
  assert.throws(
    () => deriveFixedPoint({ facts: ["EXISTING_OWNER", "NO_EXISTING_OWNER_PROVED"] }),
    /HORN_CONTRADICTION:OWNER_EXISTENCE_CONTRADICTION/,
  );
});

test("create e reuse simultâneos nunca são aceitos", () => {
  assert.throws(
    () => deriveFixedPoint({
      facts: [
        "EXISTING_OWNER",
        "SAME_INTENT",
        "FULL_FIT",
        "NO_EXISTING_OWNER_PROVED",
        "MATERIAL_GAP_PROVEN",
        "EXTEND_INSUFFICIENT",
      ],
    }),
    /HORN_CONTRADICTION/,
  );
});


const goalTime = "2026-10-08T03:00:00Z";
const provenClause = (overrides = {}) => ({
  id: "G01", required: true, predicate: "owner effect observed",
  owner: "hermes", status: "PASS", proof_ref: "receipt:positive",
  counterproof_ref: "receipt:negative", counterproof_verdict: "NOT_REFUTED",
  source_sha: "abcdef123456", measured_at: goalTime, ...overrides,
});
const provenGoal = (overrides = {}) => ({
  intent_id: "intent-1", goal_fingerprint: "fingerprint-1",
  receipt_ref: "receipt:final", next_cursor: "FIXED_POINT",
  clauses: [provenClause()], ...overrides,
});
const fixedNow = Date.parse(goalTime) + 1000;

test("goal clauses require independent proof fields and counterproof verdict", () => {
  const result = evaluateGoalClauses(provenGoal(), { nowMs: fixedNow, maxAgeMs: 5000 });
  assert.equal(result.verdict, "FIXED_POINT");
  assert.equal(result.required_pass, 1);
  for (const missing of ["proof_ref", "counterproof_ref", "source_sha", "owner", "measured_at"]) {
    const partial = provenGoal({ clauses: [provenClause({ [missing]: "" })] });
    assert.equal(evaluateGoalClauses(partial, { nowMs: fixedNow }).clauses[0].status, "UNKNOWN", missing);
  }
  assert.equal(evaluateGoalClauses(provenGoal({ clauses: [provenClause({ counterproof_verdict: "UNKNOWN" })] }), { nowMs: fixedNow }).verdict, "NEXT_DELTA");
});

test("stale/future timestamp blocks PASS and counterproof can refute green", () => {
  assert.equal(evaluateGoalClauses(provenGoal(), { nowMs: fixedNow + 6000, maxAgeMs: 5000 }).clauses[0].status, "STALE");
  assert.equal(evaluateGoalClauses(provenGoal(), { nowMs: fixedNow - 3000 }).clauses[0].status, "STALE");
  const refuted = provenGoal({ clauses: [provenClause({ counterproof_verdict: "REFUTED" })] });
  assert.equal(evaluateGoalClauses(refuted, { nowMs: fixedNow }).clauses[0].status, "FAIL");
});

test("missing receipt, terminal cursor or required clause never closes goal", () => {
  assert.equal(evaluateGoalClauses(provenGoal({ receipt_ref: "" }), { nowMs: fixedNow }).fixedPoint, false);
  assert.equal(evaluateGoalClauses(provenGoal({ next_cursor: "PROBE" }), { nowMs: fixedNow }).fixedPoint, false);
  assert.equal(evaluateGoalClauses(provenGoal({ clauses: [] }), { nowMs: fixedNow }).fixedPoint, false);
  assert.equal(evaluateGoalClauses(provenGoal({ clauses: [provenClause(), provenClause({ id: "G02", status: "UNKNOWN" })] }), { nowMs: fixedNow }).fixedPoint, false);
});

test("optional unknown does not block proven required goal; duplicate ids are rejected", () => {
  const optional = provenGoal({ clauses: [provenClause(), provenClause({ id: "G02", required: false, status: "UNKNOWN" })] });
  assert.equal(evaluateGoalClauses(optional, { nowMs: fixedNow }).fixedPoint, true);
  assert.throws(() => evaluateGoalClauses(provenGoal({ clauses: [provenClause(), provenClause()] })), /GOAL_CLAUSE_INVALID_OR_DUPLICATE_ID/);
});


test("Hermes can evaluate clauses over stdin without exposing JSON in argv", () => {
  const child = spawnSync(process.execPath, ["scripts/lupa/horn-reuse-fixed-point.mjs", "--goal-stdin"], {
    input: JSON.stringify(provenGoal()), encoding: "utf8",
  });
  assert.equal(child.status, 0, child.stderr);
  assert.equal(JSON.parse(child.stdout).verdict, "FIXED_POINT");
});

test("META-GRILL, oracle, HUD and goal evaluator refer to the same canonical owner", () => {
  const hook = readFileSync(".agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/META-GRILL/GANCHO.md", "utf8");
  const oracle = readFileSync(".agents/skills/software-development/centraldark-oracle-surface/SKILL.md", "utf8");
  const hud = readFileSync("docs/HUD/HUD.html", "utf8");
  const contract = readFileSync("docs/CONSCIENCIA/PROGRAMAS/INTENCAO-DEVOLVIDA-LOOP-MESTRE-20260923.md", "utf8");
  assert.match(hook, /Autoentrevista operacional baseada no CURRENT/);
  assert.match(oracle, /Goal-Clause META-GRILL/);
  assert.match(hud, /renderGoalClauseProjection/);
  assert.match(contract, /G12.*Ciclo registra receita/);
});
