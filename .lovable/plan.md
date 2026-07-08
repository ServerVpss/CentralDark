## Plano — Fechar segurança + entregar v2 (WebGPU) e v3 (Babylon) lado a lado

### 1. Segurança 🔒 (migration no HUB via ferramenta oficial)
Fechar RLS das 2 tabelas que estão abertas:
- `bot_query_rate_tracking` → só `service_role` lê/escreve
- `webapp_results` → só `service_role` lê/escreve (limpeza continua via trigger `SECURITY DEFINER`)

Bots continuam funcionando normal porque rodam com `service_role` no backend. Nenhum usuário final perde nada.

### 2. Laboratório v2 — Three.js + WebGPU (`public/jarvis-lab-v2/index.html`)
- Mesmo grafo, backend WebGPU do Three.js (`WebGPURenderer`)
- Fallback automático pra WebGL se o navegador não suportar
- GPU instancing nas esferas (10 mil nós = 1 draw call)
- Layout de força movido pra Web Worker (`d3-force-3d`) — tela não trava
- Bloom via `postprocessing` da pmndrs (mais leve que o `UnrealBloomPass` clássico)
- Paleta esmeralda mantida

### 3. Laboratório v3 — Babylon.js (`public/jarvis-lab-v3/index.html`)
- Reescrita em Babylon.js 7 (WebGPU nativo)
- PBR real nos nós (metalness + roughness → visual "cromado esmeralda")
- Glow layer nativo (efeito Jarvis sem custo de postprocessing manual)
- Thin instances pra escalar 10 mil+ nós
- HUD overlay em HTML/CSS por cima do canvas

### 4. Comparador atualizado (`public/jarvis-lab/comparador.html`)
Passa a mostrar **4 cards lado a lado**:
1. Original (VPS)
2. v1 Turbo (Three.js + bloom clássico) ← o que já tá pronto
3. v2 WebGPU (Three.js WebGPU + worker)
4. v3 Babylon (WebGPU nativo + PBR)

Cada card com FPS estimado, tecnologia e link direto.

### 5. Peso no repositório
Tudo em `public/` como HTML puro com CDN (esm.sh / unpkg). **Zero dependência nova no `package.json`**, zero impacto no bundle do app principal. Só arquivos estáticos servidos.

### Detalhes técnicos
- WebGPU: `if (!navigator.gpu) → fallback WebGL` (sandbox de preview não tem GPU, então o fallback é obrigatório)
- Worker: mensagem `{nodes, links}` → devolve `{positions}` a cada tick
- Babylon via CDN: `https://cdn.babylonjs.com/babylon.js` + `loaders`
- Nada disso vai pro GitHub principal (`public/jarvis-lab*/` já estão no `.gitignore` local do lab — só o v1 foi liberado temporariamente pra publicar; v2 e v3 seguem a mesma estratégia)

Depois de aprovar, você testa os 4 lado a lado e me diz qual vira o oficial pra levar pra VPS.
