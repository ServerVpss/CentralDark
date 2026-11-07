import assert from "node:assert/strict";
import test from "node:test";
import {readFileSync} from "node:fs";
import {getOneHeartSupabaseSignals} from "../src/one-heart-supabase.js";

const env={SUPABASE_URL:"https://test-project.supabase.co",SUPABASE_SERVICE_ROLE_KEY:"TEST_ONLY_VALUE"};
const now=Date.parse("2026-10-25T12:00:00Z");
function sample(outputs, seen=[]) {
  return async (url,options)=>{
    seen.push({url,headers:options.headers});
    const entry=Object.entries(outputs).find(([key])=>url.includes("/"+key+"?"));
    return entry ? {ok:true,json:async()=>entry[1]} : {ok:false,status:404};
  };
}
test("sem configuracao => UNKNOWN e nenhuma chamada",async()=>{
  const data=await getOneHeartSupabaseSignals({env:{},now,fetcher:()=>{throw Error("unexpected")}});
  assert.equal(data.state,"UNKNOWN");
  assert.equal(data.reason,"SOURCE_NOT_CONFIGURED");
});
test("amostra parcial não promove PASS e não expõe chave",async()=>{
  const seen=[];
  const t=new Date(now-10_000).toISOString();
  const data=await getOneHeartSupabaseSignals({env,now,fetcher:sample({
    edge_function_health:[{checked_at:t,total_functions:2,online_count:2,offline_count:0,error_count:0,all_healthy:true}],
    module_health_status:[{health_label:"healthy",last_check_at:t}],
    radar_pulses:[{source:"heartbeat",status:"PASS",measured_at:t,ttl_seconds:120}],
  },seen)});
  assert.equal(data.state,"UNKNOWN");
  assert.equal(data.radar.state,"PARTIAL");
  assert.equal(data.edge_functions.online,2);
  assert.equal(data.radar.sources_fresh,1);
  assert.equal(seen.length,3);
  assert.ok(seen.every(x=>x.headers.apikey===env.SUPABASE_SERVICE_ROLE_KEY));
  assert.ok(!JSON.stringify(data).includes(env.SUPABASE_SERVICE_ROLE_KEY));
});
test("medicao antiga nao vira PASS",async()=>{
  const data=await getOneHeartSupabaseSignals({env,now,fetcher:sample({
    edge_function_health:[{checked_at:new Date(now-600_000).toISOString(),all_healthy:true,total_functions:1,online_count:1,offline_count:0,error_count:0}],
    module_health_status:[],radar_pulses:[],
  })});
  assert.equal(data.state,"UNKNOWN");
  assert.equal(data.edge_functions.state,"UNKNOWN");
});
test("funcao offline permanece FAIL",async()=>{
  const data=await getOneHeartSupabaseSignals({env,now,fetcher:sample({
    edge_function_health:[{checked_at:new Date(now-10_000).toISOString(),all_healthy:false,total_functions:2,online_count:1,offline_count:1,error_count:0}],
    module_health_status:[],radar_pulses:[],
  })});
  assert.equal(data.state,"FAIL");
  assert.equal(data.edge_functions.offline,1);
});
test("falha de leitura e host inseguro nao produzem verde",async()=>{
  const broken=await getOneHeartSupabaseSignals({env,now,fetcher:async()=>{throw Error("network")}});
  assert.equal(broken.state,"UNKNOWN");
  const invalid=await getOneHeartSupabaseSignals({now,env:{SUPABASE_URL:"http://localhost:54321",SUPABASE_SERVICE_ROLE_KEY:"TEST_ONLY"},fetcher:()=>{throw Error("called")}});
  assert.equal(invalid.state,"UNKNOWN");
});
test("src e dist preservam rota unica /heartbeat",()=>{
  for(const loc of ["../src/index.js","../dist/index.js"]){
    const source=readFileSync(new URL(loc,import.meta.url),"utf8");
    assert.equal((source.match(/app\.get\("\/heartbeat"/g)||[]).length,1);
    assert.match(source,/body\.supabase = await getOneHeartSupabaseSignals\(\)/);
    assert.match(source,/heart: "one"/);
  }
});

test("Cockpit usa a API como fio unico para mostrar os resumos",()=>{
  const source=readFileSync(new URL("../../../instinto-superior/src/lib/cockpit.functions.ts",import.meta.url),"utf8");
  const view=readFileSync(new URL("../../../instinto-superior/src/components/central/StatusPanel.tsx",import.meta.url),"utf8");
  assert.match(source,/heartbeatRaw\.dados\?\.\["supabase"\]/);
  assert.match(source,/const supabaseSignals: Estado = heartbeat\.estado === "PASS"/);
  assert.match(view,/Supabase · One Heart/);
  assert.match(view,/d\?\.supabaseSignals \?\? unknown/);
});

test("todos os 12 probes recentes e saudaveis permitem PASS",async()=>{
  const sources=["github","liveFabric","grafoVivo","omniRouter","apiHealth","heartbeat",
    "omniModels","receipts","casaSite","screenpipe","screenpipeVps","actions"];
  const t=new Date(now-1000).toISOString();
  const data=await getOneHeartSupabaseSignals({env,now,fetcher:sample({
    edge_function_health:[{checked_at:t,total_functions:12,online_count:12,offline_count:0,error_count:0,all_healthy:true}],
    module_health_status:[{health_label:"healthy",last_check_at:t}],
    radar_pulses:sources.map(source=>({source,status:"PASS",measured_at:t,ttl_seconds:120})),
  })});
  assert.equal(data.state,"PASS");
  assert.equal(data.radar.sources_fresh,12);
});
test("degraded e no_data nunca viram PASS",async()=>{
  const t=new Date(now-1000).toISOString();
  const fetcher=sample({edge_function_health:[{checked_at:t,total_functions:1,online_count:1,offline_count:0,error_count:0,all_healthy:true}],
    module_health_status:[{health_label:"degraded",last_check_at:t}],
    radar_pulses:[]});
  const data=await getOneHeartSupabaseSignals({env,now,fetcher});
  assert.equal(data.state,"FAIL");
});