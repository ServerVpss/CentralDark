import assert from "node:assert/strict";
import test from "node:test";
import { centraldarkCapabilityTools, __centraldarkCapabilityTest, classifyCanonicalRecipeFirst } from "../src/tools/deploy/centraldark-capabilities.js";

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

test("prioridade zero global consulta receita antes de qualquer execucao e escolhe owner", () => {
  const doc = {
    global_recipe_priority:{enabled:true},
    primary_path:"mcp_centraldark_native_vps",
    execution_route:{
      executor_tool:"centraldark_deploy_micro_fallback",
      paid_github_hosted_runner_required:false,
    },
  };
  const deploy = classifyCanonicalRecipeFirst(doc, "centraldark_deploy_micro_fallback",
    {owner:"mcp",sourceSha:"a".repeat(40),files:["apps/modulos/mcp/dist/index.js"]});
  assert.equal(deploy.ok,true);
  assert.equal(deploy.priority,0);
  assert.equal(deploy.source,"docs/CONSCIENCIA/MICRO-DEPLOY/MAIN-PINNED-RUNTIME-FAST-PATH-FALLBACK.json");
  assert.ok(deploy.fingerprint);
  assert.equal(classifyCanonicalRecipeFirst(doc,"hermes_self_evolution",{}).source,
    "scripts/vps/hermes-self-evolution-current-model.sh");
  assert.equal(classifyCanonicalRecipeFirst(doc,"github_read",{}).status,
    "RECIPE_FIRST_GLOBAL_ENTRYPOINT");
  for (const wf of ["vps-ssh-exec.yml",".github/workflows/vps-ssh-exec.yml","301288932"]) {
    const out = classifyCanonicalRecipeFirst(doc,"github_dispatch_workflow",
      {owner:"ServerVpss",repo:"CentralDark",workflow:wf});
    assert.equal(out.ok,false);
    assert.equal(out.status,"CENTRALDARK_HOSTED_DEPLOY_ROUTE_LOCKED");
  }
  const missing = classifyCanonicalRecipeFirst(null,"centraldark_deploy_micro_fallback",{});
  assert.equal(missing.ok,false);
  assert.equal(missing.status,"CANONICAL_RECIPE_PRIORITY_NOT_LOADED");
});
test("microdeploy nativo não converte plano ou commit em implantação", async () => {
  const target = centraldarkCapabilityTools.find(t=>t.name==="centraldark_deploy_micro_fallback");
  const x = await target.handler({owner:"mcp",files:["apps/modulos/mcp/dist/index.js"],dryRun:true});
  const out=JSON.parse(x.content[0].text);
  if (out.status==="DRY_RUN") {
    assert.equal(out.plan.route,"MCP_CENTRALDARK_VPS_DIRECT");
    assert.equal(out.plan.hostedRunnerRequired,false);
    assert.equal(out.plan.recipeFirst,"RECIPE_FIRST_MATCHED");
  } else {
    assert.equal(out.status,"CANONICAL_RECIPE_PRIORITY_NOT_LOADED");
  }
});

test("bootstrap resiliente não reabre runner hosted quando recipe na VPS é antiga", () => {
  const stale={
    primary_path:"github_actions_canonical_deploy",
    execution_route:{},
  };
  const preview=classifyCanonicalRecipeFirst(stale,"centraldark_deploy_micro_fallback",
    {owner:"mcp",dryRun:true});
  assert.equal(preview.ok,true);
  assert.equal(preview.status,"NATIVE_MCP_RECIPE_LEGACY_COMPAT_NO_HOSTED");
  const applyWithoutSha=classifyCanonicalRecipeFirst(stale,"centraldark_deploy_micro_fallback",
    {owner:"mcp",dryRun:false});
  assert.equal(applyWithoutSha.ok,false);
  const applyPinned=classifyCanonicalRecipeFirst(stale,"centraldark_deploy_micro_fallback",
    {owner:"mcp",dryRun:false,sourceSha:"f".repeat(40)});
  assert.equal(applyPinned.ok,true);
  const hosted=classifyCanonicalRecipeFirst(stale,"github_dispatch",
    {owner:"ServerVpss",repo:"CentralDark",workflow:"301288932"});
  assert.equal(hosted.ok,false);
  assert.equal(hosted.status,"CENTRALDARK_HOSTED_DEPLOY_ROUTE_LOCKED");
});

test("diagnostico de receita nao fica bloqueado pelo proprio cadeado", () => {
  const stale={primary_path:"github_actions_canonical_deploy"};
  for (const name of ["centraldark_deploy_recipe_status","centraldark_deploy_capabilities",
    "centraldark_deploy_root_gate","centraldark_deploy_scratch_status",
    "admin_ssh_microdeploy"]) {
    const v=classifyCanonicalRecipeFirst(stale,name,{});
    assert.equal(v.ok,true);
    assert.equal(v.status,"CANONICAL_RECIPE_PRIORITY_NOT_LOADED");
  }
});
