import assert from "node:assert/strict";
import test from "node:test";
import { centraldarkCapabilityTools, __centraldarkCapabilityTest } from "../src/tools/deploy/centraldark-capabilities.js";

test("expõe as 6 capacidades CentralDark", () => {
  const names = centraldarkCapabilityTools.map((tool) => tool.name).sort();
  assert.deepEqual(names, [
    "centraldark_deploy_apply_learning",
    "centraldark_deploy_capabilities",
    "centraldark_deploy_micro_fallback",
    "centraldark_deploy_recipe_status",
    "centraldark_deploy_root_gate",
    "centraldark_deploy_scratch_status",
  ]);
});

test("mutação fica marcada como destrutiva", () => {
  const apply = centraldarkCapabilityTools.find((t) => t.name === "centraldark_deploy_apply_learning");
  const micro = centraldarkCapabilityTools.find((t) => t.name === "centraldark_deploy_micro_fallback");
  assert.equal(apply.annotations.destructiveHint, true);
  assert.equal(micro.annotations.destructiveHint, true);
});

test("fileset não escapa do owner", () => {
  assert.equal(__centraldarkCapabilityTest.validateOwnerFile("mcp", "apps/modulos/mcp/dist/index.js"), "apps/modulos/mcp/dist/index.js");
  assert.throws(() => __centraldarkCapabilityTest.validateOwnerFile("mcp", "apps/bot-telegram/unified-bot.cjs"), /FILE_OUTSIDE_OWNER_SCOPE/);
  assert.throws(() => __centraldarkCapabilityTest.validateOwnerFile("mcp", "../etc/passwd"), /FILESET_PATH_INVALID/);
  assert.throws(() => __centraldarkCapabilityTest.validateOwnerFile("mcp", "apps/modulos/mcp/.env"), /FILESET_SENSITIVE_PATH_BLOCKED/);
});

test("confirmações executoras são explícitas", () => {
  assert.equal(__centraldarkCapabilityTest.APPLY_CONFIRM, "APLICAR APRENDIZADO VPS");
  assert.equal(__centraldarkCapabilityTest.MICRO_CONFIRM, "EXECUTAR MICRODEPLOY");
});
