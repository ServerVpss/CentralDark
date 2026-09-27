
import {radialLayout, routeEdge, hash01} from "./layout-core.mjs";

const $=s=>document.querySelector(s);
const canvas=$("#graph"), ctx=canvas.getContext("2d");
let data={nodes:[],edges:[]}, layout=null, selected=null, hover=null;
let zoom=1, pan={x:0,y:0}, dragging=false, last={x:0,y:0}, live=false;
let visibleNodes=[], visibleEdges=[];

const colorByType={
  MISSION:"#c33cff",MESSAGE:"#56d8ff",ACTOR:"#78e08f",ACTIVITY:"#f6b93b",TOOL:"#e58e26",
  SOURCE:"#60a3bc",EVIDENCE:"#63e6a6",MEMORY:"#9b59b6",DECISION:"#f8c291",RESULT:"#82ccdd",
  SERVICE:"#e55039",UNKNOWN:"#9aa5b4"
};

function normalize(raw){
  const nodes=(raw.nodes||[]).map((n,i)=>({
    id:String(n.id??n.node_id??`n${i}`),
    label:String(n.label??n.name??n.id??`node-${i}`),
    type:String(n.node_type??n.type??n.category??"UNKNOWN").toUpperCase(),
    state:String(n.state??n.status??"CURRENT").toUpperCase(),
    community:String(n.community??n.category??n.group??"default"),
    activity:Number(n.activity??n.score??0),
    observed_at:n.observed_at??n.timestamp??null,
    evidence_id:n.evidence_id??null,
    trace_id:n.trace_id??null,
    source_id:n.source_id??null,
    summary:n.summary??"",
  }));
  const ids=new Set(nodes.map(n=>n.id));
  const edges=(raw.edges||[]).map((e,i)=>({
    id:String(e.id??`e${i}`),
    source:String(e.source?.id??e.source??e.from??""),
    target:String(e.target?.id??e.target??e.to??""),
    relation:String(e.relation??e.type??"REFERENCES").toUpperCase(),
    active:Boolean(e.active??false)
  })).filter(e=>ids.has(e.source)&&ids.has(e.target));
  return {nodes,edges};
}

async function load(){
  let raw=null, source="sample";
  if(live){
    try{
      const r=await fetch("/api/graph?mode=vivo",{cache:"no-store"});
      if(r.ok){raw=await r.json();source="LIVE /api/graph";}
    }catch{}
  }
  if(!raw){
    const r=await fetch("./sample-graph.json",{cache:"no-store"});
    raw=await r.json();
  }
  data=normalize(raw);
  $("#source").textContent=source;
  apply();
}

function resize(){
  const dpr=Math.min(devicePixelRatio||1,2), r=canvas.getBoundingClientRect();
  canvas.width=Math.floor(r.width*dpr); canvas.height=Math.floor(r.height*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  apply();
}

function apply(){
  const r=canvas.getBoundingClientRect();
  const q=$("#search").value.trim().toLowerCase();
  const state=$("#state").value, type=$("#type").value;
  visibleNodes=data.nodes.filter(n=>(!q||(`${n.label} ${n.id} ${n.summary}`).toLowerCase().includes(q))&&(!state||n.state===state)&&(!type||n.type===type));
  const ids=new Set(visibleNodes.map(n=>n.id));
  visibleEdges=data.edges.filter(e=>ids.has(e.source)&&ids.has(e.target));
  layout=radialLayout(visibleNodes,r.width,r.height,{coreRadius:72,guardRadius:116,ringGap:74,nodeRadius:5,padding:9});
  const pos=new Map(layout.nodes.map(n=>[n.id,n]));
  visibleNodes=layout.nodes;
  const edgeMode=$("#edges").value;
  visibleEdges=visibleEdges.filter(e=>edgeMode==="all"||edgeMode==="causal"?(["CAUSED","PARENT_OF","GENERATED","USED","DEPENDS_ON"].includes(e.relation)||edgeMode==="all"):isPrimary(e,pos));
  renderInspector();
  draw();
}

function degrees(){
  const d=new Map(visibleNodes.map(n=>[n.id,0]));
  for(const e of visibleEdges){d.set(e.source,(d.get(e.source)||0)+1);d.set(e.target,(d.get(e.target)||0)+1)}
  return d;
}
function isPrimary(e,pos){
  const a=pos.get(e.source), b=pos.get(e.target);
  if(!a||!b)return false;
  return e.relation==="PARENT_OF"||e.relation==="CAUSED"||e.relation==="GENERATED"||e.relation==="EVIDENCES";
}

function worldPoint(n){return {x:(n.x-layout.cx),y:(n.y-layout.cy)}}
function screenPoint(n,r){
  return {x:r.width/2+pan.x+(n.x-layout.cx)*zoom,y:r.height/2+pan.y+(n.y-layout.cy)*zoom}
}
function drawEdge(e,pos,r,highlight=false){
  const a=pos.get(e.source),b=pos.get(e.target); if(!a||!b)return;
  const aw=worldPoint(a), bw=worldPoint(b);
  const route=routeEdge(aw,bw,layout.guardRadius,e.id);
  const toScreen=p=>({x:r.width/2+pan.x+p.x*zoom,y:r.height/2+pan.y+p.y*zoom});
  ctx.beginPath();
  const p0=toScreen(route.points[0]);ctx.moveTo(p0.x,p0.y);
  if(route.kind==="line"){const p1=toScreen(route.points[1]);ctx.lineTo(p1.x,p1.y)}
  else{const c=toScreen(route.points[1]),p1=toScreen(route.points[2]);ctx.quadraticCurveTo(c.x,c.y,p1.x,p1.y)}
  const causal=["CAUSED","PARENT_OF","GENERATED","USED","EVIDENCES"].includes(e.relation);
  ctx.strokeStyle=highlight?"#ffffff":causal?"#5bd3ff55":"#7f8ea233";
  ctx.lineWidth=highlight?1.8:(e.active?1.5:.65);
  if(!causal)ctx.setLineDash([4,5]);else ctx.setLineDash([]);
  ctx.stroke();ctx.setLineDash([]);
}

function draw(){
  if(!layout)return;
  const r=canvas.getBoundingClientRect();
  ctx.clearRect(0,0,r.width,r.height);
  const pos=new Map(visibleNodes.map(n=>[n.id,n]));

  // protected nucleus / virtual focus lens
  const center={x:r.width/2+pan.x,y:r.height/2+pan.y};
  ctx.beginPath();ctx.arc(center.x,center.y,layout.guardRadius*zoom,0,Math.PI*2);
  ctx.strokeStyle="#c33cff18";ctx.lineWidth=1;ctx.stroke();
  const grd=ctx.createRadialGradient(center.x,center.y,4,center.x,center.y,layout.coreRadius*zoom);
  grd.addColorStop(0,"#ffffff");grd.addColorStop(.22,"#d8a8ff");grd.addColorStop(.55,"#a926ff77");grd.addColorStop(1,"#40106011");
  ctx.fillStyle=grd;ctx.beginPath();ctx.arc(center.x,center.y,layout.coreRadius*zoom,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#d9c5e8";ctx.font="10px ui-monospace";ctx.textAlign="center";ctx.fillText(selected?`FOCUS: ${selected.label}`:"FOCUS LENS",center.x,center.y+4);

  for(const e of visibleEdges) drawEdge(e,pos,r,selected&&(e.source===selected.id||e.target===selected.id));

  const deg=degrees();
  for(const n of visibleNodes){
    const p=screenPoint(n,r); const sel=selected?.id===n.id, hov=hover?.id===n.id;
    const rr=(sel?9:hov?7:Math.min(6,3+Math.log2(1+(deg.get(n.id)||0))*.6))*Math.max(.72,Math.min(1.35,zoom));
    if(n.state==="CONFLICT"||n.state==="UNKNOWN"){
      ctx.beginPath();ctx.arc(p.x,p.y,rr+5,0,Math.PI*2);
      ctx.strokeStyle=n.state==="CONFLICT"?"#ff5d7366":"#ffd16666";ctx.stroke();
    }
    ctx.beginPath();ctx.arc(p.x,p.y,rr,0,Math.PI*2);
    ctx.fillStyle=colorByType[n.type]||colorByType.UNKNOWN;ctx.fill();
    if(sel||hov||zoom>1.65){
      ctx.font="10px ui-monospace";ctx.textAlign="left";ctx.fillStyle="#dbe8f7";
      ctx.fillText(n.label.slice(0,34),p.x+rr+5,p.y+3);
    }
  }
  $("#nNodes").textContent=visibleNodes.length;$("#nEdges").textContent=visibleEdges.length;
}

function rankCandidates(){
  const deg=degrees(), incoming=new Map(visibleNodes.map(n=>[n.id,0]));
  for(const e of visibleEdges)incoming.set(e.target,(incoming.get(e.target)||0)+1);
  return visibleNodes.map(n=>{
    let score=0,reasons=[];
    if(n.state==="CONFLICT"){score+=100;reasons.push("CONFLICT")}
    if(n.state==="UNKNOWN"){score+=75;reasons.push("UNKNOWN")}
    if((incoming.get(n.id)||0)===0 && n.type!=="MISSION"){score+=52;reasons.push("ORPHAN?")}
    if(n.observed_at && Date.now()-Date.parse(n.observed_at)>86400000*7){score+=35;reasons.push("STALE")}
    if((deg.get(n.id)||0)>8){score+=Math.min(30,deg.get(n.id)*2);reasons.push("HIGH_DEGREE")}
    if(!n.evidence_id && ["DECISION","RESULT"].includes(n.type)){score+=30;reasons.push("MISSING_EVIDENCE")}
    return {n,score,reasons};
  }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,12);
}

function renderInspector(){
  const box=$("#agentic");box.innerHTML="";
  for(const x of rankCandidates()){
    const d=document.createElement("div");d.className="card";d.dataset.state=x.n.state;
    d.innerHTML=`<strong>${x.n.label}</strong><small>${x.reasons.join(" · ")} · score ${x.score}</small>`;
    d.onclick=()=>{selected=x.n;draw();renderNode();};
    box.appendChild(d);
  }
  renderNode();
}

function renderNode(){
  const b=$("#nodeDetail");
  if(!selected){b.innerHTML="<span class='sub'>Selecione um nó.</span>";return}
  b.innerHTML=`<div class="card"><strong>${selected.label}</strong>
  <small>ID ${selected.id}</small><br>
  <span class="badge">${selected.type}</span><span class="badge">${selected.state}</span>
  <p>${selected.summary||"sem summary"}</p>
  <small>trace=${selected.trace_id||"—"}<br>source=${selected.source_id||"—"}<br>evidence=${selected.evidence_id||"—"}</small></div>`;
}

function nearest(mx,my){
  const r=canvas.getBoundingClientRect();let best=null,bd=18;
  for(const n of visibleNodes){const p=screenPoint(n,r),d=Math.hypot(mx-p.x,my-p.y);if(d<bd){bd=d;best=n}}
  return best;
}
canvas.addEventListener("mousemove",e=>{
  if(dragging){pan.x+=e.clientX-last.x;pan.y+=e.clientY-last.y;last={x:e.clientX,y:e.clientY};draw();return}
  const r=canvas.getBoundingClientRect();hover=nearest(e.clientX-r.left,e.clientY-r.top);draw();
});
canvas.addEventListener("mousedown",e=>{dragging=true;last={x:e.clientX,y:e.clientY}});
addEventListener("mouseup",()=>dragging=false);
canvas.addEventListener("click",e=>{
  if(Math.hypot(e.clientX-last.x,e.clientY-last.y)>4)return;
  const r=canvas.getBoundingClientRect();selected=nearest(e.clientX-r.left,e.clientY-r.top);renderNode();draw();
});
canvas.addEventListener("wheel",e=>{e.preventDefault();zoom=Math.max(.3,Math.min(4,zoom*Math.exp(-e.deltaY*.001)));draw()},{passive:false});

for(const id of ["search","state","type","edges"]) $(id).addEventListener("input",apply);
$("#reset").onclick=()=>{zoom=1;pan={x:0,y:0};selected=null;apply()};
$("#live").onclick=()=>{live=!live;$("#live").textContent=live?"LIVE: ON":"LIVE: OFF";load()};
new ResizeObserver(resize).observe($("#stage"));
load();
