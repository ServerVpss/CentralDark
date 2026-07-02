## Objetivo
Fechar a migração pro Supabase `lyoig` com validação prévia (dry-run), carga das tabelas pesadas que faltam e apontar as 50 Edge Functions pro destino novo — sem downtime.

## Etapa 1 — Dry-run (validação antes de escrever)
Rodar um script read-only que compara origem (`kagejpghnwdfymddwxuf`) x destino (`lyoigsqluyktoclwdaft`) e gera um relatório em `/mnt/documents/dryrun-fase3.md` com:

- **Contagem por tabela** (origem vs destino) das 5 pesadas + `user_roles` + `telegram_users`.
- **Colisões de PK/UNIQUE** já existentes no destino (linhas que dariam conflito no INSERT).
- **FKs órfãs** — linhas de origem cujo `user_id` / `bot_id` / `telegram_user_id` não existem no destino após o remapeamento admin.
- **Diff de políticas RLS** (nome + comando) por tabela.
- **Estimativa de tamanho** (MB) por tabela pra confirmar que cabe no plano do destino.

Nenhum INSERT/UPDATE nessa etapa. Só SELECT + relatório. Você valida antes de liberar a Etapa 2.

## Etapa 2 — Carga das tabelas pesadas (após aprovação do dry-run)
Ordem respeitando FKs, com estratégia por tabela:

1. `telegram_user_terms` — INSERT ... ON CONFLICT DO NOTHING (leve, base pras outras).
2. `telegram_subscriptions` — mesma estratégia, chaveado por `telegram_user_id`.
3. `pix_transactions` — COPY em lote de 5k linhas, ON CONFLICT no `txid`.
4. `query_history` — **filtro aplicado**: só linhas com `status='success'` E `created_at >= now() - interval '90 days'` (consultas úteis/recentes). Descarta histórico velho e falhas.
5. `telegram_messages` — **pulado**. Conforme você pediu, mensagens antigas do painel não migram.

Cada tabela: transação isolada, log de linhas inseridas/puladas/erros em `/mnt/documents/carga-fase3.log`. `ON_ERROR_STOP=1` (nada de silenciar erro como da última vez).

## Etapa 3 — Switch das Edge Functions (50 funções)
Enxame paralelo (sub-agentes) faz o trabalho em 3 lotes:

- **Auditor**: varre `supabase/functions/*/index.ts` e lista quais usam `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_ANON_KEY` diretamente.
- **Executor**: troca essas refs pelos secrets `HUB_SUPABASE_URL` / `HUB_SUPABASE_SERVICE_ROLE_KEY` / `HUB_SUPABASE_PUBLISHABLE_KEY` (já configurados).
- **Validador**: deploya as funções alteradas e roda `curl` de smoke test em cada uma (endpoints que não exigem payload sensível).

Funções críticas (`migrar-auth-users`, webhooks Telegram, PIX) ficam por último e são validadas manualmente antes do flip.

## Etapa 4 — Flip do frontend
Atualiza `.env` do projeto (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) apontando pro `lyoig`. Rebuild automático da preview. Bot Telegram continua rodando durante a troca (webhook já está no destino via HUB_*).

## Etapa 5 — Pós-flip
- Validação final: login admin, consulta de bot, painel carregando dados do destino.
- Relatório consolidado em `/mnt/documents/migracao-final.md` com contagens finais, tempo total, funções migradas.
- Origem `kagejpghnwdfymddwxuf` fica intacta como backup por 7 dias antes de qualquer cleanup.

## O que NÃO migra (confirmado)
- `telegram_messages` inteira (mensagens velhas do painel).
- `query_history` anterior a 90 dias ou com status ≠ success.
- `api_usage_logs`, `edge_function_health`, `audit_logs` antigos (já pulados na fase anterior).
- `processed_updates`, `paginated_results` (cache efêmero).

## Detalhes técnicos
- Dry-run e carga rodam via `psql` direto no `HUB_SUPABASE_DB_URL` + `SUPABASE_DB_URL` (origem), sem passar por edge function.
- Enxame de Edge Functions: 3 sub-agentes paralelos (`spawn_agent`), cada um com lote de ~17 funções.
- Rollback: se Etapa 4 falhar, reverter `.env` pro projeto original — dados no destino ficam, mas frontend volta a ler do antigo em 1 comando.

## Aprovação
Preciso do teu OK pra:
1. Rodar Etapa 1 (dry-run — zero risco, só leitura).
2. Depois, com o relatório em mãos, você libera Etapa 2+3+4 de uma vez.
