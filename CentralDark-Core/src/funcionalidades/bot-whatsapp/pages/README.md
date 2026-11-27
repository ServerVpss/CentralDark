# Landing WhatsApp

**Arquivo:** `LandingWhatsapp.tsx`
**Domínio público:** `https://whatsapp.centralldark.com`

## Como chega aqui
Mesmo build do TelePainel é servido pelo Caddy nesse subdomínio. Na rota `/`,
o `src/App.tsx` consulta `detectHostKind()` (`src/shared/lib/hostRouting.ts`)
e, quando o hostname bate com `whatsapp.centralldark.com` (ou `www.`),
renderiza este componente direto — sem mudar a URL.

## Infra
- Snippet Caddy: `infra/caddy/landings-centraldark.Caddyfile` (em
  `/etc/caddy/conf.d/` na VPS).
- SSL Let's Encrypt automático.
- Pra adicionar/remover hosts, editar `WHATSAPP_HOSTS` em `hostRouting.ts`.
