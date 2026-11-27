import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import express from "express";
const moduleTarget = process.env.CENTRALDARK_PAIRING_TEST_TARGET || "src";
assert.ok(moduleTarget === "src" || moduleTarget === "dist", "Invalid pairing test target");
const { DESKTOP_SURFACE, DESKTOP_ORIGIN, SUPABASE_ORIGIN, getDesktopPairingConfig } = await import(`../${moduleTarget}/desktop-pairing-config.js`);
const { createDevicePairingStore, createDevicePairingRouter } = await import(`../${moduleTarget}/device-pairing.js`);

const env = {CENTRALDARK_DESKTOP_PAIRING_ENABLED:"1",HUB_SUPABASE_URL:SUPABASE_ORIGIN,HUB_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_test"};
test("descoberta fecha sem habilitação e rejeita outra origem/chave privilegiada",()=>{
  assert.equal(getDesktopPairingConfig({}),null);
  assert.equal(getDesktopPairingConfig({...env,HUB_SUPABASE_URL:"https://other.supabase.co"}),null);
  assert.equal(getDesktopPairingConfig({...env,HUB_SUPABASE_PUBLISHABLE_KEY:"sb_secret_test"}),null);
  assert.equal(getDesktopPairingConfig(env).pairingOnly,true);
});
test("desktop exige dono, nonce, código, posse; prova não concede execução, refresh nem online",()=>{
  const dir=mkdtempSync(join(tmpdir(),"cd-desktop-test-"));
  let now=Date.now();
  const store=createDevicePairingStore({registryPath:join(dir,"registry.json"),now:()=>now});
  try{
    const pair=store.start({deviceName:"test",executor:"remote-bridge",surface:DESKTOP_SURFACE});
    const consent=store.pendingConsent(pair.pairId);
    const request={pairId:pair.pairId,code:pair.code,nonce:consent.nonce,ownerUserId:"00000000-0000-4000-8000-000000000001"};
    assert.equal(store.approve({pairId:pair.pairId,code:pair.code}).ok,false);
    assert.equal(store.approveWeb({...request,nonce:"wrong"}).ok,false);
    assert.equal(store.approveWeb({...request,code:"wrong"}).ok,false);
    assert.equal(store.status({pairId:pair.pairId,pairSecret:"wrong"}).status,"denied");
    assert.equal(store.approveWeb(request).ok,true);
    assert.equal(store.approveWeb(request).ok,false);
    const auth=store.status({pairId:pair.pairId,pairSecret:pair.pairSecret});
    assert.ok(auth.token);
    assert.equal(store.status({pairId:pair.pairId,pairSecret:pair.pairSecret}).token,undefined);
    assert.equal(store.listDevices()[0].owner_user_id,request.ownerUserId);
    assert.equal(store.checkDesktopSession({token:auth.token,deviceId:"other"}).ok,false);
    assert.equal(store.checkDesktopSession({token:"wrong",deviceId:auth.device_id}).ok,false);
    assert.equal(store.checkDesktopSession({token:auth.token,deviceId:auth.device_id}).ok,true);
    assert.equal(store.heartbeat({token:auth.token}).ok,false);
    assert.equal(store.refresh({refreshToken:auth.refresh_token}).ok,false);
    assert.equal(store.listDevices()[0].status,"offline");
    now+=300001;
    assert.equal(store.checkDesktopSession({token:auth.token,deviceId:auth.device_id}).ok,false);
    assert.equal(store.revokeSelf({token:auth.token,deviceId:auth.device_id}).ok,true);
    assert.equal(store.listDevices().length,0);
  } finally {rmSync(dir,{recursive:true,force:true});}
});
test("HTTP local: mesma store, origin MCP e Supabase mock, sem rede externa",async()=>{
  const dir=mkdtempSync(join(tmpdir(),"cd-desktop-http-"));
  const originalFetch=globalThis.fetch;
  const backup={};
  for(const [key,value] of Object.entries({...env,MCP_STATE_FILE:join(dir,"sessions.json"),MCP_SESSION_SECRET:"test-only-secret",MCP_ADMIN_COOKIE_SECRET:"test-only-cookie",MCP_PUBLIC_URL:"http://127.0.0.1"})){backup[key]=process.env[key];process.env[key]=value;}
  let server;
  try {
    const {handleAuthorize,configureDevicePairingForOAuth}=await import(`../${moduleTarget}/oauth.js`);
    const store=createDevicePairingStore({registryPath:join(dir,"registry.json")});
    configureDevicePairingForOAuth(store);
    const app=express();
    app.use(express.json());app.use(express.urlencoded({extended:false}));
    app.get("/authorize",handleAuthorize);app.post("/authorize",handleAuthorize);
    app.use("/device",createDevicePairingRouter({store}));
    server=await new Promise(resolve=>{const listener=app.listen(0,"127.0.0.1",()=>resolve(listener));});
    const base="http://127.0.0.1:"+server.address().port;
    const owner="00000000-0000-4000-8000-000000000001";
    let role="member";
    globalThis.fetch=async(input,opts)=>{
      const url=new URL(input);
      if(url.origin!==SUPABASE_ORIGIN) return originalFetch(input,opts);
      assert.equal(opts.redirect,"error");
      if(url.pathname==="/auth/v1/user")return Response.json({id:owner,is_anonymous:false});
      if(url.pathname==="/rest/v1/user_roles")return Response.json(role==="admin"?[{role:"admin"}]:[]);
      throw Error("unexpected request");
    };
    const post=(path,body,headers={})=>originalFetch(base+path,{method:"POST",headers:{"Content-Type":"application/json",...headers},body:JSON.stringify(body),redirect:"manual"});
    assert.equal((await post("/device/pair/start",{surface:DESKTOP_SURFACE})).status,400);
    const start=await post("/device/desktop/start",{device_name:"test"});
    assert.equal(start.status,201);
    const pair=await start.json();
    const page=await originalFetch(base+"/authorize?"+new URLSearchParams({client_id:"centraldark.remote-bridge",pair_id:pair.pair_id}),{redirect:"manual"});
    assert.equal(page.status,302);
    const target=new URL(page.headers.get("location"));
    assert.equal(target.origin,DESKTOP_ORIGIN);
    assert.equal(target.pathname,"/mcp-autorizar");
    assert.equal(target.searchParams.has("pair_code"),false);
    assert.equal(target.searchParams.has("pair_secret"),false);
    const body={client_id:"centraldark.remote-bridge",pair_id:pair.pair_id,pair_code:pair.code,pair_nonce:target.searchParams.get("pair_nonce")};
    const headers={Origin:DESKTOP_ORIGIN,Accept:"application/json",Authorization:"Bearer "+"a".repeat(64)};
    assert.equal((await post("/authorize",body,{...headers,Origin:"https://admin.centralldark.com"})).status,403);
    assert.equal((await post("/authorize",body,headers)).status,403);
    role="admin";
    assert.equal((await post("/authorize",body,headers)).status,200);
    const auth=await (await post("/device/pair/status",{id:pair.pair_id,secret:pair.pair_secret})).json();
    assert.ok(auth.token);
    assert.equal((await post("/device/desktop/session/check",{device_id:auth.device_id},{Authorization:"Bearer "+auth.token})).status,200);
    assert.equal((await post("/device/devices/self/revoke",{device_id:auth.device_id},{Authorization:"Bearer "+auth.token})).status,200);
    assert.equal((await post("/device/desktop/session/check",{device_id:auth.device_id},{Authorization:"Bearer "+auth.token})).status,401);
    // Compatibility: the already deployed mcp-v1 route selects the new consent
    // origin for legacy Remote Bridge only, never grants authorization itself.
    const legacy=await (await post("/device/pair/start",{device_name:"legacy",executor:"remote-bridge",surface:"remote-bridge"})).json();
    const legacyUrl=base+"/authorize?"+new URLSearchParams({client_id:"centraldark.remote-bridge",pair_id:legacy.pair_id});
    const oldPage=await originalFetch(legacyUrl,{redirect:"manual"});
    assert.equal(new URL(oldPage.headers.get("location")).origin,"https://admin.centralldark.com");
    const nativePage=await originalFetch(legacyUrl,{redirect:"manual",headers:{"x-centraldark-pairing-route":"mcp-v1"}});
    const nativeTarget=new URL(nativePage.headers.get("location"));
    assert.equal(nativeTarget.origin,DESKTOP_ORIGIN);
    assert.equal(nativeTarget.searchParams.has("pair_code"),false);
    assert.equal(nativeTarget.searchParams.has("pair_secret"),false);
    const legacyBody={client_id:"centraldark.remote-bridge",pair_id:legacy.pair_id,pair_code:legacy.code,pair_nonce:nativeTarget.searchParams.get("pair_nonce")};
    role="member";
    assert.equal((await post("/authorize",legacyBody,headers)).status,403);
    role="admin";
    assert.equal((await post("/authorize",{...legacyBody,pair_nonce:"wrong"},headers)).status,403);
    assert.equal((await post("/authorize",legacyBody,{...headers,Origin:"https://untrusted.example"})).status,403);
    delete process.env.CENTRALDARK_DESKTOP_PAIRING_ENABLED;
    assert.equal((await post("/authorize",legacyBody,headers)).status,503);
    process.env.CENTRALDARK_DESKTOP_PAIRING_ENABLED="1";
    assert.equal((await post("/authorize",legacyBody,headers)).status,200);
    const legacyAuth=await (await post("/device/pair/status",{id:legacy.pair_id,secret:legacy.pair_secret})).json();
    assert.ok(legacyAuth.token);
    assert.equal((await post("/device/desktop/session/check",{device_id:legacyAuth.device_id},{Authorization:"Bearer "+legacyAuth.token})).status,401);
    assert.equal((await post("/device/devices/self/revoke",{device_id:legacyAuth.device_id},{Authorization:"Bearer "+legacyAuth.token})).status,200);
  } finally {
    globalThis.fetch=originalFetch;
    if(server)await new Promise(resolve=>server.close(resolve));
    for(const [key,value] of Object.entries(backup)){if(value===undefined)delete process.env[key];else process.env[key]=value;}
    rmSync(dir,{recursive:true,force:true});
  }
});
