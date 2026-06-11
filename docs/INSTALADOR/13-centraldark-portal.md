# 13 — Portal CentralDark + TelePainel (deploy duplo por domínio)

Este documento descreve como o **mesmo build** deste repositório (`segredounlock/clone-deck`)
é servido em **dois domínios distintos** na VPS, cada um com sua própria pasta:

| Domínio | Pasta na VPS | Porta de entrada (`/`) |
|---|---|---|
| `centralldark.com` e `www.centralldark.com` | `/root/CentralDark/apps/portal/dist` | Landing pública + `/portal` (módulos) |
| `telepainel.centralldark.com` | `/root/CentralDark/apps/Telepanel/dist` | Redireciona pra `/dashboard` |

O redirecionamento por hostname está em `src/lib/hostRouting.ts` e é aplicado no `src/App.tsx`.
Como o SPA é o mesmo, qualquer rota continua acessível em ambos os domínios — só muda a
"porta de entrada" da raiz.

---

## 1. Estrutura criada na VPS

```
/root/CentralDark/
├── apps/
│   ├── portal/         # git clone do repo + dist/
│   └── Telepanel/      # git clone do repo + dist/
├── infra/
│   └── caddy/
│       └── portal.Caddyfile
├── logs/
├── secrets/
└── revisoes/
```

## 2. Criação inicial (idempotente)

```bash
mkdir -p /root/CentralDark/apps /root/CentralDark/infra/caddy \
         /root/CentralDark/logs /root/CentralDark/revisoes

REPO_URL="https://github.com/segredounlock/clone-deck.git"

for DIR in portal Telepanel; do
  TARGET="/root/CentralDark/apps/$DIR"
  if [ ! -d "$TARGET/.git" ]; then
    git clone "$REPO_URL" "$TARGET"
  fi
  (cd "$TARGET" && git pull --ff-only && npm ci && npm run build)
done
```

## 3. Snippet Caddy

Arquivo `/root/CentralDark/infra/caddy/portal.Caddyfile`:

```caddy
centralldark.com, www.centralldark.com {
    root * /root/CentralDark/apps/portal/dist
    try_files {path} /index.html
    file_server
    encode gzip
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
    }
}

telepainel.centralldark.com {
    root * /root/CentralDark/apps/Telepanel/dist
    try_files {path} /index.html
    file_server
    encode gzip
}
```

Importar no Caddyfile principal:

```caddy
import /root/CentralDark/infra/caddy/portal.Caddyfile
```

> ⚠️ Editar/recarregar o Caddy é ação sensível (regra do workspace).
> Pedir confirmação ao usuário antes de aplicar e `systemctl reload caddy`.

## 4. DNS

Apontar no registrador:

- `centralldark.com`            → A  `89.117.78.124`
- `www.centralldark.com`        → A  `89.117.78.124`
- `telepainel.centralldark.com` → A  `89.117.78.124`

Caddy emite SSL via Let's Encrypt automaticamente assim que os hostnames resolverem.

## 5. Sync automático

O cron `gh-pull` (já existente, roda a cada 5 min) é estendido para atualizar as duas
pastas novas além da antiga `clone-deck`:

```bash
for DIR in \
  /root/Multizap/apps/clone-deck \
  /root/CentralDark/apps/portal \
  /root/CentralDark/apps/Telepanel; do
  [ -d "$DIR/.git" ] || continue
  (cd "$DIR" && git pull --ff-only && npm ci --silent && npm run build) \
    >> /root/CentralDark/logs/gh-pull.log 2>&1
done
```

Webhook GitHub→VPS pode disparar o mesmo script pra atualização instantânea.

## 6. Validação

```bash
curl -I https://centralldark.com                          # 200
curl -I https://www.centralldark.com                      # 200
curl -I https://telepainel.centralldark.com/dashboard     # 200
```

Salvar relatório em `/root/CentralDark/revisoes/migracao-portal-$(date +%F).md`.

## 7. Legado

A pasta antiga `/root/Multizap/apps/clone-deck` **não é removida** automaticamente.
Depois de validar tudo em produção por alguns dias, renomear para
`clone-deck.legacy` e desativar do cron.
