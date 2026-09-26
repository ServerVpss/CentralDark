# WebUI 8788 + Omni Router (free tier, sem NOUS_API_KEY)

Cenário real 30/08: Hermes WebUI na porta 8788 dá erro de modelo:
`Provider 'nous' is set in config.yaml but no API key was found.`
Solução testada e provada: apontar o WebUI pro Omni Router local (8099), que serve
modelos free sem precisar de `NOUS_API_KEY`.

## Causa raiz (medida)
- WebUI (`C:\Users\danda\hermes-webui`, sobe via `start.ps1`) repassa pro `hermes_cli`.
- `hermes_cli` lê `C:\Users\danda\AppData\Local\hermes\config.yaml` (default model `nous/...`).
- `NOUS_API_KEY` NÃO existe em lugar nenhum da Casa (busca confirmada em `.env` e `config.yaml`).
- Resultado: erro 404 do Nous (crédito/key ausente) em toda chamada de modelo.

## Fix (extensão segura, não V2)
1. Subir o Omni Router (já existe em `C:\Users\danda\AppData\Local\Temp\launch_omni_router.py`):
   - Ele importa `e:/CentralDark/Pivete/CentralDark/apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
   - Escuta em `127.0.0.1:8099`
   - Serve free tier: `nous/tencent/hy3:free`, `auto`, `claude-code`, `hermes/hermes`
   ```bash
   cd "/c/Users/danda/AppData/Local/Temp"
   export PATH="/c/Users/danda/AppData/Local/hermes/bin:$PATH"
   python launch_omni_router.py   # background
   ```
   Prova: `curl -s http://127.0.0.1:8099/health` → `{"ok":true,"service":"centraldark-omni-router"...}`

2. Apontar `config.yaml` do hermes_cli pro router (patch mínimo na seção `model:`):
   ```yaml
   model:
     default: auto
     provider: centraldark-router
     api_mode: chat_completions
   providers:
     centraldark-router:
       name: CentralDark Omni Router
       base_url: http://127.0.0.1:8099/v1
       key_env: CENTRALDARK_ROUTER_KEY
       default_model: auto
   ```
   (substitui `default: moonshotai/kimi-k2.6` + `provider: openai-codex`)

3. Reiniciar o WebUI (mate o PID antigo, ressuba com `start.ps1`):
   ```bash
   # achar PID
   powershell.exe -NoProfile -Command "Get-NetTCPConnection -LocalPort 8788 -State Listen | Select OwningProcess"
   taskkill /PID <PID> /F
   cd "/c/Users/danda/hermes-webui"
   export HERMES_WEBUI_HOST="0.0.0.0"
   export HERMES_WEBUI_PORT="8788"
   pwsh.exe -NoProfile -ExecutionPolicy Bypass -File "./start.ps1"   # background
   ```
   Obs: git-bash `netstat -ano | findstr :8788` NÃO casa o PID neste host — usar PowerShell.

## Prova de ponta a ponta
- Health 8788: `{"status":"ok","sessions":0...}`
- Modelo via router: `curl -X POST http://127.0.0.1:8099/v1/chat/completions -d '{"model":"nous/tencent/hy3:free",...}'`
  → resposta real do `tencent/hy3:free` (sem `NOUS_API_KEY`).

## iPhone (Tailscale)
- `tailscale serve --bg 8788` → `https://segredo.tail6d7aa4.ts.net/`
- iOS não confia na CA do Tailscale por padrão → erro de cert. Instalar CA:
  Safari no URL → aceitar → Perfil → Ajustes → Perfil Baixado → instala →
  Ajustes → Geral → Sobre → Configuração de Confiança → habilita Tailscale CA.
- Fallback HTTP (sem cert): `http://100.125.83.74:8788` (WireGuard do Tailscale já cifra).

## Cloudflared no Windows (complementar, se quiser túnel público)
- Erro `cloudflared is not recognized` = binário não instalado.
- Baixar o `.exe` direto (NÃO zip, NÃO winget neste host):
  `https://github.com/cloudflare/cloudflared/releases/download/2026.8.2/cloudflared-windows-amd64.exe`
  (conferir tag latest em `https://api.github.com/repos/cloudflare/cloudflared/releases/latest`)
- Quick tunnel: `cloudflared.exe tunnel --url http://localhost:8788` (URL `*.trycloudflare.com` temporário).
- Hermex no iPhone via Tailscale é preferível a túnel público (não expõe a Casa).
