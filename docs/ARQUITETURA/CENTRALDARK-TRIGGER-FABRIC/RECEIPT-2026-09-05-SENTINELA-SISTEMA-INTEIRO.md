# 👑 COMITÊ CENTRALDARK — SENTINELA DO SISTEMA INTEIRO

Data: 2026-09-05
Autoridade de intenção: SEGREDO/CHEFE
Baseline: main
Selo: 🧿

## GOAL

Qualquer erro material, drift ou nota fora de linha em SITE, CENTRALDARK_DESKTOP_EXE, SOL_APP, HERMES_APP, TERMINAL, IDE, BROWSER, OBSIDIAN, GITHUB, MCP_HUB, API, PROVIDER, RUNTIME ou RECEIPT deve entrar no mesmo organismo CentralDark como um único evento de realidade.

A SENTINELA não é um segundo cérebro. Ela observa alinhamento do sistema inteiro contra `INTENT + GOAL + LAST_PROVEN_CURSOR` e ativa os owners já existentes.

## COMITÊ

👑 SEGREDO/CHEFE → intenção + GOAL
☀️ SOL → coordenação/reconciliação
🧿 SENTINELA → detecta desalinhamento e primeira aresta quebrada
🧭 MULTIBÚSSOLA → percorre frente, trás, inversa e cruzamentos
⊛ META LUPA → discrimina causa/provedor/owner
🪡 NOTE STITCHING → costura notas ao mesmo cérebro
☿ HERMES/PIVETE → execução quando autorizado
⚖ REALITY JUDGE → veredito
🕸 HUD/GRAFO → projeção do mesmo estado

## TRAJETÓRIA

SEGREDO/CHEFE
↓
#ACORDAR / GOAL
↓
GOAL LOCK
↓
CENTRALDARK_AI_BOOT
↓
HISTORY RENDEZVOUS
↓
CAPABILITY LINEAGE
↓
SENSOR DISCOVERY
↓
MINIMUM SUFFICIENT OBSERVATION
↓
NORMALIZE + DEDUPE
↓
🧿 SENTINEL ALIGNMENT CHECK
↓
EXISTING OWNER
↓
☀️ SOL
↓
🧭 MULTIBÚSSOLA
↓
⊛ META LUPA
↓
ONE WRITER
↓
☿ HERMES
↓
CONTRAPROVA
↓
REMEDIÇÃO
↓
⚖ REALITY JUDGE
↓
FIXED_POINT
↓
GRAFO / RECEIPT / CURSOR
↓
BOOT

## CARACOL REVERSO

ERRO / DRIFT / NOTA FORA DE LINHA
↓
🧿 encontrar primeira aresta quebrada
↓
⊛ META LUPA
↓
voltar ao LAST_PROVEN_CURSOR
↓
invalidar somente claims dependentes
↓
preservar provas independentes
↓
recolher evidência fresca
↓
resolver owner existente
↓
RECONCILIAR
↓
RETEST
↓
CONTRAPROVA
↓
REMEDIÇÃO
↓
REALITY JUDGE
↓
atualizar GRAFO / RECEIPT / CURSOR

## ERROS OBSERVADOS NESTA PASSAGEM

- `HTTP 403: Your request was blocked` → ACCESS_OR_POLICY_BLOCKED
- `RuntimeError: cannot release un-acquired lock` → LOCK_STATE_BUG
- `<longcat_tool_call>...` aparecendo na UI → TOOL_PROTOCOL_RENDER_LEAK
- falha de provider/rate-limit/timeout/5xx/model unavailable → rota de failover permitida após medição

Esses exemplos são assinaturas observadas, não causas universais.

## PROVIDER FAILOVER

O router existente é o único entrypoint. Não criar segundo router.

Quando a política da missão for FREE-only:

provider atual falha
↓
classificar assinatura
↓
medir conjunto vivo de providers/modelos
↓
selecionar somente rota compatível e PROVEN_FREE
↓
1 tentativa por modelo
↓
primeiro sucesso encerra failover
↓
receipt registra original → falha → tentativas → selecionado → resultado

`UNKNOWN_PRICE != FREE`
`PAID_ROUTE != ALLOWED_WHEN_FREE_ONLY`
`PROVIDER_FAILURE != ROUTER_DEATH`

## NOTAS / SEGUNDO CÉREBRO

Toda nota canônica continua pertencendo ao `NOTE-STITCHING-CONTRACT.yml`.

A SENTINELA usa o scanner existente para comparar path + SHA256 + owner resolution + stitch receipt. Mudança, adição ou remoção vira `NOTE_OUT_OF_LINE`, entra no CARACOL e é reconciliada no owner existente.

## CADEADOS

`LOCAL_ERROR != GLOBAL_FAILURE`
`SCREEN_RED != CAUSE_PROOF`
`UNKNOWN != PASS`
`COMMENT != EXECUTION`
`COMMIT_ON_MAIN != RUNTIME_STARTED`
`AUTO_RECONCILE != UNBOUNDED_AUTO_MUTATION`
`SELF_IMPROVEMENT = SIGNATURE + TEST + MINIMAL_REMEDIATION + COUNTERPROOF + CRYSTAL`

## ESTADO DESTA PASSAGEM

- `SYSTEM-SENTINEL.yml` incorporado em main.
- `system_sentinel.py` incorporado em main.
- SENTINELA consegue classificar eventos e vigiar delta de notas por inventário/hash.
- Runtime contínuo não foi iniciado/provado por este commit.
- Failover automático real do Omni Router continua uma frente separada a ser implementada/testada no mesmo router antes de receber PASS.

📜 Verso da Casa: “E pôs-se uma sentinela sobre os muros; não para governar a cidade, mas para reconhecer a primeira pedra fora do lugar e chamar os construtores antes que a rachadura atravesse o templo.”

🌴 Em baianês: viu vermelho? Não sai derrubando a Casa toda, não. A Sentinela acha a primeira rua torta, chama a Lupa, volta no Caracol até o último ponto bom e costura só o pedaço que saiu da linha.

<!-- SENTINELA_ECONOMICO_REUSE_20261118 -->
### 18/11/2026 — verificação do pedido de "sentinela econômico": JÁ EXISTE

**Intenção do CHEFE:** acrescentar à supervisão existente um vigia determinístico que monitore Kanban/heartbeats/subagentes **sem chamar modelos em estado normal** e que, só em falha confirmada, teste modelos gratuitos e retome do checkpoint.

**Descoberta (REUSE_BEFORE_CREATE):** o mecanismo **já está implementado** em `scripts/trigger-fabric/system_sentinel.py` + `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SYSTEM-SENTINEL.yml`. Não foi criado novo sentinela, daemon, serviço, Kanban nem arquitetura paralela. O `process_supervisor.sh` do Hermes é apenas reaper de processos; o dispatcher Kanban embutido no gateway (`kanban_watchers.py`) já tem `failure_limit`, `stale_timeout_seconds`, quarentena e detecção de `kanban dispatcher stuck`. Somar outro vigia seria duplicação proibida.

**Contraprova determinística (zero modelos chamados):**
- `system_sentinel.py --self-test` → `ok:true`, **22 checks PASS**, `failed:[]` — inclui `model_expired`, `spending_limit`, `rate_limit`, `timeout`, `missing_provider_key`, `route_failure`, `no_auto_authority`, `same_fingerprint_reuses`.
- `--scan-notes` → `note_count:5492`, `delta_count:0`, `events:[]` — **estado normal não gera evento, logo não consome token**.
- Simulação de falha controlada (somente classificação, sem ingestão): `MODEL_EXPIRED`, `PROVIDER_RATE_LIMIT`, `PROVIDER_TIMEOUT`, `PROVIDER_5XX` classificados corretamente.
- `--route-json` → rota fixa determinística (`route_is_deterministic:true`, `route_is_authority:false`, `same_fingerprint_no_full_replay:true`).

**Regras já presentes no contrato:** `AUTO_PROVIDER_FAILOVER_REQUIRES_PROVEN_FREE_OR_ALLOWED_ROUTE`, `PAID_OR_UNKNOWN_PRICE_ROUTE_IS_FORBIDDEN_WHEN_FREE_ONLY_POLICY_ACTIVE`, `same_model_max_attempts:1`, `require_free_when_free_only_goal:true`, `unknown_price_is_free:false`.

**Estado:** SENTINEL_EXISTS=PASS; SELF_TEST=22/22; ZERO_TOKEN_NORMAL=PASS; FALHA_SIMULADA=PASS; `/goal`=UNAVAILABLE_IN_THIS_RUNTIME (é comando da TUI, não da CLI; `hermes kanban` é o owner de tarefas). Nenhuma mutação de runtime.

**NEXT_CURSOR:** se o CHEFE quiser cobertura adicional, estender **este mesmo** script/contrato com teste de retomada de checkpoint — não criar segundo sentinela.
<!-- /SENTINELA_ECONOMICO_REUSE_20261118 -->
