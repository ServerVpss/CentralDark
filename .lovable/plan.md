
# Open WebUI Turbo — Plano de Execução (7 passos, ~2h20)

Plano aprovado pelo Council 10/10. Tudo em cima da VPS (`/root/CentralDark/`), sem tocar em áreas travadas.

## Arquitetura final

```text
api.centralldark.com (1 domínio, 4 rotas novas)
├── /v1/*                → Elite Proxy   (já existe, não toca)
├── /mcp/*               → MCPO          (NOVO — Bearer)
├── /memoria/*           → Micro-API     (NOVO — whitelist)
├── /lovable/v1/*        → Proxy Lovable (NOVO — rate limit)
└── /v1/audio/speech     → TTS Lovable   (NOVO — mata o 404)
```

3 processos novos no PM2: `CentralDark-MCPO`, `CentralDark-Memoria`, `CentralDark-LovableProxy`.

---

## Passo 0 — Mapeamento (15 min)
Enxame paralelo antes de escrever qualquer linha:
- Versão do Open WebUI (`curl -s https://ui.centralldark.com/api/version`) pra decidir se precisa MCPO ou se dá pra usar MCP nativo (WebUI ≥ 0.3.30)
- Entrypoint do MCP em `apps/modulos/mcp/`
- `infra/caddy/Caddyfile` pra confirmar bloco do `api.centralldark.com`
- Confirmar `LOVABLE_API_KEY` já disponível nos secrets da VPS

## Passo 1 — MCPO (30 min)
- Se WebUI **≥ 0.3.30** → configuro MCP nativo (dispensa MCPO)
- Se WebUI **< 0.3.30** → instalo `open-webui/mcpo` em `apps/modulos/mcpo/`
- PM2: `CentralDark-MCPO` + `pm2 save`
- Caddy: rota `/mcp/*` com Bearer token protegendo tudo

## Passo 2 — Micro-API Memória (30 min)
- Cria `apps/modulos/memoria-api/index.mjs`
- 3 rotas: `GET /listar`, `GET /ler?path=…`, `POST /buscar`
- Whitelist absoluta com `path.resolve() + startsWith('/root/CentralDark/docs/CONSCIENCIA/')` — bloqueia path traversal
- Só leitura por enquanto (escrita fica pra semana que vem)
- PM2: `CentralDark-Memoria` + Caddy `/memoria/*`

## Passo 3 — Proxy Lovable + TTS (20 min)
- Cria `apps/modulos/lovable-proxy/index.mjs`
- Converte `Authorization: Bearer` → `Lovable-API-Key` (WebUI só sabe Bearer)
- Encaminha `/lovable/v1/*` → `https://ai.gateway.lovable.dev/v1/*`
- Roteia `/v1/audio/speech` pro TTS Lovable (`openai/gpt-4o-mini-tts`) — mata o 404
- Rate limit **100 req/min** por IP (proteção de crédito)
- Reaproveita `LOVABLE_API_KEY` da VPS
- PM2: `CentralDark-LovableProxy` + Caddy `/lovable/v1/*` e `/v1/audio/speech`

## Passo 4 — Configurar Open WebUI (10 min)
Na tela Configurações do WebUI:
- **Conexões** → adicionar `https://api.centralldark.com/lovable/v1` (Bearer com chave interna)
- **Ferramentas** → adicionar `https://api.centralldark.com/mcp/openapi.json`
- **Ferramentas** → adicionar `https://api.centralldark.com/memoria/openapi.json`

## Passo 5 — Teste integrado (20 min)
Testes reais no chat pra validar cada peça:
- "quais as regras na consciência?" → puxa via Memória
- "roda `pm2 status`" → executa via MCP
- Troca modelo pro "Lovable Gemini" → responde via proxy
- Botão de áudio → TTS sem 404
- Disparar 101 requisições → confirma bloqueio do rate limit

## Passo 6 — Segurança + Log (15 min)
- Tentar path traversal na memória (`../../etc/passwd`) — deve bloquear
- Confirmar Bearer obrigatório no MCPO
- Confirmar rate limit ativo
- Git commit + push (fonte da verdade)
- Notifica Telegram admin: "Open WebUI turbinado ✅"
- Atualiza painel status.centralldark.com

---

## O que NÃO vou tocar
- `apps/bot-telegram/`, `apps/modulos/status/`, `apps/modulos/Bolt/`, `apps/modulos/WebUI/`, `apps/modulos/elite-anthropic-proxy/` (áreas travadas)
- `whatsapp-server` (PM2 id 1 fica parado por design)
- Chaves existentes do Elite Proxy

## Fallback
Se WebUI for versão nova com MCP nativo → pula MCPO, sobra 30 min. Se algum passo falhar 3x → salva em `APRENDIZADOS.md`, notifica no Telegram e para pra tu decidir.

## Entregável final
Tu abre `ui.centralldark.com` e:
- Escolhe "Lovable Gemini 3 Flash" no seletor de modelo
- Pede "leia CONSCIENCIA.md" e ele lê do disco da VPS
- Pede "roda `pm2 status`" e ele executa via MCP
- Usa áudio sem 404
- Tudo com Bearer, rate limit e whitelist ativos

Confirma que pode partir pra execução?
