# Landing CRM

**Arquivo:** `LandingCRM.tsx`
**Domínio público:** `https://crm.centralldark.com`

## Como chega aqui
Mesmo build do TelePainel servido pelo Caddy. Na rota `/`, o `src/App.tsx`
chama `detectHostKind()` (`src/shared/lib/hostRouting.ts`) e renderiza este
componente quando o hostname é `crm.centralldark.com` (ou `www.`). A URL no
navegador continua `/`, sem redirect interno.

## Infra
- Snippet Caddy: `infra/caddy/landings-centraldark.Caddyfile`
  (em `/etc/caddy/conf.d/` na VPS).
- SSL Let's Encrypt automático.
- Pra adicionar/remover hosts, editar `CRM_HOSTS` em `hostRouting.ts`.
