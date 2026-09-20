# 13 — Portal CentralDark + TelePainel (deploy duplo por domínio)

Mesmo build servido em dois domínios separados via Caddy.

| Domínio | Pasta na VPS | Raiz (`/`) |
|---|---|---|
| `centralldark.com`, `www.centralldark.com` | `/root/CentralDark/apps/portal/dist` | Landing + `/portal` |
| `telepainel.centralldark.com` | `/root/CentralDark/apps/Telepanel/dist` | Redireciona pra `/dashboard` |

Roteamento por hostname: `src/lib/hostRouting.ts` (aplicado em `src/App.tsx`).

## Execução na VPS

```bash
bash /root/Multizap/apps/clone-deck/scripts/setup-centraldark-portal.sh
```

O script:
1. Cria `/root/CentralDark/apps/{portal,Telepanel}`.
2. Clona o repo nas duas pastas (ou atualiza se já existirem).
3. Roda `npm ci && npm run build` em cada uma.
4. Gera `/root/CentralDark/infra/caddy/portal.Caddyfile`.

> ⚠️ **O instalador principal (`install.sh`) NÃO é tocado por este script.**
> A integração com Caddy (`import` + `systemctl reload caddy`) exige confirmação manual.

## DNS

Apontar A records pra `89.117.78.124`:
- `centralldark.com`
- `www.centralldark.com`
- `telepainel.centralldark.com`

## Snippet Caddy gerado

```caddy
centralldark.com, www.centralldark.com {
    root * /root/CentralDark/apps/portal/dist
    try_files {path} /index.html
    file_server
    encode gzip
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

## Validação

```bash
curl -I https://centralldark.com                          # 200
curl -I https://www.centralldark.com                      # 200
curl -I https://telepainel.centralldark.com/dashboard     # 200
```
