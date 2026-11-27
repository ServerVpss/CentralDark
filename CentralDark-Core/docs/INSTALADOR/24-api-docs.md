# 24 · Documentação pública da API (`api.centralldark.com`)

Site estático estilo WazAPI servido por Caddy em **https://api.centralldark.com/**.
O mesmo domínio continua servindo a API real do MultiZap-Gateway (`/health`, `/v1/*`, `/api/*`).

## Arquitetura

```txt
Cliente
  │
  ▼
api.centralldark.com  (Caddy)
  ├── /health, /v1/*, /api/*  →  reverse_proxy 127.0.0.1:3100 (MultiZap-Gateway)
  └── /* (resto)              →  file_server /var/www/api-docs/  (HTML estático)
```

## Arquivos

| Item | Local |
|------|-------|
| Fonte | `CentralDark/apps/api-docs/public/index.html` |
| Doc da app | `CentralDark/apps/api-docs/README.md` + `PLANO.md` |
| Snippet Caddy | `CentralDark/infra/caddy/api.centralldark.com.Caddyfile` |
| Web root na VPS | `/var/www/api-docs/` |

## Deploy

1. `rsync -av CentralDark/apps/api-docs/public/ root@VPS:/var/www/api-docs/`
2. `scp CentralDark/infra/caddy/api.centralldark.com.Caddyfile root@VPS:/root/CentralDark/infra/caddy/`
3. `caddy validate --config /etc/caddy/Caddyfile && systemctl reload caddy`

## Validação (checklist da cadeia)

- `curl https://api.centralldark.com/` → HTTP 200 com `<title>CentralDark API — Documentação</title>`
- `curl https://api.centralldark.com/health` → JSON `{ok:true,service:"MultiZap-Gateway",...}`
- `curl https://api.centralldark.com/v1/anything` → HTTP 404 do gateway (não SPA fallback)

Validado em 2026-06-09.
