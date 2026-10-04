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


## Fechamento posterior da mesma sessão — Hermes + Kylin + AionUi + tool call

Este bloco preserva o snapshot anterior acima e registra o delta medido depois. A fronteira histórica `HERMES_CLI_END_TO_END_RESPONSE=NOT_PROVEN_IN_THIS_RECEIPT` continua verdadeira **para a tentativa CLI daquele instante**; ela não é apagada nem retroativamente convertida em PASS.

Evidência posterior consolidada no PR-mãe #1562, receipt `5975848027`:

- Hermes Agent real identificado: `v0.21.5+6146.g46904a3`, instalação `/root/.hermes/hermes-agent`.
- Hermes efetivamente configurado com `default=kylin-deepseek-r1`, `provider=custom`, `base_url=http://127.0.0.1:18435/v1`, `streaming=false`.
- Bridge loopback saudável: `/health=200`, backend `kylin-native-sdk`; `/v1/models` expôs `kylin-deepseek-r1`; chat respondeu `HERMES_KYLIN_BRIDGE_OK`.
- Kylin native GenAI SDK já havia fechado `SESSION=TRUE → INIT=0 → CENTRALDARK_LOCAL_OK → END=1 → DONE=TRUE → ERROR=FALSE`.
- AionUi mostrou o endpoint personalizado `kylin-deepseek-r1` e conversação funcional.
- Prova agêntica observada: Hermes emitiu chamada estruturada `read_file` para `/root/CentralDark_FULL_20261004003605/AGENTS.md`.
- Triton/Kylin permaneceu `live=200` e `ready=200`.
- HERMES-CORE permaneceu `health=200`, versão `5.0`.

Rota funcional consolidada:

```text
AionUi
→ Hermes Agent real
→ provider custom
→ 127.0.0.1:18435/v1
→ centraldark-kylin-native-bridge
→ Kylin native GenAI SDK
→ kylin-deepseek-r1
→ resposta

Hermes Agent
→ decisão de ferramenta
→ tool call estruturada read_file
→ AGENTS.md do projeto
```

Cristal deste fechamento:

```text
KYLIN_NATIVE_LOCAL_GENERATION=PASS
KYLIN_OPENAI_BRIDGE=PASS
HERMES_CONFIG_POINTS_TO_KYLIN_NATIVE=PASS
AIONUI_CUSTOM_KYLIN_CONVERSATION=PASS
HERMES_AGENT_TOOL_CALL_READ_FILE_EMITTED=PASS
TRITON_LIVE_READY=PASS
HERMES_CORE_HEALTH=PASS
HERMES_KYLIN_AGENTIC_PATH_FUNCTIONAL=PASS
FIXED_POINT=HERMES_PLUS_LOCAL_KYLIN_PLUS_AGENTIC_CAPABILITY_PROVEN_FUNCTIONAL
```

Fronteira de prova preservada:

```text
TOOL_CALL_EMITTED != ALL_TOOLS_PROVEN
ONE_AGENTIC_TOOL_PATH_PASS != EVERY_AGENTIC_CAPABILITY_PASS
AIONUI_PATH_PASS != HISTORICAL_CLI_ATTEMPT_RETROACTIVELY_PASS
MODEL_RESPONSE != TOOL_EFFECT
UNKNOWN_IS_NOT_PASS
ACTION_IS_NOT_PROOF
```

O fixed point vale para o escopo material provado nesta sessão: **Hermes real + rota local Kylin funcional + emissão de tool call real pelo agente**. Capabilities não exercitadas permanecem fora do claim.


## Delta: AionUi MCP e mídia nativa — 2026-10-04

Owner preservado: catálogo MCP existente + local-compute; mesmo bridge Kylin/Hermes. PR equivalente #1748, rastro #1562. Escrita em main conforme autorização explícita do CHEFE; nenhum merge do protótipo/PR-mãe implicado.

- WebUI 25808: MCP CentralDark cadastrado/connected e modelo Kylin no Aion CLI. Perfil e histórico preservados.
- Transporte local stdio reutiliza catálogo, dispatcher, guarda admin, envelope e funil; modo compacto anuncia 10 ferramentas e descobre o catálogo inteiro sob demanda. O catálogo público normal segue com 132 ferramentas.
- Hermes CLI: conexão MCP real e 10 ferramentas descobertas. Sua configuração anterior de modelo/SOUL permanece.
- Replay real: **10/10** com efeitos de embeddings 768/1024d, WAV, ASR, OCR, vídeo por frames+áudio, contraprovas e POST /api/stt do WebUI. Typecheck PASS.
- Chat legado remedido: resposta exata **HERMES_KYLIN_BRIDGE_OK** após evolução. Health WebUI, bridge, HERMES-CORE e Triton: HTTP 200. Isto preserva o escopo do PASS funcional anterior, não prova toda regressão possível.
- Persistência: mesma árvore AionUi movida de /tmp para /opt/centraldark/aionui, mantendo symlink compatível e mesmo perfil; mesmo serviço. Bridge antes transient agora unit permanente enabled.
- Auditoria: corrigido erro de sintaxe preexistente no src e duplicação de registros no dist; mantidos subscribers e funil. Áudio bruto omitido dos logs.
- Bridge evoluído: schemas de tools/model-generated JSON, serialização de resultados, SSE buffered compatível, embeddings e APIs de áudio; subprocesso limita timeout do SDK. Usage fictício zero removido: SDK sem medição retorna indisponibilidade explícita. SDK headers de distribuição conferidos para setters.

| Capacidade/superfície | Texto/MCP local | Voz WebUI | Work/VPS | Desktop/Hermes |
|---|---|---|---|---|
| Catálogo comum | PASS tools/list | Mesmo cadastro; chamadas completas ainda não comprovadas | PASS execução | Hermes MCP conectado; GUI Desktop não reconfigurada |
| Embeddings texto/imagem | PASS 768/1024d | Consumível pelo MCP; E2E conversacional UNKNOWN | PASS | Binding compartilhado; inferência via agente não remediada |
| ASR/TTS | PASS fixture ZH e WAV | POST /api/stt PASS; microfone em HTTP público: PLATFORM_UNAVAILABLE por contexto inseguro | PASS | Mesmo adapter disponível pelo MCP |
| Imagem | OCR e CLIP PASS | Attachments/MCP disponíveis; diálogo visual generativo UNKNOWN | PASS no escopo medido | Não presume instalação de plugin de geração |
| Vídeo | Frames OCR + áudio ASR PASS | Upload/MCP; não geração de vídeo | PASS no escopo medido | Mesmo adapter |
| Sessão/trace/tool calls/tokens | Envelope e logs preservados | Sessões e tool_call do Aion vistos; vínculo global/usage UNKNOWN | Audit com call_id/correlation_id | Paridade total ainda não provada |

Fronteiras: Aion CLI gerou chamada real de embedding, porém houve confirmação pendente e timeouts nas tentativas subsequentes; não há receipt de resultado final de ferramenta pelo Aion. AGENTS legado de 75 KB foi preservado integralmente. Não há prova de ASR/TTS PT-BR, geração de imagem/vídeo, ou R1 totalmente offline (pacote inclui cloud-model). HERMES-CORE health não prova grafo: gerador do grafo ausente na medição. Agentes cadastrados/offline e modelos unloaded estão discriminados no inventário. Ferramenta anunciada não prova credencial nem sucesso de todos os conectores.

Receita executável e fingerprint: [NATIVE-RECIPE-2026-10-04.json](../../../experiments/aionui-centraldark-instinto-superior/NATIVE-RECIPE-2026-10-04.json). Evidência: [NATIVE-PROOF-2026-10-04.json](../../../experiments/aionui-centraldark-instinto-superior/NATIVE-PROOF-2026-10-04.json). Inventário: [RUNTIME-2026-10-04.json](../../../experiments/aionui-centraldark-instinto-superior/RUNTIME-2026-10-04.json).

NEXT_CURSOR: resolver o limite de contexto/confirmacão do Aion CLI usando o mesmo owner; terminar uma chamada e seu resultado real. Depois correlacionar SESSION_ID/TOOL_CALL_ID/receipt entre UI e funil. O PASS anterior do Hermes não é rebaixado por esse novo binding incompleto.


## Reconciliação de sensores — runtime owner vs GitHub HUD — 04/10/2026

Medição direta posterior feita no owner/runtime `CENTRALDARK-OS`, preservando a semântica do HUD GitHub: `VPS_RUNTIME=UNKNOWN_FROM_GITHUB_SENSOR` continua correto **para o sensor GitHub** e não é reescrito como se GitHub tivesse observado a VPS.

Readback do sensor runtime:
- `/root/CentralDark` = `5070d8e1b53b002e716701f7e41c6ae42847c7c4` no instante da medição;
- Hermes Agent = `v0.21.5+6778.g81e1ce7`;
- bridge `127.0.0.1:18435` = `status=ok`, backend `kylin-native-sdk`, modelo `kylin-deepseek-r1`;
- Triton `/v2/health/live=200` e `/v2/health/ready=200`;
- HERMES-CORE `/health` = `status=ok`, versão `5.0`, watchdog ativo/saudável;
- AionUi WebUI `127.0.0.1:25808/api/settings/client=200`;
- bridge = `active + enabled`.

Contraprova preservada: o payload do HERMES-CORE reportou `grafo.ok=false` por `ENOENT` no gerador de grafo; portanto `HERMES_CORE_HEALTH=PASS` não promove o grafo a PASS.

```text
GITHUB_SENSOR_RUNTIME_STATE=UNKNOWN_FROM_GITHUB_SENSOR
RUNTIME_OWNER_DIRECT_MEASUREMENT=PASS
SENSOR_FAILURE_IS_WORLD_FAILURE=false
GITHUB_AND_VPS_ARE_INDEPENDENT_SENSORS=true
GITHUB_UNKNOWN != VPS_DOWN
RUNTIME_PASS != GITHUB_SENSOR_PASS
HERMES_CORE_HEALTH_PASS != HERMES_GRAPH_PASS
CURRENT_OVER_HISTORY=true
REALITY=JUDGE
```

Fixed point reconciliado: a fotografia histórica `runtime UNKNOWN` não governa o estado do mundo quando o owner/runtime foi medido diretamente; ela permanece apenas como resultado correto do sensor GitHub que não observa runtime.
