
## O que vou fazer

Adicionar na rota `/ponte-mcp` um bloco **"Conectar via OAuth"** com dois botões. Cada botão abre uma janela popup, o usuário loga uma vez no provedor (GitHub ou OpenAI), e ao terminar:

1. Uma chave `pk_...` é gerada automaticamente no banco (vinculada ao provider + conta logada).
2. O MCP CentralDark na VPS (porta 9100) recebe a sessão injetada — IA externa (Cline, Cursor, Claude Desktop) passa a conectar sem copy-paste.
3. O painel mostra "✅ Conectado como @usuario" + botão "Copiar URL do MCP" pronta pra colar.

A infra do **GitHub OAuth já existe e tá funcionando** (README do instalador confirma: *"ChatGPT conectado via OAuth GitHub (provisório)"*). Vou só plugar o botão do painel nesse fluxo. O **OpenAI Codex** é caminho novo e mais chato (exige registrar app no painel da OpenAI), por isso entra em fase separada.

## Fases

```text
┌─────────────────────────────────────────────────────────┐
│ FASE 1 — GitHub OAuth (entrega imediata)                │
├─────────────────────────────────────────────────────────┤
│ • Botão "Entrar com GitHub" no /ponte-mcp               │
│ • Edge function ponte-mcp-oauth-github inicia OAuth     │
│ • Callback registra pk_ no banco + injeta no MCP VPS    │
│ • Card "✅ Conectado" com URL pronta pra Cline          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ FASE 2 — OpenAI Codex (depois que GitHub tá no ar)      │
├─────────────────────────────────────────────────────────┤
│ • Cadastro de OAuth App no painel da OpenAI             │
│ • Secrets OPENAI_CLIENT_ID + OPENAI_CLIENT_SECRET       │
│ • Botão "Entrar com OpenAI" + edge function espelho     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ MEMÓRIA + BOAS-VINDAS (do mesmo commit da Fase 1)       │
├─────────────────────────────────────────────────────────┤
│ • mem://features/auth/painel-oauth-conectar (novo)      │
│ • Atualizar mem://index.md                              │
│ • Card "👋 Boas-vindas" no topo do /ponte-mcp           │
│ • docs/INSTALADOR/14-conectar-ia-externa.md atualizado  │
└─────────────────────────────────────────────────────────┘
```

## Fluxo visual do botão (Fase 1)

```text
[/ponte-mcp]                                    [popup]
┌──────────────────────────┐       click       ┌──────────────────────┐
│ 👋 Boas-vindas           │  ───────────►     │ github.com/login     │
│                          │                   │ Autorizar CentralDark│
│ 🔌 Conectar IA externa   │                   │      [Authorize]     │
│ ┌──────────────────────┐ │                   └──────┬───────────────┘
│ │ [GitHub]  [OpenAI]   │ │                          │
│ └──────────────────────┘ │                          ↓ callback
│                          │                ┌──────────────────────┐
│ Conexões ativas:         │  ◄──────────── │ edge function:       │
│ ✅ @segredounlock         │   postMessage  │ 1. troca code→token  │
│   pk_aB12…XyZ9 📋        │                │ 2. cria pk_ no banco │
│   [Revogar]              │                │ 3. POST set-token na │
└──────────────────────────┘                │    VPS (porta 9100)  │
                                            └──────────────────────┘
```

## Arquivos que vou criar/mudar (Fase 1)

| Arquivo | Tipo | O que faz |
|---|---|---|
| `supabase/functions/ponte-mcp-oauth-github/index.ts` | novo | Inicia OAuth (`?action=start`) e processa callback (`?action=callback&code=…`) |
| `src/pages/PonteMCP.tsx` (ou componente da rota) | edita | Adiciona seção "Conectar IA externa" com 2 botões + lista de conexões ativas |
| `src/components/ponte-mcp/BotaoOAuth.tsx` | novo | Componente que abre popup, escuta `postMessage`, mostra estado (logando/conectado/erro) |
| `src/components/ponte-mcp/CardBoasVindas.tsx` | novo | Card explicando em linguagem leiga o que o painel faz + link pro tutorial |
| `supabase/migrations/<timestamp>_ponte_mcp_oauth_provider.sql` | novo | Adiciona coluna `provider` ('github'/'openai') + `external_user_id` + `external_username` em `ponte_mcp_chaves` |
| `docs/INSTALADOR/14-conectar-ia-externa.md` | edita | Documenta o botão novo + URL do MCP pra Cline |
| `mem://features/auth/painel-oauth-conectar` | novo | Memória do fluxo OAuth → MCP VPS |
| `mem://index.md` | edita | Adiciona referência da memória nova |

## Detalhes técnicos

**Edge function `ponte-mcp-oauth-github`:**
- `?action=start` → redireciona pra `https://github.com/login/oauth/authorize` usando `GITHUB_CLIENT_ID` (secret já existe). Scope: `read:user` (o suficiente pra identificar quem é).
- `?action=callback&code=…` → troca code por access_token via `GITHUB_CLIENT_SECRET`, busca `/user`, gera `pk_<random32>`, INSERT em `ponte_mcp_chaves` com `provider='github'` + `external_username='@login'`, e dispara `POST https://mcp.centralldark.com/set-token` com a `pk_` (endpoint admin protegido por `MCP_TOKEN`). Retorna HTML que faz `window.opener.postMessage({ok, pk_prefix, username}, origin)` e fecha.
- `verify_jwt = false` (callback público é exigência do OAuth).

**Migração:**
```sql
ALTER TABLE public.ponte_mcp_chaves
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'manual',
  ADD COLUMN IF NOT EXISTS external_user_id text,
  ADD COLUMN IF NOT EXISTS external_username text;
```
(Sem novos GRANTs — tabela já existe e já tem políticas.)

**Segurança:**
- `state` aleatório no OAuth pra prevenir CSRF (guardado em cookie httpOnly de 5min).
- Callback valida `state` antes de gravar.
- A `pk_` só aparece pro usuário 1 vez (no card pós-login); depois fica só o prefixo no banco.
- Endpoint `/set-token` da VPS exige header `Authorization: Bearer $MCP_TOKEN` (já existe).

**Por que NÃO faço OpenAI agora:**
A OpenAI exige cadastrar a aplicação no painel deles (`platform.openai.com/apps`), aprovar redirect URIs e gerar `OPENAI_CLIENT_ID`/`OPENAI_CLIENT_SECRET`. Esse cadastro precisa de ação tua no navegador da OpenAI — não dá pra fazer 100% pelo Lovable. Por isso entrego GitHub primeiro (que já tá todo configurado), e na Fase 2 te guio passo a passo no cadastro OpenAI e plugo o segundo botão.

## Validação ao terminar (Fase 1)

1. Build do front passa sem erro.
2. Clico no botão "Entrar com GitHub" no preview → popup abre no github.com.
3. Autorizo → popup fecha sozinho.
4. Card "✅ Conectado como @segredounlock" aparece com a `pk_`.
5. `curl -H "x-mcp-session: pk_..." https://mcp.centralldark.com/health` → 200.
6. Cline configurado com essa URL conecta sem precisar editar `cline_mcp_settings.json` manualmente.

Quando aprovar, executo a Fase 1 inteira num commit só (front + edge function + migração + doc + memória), valido os 6 passos, e te aviso pra testarmos juntos o popup. Depois disso a gente decide se parte pra Fase 2 (OpenAI) ou se outras pendências têm prioridade.
