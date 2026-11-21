# Landing Financeiro

**Arquivo:** `LandingFinanceiro.tsx`
**Domínio público:** `https://financeiro.centralldark.com`

## Como chega aqui
Mesmo build do TelePainel servido pelo Caddy. Na rota `/`, o `src/App.tsx`
chama `detectHostKind()` (`src/shared/lib/hostRouting.ts`) e renderiza este
componente quando o hostname é `financeiro.centralldark.com` (ou `www.`).
URL no navegador fica `/`, sem redirect interno.

## Infra
- Snippet Caddy: `infra/caddy/landings-centraldark.Caddyfile`
  (em `/etc/caddy/conf.d/` na VPS).
- SSL Let's Encrypt automático.
- Pra adicionar/remover hosts, editar `FINANCEIRO_HOSTS` em `hostRouting.ts`.
