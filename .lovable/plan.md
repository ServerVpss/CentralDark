# Plano — destravar deploy do `abacus-router` no HUB

## Diagnóstico

- Rodando `echo $HUB_SUPABASE_PAT` no shell da VPS volta vazio → o token existe num arquivo `secrets/` do repo, mas nunca é carregado como variável de ambiente da sessão.
- Por isso o `supabase functions deploy` reclama "Access token not provided".
- O script antigo `deploy-abacus-router.sh` tenta ler via `eval printf` com truque de string, e quebra na linha 29 com `workflow: command not found` — bug de aspas.
- Enquanto isso, a edge `abacus-router` no HUB responde `503 BOOT_ERROR`, então o painel Status do HUB fica mostrando o aviso discreto (UI **não quebra** — o tratamento já está funcionando).

## O que vou fazer (quando entrar em build mode)

1. **Reescrever `apps/modulos/hub/scripts/deploy-abacus-router.sh`** para:
   - Procurar o token em ordem: `$HUB_SUPABASE_PAT` do ambiente → arquivo `apps/modulos/hub/secrets/hub.env` → `apps/modulos/hub/secrets/.env` → `/root/CentralDark/secrets/hub.env`.
   - Carregar com `set -a; . "$arquivo"; set +a` (sem `eval` maluco).
   - Validar tamanho do token e do `HUB_SUPABASE_DB_URL` antes de seguir.
   - Rodar migration (`psql`) + `supabase functions deploy` + smoke test em `/status`.
   - Mensagens claras de cada passo (✅/⚠️/❌).

2. **Criar `apps/modulos/hub/scripts/carregar-env.sh`** — helper reutilizável que só carrega os secrets do HUB de forma padronizada (pra outros scripts do módulo usarem também).

3. **Rodar o deploy corrigido pela VPS** via `execute_command`, checando:
   - Migration `abacus_logs` aplicada.
   - Edge `abacus-router` deploiada.
   - `GET /abacus-router/status` retorna 200 com JSON.

4. **Confirmar o resultado no painel Lovable** — abrir o preview e ver o AbacusTab mostrando "ativo" em vez do aviso amarelo.

## Fora do escopo

- Não vou tocar em nenhum outro módulo/pasta da VPS.
- Não vou mudar a UI do painel (já está com o tratamento discreto que você pediu).
- Não vou expor o valor do PAT em nenhum log.

## Confirma que posso seguir?

Se topar, entro em build mode, corrijo o script, rodo o deploy e te devolvo o placar 🟢/🟡/🔴 do `/status`.
