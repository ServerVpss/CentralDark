# Landing CentralDark (home oficial)

**Arquivo:** `LandingCentralDark.tsx`
**Domínio público:** `https://centralldark.com` (e `www.centralldark.com`)

## Como chega aqui
O Caddy serve o mesmo `dist/` do TelePainel pra todos os subdomínios. Na raiz
`/`, o `src/App.tsx` chama `detectHostKind()` (de `src/shared/lib/hostRouting.ts`)
e, quando o hostname é `centralldark.com`, renderiza este componente direto —
a URL no navegador fica limpa em `/`, sem redirect interno.

## Mapeamento de hosts (resumo)
| Subdomínio                       | Renderiza               |
|----------------------------------|-------------------------|
| `centralldark.com`               | `LandingCentralDark`    |
| `telepainel.centralldark.com`    | redirect `/dashboard`   |
| `whatsapp.centralldark.com`      | `LandingWhatsapp`       |
| `crm.centralldark.com`           | `LandingCRM`            |
| `financeiro.centralldark.com`    | `LandingFinanceiro`     |

## Infra
- Snippet Caddy: `infra/caddy/landings-centraldark.Caddyfile` (instalado em
  `/etc/caddy/conf.d/` na VPS, importado pelo Caddyfile principal).
- SSL automático via Let's Encrypt.
- Deploy: commit na `main` → webhook/cron puxam → `npm ci && vite build` →
  Caddy serve `dist/` sem downtime.
