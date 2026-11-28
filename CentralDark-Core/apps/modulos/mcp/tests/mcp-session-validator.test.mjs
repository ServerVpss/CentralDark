import test from "node:test";
import assert from "node:assert/strict";
const env=new Map([["CENTRALDARK_MCP_SESSION_VALIDATOR_KEY","a".repeat(64)],["SUPABASE_URL","https://lyoigsqluyktoclwdaft.supabase.co"],["SUPABASE_SERVICE_ROLE_KEY","fixture_service_credential"]]);
let handler, calls=[], reply;
globalThis.Deno={env:{get:key=>env.get(key)},serve:fn=>{handler=fn;}};
globalThis.fetch=async(url,opts)=>{calls.push({url,opts});return Response.json(reply);};
await import("../../../../supabase/functions/mcp-session-validate/index.ts");
const user_id="00000000-0000-4000-8000-000000000001",session_id="00000000-0000-4000-8000-000000000002";
const request=(key,body={user_id,session_id},method="POST")=>new Request("https://fixture.invalid",{method,headers:{"X-CentralDark-MCP-Proof":key,"content-type":"application/json"},...(method==="GET"?{}:{body:JSON.stringify(body)})});
test("validator authenticates its dedicated caller before lookup",async()=>{
 assert.equal((await handler(request("b".repeat(64)))).status,401);
 assert.equal((await handler(request("a".repeat(64),{}))).status,400);
 assert.equal((await handler(request("a".repeat(64),undefined,"GET"))).status,405);
 assert.equal(calls.length,0);
});
test("validator requests only bound identity and returns no credential",async()=>{
 reply={valid:true,user_id,session_id,role:"user",not_after:null,secret:"fixture_never_return"};
 const response=await handler(request("a".repeat(64)));
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{valid:true,user_id,session_id,role:"user",not_after:null});
 assert.equal(calls[0].url,env.get("SUPABASE_URL")+"/rest/v1/rpc/mcp_validate_session_binding");
 assert.deepEqual(JSON.parse(calls[0].opts.body),{p_user_id:user_id,p_session_id:session_id});
 assert.equal(calls[0].opts.redirect,"error");
});
test("validator rejects swapped identity and unrecognized role; unknown binding is denied",async()=>{
 reply={valid:true,user_id:session_id,session_id,role:"admin",not_after:null};
 assert.equal((await handler(request("a".repeat(64)))).status,503);
 reply={valid:true,user_id,session_id,role:"owner",not_after:null};
 assert.equal((await handler(request("a".repeat(64)))).status,503);
 reply={valid:false};
 const response=await handler(request("a".repeat(64)));
 assert.equal(response.status,200);assert.deepEqual(await response.json(),{valid:false});
});
test("validator cannot send service credential to another project",async()=>{
 env.set("SUPABASE_URL","https://evil.invalid");
 const before=calls.length;
 assert.equal((await handler(request("a".repeat(64)))).status,503);
 assert.equal(calls.length,before);
});
