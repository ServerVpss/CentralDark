# Relatório — Validação de Domínios e Mega Painel

Data: 2026-06-11

## Contexto

Foi executado o ciclo de validação dos domínios CentralDark/MultiZap com o script:

```bash
/root/CentralDark/scripts/run-once/validar-dominios-200-centraldark.sh
```

O script segue o padrão novo:

```bash
source /root/CentralDark/scripts/lib/theme.sh
```

Logs completos do ciclo informado:

```txt
/root/Multizap/revisoes/20260611-142557/dominios-200-centraldark
```

## Resultado atual

### Domínios OK

| Domínio | Status |
|---|---:|
| `status.centralldark.com` | HTTP 200 |
| `mcp.centralldark.com/health` | HTTP 200 |
| `install.centralldark.com/health` | HTTP 200 |
| `api.centralldark.com/v1/whatsapp/sessions` | HTTP 200 |
| `bot.centralldark.com` | HTTP 200 |
| `multizap.dev` | HTTP 200 |
| `bot.multizap.dev` | HTTP 200 |
| `proxy.multizap.dev` | HTTP 404 na raiz, aceitável enquanto rota raiz não for serviço visual |

### Domínios pendentes

| Domínio | Status | Leitura |
|---|---:|---|
| `centralldark.com` | HTTP 525 | provável camada Cloudflare/SSL/DNS, pois build local existe e Caddy valida |
| `www.centralldark.com` | HTTP 525 | provável camada Cloudflare/SSL/DNS |
| `www.multizap.dev` | HTTP 000 | provável DNS/Cloudflare/rota ausente |
| `crm.multizap.dev` | HTTP 502 | porta local esperada 3000 não estava ouvindo |
| `hook.multizap.dev` | HTTP 502 | porta local esperada 9003 não estava ouvindo |

## Pastas validadas

| Pasta/arquivo | Status |
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

| Serviço esperado | Porta | Status |
|---|---:|---:|
| MCP | 9100 | ouvindo |
| install-callback | 9200 | ouvindo |
| API/BotServer | 9210 | ouvindo |
| CRM | 3000 | não encontrada |
| proxy legado | 9002 | não encontrada |
| proxy atual | 3100 | ouvindo |
| hook | 9003 | não encontrada |

## Caddy

- `caddy validate --config /etc/caddy/Caddyfile`: OK.
- `caddy reload --config /etc/caddy/Caddyfile`: executado direto na VPS e concluiu sem erro crítico no output informado.
- O erro anterior `226/NAMESPACE` não apareceu como recente no validador.

## O que foi resolvido

- `status.centralldark.com` saiu de HTTP 404 para HTTP 200.
- O Mega Painel voltou a ter `index.html` em `/root/CentralDark/apps/projeto-dashboard/index.html`.
- Caddy validate/reload direto pelo binário foi validado como caminho operacional melhor do que `systemctl reload caddy` neste momento.

## Próxima ordem recomendada

1. Tratar `centralldark.com` e `www.centralldark.com` como lote Cloudflare/SSL/DNS.
2. Tratar `www.multizap.dev` como lote DNS/Cloudflare.
3. Tratar `crm.multizap.dev` e `hook.multizap.dev` como lote de serviços/portas, sem misturar com Caddy estático.

## Segurança

Não expor secrets, `.env`, tokens, sessões ou connection strings. Não resetar WhatsApp, WuzAPI, Docker, banco real ou CRM sem confirmação explícita.
