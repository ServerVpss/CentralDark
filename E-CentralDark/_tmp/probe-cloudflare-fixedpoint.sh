set -e
cd /root/CentralDark
echo "HEAD=$(git rev-parse HEAD 2>/dev/null || echo UNKNOWN)"
echo "BRANCH=$(git branch --show-current 2>/dev/null || echo UNKNOWN)"
echo "=== PUBLIC_EDGE ==="
python3 - <<'PY'
import json, urllib.request
u='https://mcp.centralldark.com/health'
try:
    with urllib.request.urlopen(u, timeout=10) as r:
        raw=r.read().decode('utf-8','replace')
        try:
            j=json.loads(raw)
        except Exception:
            j={}
        print(json.dumps({
            "http": r.status,
            "service": j.get("service"),
            "version": j.get("version"),
            "toolCount": j.get("toolCount"),
        }, ensure_ascii=False))
except Exception as e:
    print(json.dumps({"http":"FAIL","error":type(e).__name__}))
PY
echo "=== CLOUDFLARE_CONTROL_PLANE ==="
node <<'NODE'
const {execSync}=require('child_process');
(async()=>{
  let list=[];
  try { list=JSON.parse(execSync('pm2 jlist',{encoding:'utf8'})); } catch {}
  const candidates=list.filter(p=>/mcp|centraldark|hub|oauth/i.test(String(p.name||'')));
  let holder=null, token='';
  for(const p of candidates){
    const env=p.pm2_env||{};
    const t=env.CLOUDFLARE_API_TOKEN||env.CF_API_TOKEN||'';
    if(t){ holder=p.name; token=t; break; }
  }
  if(!token){
    console.log(JSON.stringify({token_present:false,token_holder:null,verify:"NOT_RUN",zones_list:"NOT_RUN"}));
    return;
  }
  const headers={Authorization:'Bearer '+token,Accept:'application/json'};
  const out={token_present:true,token_holder:holder,verify:null,zones_list:null};
  try{
    const r=await fetch('https://api.cloudflare.com/client/v4/user/tokens/verify',{headers,signal:AbortSignal.timeout(10000)});
    const j=await r.json().catch(()=>({}));
    out.verify={http:r.status,success:!!j.success,status:j?.result?.status||null,error_codes:Array.isArray(j.errors)?j.errors.map(x=>x.code):[]};
  }catch(e){out.verify={http:"FAIL",error:e.name};}
  try{
    const r=await fetch('https://api.cloudflare.com/client/v4/zones?per_page=1',{headers,signal:AbortSignal.timeout(10000)});
    const j=await r.json().catch(()=>({}));
    out.zones_list={http:r.status,success:!!j.success,count:Array.isArray(j.result)?j.result.length:null,error_codes:Array.isArray(j.errors)?j.errors.map(x=>x.code):[]};
  }catch(e){out.zones_list={http:"FAIL",error:e.name};}
  console.log(JSON.stringify(out));
})();
NODE
