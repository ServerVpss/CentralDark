import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import { decideReuse, deriveFixedPoint, evaluateGoalClauses, evaluateFixedPointTen, buildFixedPointExecutionHeader, validateFixedPointExecutionHeader, FIXED_POINT_TEN_CRITERIA } from "./horn-reuse-fixed-point.mjs";

const CONTRACT_PATH = "docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json";
const CONTINUITY_OWNER_PATH = "docs/CONSCIENCIA/EXECUCAO-CONTINUA-OWNER-WRITER-CONNECTOR.json";
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
  // O princípio de promoção de aprendizado global mora no owner de continuidade, não é duplicado no contrato de reconciliação.
  const continuityOwner = JSON.parse(readFileSync(CONTINUITY_OWNER_PATH, "utf8"));
  assert.equal(JSON.stringify(continuityOwner).includes('"GLOBAL_LEARNING_PROMOTES_TO_CANONICAL_OWNER":true'), true);
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


const fixedPointTenCriteria = (overrides = {}) => FIXED_POINT_TEN_CRITERIA.map(({ id }) => ({
  id,
  evaluated: true,
  status: "PASS",
  source: "runtime:" + id,
  source_sha: "a".repeat(40),
  proof_ref: "proof:" + id,
  counterproof_ref: "counterproof:" + id,
  counterproof_verdict: "NOT_REFUTED",
  attempt_ref: "attempt:" + id,
  evaluated_at: goalTime,
  measured_at: goalTime,
  ...overrides[id],
}));
const fixedPointTenGoalReceipt = (overrides = {}) => ({
  ...provenGoal(),
  evaluator: "scripts/lupa/horn-reuse-fixed-point.mjs",
  contract_version: 1,
  main_sha: "a".repeat(40),
  fixedPoint: true,
  measured_at: goalTime,
  max_age_ms: 5000,
  ...overrides,
});
const makeFixedPointExecutionHeader = (overrides = {}) => {
  const criteria = overrides.criteria || fixedPointTenCriteria();
  const goalReceipt = Object.hasOwn(overrides, "goal_receipt")
    ? overrides.goal_receipt : fixedPointTenGoalReceipt();
  const input = { criteria, goalReceipt, currentHead: "a".repeat(40) };
  const evaluated = evaluateFixedPointTen(input, { nowMs: fixedNow, maxAgeMs: 5000 });
  return {
    schema: "centraldark.fixed-point.execution-header.v1",
    evaluator: "scripts/lupa/horn-reuse-fixed-point.mjs",
    agent_id: "hermes",
    mission_id: "mission-1",
    intent_id: "intent-1",
    goal_fingerprint: "fingerprint-1",
    observed_head: "a".repeat(40),
    measured_at: goalTime,
    evaluation_ref: "receipt:execution-header",
    execution_ref: "execution:hermes:1",
    criteria,
    goal_receipt: goalReceipt,
    goal_receipt_ref: goalReceipt?.receipt_ref || null,
    verdict: evaluated.verdict,
    next_cursor: evaluated.next_cursor,
    ...overrides.header,
  };
};


test("builder do HORN emite um cabeçalho de dez critérios já validado", () => {
  const goalReceipt = fixedPointTenGoalReceipt();
  const result = buildFixedPointExecutionHeader({
    agent_id: "hermes",
    mission_id: "mission-1",
    intent_id: "intent-1",
    goal_fingerprint: "fingerprint-1",
    observed_head: "a".repeat(40),
    evaluation_ref: "receipt:builder-test",
    execution_ref: "execution:builder-test",
    criteria: fixedPointTenCriteria(),
    goal_receipt: goalReceipt,
  }, { nowMs: fixedNow, maxAgeMs: 5000 });
  assert.equal(result.accepted, true);
  assert.equal(result.header_usage, "USED_AND_FIXED_POINT");
  assert.equal(result.header.criteria.length, 10);
  assert.equal(result.header.verdict, "FIXED_POINT");
});

test("builder sem contexto de agente não pode fabricar cabeçalho", () => {
  const result = buildFixedPointExecutionHeader({ criteria: fixedPointTenCriteria() }, {
    nowMs: fixedNow, maxAgeMs: 5000,
  });
  assert.equal(result.accepted, false);
  assert.equal(result.header_usage, "NOT_USED");
  assert.equal(result.status, "BLOCKED_FIXED_POINT_EXECUTION_HEADER_FIELDS_MISSING");
});

test("cabeçalho de execução valida dez tentativas reais e inclui o receipt de uso", () => {
  const header = makeFixedPointExecutionHeader();
  const result = validateFixedPointExecutionHeader(header, {
    nowMs: fixedNow, maxAgeMs: 5000,
    expectedMissionId: "mission-1", expectedHead: "a".repeat(40),
  });
  assert.equal(result.accepted, true);
  assert.equal(result.status, "PASS_FIXED_POINT_EXECUTION_HEADER");
  assert.equal(result.header_usage, "USED_AND_FIXED_POINT");
  assert.equal(result.criteria_count, 10);
  assert.equal(result.criteria_pass, 10);
  assert.equal(result.verdict, "FIXED_POINT");
  assert.equal(result.next_cursor, "FIXED_POINT");
});

test("cabeçalho com dez tentativas documentadas e uma lacuna é USED_WITH_GAPS, não FIXED_POINT", () => {
  const criteria = fixedPointTenCriteria({
    LOCKS_PRESERVED: {
      status: "UNKNOWN", source_sha: undefined, proof_ref: undefined,
      counterproof_ref: undefined, counterproof_verdict: "UNKNOWN",
      reason: "A sonda executou, mas não retornou receipt atual do inventário.",
    },
  });
  const header = makeFixedPointExecutionHeader({ criteria });
  const result = validateFixedPointExecutionHeader(header, {
    nowMs: fixedNow, maxAgeMs: 5000,
    expectedMissionId: "mission-1", expectedHead: "a".repeat(40),
  });
  assert.equal(result.accepted, true);
  assert.equal(result.header_usage, "USED_WITH_GAPS");
  assert.equal(result.criteria_count, 10);
  assert.equal(result.criteria_unknown, 1);
  assert.equal(result.verdict, "NEXT_DELTA");
  assert.equal(result.next_cursor, "VERIFY_LOCKS_PRESERVED");
});

test("dez nomes sem tentativa atual são HEADER_NOT_USED", () => {
  const header = makeFixedPointExecutionHeader();
  header.criteria[4].attempt_ref = "";
  const result = validateFixedPointExecutionHeader(header, {
    nowMs: fixedNow, maxAgeMs: 5000,
  });
  assert.equal(result.accepted, false);
  assert.equal(result.status, "BLOCKED_FIXED_POINT_EXECUTION_HEADER_CRITERION_NOT_ACTUALLY_MEASURED");
  assert.equal(result.header_usage, "NOT_USED");
});

test("cabeçalho não pode declarar PASS sem prova nem declarar FIXED_POINT com status divergente", () => {
  const header = makeFixedPointExecutionHeader();
  header.criteria[0].proof_ref = "";
  const result = validateFixedPointExecutionHeader(header, {
    nowMs: fixedNow, maxAgeMs: 5000,
  });
  assert.equal(result.accepted, false);
  assert.equal(result.status, "BLOCKED_FIXED_POINT_EXECUTION_HEADER_CLAIM_UNPROVEN");
});

test("global Fixed Point exige os mesmos dez critérios nomeados pelo HUD e Goal receipt canônico", () => {
  assert.equal(FIXED_POINT_TEN_CRITERIA.length, 10);
  const result = evaluateFixedPointTen({
    criteria: fixedPointTenCriteria(),
    goalReceipt: fixedPointTenGoalReceipt(),
  }, { nowMs: fixedNow, maxAgeMs: 5000 });
  assert.equal(result.total, 10);
  assert.equal(result.required_pass, 10);
  assert.equal(result.verdict, "FIXED_POINT");
  assert.equal(result.fixedPoint, true);
  assert.equal(result.next_cursor, "FIXED_POINT");
  assert.deepEqual(result.criteria.map((row) => row.id), FIXED_POINT_TEN_CRITERIA.map((row) => row.id));
});

test("os dois avaliadores restantes são critérios obrigatórios e não viram PASS só por existir um caminho", () => {
  const rows = fixedPointTenCriteria({
    FORENSIC_FRESHNESS: { status: "UNKNOWN", source_sha: undefined, proof_ref: undefined, counterproof_ref: undefined, counterproof_verdict: "UNKNOWN" },
    RECEIPT_PRESENT: { status: "UNKNOWN", source_sha: undefined, proof_ref: undefined, counterproof_ref: undefined, counterproof_verdict: "UNKNOWN" },
  });
  const result = evaluateFixedPointTen({
    criteria: rows,
    goalReceipt: fixedPointTenGoalReceipt(),
  }, { nowMs: fixedNow, maxAgeMs: 5000 });
  assert.equal(result.required_pass, 8);
  assert.equal(result.criteria.find((row) => row.id === "FORENSIC_FRESHNESS").status, "UNKNOWN");
  assert.equal(result.criteria.find((row) => row.id === "RECEIPT_PRESENT").status, "UNKNOWN");
  assert.equal(result.fixedPoint, false);
  assert.equal(result.next_cursor, "VERIFY_FORENSIC_FRESHNESS");
});

test("Fixed Point de dez não fecha sem receipt de Goal mesmo quando os dez critérios passam", () => {
  const result = evaluateFixedPointTen({ criteria: fixedPointTenCriteria() }, {
    nowMs: fixedNow, maxAgeMs: 5000,
  });
  assert.equal(result.required_pass, 10);
  assert.equal(result.goal_receipt_status, "UNKNOWN");
  assert.equal(result.fixedPoint, false);
  assert.equal(result.next_cursor, "GOAL_RECEIPT_REQUIRED");
});

test("critério sem contraprova, receipt repetido ou medição vencida nunca sela os dez", () => {
  const missingCounterproof = fixedPointTenCriteria({
    RECEIPT_PRESENT: { counterproof_ref: "", counterproof_verdict: "UNKNOWN" },
  });
  const partial = evaluateFixedPointTen({
    criteria: missingCounterproof,
    goalReceipt: fixedPointTenGoalReceipt(),
  }, { nowMs: fixedNow, maxAgeMs: 5000 });
  assert.equal(partial.criteria.find((row) => row.id === "RECEIPT_PRESENT").status, "UNKNOWN");
  assert.equal(partial.fixedPoint, false);

  assert.throws(() => evaluateFixedPointTen({
    criteria: [...fixedPointTenCriteria(), fixedPointTenCriteria()[0]],
    goalReceipt: fixedPointTenGoalReceipt(),
  }, { nowMs: fixedNow, maxAgeMs: 5000 }), /FIXED_POINT_TEN_DUPLICATE_CRITERION/);

  const stale = evaluateFixedPointTen({
    criteria: fixedPointTenCriteria(),
    goalReceipt: fixedPointTenGoalReceipt(),
  }, { nowMs: fixedNow + 6000, maxAgeMs: 5000 });
  assert.equal(stale.criteria[0].status, "STALE");
  assert.equal(stale.fixedPoint, false);
});



test("HUD, telemetria e HORN compartilham exatamente os mesmos dez IDs de Fixed Point", () => {
  const telemetry = readFileSync("apps/modulos/mcp/src/operational-telemetry.js", "utf8");
  const hud = readFileSync("docs/HUD/HUD.html", "utf8");
  const expected = FIXED_POINT_TEN_CRITERIA.map((criterion) => criterion.id);
  const expectedHudKeys = [
    "OWNER_UNIQUE", "LOCKS_PRESERVED", "MCP_PUBLIC_HEALTH", "ONE_HEART_FRESH",
    "SCREENPIPE_CURRENT", "AIONUI_STDIO_CURRENT", "LOG_PRIVACY_CURRENT",
    "CHECKOUT_MAIN_SYNC", "FORENSIC_FRESHNESS", "RECEIPT_PRESENT",
  ];
  assert.deepEqual(expected, expectedHudKeys);
  for (const id of expected) {
    assert.ok(telemetry.includes('"' + id + '"'), 'telemetry owner missing ' + id);
    assert.ok(hud.includes(id), 'HUD projection missing ' + id);
  }
  assert.match(telemetry, /fixedPointTenEvidence/);
  assert.ok(hud.includes("window.CENTRALDARK_OPERATIONAL_CURRENT"));
  assert.ok(hud.includes("fp.fixedPoint===true"));
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


test("oracle surface converts no-progress loops into bounded replay recipes", () => {
  const oracle = readFileSync(".agents/skills/software-development/centraldark-oracle-surface/SKILL.md", "utf8");
  for (const marker of [
    "RALPH_STYLE_BOUNDED_RECIPE_LOOP=true",
    "BLIND_RETRY_FORBIDDEN=true",
    "NO_PROGRESS_REQUIRES_RECIPE_OR_EXACT_BLOCKER=true",
    "ONE_IDENTICAL_REPLAY_MAX=1",
    "SAME_FAILURE_FINGERPRINT_REUSES_PROVEN_RECIPE=true",
    "SKILL_EVOLVES_ONLY_ON_GENERALIZABLE_PROVEN_DELTA=true",
    "MAIN_FIRST_SKILL_PROMOTION=true",
    "RETURN_TO_SAME_GOAL",
  ]) {
    assert.ok(oracle.includes(marker), marker);
  }
  assert.match(oracle, /skill-synchronization/);
  assert.match(oracle, /scripts\/skill-sync-check\.sh/);
  assert.match(oracle, /does not add a Ralph engine/);
});


test("oracle skill preserves SOL_EXECUTORA direct handoff without granting oracle write authority", () => {
  const oracle = readFileSync(".agents/skills/software-development/centraldark-oracle-surface/SKILL.md", "utf8");
  for (const marker of [
    "SOL_EXECUTORA_CROSS_SURFACE_HANDOFF=true",
    "HERMES_ORIGINAL_PRIORITY=true",
    "EXECUTOR_DIRECT_WHEN_AUTHORIZED=true",
    "PAPAGAIO_MODE=OFF",
    "RITUAL_MODE=OFF",
    "MENU_MODE=OFF",
    "ASK_MODE=OFF_FOR_CLEAR_AUTHORIZED_SCOPE",
    "ONE_WRITER_PER_SCOPE=true",
    "UNKNOWN_IS_NOT_PASS=true",
    "ACTION_IS_NOT_PROOF=true",
    "ROUTE_FAIL",
    "VOLTA_UMA_CASA",
    "COSTURA_SURVIVING_PROOF_AND_NEXT_CURSOR",
    "STOP_WRITE",
    "SUFFICIENT_OBJECTIVE_OR_NEXT_CURSOR",
    "ORACLE_CANNOT_WRITE_CANONICAL_STATE_DIRECTLY=true",
  ]) assert.ok(oracle.includes(marker), marker);
  assert.match(oracle, /HERMES_RESULT=UNKNOWN/);
  assert.match(oracle, /CAPABILITY != AUTHORIZATION/);
  assert.match(oracle, /not a second proof writer/);
});
