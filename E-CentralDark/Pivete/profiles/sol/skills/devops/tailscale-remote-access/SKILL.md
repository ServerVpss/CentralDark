---
name: tailscale-remote-access
description: "Expose local server over Tailscale Serve with auth."
version: 1.0.0
author: HERMES-CASA
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [tailscale, serve, remote-access, https, hermes-webui, iphone, password]
    related_skills: [env-file-handling, cua-driver-windows-elevado]
---

# Tailscale remote access — padrão testado

Expor um servidor local (Hermes WebUI, gateway, qualquer app) pro iPhone via
Tailscale, com senha e HTTPS.

## Pré-requisitos (no tailnet)
- Tailscale instalado e logado
- **MagicDNS ativo** (admin console → DNS)
- **HTTPS Certificates ativado** (admin console → DNS → HTTPS Certificates)
- Não existe toggle "Serve" separado; o que precisa ativar são os HTTPS Certs
- **Nunca** usar `tailscale funnel` — Funnel = internet pública, Serve = só tailnet

## Passo 1 — senha ANTES de expor
Sempre setar `HERMES_WEBUI_PASSWORD` (ou equivalente) antes de qualquer bind não-loopback.
UI com acesso a agente + ferramentas sem senha = RCE remoto.
Ver skill `env-file-handling` para não ecoar a senha.

## Passo 2 — subir o server em loopback + porta livre
Evite conflito de porta. Se a 8787 tá ocupada (ex: outro gateway node), use 8788.
Hermes WebUI é Python: `uv run --python 3.11 python bootstrap.py --no-browser`
(sem `--port`; porta vem do `.env` `HERMES_WEBUI_PORT`).
Provar: `curl http://127.0.0.1:PORT/health` → `{"status":"ok"}`

## Passo 3 — Tailscale Serve
```text
tailscale serve --bg PORT
tailscale serve status
```
Retorna `https://<host>.<tailnet>.ts.net` (tailnet only) → proxy `http://127.0.0.1:PORT`.
O cert é emitido automaticamente pelo Serve.

## Passo 4 — provar ponta-a-ponta
- URL pro cliente (iPhone/Hermex): `https://<host>.<tailnet>.ts.net/`
- IP Tailscale direto (fallback HTTP cru): `http://<tailscale-ip>:PORT`
  - `tailscale ip -4` → ex: `100.125.83.74`
- Cliente precisa do Tailscale **ativado no celular** pra alcançar o hostname

## Fallback se Serve estiver desabilitado no tailnet
```text
HERMES_WEBUI_HOST=0.0.0.0 HERMES_WEBUI_PASSWORD='<senha>' ./start.sh
```
⚠️ `0.0.0.0` expõe HTTP plano pra LAN/WiFi também — só fallback manual, nunca default.

## Notas Hermes WebUI específicas
- `bootstrap.py` carrega `REPO_ROOT/.env` sozinho (senha nova pega no restart)
- Não dá pra trocar/remover senha remotamente após login (issue #1139) —
  para mudar: parar server, editar `.env`, subir de novo
- Auto-start não vem com `bootstrap.py` em background solto — precisa Scheduled Task

## O que NÃO fazer
- Não expor sem senha
- Não usar `tailscale funnel`
- Não assumir que `curl https://host` do próprio host vai responder (TLS do serve
  pode não ser enxergado do bash local) — confie no `serve status` + porta 443 listening
