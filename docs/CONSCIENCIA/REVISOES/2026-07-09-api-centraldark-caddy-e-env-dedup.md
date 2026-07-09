# Revisão 2026-07-09 — api.centralldark.com + dedup .env

Executado pelo Pivete via Lovable/SSH (chave `VPS_SSH_KEY_LOVABLE`).

## O que mudou
1. `/root/CentralDark/secrets/.env` deduplicado (53 chaves repetidas removidas). Backup: `secrets/_backups/.env.20260709-124938.bak`.
2. Stub `ABACUS_API_KEY=` adicionado (aguarda valor real).
3. `/etc/caddy/Caddyfile` bloco `api.centralldark.com`: `handle { reverse_proxy localhost:8080 }` → `127.0.0.1:8090` (ArsenalAdapter OpenAI-compat). Backup: `secrets/_backups/Caddyfile.20260709-124938.bak`.
4. `caddy validate` OK · `systemctl reload caddy` OK.

## Evidência
- Antes: `curl https://api.centralldark.com/v1/models` → **HTTP 502**.
- Depois: **HTTP 401** 🟢 (rota viva, exige auth do cliente).

## Pendências
- 🟡 Colar `ABACUS_API_KEY` real no `.env` + `pm2 restart CentralDark-ArsenalAdapter`.
- 🟡 Card Abacus no HUB fica verde depois disso.

## Log local
`/root/CentralDark/revisoes/lovable-20260709-124938-api-centraldark-e-env.md`
