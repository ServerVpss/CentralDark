# Landing TelePainel

**Arquivo:** `LandingTelePainel.tsx`
**Domínio:** `https://telepainel.centralldark.com`

## Comportamento
Diferente das outras landings: quando o hostname é `telepainel.centralldark.com`,
o `src/App.tsx` usa `getRootRedirectFor()` (`src/shared/lib/hostRouting.ts`) e
redireciona `/` direto pra `/dashboard` (área logada). Este componente só é
renderizado em contextos internos (rota explícita), não como landing pública.

## Infra
- Build único compartilhado com as outras landings.
- Caddy: bloco principal do TelePainel já existia antes; não foi tocado nessa
  rodada das landings.
