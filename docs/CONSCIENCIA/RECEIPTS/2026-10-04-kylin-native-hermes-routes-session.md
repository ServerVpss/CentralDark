# 🧾 RECEIPT — Kylin nativo + Hermes + rotas vivas — 2026-10-04

## Escopo
Sessão de prova no runtime `CENTRALDARK-OS` da VPS. Somente fatos medidos nesta sessão entram como PASS. Segredos não são registrados.

## Snapshot estrutural
- Repo: `ServerVpss/CentralDark`
- Main medido antes do registro: `77894dfac70a7f9b21eee4b6e86d6ed3c51ed19d`
- Regra: `CURRENT_OVER_HISTORY=true`
- Regra: `UNKNOWN_IS_NOT_PASS=true`
- Regra: `ACTION_IS_PROOF=false`

## IA nativa openKylin — prova direta
A SDK nativa existente foi chamada diretamente dentro da VPS, sem OpenAI, Claude, OpenRouter, Ollama, llama.cpp ou vLLM.

- Biblioteca: `/usr/lib/x86_64-linux-gnu/libkysdk-genai-nlp.so.1`
- Runtime/socket observado: `/tmp/.kylin-ai-runtime-unix/0/genai-nlp.sock`
- Processo: `kylin-ai-runtime`
- Modelo nominal usado: `kylin-deepseek-r1`
- Sessão: `SESSION=TRUE`
- Init: `INIT=0`
- Prompt: `Responda somente: CENTRALDARK_LOCAL_OK`
- Resposta: `CENTRALDARK_LOCAL_OK`
- Finalização: `END=1`
- Resultado: `DONE=TRUE ERROR=FALSE`

Cristal:
`KYLIN_NATIVE_LOCAL_GENERATION=PASS`
`KYLIN_NATIVE_RESPONSE=PASS`
`LOCAL_MODEL_CALL_PROVEN=PASS`

## Bridge Hermes → Kylin nativo
Foi criado/reutilizado o menor adaptador OpenAI-compatible em loopback para o provider `custom` do Hermes, chamando por baixo a SDK nativa `genai_text_*`.

- Serviço runtime: `centraldark-kylin-native-bridge.service`
- Listener: `127.0.0.1:18435`
- `GET /health` → 200
- Backend reportado: `kylin-native-sdk`
- Modelo reportado: `kylin-deepseek-r1`
- `GET /v1/models` → 200
- `POST /v1/chat/completions` → 200
- Prompt: `Responda somente: HERMES_KYLIN_BRIDGE_OK`
- Resposta: `HERMES_KYLIN_BRIDGE_OK`

Cristal:
`KYLIN_OPENAI_BRIDGE=PASS`
`KYLIN_BRIDGE_CHAT=PASS`

## Hermes — configuração efetiva gravada
Arquivo runtime: `/root/.hermes/config.yaml`

Readback:
- `default: "kylin-deepseek-r1"`
- `provider: "custom"`
- `base_url: "http://127.0.0.1:18435/v1"`
- `streaming: false`

Cristal:
`HERMES_CONFIG_POINTS_TO_KYLIN_NATIVE=PASS`

Fronteira:
`HERMES_CLI_END_TO_END_RESPONSE=NOT_PROVEN_IN_THIS_RECEIPT`

A tentativa de one-shot do CLI não produziu resposta observável antes da checagem final; portanto configuração + bridge verdes não são promovidos automaticamente a PASS do CLI completo.

## Rotas CURRENT medidas no fechamento

### Kylin/Triton
- `127.0.0.1:8000/v2/health/live` → 200
- `127.0.0.1:8000/v2/health/ready` → 200
- listener HTTP `127.0.0.1:8000` → PASS
- listener gRPC `127.0.0.1:8001` → PASS
- listener auxiliar/metrics `127.0.0.1:8002` → PASS

### Hermes Core
- `127.0.0.1:8899/health` → 200
- serviço reportado: `hermes-core`
- versão reportada: `5.0`
- listener `0.0.0.0:8899` → PASS

### Bridge nativo
- `127.0.0.1:18435/health` → 200
- `127.0.0.1:18435/v1/models` → 200
- listener `127.0.0.1:18435` → PASS

### AionUi / CentralDark — Instinto Superior WebUI
- `127.0.0.1:25808/api/settings/client` → 200
- listener `0.0.0.0:25808` → PASS
- acesso público já observado nesta sessão via `http://89.117.78.124:25808/`
- autenticação administrativa foi resetada pelo mecanismo suportado; valor de senha não entra no Git/receipt.

### AnyDesk
- listener `0.0.0.0:7070` e `[::]:7070` → PASS
- processo owner: `anydesk`
- `7070` é listener AnyDesk, não foi provado nesta sessão como endpoint HTTP/browser.

Cristal:
`ANYDESK_7070_TCP_LISTENER=PASS`
`ANYDESK_7070_HTTP_ROUTE=NOT_PROVEN`

## Sessão — fatos adicionais preservados
- WebUI pública foi iniciada em `0.0.0.0:25808` e respondeu externamente durante a sessão.
- AionUi WebUI usa seu próprio AionCore; endpoint cliente respondeu 200 no fechamento.
- `HERMES-CORE` permaneceu saudável durante a prova do modelo.
- A rota nativa local não depende de chave paga para o claim aqui provado.
- Não foi baixado outro LLM para obter a resposta `CENTRALDARK_LOCAL_OK`.

## Contraprova
- `TRITON_READY=PASS` não substitui prova do chat nativo; o chat foi provado separadamente pela SDK.
- `HERMES_CONFIG=PASS` não equivale a `HERMES_CLI_END_TO_END=PASS`.
- `LISTENER_7070=PASS` não equivale a `HTTP_7070=PASS`.
- `PUBLIC_WEBUI=PASS` não equivale a política de autenticação completamente auditada.
- `ACTION != PROOF`; os PASS acima têm readback correspondente.

## Next cursor
Fechar somente o claim ainda aberto:
`Hermes CLI -> provider custom -> 127.0.0.1:18435/v1 -> Kylin native SDK -> resposta textual`.

Depois, se aplicável, tornar o bridge persistente por arquivo unit em `/etc/systemd/system` e provar reboot/restart, sem criar segundo runtime.
