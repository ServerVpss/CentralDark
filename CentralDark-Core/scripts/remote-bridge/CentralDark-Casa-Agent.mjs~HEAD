// CentralDark Casa Commander: engine DesktopCommanderMCP MIT, modo LOCAL stdio.
// Fio privado: CentralDark MCP -> Tailscale Serve :9100 -> 127.0.0.1:9101.
// Não usa mcp.desktopcommander.app; exige segredo compartilhado de bridge.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

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
    upstream = win
      ? spawn(process.env.ComSpec || "cmd.exe",["/d","/s","/c","npx.cmd -y "+ENGINE],{windowsHide:true,stdio:["pipe","pipe","pipe"]})
      : spawn("npx",["-y",ENGINE],{stdio:["pipe","pipe","pipe"]});
    partial="";
    upstream.stdout.on("data",onData);
    upstream.stderr.on("data",()=>{});
    upstream.on("error",err=>invalidate("MCP_UPSTREAM_SPAWN:"+err.message));
    upstream.on("exit",code=>{upstream=null;invalidate("MCP_UPSTREAM_EXIT:"+code);});
    await rpc("initialize",{
      protocolVersion:"2025-06-18",capabilities:{},
      clientInfo:{name:"CentralDark Casa Commander",version:"1.0.0"}
    });
    upstream.stdin.write(JSON.stringify({jsonrpc:"2.0",method:"notifications/initialized",params:{}})+"\n");
    ready=true;
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
export function createCasaAgent(){
  if(TOKEN.length<24) throw Error("CENTRALDARK_CASA_BRIDGE_TOKEN_MISSING_OR_SHORT");
  return createServer(async(req,res)=>{
    if(req.method==="GET"&&req.url==="/health")
      return send(res,200,{ok:true,name:"CentralDark Casa Commander",engine_connected:ready,remote_vendor:false});
    if(req.method!=="POST"||req.url!=="/tool")
      return send(res,404,{ok:false,error:"ROUTE_NOT_FOUND"});
    if(!authorized(req.headers.authorization))
      return send(res,401,{ok:false,error:"CASA_BRIDGE_AUTH_REQUIRED"});
    let input;
    try{input=await body(req);}catch(e){return send(res,400,{ok:false,error:String(e.message)});}
    const name=String(input.name||"");
    if(!/^[a-z_]{3,64}$/.test(name)||typeof input.arguments!=="object"||input.arguments===null||Array.isArray(input.arguments))
      return send(res,400,{ok:false,error:"MCP_TOOL_INPUT_INVALID"});
    if(!READ_ONLY_TOOLS.has(name)&&process.env.CENTRALDARK_CASA_WRITE_ENABLED!=="true")
      return send(res,403,{ok:false,error:"CASA_WRITE_DISABLED"});
    try{
      await engine();
      const value=await rpc("tools/call",{name,arguments:input.arguments});
      send(res,200,{ok:value?.isError!==true,tool:name,result:value,execution:"CASA_ENGINE_RESULT"});
    }catch(e){send(res,502,{ok:false,error:String(e.message).slice(0,800),execution:"NOT_PROVEN"});}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
  createCasaAgent().listen(9101,"127.0.0.1",()=>{
    process.stdout.write("CENTRALDARK_CASA_LISTEN=127.0.0.1:9101\n");
  });
}
