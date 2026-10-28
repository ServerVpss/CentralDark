const fs=require('fs');
(async()=>{
  try{
    const c=JSON.parse(fs.readFileSync('C:/Users/Administrador/.codeagentswarm/centraldark-mcp-remote.json','utf8'));
    const x=c['CentralDark-VPS-Native'];
    const body={jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'CodeAgentSwarm-Probe',version:'1'}}};
    const r=await fetch(x.url,{method:'POST',headers:{...x.headers,'content-type':'application/json','accept':'application/json, text/event-stream'},body:JSON.stringify(body)});
    const txt=await r.text();
    const line=txt.split(/\r?\n/).find(s=>s.startsWith('data: '));
    const j=line?JSON.parse(line.slice(6)):null;
    console.log(JSON.stringify({http:r.status,server:j?.result?.serverInfo?.name||null,version:j?.result?.serverInfo?.version||null,protocol:j?.result?.protocolVersion||null}));
  }catch(e){console.log(JSON.stringify({error:String(e&&e.message||e)}));process.exitCode=1;}
})();
