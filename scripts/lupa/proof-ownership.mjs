#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

export function validateProofOwnership(contract, { exists = () => true } = {}) {
  const errors = [];
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    return { ok: false, errors: ["PROOF_OWNERSHIP_CONTRACT_INVALID"] };
  }
  if (contract.schema_version !== 1) errors.push("PROOF_OWNERSHIP_SCHEMA_INVALID");
  if (contract.status !== "CANONICAL") errors.push("PROOF_OWNERSHIP_NOT_CANONICAL");
  if (contract.marker !== "PROOF_OWNERSHIP_REQUIRED") errors.push("PROOF_OWNERSHIP_MARKER_INVALID");

  const rules = contract.global_rules ?? {};
  const expectedRules = {
    self_validation_without_independent_counterproof: "UNPROVEN",
    circular_proof: "UNPROVEN",
    written_rule_without_consumer: "UNPROVEN",
    written_rule_without_prover: "UNPROVEN",
    prover_without_negative_test: "UNPROVEN",
    same_proof_class_multiple_owners: "BLOCKED_DUPLICATE_PROOF_OWNER",
    unknown_skipped_pending: "NOT_PASS",
    proof_graph_must_be_acyclic: true,
    proof_must_end_in_external_anchor: true,
    graph_structure_ok_is_not_invariant_proof: true,
    external_anchor_must_be_observed_by_responsible_prover: true,
  };
  for (const [key, expected] of Object.entries(expectedRules)) {
    if (rules[key] !== expected) errors.push(`PROOF_OWNERSHIP_RULE_INVALID:${key}`);
  }

  const invariants = Array.isArray(contract.invariants) ? contract.invariants : [];
  if (invariants.length === 0) errors.push("PROOF_OWNERSHIP_INVARIANTS_EMPTY");

  const ids = new Set();
  const ownerByClass = new Map();
  const byId = new Map();

  for (const invariant of invariants) {
    const required = ["id", "proof_class", "source", "consumer", "prover", "negative_test", "external_anchor", "independent_counterproof"];
    for (const field of required) {
      if (invariant?.[field] == null || invariant[field] === "") {
        errors.push(`PROOF_OWNERSHIP_FIELD_MISSING:${invariant?.id ?? "UNKNOWN"}:${field}`);
      }
    }
    if (!invariant?.id) continue;
    if (ids.has(invariant.id)) errors.push(`PROOF_OWNERSHIP_DUPLICATE_ID:${invariant.id}`);
    ids.add(invariant.id);
    byId.set(invariant.id, invariant);

    const proofClass = String(invariant.proof_class ?? "");
    const prover = String(invariant.prover ?? "");
    if (proofClass && prover) {
      const currentOwner = ownerByClass.get(proofClass);
      if (currentOwner && currentOwner !== prover) {
        errors.push(`PROOF_OWNERSHIP_DUPLICATE_OWNER:${proofClass}:${currentOwner}:${prover}`);
      } else {
        ownerByClass.set(proofClass, prover);
      }
    }

    if (invariant.independent_counterproof !== true) {
      errors.push(`PROOF_OWNERSHIP_COUNTERPROOF_MISSING:${invariant.id}`);
    }
    if (invariant.prover && invariant.negative_test && invariant.prover === invariant.negative_test) {
      errors.push(`PROOF_OWNERSHIP_SELF_TEST:${invariant.id}`);
    }
    if (invariant.prover && invariant.consumer && invariant.prover === invariant.consumer) {
      errors.push(`PROOF_OWNERSHIP_PROVER_IS_CONSUMER:${invariant.id}`);
    }
    if (!invariant.external_anchor || typeof invariant.external_anchor !== "object") {
      errors.push(`PROOF_OWNERSHIP_EXTERNAL_ANCHOR_MISSING:${invariant.id}`);
    } else {
      const kind = String(invariant.external_anchor.kind ?? "");
      const observation = String(invariant.external_anchor.observation ?? "");
      if (!kind || /validator_output|self/i.test(kind)) {
        errors.push(`PROOF_OWNERSHIP_EXTERNAL_ANCHOR_INVALID:${invariant.id}:${kind || "EMPTY"}`);
      }
      if (!observation) errors.push(`PROOF_OWNERSHIP_EXTERNAL_OBSERVATION_MISSING:${invariant.id}`);
    }

    for (const path of [invariant.source, invariant.consumer, invariant.prover, invariant.negative_test, invariant.external_anchor?.path]) {
      if (typeof path === "string" && path && !exists(path)) {
        errors.push(`PROOF_OWNERSHIP_PATH_MISSING:${invariant.id}:${path}`);
      }
    }
  }

  for (const invariant of invariants) {
    for (const dependency of invariant?.depends_on ?? []) {
      if (!byId.has(dependency)) errors.push(`PROOF_OWNERSHIP_UNKNOWN_DEPENDENCY:${invariant.id}:${dependency}`);
    }
  }

  const visiting = new Set();
  const visited = new Set();
  function visit(id) {
    if (visiting.has(id)) {
      errors.push(`PROOF_OWNERSHIP_CYCLE:${id}`);
      return;
    }
    if (visited.has(id)) return;
    visiting.add(id);
    const invariant = byId.get(id);
    for (const dependency of invariant?.depends_on ?? []) {
      if (byId.has(dependency)) visit(dependency);
    }
    visiting.delete(id);
    visited.add(id);
  }
  for (const id of byId.keys()) visit(id);

  return {
    ok: errors.length === 0,
    topology_only: true,
    invariant_proof: false,
    invariant_count: invariants.length,
    proof_classes: [...ownerByClass.keys()].sort(),
    errors,
  };
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith("--")) continue;
    out[argv[i].slice(2)] = argv[i + 1];
    i += 1;
  }
  return out;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isMain) {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args["repo-root"] ?? process.cwd());
  const contractPath = args.contract ?? "docs/CONSCIENCIA/PROOF-OWNERSHIP.json";
  let contract;
  try {
    contract = JSON.parse(readFileSync(join(root, contractPath), "utf8"));
  } catch (error) {
    console.error(`PROOF_OWNERSHIP_LOAD_ERROR=${error.message}`);
    process.exit(1);
  }
  const result = validateProofOwnership(contract, {
    exists: (relativePath) => existsSync(join(root, relativePath)),
  });
  for (const error of result.errors) console.error(`ERRO ${error}`);
  console.log(`PROOF_GRAPH_STRUCTURE_OK=${result.ok ? 1 : 0} TOPOLOGY_ONLY=1 INVARIANT_PROOF=0 INVARIANTS=${result.invariant_count} CLASSES=${result.proof_classes.length} ERROS=${result.errors.length}`);
  process.exit(result.ok ? 0 : 1);
}
