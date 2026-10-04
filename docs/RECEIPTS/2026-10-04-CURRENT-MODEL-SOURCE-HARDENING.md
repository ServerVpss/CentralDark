# 2026-10-04 — CURRENT model source/class hardening

## Delta útil aplicado

O resolver já escolhia o binding CURRENT, mas o `/health` publicava apenas `model`. Isso deixava ambíguo se o binding veio de Kylin cloud/ondevice/custom/shared, de override ou do catálogo Hermes.

Agora o mesmo owner publica:

```json
{
  "model": "<CURRENT>",
  "source": "gsettings:com.kylin.aisdk.model.<class>.nlp",
  "execution_class": "cloud|ondevice|custom|shared"
}
```

Precedências preservadas:

```text
CENTRALDARK_LOCAL_MODEL
→ Kylin currentModel por prioridade
→ catálogo centraldark-kylin do Hermes
→ fail closed
```

## Owner alterado

```text
scripts/vps/current_model_resolver.py
scripts/vps/kylin-openai-bridge.py
scripts/vps/test_current_model_resolver.py
```

Não foi criado segundo bridge nem segundo resolver.

## Provas locais

```text
resolver tests: 4 passed in 0.08s
py_compile: PASS
git diff --check: PASS
```

## Runtime

O bridge deve ser redeployado pelo owner existente e o readback deve distinguir:

```text
LOCAL_ENDPOINT=PASS
BRIDGE=PASS
MODEL_NAME=PASS
MODEL_SOURCE=PASS
EXECUTION_CLASS=PASS
ON_DEVICE_INFERENCE=UNKNOWN até prova específica
```

`kylin-qwen-plus` continua sendo apenas o binding observado no momento; não é identidade arquitetural.

## Invariantes

```text
MODEL_IS_ENGINE=true
MODEL_IS_NOT_IDENTITY=true
ORCHESTRATOR=HERMES_CURRENT_SELECTED_MODEL
LOCAL_WORKER=CENTRALDARK_CURRENT_LOCAL_MODEL
RESOLVE_BINDINGS_AT_START_OF_EACH_LOTE=true
CONSUMERS_MUST_NOT_HARDCODE_MODEL_NAMES=true
HERMES_IS_EXECUTION_PLANE=true
LOCAL_AI_IS_COGNITIVE_WORKER=true
REALITY_IS_JUDGE=true
```

## Next cursor

`publicar e microdeployar o bridge owner → ler /health com model/source/execution_class → ler /v1/models → executar completion → correlacionar PR-Agent com runner/body → manter Selo Fabric sem LLM`
