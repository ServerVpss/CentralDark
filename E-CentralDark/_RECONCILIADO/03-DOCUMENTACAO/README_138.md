# scripts/installer

Módulos do `install.sh` (orquestrador na raiz do repo).

## Estrutura

```
cloudflare-wizard.sh    Cloudflare Connect Wizard (token → DNS → Caddy → relatório)
lib/
  ui.sh                 Banners, prompts, cor, sanitização universal
  cloudflare.sh         Cliente da API Cloudflare + storage seguro
  dns-check.sh          Checker DNS+Caddy+HTTPS (read-only)
  report.sh             Geração de relatórios em revisoes/
```

## Como o install.sh usa

- `./install.sh --cloudflare` → `cloudflare-wizard.sh --wizard`
- `./install.sh --cloudflare-check` → `cloudflare-wizard.sh --check`
- `./install.sh --cloudflare-apply` → `cloudflare-wizard.sh --apply`
- `./install.sh --dns-check` → `cloudflare-wizard.sh --dns-check`
- `./install.sh --domains` → wizard + dns-check

## Regras

- Token Cloudflare nunca aparece em log nem em Git.
- Caddyfile principal só é alterado com `CONFIRMO` e backup.
- DNS nunca apaga registro existente.
- Tudo idempotente — rodar de novo é seguro.

Doc viva: `docs/INSTALADOR/16-cloudflare-dns.md`.
