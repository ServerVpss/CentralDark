// ============================================================
// OAuth Broker CentralDark — porta 8098 (v2.1 — test + welcome-kit)
// ============================================================
import express from "express";
import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";
import fs from "node:fs";
import path from "node:path";

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
    // bytea hex: "\x..." — pode conter JSON serializado {"type":"Buffer","data":[...]}
    if(raw.startsWith("\\x")){
      const hex=raw.slice(2); const asBytes=Buffer.from(hex,"hex");
      // tenta detectar JSON dentro
      const asText=asBytes.toString("utf8");
      if(asText.startsWith('{"type":"Buffer"')){
        try{ const j=JSON.parse(asText); return Buffer.from(j.data); }catch{}
      }
      return asBytes;
    }
    // base64 direto
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
  const bp = req.body && Object.keys(req.body).length ? Object.fromEntries(Object.entries(req.body).map(([k,v])=>[k, /key|token|secret/i.test(k)?`***${String(v).slice(-4)}`:v])) : undefined;
  res.on("finish",()=>logAction({kind:"http",method:req.method,path:req.path,status:res.statusCode,ms:Date.now()-st,ip:req.ip,body:bp})); next(); });

app.get("/health",(_q,r)=>r.json({ok:true,service:"oauth-broker",version:"2.1"}));

// ---------- LISTAGEM ----------
app.get("/api/keys/list", async (req,res)=>{
  try{ const uid=toUuid(req.query.user_id); if(!uid) return res.status(400).json({ok:false,error:"faltou user_id"});
    const {data,error}=await sb.from("oauth_connections").select("id,provider_id,expires_at,status,account_label,consent_at,scopes_granted,last_test_at,last_test_status").eq("user_id",uid).order("consent_at",{ascending:false});
    if(error) return res.status(500).json({ok:false,error:error.message});
    return res.json({ok:true,items:data||[]});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

app.get("/api/providers", async (_q,res)=>{
  try{ const {data,error}=await sb.from("oauth_providers").select("*").eq("enabled",true).order("display_name");
    if(error) return res.status(500).json({ok:false,error:error.message});
    return res.json({ok:true,items:data||[]});
  }catch(e){return res.status(500).json({ok:false,error:e.message});}
});

// ---------- STORE ----------
app.post("/api/keys/store", async (req,res)=>{
  try{ let {user_id,provider_id,api_key,account_label}=req.body||{};
    user_id=toUuid(user_id);
    if(!user_id||!provider_id||!api_key) return res.status(400).json({ok:false,error:"faltou user_id/provider_id/api_key"});
    if(String(api_key).trim().length<10) return res.status(400).json({ok:false,error:"api_key muito curta"});
    if(!account_label||!String(account_label).trim()){
      const {count}=await sb.from("oauth_connections").select("id",{count:"exact",head:true}).eq("user_id",user_id).eq("provider_id",provider_id);
      account_label=`conta-${(count||0)+1}`;
    }
    account_label=String(account_label).trim().slice(0,60);
    const enc=encrypt(String(api_key).trim());
    const expiresAt=new Date(Date.now()+365*24*3600*1000).toISOString();
    const {data:conn,error}=await sb.from("oauth_connections").upsert({
      user_id, provider_id, access_token_enc:enc, refresh_token_enc:null,
      scopes_granted:"api_key", expires_at:expiresAt, consent_at:new Date().toISOString(),
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

// ============================================================
// 🧪 POST /api/keys/:id/test — ping real na API do provider
// ============================================================
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
  supabase: async (t) => {
    const r = await fetch("https://api.supabase.com/v1/projects", { headers:{ Authorization:`Bearer ${t}` }});
    const j = await r.json().catch(()=>({}));
    return { ok:r.ok, http:r.status, detail: r.ok ? `${(j||[]).length} projetos` : (j.message||"erro") };
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

// ============================================================
// 📚 GET /api/welcome-kit — mapa completo pra MCP/Hermes/IA
// ============================================================
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
        broker_version:"2.1",
        principle:"todas as contas de todos os providers vivem AQUI, cifradas AES-256-GCM, com log auditável",
      },
      rules:{
        must_read:[
          "docs/CONSCIENCIA/DARKAI/README.md (comando darkai + orquestração)",
          "docs/CONSCIENCIA/ARSENAL/README.md (conselho de IAs)",
          "docs/CONSCIENCIA/PADRAO-CARD-HERMES.md (padrão Telegram)",
          "CLAUDE.md seção 9 (áreas protegidas 🔒)",
        ],
        must_do:[
          "usar tokens do HUB via /api/keys/list — jamais hardcode",
          "toda ação relevante → card Hermes v1.3 no Telegram (@srver1bot)",
          "sempre PT-BR, tom leigo, direto",
          "modo enxame: paralelizar 10-20 sub-agentes",
        ],
        must_not:[
          "❌ mexer em áreas 🔒 sem 'PERMITO PIVETE'",
          "❌ criar tabela/edge no Lovable Cloud (trava ativa — usar HUB)",
          "❌ usar preto puro (#000), roxo, ou branco puro — padrão esmeralda #10b981",
          "❌ nome real do usuário — sempre 'Pivete'",
          "❌ criar coisa nova quando já existe local consolidado — aprimorar no lugar",
        ],
      },
      providers: providers||[],
      connections,
      endpoints:{
        list:"GET /api/keys/list?user_id=X",
        store:"POST /api/keys/store {user_id,provider_id,api_key,account_label}",
        test:"POST /api/keys/:id/test",
        rename:"PATCH /api/keys/:id {account_label}",
        remove:"DELETE /api/keys/:id",
        oauth_start:"GET /oauth/{github|notion|gdrive}/start?user_id=X&redirect_to=URL",
        welcome:"GET /api/welcome-kit?user_id=X",
        logs:"GET /api/logs/tail",
      },
      hermes_notify:{
        connector_id:"telegram",
        connection_id:"std_01kvw4jkcbekyr1t33vs4p5e9w",
        bot:"@srver1bot",
        admin_chat:"1901426549",
        format:"card Hermes v1.3 em <pre>",
      },
      timestamp: new Date().toISOString(),
    });
  }catch(e){ res.status(500).json({ok:false,error:e.message}); }
});

// ============================================================
// OAuth flows
// ============================================================
const stateCache = new Map();
setInterval(()=>{const n=Date.now(); for(const[k,v] of stateCache)if(v.exp<n)stateCache.delete(k);},60000);

const OAUTH_CFG = {
  github:{ ok:!!(GITHUB_CLIENT_ID&&GITHUB_CLIENT_SECRET), authorize:"https://github.com/login/oauth/authorize", token:"https://github.com/login/oauth/access_token",
    scope:"repo read:user user:email", client_id:GITHUB_CLIENT_ID, client_secret:GITHUB_CLIENT_SECRET,
    userinfo: async(t)=>{const r=await fetch("https://api.github.com/user",{headers:{Authorization:`Bearer ${t}`,"User-Agent":"CentralDark-HUB"}});const j=await r.json();return j.login||"github";} },
  notion:{ ok:!!(NOTION_CLIENT_ID&&NOTION_CLIENT_SECRET), authorize:"https://api.notion.com/v1/oauth/authorize", token:"https://api.notion.com/v1/oauth/token",
    scope:"", client_id:NOTION_CLIENT_ID, client_secret:NOTION_CLIENT_SECRET, extraAuth:{owner:"user",response_type:"code"},
    userinfo: async(_t,tj)=>tj?.workspace_name||"notion-workspace" },
  gdrive:{ ok:!!(GOOGLE_OAUTH_CLIENT_ID&&GOOGLE_OAUTH_CLIENT_SECRET), authorize:"https://accounts.google.com/o/oauth2/v2/auth", token:"https://oauth2.googleapis.com/token",
    scope:"https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.readonly openid email profile",
    client_id:GOOGLE_OAUTH_CLIENT_ID, client_secret:GOOGLE_OAUTH_CLIENT_SECRET, extraAuth:{access_type:"offline",prompt:"consent"},
    userinfo: async(t)=>{const r=await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{headers:{Authorization:`Bearer ${t}`}});const j=await r.json();return j.email||"google";} },
};

app.get("/oauth/:provider/start", async (req,res)=>{
  const p=req.params.provider; const cfg=OAUTH_CFG[p];
  if(!cfg) return res.status(404).send(`Provider ${p} sem OAuth.`);
  if(!cfg.ok){
    return res.status(503).send(`<!doctype html><meta charset="utf-8"><title>OAuth ${p}</title>
      <body style="font-family:system-ui;background:#052e2b;color:#e4f5f0;padding:40px;max-width:720px;margin:auto">
      <h1 style="color:#34d399">🛠️ Falta cadastrar OAuth do ${p.toUpperCase()}</h1>
      <p>Pra ativar login OAuth do <b>${p}</b>, cria um app OAuth no console e coloca as chaves no <code>.env</code>:</p>
      <pre style="background:#0a3d38;padding:14px;border-radius:8px;overflow:auto">${p==="notion"?"NOTION_CLIENT_ID=xxx\nNOTION_CLIENT_SECRET=yyy":
      p==="gdrive"?"GOOGLE_OAUTH_CLIENT_ID=xxx\nGOOGLE_OAUTH_CLIENT_SECRET=yyy":"CLIENT_ID/SECRET"}</pre>
      <p><b>Callback URL a colar no console do provider:</b></p>
      <pre style="background:#0a3d38;padding:14px;border-radius:8px">${PUBLIC_BASE}/oauth/${p}/callback</pre>
      <p><b>Console:</b> ${p==="notion"?'<a style="color:#34d399" href="https://www.notion.so/my-integrations">notion.so/my-integrations</a>':
      p==="gdrive"?'<a style="color:#34d399" href="https://console.cloud.google.com/apis/credentials">console.cloud.google.com/apis/credentials</a>':""}</p>
      <p style="margin-top:20px"><a href="javascript:history.back()" style="color:#34d399">← voltar</a></p>
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
  console.log(`oauth-broker on 127.0.0.1:${PORT} (v2.1 test + welcome-kit)`);
  logAction({kind:"boot",port:PORT,version:"2.1",oauth_ready:Object.fromEntries(Object.entries(OAUTH_CFG).map(([k,v])=>[k,v.ok]))});
});
