## Resumo em uma linha
O MCP tá tentando logar no GitHub por engano. A gente arranca o GitHub fora e coloca o **OAuth próprio do MCP** — que já existe parcialmente na VPS — bem configurado, dando **acesso total pro dono (você)** e travando pra todo o resto.

---

## O que tá errado hoje (confirmado pela URL do erro)

O ChatGPT abriu isso:
```
https://github.com/login/oauth/authorize
  ?client_id=__MISSING_GITHUB_CLIENT_ID__
  &redirect_uri=__MISSING_GITHUB_OAUTH_CALLBACK__
  &scope=repo+workflow+read:org
```

Dois problemas:
1. O MCP tá redirecionando pro **GitHub** como se fosse a "porta de entrada". Errado — o MCP é seu, autentica com o **próprio OAuth server** dele.
2. As duas variáveis (`GITHUB_CLIENT_ID` / `GITHUB_OAUTH_CALLBACK`) vieram literalmente vazias (`__MISSING_...__`), ou seja: o código tá substituindo placeholder sem valor. Sinal de que esse trecho é lixo antigo que sobrou de uma tentativa abandonada.

---

## Modelo escolhido (o que vai ficar rodando)

**OAuth próprio do MCP, hospedado 100% na sua VPS**, dono = acesso total, ninguém mais entra.

| Peça | Onde vive | O que faz |
|---|---|---|
| `mcp.centralldark.com/.well-known/oauth-authorization-server` | VPS (MCP) | Metadata que o ChatGPT/Claude leem pra descobrir o fluxo |
| `mcp.centralldark.com/authorize` | VPS (MCP) | Recebe o ChatGPT, mostra sua telinha de aprovação |
| `mcp.centralldark.com/consent` | VPS (MCP) | Tela "Aprovar / Negar" — só você (admin) vê e clica |
| `mcp.centralldark.com/token` | VPS (MCP) | Troca o code por access token + refresh token |
| `mcp.centralldark.com/register` | VPS (MCP) | Dynamic Client Registration (ChatGPT se cadastra sozinho) |
| Tabela `oauth_clients` + `oauth_tokens` | **HUB Supabase (VPS)** — `lyoigsqluyktoclwdaft` | Salva clientes registrados e tokens emitidos (cifrado AES-256-GCM) |
| Middleware `Authorization: Bearer <token>` | VPS (MCP) | Valida token em toda chamada de tool |

**Regra de acesso:** o `sub` do token = seu Telegram admin ID (`1901426549`). Só esse `sub` recebe escopo `admin` (tudo liberado: `read`, `write`, `admin`, `shell`). Qualquer outra tentativa de registro é negada no `/consent`.

---

## Passo a passo da execução (na VPS, via DarkAI/SSH)

### Passo 1 — Diagnóstico (10 min)
- `pm2 logs CentralDark-MCP --lines 200` — ver de onde tá saindo o redirect pro GitHub.
- `grep -rn "GITHUB_CLIENT_ID\|github.com/login/oauth" /root/CentralDark/apps/modulos/mcp/` — achar o código lixo.
- Ler `/root/CentralDark/apps/modulos/mcp/dist/` (o `src/` tá travado, já sei) pra confirmar se o OAuth próprio já existe parcialmente (a auditoria disse que sim: PKCE S256 + DCR ok).

### Passo 2 — Arrancar o GitHub fora (5 min)
- Deletar/comentar toda rota que aponta pra `github.com/login/oauth`.
- Remover `GITHUB_CLIENT_ID` / `GITHUB_OAUTH_CALLBACK` do `.env` do MCP (não são mais necessários).

### Passo 3 — Terminar o OAuth próprio (30-40 min)
Baseando no que a auditoria já mapeou como pronto:
- **Discovery**: publicar `/.well-known/oauth-authorization-server` com `authorization_endpoint`, `token_endpoint`, `registration_endpoint`, `code_challenge_methods_supported: ["S256"]`, `scopes_supported: ["read","write","admin","shell"]`.
- **`/authorize`**: valida PKCE, gera authorization_code, redireciona pra `/consent?code=...`.
- **`/consent`**: telinha simples (HTML puro, tema esmeralda CentralDark) que mostra "ChatGPT quer conectar como Admin — Aprovar/Negar". Só aprova se o cookie de sessão bater com admin. Se não tiver sessão, joga pro login do admin (Telegram OTP via `@srver1bot`, que já roda).
- **`/token`**: troca code por `access_token` (JWT HS256, TTL 30 min) + `refresh_token` (opaco, TTL 7 dias, **com rotation** — que era P0 da auditoria).
- **`/register`** (DCR): aceita o payload do ChatGPT e salva em `oauth_clients` no HUB. Auto-aprova se o `redirect_uri` for de domínio conhecido (chat.openai.com, claude.ai, cursor.sh).

### Passo 4 — Middleware de validação (10 min)
Em toda rota `/tools/*` e `/mcp/*`:
```
Authorization: Bearer <jwt>
```
- Verifica assinatura HS256 com secret do HUB.
- Extrai `sub` + `scope`.
- Se `sub == "1901426549"` E `scope contém "admin"` → passa tudo. Senão → 403.

### Passo 5 — Migração das tabelas no HUB (5 min)
Criar no HUB Supabase (`lyoigsqluyktoclwdaft`):
- `oauth_clients` (id, name, redirect_uris[], created_at, approved_by_admin)
- `oauth_authorization_codes` (code, client_id, code_challenge, expires_at, used)
- `oauth_tokens` (jti, sub, scope, client_id, issued_at, expires_at, refresh_token_hash, rotated_from)
- RLS: tudo `service_role`-only. Zero acesso `anon` ou `authenticated`.

### Passo 6 — Teste real (5 min)
1. Reiniciar MCP: `pm2 restart CentralDark-MCP && pm2 save`.
2. Abrir no ChatGPT: "Adicionar MCP" → colar `https://mcp.centralldark.com`.
3. Verificar 3 requisições (com curl + logs):
   - `GET /.well-known/oauth-authorization-server` → 200
   - `POST /register` → 201
   - `GET /authorize?...` → redirect pro `/consent` → você aprova → redirect de volta pro ChatGPT com `code`
   - `POST /token` → 200 com `access_token`
   - `POST /mcp` (listTools) com `Authorization: Bearer` → 200 com lista de tools
4. Print/log de cada passo pra você validar.

### Passo 7 — Notificação (Card Hermes v1.3)
Ao terminar, mandar card no privado admin via connector Telegram `sendMessage`, no formato padrão travado.

---

## O que eu **não** vou fazer
- ❌ Nada de Supabase Lovable atual (tá travado pra migration/edge).
- ❌ Nada de tocar em áreas 🔒 (bot, status, HERMES-CORE, etc.).
- ❌ Nada de guardar tokens/keys fora do HUB.
- ❌ Nada de expor sua identidade (só "Pivete").

---

## Última coisa antes de executar
Pra eu rodar isso preciso do **modo build** liberado (aqui em plan mode não consigo SSH/DarkAI/edit).

**Quando você aprovar esse plano**, eu começo pelo Passo 1 (diagnóstico) e volto com os logs pra confirmar o que exatamente tá causando o redirect pro GitHub antes de arrancar. Aprovado?