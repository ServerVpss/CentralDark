# 13 — COMANDO ÚNICO NA VPS (REGRA INQUEBRÁVEL)

> Toda vez que a IA editar algo que vive **direto na VPS** (código de serviço PM2, script em `/root/...`), a entrega final pro usuário é **UM ÚNICO comando copia-e-cola** que faz: `git pull` + `install` (se precisar) + `build` + `pm2 restart` + `pm2 save` + `curl` de validação no domínio público.
>
> **Não perguntar "quer que eu rode?". Não listar 4 passos. É 1 bloco só.**

---

## Por que existe essa regra

O usuário é não-técnico e tá quase sempre logado na VPS via terminal. Pedir pra ele rodar 5 comandos em sequência, conferir cada output, e ainda perguntar "posso?" entre cada um, queima tempo e gera erro humano. Um comando único com `set -e` resolve: ou tudo dá certo, ou para no exato passo que falhou.

Nasceu em 2026-06-07 depois de várias rodadas de edição no MCP em que a IA entregava `cd ... && npm run build` separado do `pm2 restart` separado do `curl`.

---

## Formato padrão

```bash
set -e && cd <pasta-do-servico> && \
  git -C /root pull --ff-only && \
  npm run build && \
  pm2 restart <NOME-PM2> --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://<dominio-publico>/<rota-de-prova>
```

Regras:
- `set -e` no começo — para na primeira falha.
- `git -C /root pull --ff-only` — puxa o que a IA acabou de commitar no repo (a casa do repo é `/root`).
- `npm ci` no lugar de `npm run build` direto **só** quando a IA mexeu em `package.json`/`package-lock.json`. Caso contrário, pula install.
- `pm2 restart … --update-env` — releitura do `.env` do serviço.
- `pm2 save` — congela o estado pro boot.
- `curl` no **domínio público** (não em 127.0.0.1) — é a única prova real que tá no ar (vide regra "Validação da cadeia completa").

---

## Templates prontos por serviço

### MCP CentralDark
```bash
set -e && cd /root/CentralDark/apps/mcp && \
  git -C /root pull --ff-only && npm run build && \
  pm2 restart MCP-CentralDark --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://mcp.centralldark.com/status
```

### install-callback (porta de entrada install.centralldark.com)
```bash
set -e && cd /root/CentralDark/apps/install-callback && \
  git -C /root pull --ff-only && \
  pm2 restart install-callback --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://install.centralldark.com/
```

### webhook-bot
```bash
set -e && git -C /root pull --ff-only && \
  pm2 restart webhook-bot --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://hook.multizap.dev/health
```

### MultiZap-TelegramBot
```bash
set -e && git -C /root pull --ff-only && \
  pm2 restart MultiZap-TelegramBot --update-env && pm2 save && \
  pm2 logs MultiZap-TelegramBot --lines 5 --nostream
```

### CloneDeck-Supabase-Sync
```bash
set -e && git -C /root pull --ff-only && \
  pm2 restart CloneDeck-Supabase-Sync --update-env && pm2 save && \
  pm2 logs CloneDeck-Supabase-Sync --lines 5 --nostream
```

---

## Variante com dependências novas

Quando a IA mexeu em `package.json`:
```bash
set -e && cd /root/CentralDark/apps/mcp && \
  git -C /root pull --ff-only && npm ci && npm run build && \
  pm2 restart MCP-CentralDark --update-env && pm2 save && \
  sleep 2 && curl -s -o /dev/null -w "HTTP %{http_code}\n" https://mcp.centralldark.com/status
```

---

## Quando NÃO usar comando único

Continua pedindo confirmação antes (e quebrando em passos manuais) pra:
- Caddy (`/etc/caddy/Caddyfile`, reload, novo domínio)
- Docker (subir/parar container, mudar compose)
- WuzAPI / WhatsApp (sessão pode cair)
- Banco real (migração destrutiva, drop, alter)
- `rm -rf` em qualquer pasta fora de `/tmp`
- Secrets / credenciais (rotacionar token, gravar `.env` novo)
- Mudança de domínio público / DNS

Nesses casos: explica o risco, mostra o comando, **espera o "pode"**.

---

## Checklist de validação embutido

O `curl` no final cobre 5 dos 7 passos da "Validação da cadeia completa":
- HTTP 200 → Caddy + processo + porta + cert + rota nova respondendo.
- HTTP 502 → processo caiu, ver `pm2 logs <nome> --lines 30 --nostream`.
- HTTP 404 → rota nova não saiu, build não pegou ou Caddy aponta pra porta velha.
- HTTP 5xx outros → ler logs do serviço.

Quando precisar de prova mais forte (rota com marcador da versão nova), trocar `/status` por essa rota específica no curl final.
