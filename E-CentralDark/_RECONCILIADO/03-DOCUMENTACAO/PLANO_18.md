# Plano — scripts/installer

## Para que serve
Módulos do `install.sh` da raiz do repo. Cada peça grande do instalador
vive aqui.

## ✅ Feito
- `cloudflare-wizard.sh` — Cloudflare Connect Wizard completo
- `lib/ui.sh`, `lib/cloudflare.sh`, `lib/dns-check.sh`, `lib/report.sh`
- Integração com `install.sh` (flags `--cloudflare*`, `--dns-check`, `--domains`)
- Doc viva em `docs/INSTALADOR/16-cloudflare-dns.md`

## 🟡 Em andamento
- Importação automática dos snippets Caddy (hoje só gera + instrui)

## 🔴 A fazer
- Módulo MCP em `mcp-wizard.sh`
- Módulo Supabase em `supabase-wizard.sh`
- Módulo PM2 / serviços
- Testes em VPS limpa

## 🛡️ Regras
- Nunca apagar `secrets/`, `credenciais/`, `backups/`, `apps/crm/`, `wuzapi/`
- Toda mudança atualiza `docs/INSTALADOR/` no mesmo commit
- Token / secret nunca em log

## 🚀 Próximo passo
Testar o `cloudflare-wizard.sh` em VPS limpa com domínio novo.
