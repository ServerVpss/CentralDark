# infra/cloudflare

Referência de DNS e integração Cloudflare da CentralDark.

## Domínio
- Principal: `centralldark.com`

## Subdomínios padrão (criados/checados pelo wizard)

| Nome      | Para que serve                        |
|-----------|----------------------------------------|
| `@`, `www`| Site / landing                         |
| `app`     | Painel principal                       |
| `crm`     | CRM                                    |
| `bot`     | Painel do bot Telegram                 |
| `api`     | Gateway de API                         |
| `gateway` | Gateway alternativo                    |
| `webhook` | Webhook GitHub → VPS (deploy)          |
| `mcp`     | Servidor MCP CentralDark (porta 9100)  |
| `status`  | Página pública de status               |

## Wizard

Tudo é orquestrado pelo `cloudflare-wizard.sh`:

```bash
./install.sh --cloudflare         # wizard guiado (interativo)
./install.sh --cloudflare-check   # só valida token + lista registros
./install.sh --cloudflare-apply   # aplica DNS sem perguntar (CI/re-run)
./install.sh --dns-check          # checker DNS+Caddy+HTTPS, read-only
```

Documentação completa do fluxo: [`docs/INSTALADOR/16-cloudflare-dns.md`](../../../docs/INSTALADOR/16-cloudflare-dns.md).

## Segurança

- Token **nunca** entra no Git. Vive só em `/root/CentralDark/secrets/cloudflare.env` (perm 0600).
- Nenhuma mudança em DNS é aplicada sem confirmação humana (`CONFIRMO`).
- Caddy real **não** é alterado automaticamente — apenas snippets em
  `/root/CentralDark/infra/caddy/` são gerados, importação é manual.
