# 🔍 scripts/checker — Checker END-TO-END do instalador

Conjunto de scripts que valida se o sistema MultiZap/CentralDark ficou de pé depois da instalação. Pendência **#9** do `docs/PENDENCIAS.md`.

## Como rodar

```bash
bash scripts/checker/run-all.sh
# ou via instalador:
./install.sh --check-final
```

Relatório vai pra `/root/Multizap/revisoes/YYYYMMDD-HHMMSS/checker-final/relatorio.md`.

## Códigos de saída

- `0` → STATUS FINAL = OK (tudo verde)
- `1` → ALERTA (tem coisa pra revisar, mas nada crítico)
- `2` → ERRO (instalação NÃO pode ser declarada concluída)

## Os 11 blocos

| # | Arquivo | O que valida |
|---|---------|--------------|
| 01 | `01-estrutura.sh` | Pastas obrigatórias do `/root/Multizap` e `/root/CentralDark` |
| 02 | `02-logs.sh` | Diretório de revisões gravável + sem vazamento de secrets |
| 03 | `03-github-deploy.sh` | Repo clonado, webhook em :9003, cron de fallback |
| 04 | `04-pm2.sh` | 10 serviços PM2 (online + restarts < 5) |
| 05 | `05-telegram-bot.sh` | Logs sem `MODULE_NOT_FOUND` / `consciousness.cjs` / `[Poll] fetch failed` |
| 06 | `06-supabase-sync.sh` | Sem `ECONNREFUSED`, 401 marcado como pendência conhecida |
| 07 | `07-whatsapp-wuzapi.sh` | Pasta QR + containers WuzAPI + `whatsapp-server` (somente leitura) |
| 08 | `08-chat-ao-vivo.sh` | Arquivos do bot presentes + ping gateway |
| 09 | `09-caddy.sh` | Caddy ativo + domínios respondendo (HEAD only, não recarrega) |
| 10 | `10-crm.sh` | CRM presente e online (proibido mexer) |
| 11 | `11-seguranca.sh` | Permissões de `secrets/` + sem `.env` versionado |

> O bloco 12 (relatório final) é o próprio `run-all.sh` — ele agrega tudo.

## Regras invioláveis

- **NUNCA** reinicia serviço sensível (WuzAPI, WhatsApp, Caddy, Docker, CRM).
- **NUNCA** apaga ou modifica nada — só lê.
- Toda saída passa por `sanitize_log` antes de virar relatório.
- Se um módulo falhar em executar, vira ALERTA, nunca derruba o resto.
