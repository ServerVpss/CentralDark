// CentralDark Casa Commander: engine DesktopCommanderMCP MIT, modo LOCAL stdio.
// Fio privado: CentralDark MCP -> Tailscale Serve :9100 -> 127.0.0.1:9101.
// Não usa mcp.desktopcommander.app; exige segredo compartilhado de bridge.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { isAbsolute, resolve } from "node:path";
import { hostname } from "node:os";

const ENGINE = "@wonderwhy-er/desktop-commander@0.2.48";
const TOKEN = process.env.CENTRALDARK_CASA_BRIDGE_TOKEN || "";
export const READ_ONLY_TOOLS = new Set([
  "list_directory","read_file","read_multiple_files","get_file_info",
  "list_processes","list_sessions","start_search","get_more_search_results",
  "list_searches","read_process_output"
]);
let upstream = null;
let connecting = null;
let ready = false;
let lastAuthorizedTool = null; // ephemeral receipt, never a credential or file content
function emitOperationalEvent(event, detail = "") {
  // Only fixed status and validated tool names, never tokens or raw stderr.
  process.stdout.write("[MCP_CASA] [" + new Date().toISOString() + "] [" + event + "]" +
    (detail ? " " + detail : "") + "\n");
}

// MQTT is an OPTIONAL transport of presence/receipts within the SAME Casa agent.
// No broker, secondary executor, implicit remote mutation or public port is created.
// Requires an authenticated TLS broker and mqtt.js installed beside this agent.
// Keep command execution on the existing authenticated /tool path until approved.
const MQTT_ENABLED = process.env.CENTRALDARK_CASA_MQTT_ENABLED === "true";
const MQTT_TOPIC = "centraldark/casa/" + hostname().toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0,64);
let mqttConnection = null;
let mqttState = MQTT_ENABLED ? "NOT_CONFIGURED" : "DISABLED";
function mqttPublish(kind, detail, retain = false) {
  if (!mqttConnection?.connected) return false;
  mqttConnection.publish(MQTT_TOPIC + "/" + kind, JSON.stringify({
    schema: "centraldark.casa.mqtt.v1",
    device: hostname(), at: new Date().toISOString(),
    engine_connected: ready, detail
  }), { qos: 1, retain });
  return true;
}
async function startCasaMqtt() {
  if (!MQTT_ENABLED) return;
  const url = process.env.CENTRALDARK_CASA_MQTT_URL || "";
  const username = process.env.CENTRALDARK_CASA_MQTT_USERNAME || "";
  const password = process.env.CENTRALDARK_CASA_MQTT_PASSWORD || "";
  if (!/^(mqtts|wss):\/\//.test(url) || !username || !password) {
    mqttState = "TLS_OR_AUTH_NOT_CONFIGURED";
    return;
  }
  try {
    const { connect } = await import("mqtt");
    const client = connect(url, {
      username, password,
      clientId: "centraldark-casa-" + hostname().replace(/[^a-zA-Z0-9-]/g, "-") + "-" + process.pid,
      reconnectPeriod: 3000, connectTimeout: 10000, rejectUnauthorized: true,
      will: { topic: MQTT_TOPIC + "/presence", payload: JSON.stringify({ online: false }), qos: 1, retain: true }
    });
    mqttConnection = client;
    mqttState = "CONNECTING";
    client.on("connect", () => {
      mqttState = "CONNECTED";
      mqttPublish("presence", { online: true }, true);
    });
    client.on("close", () => { mqttState = "DISCONNECTED"; });
    client.on("error", () => { mqttState = "ERROR"; });
    setInterval(() => mqttPublish("heartbeat", { online: true }), 15000).unref();
  } catch {
    mqttState = "MODULE_UNAVAILABLE";
  }
}

let serial = 0;
let partial = "";
const inflight = new Map();

function invalidate(message) {
  ready = false;
  for (const entry of inflight.values()) {
    clearTimeout(entry.timeout);
    entry.reject(new Error(message));
  }
  inflight.clear();
}
function onData(bytes) {
  partial += bytes.toString("utf8");
  if (partial.length > 2000000) { partial = ""; invalidate("MCP_STDIO_OUTPUT_TOO_LARGE"); return; }
  let pos;
  while ((pos = partial.indexOf("\n")) >= 0) {
    const line = partial.slice(0,pos).trim();
    partial = partial.slice(pos+1);
    let data;
    try { data = JSON.parse(line); } catch { continue; }
    if (data.id === undefined || !inflight.has(data.id)) continue;
    const entry = inflight.get(data.id);
    inflight.delete(data.id);
    clearTimeout(entry.timeout);
    if (data.error) entry.reject(new Error("MCP_UPSTREAM_ERROR:" + JSON.stringify(data.error).slice(0,500)));
    else entry.resolve(data.result);
  }
}
function rpc(method, params, timeoutMs=90000) {
  if (!upstream?.stdin?.writable) return Promise.reject(new Error("UPSTREAM_NOT_RUNNING"));
  const id = ++serial;
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{inflight.delete(id);reject(new Error("MCP_UPSTREAM_TIMEOUT:" + method));},timeoutMs);
    inflight.set(id,{resolve,reject,timeout});
    upstream.stdin.write(JSON.stringify({jsonrpc:"2.0",id,method,params})+"\n",err=>{
      if(err){clearTimeout(timeout);inflight.delete(id);reject(err);}
    });
  });
}
async function engine() {
  if (ready && upstream && !upstream.killed) return;
  if (connecting) return connecting;
  connecting = (async()=>{
    const win = process.platform === "win32";
    // Reuse the same pinned local engine entry recovered by the existing
    // Casa launcher; never prefer network npx over the verified local copy.
    const pinned = process.env.CENTRALDARK_CASA_ENGINE_ENTRY;
    upstream = pinned
      ? spawn(process.execPath,[pinned],{windowsHide:true,stdio:["pipe","pipe","pipe"]})
      : win
      ? spawn(process.env.ComSpec || "cmd.exe",["/d","/s","/c","npx.cmd -y "+ENGINE],{windowsHide:true,stdio:["pipe","pipe","pipe"]})
      : spawn("npx",["-y",ENGINE],{stdio:["pipe","pipe","pipe"]});
    partial="";
    emitOperationalEvent("ENGINE_STARTING", "LOCAL_STDIO");
    upstream.stdout.on("data",onData);
    // Raw stderr may contain sensitive data: one signal per engine run.
    let stderrObserved = false;
    upstream.stderr.on("data",()=>{
      if (!stderrObserved) {
        stderrObserved = true;
        emitOperationalEvent("ENGINE_STDERR", "DETAILS_REDACTED");
      }
    });
    upstream.on("error",err=>{emitOperationalEvent("ENGINE_SPAWN_FAILED", "NOT_PROVEN");invalidate("MCP_UPSTREAM_SPAWN:"+err.message);});
    upstream.on("exit",code=>{upstream=null;emitOperationalEvent("ENGINE_EXIT", Number.isInteger(code) ? String(code) : "UNKNOWN");invalidate("MCP_UPSTREAM_EXIT:"+code);});
    // Cold-start race reproduced on Windows: stdio requests sent before the
    // MIT engine finishes attaching its transport can be lost. A 6s warmup
    // is verified by a direct pipe initialize test (no vendor remote).
    await new Promise(resolve => setTimeout(resolve, 6000));
    if (!upstream?.stdin?.writable) throw Error("MCP_ENGINE_EXITED_DURING_WARMUP");
    await rpc("initialize",{
      protocolVersion:"2025-06-18",capabilities:{},
      clientInfo:{name:"CentralDark Casa Commander",version:"1.0.0"}
    });
    upstream.stdin.write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized",params:{}})+"\n");
    ready=true;
    emitOperationalEvent("MCP_INITIALIZE", "PASS");
  })();
  try { await connecting; } finally { connecting=null; }
}
function send(res,code,data){
  res.writeHead(code,{"content-type":"application/json; charset=utf-8","cache-control":"no-store"});
  res.end(JSON.stringify(data));
}
function authorized(auth){
  const a=Buffer.from(String(auth||"")),b=Buffer.from("Bearer "+TOKEN);
  return TOKEN.length>=24 && a.length===b.length && timingSafeEqual(a,b);
}
async function body(req){
  let size=0,data="";
  for await(const chunk of req){
    size+=chunk.length;
    if(size>65536) throw Error("REQUEST_TOO_LARGE");
    data+=chunk;
  }
  return JSON.parse(data||"{}");
}
// This authority is held by the local consent adapter, never by an HTTP handler.
// A grant permits exactly one directory listing at the path shown in local consent.
export function createLocalSupportSessions({ now = () => performance.now() } = {}) {
  let active;
  const validId = (value) => typeof value === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(value);
  return {
    approveLocal({ confirmed, operatorId, deviceId, directory, ttlMs = 60_000 }) {
      if (confirmed !== true || !validId(operatorId) || !validId(deviceId)
          || typeof directory !== "string" || !isAbsolute(directory) || directory.includes("\0")
          || !Number.isInteger(ttlMs) || ttlMs < 1 || ttlMs > 60_000)
        throw Error("SUPPORT_CONSENT_INVALID");
      const grant = randomBytes(32).toString("base64url");
      active = { grant, operatorId, deviceId, directory: resolve(directory), expires: now() + ttlMs, consumed: false };
      return grant;
    },
    revokeLocal() { active = undefined; },
    check({ grant, operatorId, deviceId, name, args }, consume = false) {
      const session = active;
      const validGrant = typeof grant === "string" && /^[A-Za-z0-9_-]{43}$/.test(grant);
      if (!session || !validGrant || !timingSafeEqual(Buffer.from(grant), Buffer.from(session.grant))
          || session.operatorId !== operatorId || session.deviceId !== deviceId
          || session.consumed || now() >= session.expires)
        return { error: "SUPPORT_SESSION_DENIED" };
      if (name !== "list_directory" || Object.keys(args).length !== 1 || args.path !== session.directory)
        return { error: "SUPPORT_SCOPE_DENIED" };
      if (consume) session.consumed = true;
      return {
        args: { path: session.directory, depth: 1 },
        stillActive: () => active === session && now() < session.expires,
      };
    },
  };
}

export function createCasaAgent({ supportSessions = createLocalSupportSessions() } = {}){
  if(TOKEN.length<24) throw Error("CENTRALDARK_CASA_BRIDGE_TOKEN_MISSING_OR_SHORT");
  async function readWithConsent(req, name, args) {
    const input = {
      grant: req.headers["x-centraldark-support-session"],
      operatorId: req.headers["x-centraldark-support-operator"],
      deviceId: req.headers["x-centraldark-support-device"],
      name, args,
    };
    const supplied = req.headers["x-centraldark-trace-id"];
    const trace = typeof supplied === "string" && /^[0-9a-f]{32}$/.test(supplied)
      ? supplied : randomBytes(16).toString("hex");
    const report = (status) => emitOperationalEvent("SUPPORT_READ", status + " reference=CD-" + trace);
    const deny = (code) => { report(code); return { error: code, reference: "CD-" + trace }; };
    const preflight = supportSessions.check(input);
    if (preflight.error) return deny(preflight.error);
    try {
      await engine();
      const decision = supportSessions.check(input, true);
      if (decision.error) return deny(decision.error);
      const value = await rpc("tools/call", { name: "list_directory", arguments: decision.args });
      if (!decision.stillActive()) return deny("SUPPORT_SESSION_DENIED");
      if (!Array.isArray(value?.content) || value.isError === true) return deny("SUPPORT_READ_FAILED");
      lastAuthorizedTool = { tool: "list_directory", kind: "READ_ONLY", at: new Date().toISOString(), verified: true };
      mqttPublish("receipt", lastAuthorizedTool);
      report("PASS");
      return { value, reference: "CD-" + trace };
    } catch {
      return deny("SUPPORT_UPSTREAM_NOT_PROVEN");
    }
  }
  return createServer(async(req,res)=>{
    if(req.method==="GET"&&req.url==="/health")
      return send(res,200,{ok:true,name:"CentralDark Casa Commander",engine_connected:ready,remote_vendor:false,
        last_authorized_tool:lastAuthorizedTool,
        mqtt:{enabled:MQTT_ENABLED,connected:mqttConnection?.connected===true,state:mqttState}});
    // Streamable HTTP MCP: preserve the proven Casa runtime /mcp contract
    // on the same process, loopback socket and existing Bearer authorization.
    if(req.url==="/mcp"){
      if(!authorized(req.headers.authorization))
        return send(res,401,{jsonrpc:"2.0",id:null,error:{code:-32001,message:"MCP_AUTH_REQUIRED"}});
      if(req.method!=="POST"){
        res.setHeader("Allow","POST");
        return send(res,405,{jsonrpc:"2.0",id:null,error:{code:-32600,message:"MCP_POST_REQUIRED"}});
      }
      let input;
      try{input=await body(req);}catch{
        return send(res,400,{jsonrpc:"2.0",id:null,error:{code:-32700,message:"MCP_INVALID_JSON"}});
      }
      const id=Object.hasOwn(input||{},"id")?input.id:null;
      if(input?.jsonrpc!=="2.0"||typeof input.method!=="string")
        return send(res,400,{jsonrpc:"2.0",id,error:{code:-32600,message:"MCP_INVALID_REQUEST"}});
      if(input.method==="notifications/initialized"){
        res.writeHead(202,{"cache-control":"no-store"});return res.end();
      }
      const ok=result=>send(res,200,{jsonrpc:"2.0",id,result});
      const err=(code,message)=>send(res,200,{jsonrpc:"2.0",id,error:{code,message}});
      try{
        if(input.method==="initialize")
          return ok({protocolVersion:"2025-06-18",capabilities:{tools:{listChanged:false}},
            serverInfo:{name:"CentralDark Casa Commander",version:"1.0.0"}});
        if(input.method==="ping")return ok({});
        if(input.method==="tools/list")
          return ok({tools:[{name:"list_directory",description:"One directory approved locally for one read.",
            inputSchema:{type:"object",properties:{path:{type:"string"}},required:["path"],additionalProperties:false}}]});
        if(input.method==="tools/call"){
          const name=String(input.params?.name||"");
          const args=input.params?.arguments;
          if(!/^[a-z_]{3,64}$/.test(name)||!args||typeof args!=="object"||Array.isArray(args))
            return err(-32602,"MCP_TOOL_INPUT_INVALID");
          const result = await readWithConsent(req, name, args);
          if (result.error) return send(res,200,{jsonrpc:"2.0",id,
            error:{code:-32003,message:result.error,data:{reference:result.reference}}});
          return ok({...result.value, _meta:{...(result.value?._meta || {}), centraldarkReference:result.reference}});
        }
        return err(-32601,"MCP_METHOD_NOT_FOUND");
      }catch{
        emitOperationalEvent("MCP_REQUEST_FAILED", "NOT_PROVEN");
        return err(-32603,"MCP_UPSTREAM_NOT_PROVEN");
      }
    }
    if(req.method!=="POST"||req.url!=="/tool")
      return send(res,404,{ok:false,error:"ROUTE_NOT_FOUND"});
    if(!authorized(req.headers.authorization))
      return send(res,401,{ok:false,error:"CASA_BRIDGE_AUTH_REQUIRED"});
    let input;
    try{input=await body(req);}catch(e){return send(res,400,{ok:false,error:String(e.message)});}
    const name=String(input?.name||"");
    if(!/^[a-z_]{3,64}$/.test(name)||typeof input.arguments!=="object"||input.arguments===null||Array.isArray(input.arguments))
      return send(res,400,{ok:false,error:"MCP_TOOL_INPUT_INVALID"});
    const result = await readWithConsent(req, name, input.arguments);
    if (result.error) {
      const status = result.error === "SUPPORT_UPSTREAM_NOT_PROVEN" ? 502
        : result.error === "SUPPORT_READ_FAILED" ? 422 : 403;
      return send(res,status,{ok:false,error:result.error,reference:result.reference});
    }
    return send(res,200,{ok:true,tool:"list_directory",result:result.value,
      execution:"CASA_ENGINE_RESULT",reference:result.reference});
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  createCasaAgent().listen(9101,"127.0.0.1",()=>{
    process.stdout.write("CENTRALDARK_CASA_LISTEN=127.0.0.1:9101\n");
  });
  void startCasaMqtt();
}
