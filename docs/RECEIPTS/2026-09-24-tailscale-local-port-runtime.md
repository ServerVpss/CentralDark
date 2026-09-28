# Receipt — Tailscale local-port runtime

Data: 2026-09-24
Owner: runtime/tailscale-ports/local-port-bridge.mjs
Policy: CENTRALDARK_LOCAL_PORTS_OVER_TAILSCALE

## Confirmado
- Tailscale IP VPS: 100.121.152.119
- Tailnet host: 
- Rota registrada: telegram-mtproto-config
- Listen: 100.121.152.119:18790
- Target: 127.0.0.1:8790
- PM2: centraldark-tailscale-local-ports

## Regra cristalizada em runtime
- Toda porta local da CentralDark que precisar acesso remoto deve passar por allowlist em data/runtime/tailscale-local-ports.json.
- Porta local nao registrada nao deve ser exposta automaticamente.
- Bot/Orquestrador deve avisar: "estou colocando a porta no runtime Tailscale" antes de registrar nova rota.
- Segredo/token/key nao entra em Git nem log.

## Estado atual
- MTProto service esta vivo, mas CONFIG_BLOCKED ate TELEGRAM_APP_API_ID/TELEGRAM_APP_API_HASH existirem nos secrets.
- Conta pessoal Telegram ainda nao conectada.

## NEXT_CURSOR
Inserir chaves MTProto em secrets -> restart mtproto-service --update-env -> /status connected=false configured=true -> fluxo telefone/codigo/2FA -> connected=true.
