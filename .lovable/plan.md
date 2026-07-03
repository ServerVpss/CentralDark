# 🎨 Open WebUI Turbo — Visual "Esmeralda 3D" + Function Calling

## Objetivo
Transformar o Open WebUI num chat estilo Claude Code, com tema Esmeralda 3D e MCP funcional (bate-papo que executa ações reais via arsenal).

## Passos (4)

### 1. CSS Esmeralda 3D
Criar `apps/modulos/WebUI/custom-css/emerald.css` na VPS:
- Bolhas de usuário verdes 3D (shadow-3d-primary, gradient emerald)
- Mensagens do assistente sem bolha (texto limpo, estilo Claude)
- Separadores sutis emerald entre turnos (border-b + glow)
- Blocos de código monospace com fundo escuro + borda emerald
- Sidebar com highlight emerald na thread ativa
- Botões arredondados (rounded-xl) + active:translate-y-[1px]

### 2. Injeção via Caddy
Editar `infra/caddy/Caddyfile` no bloco do WebUI:
- Adicionar `header_up` + `replace_response` pra injetar `<link rel="stylesheet" href="/custom-css/emerald.css">` no `</head>`
- Servir `/custom-css/*` como arquivo estático apontando pra pasta nova
- `caddy reload` (sem downtime)

### 3. Registrar MCPO no WebUI (Function Calling nativo)
Via API Admin do WebUI (`/api/v1/tools/`):
- POST do tool server MCPO (URL interna + Bearer token já existente)
- Vincular ao modelo `arsenal-parallel` (ou modelo default do Pivete)
- Ativar `function_calling: native` no config do modelo

### 4. Validação visual
- Screenshot antes/depois (Playwright headless na URL do WebUI)
- Enviar mensagem teste no chat pedindo pra usar MCP (ex: "lista pendências")
- Confirmar: tool call aparece, resultado renderiza limpo, tema aplicado

## Detalhes técnicos
- **VPS paths:** `/root/CentralDark/apps/modulos/WebUI/custom-css/` e `/root/CentralDark/infra/caddy/`
- **Reload:** `systemctl reload caddy` (zero downtime)
- **API WebUI:** usa token admin já salvo em `secrets/`
- **Zero rebuild:** nada de derrubar container, tudo hot-reload

## Tempo estimado
~40min (CSS 15min + Caddy 10min + MCPO register 10min + validação 5min)

## Enxame
Disparo 3 sub-agentes em paralelo:
- **Agente CSS:** escreve `emerald.css` completo
- **Agente Caddy:** ajusta Caddyfile + testa reload
- **Agente MCP:** registra tool server + valida function calling

Depois consolido, aplico, valido visual, notifico Telegram (admin + status).
