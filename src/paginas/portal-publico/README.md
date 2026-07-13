# apps/web — Portal público CentralDark

**Destino na VPS:** `/root/CentralDark/apps/web/`

Esse é o "rosto público" do ecossistema. Tudo que um visitante anônimo enxerga antes de fazer login mora aqui.

## Páginas

| Arquivo | Rota | O que é |
|---|---|---|
| `LandingCentralDark.tsx` | `/` | Homepage com os 4 cards de módulo (TelePainel, WhatsApp, CRM, Financeiro). |
| `Portal.tsx` | `/portal` | Hub logado — escolha de qual módulo abrir. Protegido por login. |
| `Auth.tsx` | `/auth` | Login / cadastro (email + Google). |
| `Status.tsx` | `/telepainel/status` | Painel público de status dos serviços (saúde das APIs, edge functions, etc.). |

## Dependências

- `@/shared/auth/AuthProvider` — sessão de usuário.
- `@/shared/ui/*` — componentes shadcn.
- `@/integrations/supabase/client` — Lovable Cloud.

## Status

✅ Produto real, em produção.
