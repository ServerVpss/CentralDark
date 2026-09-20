---
name: Elite Gateway tem endpoint público elite.centralldark.com
description: Proxy OpenAI-compatível exposto publicamente via Caddy com Bearer auth, usa contas-admin (ChatGPT Plus logado via noVNC) no lugar de API key paga. Documentação no repo ServerVpss/CentralDark em docs/GATEWAY/ELITE_ENDPOINT_PUBLICO.md.
type: architecture
---

# Elite Gateway — endpoint público

**URL:** `https://elite.centralldark.com` (Base URL pra ferramentas: `/v1`)
**Porta interna:** `127.0.0.1:8080`
**Token Bearer:** `ELITE_PUBLIC_TOKEN` em `/root/CentralDark/config/.env` — **nunca commitar valor real**
**Caddyfile:** `/etc/caddy/centraldark-managed/root-imports/elite.centralldark.com.Caddyfile`
**Documentação oficial:** `docs/GATEWAY/ELITE_ENDPOINT_PUBLICO.md` no repo `ServerVpss/CentralDark`

## Pra que serve
Plugar Cline, Bolt, Cursor, Continue, Aider em qualquer campo "OpenAI compatible base URL" usando a conta ChatGPT Plus do dono em vez de pagar API.

## Endpoints
- `GET /v1/models` — público
- `POST /v1/chat/completions` — exige `Authorization: Bearer <token>`

## Dependência crítica
Profile ChatGPT precisa estar logado via noVNC no painel `contas-admin` (`https://status.centralldark.com/ai-review.html`). Sem login = timeout.

## NÃO confundir com
- `api.centralldark.com/v1` — outro gateway antigo (PM2 id 17, código em `/root/dark/scripts/elite_http_gateway.py`), documentado em `docs/GATEWAY/README.md`
- O `elite.centralldark.com` é a versão nova exposta pelo trabalho de jun/2026, vive em `/root/CentralDark/scripts/elite-gateway/`
