# Receipt — Learning #148 OpenKylin TextChat/Qwen native route

- Data: 2026-10-02
- Base main observada antes do registro: `7fb62eeca5099a91d9125eb55679d0ce8fedffda`
- Escopo: documentação/prova; sem mutação de runtime e sem alteração de `.github/workflows/pr-agent.yml`.
- Owner cognitivo: `docs/CONSCIENCIA/APRENDIZADOS.md`
- Owners técnicos relacionados: `docs/CONSCIENCIA/VPS-IA-NATIVA-ROTAS.md` e `scripts/vps/kylin-native-bind.py`

## PASS comprovado
- `/usr/lib/x86_64-linux-gnu/libkysdk-genai-nlp.so.1` presente no CENTRALDARK-OS.
- SDK correspondente identificada: `libkysdk-genai-nlp-dev 1.1.0.1-ok1.6`.
- API nativa documentada: `genai_text_create_session -> genai_text_init_session -> chat_model_config_set_name -> genai_text_set_model_config -> genai_text_chat_async`.
- IDs configurados no engine on-device:
  - `llm_Qwen-2.5-3b_1.0`
  - `llm_Qwen-3-8b-0_1.0`
  - `llm_Qwen-3-8b-1_1.0`
- UI do OpenKylin AI Subsystem mostra `Qwen3-8B` e `Qwen2.5-3B` como modelos disponíveis para download, aproximadamente 9.32 GB e 3.62 GB.
- UI separa explicitamente `On-device model` e `Cloud model`.
- Probe local materializado: `/home/CENTRAKDARK-OS/genai_local_test.py`.

## UNKNOWN preservado
- `WEIGHTS_MATERIALIZED_LOCAL=UNKNOWN`
- `QWEN_CHAT_EXECUTED=UNKNOWN`
- `PR_AGENT_REPLACED=NO`

## Cristal
`ONDEVICE_ROUTE != CLOUD_ROUTE`
`CATALOG_ENTRY != MODEL_WEIGHTS_INSTALLED`
`MODEL_ID_CONFIG != MODEL_READY`
`PROBE_CREATED != INFERENCE_PROVEN`
`TOOL_SECURITY_BLOCK != RUNTIME_FAIL`
`SDK_VERSION_MUST_MATCH_RUNTIME=true`
`REVIEWER_REPLACEMENT_REQUIRES_REAL_LOCAL_INFERENCE_PASS=true`
`UNKNOWN_IS_NOT_PASS=true`

## Replay
1. Revalidar runtime e SDK 1.1.
2. Provar materialização dos pesos do modelo escolhido.
3. Executar a API `genai_text_*` até resposta local real.
4. Só depois alterar o mesmo owner `.github/workflows/pr-agent.yml`.
5. Provar os três jobs locais individualmente.
6. Se qualquer passo divergir, manter o cone afetado como UNKNOWN e não promover nomes/configuração para PASS.

NEXT_CURSOR: materializar/provar pesos -> inferência local real -> substituir reviewers externos no mesmo owner.
