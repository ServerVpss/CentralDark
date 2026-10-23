import test from "node:test";
import assert from "node:assert/strict";
import { githubTools } from "../src/tools/github/github-tools.js";
import { githubWriteTools } from "../src/tools/github/github-write.js";
import { assertNoRetiredCentralDarkHostedDeploy } from "../src/tools/github/github.js";

const tool = githubTools.find(x => x.name === "admin_ssh_microdeploy");
const sha = "0985a9468a8144f2b27e23bc0513b258d1e0fa00";
const admin = Object.freeze({
  admin: true, oauthScope: "openid admin", callerUser: "verified-test-admin",
  correlationId: "test-native-microdeploy", authProvenance: "verified_oauth_admin",
});
function unpack(result) { return JSON.parse(result.content[0].text); }

test("alias legado existe e nao libera apply", () => {
  assert.ok(tool);
  assert.equal(tool.annotations.destructiveHint, false);
  assert.equal(tool.inputSchema.safeParse({mode:"apply"}).success,false);
  assert.equal(tool.inputSchema.safeParse({mode:"dry_run",sourceSha:sha}).success,true);
});
test("sessao sem admin verificado nao ganha autorizacao", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("GitHub API nunca deve ser chamada"); };
  try {
    for (const ctx of [
      {...admin, admin:false}, {...admin, oauthScope:"openid"},
      {...admin, authProvenance:null}, {...admin, callerUser:null},
      {...admin, correlationId:null},
    ]) {
      const res=unpack(await tool.handler({mode:"probe",owner:"mcp"},ctx));
      assert.equal(res.status,"AUTHENTICATED_ADMIN_SESSION_REQUIRED");
    }
  } finally { globalThis.fetch=previous; }
});
test("status e probe so descrevem rota MCP VPS, sem job pago", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("GitHub API nunca deve ser chamada"); };
  try {
    for (const mode of ["status","probe"]) {
      const result=unpack(await tool.handler({mode,owner:"mcp"},admin));
      assert.equal(result.status,"NATIVE_ROUTE_CONFIGURED_NOT_EXECUTION_PROOF");
      assert.equal(result.nativeExecutor,"centraldark_deploy_micro_fallback");
      assert.equal(result.githubActionsRequired,false);
      assert.equal(result.hostedRunnerRequired,false);
      assert.equal(result.runtimeDeployProven,false);
    }
  } finally { globalThis.fetch=previous; }
});
test("dry_run prepara somente inputs, sem bypass do executor destrutivo", async () => {
  const previous = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("GitHub API nunca deve ser chamada"); };
  try {
    const src="apps/modulos/mcp/src/tools/github/github-tools.js";
    const dist="apps/modulos/mcp/dist/tools/github/github-tools.js";
    const invalid=unpack(await tool.handler({mode:"dry_run",owner:"mcp",sourceSha:sha,file:"../etc/passwd"},admin));
    assert.equal(invalid.status,"INVALID_CAUSAL_FILESET_OR_SOURCE_SHA");
    const missingSha=unpack(await tool.handler({mode:"dry_run",owner:"mcp",file:src+","+dist},admin));
    assert.equal(missingSha.status,"INVALID_CAUSAL_FILESET_OR_SOURCE_SHA");
    const incomplete=unpack(await tool.handler({mode:"dry_run",owner:"mcp",sourceSha:sha,file:src},admin));
    assert.equal(incomplete.status,"MCP_SOURCE_DIST_PAIR_REQUIRED");
    const plan=unpack(await tool.handler({mode:"dry_run",owner:"mcp",sourceSha:sha,file:src+","+dist},admin));
    assert.equal(plan.status,"NATIVE_PLAN_PREPARED_NOT_EXECUTED");
    assert.equal(plan.tool,"centraldark_deploy_micro_fallback");
    assert.deepEqual(plan.input,{owner:"mcp",sourceSha:sha,files:[src,dist],dryRun:true});
    assert.equal(plan.runtimeDeployProven,false);
  } finally { globalThis.fetch=previous; }
});

test("rota aposentada é bloqueada em todas as entradas, sem acessar GitHub", async () => {
  const prior=globalThis.fetch;
  globalThis.fetch=()=>{throw new Error("NETWORK_MUST_NOT_BE_USED");};
  try {
    const old=githubTools.find(x=>x.name==="github_dispatch");
    const other=githubWriteTools.find(x=>x.name==="github_dispatch_workflow");
    assert.ok(old);
    assert.ok(other);
    for (const wf of [
      "vps-ssh-exec.yml",
      ".github/workflows/vps-ssh-exec.yml",
      "301288932",
    ]) {
      assert.throws(
        ()=>assertNoRetiredCentralDarkHostedDeploy("ServerVpss","CentralDark",wf),
        /CENTRALDARK_HOSTED_DEPLOY_ROUTE_LOCKED/
      );
      await assert.rejects(
        old.handler({workflow:wf, owner:"ServerVpss", repo:"CentralDark"}, {token:"test"}),
        /CENTRALDARK_HOSTED_DEPLOY_ROUTE_LOCKED/
      );
      await assert.rejects(
        other.handler({workflow:wf, owner:"ServerVpss", repo:"CentralDark"}, {token:"test"}),
        /CENTRALDARK_HOSTED_DEPLOY_ROUTE_LOCKED/
      );
    }
    assert.doesNotThrow(()=>assertNoRetiredCentralDarkHostedDeploy("ServerVpss","CentralDark","vps-healthcheck.yml"));
    assert.doesNotThrow(()=>assertNoRetiredCentralDarkHostedDeploy("ServerVpss","clone-deck","vps-ssh-exec.yml"));
  } finally {globalThis.fetch=prior;}
});
