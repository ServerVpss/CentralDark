# 2026-10-04 — CURRENT_MODEL_RESOLVER — binding generalization

## Intent

Model names are runtime bindings, not architecture. Hermes' selected model remains the orchestrator binding; the local Kylin owner resolves its current worker model at the start of each request/lote.

## Owner and delta

- Existing owner preserved: `scripts/vps/kylin-openai-bridge.py`
- Single resolver added: `scripts/vps/current_model_resolver.py`
- Existing AionUi/Hermes integration updated: `scripts/vps/aionui-native-integrate.py`
- No second router, provider, bridge, scheduler or evolution engine created.

Resolver precedence:

```text
CENTRALDARK_LOCAL_MODEL explicit binding
→ enabled Kylin currentModel from gsettings
→ Hermes custom_providers.centraldark-kylin.models catalog
→ fail closed
```

The selected value is resolved when the bridge request starts. A caller can freeze it for one benchmark/lote and resolve again on the next lote. There is no silent fallback to a stale model.

## Source changes

`kylin-openai-bridge.py` no longer declares a static model identity. It resolves the model for:

- native SDK chat model configuration;
- `/health` response;
- `/v1/models` response;
- OpenAI-compatible completion metadata.

`aionui-native-integrate.py` now uses the same resolver for provider model protocols, model settings and provider catalog updates.

## Verification

```text
resolver tests: 4 passed in 0.07s
py_compile: PASS
consumer static scan for kylin-deepseek-r1 / static MODEL assignment: PASS
working resolver output at measurement time: kylin-qwen-plus
```

The current binding was observed from the live local Kylin selection path; it is not crystallized as a permanent model identity.

## Runtime boundary

Source-level binding is proven. The live bridge service has not yet been restarted from this new source in this lot; deployment/readback remains a separate runtime proof and must not be inferred from the commit.

## Next cursor

`publish source delta → deploy only the existing bridge owner through canonical route → read back /health and /v1/models → run one completion → compare model metadata → test binding swap without changing consumer → receipt → resume self-evolution lote`
