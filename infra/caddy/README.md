# infra/caddy — Snippets do Caddy

## `landings-centraldark.Caddyfile`
Snippet que adiciona os 3 subdomínios de landing à VPS:

- `whatsapp.centralldark.com`
- `crm.centralldark.com`
- `financeiro.centralldark.com`

Todos servem o **mesmo `dist/`** do TelePainel. A escolha de qual landing
renderizar acontece no React, via `detectHostKind()` em
`src/shared/lib/hostRouting.ts`. A home `centralldark.com` é tratada por outro
snippet (`centraldark-root.Caddyfile`) e **não** está aqui pra evitar conflito
de host duplicado.

## Instalação na VPS
Arquivo copiado pra `/etc/caddy/conf.d/landings-centraldark.Caddyfile` e
importado pelo `/etc/caddy/Caddyfile` principal via `import conf.d/*.Caddyfile`.
Deploy automatizado pelo workflow `vps-ssh-exec.yml` (GitHub Actions).

## Validação rápida
```bash
curl -I https://whatsapp.centralldark.com
curl -I https://crm.centralldark.com
curl -I https://financeiro.centralldark.com
```
Todos devem responder `HTTP/2 200` com certificado Let's Encrypt válido.
