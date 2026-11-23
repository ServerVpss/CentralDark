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

## Runtime proof

Microdeploy reversível no owner existente:

```text
backup=/root/.hermes/backups/model-source-hardening-20261004T192509Z
centraldark-kylin-native-bridge.service=active
centraldark-kylin-public-bridge.service=active

/health=200
model=kylin-qwen-plus
source=gsettings:com.kylin.aisdk.model.cloud.nlp
execution_class=cloud

completion response model=kylin-qwen-plus
completion content=BINDING_METADATA_PROOF
completion _meta.binding_source=gsettings:com.kylin.aisdk.model.cloud.nlp
completion _meta.execution_class=cloud
```

O caminho local e o SDK nativo estão provados. `ON_DEVICE_INFERENCE` permanece `UNKNOWN`; a classe `cloud` anunciada pelo resolver não deve ser rebaixada nem reinterpretada.

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
