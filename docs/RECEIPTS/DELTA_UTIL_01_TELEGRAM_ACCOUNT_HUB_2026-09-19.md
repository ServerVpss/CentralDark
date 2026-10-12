# DELTA ÚTIL 01 — Telegram Account Hub

## Intenção

Levar ao @srver1bot a superfície de contas/autenticação já pertencente ao Hub CentralDark, sem criar segundo broker, segundo bot ou segundo cérebro.

## Owner reutilizado

- Telegram: apps/bot-telegram/unified-bot.cjs
- OAuth/credenciais: apps/modulos/oauth-broker/server.mjs
- Storage: oauth_providers + oauth_connections
- Adapter de projeção: apps/bot-telegram/services/account-hub.cjs

## Delta

1. Painel ganha o botão Contas & Auth.
2. Telegram consulta o OAuth Broker interno e mostra estado humano + termo técnico.
3. Lista múltiplas contas já registradas por provider.
4. Reusa o OAuth existente para GitHub, Notion, Drive e Gmail.
5. Testa conexões pelo endpoint já existente.
6. Material de autenticação não é projetado no Telegram.
7. Claude e Codex aparecem no mesmo Hub sem declarar OAuth inexistente.

## Limite honesto

- Claude failover automático e fallback Free: NOT_EXECUTED neste delta.
- Codex OAuth: UNKNOWN até medir o fluxo realmente suportado pelo runtime.
- Broker ativo em produção precisa ser medido no micro-deploy.

## Gates

- node --check apps/bot-telegram/unified-bot.cjs
- node --check apps/bot-telegram/services/account-hub.cjs
- node --test apps/bot-telegram/services/account-hub.test.mjs
- git diff --check
- UNKNOWN != PASS
- MERGED != DEPLOYED

## Promoção

PR_MOTHER=#1562
SUB-PR -> same-head gates -> squash main -> micro-deploy causal -> remedição.


## Prova executada na VPS em worktree isolado

BASE_MAIN=b5b71b520be2742ec3b1f372725d9e798f751570

- node --check unified-bot.cjs = PASS
- node --check account-hub.cjs = PASS
- account-hub.test.mjs = 3/3 PASS
- hub-adm.personal-context.test.mjs = 2/2 PASS
- git diff --check = PASS
- scripts/trigger-fabric/verify_repo_contract.py = PASS
- REPO_CONTRACT_VERIFY=PASS

Estado runtime antes do micro-deploy:
- CentralDark-HubBot = ONLINE
- OAuth Broker 127.0.0.1:8098 = NOT_RUNNING
- MICRO_DEPLOY = NOT_YET
- MERGED = NOT_YET

A VPS principal permanece detached/dirty; nenhum reset/clean foi executado.

## Evolução 01-B — pool de contas Claude no mesmo artefato

O adapter ganhou planejamento determinístico de failover sem abrir segundo router:

- evita repetir conta já tentada no mesmo request (visitedIds);
- escolhe somente conexão 🟢 Conectado e testado;
- AUTH_EXPIRED, UNAUTHORIZED, ACCOUNT_DISABLED e indisponibilidade temporária podem seguir para próxima conta saudável;
- LIMIT_REACHED fica BLOCKED_POLICY por padrão;
- limite só pode trocar conta quando o provider/política declarar explicitamente providerAllowsLimitFailover=true;
- fallback Free só aparece quando freeTierAvailable=true;
- token, cookie e material de sessão continuam fora do Telegram.

### Limite atual desta evolução

POOL_SELECTION_LOGIC = IMPLEMENTED + UNIT_TESTED

CLAUDE_CREDENTIAL_HOT_SWAP_RUNTIME = NOT_EXECUTED

CLAUDE_OFFICIAL_LOGIN_FLOW = MUST_BE_MEASURED

FREE_TIER_RUNTIME_ROUTE = NOT_EXECUTED

Portanto o painel pode explicar e planejar a próxima conta, mas ainda não declara troca real de credencial em produção.

## T1 — 2026-10-11: Runtime permanente, broker único (sem segredos)

- **INTENÇÃO:** corrigir o owner existente `apps/modulos/oauth-broker/server.mjs` persistentemente, sem Hub/MCP duplicado.
- **MEDIÇÃO VPS:** MCP `:9100/health` HTTP 200; OAuth Broker `:8098` recusava; app PM2 antigo não encontrado em processo/dump, executável PM2 ausente, unidade systemd OAuth não existia; `express` e `dotenv` não resolviam. `HUB_SUPABASE_URL` e `HUB_SUPABASE_SERVICE_ROLE_KEY` estavam presentes no intake autorizado do SHARED.zip (somente nomes observados pelo Hermes), `VAULT_MASTER_KEY` ausente nas fontes escopadas. Checkout VPS dirty/atrás; nenhum reset.
- **DELTA DE CÓDIGO MAIN:** dependências exatas + package-lock do broker, com 151 pacotes e `npm ci --dry-run=PASS`; preflight `check-config.mjs` sem valores de segredos; unidade persistente `scripts/vps/systemd/centraldark-oauth-broker.service`, instalador idempotente `scripts/vps/install-oauth-broker-runtime.sh`; microdeploy e pulso atualizados para reutilizar o novo supervisor nativo após o runtime estar ativo. O pulso nunca marca deploy se serviço estiver inativo.
- **PROVAS PRÉ-COMMIT:** `bash -n=PASS`, `node --check=PASS`, `systemd-analyze verify` sem erros de sintaxe, `npm ci --dry-run=PASS`, preflight recusa valores ausentes e aceita fixture somente no teste. Não houve impressão de tokens nem criação de `.env` no checkout.
- **REGRA DO COFRE:** não inventar `VAULT_MASTER_KEY`: recuperar do owner autorizado; não substituí-la se `oauth_connections` possuir dados cifrados com chave anterior. `/etc/centraldark/oauth-broker.env` root-only, modo 0600, fora de Git.
- **LIMITES:** `CODE_PERSISTED_MAIN=PASS` apenas após readback/commit; `VPS_UNIT_INSTALLED=UNKNOWN`; `OAUTH_BROKER_HEALTH=UNKNOWN` até implantação; `GOOGLE_DRIVE_AUTH=UNKNOWN`; `GOOGLE_DRIVE_READBACK=UNKNOWN`. Admin principal `admin.centralldark.com` e broker local são superfícies diferentes.
- **NEXT_CURSOR:** reconcile o checkout dirty sem reset; materialize apenas arquivos do owner via fonte/versionamento; ative unidade somente após intake da chave válida; comprove `systemctl is-enabled/is-active`, PID, `127.0.0.1:8098/health`, restart e teste Google consentido com readback de arquivo. Registre no mesmo Goal Hermes `t_76927269` e preserve os 7 Oracle drifts separados.
