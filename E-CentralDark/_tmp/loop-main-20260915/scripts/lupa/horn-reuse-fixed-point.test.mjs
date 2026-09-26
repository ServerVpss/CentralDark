import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { decideReuse, deriveFixedPoint } from "./horn-reuse-fixed-point.mjs";

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
