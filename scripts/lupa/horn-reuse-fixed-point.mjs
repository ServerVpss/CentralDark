#!/usr/bin/env node

import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

export const DEFAULT_RULES = Object.freeze([
  { id: "REUSE_FULL_FIT", if: ["EXISTING_OWNER", "SAME_INTENT", "FULL_FIT"], then: "REUSE" },
  { id: "EXTEND_PARTIAL_FIT", if: ["EXISTING_OWNER", "SAME_INTENT", "PARTIAL_FIT"], then: "EXTEND_MINIMALLY" },
  { id: "REUSE_KNOWN_REMEDY", if: ["ERROR_OBSERVED", "ERROR_SIGNATURE_KNOWN", "KNOWN_REMEDY"], then: "REUSE_REMEDIATION" },
  { id: "PROMOTE_PROVED_REMEDY", if: ["ERROR_OBSERVED", "NEW_REMEDY_PROVED"], then: "PROMOTE_LEARNING" },
  { id: "REUSE_PROMOTED_REMEDY", if: ["PROMOTE_LEARNING", "SAME_ERROR_SIGNATURE"], then: "REUSE_REMEDIATION" },
  { id: "REMEDIATION_IS_REUSE", if: ["REUSE_REMEDIATION"], then: "REUSE" },
  { id: "CREATE_ONLY_AFTER_PROVED_GAP", if: ["NO_EXISTING_OWNER_PROVED", "MATERIAL_GAP_PROVEN", "EXTEND_INSUFFICIENT"], then: "CREATE_MINIMAL" },
]);

export const DEFAULT_DENIALS = Object.freeze([
  { id: "OWNER_EXISTENCE_CONTRADICTION", if: ["EXISTING_OWNER", "NO_EXISTING_OWNER_PROVED"] },
  { id: "CREATE_AND_REUSE_CONTRADICTION", if: ["CREATE_MINIMAL", "REUSE"] },
  { id: "CREATE_AND_EXTEND_CONTRADICTION", if: ["CREATE_MINIMAL", "EXTEND_MINIMALLY"] },
  { id: "CREATE_WITH_SAME_OWNER_CONTRADICTION", if: ["CREATE_MINIMAL", "EXISTING_OWNER", "SAME_INTENT"] },
]);

const normalize = (value) => String(value || "").trim().toUpperCase();
const allPresent = (facts, required) => required.every((fact) => facts.has(normalize(fact)));

export function deriveFixedPoint({ facts = [], rules = DEFAULT_RULES, denials = DEFAULT_DENIALS } = {}) {
  const known = new Set(facts.map(normalize).filter(Boolean));
  const trace = [];
  const maxRounds = Math.max(4, rules.length + known.size + 4);

  const assertNoContradiction = () => {
    for (const denial of denials) {
      if (allPresent(known, denial.if)) {
        const error = new Error(`HORN_CONTRADICTION:${denial.id}`);
        error.code = "HORN_CONTRADICTION";
        error.denial = denial.id;
        error.facts = [...known].sort();
        throw error;
      }
    }
  };

  assertNoContradiction();

  let changed = true;
  let round = 0;
  while (changed) {
    changed = false;
    round += 1;
    if (round > maxRounds) throw new Error("HORN_FIXED_POINT_NOT_REACHED");

    for (const rule of rules) {
      const consequence = normalize(rule.then);
      if (!consequence || known.has(consequence)) continue;
      if (!allPresent(known, rule.if)) continue;
      known.add(consequence);
      trace.push({ round, rule: rule.id, then: consequence });
      changed = true;
      assertNoContradiction();
    }
  }

  return {
    rounds: round,
    facts: [...known].sort(),
    trace,
    fixedPoint: true,
  };
}

export function decideReuse(input = {}) {
  const facts = [];
  const mapping = {
    existingOwner: "EXISTING_OWNER",
    noExistingOwnerProved: "NO_EXISTING_OWNER_PROVED",
    sameIntent: "SAME_INTENT",
    fullFit: "FULL_FIT",
    partialFit: "PARTIAL_FIT",
    materialGapProven: "MATERIAL_GAP_PROVEN",
    extendInsufficient: "EXTEND_INSUFFICIENT",
    errorObserved: "ERROR_OBSERVED",
    errorSignatureKnown: "ERROR_SIGNATURE_KNOWN",
    knownRemedy: "KNOWN_REMEDY",
    newRemedyProved: "NEW_REMEDY_PROVED",
    sameErrorSignature: "SAME_ERROR_SIGNATURE",
  };

  for (const [key, fact] of Object.entries(mapping)) {
    if (input[key] === true) facts.push(fact);
  }

  const result = deriveFixedPoint({ facts });
  const set = new Set(result.facts);
  let decision = "UNKNOWN";
  if (set.has("CREATE_MINIMAL")) decision = "CREATE_MINIMAL";
  else if (set.has("EXTEND_MINIMALLY")) decision = "EXTEND_MINIMALLY";
  else if (set.has("REUSE")) decision = "REUSE";

  return { ...result, decision };
}

export function selfTest() {
  const reuse = decideReuse({ existingOwner: true, sameIntent: true, fullFit: true });
  if (reuse.decision !== "REUSE") throw new Error("SELF_TEST_REUSE_FAIL");

  const create = decideReuse({ noExistingOwnerProved: true, materialGapProven: true, extendInsufficient: true });
  if (create.decision !== "CREATE_MINIMAL") throw new Error("SELF_TEST_CREATE_FAIL");

  const learned = decideReuse({ errorObserved: true, newRemedyProved: true, sameErrorSignature: true });
  if (!learned.facts.includes("PROMOTE_LEARNING") || learned.decision !== "REUSE") {
    throw new Error("SELF_TEST_LEARNING_FAIL");
  }

  return true;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  if (process.argv.includes("--self-test")) {
    selfTest();
    console.log("HORN_REUSE_FIXED_POINT=PASS");
    console.log("REUSE_BEFORE_CREATE=ENFORCED_BY_RULE_SET");
    console.log("LEARN_AFTER_PROVED_ERROR=PASS");
  } else {
    const raw = process.argv.find((arg) => arg.startsWith("--input-json="));
    if (!raw) {
      console.error("usage: horn-reuse-fixed-point.mjs --self-test | --input-json='{...}'");
      process.exit(2);
    }
    const input = JSON.parse(raw.slice("--input-json=".length));
    console.log(JSON.stringify(decideReuse(input), null, 2));
  }
}
