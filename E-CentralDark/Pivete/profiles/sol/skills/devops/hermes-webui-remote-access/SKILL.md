---
name: hermes-webui-remote-access
description: "Setup Hermes WebUI remote via Tailscale + iPhone Hermex."
version: 1.0.0
author: HERMES-CASA
license: MIT
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [hermes-webui, tailscale, remote-access, iphone, hermex, windows, python, deployment]
    related_skills: [cua-driver-windows-elevado, hermes-agent]
---

# Hermes WebUI — Acesso Remoto (Tailscale + iPhone/Hermex)

Configurar o Hermes WebUI para ser acessado do iPhone via app Hermex,
usando Tailscale como túnel seguro (sem Cloudflare, sem Funnel).

## Fonte canônica (verificada via Claude Code delegate, 2026-08-30)
- Repo: https://github.com/nesquena/hermes-webui — **EXISTE**, ativo
- Docs no repo: `docs/remote-access.md`, `docs/docker.md`, `docs/onboarding.md`
- Issue #1139 (sem troca de senha remota), #1576 (multi-user), #3825 (OIDC)

## ERRO COMUM #1: NÃO é Node.js
O hermes-webui é **Python 3.11–3.13 + vanilla JS** (sem framework, sem bundler).
Não use `npm install` como passo principal. O `./start.sh` usa `uv`
(gerenciador Python da Astral) para criar ambiente isolado automaticamente.

```bash
git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui
./start.sh              # bootstrap Python → sobe em 127.0.0.1:8787
```

Se você rodou `npm install` e parou, o runtime é Python — refaça com `./start.sh`.

## ERRO COMUM #2: Windows não suporta bootstrap nativo
README oficial: *"Native Windows is not supported for this bootstrap yet.
Use Linux, macOS, or WSL2."*
- **WSL2**: rode `./start.sh` dentro do WSL2 (Linux)
- **Docker**: `cp .env.docker.example .env && docker compose up -d`
- Guia community (não first-party): `@markwang2658/hermes-windows-native-guide`

## PASSWORD OBRIGATÓRIO antes de expor
`HERMES_WEBUI_PASSWORD` — sem ela, qualquer um que alcance a porta
rode comandos (RCE, não só chat vazado). Auth é OFF por default no loopback.

```bash
HERMES_WEBUI_PASSWORD='<senha-longa-random>' ./start.sh
```
Variáveis de ambiente:
- `HERMES_WEBUI_HOST` (default `127.0.0.1` — loopback seguro)
- `HERMES_WEBUI_PORT` (default `8787`)

## CONFLITO DE PORTA 8787 (Windows deste PC, 2026-08-30)
`netstat` mostrou `node.exe` PID 9712 (`sol-gateway-local.mjs`) occupando 8787.
Antes de subir o WebUI na 8787:
- Parar o processo atual (`taskkill /PID 9712`), **ou**
- Usar `HERMES_WEBUI_PORT=8788 ./start.sh` (porta alternativa)

## Tailscale Serve (RECOMENDADO) vs Funnel (NUNCA)
```bash
tailscale serve --bg 8787     # HTTPS no tailnet: https://<host>.<tailnet>.ts.net
tailscale serve status        # confirma a URL gerada
```
- **Serve** = só tailnet interno (TLS + MagicDNS, seguro)
- **Funnel** = internet pública (NUNCA usar para isto)
- Prereq no admin console: **MagicDNS ON** + **HTTPS Certificates ON**
- Não há toggle "Serve" separado; `nodeAttrs funnel` no policy é só p/ Funnel
- `tailscale serve status` ANTES e DEPOIS p/ não conflitar com :443 existente

## Fallback: bind 0.0.0.0 (MENOS seguro)
```bash
HERMES_WEBUI_HOST=0.0.0.0 HERMES_WEBUI_PASSWORD='<senha>' ./start.sh
# iPhone: http://<tailscale-ip>:8787  (WireGuard crypto, mas HTTP plano, expõe LAN)
```
Use só se Serve não funcionar. Nunca expõe sem password.

## iPhone (app Hermex)
1. Instalar Hermex (App Store: `apps.apple.com/app/hermex/id6767006319`)
2. Usar URL do Serve: `https://<host>.<tailnet>.ts.net`
3. Fallback HTTP direto: `http://100.125.83.74:8787` (menos seguro)

## Segurança (resumo)
1. Sempre `HERMES_WEBUI_PASSWORD` antes de expor
2. Prefira `127.0.0.1` + Serve sobre `0.0.0.0`
3. Nunca `tailscale funnel`
4. `tailscale serve status` antes/depois (não conflitar :443)
5. Issue #1139: não dá pra trocar senha remotamente depois de logado — sete ANTES
6. Restrinja ACLs do tailnet pra quem pode chegar no node

## Verificação
```bash
curl http://127.0.0.1:8787/health          # deve retornar sucesso
curl http://<tailscale-ip>:8787/health     # teste do iPhone ou outro device
```
