# 2026-10-03 — Hermes: intenção = escopo global, ferramentas = braços

## O que esta sessão fechou

O CHEFE explicitou que o Hermes original não deve receber “escopos por rota”. A missão é definida pela intenção; qualquer capability realmente disponível e autorizada pode ser usada para cumprir o objetivo.

```text
CHEFE_INTENT
→ GLOBAL_MISSION_SCOPE
→ INVENTORY_LIVE_AUTHORIZED_CAPABILITIES
→ CHOOSE_ANY_LIVE_ROUTE
→ MEASURE
→ ACT
→ BACKCHECK
→ COUNTERPROOF
→ CONTINUE_UNTIL_FIXED_POINT
```

## Leis cristalizadas

```text
INTENT_IS_GLOBAL_SCOPE=true
ROUTE_IS_NOT_SCOPE=true
TOOL_GIVEN_BECOMES_CAPABILITY=true
AUTHORIZED_CAPABILITIES_IN_SCOPE_BY_DEFAULT=true
ROUTE_FAIL_DOES_NOT_END_MISSION=true
NO_PER_TOOL_SCOPE_RECONFIRMATION=true
ONE_SYSTEM_ONLY=true
HERMES_ORIGINAL_PRIORITY=true
CURRENT_OVER_HISTORY=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
```

A intenção pode atravessar Casa, VMware, VPS, Tailscale, SSH, API, Desktop, MCP, Shell, GitHub, arquivos, rede e roteador do CHEFE quando essas superfícies estiverem realmente acessíveis e autorizadas. Nova ferramenta não cria novo Hermes: amplia o corpo operacional do mesmo Hermes.

## Provas materiais da sessão — VMware / openKylin

- Hermes original: `vgit.ca952a5 (2026.9.24) · upstream ca952a57`.
- Nous configurado e autenticado; modelo pago testado retornou saldo/créditos insuficientes, portanto essa rota não foi usada como PASS de conversa.
- Pacotes presentes: `ai-kylin-deepseek-r1-cloud-model`, `ai-kylin-deepseek-v3-cloud-model`, `libkylin-deepseek-ai-engine-plugin`, `libkylin-deepseek-nlp-engine` e app web DeepSeek.
- Config inicial do Kylin cloud: disabled; modelo declarado `kylin-qwen-plus`. On-device estava enabled, mas sem currentModel materializado.
- Com o D-Bus da sessão do usuário, cloud foi habilitado e `currentModel` passou a `kylin-deepseek-r1`.
- Probe `deepseek-r1`: `INIT=0`, porém `ERR=10` e sem texto.
- Probe `kylin-deepseek-r1`: `SESSION=True`, `INIT=0`, `DONE=True`, `TEXT=LOCAL_QWEN_OK`.

Logo:

```text
KYLIN_NATIVE_SESSION=PASS
KYLIN_DEEPSEEK_R1_NAMED_BINDING=PASS
KYLIN_NATIVE_RESPONSE=PASS
HERMES_TO_KYLIN_BINDING=NOT_YET_PROVEN
```

## Bridge Hermes → Kylin

Foi reutilizado o provider `custom` já existente no Hermes, que aceita endpoint OpenAI-compatible. Em vez de instalar Ollama/vLLM/llama.cpp, foi criado o menor adaptador local `~/.hermes/kylin_openai_bridge.py` para expor a ABI `genai_text_*` em loopback.

A primeira subida falhou por erro local de Python: `os.environ[XDG_RUNTIME_DIR]` em vez de uma chave string. A tentativa de correção por shell também bateu em quoting. O bridge não ficou vivo e `curl 127.0.0.1:18435/health` não passou.

```text
BRIDGE_FILE_EXISTS != BRIDGE_RUNNING
BRIDGE_RUNNING != HERMES_RESPONSE
KYLIN_RESPONSE_PASS != HERMES_KYLIN_BINDING_PASS
```

## Tailscale / Casa

O CHEFE configurou visualmente uma regra SSH com `autogroup:member` como origem, `autogroup:self` como destino, `autogroup:nonroot, root` como users e ação `accept`. A tela do Hermes da Casa também mostrou a criação da skill `devops-integrado-tailscale-centraldark` e continuidade por rotas alternativas.

Essas telas são evidência fornecida pelo CHEFE nesta sessão; o CURRENT futuro deve fazer readback por API/runtime antes de reutilizar como prova temporal.

## Generalização decisiva

“Full access” na CentralDark não significa uma whitelist verbal por ferramenta. Significa que, dentro do universo do CHEFE realmente autorizado e acessível, a intenção cobre o caminho inteiro. Se uma rota falhar, Hermes tenta outra. Se recuperar uma máquina exigir operar o roteador do CHEFE, DHCP, IP, Tailscale ou SSH, isso é parte da mesma missão — não uma nova missão.

Fronteiras que permanecem: não operar infraestrutura alheia/não autorizada; não expor segredos; não promover ação irreversível/destrutiva sem intenção explícita dessa classe; não transformar tentativa em prova.

## NEXT_CURSOR

Corrigir o bridge existente e fechar, na mesma VMware:

```text
Kylin native model
→ loopback bridge
→ provider=custom
→ Hermes original
→ HERMES_VM_OK
```

Depois, usar a mesma regra `INTENT_IS_GLOBAL_SCOPE` para capabilities novas sem criar arquitetura paralela.
