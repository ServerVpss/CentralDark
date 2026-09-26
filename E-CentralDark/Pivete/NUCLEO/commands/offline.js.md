# COMANDO - offline.js.download
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\(7) A ascensão do arquiteto de IA — Clay Bavor, cofundador da Sierra com Alessio Fanelli - YouTube_files\offline.js.download
**SHA:** 93ec5f80e12c305b7a0c9c24f2232796f49f80f80e9105bc6f5683c78e2bd0af
**Timestamp:** 2026-08-23T20:03:38.801797
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- raw_player_response:H,download_media:!0,start:Infinity,disable_watch_next:!0})},gB=function(){return{priority:1,

### Ouro Bruto (primeiros 5000 chars)
```
(function(g){var window=this;'use strict';var rr=function(t,f,H){f=f.map(Q=>g.H4(t,Q,H));
return g.PN.all(f)},X0=function(t,f){return g.WN(t.J.objectStore("EntityStore").index("entityType"),{query:IDBKeyRange.only(f)},H=>g.PN.all([H.delete(),
g.tm(t,H.cursor.primaryKey)]).then(()=>{g.fs(t,H.cursor.primaryKey,f);return g.aU(H)}))},OQA=function(t,f,H,Q){var N=g.KX(t.O,1);
return g.Bk(t,f,Q).then(m=>{if(m||g.Ce("web_enable_entity_upsert_on_update")){m=g.n7(m||{},H);var U={key:f,entityType:Q,data:g.He8(N,m,f),version:1};return g.PN.all([t.J.objectStore("EntityStore").put(U),g.mDB(t,m,Q)])}}).then(()=>{g.fs(t,f,Q);
return f})},JvV=function(t,f){return g.$e(t,{mode:"readwrite",
g7:!0},H=>rr(H,f,"offlineOrchestrationActionWrapperEntity"))},a1C=function(t){return g.$e(t,{mode:"readwrite",
g7:!0},f=>X0(f,"videoPlaybackPositionEntity"))},bH=function(t,f,H){return g.$e(t,{mode:"readonly",
g7:!0},Q=>g.Bk(Q,f,H))},W9V=function(t){var f=new g.GR("und",new g.LA("Default","und",!0));
f.captionTracks=t.captionTracks;return f},zY5=function(t){return new g.us(function(f,H){var Q=t.length,N=[];
if(Q){var m=function(D,u){Q--;N[D]=u;Q==0&&f(N)},U=function(D){H(D)};
for(let D=0;D<t.length;D++){var C=t[D];g.KhW(C,g.sd(m,D),U)}}else f(N)})},eYj=function({type:t,
payload:f}){t={type:t};f!==void 0&&(t.payload=f);return t},cI=function(t){return g.eT((0,g.dmI)(),t)},jO5=function(t){t=t.options?.persistenceOption;
return t==="ENTITY_PERSISTENCE_OPTION_PERSIST"||t==="ENTITY_PERSISTENCE_OPTION_INMEMORY_AND_PERSIST"},yvr=async function(t){var f=await g.i_();
f&&await g.$e(f,"readwrite",H=>{var Q={};for(let N of t){if(!N.entityKey||!jO5(N))continue;let m=g.G9(N.payload),U=void 0;N.type==="ENTITY_MUTATION_TYPE_REPLACE"&&(U=()=>g.H4(H,N.payload[m],m));
N.type==="ENTITY_MUTATION_TYPE_DELETE"&&(U=()=>g.QN(H,N.entityKey));
N.type==="ENTITY_MUTATION_TYPE_UPDATE"&&(U=()=>OQA(H,N.entityKey,N.payload[m],m));
U&&(Q[N.entityKey]=Q[N.entityKey]?Q[N.entityKey].then(U):U())}return g.PN.all(Object.values(Q))})},Sw=async function(t){!(t=t.mutations)||t.length<=0||(g.f6&&g.f6.dispatch(eYj({type:"ENTITY_LOADED",
payload:t})),await yvr(t),t.length=0)},Gb5=function(t){return t!==void 0},sOJ=function(t){var f=g.ly();
f=Object.assign({},f);t=Object.assign({},t);for(let H in f)t[H]?(f[H]!==4&&(f[H]=t[H]),delete t[H]):f[H]!==2&&(f[H]=4);Object.assign(f,t);g.hrW(f);JSON.stringify(f);return f},hYV=async function(t){var f=await g.lP();
return f?g.Fn(await g.by(f),["index","media","captions"],{mode:"readwrite",g7:!0},H=>{var Q=IDBKeyRange.bound(t+"|",t+"~");H=[H.objectStore("index").delete(Q),H.objectStore("media").delete(Q),H.objectStore("captions").delete(Q)];return g.PN.all(H).then(()=>{})}):void 0},L9o=async function(){var t=await g.lP();
if(!t)throw g.DV("rvdfd");return g.Fn(await g.by(t),["index","media"],{mode:"readwrite",g7:!0},f=>{var H={};return g.JZ(f.objectStore("index"),{},Q=>{var N=Q.cursor.key.match(/^([\w\-_]+)\|(a|v)$/),m=g.PN.resolve(void 0);if(N){let U=N[1];N=N[2];H[U]=H[U]||{};H[U][N]=g.XzB(Q.getValue()?.fmts)}else m=Q.delete().then(()=>{});
return g.PN.all([g.aU(Q),m]).then(([U])=>U)}).then(()=>{var Q={};
for(let m of Object.keys(H)){let U=H[m].v;Q[m]=H[m].a&&U?1:2}var N=sOJ(Q);return g.ZxI(f.objectStore("media"),{},m=>{var U=m.cursor.key.match(g.xbI);U&&Q[U[1]]||f.objectStore("media").delete(m.cursor.key);return g.zb2(m)}).then(()=>N)})})},ZQw=async function(t,f){var H=await g.lP();
if(!H)throw g.DV("wct");H=await g.by(H);await g.Fn(H,["captions"],{mode:"readwrite",g7:!0},Q=>{var N=[];Q=Q.objectStore("captions");for(let m=0;m<f.length;m++){let U=Q.put(f[m],t+"|"+f[m].metadata.vss_id);N.push(U)}return g.PN.all(N)})},l1J=async function(t){t=IDBKeyRange.bound(t+"|",t+"~");
var f=await g.lP();if(!f)throw g.DV("gactfv");return(await g.by(f)).getAll("captions",t)},rvI=async function(t){g.XL(t,0);
return hYV(t)},Xsj=function(t){return{context:g.yr(),
videoIds:t}},bQj=function(t){return{context:g.yr(),
playlistIds:t}},cvI=function(t){return{context:g.yr(),
offlinePlaylistSyncChecks:t}},x9Y=function(){xg||(xg=new SHj);
return xg},RY8=function(t,f){return{eventType:{flowEventNamespace:"FLOW_EVENT_NAMESPACE_OFFLINE_ORCHESTRATION",
flowEventType:t},metadata:f,statusCode:void 0,csn:void 0,can:void 0}},qH7=function(t,f,H){H||(H=t.J.get("FLOW_TYPE_OFFLINE_ORCHESTRATION"),H||(H=g.Zo(16),t.J.set("FLOW_TYPE_OFFLINE_ORCHESTRATION",H)));
t={flowNonce:H,flowType:"FLOW_TYPE_OFFLINE_ORCHESTRATION",flowEventType:f.eventType};f.metadata&&(t.flowMetadata=f.metadata);f.statusCode!==void 0&&(t.flowEventStatus=f.statusCode);f.csn&&(t.csn=f.csn);f.can&&(t.can=f.can);g.rG("flowEvent",t,void 0)},d9w=async function(t){var f=await g.$e(t,{mode:"readonly",
g7:!0},V=>g.Mp(V,"playbackData").then(W=>{var r=W.map(d=>d.transfer).filter(d=>!!d),c=W.map(d=>d.offlineVideoPolicy).filter(d=>!!d),x=W.filter(d=>!!d.key).map(d=>g.sj(g.GU(d.key).entityId,"downloadStatusEntity"));
r=g.Mp(V,"transfer",r);c=g.Mp(V,"offlineVideoPolicy",c);x=g.Mp(V,"downloadStatusEntity",x);var R=r.then(d=>{d=d.redu
```