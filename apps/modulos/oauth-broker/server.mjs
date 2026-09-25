// ============================================================
// OAuth Broker CentralDark — porta 8098 (v2.2 — contabo + gmail + cf test)
// ============================================================
import express from "express";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import net from "node:net";
import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

for (const f of ["/root/CentralDark/apps/modulos/hub/.env","/root/CentralDark/apps/modulos/oauth-broker/.env"]) {
  if (fs.existsSync(f)) { const d = (await import("dotenv")).default; d.config({ path: f, override: false }); }
}

const {
  HUB_SUPABASE_URL, HUB_SUPABASE_SERVICE_ROLE_KEY, VAULT_MASTER_KEY,
  PORT = 8098, PUBLIC_BASE = "https://hub.centralldark.com",
  GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
  NOTION_CLIENT_ID, NOTION_CLIENT_SECRET,
  GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
} = process.env;

if (!HUB_SUPABASE_URL || !HUB_SUPABASE_SERVICE_ROLE_KEY || !VAULT_MASTER_KEY) {
  console.error("Faltam envs obrigatórias"); process.exit(1);
}
const sb = createClient(HUB_SUPABASE_URL, HUB_SUPABASE_SERVICE_ROLE_KEY, { auth:{ persistSession:false }});

const LOG_DIR = "/root/CentralDark/apps/modulos/hub/logs";
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, "hub-actions.log");
function logAction(e){ const l=JSON.stringify({ts:new Date().toISOString(),...e})+"\n"; try{fs.appendFileSync(LOG_FILE,l);}catch{} console.log("[HUB-ACTION]",l.trim()); }

function toUuid(id){ if(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(id)))return id;
  const h=crypto.createHash("sha1").update("centraldark:"+String(id)).digest("hex");
  return `${h.slice(0,8)}-${h.slice(8,12)}-5${h.slice(13,16)}-8${h.slice(17,20)}-${h.slice(20,32)}`; }

const KEY = crypto.createHash("sha256").update(VAULT_MASTER_KEY).digest();
function encrypt(p){ const iv=crypto.randomBytes(12); const c=crypto.createCipheriv("aes-256-gcm",KEY,iv);
  const e=Buffer.concat([c.update(p,"utf8"),c.final()]); return Buffer.concat([iv,c.getAuthTag(),e]); }
function toBuffer(raw){
  if(Buffer.isBuffer(raw)) return raw;
  if(raw && raw.type==="Buffer" && Array.isArray(raw.data)) return Buffer.from(raw.data);
  if(typeof raw==="string"){
    if(raw.startsWith("\\x")){
      const hex=raw.slice(2); const asBytes=Buffer.from(hex,"hex");
      const asText=asBytes.toString("utf8");
      if(asText.startsWith('{"type":"Buffer"')){
        try{ const j=JSON.parse(asText); return Buffer.from(j.data); }catch{}
      }
      return asBytes;
    }
    try{ return Buffer.from(raw,"base64"); }catch{}
  }
  return Buffer.from(raw);
}
function decrypt(raw){ const b=toBuffer(raw);
  const iv=b.slice(0,12), tag=b.slice(12,28), enc=b.slice(28);
  const d=crypto.createDecipheriv("aes-256-gcm",KEY,iv); d.setAuthTag(tag);
  return Buffer.concat([d.update(enc),d.final()]).toString("utf8"); }

const app = express();
app.use(express.json({ limit:"1mb" }));
app.use((req,res,next)=>{ const st=Date.now();
  const bp = req.body && Object.keys(req.body).length ? Object.fromEntries(Object.entries(req.body).map(([k,v])=>[k, /key|token|secret|password/i.test(k)?`***${String(v).slice(-4)}`:v])) : undefined;
  res.on("finish",()=>logAction({kind:"http",method:req.method,path:req.path,status:res.statusCode,ms:Date.now()-st,ip:req.ip,body:bp})); next(); });

const TAILSCALE_HOME_HOST = process.env.TAILSCALE_HOME_HOST || "segredo";
const TAILSCALE_HOME_IP = process.env.TAILSCALE_HOME_IP || "100.123.93.25";
let tailscaleLoginChild = null;
let tailscaleLoginUrl = null;

function probeTcp(host, port, timeoutMs=1200){
  return new Promise((resolve)=>{
    const sock=net.createConnection({host,port});
    let done=false;
    const finish=(value)=>{ if(done)return; done=true; try{sock.destroy();}catch{} resolve(value); };
    sock.setTimeout(timeoutMs);
    sock.once("connect",()=>finish("OPEN"));
    sock.once("timeout",()=>finish("CLOSED_OR_FILTERED"));
    sock.once("error",()=>finish("CLOSED_OR_FILTERED"));
  });
}

async function tailscaleSnapshot(){
  try{
    const {stdout}=await execFileAsync("tailscale",["status","--json"],{timeout:5000,maxBuffer:2*1024*1024});
    const j=JSON.parse(stdout);
    const peers=Object.values(j.Peer||{});
    const peer=peers.find((x)=>String(x?.HostName||"").toLowerCase()===TAILSCALE_HOME_HOST.toLowerCase())
      || peers.find((x)=>Array.isArray(x?.TailscaleIPs)&&x.TailscaleIPs.includes(TAILSCALE_HOME_IP))
      || null;
    const [rdp,ssh]=await Promise.all([probeTcp(TAILSCALE_HOME_IP,3389),probeTcp(TAILSCALE_HOME_IP,22)]);
    const running=j.BackendState==="Running" && Boolean(j.Self?.Online);
    return {
      ok:running,
      backend_state:j.BackendState||"UNKNOWN",
      tailnet:j.CurrentTailnet?.Name||null,
      magic_dns:j.CurrentTailnet?.MagicDNSSuffix||j.MagicDNSSuffix||null,
      self:{host:j.Self?.HostName||null,online:Boolean(j.Self?.Online),ips:j.TailscaleIPs||j.Self?.TailscaleIPs||[]},
      home:{host:TAILSCALE_HOME_HOST,ip:TAILSCALE_HOME_IP,online:peer?.Online??null,rdp_3389:rdp,ssh_22:ssh},
      route_base:"TAILSCALE",
      login_required:!running
    };
  }catch(e){
    return {ok:false,backend_state:"UNKNOWN",error:String(e?.message||e),route_base:"TAILSCALE",login_required:true};
  }
}

function startTailscaleHumanLogin(){
  if(tailscaleLoginChild && !tailscaleLoginChild.killed){
    if(tailscaleLoginUrl) return Promise.resolve(tailscaleLoginUrl);
    return Promise.reject(new Error("login Tailscale já em andamento"));
  }
  tailscaleLoginUrl=null;
  const child=spawn("tailscale",["login","--timeout=2m"],{stdio:["ignore","pipe","pipe"]});
  tailscaleLoginChild=child;
  return new Promise((resolve,reject)=>{
    let settled=false;
    const scan=(buf)=>{
      const text=String(buf||"");
      const m=text.match(/https:\/\/login\.tailscale\.com\/\S+/);
      if(m && !settled){
        settled=true;
        tailscaleLoginUrl=m[0].replace(/[)\],.;]+$/,"");
        resolve(tailscaleLoginUrl);
      }
    };
    child.stdout.on("data",scan);
    child.stderr.on("data",scan);
    child.once("error",(e)=>{ if(!settled){settled=true;reject(e);} tailscaleLoginChild=null; });
    child.once("exit",(code)=>{ tailscaleLoginChild=null; if(!settled && code!==0){settled=true;reject(new Error("tailscale login saiu "+code));} });
    setTimeout(()=>{
      if(!settled){
        settled=true;
        try{child.kill("SIGTERM");}catch{}
        reject(new Error("URL de autenticação Tailscale não apareceu no prazo"));
      }
    },8000);
  });
}

app.get("/health",(_q,r)=>r.json({ok:true,service:"oauth-broker",version:"2.3-tailscale"}));

app.get("/api/tailscale/status", async (_req,res)=>{
  const snap=await tailscaleSnapshot();
  return res.status(snap.ok?200:503).json(snap);
});

app.get("/oauth/tailscale/start", async (req,res)=>{
  const redirectTo=String(req.query.redirect_to||PUBLIC_BASE);
  const snap=await tailscaleSnapshot();
  if(snap.ok){
    const u=new URL(redirectTo);
    u.searchParams.set("tailscale","connected");
    return res.redirect(302,u.toString());
  }
  try{
    const authUrl=await startTailscaleHumanLogin();
    logAction({kind:"tailscale_login_started",provider_id:"tailscale"});
    return res.redirect(302,authUrl);
  }catch(e){
    return res.status(503).send("<!doctype html><meta charset=utf-8><title>Tailscale</title><body><h1>Tailscale login humano</h1><p>"+String(e?.message||e).replace(/[<>&]/g,"")+"</p></body>");
  }
});

app.post("/api/tailscale/logout", async (req,res)=>{
  if(req.body?.confirm!=="DISCONNECT_TAILSCALE_ROUTE"){
    return res.status(409).json({ok:false,error:"confirmation_required",required:"DISCONNECT_TAILSCALE_ROUTE"});
  }
  try{
    await execFileAsync("tailscale",["logout"],{timeout:10000});
    logAction({kind:"tailscale_logout",provider_id:"tailscale"});
    return res.json({ok:true,route_base:"DISCONNECTED"});
  }catch(e){
    return res.status(500).json({ok:false,error:String(e?.message||e)});
  }
});

app.get("/api/keys/list", async (req,res)=>{
  try{ const uid=toUuid(req.query.user_id); if(!uid) return res.status(400).json({ok:false,error:"faltou user_id"});
    const {data,error}=await sb.from("oauth_connections").select("id,provider_id,expires_at,status,account_label,consent_at,scopes_granted,last_test_at,last_test_status").eq("user_id",uid).order("consent_at",{ascending:false});
    if(error) return res.status(500).json({ok:false,error:error.message});
    const items=[...(data||[])];
    const ts=await tailscaleSnapshot();
    if(ts.ok){
      items.push({id:"runtime-tailscale",provider_id:"tailscale",expires_at:null,status:"active",account_label:ts.tailnet||"tailnet",consent_at:null,scopes_granted:"route-base",last_test_at:new Date().toISOString(),last_test_status:"ok"});
    }
    return res.json({ok:true,items});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

app.get("/api/providers", async (_q,res)=>{
  try{ const {data,error}=await sb.from("oauth_providers").select("*").eq("enabled",true).order("display_name");
    if(error) return res.status(500).json({ok:false,error:error.message});
    const items=[...(data||[])];
    if(!items.some((x)=>x.id==="tailscale")){
      items.push({id:"tailscale",display_name:"Tailscale",color:"#242424",icon:"TS",scopes:"tailnet route + human login",auth_type:"oauth",tier:1,enabled:true});
    }
    return res.json({ok:true,items});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

app.post("/api/keys/store", async (req,res)=>{
  try{ let {user_id,provider_id,api_key,account_label}=req.body||{};
    user_id=toUuid(user_id);
    if(!user_id||!provider_id||!api_key) return res.status(400).json({ok:false,error:"faltou user_id/provider_id/api_key"});
    // Contabo: aceita JSON com 4 campos (mínimo 10 chars no payload)
    const rawKey = typeof api_key === "object" ? JSON.stringify(api_key) : String(api_key).trim();
    if(rawKey.length<10) return res.status(400).json({ok:false,error:"api_key muito curta"});
    if(provider_id === "contabo"){
      try{
        const j = JSON.parse(rawKey);
        for (const k of ["client_id","client_secret","api_user","api_password"]) {
          if(!j[k]) return res.status(400).json({ok:false,error:`contabo: faltou ${k}`});
        }
      }catch{
        return res.status(400).json({ok:false,error:"contabo: api_key deve ser JSON {client_id,client_secret,api_user,api_password}"});
      }
    }
    if(!account_label||!String(account_label).trim()){
      const {count}=await sb.from("oauth_connections").select("id",{count:"exact",head:true}).eq("user_id",user_id).eq("provider_id",provider_id);
      account_label=`conta-${(count||0)+1}`;
    }
    account_label=String(account_label).trim().slice(0,60);
    const enc=encrypt(rawKey);
    const expiresAt=new Date(Date.now()+365*24*3600*1000).toISOString();
    const scopes = provider_id === "contabo" ? "instances:read" : "api_key";
    const {data:conn,error}=await sb.from("oauth_connections").upsert({
      user_id, provider_id, access_token_enc:enc, refresh_token_enc:null,
      scopes_granted:scopes, expires_at:expiresAt, consent_at:new Date().toISOString(),
      status:"active", account_label,
    },{onConflict:"user_id,provider_id,account_label"}).select().maybeSingle();
    if(error) return res.status(500).json({ok:false,error:error.message});
    logAction({kind:"apikey_saved",provider_id,user_id,account_label});
    return res.json({ok:true,connection_id:conn?.id,account_label,expires_at:expiresAt});
  }catch(e){console.error("store crash",e); return res.status(500).json({ok:false,error:e.message});}
});

app.patch("/api/keys/:id", async (req,res)=>{
  try{ const {account_label}=req.body||{}; if(!account_label) return res.status(400).json({ok:false,error:"faltou account_label"});
    const {error}=await sb.from("oauth_connections").update({account_label:String(account_label).trim().slice(0,60)}).eq("id",req.params.id);
    if(error) return res.status(500).json({ok:false,error:error.message});
    return res.json({ok:true});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

app.delete("/api/keys/:id", async (req,res)=>{
  try{ const {error}=await sb.from("oauth_connections").delete().eq("id",req.params.id);
    if(error) return res.status(500).json({ok:false,error:error.message});
    return res.json({ok:true});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

const PROVIDER_TEST = {
  openai: async (t) => {
    const r = await fetch("https://api.openai.com/v1/models", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j.data||[]).length} modelos` : (j.error?.message||"erro") };
  },
  claude: async (t) => {
    const r = await fetch("https://api.anthropic.com/v1/models", { headers:{ "x-api-key":t, "anthropic-version":"2023-06-01" }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j.data||[]).length} modelos` : (j.error?.message||"erro") };
  },
  gemini: async (t) => {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${t}`);
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j.models||[]).length} modelos` : (j.error?.message||"erro") };
  },
  groq: async (t) => {
    const r = await fetch("https://api.groq.com/openai/v1/models", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j.data||[]).length} modelos` : (j.error?.message||"erro") };
  },
  grok: async (t) => {
    const r = await fetch("https://api.x.ai/v1/models", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j.data||[]).length} modelos` : (j.error?.message||"erro") };
  },
  notion: async (t) => {
    const r = await fetch("https://api.notion.com/v1/users/me", { headers:{ Authorization:`Bearer ${t}`, "Notion-Version":"2022-06-28" }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? (j.name||j.bot?.workspace_name||"ok") : (j.message||"erro") };
  },
  github: async (t) => {
    const r = await fetch("https://api.github.com/user", { headers:{ Authorization:`Bearer ${t}`, "User-Agent":"CentralDark-HUB" }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `@${j.login||"user"}` : (j.message||"erro") };
  },
  gdrive: async (t) => {
    const r = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? (j.email||"ok") : (j.error?.message||"erro") };
  },
  gmail: async (t) => {
    const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? (j.emailAddress||"ok") : (j.error?.message||JSON.stringify(j).slice(0,120)) };
  },
  supabase: async (t) => {
    const r = await fetch("https://api.supabase.com/v1/projects", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j||[]).length} projetos` : (j.message||"erro") };
  },
  cloudflare: async (t) => {
    const r = await fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", { headers:{ Authorization:`Bearer ${t}`, Accept:"application/json" }});
    const j = await r.json().catch(()=>({}));
    const active = j?.success && j?.result?.status === "active";
    return { ok:!!active, http:r.status, detail: active ? "token active" : (j?.errors?.[0]?.message||"verify fail") };
  },
  // Contabo: api_key armazenado = JSON {client_id,client_secret,api_user,api_password}
  contabo: async (raw) => {
    let cred;
    try { cred = JSON.parse(raw); } catch { return { ok:false, http:0, detail:"JSON inválido" }; }
    const body = new URLSearchParams({
      client_id: cred.client_id,
      client_secret: cred.client_secret,
      username: cred.api_user,
      password: cred.api_password,
      grant_type: "password",
    });
    const tokRes = await fetch("https://auth.contabo.com/auth/realms/contabo/protocol/openid-connect/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const tokJ = await tokRes.json().catch(()=>({}));
    if (!tokRes.ok || !tokJ.access_token) {
      return { ok:false, http:tokRes.status, detail: tokJ.error_description || tokJ.error || "auth fail" };
    }
    const instRes = await fetch("https://api.contabo.com/v1/compute/instances", {
      headers: {
        Authorization: `Bearer ${tokJ.access_token}`,
        "x-request-id": crypto.randomUUID(),
        Accept: "application/json",
      },
    });
    const instJ = await instRes.json().catch(()=>({}));
    if (!instRes.ok) return { ok:false, http:instRes.status, detail: "instances fail" };
    const n = Array.isArray(instJ?.data) ? instJ.data.length : (instJ?.data ? 1 : 0);
    return { ok:true, http:instRes.status, detail: `${n} instances (read-only)` };
  },
};

app.post("/api/keys/:id/test", async (req,res)=>{
  try{
    const {data:conn,error}=await sb.from("oauth_connections").select("id,provider_id,access_token_enc,account_label").eq("id",req.params.id).maybeSingle();
    if(error||!conn) return res.status(404).json({ok:false,error:"conexão não encontrada"});
    const tester=PROVIDER_TEST[conn.provider_id];
    if(!tester){
      await sb.from("oauth_connections").update({last_test_at:new Date().toISOString(),last_test_status:"unsupported"}).eq("id",conn.id);
      return res.json({ok:true,tested:false,message:`teste não implementado pra ${conn.provider_id}`});
    }
    let token;
    try{ token=decrypt(conn.access_token_enc); }catch(e){ return res.status(500).json({ok:false,error:"falha decriptar: "+e.message}); }
    const result=await tester(token).catch(e=>({ok:false,http:0,detail:e.message}));
    await sb.from("oauth_connections").update({
      last_test_at:new Date().toISOString(),
      last_test_status: result.ok?"ok":"fail",
      status: result.ok?"active":"error",
    }).eq("id",conn.id);
    logAction({kind:"test",provider:conn.provider_id,label:conn.account_label,...result});
    return res.json({ok:true,tested:true,result_ok:result.ok,http:result.http,detail:result.detail});
  }catch(e){ return res.status(500).json({ok:false,error:e.message}); }
});

app.get("/api/welcome-kit", async (req,res)=>{
  try{
    const uid = req.query.user_id ? toUuid(req.query.user_id) : null;
    const {data:providers}=await sb.from("oauth_providers").select("id,display_name,auth_type,tier").eq("enabled",true);
    let connections = [];
    if(uid){
      const {data}=await sb.from("oauth_connections").select("id,provider_id,account_label,status,last_test_status,last_test_at,expires_at").eq("user_id",uid);
      connections = data || [];
    }
    res.json({
      ok:true,
      platform:{
        name:"CentralDark",
        hub_base: PUBLIC_BASE,
        domain:"centralldark.com",
        broker_version:"2.2",
        principle:"todas as contas de todos os providers vivem AQUI, cifradas AES-256-GCM, com log auditável",
      },
      providers: providers||[],
      connections,
      endpoints:{
        list:"GET /api/keys/list?user_id=X",
        store:"POST /api/keys/store {user_id,provider_id,api_key,account_label}",
        test:"POST /api/keys/:id/test",
        oauth_start:"GET /oauth/{github|notion|gdrive|gmail}/start?user_id=X&redirect_to=URL",
        welcome:"GET /api/welcome-kit?user_id=X",
      },
      timestamp: new Date().toISOString(),
    });
  }catch(e){ res.status(500).json({ok:false,error:e.message}); }
});

const stateCache = new Map();
setInterval(()=>{const n=Date.now(); for(const[k,v] of stateCache)if(v.exp<n)stateCache.delete(k);},60000);

const OAUTH_CFG = {
  github:{ ok:!!(GITHUB_CLIENT_ID&&GITHUB_CLIENT_SECRET), authorize:"https://github.com/login/oauth/authorize", token:"https://github.com/login/oauth/access_token",
    scope:"repo read:user user:email", client_id:GITHUB_CLIENT_ID, client_secret:GITHUB_CLIENT_SECRET,
    userinfo: async(t)=>{const r=await fetch("https://api.github.com/user",{headers:{Authorization:`Bearer ${t}`,"User-Agent":"CentralDark-HUB"}});const j=await r.json();return j.login||"github";} },
  notion:{ ok:!!(NOTION_CLIENT_ID&&NOTION_CLIENT_SECRET), authorize:"https://api.notion.com/v1/oauth/authorize", token:"https://api.notion.com/v1/oauth/token",
    scope:"", client_id:NOTION_CLIENT_ID, client_secret:NOTION_CLIENT_SECRET, extraAuth:{owner:"user",response_type:"code"},
    userinfo: async(_t,tj)=>tj?.workspace_name ||"notion-workspace" },
  gdrive:{ ok:!!(GOOGLE_OAUTH_CLIENT_ID&&GOOGLE_OAUTH_CLIENT_SECRET), authorize:"https://accounts.google.com/o/oauth2/v2/auth", token:"https://oauth2.googleapis.com/token",
    scope:"https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly openid email profile",
    client_id:GOOGLE_OAUTH_CLIENT_ID, client_secret:GOOGLE_OAUTH_CLIENT_SECRET, extraAuth:{access_type:"offline",prompt:"consent"},
    userinfo: async(t)=>{const r=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${t}`}});const j=await r.json();return j.email||"google";} },
  // Gmail: mesmo client Google, scopes de mail (mínimo readonly + send se consumer exigir depois)
  gmail:{ ok:!!(GOOGLE_OAUTH_CLIENT_ID&&GOOGLE_OAUTH_CLIENT_SECRET), authorize:"https://accounts.google.com/o/oauth2/v2/auth", token:"https://oauth2.googleapis.com/token",
    scope:"https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send openid email profile",
    client_id:GOOGLE_OAUTH_CLIENT_ID, client_secret:GOOGLE_OAUTH_CLIENT_SECRET, extraAuth:{access_type:"offline",prompt:"consent"},
    userinfo: async(t)=>{const r=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${t}`}});const j=await r.json();return j.email||"gmail";} },
};

app.get("/oauth/:provider/start", async (req,res)=>{
  const p=req.params.provider; const cfg=OAUTH_CFG[p];
  if(!cfg) return res.status(404).send(`Provider ${p} sem OAuth.`);
  if(!cfg.ok){
    return res.status(503).send(`<!doctype html><meta charset="utf-8"><title>OAuth ${p}</title>
      <body style="font-family:system-ui;background:#052e2b;color:#e4f5f0;padding:40px;max-width:720px;margin:auto">
      <h1 style="color:#34d399">🛠️ Falta cadastrar OAuth do ${p.toUpperCase()}</h1>
      <p>Callback: <code>${PUBLIC_BASE}/oauth/${p}/callback</code></p>
      <p><a href="javascript:history.back()" style="color:#34d399">← voltar</a></p>
      </body>`);
  }
  const uid=toUuid(req.query.user_id||"dev-pivete"); const rt=req.query.redirect_to||PUBLIC_BASE;
  const state=crypto.randomBytes(16).toString("hex");
  stateCache.set(state,{provider:p,user_id:uid,redirect_to:rt,exp:Date.now()+600000});
  const params=new URLSearchParams({client_id:cfg.client_id,redirect_uri:`${PUBLIC_BASE}/oauth/${p}/callback`,state,...(cfg.scope?{scope:cfg.scope}:{}),...(cfg.extraAuth||{})});
  if(!params.get("response_type")) params.set("response_type","code");
  res.redirect(`${cfg.authorize}?${params.toString()}`);
});

app.get("/oauth/:provider/callback", async (req,res)=>{
  const p=req.params.provider; const cfg=OAUTH_CFG[p]; const {code,state,error}=req.query;
  if(error) return res.status(400).send(`OAuth erro: ${error}`);
  const s=stateCache.get(state); if(!s||s.provider!==p) return res.status(400).send("state inválido");
  stateCache.delete(state);
  try{
    const bodyForm=new URLSearchParams({grant_type:"authorization_code",code,client_id:cfg.client_id,client_secret:cfg.client_secret,redirect_uri:`${PUBLIC_BASE}/oauth/${p}/callback`});
    const r=await fetch(cfg.token,{method:"POST",
      headers:{"Content-Type":"application/x-www-form-urlencoded",Accept:"application/json",
        ...(p==="notion"?{Authorization:`Basic ${Buffer.from(`${cfg.client_id}:${cfg.client_secret}`).toString("base64")}`}:{})},
      body: p==="notion"?JSON.stringify({grant_type:"authorization_code",code,redirect_uri:`${PUBLIC_BASE}/oauth/${p}/callback`}):bodyForm });
    const tj=await r.json(); if(!tj.access_token) throw new Error("sem access_token: "+JSON.stringify(tj).slice(0,200));
    const label=await cfg.userinfo(tj.access_token,tj).catch(()=>`${p}-conta`);
    const enc=encrypt(tj.access_token); const refEnc=tj.refresh_token?encrypt(tj.refresh_token):null;
    const expAt=new Date(Date.now()+(tj.expires_in?tj.expires_in*1000:30*24*3600*1000)).toISOString();
    const {error:dbe}=await sb.from("oauth_connections").upsert({
      user_id:s.user_id,provider_id:p,access_token_enc:enc,refresh_token_enc:refEnc,
      scopes_granted:tj.scope||cfg.scope||"oauth",expires_at:expAt,consent_at:new Date().toISOString(),
      status:"active",account_label:String(label).slice(0,60),
    },{onConflict:"user_id,provider_id,account_label"});
    if(dbe) throw dbe;
    logAction({kind:"oauth_success",provider:p,user_id:s.user_id,label});
    res.redirect(`${s.redirect_to}${s.redirect_to.includes("?")?"&":"?"}oauth_ok=${p}&label=${encodeURIComponent(label)}`);
  }catch(e){ logAction({kind:"oauth_error",provider:p,err:e.message}); res.status(500).send(`Erro callback ${p}: ${e.message}`); }
});

app.get("/api/logs/tail",(_q,res)=>{
  try{ if(!fs.existsSync(LOG_FILE)) return res.json({ok:true,lines:[]});
    const raw=fs.readFileSync(LOG_FILE,"utf8").trim().split("\n");
    res.json({ok:true,lines:raw.slice(-200)});
  }catch(e){ res.status(500).json({ok:false,error:e.message}); }
});

app.listen(PORT,"127.0.0.1",()=>{
  console.log(`oauth-broker on 127.0.0.1:${PORT} (v2.2 contabo+gmail+cf)`);
  logAction({kind:"boot",port:PORT,version:"2.2",oauth_ready:Object.fromEntries(Object.entries(OAUTH_CFG).map(([k,v])=>[k,v.ok]))});
});
