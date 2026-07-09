# 🚀 Deploy + teste do `abacus-router` (HUB Supabase)

## Contexto
- Edge function já existe no repo: `apps/modulos/hub/supabase/functions/abacus-router/`
- Migrações prontas: `abacus_logs` + `abacus_config` (cofre da chave)
- Script pronto: `apps/modulos/hub/scripts/deploy-abacus-router.sh` (roda migration + `supabase functions deploy` + smoke test `/status`)
- HUB alvo: projeto `lyoigsqluyktoclwdaft` (fora do Lovable atual — a regra "não mexer no Supabase do Lovable" continua respeitada)
- MCP CentralDark hoje: **401** — sem ele não roda o script direto na VPS

## Passos

1. **Desbloqueio (usuário):** reconectar `mcp_custom_A1pyZ` em Settings → Integrations → Reconnect.
2. **Diagnóstico rápido na VPS (só leitura):**
   - `supabase --version` (CLI presente?)
   - `env | grep -E 'HUB_SUPABASE_(PAT|DB_URL|PROJECT_REF)'` só via script `carregar-env.sh` (não expor valores)
   - `supabase functions list --project-ref lyoigsqluyktoclwdaft` — confirma se `abacus-router` já está publicada ou não
3. **Rodar migrações + deploy:**
   `bash apps/modulos/hub/scripts/deploy-abacus-router.sh`
   Isso já faz: migration `abacus_logs` + `abacus_config` → deploy edge → smoke `/status`.
4. **Configurar chave Abacus** (só se `keyConfigured=false` no `/status`):
   - Precisa da chave real. Duas opções:
     - (a) Pivete cola em `add_secret` como `ABACUS_API_KEY` (guarda no HUB) e a edge lê `Deno.env.get`.
     - (b) Pivete manda por chat 1x e eu chamo `POST /abacus-router/set-key` (grava criptografado em `public.abacus_config`).
   - Preferência: **(b)** — segue o design do cofre já existente no repo.
5. **Testes E2E via curl:**
   - `GET /functions/v1/abacus-router/status` → esperado 200 + `keyConfigured:true` + endpoints saudáveis
   - `GET /functions/v1/abacus-router/models` → lista de modelos
   - `POST /functions/v1/abacus-router/v1/chat/completions` com `{"model":"...","messages":[{"role":"user","content":"ping"}]}` → resposta 200
   - `GET /functions/v1/abacus-router/logs?limit=5` → linha do teste acima registrada
6. **Bind do domínio `api.centralldark.com`:**
   - Verificar Caddy da VPS (`infra/caddy/`) — hoje quem responde `api.centralldark.com/v1/models`? Precisa proxyar `/v1/*` pra `https://lyoigsqluyktoclwdaft.supabase.co/functions/v1/abacus-router/v1/*` (ou apontar direto DNS via CNAME + custom domain do Supabase).
   - Se ainda não existir vhost, adicionar bloco no Caddyfile + reload.
   - Teste final: `curl -H "Authorization: Bearer <token-usuário>" https://api.centralldark.com/v1/models` → 200 + JSON de modelos.
7. **Registro:**
   - Fechar pendência #53 (`api.centralldark.com — router Abacus`) via `pendencias_close`.
   - Card Hermes no `@srver1bot` com evidência (status HTTP + primeira linha do JSON).
   - Commit em branch `feat/abacus-router-deploy` + PR — nada direto na `main`.

## Regras respeitadas
- 🔒 Sem tocar no Supabase do Lovable atual — tudo no HUB `lyoigsqluyktoclwdaft`.
- 🔒 Sem edição direta na VPS que não venha do repo — script já versionado.
- 🔒 Sem `git push` na main; branch + PR.
- 🔒 Sem expor chave — `set-key` via edge (service_role), nunca em log.

## Perguntas pra ti antes de eu executar
1. Já reconectou o MCP CentralDark? (sem isso paro no passo 1)
2. Tens a **chave Abacus real** em mãos, ou preciso te mandar link do `abacus.ai` pra gerar?
3. `api.centralldark.com` → prefere **Caddy proxyando** pro HUB (mais simples, mantém domínio nosso) ou **custom domain nativo do Supabase** (mais limpo, mas exige configuração DNS extra)?
