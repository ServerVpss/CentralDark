import test from "node:test";
import assert from "node:assert/strict";

test("Casa agent is loopback-only, requires bearer, and blocks mutation by default", async () => {
  process.env.CENTRALDARK_CASA_BRIDGE_TOKEN = "test_only_abcdef0123456789abcdef012345";
  delete process.env.CENTRALDARK_CASA_WRITE_ENABLED;
  const { createCasaAgent } = await import("./CentralDark-Casa-Agent.mjs");
  const server = createCasaAgent();
  await new Promise(resolve => server.listen(0,"127.0.0.1",resolve));
  const base = "http://127.0.0.1:" + server.address().port;
  try {
    const health = await fetch(base+"/health");
    assert.equal(health.status,200);
    const initial = await health.json();
    assert.equal(initial.remote_vendor,false);
    assert.equal(initial.name,"CentralDark Casa Commander");
    assert.equal(initial.last_authorized_tool,null, "Nao inventar recibo antes de uma ferramenta real");
    assert.equal(initial.mqtt.enabled,false, "MQTT opt-in: off by default");
    assert.equal(initial.mqtt.connected,false);
    assert.equal(initial.mqtt.state,"DISABLED");
    const denied = await fetch(base+"/tool",{
      method:"POST",headers:{"content-type":"application/json"},
      body:JSON.stringify({name:"list_directory",arguments:{path:"F:\\_worktrees"}})
    });
    assert.equal(denied.status,401);
    assert.equal((await denied.json()).error,"CASA_BRIDGE_AUTH_REQUIRED");
    const blocked = await fetch(base+"/tool",{
      method:"POST",headers:{"content-type":"application/json","authorization":"Bearer "+process.env.CENTRALDARK_CASA_BRIDGE_TOKEN},
      body:JSON.stringify({name:"start_process",arguments:{command:"echo TEST"}})
    });
    assert.equal(blocked.status,403);
    assert.equal((await blocked.json()).error,"CASA_WRITE_DISABLED");
  } finally {
    await new Promise(resolve=>server.close(resolve));
  }
});
