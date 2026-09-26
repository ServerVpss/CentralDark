# Plano — infra/cloudflare

## Para que serve
Integração da CentralDark com Cloudflare (DNS + proxy + SSL via Caddy).

## ✅ Feito
- `cloudflare.env.example` com todos os campos esperados
- Wizard `cloudflare-wizard.sh` (token → validação → zona → DNS → Caddy → relatório)
- Bibliotecas `lib/cloudflare.sh`, `lib/dns-check.sh`, `lib/ui.sh`, `lib/report.sh`
- Templates Caddy (static/proxy) em `infra/caddy/templates/`
- Flag `--dns-check` no instalador (checker read-only)
- Sanitização universal de logs
- Doc viva em `docs/INSTALADOR/16-cloudflare-dns.md`

## 🟡 Em andamento
- Importação automática dos snippets Caddy (hoje só gera + instrui)

## 🔴 A fazer
- Backup/rollback automático do Caddyfile com `CONFIRMO`
- Testar em conta Cloudflare nova
- Integrar com o checker end-to-end (`scripts/checker/09-caddy.sh`)

## 🛡️ Regras
- Nunca pedir email+senha da Cloudflare
- Token só em `/root/CentralDark/secrets/cloudflare.env` (0600)
- Caddy real nunca é alterado sem `CONFIRMO`
- DNS nunca apaga registro existente
