---
title: Receipt — CURRENT Kylin/Triton/Hermes + delegação bloqueada — 2026-10-06
date: 2026-10-06
status: PARTIAL_PASS_WITH_EXACT_BLOCKER
authority: SEGREDO/CHEFE
active_mother_pr: 1757
legacy_mother_pr: 1562
baseline_main_sha: 070671b19ba7011a882a32ef5fbbd5836a032316
---

# Receipt

## Fonte da verdade / âncoras

REPO=ServerVpss/CentralDark
MAIN=070671b19ba7011a882a32ef5fbbd5836a032316
ACTIVE_MOTHER=#1757 OPEN
LEGACY_MOTHER=#1562 CLOSED
CURRENT_OVER_HISTORY=true

## Provas CURRENT

### Triton

- 127.0.0.1:8000/v2/health/live=200
- 127.0.0.1:8000/v2/health/ready=200
- repository entries=30
- repository READY=21
- ensemble-embd_gte-base_uint8-text=READY
- embd_gte-base_uint8-text=READY
- embedding dimensionality=768

### Kylin runtime

- kylin-ai-runtime=RUNNING
- genai-nlp.sock=LISTEN
- libkysdk-genai-nlp.so.1=PRESENT

### Bridge owner

Antes:
- 18435 listener PID=1119123
- process=orphan /root/.hermes/kylin_openai_bridge.py
- centraldark-kylin-native-bridge.service=auto-restart
- restart counter >38000

Ação executada: TERM orphan PID 1119123.

Depois:
- 18435 listener PID=3532686
- centraldark-kylin-native-bridge.service=active
- owner conflict=REMEDIATED

### Binding / NLP

Readback atual:
- cloud.nlp.currentModel=""
- ondevice.nlp.currentModel=""
- local-nlp-model-add-order=[]

Teste de recuperação:
- set de kylin-qwen-plus feito através do D-Bus da sessão;
- readback imediato confirmou o valor;
- depois da tentativa de init, o binding voltou a vazio.

Direct native probes:
- CENTRALDARK_LOCAL_MODEL=kylin-qwen-plus => INIT_FAILED:10
- CENTRALDARK_LOCAL_MODEL=kylin-deepseek-r1 => INIT_FAILED:10

CURRENT_KYLIN_NATIVE_CHAT=FAIL
EXACT_RUNTIME_ERROR=INIT_FAILED:10
ERROR_10_SEMANTICS=UNKNOWN

### Hermes

Prova anterior desta sessão em chat novo:
- terminal tool invocation=PASS
- create/read /tmp/hermes-local-agentic-test.txt=PASS
- TOOL_CALL=PASS
- STDOUT=PASS

Tentativa de delegação atual:
- delegation.max_concurrent_children=10
- planned children=10
- parent provider=custom:centraldark-kylin
- result=BLOCKED INIT_FAILED:10

Contraprova com provider alternativo Hermes:
- provider=openai-codex
- result=HTTP 429 usage_limit_reached
- reset reportado pelo provider em aproximadamente 2h no instante da medição.

TEN_SUBAGENTS_EXECUTED=false
HERMES_BODY_BROKEN=false
MODEL_PROVIDER_AVAILABLE=false

## c893a949

RECIPE_FINGERPRINT_CANDIDATE=c893a949
repo search=NO_MATCH
commit/issue search=NO_MATCH
Hermes sessions/logs grep=NO_MATCH
PROVENANCE=UNKNOWN
REPLAY=BLOCKED_UNTIL_PROVENANCE

## Validação do cristal

Branch/head:
- crystal/kylin-current-triton-session-20261006
- f7c94bc41bc34232249822daec3962ec5058b470 no primeiro readback antes deste complemento

Arquivos do delta:
- docs/CONSCIENCIA/APRENDIZADOS/2026-10-06-KYLIN-CURRENT-BINDING-TRITON-EMBEDDING-CONTINUIDADE.md
- docs/CONSCIENCIA/LEMBRANCAS/2026-10-06-KYLIN-CURRENT-BINDING-TRITON-EMBEDDING-CONTINUIDADE.md
- docs/CONSCIENCIA/RECEIPTS/2026-10-06-HERMES-KYLIN-DELEGATION-BINDING-RECONCILIATION.md
- experiments/aionui-centraldark-instinto-superior/ENGINE-SWAP-RECIPE-2026-10-06.json

Gates focados:
- ENGINE-SWAP-RECIPE JSON parse=PASS
- git diff --check main...branch=PASS
- verify_repo_contract.py no branch=FAIL em 2 gates globais

Contraprova executada na main limpa do MESMO SHA 070671b19ba7011a882a32ef5fbbd5836a032316:
- verify_repo_contract.py na main=FAIL nos MESMOS 2 gates:
  - GLOBAL_LEARNING_LINEAGE_EXECUTABLE_GATE => LINEAGE_MANIFEST_DRIFT
  - SOUL_SYNC_CURRENT_FOR_FIXED_POINT => anchors stale de AGENTS.md, LEIA-ME-IA.md, CLAUDE.md e CENTRALDARK_AI_BOOT.yaml

Conclusão:
REPO_CONTRACT_FAILURE_INTRODUCED_BY_THIS_DELTA=false
REPO_CONTRACT_PREEXISTING_GLOBAL_FAILURE=PASS_PROVEN
DELTA_DIFF_CHECK=PASS
RECIPE_JSON_PARSE=PASS

Os 2 vermelhos globais não são mascarados nem corrigidos neste PR porque estão fora do cone causal desta cristalização.

## Não feito

NO_DIRECT_MAIN_WRITE=true
NO_PR_MOTHER_MERGE=true
NO_RESET_HARD_DIRTY_RUNTIME=true
NO_NEW_BRIDGE=true
NO_NEW_ROUTER=true
NO_NEW_HOOK=true
NO_FAKE_TEN_SUBAGENTS_RECEIPT=true

## Fixed point desta rodada

TRITON_LOCAL_SUBSTRATE=PASS
EMBEDDING_CURRENT=PASS
BRIDGE_CANONICAL_OWNER=PASS
KYLIN_NLP_CURRENT=BLOCKED_INIT_FAILED_10
TEN_SUBAGENT_DELEGATION=BLOCKED_PROVIDER
C893A949_PROVENANCE=UNKNOWN
CRYSTAL_FILES=PASS
CRYSTAL_FOCUSED_VALIDATION=PASS
REPO_GLOBAL_GATES=PREEXISTING_FAIL
FIXED_POINT=false

## NEXT_CURSOR

KYLIN_INIT_10_ROOT_CAUSE -> CURRENT_MODEL_BINDING_SURVIVES -> NATIVE_ONCE_PASS -> BRIDGE_COMPLETION_PASS -> TEN_SUBAGENTS -> FIND_C893A949 -> SAME_RECIPE_KYLIN_REPLAY -> COMPARE_EFFECT


---

## 🪬 ADENDO COMPASSO — 09/10/2026 · menor delta no owner Kylin

**Intenção preservada:** o COMPASSO da Lei de Cooperação já cristalizada em
\`docs/CONSCIENCIA/PROGRAMAS/KAIZEN-VIVO-INTENCAO-VIVA-20261008.md\` foi aplicado à falha
\`KYLIN_CHAT=502\` / \`INIT_FAILED:10\`, sem outro bridge, outro agente ou alteração do modelo selecionado.

**CURRENT (no momento da primeira medição desta rodada):**
- GitHub main \`43dbebe2fdc302bbccc61bed80e4c6e67e56ce35\`; VPS HEAD \`11e01749e677866a094994f84c5c9352ad19f7fb\`. A main avançara depois do estado alinhado informado pelo CHEFE.
- Triton mostra ASR, TTS e embeddings \`READY\` (não equivale a chat NLP pronto).
- Owner \`scripts/vps/kylin-openai-bridge.py\`: chamada \`genai_text_init_session\` ocorria ANTES de \`genai_text_set_model_config\`. No SDK oficial openKylin, a configuração é vinculada antes da inicialização. Fonte: https://www.openkylin.top/public/pdf/openKylin_AI_SDK.pdf (seção 4.4.8.2).
- SDK JS oficial mapeia código 10 para \`AISDK_MODEL_NOT_FOUND\`; significado no binário C instalado na VPS ainda precisa de confirmação direta. Fonte: https://www.npmjs.com/package/@openkylin/kysdk-ai.

**Delta:** commit \`bdf2f09ad3437231c0c288e8d2c4ca985209fe1f\`:
1. Mover \`genai_text_init_session(sess)\` após \`genai_text_set_model_config(sess,cfg)\`, preservando \`resolve_current_model()\` e o tratamento de erros.
2. Adicionar regressões fake-SDK com e sem erro 10 em \`scripts/vps/test_kylin_bridge_sdk_order.py\`, sem depender da lib nativa na Casa.

**Prova na bancada isolada:** \`E:\\CentralDark\\_cache\\kylin-sdk-order-20261009\`,
mesmo commit \`bdf2f09ad3437231c0c288e8d2c4ca985209fe1f\`:
- \`python -m py_compile\` dos dois arquivos: PASS.
- \`python scripts/vps/test_kylin_bridge_sdk_order.py -v\`: 2/2 PASS, incluindo sequência \`set_name → set_model_config → init_session → chat\` e limpeza de config/session quando \`init_session\` devolve erro 10.
- HEAD e diff do commit em GitHub: verificados.
- **Limite:** testes fake-SDK NÃO provam que o modelo NLP real está instalado ou que \`/v1/chat/completions\` responde no runtime atual.
- Dois artefatos untracked VPS preservados: \`apps/modulos/HERMES-CORE/missions/\` e \`apps/modulos/mcp/src/agents/agents-main.zip\`.

**Sem executar:** restart do owner Kylin, alteração GSettings, reset da VPS, sobrescrita de worktree, login e replay de 10 subagentes.

**Prova pendente:** \`DEPLOY_SAME_SHA → SDK_C_ERROR_MEANING_READBACK → CURRENT_MODEL_AVAILABLE → NATIVE_ONCE → /v1/chat/completions → TEN_SUBAGENTS\`.
\`SOURCE_PATCH_PASS != VPS_RUNTIME_CHAT_PASS\`; \`UNKNOWN != PASS\`.
