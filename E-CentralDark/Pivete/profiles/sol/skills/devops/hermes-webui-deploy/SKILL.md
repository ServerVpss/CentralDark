---
name: hermes-webui-deploy
description: "Set up Hermes WebUI on Windows for iPhone via Tailscale."
version: 1.0.0
author: HERMES-CASA
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [hermes-webui, deploy, tailscale, iphone, windows, remote-access, uv]
    related_skills: [cua-driver-windows-elevado, centraldark-casa-operations]
---

# Hermes WebUI — deploy local para acesso remoto (iPhone / Tailscale)

Interface web do Hermes Agent (`https://github.com/nesquena/hermes-webui`).
Three-panel: sessões / chat / workspace. Acesso do celular via Tailscale Serve.

## FATO CRÍTICO — NÃO É NODE.JS

O repositório é **Python 3.11–3.13 + vanilla JS**. Não use `npm install`.
O `start.sh`/bootstrap usa **`uv`** (Astral) para criar um venv isolado.
Quem achar "é Node" perde tempo instalando pacote errado.

## Pré-requisitos (Windows)

- Python 3.11 instalado (ver abaixo o gotcha do `python3`)
- `uv` disponível (geralmente em `%LOCALAPPDATA%\hermes\bin\uv`)
- Tailscale instalado, MagicDNS + HTTPS Certs ativos no tailnet
- Porta livre (default 8787 costuma estar ocupada — usar 8788)

## GOTCHAS DE WINDOWS (confirmados nesta sessão)

### 1. `python3` é store-stub quebrado
No Windows do Chefe, `python3` abre o Microsoft Store stub e falha.
Usar `python` (3.11.15) ou deixar o `uv` resolver:
```text
uv run --python 3.11 python bootstrap.py --no-browser
```

### 2. `bootstrap.py` REJEITA `--port` / `--host` como flags nomeadas
Erro real visto:
```
bootstrap.py: error: unrecognized arguments: --port
```
O argparse só aceita porta como **positional** ou via **env vars / .env**.
✅ Correto: exportar `HERMES_WEBUI_HOST` / `HERMES_WEBUI_PORT` ou usar o `.env`.
❌ Errado: `bootstrap.py --port 8788` ou `--host 127.0.0.1`.

### 3. Conflito de porta 8787
O `sol-gateway-local` (Node, PID 9712) costuma ocupar 8787.
NÃO mate cegamente — pode ser gateway legítimo da Casa.
✅ Usar porta diferente (8788) e apontar o Tailscale Serve nela.

## Passo a passo (provado nesta sessão)

### 1. Clone
```bash
git clone https://github.com/nesquena/hermes-webui.git
cd hermes-webui
```

### 2. `.env` com senha OBRIGATÓRIA antes de expor
```bash
HERMES_PW=$(python -c "import secrets,base64; print(base64.b64encode(secrets.token_bytes(32)).decode())")
cat > .env <<EOF
HERMES_WEBUI_HOST=127.0.0.1
HERMES_WEBUI_PORT=8788
HERMES_WEBUI_PASSWORD=${HERMES_PW}
HERMES_WEBUI_SESSION_TTL=2592000
EOF
```
⚠️ **Nunca exponha sem `HERMES_WEBUI_PASSWORD`.** WebUI sem senha = RCE para quem
alcançar a porta. Anote a senha — o WebUI não deixa trocá-la remotamente (issue #1139).

### 3. Sobe o server (background, sem nohup — usa terminal background=true)
```bash
export PATH="$LOCALAPPDATA/hermes/bin:$PATH"
export HERMES_WEBUI_HOST=127.0.0.1
export HERMES_WEBUI_PORT=8788
uv run --python 3.11 python bootstrap.py --no-browser
```
(O `uv` cria `.venv`, instala pyyaml+cryptography, sobe server.py.)

### 4. Prova local
```bash
curl http://127.0.0.1:8788/health
# => {"status":"ok", ...}
```

### 5. Tailscale Serve (HTTPS no tailnet)
```bash
tailscale serve --bg 8788
tailscale serve status
# => https://<host>.<tailnet>.ts.net  (proxy http://127.0.0.1:8788)
```
- Precisa MagicDNS + HTTPS Certs ativos (já estavam neste tailnet).
- **NÃO use `tailscale funnel`** — funnel = internet pública.
- O Serve ouve na 443 do IP Tailscale; o server continua loopback-only (mais seguro).

### 6. No iPhone (Hermex)
- URL: `https://<host>.<tailnet>.ts.net/`
- Primeira tela pede a senha do `.env`.
- Exemplo desta sessão: `https://segredo.tail6d7aa4.ts.net/`

## Auto-start (sobrevive reboot)
O launch em background NÃO sobrevive reboot. Criar Scheduled Task ou serviço.
(Ver referências para receita.)

## Verificação de ponta a ponta
- `curl http://127.0.0.1:8788/health` → ok (server vivo)
- `netstat -ano | grep ":8788"` → LISTENING
- `tailscale serve status` → hostname HTTPS ativo
- `netstat -ano | grep ":443"` → tailscaled ouvindo no IP tailnet

## O que NÃO fazer
- Não assumir Node.js (é Python/uv)
- Não passar `--port` ao bootstrap.py
- Não usar `python3` no Windows deste PC
- Não expor 0.0.0.0 sem senha (fallback só se Serve indisponível)
- Não matar o que ocupa 8787 sem confirmar o que é

## Por que importa (Casa)
Fecha o elo "iPhone → Tailscale → Hermes" do MASTER CYCLE. O Hermex vira
terminal móvel do Hermes; combina com o cua-driver elevado (veja
`cua-driver-windows-elevado`) para controle total da máquina remotamente.

## Support files
- `references/claude-code-websearch-fallback.md` — quando o `web_search` do Hermes
  não tem créditos, delega a pesquisa ao Claude Code (print mode). Usado neste deploy.
