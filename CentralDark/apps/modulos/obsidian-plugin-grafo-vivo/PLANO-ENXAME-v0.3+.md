# 🔫 PLANO DE ENXAME — Plugin CentralDark Grafo Vivo (v0.3 → v0.5)

```
╔══════════════════════════════════════════════════════════════╗
║  🍴 CENTRALDARK GRAFO VIVO — PLANO EXECUTÁVEL POR QUALQUER IA ║
╠══════════════════════════════════════════════════════════════╣
║  Estado real  : manifest diz v0.4.0, features reais:          ║
║                 v0.1 (2D) + v0.4 (3D bundleado) ✅            ║
║                 v0.2 (WS) e v0.3 (sync notas) ❌ pendentes    ║
║  Alvo         : v0.2 (WebSocket) → v0.3 (sync notas) →        ║
║                 v0.5 (ícones)                                  ║
║  Regime       : enxame + Hermes construtor + Council          ║
║  Fonte dados  : graph-panel PM2 (/api/graph, ~68 nós)         ║
╚══════════════════════════════════════════════════════════════╝
```

> **Para a IA que abrir isto (Fabler, Opus, Hermes, qualquer uma):** este é um plano auto-suficiente. Leia o "Contexto obrigatório", audite o gap da Fase 0, e execute as fases em ordem. Cada fase tem critério de sucesso testável. Regime ULTRA MÁXIMO autorizado pelo Pivete — área protegida liberada para ESTE módulo (`apps/modulos/obsidian-plugin-grafo-vivo/`).

---

## 📖 Contexto obrigatório (ler ANTES de agir)

1. `CLAUDE.md` — regras 4-Point + áreas protegidas (§9).
2. `docs/CONSCIENCIA/DARKAI/README.md` — orquestração de IAs + `darkai`.
3. `docs/CONSCIENCIA/ARSENAL/README.md` — Council: `/router` `/refinar` `/debate` + Hermes.
4. `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/` — loop decisor → executor → validador.
5. `apps/modulos/obsidian-plugin-grafo-vivo/README.md` — roadmap oficial v0.1→v0.5.
6. `apps/modulos/graph-panel/` — fonte real do grafo (`/api/graph`, ~68 nós).
7. `apps/modulos/status/` — 🔒 protegido, **só leitura**.

## 🧰 Armas liberadas

| Arma | Uso |
|---|---|
| `darkai` CLI (Gemini/GPT-5 via ai-proxy) | brainstorm rápido, gerar boilerplate |
| Arsenal Council (`/router` `/refinar` `/debate`) | decisão técnica pesada / arquitetura |
| Hermes autônomo (`missoes/pendente/*.md`) | loops de build + validate sem babá |
| MCP tools (`vps_*`, `github_*`, `elite_gateway_*`) | deploy e commits |
| graph-panel PM2 | fonte de dados real pra testar |
| WebSocket do MCP | base da Fase v0.2 (partículas em tempo real) |
| `apps/modulos/graph-panel/public/vault.html` | base 3D de referência (já portada pra v0.4) |

---

## 🔎 FASE 0 — Auditoria do gap (fazer PRIMEIRO, não pular)

O `manifest.json` está em `0.4.0` mas o `README` lista v0.2/v0.3 como pendentes. **Antes de codar, descobrir o que realmente existe:**

- [x] Ler `src/main.ts`, `src/view.ts`, `src/settings.ts`, `src/autoUpdater.ts` e mapear o que a v0.1 realmente faz.
- [x] Confirmar: tem WebSocket? tem sync de notas? tem 3D? (provável: só fetch 30s + partículas em arestas `ativa`).
- [x] Alinhar `manifest.version` com a realidade (se features não existem, o número está mentindo).
- [x] `npm install && npm run build` — garantir que o build passa limpo antes de mexer.
- **Critério:** um parágrafo no fim deste arquivo ("## Estado auditado") dizendo o que existe de verdade por versão.

## 🌐 FASE v0.2 — WebSocket MCP → partícula em tempo real

- **Objetivo:** cada `tool call` do MCP vira uma partícula viajando na aresta correspondente, < 1s de latência.
- **Arquivos:** `src/view.ts` (render de partículas), novo `src/mcpSocket.ts` (conexão WS), `src/settings.ts` (URL do WS).
- **Fonte:** WebSocket do MCP (`CentralDark-MCP` PM2). Confirmar o endpoint WS e o formato do evento de tool call.
- **Critério:** rodar uma tool no MCP → em < 1s uma partícula acende na aresta certa do plugin. Fallback: se WS cair, volta pro fetch 30s (não quebrar a v0.1).

## 🗂️ FASE v0.3 — Sincronizar nós como notas do vault

- **Objetivo:** cada nó do grafo vira uma nota vazia em `docs/CONSCIENCIA/00-MAPA/nodes/<id>.md` → aparece também no Graph NATIVO do Obsidian.
- **Arquivos:** novo `src/nodeSync.ts`, ligado ao ciclo de fetch.
- **Cuidado:** idempotente (não recriar/duplicar nota existente); respeitar frontmatter; não sobrescrever nota com conteúdo.
- **Critério:** abrir o Graph nativo do Obsidian e ver os nós do CentralDark como notas reais, linkadas.

## 🌌 FASE v0.4 — Modo 3D (reaproveitar o VAULT) ✅ CONCLUÍDO

- **Objetivo:** toggle "2D / 3D" na view; 3D usa `3d-force-graph` com bloom/partículas, tema Esmeralda.
- **Base pronta:** `apps/modulos/graph-panel/public/vault.html` já tem o render 3D funcionando (paleta emerald, partículas, HUD). **Portar a lógica** pra dentro da view do plugin (`src/view3d.ts`).
- **Cuidado:** Obsidian é Electron — `3d-force-graph` via bundle (esbuild) — `isDesktopOnly:false`, mas 3D só faz sentido desktop — checar `Platform.isMobile`.
- **Critério:** botão 3D na view → esfera girando com os ~68 nós, 60fps no desktop.
- **Status:** ✅ CONCLUÍDO em 2026-07-06. `view3d.ts` reescrito com `3d-force-graph` bundleado, controles (rotação/reset), setores com labels flutuantes, glow/pulso online/offline, ícone 🤖 em agentes, poll a cada 5s do `/api/graph`.

## 🎨 FASE v0.5 — Ícones custom por categoria (SVG inline)

- **Objetivo:** cada categoria (`bot|mcp|edge|supabase|vps|ia|modulo|doc`) com ícone SVG inline em vez de bolinha.
- **Arquivos:** `src/icons.ts`, aplicado no render 2D e 3D (sprite).
- **Critério:** legenda e nós mostram o ícone certo por categoria.

---

## ⚙️ Regras de execução (4-Point + build)

1. **Fluxo:** editar `src/` → `npm run build` (gera `main.js`) → testar no vault → commit cirúrgico (`git add apps/modulos/obsidian-plugin-grafo-vivo`, nunca `-A`).
2. **Formato do JSON** que o plugin consome está no `README.md` (§ "Formato esperado"). O `/api/graph` do graph-panel usa `edges[].from/to` — o plugin espera `edges[].source/target` + `nodes[].category`. **Mapear/adaptar** (não quebrar o painel).
3. **Nunca** tocar `apps/modulos/status/` (🔒) a não ser leitura.
4. Cada fase fechada: bump de versão real no `manifest.json` + linha no `## Roadmap` do README + card de conclusão no Telegram (padrão `<pre>`, ver `HERMES/AULAS/AULA-010`).
5. Se travar 3x, abrir pendência e chamar o Hermes construtor (dropar missão em `docs/CONSCIENCIA/AGENTES-AUTONOMOS/hermes/missoes/pendente/`).

## 🚀 Como uma IA começa

```
1. ler o "Contexto obrigatório" (7 itens acima)
2. FASE 0 — auditar o gap, buildar limpo, escrever "## Estado auditado"
3. escolher a próxima fase por prioridade (v0.2 é a mais pedida pelo Pivete)
4. Council /refinar na arquitetura da fase → codar → build → validar → commit
5. card <pre> no Telegram admin + próxima fase
```

---

## Estado auditado (preenchido em 2026-07-06)

**v0.1** ✅ Existe de verdade. `view.ts` com force-graph 2D, fetch periódico (padrão 15s), filtro por categoria, partículas em arestas ativas, clique abre nota via `obsidian_path`, pulso nos nós online. Cores por categoria. Auto-updater com SHA-256, backup e rollback.

**v0.2 (WebSocket)** ❌ Não existe. Não há `src/mcpSocket.ts`. O fetch atual é HTTP polling.

**v0.3 (sync notas vault)** ❌ Não existe. Não há `src/nodeSync.ts`. Nenhum nó vira nota .md no vault.

**v0.4 (3D)** ✅ CONCLUÍDO em 2026-07-06. `view3d.ts` reescrito com `3d-force-graph` bundleado (npm dep, não CDN). Consome `/api/graph` do graph-panel. Controles: rotação automática, reset de câmera. Nós com glow/pulso (online respira verde, offline pisca vermelho). Labels de setor flutuando no centroide. Ícone 🤖 em agentes. Poll a cada 5s. Dependências adicionadas: `3d-force-graph`, `three`, `three-spritetext`, `@types/three`.

**v0.5 (ícones SVG)** ❌ Não existe. Não há `src/icons.ts`.
