// Real HTTP entrypoint, disposable fixtures; never uses production credentials.
import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash, randomBytes } from "node:crypto";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "node:net";
const origin = "https://mcp.centralldark.com";
const supabase = "https://lyoigsqluyktoclwdaft.supabase.co";
const ids = ["00000000-0000-4000-8000-000000000001","00000000-0000-4000-8000-000000000002","00000000-0000-4000-8000-000000000003"];
const target = process.env.CD_ACCOUNT_TEST_TARGET || "src";
assert.ok(["src","dist"].includes(target));
if (process.env.CD_ACCOUNT_TEST_CHILD === "1") {
    globalThis.fetch = async (input, options = {}) => {
        const url = new URL(input);
        if (url.origin !== supabase) throw Error("FIXTURE_EXTERNAL_NETWORK_DENIED");
        assert.equal(options.redirect, "error");
        const fixture = JSON.parse(readFileSync(process.env.CD_ACCOUNT_FIXTURE, "utf8"));
        const bearer = String(options.headers?.Authorization || "").replace(/^Bearer /,"");
        const account = fixture.accounts.find(a => a.bearer === bearer && a.active);
        if (!account) return Response.json({}, {status:401});
        if (url.pathname === "/auth/v1/user") return Response.json({id:account.id,is_anonymous:false});
        if (url.pathname === "/rest/v1/user_roles") {
            assert.equal(url.searchParams.get("user_id"),"eq."+account.id);
            assert.equal(url.searchParams.get("select"),"role");
            return Response.json(account.roles.map(role => ({role})));
        }
        return Response.json({}, {status:404});
    };
    await import("../"+target+"/index.js");
} else {
test("OAuth accounts on the actual HTTP entrypoint: role, scope, token exchange, catalog, isolation, refresh", {timeout:90000}, async t => {
    const dir = mkdtempSync(join(tmpdir(),"cd-account-oauth-"));
    const fixturePath = join(dir,"fixture.json");
    const statePath = join(dir,"state.json");
    const registryPath = join(dir,"devices.json");
    const exp = Math.floor(Date.now()/1000)+300;
    const encoded = x => Buffer.from(JSON.stringify(x)).toString("base64url");
    const accounts = ids.map((id,i)=>({id,active:true,roles:[["user"],["moderator"],["user","admin"]][i],
        bearer:encoded({alg:"HS256",typ:"JWT"})+"."+encoded({sub:id,iss:supabase+"/auth/v1",role:"authenticated",session_id:"10000000-0000-4000-8000-00000000000"+(i+1),exp})+".fixture_signature_"+(i+1)}));
    const fixture = {accounts};
    const save = () => writeFileSync(fixturePath,JSON.stringify(fixture),{mode:0o600});
    save();
    writeFileSync(registryPath,JSON.stringify({version:1,devices:[...ids.map((id,i)=>({
        device_id:"20000000-0000-4000-8000-00000000000"+(i+1),owner_user_id:id,device_name:"fixture-device-"+(i+1),
        executor:"remote-bridge",surface:"centraldark-desktop-commander",token_hash:"fixture_hash_"+i,refresh_token_hash:"fixture_refresh_"+i,token_expires_at:new Date(exp*1000).toISOString(),last_heartbeat:null
    })),{device_id:"20000000-0000-4000-8000-000000000004",owner_user_id:null,device_name:"legacy-unbound",last_heartbeat:null}]}));
    const probe = createServer();
    await new Promise(resolve => probe.listen(0,"127.0.0.1",resolve));
    const port = probe.address().port;
    await new Promise(resolve=>probe.close(resolve));
    const base = "http://127.0.0.1:"+port;
    // Explicit test-only credentials; do not inherit service or GH tokens.
    const env = {PATH:dir,HOME:dir,USERPROFILE:dir,NODE_ENV:"test",MCP_HOST:"127.0.0.1",MCP_PORT:String(port),
        MCP_PUBLIC_URL:origin,CENTRALDARK_ADMIN_KEY:"fixture_admin_key",MCP_SESSION_SECRET:"fixture_session_secret",
        MCP_ADMIN_COOKIE_SECRET:"fixture_cookie_secret",MCP_ADMIN_PASSWORD:"fixture_admin_password",
        HUB_SUPABASE_URL:supabase,HUB_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_fixture",
        MCP_STATE_FILE:statePath,CENTRALDARK_DEVICE_REGISTRY_PATH:registryPath,CENTRALDARK_DESKTOP_PAIRING_ENABLED:"1",
        CD_ACCOUNT_TEST_CHILD:"1",CD_ACCOUNT_TEST_TARGET:target,CD_ACCOUNT_FIXTURE:fixturePath};
    const child=spawn(process.execPath,[fileURLToPath(import.meta.url)],{env,stdio:["ignore","pipe","pipe"]});
    let childOutput="";
    child.stdout.on("data",d=>{childOutput=(childOutput+d.toString()).slice(-12000)});
    child.stderr.on("data",d=>{childOutput=(childOutput+d.toString()).slice(-12000)});
    const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const post=async(path,body,headers={})=>fetch(base+path,{method:"POST",redirect:"manual",signal:AbortSignal.timeout(10000),headers:{"content-type":"application/json",...headers},body:JSON.stringify(body)});
    const form=async(path,body,headers={})=>fetch(base+path,{method:"POST",redirect:"manual",signal:AbortSignal.timeout(10000),headers:{"content-type":"application/x-www-form-urlencoded",...headers},body:new URLSearchParams(body)});
    const consent=async(client,a,scope="mcp",overrides={},headers={})=>{
        const verifier=randomBytes(32).toString("base64url");
        const data={client_id:client,redirect_uri:base+"/callback",response_type:"code",code_challenge_method:"S256",
            code_challenge:createHash("sha256").update(verifier).digest("base64url"),scope,state:randomBytes(12).toString("hex"),...overrides};
        const response=await form("/authorize",data,{Origin:origin,Accept:"application/json",...(a?{Authorization:"Bearer "+a.bearer}:{}),...headers});
        return {response,data,verifier};
    };
    const authorize=async(client,a,scope="mcp")=>{
        const {response,data,verifier}=await consent(client,a,scope);
        assert.equal(response.status,200,"consent status");
        const reply=await response.json();
        assert.equal(reply.ok,true);
        assert.equal(JSON.stringify(reply).includes(a.bearer),false);
        const back=new URL(reply.redirect_to);
        assert.equal(back.origin,base);
        assert.equal(back.pathname,"/callback");
        assert.equal(back.searchParams.get("state"),data.state);
        const token=await form("/token",{grant_type:"authorization_code",client_id:client,redirect_uri:data.redirect_uri,code:back.searchParams.get("code"),code_verifier:verifier});
        assert.equal(token.status,200,"exchange status");
        const pair=await token.json();
        assert.match(pair.access_token,/^at_/);
        assert.match(pair.refresh_token,/^rt_/);
        assert.equal(pair.scope,scope);
        assert.ok(pair.expires_in>0&&pair.expires_in<=300);
        assert.equal(JSON.stringify(pair).includes(a.bearer),false);
        const replay=await form("/token",{grant_type:"authorization_code",client_id:client,redirect_uri:data.redirect_uri,code:back.searchParams.get("code"),code_verifier:verifier});
        assert.equal(replay.status,400);
        return pair;
    };
    let rpcId=0;
    const rpc=async(pair,method,params={})=>{
        const res=await post("/api/mcp",{jsonrpc:"2.0",id:++rpcId,method,params},{Accept:"application/json, text/event-stream",Authorization:"Bearer "+pair.access_token});
        const raw=await res.text();
        const text=raw.startsWith("{")?raw:raw.split(/\r?\n/).filter(l=>l.startsWith("data:")).at(-1)?.slice(5).trim();
        return {status:res.status,body:text?JSON.parse(text):null};
    };
    const names=async pair=>{
        const r=await rpc(pair,"tools/list");
        assert.equal(r.status,200);
        return r.body.result.tools.map(tool=>tool.name).sort();
    };
    const call=async(pair,name,args={})=>rpc(pair,"tools/call",{name,arguments:args});
    const decode=r=>JSON.parse(r.body.result.content[0].text);
    try {
        let ready=false;
        for(let i=0;i<100;i++){
            if(child.exitCode!==null)break;
            try{if((await fetch(base+"/api/mcp-info",{signal:AbortSignal.timeout(1000)})).status===200){ready=true;break;}}catch{}
            await pause(150);
        }
        assert.ok(ready,"entrypoint not ready: "+childOutput.slice(-1500));
        const register=await post("/register",{client_name:"Account fixture",redirect_uris:[base+"/callback"],token_endpoint_auth_method:"none"});
        assert.equal(register.status,201);
        const client=(await register.json()).client_id;
        const second=(await (await post("/register",{client_name:"Other fixture",redirect_uris:[base+"/callback"],token_endpoint_auth_method:"none"})).json()).client_id;
        await t.test("anonymous and non-admin scope escalation rejected",async()=>{
            assert.equal((await consent(client,null)).response.status,401);
            assert.equal((await consent(client,accounts[0],"mcp admin")).response.status,403);
            assert.equal((await consent(client,accounts[1],"admin")).response.status,403);
            assert.equal((await consent(client,accounts[0],"mcp",{role:"admin"})).response.status,200);
            assert.equal((await consent(client,accounts[0],"mcp",{}, {Origin:"https://other.invalid"})).response.status,403);
            assert.equal((await consent(client,accounts[0],"mcp",{redirect_uri:"https://other.invalid"})).response.status,400);
            assert.equal((await consent(client,accounts[0],"mcp",{code_challenge_method:"plain"})).response.status,400);
        });
        let user,moderator,admin,adminPersonal;
        await t.test("no owner credential: user, moderator and admin exchange scoped grants",async()=>{
            user=await authorize(client,accounts[0]);
            moderator=await authorize(client,accounts[1]);
            adminPersonal=await authorize(client,accounts[2]);
            admin=await authorize(client,accounts[2],"mcp admin");
        });
        await t.test("role and OAuth scope control discovery and direct calls",async()=>{
            const own=["mcp_account_info","mcp_my_devices"];
            assert.deepEqual(await names(user),own);
            assert.deepEqual(await names(moderator),own);
            assert.deepEqual(await names(adminPersonal),own);
            const adminNames=await names(admin);
            assert.ok(adminNames.includes("mcp_status")&&adminNames.includes("mcp_admin_call"));
            assert.ok(adminNames.length>own.length);
            const me=decode(await call(user,"mcp_account_info"));
            assert.equal(me.user_id,ids[0]);assert.equal(me.role,"user");assert.equal(me.admin_authorized,false);
            const adm=decode(await call(admin,"mcp_account_info"));
            assert.equal(adm.user_id,ids[2]);assert.equal(adm.role,"admin");assert.equal(adm.admin_authorized,true);
            assert.equal((await call(user,"mcp_admin_call",{tool:"mcp_status"})).body.result.isError,true);
            assert.equal((await call(user,"mcp_status")).body.result.isError,true);
            const init=await rpc(user,"initialize",{protocolVersion:"2025-06-18",capabilities:{},clientInfo:{name:"fixture",version:"1"}});
            assert.equal(init.status,200);
            assert.ok(!init.body.result.capabilities.events);
            assert.match(init.body.result.instructions,/mcp_account_info/);
            assert.equal((await rpc(user,"resources/list")).body.result.resources.length,0);
        });
        await t.test("owner-bound device list excludes other and unbound devices",async()=>{
            const list=decode(await call(user,"mcp_my_devices"));
            assert.deepEqual(list.devices.map(d=>d.device_name),["fixture-device-1"]);
            assert.equal(list.remote_execution,"not_verified");
            assert.ok(!JSON.stringify(list).includes("fixture_hash"));
            assert.ok(!JSON.stringify(list).includes("fixture_refresh"));
            assert.deepEqual(decode(await call(moderator,"mcp_my_devices")).devices.map(d=>d.device_name),["fixture-device-2"]);
            assert.equal((await call(user,"mcp_my_devices",{user_id:ids[1]})).body.result.isError,true);
        });
        await t.test("refresh bound to client and role revalidated on every call",async()=>{
            assert.equal((await form("/token",{grant_type:"refresh_token",refresh_token:user.refresh_token,client_id:second})).status,400);
            assert.equal((await form("/token",{grant_type:"refresh_token",refresh_token:user.refresh_token})).status,400);
            const renewed=await form("/token",{grant_type:"refresh_token",refresh_token:user.refresh_token,client_id:client});
            assert.equal(renewed.status,200);
            const pair=await renewed.json();
            assert.ok(pair.expires_in>0&&pair.expires_in<=300);
            assert.equal(decode(await call(pair,"mcp_account_info")).user_id,ids[0]);
            accounts[2].roles=["user"];save();
            assert.equal((await rpc(admin,"tools/list")).status,401);
            assert.equal((await form("/token",{grant_type:"refresh_token",refresh_token:admin.refresh_token,client_id:client})).status,400);
            accounts[0].active=false;save();
            assert.equal((await rpc(pair,"tools/list")).status,401);
        });
        await t.test("upstream and account MCP grants are not persisted",async()=>{
            await pause(900);
            const saved=readFileSync(statePath,"utf8");
            for(const a of accounts) assert.ok(!saved.includes(a.bearer));
            for(const p of [user,moderator,admin,adminPersonal]) {
                assert.ok(!saved.includes(p.access_token));
                assert.ok(!saved.includes(p.refresh_token));
            }
        });
    } finally {
        if(child.exitCode===null){child.kill("SIGTERM");await Promise.race([new Promise(r=>child.once("exit",r)),pause(2000)]);}
        if(child.exitCode===null)child.kill("SIGKILL");
        rmSync(dir,{recursive:true,force:true});
    }
});
}
