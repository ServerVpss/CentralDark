# Plano: Sistema híbrido OAuth + Token pra contas Supabase no HUB

## O que vai existir

1. **Tabela `hub.supabase_accounts`** no HUB — guarda cada conta conectada (label, e-mail, tipo `oauth`/`token`, access_token cifrado, refresh_token cifrado, expires_at, org_id opcional).
2. **Fluxo OAuth** — botão "Conectar via OAuth" leva pro Supabase, você loga na conta desejada, autoriza, volta pro app já salvando os tokens.
3. **Fluxo Token** — o modal atual continua funcionando (cola `sbp_...`), só que agora salva na mesma tabela unificada.
4. **Painel de contas** — lista todas conectadas, mostra tipo (🔗 OAuth / 🔑 Token), permite renomear, testar conexão, remover.

## Passos

### 1. Você cria o OAuth App no Supabase (1 vez só)
- Vai em `supabase.com/dashboard/org/_/oauth-apps` → New OAuth App
- Nome: "CentralDark Hub"
- Redirect URL: `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/supabase-oauth-callback`
- Salva o `client_id` e `client_secret` e me passa

### 2. Salvo os segredos no HUB
- `SUPABASE_OAUTH_CLIENT_ID`
- `SUPABASE_OAUTH_CLIENT_SECRET`

### 3. Migration no HUB — tabela `supabase_accounts`
Cifrada com `pgp_sym_encrypt` usando `VAULT_MASTER_KEY`. Campos: `id`, `label`, `account_email`, `method` (`oauth`|`token`), `access_token_encrypted`, `refresh_token_encrypted`, `expires_at`, `org_ids[]`, `created_at`, `last_used_at`.

### 4. Duas edge functions no HUB
- **`supabase-oauth-start`** — gera state, monta URL de authorize do Supabase, redireciona
- **`supabase-oauth-callback`** — recebe `code`, troca por tokens no `https://api.supabase.com/v1/oauth/token`, cifra e salva

### 5. Painel no frontend (Lovable atual)
- Botão "🔗 Conectar via OAuth" (novo) ao lado do "🔑 Adicionar via Token" (atual)
- Lista de contas conectadas com badges do tipo
- Ações: renomear, testar, remover
- Ao usar qualquer operação que precise de token, o painel escolhe a conta (dropdown)

### 6. Auto-renovação do OAuth
Edge function `supabase-token-refresh` roda quando `expires_at` tá perto do fim — usa o `refresh_token` pra renovar sem o usuário precisar logar de novo.

## O que muda pro usuário

- Continua podendo colar `sbp_...` normal
- **OU** clica "Conectar via OAuth", loga na conta Supabase desejada, autoriza, pronto
- Pode conectar N contas (principal, trabalho, cliente X...) e trocar entre elas
- Todas ficam salvas no HUB, cifradas, compartilhadas entre qualquer serviço que precisar

## Detalhes técnicos
- Endpoint de troca: `POST https://api.supabase.com/v1/oauth/token` com `grant_type=authorization_code` (docs: supabase.com/docs/guides/integrations/build-a-supabase-integration)
- Escopos padrão: `all` (leitura+escrita nas orgs autorizadas)
- Refresh token roda ~24h antes de expirar
- Cifra: `pgp_sym_encrypt(token, current_setting('app.vault_key'))` — mesma pattern do `vault_secrets` existente
- Nada de token em plain text nem em log
- Fallback: se OAuth falhar (Supabase fora do ar, etc), token colado sempre funciona
