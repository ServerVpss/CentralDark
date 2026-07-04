# Plano — Frontend HUB v2 (Modo Arsenal)

Lovable = só gera. GitHub + VPS = destino final. Zero backend criado aqui.

## Escopo (2 entregas)

### 1. Aba Conectores — polimento final
- Trocar `alert()` / `prompt()` por **toast** (sonner) e **Dialog** shadcn (colar API key com input mascarado)
- **Skeleton** no loading em vez de texto
- **Empty state** quando não vier provider nenhum
- Badge de tier (1/2/3) no canto do card
- Confirmar bypass dev (`user_id: dev-pivete`) + hook pronto pro `user.id` real quando login existir

### 2. Página de Login `/login` — só UI
- Layout split: lado esquerdo hero com logo CentralDark + gradient emerald radial, lado direito form
- Campos: email + senha, botão **Entrar com Google**, link "esqueci senha"
- Fonte Geist, cards `.card-premium`, botão `.gradient-emerald`
- **Sem lógica de auth** — apenas `onSubmit` stub que chama uma função `signIn()` exportada de `hooks/useAuth.ts` (já existe, só lê sessão hoje)
- Rota adicionada no `App.tsx` do HUB via `react-router` (se não tiver, adiciono minimal)

## Fora de escopo (fica pra VPS/HUB)
- Endpoint `POST /api/keys/store` no broker
- Configuração OAuth Google no Supabase HUB
- Tabelas `oauth_providers` / `oauth_connections`
- Edge Function `get-token`

## Entrega
Ao terminar: código commitado pelo sync automático Lovable→GitHub. A partir daí VPS puxa via webhook (fluxo padrão CentralDark). Aviso final: "🚀 frontend pronto, VPS já pode puxar do GitHub".

## Detalhes técnicos
- Arquivos tocados:
  - `apps/modulos/hub/src/components/connectors/OAuthConnectors.tsx` (dialog + toast + skeleton)
  - `apps/modulos/hub/src/components/connectors/ApiKeyDialog.tsx` (novo)
  - `apps/modulos/hub/src/pages/LoginPage.tsx` (novo)
  - `apps/modulos/hub/src/App.tsx` (rota `/login`)
- Dependências: `sonner` e `react-router-dom` já presentes no monorepo — reuso, sem instalar nada novo se possível.
