# 🔴 Proxy-Unlimi com WebSocket upstream caído

**Data:** 2026-07-08
**Módulo:** `apps/modulos/proxy-unlimi/` (🔒 protegido)
**PM2:** `CentralDark-ProxyUnlimi` (porta 8787) — online

## Sintoma
Todo `POST /v1/chat/completions` retorna **HTTP 502** com:
```json
{"error":{"message":"WebSocket error","type":"upstream_error","code":"upstream_error"}}
```

## Escopo do problema
Não é o Grok, é o proxy inteiro. Testados **9 chamados** em 5 providers diferentes — todos falham igual:
- xAI: `gateway-grok-4`, `gateway-grok-3`
- OpenAI: `gateway-gpt-4o-mini`
- Anthropic: `gateway-claude-3-5-haiku`
- Google: `gateway-gemini-2-0-flash`
- DeepSeek: `gateway-deepseek-v3`, `gateway-deepseek-r1`

Restart do PM2 (`pm2 restart CentralDark-ProxyUnlimi`) **não resolve**.

## Diagnóstico
- `curl http://localhost:8787/health` → `{"status":"ok","models":11}` ✅ (proxy vivo)
- `curl https://unlimited-ai-2jw.pages.dev/` → HTTP 200 ✅ (upstream HTTP vivo)
- Falha específica no canal **WebSocket** que o proxy usa por baixo para falar com o gateway Unlimited AI — provavelmente handshake/token expirado ou endpoint interno mudou do lado do provedor.

## Modelos disponíveis quando o proxy voltar (só 11, não 34 como o README promete)
| Provider | IDs |
|---|---|
| openai | gateway-gpt-4-1-mini, gateway-gpt-4-1-nano |
| deepseek | gateway-deepseek-v4-pro, -v4-flash, -r1, -v3 |
| xai | gateway-grok-4, gateway-grok-3 |
| alibaba | gateway-qwen-3-max, gateway-qwen-qwq-32b |
| meta | gateway-llama-3-3-70b-versatile |

## Próximo passo (aguarda "PERMITO PIVETE" — módulo protegido)
1. Ler `apps/modulos/proxy-unlimi/proxy-unlimi/src/routes.ts` (linhas ~184 e ~216) e o cliente WebSocket que conecta no Unlimited AI.
2. Renovar handshake/token ou trocar endpoint do upstream.
3. Reagir a `ws.close` com reconexão automática + circuit-breaker.

## Alternativa sem tocar no módulo protegido
- Rota direta pela API oficial xAI (`api.x.ai/v1`) usando chave própria — bypass do proxy pro Grok.
