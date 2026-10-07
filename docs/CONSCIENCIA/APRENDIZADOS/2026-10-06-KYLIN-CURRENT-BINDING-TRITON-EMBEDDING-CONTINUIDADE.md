---
title: Kylin CURRENT binding + Triton/embedding + continuidade Hermes — sessão 2026-10-06
date: 2026-10-06
status: CURRENT_SESSION_CRYSTAL
authority: SEGREDO/CHEFE
active_mother_pr: 1757
legacy_mother_pr: 1562
baseline_main_sha: 070671b19ba7011a882a32ef5fbbd5836a032316
owners:
  - scripts/vps/current_model_resolver.py
  - scripts/vps/kylin-openai-bridge.py
  - scripts/vps/aionui-native-integrate.py
  - experiments/aionui-centraldark-instinto-superior/NATIVE-RECIPE-2026-10-04.json
---

# Kylin CURRENT binding + Triton/embedding + continuidade Hermes

## Intenção preservada

CHEFE=intenção; SOL=coordenação; HERMES=executor; MODEL=engine substituível; REALIDADE=juiz.

REUSE_BEFORE_CREATE=true · ONE_SYSTEM_ONLY=true · ONE_WRITER_PER_SCOPE=true · CURRENT_OVER_HISTORY=true · UNKNOWN!=PASS.

## CURRENT medido

Git/rendezvous:
- REMOTE_MAIN=070671b19ba7011a882a32ef5fbbd5836a032316
- ACTIVE_MOTHER_PR=#1757 OPEN
- LEGACY_MOTHER_PR=#1562 CLOSED
- /root/CentralDark permanece checkout runtime dirty/atrasado; preservado, sem reset destrutivo.

Triton/capabilities:
- 127.0.0.1:8000/v2/health/live=HTTP_200
- 127.0.0.1:8000/v2/health/ready=HTTP_200
- repository entries=30; READY=21
- ensemble-embd_gte-base_uint8-text=READY; output FP32[-1,-1,768]
- embd_gte-base_uint8-text=READY; ONNX; output FP32[-1,-1,768]
- CLIP image, TTS e múltiplos componentes ASR READY; ocr_ppocr UNAVAILABLE nesta medição.

Pesos locais físicos de embedding/ASR/visão foram observados no disco. Isso prova IA local/offline para essas capabilities; não prova LLM de chat offline.

Kylin runtime/SDK:
- kylin-ai-runtime=RUNNING
- genai-nlp.sock=/tmp/.kylin-ai-runtime-unix/0/genai-nlp.sock
- libkysdk-genai-nlp.so.1=PRESENT
- libqwen-nlp-engine.so=PRESENT
- libdeepseek-nlp-engine.so=PRESENT

Histórico válido de 2026-10-04 permanece provenance: KYLIN_NATIVE_RESPONSE=PASS e HERMES_KYLIN_AGENTIC_PATH_FUNCTIONAL=PASS. HISTORY!=CURRENT.

## Binding CURRENT e ferida viva

No início da sessão o bridge reportava model=kylin-qwen-plus, source=gsettings:com.kylin.aisdk.model.cloud.nlp, execution_class=cloud.

Depois, o binding ficou vazio:
- cloud.nlp.currentModel=""
- ondevice.nlp.currentModel=""
- local-nlp-model-add-order=[]

Uma restauração controlada de kylin-qwen-plus via D-Bus teve readback imediato, mas o valor voltou a vazio após falha de init. Não auto-preencher CURRENT a partir do histórico.

Probes diretos no owner existente:
- CENTRALDARK_LOCAL_MODEL=kylin-qwen-plus + --native-once => INIT_FAILED:10
- CENTRALDARK_LOCAL_MODEL=kylin-deepseek-r1 + --native-once => INIT_FAILED:10

Logo: KYLIN_NLP_SESSION_INIT_CURRENT=FAIL_CODE_10. A documentação oficial confirma apenas que genai_text_init_session retorna 0 no sucesso e código específico no erro; o significado textual do código 10 continua UNKNOWN.

## Owner drift remediado

Foi observado orphan /root/.hermes/kylin_openai_bridge.py PID=1119123 ocupando 127.0.0.1:18435 enquanto centraldark-kylin-native-bridge.service reiniciava continuamente por address already in use (contador >38000).

O orphan foi encerrado com TERM. O owner canônico existente assumiu a porta via systemd. Resultado: OWNER_CONFLICT=REMEDIATED. O health segue degradado somente pelo binding NLP CURRENT vazio / init falhando.

## Hermes / agentic

Em chat novo com Kylin Qwen Plus, Hermes executou terminal real, criou/leu arquivo e rodou comandos read-only. NEW_CHAT_KYLIN_TOOL_CALL=PASS. Isso falsifica a hipótese absoluta de que Kylin não usa ferramentas.

A continuidade de sessão antiga após troca de modelo permanece cone separado: MODEL_SWAP_IN_SAME_CHAT_CONTINUITY=NOT_PROVEN; TEXT_ONLY_AFTER_SWAP=PAPAGAIO_RISK.

## Delegação Hermes desta sessão

delegation.max_concurrent_children=10; delegation.max_spawn_depth=1.

Foi materializada uma missão de 10 subagentes read-only com parent Hermes como único writer: CANON/INTENT; KYLIN_BINDING; TRITON_EMBEDDING; OPENKYLIN_SDK; HERMES_AGENTIC; GITHUB_GRAPH; MEMORY_DOCS; RECIPE_C893A949; HOOKS/TRIGGER; COUNTERPROOF/TESTS.

A execução não foi promovida: provider custom Kylin => INIT_FAILED:10. Contraprova provider openai-codex => HTTP_429 usage_limit_reached. Portanto TEN_SUBAGENTS_EXECUTED=false; DELEGATION_PLAN_MATERIALIZED=true; DELEGATION_BLOCKER=MODEL_PROVIDER_UNAVAILABLE.

## Receita c893a949

RECIPE_FINGERPRINT_CANDIDATE=c893a949 foi informado pelo CHEFE. Buscas em repo CURRENT, commits/issues e sessões/logs Hermes pesquisados não localizaram o conteúdo exato. RECIPE_C893A949_PROVENANCE=UNKNOWN; REPLAY_C893A949_ALLOWED=false.

Quando a provenance exata aparecer: SAME_HERMES + SAME_MISSION + SAME_METHOD + SAME_RECIPE/PROOF_KEY + DIFFERENT_ENGINE -> comparar result/schema/effect.

## Cristais novos

- TRITON_LOCAL_AI_PASS != LOCAL_CHAT_LLM_PASS
- EMBEDDING_READY != NLP_SESSION_READY
- HISTORICAL_KYLIN_NATIVE_PASS != CURRENT_KYLIN_NATIVE_PASS
- MODEL_BINDING_EMPTY_AFTER_RUNTIME_REJECTION != SAFE_TO_FILL_FROM_HISTORY
- SERVICE_OWNER_PASS != MODEL_PROVIDER_PASS
- NEW_CHAT_TOOL_PASS != SAME_CHAT_MODEL_SWAP_CONTINUITY_PASS
- MODEL_PROVIDER_BLOCKED != HERMES_BODY_BROKEN
- TEN_SUBAGENT_PLAN != TEN_SUBAGENTS_EXECUTED

## NEXT_CURSOR

INIT_FAILED:10 root cause -> binding NLP CURRENT estável -> native-once PASS -> bridge completion PASS -> 10 subagentes -> localizar c893a949 -> replay exato com Kylin -> comparar resultado/formato/efeito -> cristal ou delta novo.
