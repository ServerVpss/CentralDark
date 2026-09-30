
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(here,"patch-candidate","public");
const types={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json"};
http.createServer((req,res)=>{
  let u=new URL(req.url,"http://localhost");
  let p=u.pathname==="/"?"/index.html":u.pathname;
  // local demo intentionally falls back to sample for /api/graph
  if(u.pathname==="/api/graph"){
    const b=fs.readFileSync(path.join(root,"sample-graph.json"));res.writeHead(200,{"content-type":"application/json"});return res.end(b);
  }
  const fp=path.normalize(path.join(root,p));
  if(!fp.startsWith(root)){res.writeHead(403);return res.end("forbidden")}
  fs.readFile(fp,(e,b)=>{if(e){res.writeHead(404);res.end("not found");return}
    res.writeHead(200,{"content-type":types[path.extname(fp)]||"application/octet-stream"});res.end(b);
  })
}).listen(4177,"127.0.0.1",()=>console.log("Graph Lens local: http://127.0.0.1:4177"));
