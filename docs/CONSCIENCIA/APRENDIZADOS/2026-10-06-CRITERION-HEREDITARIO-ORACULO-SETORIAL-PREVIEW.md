---
title: "Criterion hereditário + Oráculo setorial + Preview — cristal da sessão"
date: 2026-10-06
status: CRYSTALIZED_SESSION_DELTA
authority: SEGREDO/CHEFE
owners:
  - docs/CONSCIENCIA/CONTRATO-RECONCILIACAO-ANTES-DE-CRIAR.json
  - docs/ARQUITETURA/CENTRALDARK-UNIFIED-SURFACE-PARITY-01.yaml
  - apps/modulos/HERMES-CORE/core/perception-orchestra.mjs
  - .agents/skills/software-development/centraldark-oracle-surface/SKILL.md
baseline_main_sha: 70aea26c468c5c4c4e7d9bcf8abbf9b47905e2af
---

# Criterion hereditário + Oráculo setorial + Preview

## 1. Síntese do padrão do CHEFE

O núcleo persiste; capacidades evoluem. A intenção não se divide quando o trabalho é decomposto. O caminho pode adaptar, o critério pode refinar e a percepção pode paralelizar, mas o contrato do pai não pode ser enfraquecido.

```text
CHEFE fixa a intenção
→ GOAL guarda o contrato
→ SUBGOAL recorta sem diluir
→ SUBAGENT adapta o caminho
→ percepções podem trabalhar em paralelo
→ evidências retornam ao pai
→ rendezvous + dedupe + contraprova
→ writer por escopo
→ REALIDADE julga
→ FIXED_POINT encerra
```

Cristais:

```text
GOAL_PAI_ID=STABLE
MICRO_GOAL=DERIVED_FROM_CURRENT_WOUND
CHILD_CAN_REFINE_CRITERION=true
CHILD_CANNOT_WEAKEN_PARENT_CRITERION=true
LOCAL_DONE != PARENT_DONE
PARALLEL_PERCEPTION=true
SERIALIZED_MUTATION=true
ONE_WRITER_PER_SCOPE=true
ONE_SYSTEM_ONLY=true
REALITY_IS_JUDGE=true
```

## 2. Herança de Criterion

Descendentes de missão herdam, no mínimo:

```text
PARENT_INTENT
SUCCESS_PREDICATE
OWNER_SCOPE
CURRENT_BASELINE
REUSE_BEFORE_CREATE
COUNTERPROOF
EVIDENCE_DESTINATION
RECEIPT_NEXT_CURSOR
```

Aplica-se semanticamente a:

```text
GOAL → SUBGOAL → BATCH/LOTE → SUBAGENT → SUBSUBGOAL
```

O filho pode especializar o seu sucesso local para a ferida atual, mas não pode reduzir o que conta como sucesso para o Goal pai. Concluir uma leitura, um commit, um PR, um workflow ou um subgoal não fecha automaticamente a missão pai.

## 3. Oráculo como novo olho, não novo cérebro

`CHAT_GLOBAL` pode ser usado como superfície consultiva read-only. ChatGPT foi o binding provado neste piloto; marca/modelo não viram autoridade.

```text
HERMES
→ Preview/CHAT_GLOBAL
→ query com IDs causais
→ resposta externa
→ CANDIDATE
→ provenance
→ percepção existente
→ rendezvous
→ contraprova
→ delta sobrevivente
→ writer existente
→ Reality Judge
```

Fronteiras:

```text
ORACLE_OUTPUT_IS_CANDIDATE=true
ORACLE_CANNOT_WRITE_CANONICAL_STATE_DIRECTLY=true
ORACLE_CANNOT_CHOOSE_WRITER=true
SOURCE_IS_PROVENANCE_NOT_AUTHORITY=true
```

## 4. Piloto E2E observado nesta sessão

```text
desktop_preview open = PASS
ChatGPT Preview lateral = PASS
novo chat isolado = PASS
query enviada = PASS
INTENT_ID preservado = PASS
EVENT_ID preservado = PASS
CAUSATION_ID preservado = PASS
SURFACE_ID preservado = PASS
resposta capturada via desktop_preview read = PASS
READONLY_BOUNDARY = PASS
```

Formato recebido:

```text
CANDIDATE_CLAIM
EVIDENCE_LIMIT
COUNTERPROOF
NEXT_READONLY_PROBE
```

Limites preservados:

```text
ORACLE_TO_CANONICAL_ENVELOPE = UNKNOWN
ENVELOPE_TO_RECONCILIATION = UNKNOWN
RECONCILIATION_TO_WRITER = UNKNOWN
RUNTIME_EFFECT = NOT_APPLICABLE_TO_THIS_PILOT
```

A primeira camada física está provada; a integração cognitiva completa ainda precisa passar pelo owner existente `perception-orchestra.mjs`.

## 5. Semântica de abas do Preview — contraprova e correção

A primeira formulação desta sessão dizia que `desktop_preview action=open` com `label` distinta criaria outra Browser tab. O teste real falsificou isso.

A leitura do Hermes Desktop CURRENT confirmou a causa:

```text
desktop_preview action=open
→ preview.open {url,label}
→ para target.kind=url, openPreview usa browserTabFor(visible)
→ reutiliza o Browser ativo ou o último Browser visível

Preview strip "+"
→ newBrowserTab()
→ cria outro id url:browser-...
→ preserva o Browser anterior
```

O schema atual de `desktop_preview` expõe apenas:

```text
open
close
read
```

Não há `new_tab` exposto ao agente.

Logo, a regra corrigida é:

```text
"abra/navegue/vá para"
→ navegar/reutilizar Browser atual

"abra NOVA ABA/novo tab/outra aba"
→ intenção = preservar Browser atual e criar outro
→ desktop_preview open + label NÃO basta
→ usar a capability real de criação de tab quando estiver exposta
→ provar por readback/lista que existem pelo menos duas Browser tabs
```

Cristais corrigidos:

```text
NAVIGATE_CURRENT_TAB != OPEN_NEW_PREVIEW_TAB
LABEL_IS_NOT_NEW_TAB_SIGNAL=true
DESKTOP_PREVIEW_OPEN_DOES_NOT_PROVE_NEW_BROWSER_TAB=true
NEW_TAB_REQUEST_PRESERVES_CURRENT=INTENT
AGENT_NEW_BROWSER_TAB_TOOL_ACTION=UNEXPOSED
NEW_BROWSER_TAB_E2E=UNKNOWN
```

Isto preserva a intenção do CHEFE sem transformar desejo em falso PASS.

## 6. Resposta do Oráculo vira sinal operacional, não apenas texto

A expansão fecha o ciclo da mesma superfície `CHAT_GLOBAL`; não cria novo owner.

```text
mapear controles atuais
→ escolher binding suficiente
→ enviar query
→ marcar tempo de envio
→ observar primeiro conteúdo visível
→ observar conclusão/erro
→ capturar resposta
→ registrar modelo/esforço/modo usados
→ detectar controle/capability ausente
→ adaptar somente o binding necessário
→ reconciliar com CURRENT
```

O envelope de tentativa passa a carregar, quando observável:

```text
ATTEMPT_ID
MODEL_BINDING
EFFORT_BINDING
INPUT_MODE
AVAILABLE_CONTROLS / MISSING_CONTROLS
SUBMIT_OBSERVED_AT
FIRST_VISIBLE_RESPONSE_OBSERVED_AT
RESPONSE_COMPLETE_OBSERVED_AT
ELAPSED_TO_FIRST_VISIBLE_MS
ELAPSED_TO_COMPLETE_MS
RESPONSE_STATE
ERROR_STATE / ERROR_TEXT
```

A interface mostrada nesta sessão expôs visualmente seletor de modelo, seletor de esforço e controles de microfone/voz. Isso prova presença visual naquele instante; não prova automaticamente que cada controle foi acionado com sucesso.

```text
VISIBLE_CONTROL != INVOKABLE_CAPABILITY
VOICE_BUTTON_VISIBLE != VOICE_SESSION_ACTIVE
MIC_BUTTON_VISIBLE != MICROPHONE_CAPTURE_ACTIVE
MODEL_NAME_IS_BINDING=true
EFFORT_LEVEL_IS_BINDING=true
INPUT_MODE_IS_BINDING=true
```

Velocidade é medida como observação da superfície, não confundida com latência interna do provedor:

```text
PREVIEW_POLL_TIME != PROVIDER_BACKEND_LATENCY
FIRST_VISIBLE_RESPONSE = primeiro conteúdo de resposta observado
COMPLETE_TIME = primeira conclusão estável observada
```

Adaptação segue o Goal: trabalho simples pode usar um binding suficiente e mais rápido; trabalho ambíguo, de arquitetura ou contraprova pode subir capacidade/esforço se disponível. Trocar modelo, esforço ou texto/voz muda a concha de execução, não a intenção do Goal.

O agente deve descobrir controles dinamicamente por elementos/ref; coordenadas fixas não viram contrato canônico.
## 7. Superfícies externas

Superfícies vistas/consideradas nesta sessão:

```text
ChatGPT Preview
Web Search
Library
Connectors
Sites
Skills externas
sessões de navegador autenticadas
```

Tratamento:

```text
EXTERNAL_SURFACE
→ EXTERNAL_CANDIDATE
→ provenance
→ CURRENT
→ owner existente
→ privacidade/escopo
→ teste
→ counterproof
→ PROVEN | DROP | UNKNOWN
```

Não importar automaticamente memória inteira, histórico inteiro, arquivos privados, conectores desconhecidos, instruções personalizadas ou secrets.

Uma sessão/perfil autenticado é binding temporal, não autoridade. O Preview do Hermes está provado para o piloto. Outras superfícies de navegador exigem E2E próprio antes de receber PASS.

## 8. Percepção setorial por ganho de informação

A exploração da sessão usou seis setores, sem transformá-los em número fixo:

```text
Hermes/Core/Oracle
GitHub/CI/Deploy
VPS/Runtime/Fingerprint
Memória/Vault/Receipts
Telegram/Messaging
MCP/Providers/IA
```

Cada setor devolve:

```text
OWNER
CAPABILITY
PROOF_STAGE
GAP
SAFE_READONLY_PROBE
REUSE_CANDIDATE
PROVENANCE
```

Lei:

```text
PARALLEL_PERCEPTION_ALLOWED_WHEN_INFORMATION_GAIN=true
SECTOR_COUNT_IS_FIXED=false
READ_ONLY_FANOUT_BEFORE_MUTATION=true
RENDEZVOUS_BEFORE_MUTATION=true
DEDUPE_BEFORE_MUTATION=true
```

Muitos olhos não significam muitos cérebros. Vários resultados são candidatos; a mutação continua serializada por escopo.

## 9. Escada universal de prova de capability

A sessão convergiu a distinção:

```text
DECLARED
→ DISCOVERED
→ CONFIGURED
→ HEALTHY
→ EXECUTED
→ RECEIPT
```

Nenhum estágio implica automaticamente o seguinte.

```text
DECLARED != DISCOVERED
DISCOVERED != CONFIGURED
CONFIGURED != HEALTHY
HEALTHY != EXECUTED
EXECUTED != RECEIPT
```

O claim mais forte permitido é o maior estágio realmente medido.

## 10. Matriz setorial consolidada da sessão

| Setor | Owner/âncora principal | Estado mais forte observado nesta exploração | Gap principal |
|---|---|---|---|
| Hermes/Core/Oracle | `perception-orchestra.mjs` + `cognitive-council.mjs` | percepção paralela, dedupe, contraprova e continuidade já existentes | integração Oráculo→envelope→reconciliação ainda não provada E2E |
| GitHub/CI/Deploy | `vps-exec-selfhosted.yml` + dispatcher/deploy owners | gates, SHA, locks, rollback/readback/fail-closed presentes | observabilidade agregada e bloqueios de runner/checks precisam prova atual por evento |
| VPS/Runtime | deploy/health/fingerprint owners | capacidades documentadas e probes parciais | runtime vivo precisa ser re-medido por claim; histórico não vira CURRENT |
| Memória/Vault/Receipts | memory-linker + owners de memória/receipts | fingerprint/dedupe/proveniência/candidatos | links/órfãs e APIs/Vault exigem readback por cone, sem limpeza em massa |
| Telegram/Messaging | `unified-bot.cjs` + adapter | arquitetura long polling/fail-closed/sessões/tooling | receipt E2E update→model→message_id ainda precisa prova viva |
| MCP/Providers/IA | `tools-catalog.js` + `mcp-admin.js` + `mcp-server.js` | catálogo/dispatcher/resources/provider discovery | separar declarado/configurado/healthy/executed no runtime real |

A matriz é um mapa de exploração, não congelamento temporal. Estados vivos devem ser re-medidos quando a missão depender deles.

## 11. Não criado

```text
NO_NEW_ORACLE_ENGINE=true
NO_SECOND_BRAIN=true
NO_NEW_SCHEDULER=true
NO_NEW_DISPATCHER=true
NO_NEW_WRITER=true
NO_NEW_MEMORY_STORE=true
NO_NEW_PERCEPTION_ENGINE=true
```

A skill é capability subordinada e o owner de percepção continua sendo o existente.

## 12. Skill preservada

A skill criada durante a sessão foi promovida para:

```text
.agents/skills/software-development/centraldark-oracle-surface/SKILL.md
```

Ela preserva procedimento de Preview, IDs de causalidade, provenance envelope, anti-loop, read-only boundary, semântica de nova aba e fronteiras de prova.

## 13. NEXT_CURSOR

```text
NEXT_CURSOR=
PROVE_ORACLE_RESPONSE_TO_EXISTING_PERCEPTION_ENVELOPE
→ RENDEZVOUS_WITH_CURRENT
→ COUNTERPROOF
→ DELTA_SURVIVOR_OR_DROP
→ ONLY_THEN_WRITER
```

Não criar hook novo antes de provar que o owner existente não consegue absorver o delta.
