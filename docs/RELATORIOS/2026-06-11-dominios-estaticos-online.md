# Relatório — Domínios Estáticos Online

Data: 2026-06-11

## Resultado final do lote

Após correção de permissões dos logs do Caddy, importação dos vhosts faltantes e reload pelo binário `caddy reload --config /etc/caddy/Caddyfile`, os domínios estáticos principais ficaram online.

Validador usado:

```bash
/root/CentralDark/scripts/run-once/validar-dominios-200-centraldark.sh
```

Logs do validador final:

```txt
/root/Multizap/revisoes/20260611-154439/dominios-200-centraldark
```

## Domínios OK

| Domínio | Status |
|---|---:|
| `centralldark.com` | HTTP 200 |
| `www.centralldark.com` | HTTP 200 |
| `status.centralldark.com` | HTTP 200 |
| `mcp.centralldark.com/health` | HTTP 200 |
| `install.centralldark.com/health` | HTTP 200 |
| `api.centralldark.com/v1/whatsapp/sessions` | HTTP 200 |
| `bot.centralldark.com` | HTTP 200 |
| `multizap.dev` | HTTP 200 |
| `www.multizap.dev` | HTTP 200 |
| `bot.multizap.dev` | HTTP 200 |

## Pendências restantes

| Domínio | Status | Causa provável |
|---|---:|---|
| `crm.multizap.dev` | HTTP 502 | porta `3000` não estava ouvindo |
| `hook.multizap.dev` | HTTP 502 | porta `9003` não estava ouvindo |
| `proxy.multizap.dev` | HTTP 404 na raiz | porta `3100` ouvindo; raiz sem rota visual definida |

## Pastas validadas

| Caminho | Status |
|---|---:|
| `/root/CentralDark/apps/web/dist/index.html` | existe |
| `/root/CentralDark/apps/web/dist` | existe |
| `/root/CentralDark/apps/bot/dist/index.html` | existe |
| `/root/CentralDark/apps/bot/dist` | existe |
| `/root/CentralDark/apps/projeto-dashboard/index.html` | existe |
| `/root/CentralDark/apps/projeto-dashboard` | existe |
| `/var/www/multizap/dist/index.html` | existe |
| `/var/www/multizap/dist` | existe |

## Portas validadas

| Serviço | Porta | Status |
|---|---:|---:|
| MCP | `9100` | ouvindo |
| install-callback | `9200` | ouvindo |
| API/BotServer | `9210` | ouvindo |
| CRM | `3000` | não encontrada |
| proxy legado | `9002` | não encontrada |
| proxy/gateway atual | `3100` | ouvindo |
| hook | `9003` | não encontrada |

## Caddy

- `caddy validate --config /etc/caddy/Caddyfile`: OK.
- `caddy reload --config /etc/caddy/Caddyfile`: executado e usado como caminho operacional correto.
- O erro antigo `226/NAMESPACE` não apareceu como recente no validador final.
- Permissões de `/var/log/caddy` foram alinhadas para o usuário/grupo do Caddy.
- Imports confirmados no Caddy principal:
  - `/etc/caddy/status-centraldark.Caddyfile`
  - `/etc/caddy/centraldark-managed/bot-api.caddy`
  - `/etc/caddy/centraldark-root.Caddyfile`
  - `/etc/caddy/www-multizap.Caddyfile`

## Conclusão

O lote de domínios estáticos está fechado. As pendências restantes devem ser tratadas em lote separado de serviços/portas, sem misturar com Caddy estático.

## Próximo lote recomendado

1. Mapear PM2/processos relacionados a CRM e hook.
2. Confirmar nomes dos serviços esperados.
3. Validar porta `3000` para `crm.multizap.dev`.
4. Validar porta `9003` para `hook.multizap.dev`.
5. Só reiniciar ou alterar PM2 com confirmação explícita.

## Segurança

Não foram tocados secrets, `.env`, tokens, sessões, WuzAPI, WhatsApp, Docker, banco real ou CRM interno neste relatório.
