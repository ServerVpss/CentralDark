import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { createRequire } from "node:module";
import { EventEmitter, once } from "node:events";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
const require = createRequire(import.meta.url);
const fixtureURL = process.argv[2]
  ? resolve(process.argv[2]) : new URL("../canonical/CentralDark-Casa-Agent.mjs", import.meta.url);
const source = await readFile(fixtureURL, "utf8");

test("local grant is required and limits both bridge dispatch paths", async () => {
  let clock = 0;
  let dispatches = 0;
  let outcome = "ok";
  let sessions;
  const logs = [];
  const key = "fixture-transport-token-no-production";
  const trace = "0123456789abcdef0123456789abcdef";
  const path = resolve("fictional-test-directory");
  function spawn() {
    const child = new EventEmitter();
    child.stdout = new EventEmitter();
    child.stderr = new EventEmitter();
    child.stdin = { writable: true, write(line, cb) {
      const request = JSON.parse(line);
      cb?.();
      if (request.id == null) return;
      let result = {};
      if (request.method === "initialize" && outcome === "revoke-during-init") sessions.revokeLocal();
      if (request.method === "tools/call") {
        dispatches++;
        assert.equal(request.params.name, "list_directory");
        assert.equal(request.params.arguments.path, path);
        assert.equal(request.params.arguments.depth, 1);
        if (outcome === "revoke-in-flight") sessions.revokeLocal();
        if (outcome === "expire-in-flight") clock += 51;
        result = outcome === "error" ? { isError: true, content: [{type:"text",text:"private-error-fixture"}] }
          : { content: [{type:"text",text:"fixture-only"}] };
      }
      setImmediate(() => child.stdout.emit("data", Buffer.from(JSON.stringify({id:request.id,result}) + "\n")));
    }};
    return child;
  }
  const context = vm.createContext({
    process: { env: { CENTRALDARK_CASA_BRIDGE_TOKEN: key, CENTRALDARK_CASA_WRITE_ENABLED: "true",
      CENTRALDARK_CASA_ENGINE_ENTRY: "fixture-only" }, argv: [], platform: process.platform,
      execPath: process.execPath, stdout: {write(value) { logs.push(value); }} },
    setTimeout(fn, time) { return setTimeout(fn, time === 6000 ? 0 : time); },
    clearTimeout, Buffer, URL,
  });
  const mod = new vm.SourceTextModule(source,{context});
  await mod.link(spec => {
    const entries = Object.entries(spec === "node:child_process" ? {spawn} : require(spec));
    return new vm.SyntheticModule(entries.map(([name]) => name), function () {
      for (const [name, value] of entries) this.setExport(name, value);
    },{context});
  });
  await mod.evaluate();
  sessions = mod.namespace.createLocalSupportSessions({now: () => clock});
  const server = mod.namespace.createCasaAgent({supportSessions:sessions});
  server.listen(0,"127.0.0.1");
  await once(server,"listening");
  try {
    const base = "http://127.0.0.1:" + server.address().port;
    const credentials = {confirmed:true,operatorId:"operator-A",deviceId:"device-A",directory:path,ttlMs:50};
    const approve = (extra={}) => sessions.approveLocal({...credentials,...extra});
    const request = async ({grant, operator="operator-A", device="device-A", route="/tool",
      tool="list_directory", args={path}, auth=key, method="tools/call"}={}) => {
      const params = {name:tool,arguments:args};
      const payload = route === "/tool" ? params : {jsonrpc:"2.0",id:8,method,params};
      const res = await fetch(base + route, {method:"POST",headers:{
        "content-type":"application/json","x-centraldark-trace-id":trace,
        ...(auth ? {authorization:"Bearer " + auth} : {}),
        ...(grant ? {"x-centraldark-support-session":grant} : {}),
        "x-centraldark-support-operator":operator,"x-centraldark-support-device":device,
      }, body:JSON.stringify(payload)});
      return {status:res.status, body:await res.json()};
    };
    assert.throws(() => approve({confirmed:false}),/SUPPORT_CONSENT_INVALID/);
    assert.throws(() => approve({ttlMs:60_001}),/SUPPORT_CONSENT_INVALID/);
    assert.equal((await request({auth:""})).status,401);
    assert.equal((await request()).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal((await request({route:"/mcp"})).body.error.message,"SUPPORT_SESSION_DENIED");
    const catalog = await request({route:"/mcp",method:"tools/list"});
    assert.deepEqual(catalog.body.result.tools.map(x=>x.name),["list_directory"]);
    let grant = approve();
    assert.equal((await request({grant,device:"device-B"})).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal((await request({grant,operator:"operator-B"})).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal((await request({grant,tool:"write_file"})).body.error,"SUPPORT_SCOPE_DENIED");
    assert.equal((await request({grant,args:{path,depth:99}})).body.error,"SUPPORT_SCOPE_DENIED");
    assert.equal((await request({grant,args:{path:path+"-other"}})).body.error,"SUPPORT_SCOPE_DENIED");
    clock += 50;
    assert.equal((await request({grant})).body.error,"SUPPORT_SESSION_DENIED");
    grant = approve();
    sessions.revokeLocal();
    assert.equal((await request({grant})).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal(dispatches,0);
    outcome = "revoke-during-init";
    assert.equal((await request({grant:approve()})).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal(dispatches,0);
    outcome = "ok";
    grant = approve();
    const replies = await Promise.all([request({grant}),request({grant})]);
    assert.deepEqual(replies.map(r=>r.status).sort(),[200,403]);
    assert.equal(replies.find(r=>r.status===200).body.reference,"CD-"+trace);
    assert.equal(dispatches,1);
    grant = approve();
    outcome="error";
    const failure=await request({grant,route:"/mcp"});
    assert.equal(failure.body.error.message,"SUPPORT_READ_FAILED");
    assert.equal(failure.body.error.data.reference,"CD-"+trace);
    assert.equal(JSON.stringify(failure).includes("private-error-fixture"),false);
    outcome="revoke-in-flight";
    assert.equal((await request({grant:approve()})).body.error,"SUPPORT_SESSION_DENIED");
    outcome="expire-in-flight";
    assert.equal((await request({grant:approve()})).body.error,"SUPPORT_SESSION_DENIED");
    assert.equal(dispatches,4);
    assert.ok(logs.some(x => x.includes("PASS reference=CD-"+trace)));
    assert.ok(logs.some(x => x.includes("SUPPORT_READ_FAILED reference=CD-"+trace)));
    assert.ok(logs.some(x => x.includes("SUPPORT_SESSION_DENIED reference=CD-"+trace)));
    assert.equal(logs.some(x=>x.includes(key)||x.includes(grant)||x.includes(path)),false);
  } finally {
    await new Promise((resolve,reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
