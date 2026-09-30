import test from "node:test";
import assert from "node:assert/strict";
import { decideReuseBeforeCreate, hornFixedPoint, REUSE_HORN_CONTRACT } from "../src/tools/aprendizado/reuse-horn-core.js";

test("Horn propaga até ponto fixo estável", () => {
    const out = hornFixedPoint(["A"], [
        { id: "r1", when: ["A"], then: "B" },
        { id: "r2", when: ["B"], then: "C" },
    ]);
    assert.equal(out.stable, true);
    assert.deepEqual(out.facts, ["A", "B", "C"]);
    assert.equal(out.rounds >= 2, true);
});

test("owner+capability existentes no mesmo escopo convergem para EXTEND_EXISTING", () => {
    const out = decideReuseBeforeCreate({
        capability: "MCP OAuth",
        scope: "apps/modulos/mcp",
        owner_present: true,
        capability_present: true,
        same_scope: true,
        evidence_present: true,
        regression_absent: true,
    });
    assert.equal(out.decision, "EXTEND_EXISTING");
    assert.equal(out.pass, true);
    assert.ok(out.fixed_point.facts.includes("REUSE_REQUIRED"));
});

test("criação mínima só nasce quando owner e capability são gap medidos", () => {
    const out = decideReuseBeforeCreate({
        capability: "capacidade realmente nova",
        scope: "novo escopo medido",
        owner_present: false,
        capability_present: false,
        same_scope: false,
        evidence_present: true,
        regression_absent: true,
    });
    assert.equal(out.decision, "CREATE_MINIMAL");
    assert.equal(out.pass, true);
});

test("UNKNOWN nunca vira PASS", () => {
    const out = decideReuseBeforeCreate({
        capability: "MCP OAuth",
        scope: "apps/modulos/mcp",
        owner_present: true,
        capability_present: true,
        same_scope: true,
        evidence_present: false,
        regression_absent: false,
    });
    assert.equal(out.decision, "BLOCKED_UNKNOWN");
    assert.equal(out.pass, false);
    assert.equal(out.measurable.unknown_is_not_pass, false);
});

test("erro observado exige aprendizado + receipt antes do verde", () => {
    const blocked = decideReuseBeforeCreate({
        capability: "OAuth invalid_client",
        scope: "apps/modulos/mcp",
        owner_present: true,
        capability_present: true,
        same_scope: true,
        evidence_present: true,
        regression_absent: true,
        error_observed: true,
        learning_present: false,
        receipt_present: false,
    });
    assert.equal(blocked.pass, false);
    assert.ok(blocked.fixed_point.facts.includes("LEARNING_REQUIRED"));

    const closed = decideReuseBeforeCreate({
        capability: "OAuth invalid_client",
        scope: "apps/modulos/mcp",
        owner_present: true,
        capability_present: true,
        same_scope: true,
        evidence_present: true,
        regression_absent: true,
        error_observed: true,
        learning_present: true,
        receipt_present: true,
    });
    assert.equal(closed.decision, "EXTEND_EXISTING");
    assert.equal(closed.pass, true);
    assert.ok(closed.fixed_point.facts.includes("LEARNING_REUSABLE"));
});

test("contrato fica ligado à metodologia PDF/Horn medida", () => {
    assert.equal(REUSE_HORN_CONTRACT.method, "HORN_FORWARD_CHAINING_TO_FIXED_POINT");
    assert.equal(REUSE_HORN_CONTRACT.source_sha256, "b4e2a0655b7e0c85ca329c33971b377299dde6358779270c573f014f3aa606d1");
    assert.ok(REUSE_HORN_CONTRACT.invariants.includes("REUSE_BEFORE_CREATE"));
    assert.ok(REUSE_HORN_CONTRACT.invariants.includes("UNKNOWN_IS_NOT_PASS"));
});
