import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../../../../");
const contractPath = resolve(root, ".agents/skills/autonomous-ai-agents/hermes-agent/references/centraldark-delegacao-tipado.json");
const contract = JSON.parse(readFileSync(contractPath, "utf8"));

test("o Hermes reutiliza um owner com procedimentos tipados", () => {
  assert.equal(contract.owner, ".agents/skills/autonomous-ai-agents/hermes-agent/SKILL.md");
  assert.equal(contract.procedures.length, 12);
  assert.equal(new Set(contract.procedures.map(p => p.id)).size, contract.procedures.length);
  for (const p of contract.procedures) {
    for (const field of ["id","owner","input","output","proof","condition"])
      assert.equal(typeof p[field], "string", p.id + "." + field + " sem tipo");
  }
});

test("identidade, autorizacao e execucao sao estados distintos", () => {
  for (const law of ["MCP_OAUTH_NE_GITHUB_OAUTH","GITHUB_APP_INSTALLATION_NE_USER_AUTHORIZATION",
    "SKILL_DISCOVERED_NE_LOADED","HERMES_SPAWNED_NE_COMPLETED","UNKNOWN_NE_PASS"])
    assert.ok(contract.invariants.includes(law), law);
  assert.equal(contract.authorization_laws.client_receives_token, false);
  assert.equal(contract.authorization_laws.github_oauth_broker_is_separate_from_mcp_client_oauth, true);
  assert.equal(contract.authorization_laws.github_app_and_oauth_app_modes_must_be_identified_before_binding, true);
  assert.equal(contract.no_secrets, true);
});

test("envelope, gates e continuidade ficam completos no mesmo owner", () => {
  assert.deepEqual(contract.envelope_required,
    ["INTENT_ID","GOAL","OWNER","MAIN_SHA","PR_HEAD","ACTIVE_WRITER","STATUS","RECEIPT","NEXT_CURSOR"]);
  assert.deepEqual(contract.capability_states,
    ["DISCOVERED","LOADABLE","LOADED","EXECUTABLE","EXECUTED","VERIFIED"]);
  for (const id of ["FIND_CAPABILITIES","RESOLVE_IDENTITY","VALIDATE_GITHUB_PERMISSION",
      "DEDUP_KANBAN","DISPATCH_SAFE","OBSERVE_AND_COUNTERPROVE","RECEIPT_AND_REPLAY"])
    assert.ok(contract.procedures.some(p => p.id === id), id);
  assert.ok(contract.known_gaps.every(g => g.status === "NOT_PROVEN"));
});
