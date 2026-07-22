
# Fase 2 P0 — Deixar o Cockpit Pronto (parte visual/estrutural)

Você tá certo: o P0 é montar a **carcaça visual e estrutural** do cockpit no jeito Overclock 1.1.0, mantendo o que já funciona da SalaControle. Depois disso sobra só **plugar dados reais** (Hermes-Core, Gateway, missões, providers) — que é a Fase 3.

## Escopo desta entrega (só frontend, rota `/admin/cockpit`)

Trabalho em `pivete/dev`, sem tocar VPS, sem tocar backend, sem mexer em área 🔒.

### 1. Sidebar fixa de Missões (esquerda)
- Coluna fixa ~260px, fundo obsidiana com borda esmeralda.
- Lista de missões com status (🟢 ativa / 🟡 pendente / 🔴 travada) e badge de agente responsável.
- Ainda com dados mock — o plug real do Hermes-Core entra na Fase 3.

### 2. Header operacional (topo)
- Barra fina no topo com blocos `VOL`, `PPM`, `CODE`, `UPTIME`, `HEAD SHA`.
- Tipografia mono, headers coloridos por bloco (verde/âmbar/roxo/ciano) como na foto de referência.
- HEAD SHA já pode vir real do build; o resto fica mock até plugar.

### 3. Grid Multi-Pane 2×2 (centro)
- 4 painéis densos com header colorido cada:
  - **Missões ativas** (esmeralda)
  - **Logs Hermes** (âmbar)
  - **Providers/Gateway** (roxo)
  - **Custos $ / PPM** (ciano)
- Cada painel com badge de custo `$` no canto e scroll interno.
- Preserva MatrixRain de fundo e HermesMascote reativo (que já tá lá).

### 4. Jarvis flutuante (canto inferior direito)
- Botão orbe pulsante esmeralda, abre painel lateral de comando rápido.
- Só a casca visual + input; sem executar nada ainda.

### 5. Aba de Providers (dentro do pane roxo)
- Tabs: `Lovable AI` · `Gateway` · `HUB` · `Local`.
- Cards com status mock (🟢/🟡/🔴) e latência fake.

### 6. Ajustes de brilho/cor
- Restaurar os headers coloridos por painel (o verde monocromático que ficou ontem some).
- Manter paleta oficial: esmeralda dominante, obsidiana de fundo, off-white no texto. Nada de preto puro nem branco puro.

## O que NÃO entra agora (fica pra Fase 3 — "plugar")

Essas são as pendências que sobram depois do P0, e são exatamente o que você falou — "plugar o resto":

- Plugar **missões reais** vindas do `HERMES-CORE/missions/` (barramento hoje vazio).
- Plugar **logs Hermes** reais via edge/HUB.
- Plugar **Providers** com status real do Gateway `api.centralldark.com`.
- Plugar **custos/PPM** reais do `ai_requests` no HUB.
- Plugar **Jarvis** no dispatcher MCP interno.
- Alinhar VPS `chore/gateway-providers-routes` (27 arquivos divergentes) com `pivete/dev`.

## Como vou entregar
- Branch: `pivete/dev` (sub-branch `pivete/dev-cockpit-fusao-p0` se preferir PR limpo).
- Só mexo em `src/` do cockpit e componentes filhos.
- Screenshot antes/depois em cada passo pra você aprovar visualmente.
- Sem deploy, sem merge em `main`, sem tocar áreas 🔒.

## Ordem de execução
1. Header operacional + ajuste de cores dos headers.
2. Sidebar de missões (mock).
3. Grid 2×2 com os 4 panes coloridos.
4. Aba Providers dentro do pane roxo.
5. Jarvis flutuante (casca).
6. Screenshot final lado-a-lado com a foto de referência que você mandou.

## Confirmação que preciso de você
- Aprova o P0 desse jeito?
- Faço direto em `pivete/dev` ou abro sub-branch com PR pra você revisar antes?
