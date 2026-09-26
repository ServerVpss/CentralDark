# COMANDO - original.html
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\public\jarvis-lab\original.html
**SHA:** 0b8b4b6264afaac0
**Timestamp:** 2026-08-28T02:57:32.280831
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- #top{left:14px;top:12px;right:14px;display:flex;gap:14px;align-items:center;font-size:13px;letter-spacing:.08em;color:#dff9ff}
- .sector{display:grid;grid-template-columns:1fr auto;gap:4px;padding:8px 6px;margin:4px 0;border-left:2px solid var(--c);border-radius:6px;cursor:pointer;background:rgba(0,234,255,.04)}
- #details .row{display:grid;grid-template-columns:88px 1fr;gap:8px;margin:6px 0;font-size:12px}.k{opacity:.65}.v{color:#fff;word-break:break-word}
- #bottom{position:fixed;z-index:12;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;pointer-events:auto;padding:9px;border:1px solid rgba(0,234,255,.28);backgroun

### Ouro Bruto (primeiros 5000 chars)
```
<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>CentralDark · JARVIS Live Graph</title>
<style>
:root{--c:#00eaff;--g:#00ffa3;--r:#ff2244;--bg:#02070c}
*{box-sizing:border-box}html,body,#graph{margin:0;width:100%;height:100%;overflow:hidden;background:radial-gradient(circle at 50% 45%,#082033 0,#02070c 45%,#000 100%);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#bfefff}
#graph canvas{display:block}.hud{position:fixed;z-index:10;pointer-events:none;text-shadow:0 0 8px var(--c),0 0 18px rgba(0,234,255,.35)}
#top{left:14px;top:12px;right:14px;display:flex;gap:14px;align-items:center;font-size:13px;letter-spacing:.08em;color:#dff9ff}
.live{color:var(--g);animation:pulse 1s infinite}.brand{font-weight:800;color:#fff}.dim{opacity:.72}.pill{border:1px solid rgba(0,234,255,.35);background:rgba(0,20,32,.42);padding:5px 9px;border-radius:999px;box-shadow:0 0 22px rgba(0,234,255,.16) inset}
@keyframes pulse{0%,100%{opacity:.35;filter:drop-shadow(0 0 2px var(--g))}50%{opacity:1;filter:drop-shadow(0 0 10px var(--g))}}
.panel{position:fixed;z-index:11;pointer-events:auto;border:1px solid rgba(0,234,255,.28);background:linear-gradient(180deg,rgba(2,18,31,.72),rgba(0,5,10,.52));box-shadow:0 0 30px rgba(0,234,255,.12),inset 0 0 22px rgba(0,234,255,.06);backdrop-filter:blur(7px);border-radius:10px;color:#bfefff}
#left{left:14px;top:62px;width:255px;max-height:calc(100vh - 135px);overflow:auto;padding:12px}
#right{right:14px;top:62px;width:305px;min-height:230px;padding:12px}
h3{margin:0 0 10px;font-size:12px;letter-spacing:.18em;color:#fff;text-shadow:0 0 10px var(--c)}
.sector{display:grid;grid-template-columns:1fr auto;gap:4px;padding:8px 6px;margin:4px 0;border-left:2px solid var(--c);border-radius:6px;cursor:pointer;background:rgba(0,234,255,.04)}
.sector:hover{background:rgba(0,234,255,.13)}.sector b{font-size:12px}.sector small{opacity:.76}.dots{font-size:12px;white-space:nowrap}.ok{color:var(--g)}.bad{color:var(--r)}
#details .row{display:grid;grid-template-columns:88px 1fr;gap:8px;margin:6px 0;font-size:12px}.k{opacity:.65}.v{color:#fff;word-break:break-word}
button,a{font-family:inherit;color:#dff9ff;background:rgba(0,234,255,.08);border:1px solid rgba(0,234,255,.32);border-radius:7px;padding:7px 9px;text-decoration:none;cursor:pointer;box-shadow:0 0 12px rgba(0,234,255,.08)}
button:hover,a:hover{background:rgba(0,234,255,.18)}#copy{width:100%;margin-top:10px}
#bottom{position:fixed;z-index:12;left:50%;bottom:14px;transform:translateX(-50%);display:flex;gap:8px;align-items:center;pointer-events:auto;padding:9px;border:1px solid rgba(0,234,255,.28);background:rgba(0,8,14,.68);border-radius:12px;box-shadow:0 0 28px rgba(0,234,255,.15);backdrop-filter:blur(7px)}
#search{width:260px;color:#dff9ff;background:rgba(0,0,0,.35);border:1px solid rgba(0,234,255,.4);border-radius:8px;padding:8px 10px;outline:none;font-family:inherit}
#search:focus{box-shadow:0 0 14px rgba(0,234,255,.35)}
#error{display:none;position:fixed;z-index:20;left:0;right:0;top:0;padding:8px 16px;background:rgba(255,34,68,.85);color:#fff;font:12px ui-monospace,monospace;text-align:center;pointer-events:none}
::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:rgba(0,234,255,.32);border-radius:99px}
@media(max-width:900px){#right{display:none}#left{width:220px}#bottom{left:10px;right:10px;transform:none;flex-wrap:wrap}#search{width:100%}}
</style>
</head>
<body><a href="https://grafo.centralldark.com/cdn-cgi/content?id=3Lk7Cz5auIgXB4OGiqi2f5nH0E0ZE9JcIXgUiJGSoQs-1783504642.985038-1.2.1.1-wUPEmGZX2F9jFshww7ekVj2e1JhCdgfP5B3lykWUq5k" aria-hidden="true" rel="nofollow noopener" style="display: none !important; visibility: hidden !important"></a>
<div id="graph"></div>
<div id="error"></div>
<div id="top" class="hud">
  <span class="pill"><span class="live">● LIVE</span></span>
  <span class="brand">GRAFO CENTRALDARK · JARVIS</span>
  <span id="clock" class="pill">--:--:--</span>
  <span id="stats" class="pill dim">nós 0 · online 0 · links 0 · últ.att --</span>
</div>
<aside id="left" class="panel"><h3>SETORES</h3><div id="sectors"></div></aside>
<aside id="right" class="panel"><h3>DETALHES</h3><div id="details" class="dim">Clique em um nó para inspecionar.</div></aside>
<footer id="bottom">
  <input id="search" placeholder="buscar nó por label/id ↵">
  <button id="rot">🌀 rotação</button>
  <button id="reset">⛶ reset câmera</button>
  <a href="/2d.html">[2D]</a>
</footer>
<script src="https://unpkg.com/three@0.160.0/build/three.min.js"></script>
<script src="https://unpkg.com/3d-force-graph@1.73.4/dist/3d-force-graph.min.js"></script>
<script src="https://unpkg.com/three-spritetext@1.8.2/dist/three-spritetext.min.js"></script>
<script>
(function(){
'use strict';
var gd={nodes:[],links:[]}, graph=null, rotating=false, selected=null, lastServed=null, pollTimer=null;
var groupColors={core:'#00eaff',bots:'#ffb020',edge:'#c084fc',inf
```