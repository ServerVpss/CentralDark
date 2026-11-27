---
name: Painel OAuth Conectar IA (Ponte MCP)
description: Botão "Entrar com GitHub" em /ponte-mcp que gera chave pk_ automaticamente via OAuth + injeta no MCP da VPS
type: feature
---

# Fluxo OAuth → Ponte MCP → VPS

## Componentes
- **Edge function** `supabase/functions/ponte-mcp-oauth-github/index.ts`
  - `?action=start` → redireciona pro GitHub OAuth (scope `read:user`, state em cookie httpOnly 5min)
  - `?action=callback` → troca code por token, busca `/user`, gera `pk_<48 chars>`, INSERT em `ponte_mcp_chaves` com `provider='github'`, dispara POST `MCP_SET_TOKEN_URL` (default `https://mcp.centralldark.com/set-token`) com `Authorization: Bearer $MCP_TOKEN`, devolve HTML com `postMessage` pro opener.
- **Front** `src/apps/modulos/telepainel/pages/ponte-mcp/`
  - `BotaoOAuth.tsx` — popup centralizado 600x720, listener `message` global, estados ocioso/aguardando/ok/erro
  - `CardConectarIA.tsx` — botões GitHub + OpenAI (placeholder), card pós-login com avatar/chave/URL MCP
  - `CardBoasVindas.tsx` — header explicativo
  - Integrados em `PonteMCP.tsx` acima da lista de chaves

## Schema
Tabela `ponte_mcp_chaves` ganhou:
- `provider text NOT NULL DEFAULT 'manual'` ('manual'|'github'|'openai')
- `external_user_id text`, `external_username text`, `external_avatar_url text`
- Índice único parcial: `(provider, external_user_id) WHERE external_user_id IS NOT NULL AND ativa = true` — impede 2 conexões ativas do mesmo GitHub user; ao logar de novo a edge function revoga a anterior antes de criar a nova.

## Secrets necessários (já existem)
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET` — OAuth App do GitHub
- `MCP_TOKEN` (ou `MCP_CENTRALDARK_TOKEN`) — autoriza POST `/set-token` no MCP da VPS
- Opcional: `MCP_SET_TOKEN_URL` se quiser sobrescrever o default

## Importante — registro do OAuth App
O **callback registrado no GitHub** deve ser exatamente:
`https://kagejpghnwdfymddwxuf.supabase.co/functions/v1/ponte-mcp-oauth-github?action=callback`
Se mudar, atualizar no painel do GitHub (Settings → Developer settings → OAuth Apps).

## Fase 2 (OpenAI) — pendente
Botão "Entrar com OpenAI" já existe desabilitado no front. Pra ativar:
1. Cadastrar app em `platform.openai.com/apps` e pegar client_id/secret
2. Adicionar secrets `OPENAI_CLIENT_ID` + `OPENAI_CLIENT_SECRET`
3. Criar edge function `ponte-mcp-oauth-openai` espelhando a do GitHub
4. Remover bloqueio em `BotaoOAuth.tsx` (linha `bloqueado = ... || provider === 'openai'`)

## Injeção VPS
Endpoint `POST /set-token` na porta 9100 do MCP CentralDark deve aceitar:
```
Authorization: Bearer $MCP_TOKEN
Body: { token: "pk_...", agente: "GitHub: @user" }
```
Se falhar (5s timeout), edge function ainda retorna sucesso — front mostra warning amarelo e usuário cola a chave manualmente.
