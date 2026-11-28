// Dedicated server-to-server session validator for the existing MCP OAuth.
// No user refresh token, service role key or session credential is returned.
import { timingSafeEqual } from "node:crypto";
const project = "https://lyoigsqluyktoclwdaft.supabase.co";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const hex = /^[a-f0-9]{64}$/;
const json = (status:number, value:unknown) => new Response(JSON.stringify(value), {
  status, headers:{"Content-Type":"application/json","Cache-Control":"no-store","Referrer-Policy":"no-referrer"}
});
Deno.serve(async (req:Request) => {
  if (req.method !== "POST") return json(405,{error:"METHOD_NOT_ALLOWED"});
  const expected = Deno.env.get("CENTRALDARK_MCP_SESSION_VALIDATOR_KEY") || "";
  const actual = req.headers.get("X-CentralDark-MCP-Proof") || "";
  if (!hex.test(expected)) return json(503,{error:"VALIDATOR_NOT_CONFIGURED"});
  if (!hex.test(actual) || !timingSafeEqual(new TextEncoder().encode(actual),new TextEncoder().encode(expected)))
    return json(401,{error:"UNAUTHORIZED"});
  try {
    const length=Number(req.headers.get("Content-Length") || "0");
    if (length>1024) return json(413,{error:"REQUEST_TOO_LARGE"});
    const raw=await req.text();
    if(raw.length>1024) return json(413,{error:"REQUEST_TOO_LARGE"});
    const body=JSON.parse(raw);
    if(!body || typeof body.user_id!=="string" || !uuid.test(body.user_id) ||
        typeof body.session_id!=="string" || !uuid.test(body.session_id))
      return json(400,{error:"INVALID_BINDING"});
    const url=(Deno.env.get("SUPABASE_URL") || "").replace(/\/$/,"");
    const service=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if(url!==project || !service) return json(503,{error:"VALIDATOR_NOT_CONFIGURED"});
    const headers:Record<string,string>={apikey:service,"Content-Type":"application/json",Accept:"application/json"};
    if(!service.startsWith("sb_secret_")) headers.Authorization="Bearer "+service;
    const res=await fetch(url+"/rest/v1/rpc/mcp_validate_session_binding",{
      method:"POST",headers,body:JSON.stringify({p_user_id:body.user_id,p_session_id:body.session_id}),
      redirect:"error",signal:AbortSignal.timeout(5000)
    });
    if(!res.ok) return json(503,{error:"SESSION_AUTHORITY_UNAVAILABLE"});
    const value=await res.json();
    if(value?.valid===false) return json(200,{valid:false});
    if(value?.valid!==true || value.user_id!==body.user_id || value.session_id!==body.session_id ||
        !["admin","moderator","user"].includes(value.role) ||
        !(value.not_after===null || (typeof value.not_after==="string" && !Number.isNaN(Date.parse(value.not_after)))))
      return json(503,{error:"SESSION_AUTHORITY_INVALID"});
    return json(200,{valid:true,user_id:value.user_id,session_id:value.session_id,role:value.role,not_after:value.not_after});
  } catch { return json(503,{error:"SESSION_AUTHORITY_UNAVAILABLE"}); }
});
