## Objetivo
Redesenhar o painel `grafo.centralldark.com` (`apps/modulos/graph-panel/`) subindo pro nível 3 esmeralda, com grafo **vivo** (nós pulsando, arestas fluindo) e layout organizado estilo Linear/Vercel. Zero mudança em JS de dados/backend — só camada visual + parâmetros do force-graph.

⚠️ Pasta está travada (Seção 9 do CLAUDE.md). Preciso do **"PERMITO PIVETE"** pra tocar em `apps/modulos/graph-panel/`. Sem isso, só planejo.

## Escopo visual

### 1. Paleta Esmeralda (substitui `#000308` e verde chapado)
- Fundo: gradiente radial `#052e2b → #0a3d38` + mesh sutil emerald glow
- Superfícies: `#0f2e2a` com borda `rgba(52,211,153,.18)`
- Primário: `#10b981` / hover `#34d399`
- Destaque dourado sutil `#c9a84c` só em métricas-chave
- Texto: `#e6f5ee` / muted `#94a3a0`
- **Zero `#000` puro**

### 2. Layout reorganizado (topbar + 3 zonas)
```text
┌─────────────────────────────────────────────┐
│  TOPBAR (logo · título · ações · status)    │
├──────────────────────────┬──────────────────┤
│                          │  Resumo (stats)  │
│                          ├──────────────────┤
│   GRAFO (canvas)         │  Status VPS 🟢   │
│   fundo esmeralda        ├──────────────────┤
│   glow nos nós ativos    │  Relatório       │
│                          ├──────────────────┤
│                          │  Auditoria       │
│                          ├──────────────────┤
│                          │  Histórico       │
└──────────────────────────┴──────────────────┘
```
- Sidebar 380px, cards `rounded-xl`, sombras 3D suaves (não flat)
- Stats no topo da sidebar em grid 2x2 (Nós / Arestas / Comunidades / Última att.)
- Cada card tem cabeçalho com ícone + título + timestamp

### 3. Grafo VIVO (a alma do pedido)
Ajustes no `graph.js` **apenas nos parâmetros visuais do force-graph** (sem tocar em fetch/dados):
- **Nós pulsam** conforme atividade — `nodeCanvasObject` custom que desenha halo com `sin(Date.now())` proporcional ao "heat" do nó (última atualização recente = pulsa forte)
- **Setores em ação piscam** — nós com status `running`/`updated` nos últimos 60s ganham glow emerald animado; `idle` fica opaco
- **Arestas fluindo** — `linkDirectionalParticles` ativo, partículas emerald correndo no sentido do fluxo (já é feature nativa da lib, só ligar)
- **Mole-like / gelatinoso** — reduzir `d3AlphaDecay` pra `0.008` e `d3VelocityDecay` pra `0.25` → grafo balança suave quando arrasta, volta com inércia
- **Hover** — nó cresce 1.3x com transição suave, mostra tooltip esmeralda flutuante
- **Cores dos nós por tipo/status** — verde vivo = ativo, dourado = crítico, cinza-esverdeado = idle
- Fundo do canvas: transparente (deixa o gradiente da página aparecer)

### 4. Micro-interações
- Botões com `active:translate-y-[1px]` e shadow-3d-primary (padrão sistema)
- Cards com hover glow sutil
- Loading dos painéis: skeleton pulsante emerald (não "Carregando..." cru)
- Timestamps em tempo real "há 3s" atualizando

## Arquivos a editar (todos dentro da área travada 🔒)
1. `apps/modulos/graph-panel/public/style.css` — reescrita completa (paleta + layout + animações)
2. `apps/modulos/graph-panel/public/2d.html` — reordenar sidebar (stats no topo), adicionar ícones, ajustar wrapper do grafo (remover `background:#000308` inline)
3. `apps/modulos/graph-panel/public/graph.js` — **só** ajustar parâmetros visuais do ForceGraph (nodeCanvasObject com pulse, linkDirectionalParticles, alphaDecay). Zero mudança em fetch/URLs/dados.
4. **Backup obrigatório** antes de cada write via `vps_write_file_safe` (a tool já faz)

## Fora de escopo (não vou mexer)
- Nenhuma rota, endpoint, fetch, WebSocket
- Nenhum arquivo do 3D (`index.html`) — só o `2d.html` desta vez
- Nenhum PM2 restart necessário (arquivos estáticos servidos pelo Caddy)

## Entrega
- Deploy via `vps_write_file_safe` nos 3 arquivos
- Reload duro do `grafo.centralldark.com/2d.html` (Ctrl+Shift+R)
- Card Hermes v1.3 no admin notificando "🎨 Grafo 2D redesenhado — nível 3 esmeralda vivo"

## Autorizações necessárias
Preciso que você responda **"PERMITO PIVETE grafo-panel visual"** pra eu poder tocar na pasta travada. Sem isso não escrevo nada na VPS.
