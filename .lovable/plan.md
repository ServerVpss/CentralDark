# Plano: Grafo Vivo no Obsidian + Padronização VPS

Três frentes, executadas em paralelo por sub-agentes.

## 🧠 Frente 1 — Plugin Obsidian "CentralDark Live Graph"

Criar plugin próprio (não mexer no Juggl/Graph nativo, eles quebram a cada update do Obsidian). O plugin abre uma view lateral e renderiza o mesmo grafo que roda em `status.centralldark.com`, mas **dentro do Obsidian**, consumindo o mesmo `graph-data.json` da VPS.

**Local no repo:** `apps/modulos/obsidian-plugin-grafo-vivo/`

Arquivos:
- `manifest.json` — id `centraldark-grafo-vivo`, versão 0.1.0
- `main.ts` — registra comando "Abrir Grafo Vivo", cria `ItemView` custom
- `view.ts` — canvas com `force-graph` (mesma lib do site), fetch em `https://status.centralldark.com/graph-data.json` a cada 30s, WebSocket futuro
- `styles.css` — segue tema do Obsidian (usa vars `--background-primary`, `--text-normal`)
- `esbuild.config.mjs` + `package.json` — build padrão de plugin Obsidian
- `README.md` — instalação manual: copiar pasta pra `.obsidian/plugins/centraldark-grafo-vivo/`

**Funcionalidades v1:**
- Nós clicáveis abrem a nota correspondente no Obsidian (se o node tiver `obsidian_path`)
- Cores por categoria (bots verde, MCP azul, edge functions roxo, etc)
- Partículas animadas nas arestas ativas (chamadas em tempo real)
- Filtro por módulo no topo da view
- Botão "Sincronizar com Graph nativo" — exporta os nodes como notas vazias em `docs/CONSCIENCIA/00-MAPA/nodes/` pra aparecer no graph global do Obsidian também

**v2 (depois):** WebSocket direto no MCP pra ver as IAs se movimentando em tempo real (cada tool call vira uma partícula viajando pela aresta).

## 🛠️ Frente 2 — Auditoria PM2 + Padronização

Sub-agente audita `pm2 status` da VPS e produz relatório:

**Padrão de nome obrigatório:** `CentralDark-<Modulo>` (PascalCase, sem hífens dentro do módulo).

Renomeações prováveis (aplicar via `pm2 delete <id> && pm2 start ... --name`):
- `elite-http-gateway` → `CentralDark-EliteHttpGateway`
- `elite-ws-gateway` → `CentralDark-EliteWsGateway`
- `elite-anthropic-proxy` → `CentralDark-EliteAnthropicProxy`
- `graph-panel` → `CentralDark-GraphPanel`
- `zentinel-health` → `CentralDark-Zentinel`
- `MultiZap-Gateway` → `CentralDark-MultiZap`
- `CloneDeck-CRM` → `CentralDark-CloneDeck`

**Regra do WhatsApp/MultiZap:** Se CPU < 5% e restarts < 10 nas últimas 24h → deixa online (usuário confirmou). Se estiver flappando → `pm2 stop` + registrar em `docs/PENDENCIAS.md` pra consolidar depois.

**IDs PM2:** Não dá pra fixar ID (PM2 atribui sequencial), mas dá pra garantir ordem consistente via `ecosystem.config.js` único. Criar `/root/CentralDark/ecosystem.config.js` que declara todos os processos na ordem canônica → `pm2 delete all && pm2 start ecosystem.config.js && pm2 save`.

## 🗺️ Frente 3 — Graph-Panel como indexador global (as "ruas")

Analogia certeira: o `graph-panel` é o mapa de ruas. Toda IA (MCP tools, bots, edge functions) deve consultar ele antes de "sair pra rua" — economiza tokens porque não precisa varrer o repo inteiro.

Executar:
1. Auditar quais serviços JÁ consomem `graph-panel/output.json` (sub-agente faz `rg` no repo)
2. Adicionar hook nos que não usam: MCP tools de leitura de arquivo, bots que buscam skills, edge functions que roteiam
3. Cron na VPS: `graph-panel` reindexa a cada 10min (ou por webhook do GitHub em push)
4. "Ruas novas" = arquivos novos → indexer detecta diff e atualiza `output.json` incremental
5. Expor endpoint `https://graph.centralldark.com/query?node=xxx` pra IAs consultarem sem baixar o JSON inteiro

## 📊 Ordem de execução

1. Frente 2 (auditoria PM2) — sub-agente, roda em paralelo, output = relatório
2. Frente 3 (auditoria graph-panel) — sub-agente, roda em paralelo, output = lista de integrações faltando
3. Frente 1 (plugin Obsidian) — eu construo enquanto os sub-agentes rodam
4. Consolidação: aplicar renomeações PM2 via `vps_run_once_script`, commitar plugin, atualizar `painel-data.json` e `CLAUDE.md` §9

## ⚠️ Riscos

- Renomear processos PM2 quebra qualquer script hardcoded com nome antigo → sub-agente faz `rg` antes pra listar refs
- Plugin Obsidian precisa de CORS liberado em `status.centralldark.com/graph-data.json` — verificar Caddy
- `graph-panel` reindex pesado pode travar VPS → rodar com `nice -n 19`

Aprova executar as 3 frentes?
