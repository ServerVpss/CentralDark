# Auditoria — scripts read-only

Scripts que **só leem** o estado da VPS / repo e geram pacotes em
`/root/CentralDark/revisoes/<stamp>-<nome>/`. Nenhum deles altera arquivo,
serviço, banco ou config — eles existem justamente pra dar visibilidade
antes de qualquer ação destrutiva.

## Scripts

- `working-tree-vps.sh` — Modo Segredo. Audita working tree de `/root`,
  classifica sujeira em buckets A/B/C/D, gera diffs sanitizados,
  lista untracked com hash, confirma handlers Lote 4–10, checa
  `webhook-bot` no PM2. Nunca lê `.env`, `secrets/`, `tokens/`,
  `sessions/`, `.ssh/`, `*.pem`, `*.key`.

## Como rodar

Via MCP `runShell` (preferido) ou SSH direto na VPS:

```bash
bash /root/CentralDark/scripts/auditoria/working-tree-vps.sh
```

Saída: `/root/CentralDark/revisoes/<stamp>-auditoria-working-tree/RESUMO.md`.

## Bloqueado nestes scripts

- `git reset`, `git checkout --`, `git clean`
- `rm`, `mv`, `truncate`
- `pm2 start/delete/restart`
- `systemctl`, `docker`, qualquer toque em Caddy/WuzAPI/CRM/banco real
- leitura de arquivos sensíveis (regra `is_sensitive`)
