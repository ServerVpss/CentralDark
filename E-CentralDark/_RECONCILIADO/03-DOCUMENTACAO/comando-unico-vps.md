---
name: Comando único na VPS
description: Toda edição em código que roda na VPS é entregue como UM bloco bash com git pull + build + pm2 restart + curl de validação. Sem perguntar "quer que eu rode?".
type: preference
---

Quando a IA editar algo que vive **direto na VPS** (MCP, install-callback, webhook-bot, telegram-bot, supabase-sync, scripts em `/root/...`), a entrega final é **UM comando copia-e-cola** com:

```bash
set -e && cd <pasta> && git -C /root pull --ff-only && npm run build && \
  pm2 restart <NOME> --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://<dominio>/<rota>
```

**Regras:**
- Sempre `set -e` no começo.
- `git -C /root pull --ff-only` (casa do repo na VPS é `/root`).
- `npm ci` só quando mexer em `package.json`.
- `pm2 restart … --update-env && pm2 save`.
- `curl` no **domínio público** (cobre Caddy + processo + porta + cert).
- Não perguntar "quer que eu rode?" — entregar o bloco direto e seguir.

**Exceções (continua quebrando em passos + pedindo confirmação):**
Caddy, Docker, WuzAPI/WhatsApp, banco real, `rm -rf`, secrets, DNS/domínio.

**Templates por serviço:** ver `docs/CONSCIENCIA/13-COMANDO-UNICO-VPS.md`.

**Origem:** pedido do usuário em 2026-06-07, depois de várias rodadas de edição no MCP em que eu entregava `build` separado de `restart` separado de `curl`.
