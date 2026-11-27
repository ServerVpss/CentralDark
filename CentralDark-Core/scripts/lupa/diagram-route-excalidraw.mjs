#!/usr/bin/env node
// Projecao DERIVADA do gate CentralDark. Nao cria segunda rota nem altera desenhos antigos.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {fileURLToPath} from "node:url";

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const SRC=path.join(REPO,"docs/BRAIN/Excalidraw/CENTRALDARK-FIGJAM-OMNI-SOURCE.json");
const FLOWS=path.join(REPO,"docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/FLOW-REGISTRY.json");
const DEST=path.join(REPO,"docs/BRAIN/Excalidraw/CENTRALDARK-FIGJAM-ROTAS.excalidraw.md");
const PREFIX="cd_generated_";
const sha=s=>crypto.createHash("sha256").update(String(s)).digest("hex");
const uid=(type,key)=>PREFIX+type+"_"+sha(key).slice(0,18);
const num=s=>parseInt(sha(s).slice(0,8),16);
function base(type,key,x,y,w,h,other={}){
  const id=uid(type,key);
  return {id,type,x:Math.round(x),y:Math.round(y),width:Math.max(1,Math.round(w)),height:Math.max(1,Math.round(h)),
    angle:0,strokeColor:"#5ebcd2",backgroundColor:"transparent",fillStyle:"solid",strokeWidth:2,
    strokeStyle:"solid",roughness:0,opacity:100,groupIds:[],frameId:null,roundness:null,seed:num(key),
    version:1,versionNonce:num("v:"+key),isDeleted:false,boundElements:[],updated:1,link:null,locked:false,...other};
}
function caption(key,value,x,y,w,h,size=16,color="#ecf9ff"){
  return base("text",key,x,y,w,h,{text:String(value),originalText:String(value),fontSize:size,fontFamily:1,
    textAlign:"center",verticalAlign:"middle",autoResize:false,lineHeight:1.25,
    baseline:size,strokeColor:color,containerId:null});
}
function card(key,x,y,w,h,value,fill="#233047",size=16,diamond=false){
  const shape=base(diamond?"diamond":"rectangle",key,x,y,w,h,{
    backgroundColor:fill,roundness:diamond?null:{type:3}});
  const label=caption("caption:"+key,value,x+9,y+7,w-18,h-14,size);
  return [shape,label];
}
function link(key,a,b,label=""){
  const sx=a.x+a.w/2,sy=a.y+a.h/2,dx=b.x+b.w/2-sx,dy=b.y+b.h/2-sy;
  const e=base("arrow",key,sx,sy,Math.max(1,Math.abs(dx)),Math.max(1,Math.abs(dy)),{
    points:[[0,0],[Math.round(dx),Math.round(dy)]],
    endArrowhead:"arrow",startArrowhead:null,strokeColor:"#7184a2",
    startBinding:null,endBinding:null,lastCommittedPoint:null,elbowed:false});
  const out=[e];
  if(label)out.push(caption("edge:"+key,label,sx+dx/2-42,sy+dy/2-15,84,30,12,"#f4cb82"));
  return out;
}
function inputs(){
  const s=JSON.parse(fs.readFileSync(SRC,"utf8"));
  const f=JSON.parse(fs.readFileSync(FLOWS,"utf8"));
  if(s.schema!=="centraldark.figjam-observed.v1"||s.fileKey!=="eE4FS10ymxxlXDJAgWavCh"
    ||!Array.isArray(s.nodes)||!Array.isArray(s.links))throw Error("INVALID_FIGJAM_SNAPSHOT");
  if(f.schema!=="centraldark.flow-registry.v1"||!Array.isArray(f.flows))throw Error("INVALID_ROUTE_REGISTRY");
  return {s,f};
}
export function project(source){
  const {s,f}=source;const items=[];
  items.push(...card("heading:figjam",80,60,2300,90,
    "CENTRALDARK | FIGJAM OMNI 8099 | FONTE ORIGINAL","#123748",28));
  items.push(caption("figjam:source","FONTE: "+s.figjam_url,
    90,170,2300,50,18,"#82dfea"));
  const map=new Map(),xs=s.nodes.map(n=>Number(n.x)),ys=s.nodes.map(n=>Number(n.y));
  const minX=Math.min(...xs),minY=Math.min(...ys),scale=0.73;
  for(const n of s.nodes){
    const b={x:130+(Number(n.x)-minX)*scale,y:290+(Number(n.y)-minY)*scale,
      w:Math.max(160,Number(n.width)*scale),h:Math.max(94,Number(n.height)*scale)};
    map.set(n.id,b);
    items.push(...card("figjam:"+n.id,b.x,b.y,b.w,b.h,n.text,
      "#263249",16,n.kind==="DIAMOND"));
  }
  for(const c of s.links){
    if(!map.has(c.from)||!map.has(c.to))throw Error("BAD_FIGJAM_EDGE:"+c.id);
    items.push(...link("figjam:"+c.id,map.get(c.from),map.get(c.to),c.label));
  }
  let y=Math.ceil((Math.max(...[...map.values()].map(b=>b.y+b.h))+180)/100)*100;
  items.push(...card("heading:routes",80,y,2300,90,
    "CENTRALDARK | ROTAS VIGENTES NO REGISTRO CANONICO","#123748",26));
  y+=125;
  items.push(caption("registry:source",
    "FLOW-REGISTRY.json | Projecao automatica ao executar o gate | Nenhuma rota nova",
    85,y,2290,45,17,"#edc57e"));
  y+=74;
  const flows=f.flows.slice().sort((a,b)=>String(a.kind).localeCompare(String(b.kind))
    ||String(a.id).localeCompare(String(b.id)));
  const kinds=[...new Set(flows.map(n=>String(n.kind)))];
  for(const kind of kinds){
    const rows=flows.filter(n=>String(n.kind)===kind);
    items.push(...card("kind:"+kind,80,y,2300,60,kind+" | "+rows.length+" fluxos","#1c3146",21));
    y+=85;const cols=6,w=365,h=126,gap=25;
    rows.forEach((route,i)=>{
      const x=80+(i%cols)*(w+gap),by=y+Math.floor(i/cols)*(h+16);
      items.push(...card("flow:"+route.id,x,by,w,h,
        String(route.id)+"\n"+String(route.from||"?")+" → "+String(route.to||"?")
        +"\n["+String(route.status||"UNKNOWN")+"]",
        kind==="FUNCTION"?"#283d43":kind==="TRIGGER"?"#2e3b55":"#333447",13));
    });
    y+=Math.ceil(rows.length/6)*(h+16)+65;
  }
  return {items,flowCount:flows.length,figjamNodes:s.nodes.length,
    figjamLinks:s.links.length,sourceHash:sha(JSON.stringify(s)+JSON.stringify(f))};
}
function previous(markdown){
  const start=markdown.indexOf("## Drawing");
  const open=markdown.indexOf("\x60\x60\x60json",start);
  const close=markdown.indexOf("\x60\x60\x60",open+7);
  if(start<0||open<0||close<0)throw Error("DRAWING_FORMAT_MISMATCH");
  const data=JSON.parse(markdown.slice(open+7,close).trim());
  if(data.type!=="excalidraw"||data.source!=="CentralDark diagram-route-gate")
    throw Error("REFUSE_OVERWRITE_FOREIGN_DRAWING");
  return data;
}
export function syncObsidian({check=false}={}){
  const source=inputs(), projected=project(source);
  const prev=fs.existsSync(DEST)?previous(fs.readFileSync(DEST,"utf8")):null;
  const manual=(prev?.elements||[]).filter(e=>!String(e?.id||"").startsWith(PREFIX));
  const drawing={type:"excalidraw",version:2,source:"CentralDark diagram-route-gate",
    elements:[...projected.items,...manual],
    appState:{viewBackgroundColor:"#10131c",gridSize:null,...(prev?.appState||{})},
    files:prev?.files||{}};
  const fence="\x60\x60\x60";
  const markdown=[
    "---",
    "excalidraw-plugin: parsed",
    "tags: [excalidraw, centraldark]",
    "figjam_origem: \""+source.s.figjam_url+"\"",
    "rotas_origem: \"docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/FLOW-REGISTRY.json\"",
    "figjam_blocos: "+projected.figjamNodes,
    "figjam_conexoes: "+projected.figjamLinks,
    "rotas_mapeadas: "+projected.flowCount,
    "atualizacao_figjam: MANUAL",
    "verificacao_estrutura: PASS",
    "verificacao_visual: UNKNOWN",
    "estado_evidencia: UNKNOWN",
    "---","",
    "# CENTRALDARK — FigJam Omni 8099 e rotas canônicas","",
    "**Para abrir como desenho:** clique no menu de três pontos desta nota e escolha **Abrir como desenho Excalidraw** (Open as Excalidraw Drawing).",
    "O modo Markdown mostra o JSON; não é o desenho visual.","",
    "Fonte FigJam: "+source.s.figjam_url,"",
    "Registro: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/FLOW-REGISTRY.json","",
    "Atualizar: node scripts/lupa/diagram-route-gate.mjs --sync-obsidian","",
    "A projeção preserva elementos manuais deste desenho e não altera outros desenhos.",
    "Elementos gerados refletem a última leitura do Figma, não sincronização ao vivo.",
    "","## Drawing",fence+"json",JSON.stringify(drawing,null,2),fence,"%%",""
  ].join("\n");
  const old=fs.existsSync(DEST)?fs.readFileSync(DEST,"utf8"):null;
  const changed=old!==markdown;
  if(changed&&!check)fs.writeFileSync(DEST,markdown,"utf8");
  return {status:changed?(check?"STALE":"UPDATED"):"UNCHANGED",
    output:DEST,figjam_url:source.s.figjam_url,
    figjam_nodes:projected.figjamNodes,figjam_links:projected.figjamLinks,
    registry_flows:projected.flowCount,all_elements:drawing.elements.length,
    manual_elements_preserved:manual.length,source_sha256:projected.sourceHash,
    live_figma_refresh:false,existing_drawings_modified:false};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const check=process.argv.includes("--check");
  const r=syncObsidian({check});
  console.log(JSON.stringify(r,null,2));
  if(check&&r.status==="STALE")process.exitCode=1;
}
