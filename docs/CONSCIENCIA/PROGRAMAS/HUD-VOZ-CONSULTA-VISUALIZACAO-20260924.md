# HUD VOZ → CONSULTA → VISUALIZAÇÃO — 2026-09-24

PR_MOTHER=#1562
PR_ROLE=CHILD_PROMOTION_PR
WRITER=SOL
WRITER_SCOPE=hud/voz-consulta-visualizacao-20260924
MAIN_BASE=2f3ef85b9ef415a610e58f7ace1ae9bd37ff5e0a
REALITY_IS_JUDGE=true
REUSE_BEFORE_CREATE=true
ONE_SYSTEM_ONLY=true
UNKNOWN != PASS

## Rumo

CHEFE fala → CentralDark consulta/executa pelos owners existentes → CHEFE ouve e visualiza o resultado.

## Owners reconciliados no main

- coração/saúde: `GET https://api.centralldark.com/heartbeat` em `apps/modulos/mcp/src/index.js`
- roteamento: `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py`
- trigger/receipt: `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml`
- entrada de artefatos Telegram/Hub/Drive: `apps/bot-telegram/skills/externas/artifact-ingest.cjs`
- cockpit: `src/paginas/admin-cockpit/PainelOps.tsx`
- status legado: `apps/modulos/status/painel-data.json`

## Delta desta caneta

### Cockpit fail-closed

O hero do `PainelOps` não pode mais afirmar `SISTEMA Rodando` por mock.
Ele mede `/heartbeat` a cada 15 s e classifica:

- `PASS`: HTTP OK + `self` explicitamente `alive|healthy|ok|pass`
- `FAIL`: `self` explicitamente `lost|down|failed|fail|error`
- `UNKNOWN`: timeout, erro, CORS, payload sem estado vivo explícito, `stale` ou qualquer ausência de prova suficiente

Isso preserva `UI_TRUNCATED != CONFIG_INVALID`, `UNKNOWN != PASS` e `REALITY_IS_JUDGE`.

## HUD consolidado da missão

1. Cabine de voz — conversa observada; integração canônica completa ainda UNKNOWN.
2. VPS — leitura/comando observado em sessão; saúde atual precisa remedição.
3. GitHub — main e contrato reconciliados.
4. Lovable — inventário total ainda pendente.
5. Instinto Superior — ligação real API/Hub/Telegram ainda pendente.
6. Rotinas determinísticas — converter apenas trechos provados.
7. Sentinela/S-beat — reutilizar Trigger Fabric + heartbeat; nenhum novo núcleo.
8. Provas/cadeados — receipts + hash + SAME_HEAD quando aplicável.
9. Status/notificações — verde apenas enquanto saúde atual estiver provada.
10. Builder — permanece dentro de admin/casca única.
11. Telegram + Hub MCP — reutilizar artifact-ingest e owners existentes.
12. VPS limpeza — somente após medição atual.
13. Cache/migração Lovable — preservar origem/dependências.
14. Dispositivo local — indisponível != desligado.
15. Voz Windows 11 — investigação permanece UNKNOWN.
16. Gravação — arquivo ainda não provado/localizado.
17. Registro definitivo — receipt volta ao PR-mãe #1562; PR-mãe não mergeia.

## Anti-regressão

DOCUMENTED != EXECUTED
ACTION != PROOF
MERGED != DEPLOYED
EXISTS != RUNNING
CURRENT > HISTORY
NO_NEW_SENTINEL_CORE=true
NO_SECOND_HEARTBEAT=true
NO_SECOND_ROUTER=true

## NEXT_CURSOR

1. validar build/lint do cockpit no mesmo HEAD
2. observar CI do filho
3. medir runtime atual de heartbeat/VPS
4. somente depois atualizar PASS/UNKNOWN no ledger #1562
