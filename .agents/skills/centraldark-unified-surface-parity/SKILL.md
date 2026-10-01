---
name: centraldark-unified-surface-parity
description: Ponte operacional para paridade Texto/Voz/Work/Desktop, Intent Gateway, Auto-Grill, decisão type-safe opcional e replay de cristais provados sem criar arquitetura paralela.
owners:
  - AGENTS.md
  - LEIA-ME-IA.md
  - .agents/skills/meta-lupa/SKILL.md
  - .agents/skills/centraldark-intent-deploy-router/SKILL.md
  - .claude/skills/synced/voice-semantic-classifier/SKILL.md
  - docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/RASTRO.md
canonical_id: CENTRALDARK_UNIFIED_SURFACE_PARITY_01
trigger: "!CENTRALDARK"
status: contract_first_engine_later
---

# CENTRALDARK_UNIFIED_SURFACE_PARITY_01

Este skill não cria um segundo sistema. Ele amarra owners existentes para que Texto, Voz, Work, Desktop, Hermes, SOL e futuros modelos consumam o mesmo barramento de capacidades da CentralDark.

```text
MODELO = motor substituível
CAPABILITY_BUS = mão/ferramenta real
CONTRATO = como qualquer motor usa a mão
REALIDADE = juiz
```

## 1. Gatilho mestre

Quando a entrada iniciar ou implicar `!CENTRALDARK`, `CentralDark`, `#ACORDAR`, `!CALIBRAR`, `!AUTO_GRILL`, `!GRILL_ME` ou comando operacional equivalente, carregue o funil:

```text
raw_input
→ normalize_context
→ load_INTENT_CORE
→ load_relevant_crystals
→ self_grill_before_answer
→ intent_score
→ decision_gate
→ owner_existing_first
→ execute_or_ask
→ verify_effect
→ receipt
```

A entrada pode ser texto, voz, imagem, vídeo, arquivo, screenshot, log, GitHub, Desktop Commander, MCP, Obsidian, Casa ou VPS. O formato muda; o funil não muda.

## 1.1 Autoridade do CHEFE ≠ claim do modelo

```text
CHEFE_INTENT_IS_AUTHORITY=true
CHEFE_COMMAND_IS_NOT_MODEL_CLAIM=true
MODEL_CLAIM_REQUIRES_PROOF=true
MODEL_MAY_NOT_DOWNGRADE_CHEFE_INTENT_TO_UNKNOWN=true
UNKNOWN_APPLIES_ONLY_TO_UNMEASURED_EXTERNAL_STATE=true
EXTERNAL_REALITY_STILL_REQUIRES_MEASUREMENT=true
```

A intenção explícita do CHEFE define o destino. O modelo não usa a própria
incerteza para reduzir, reinterpretar ou devolver como `UNKNOWN` uma ordem
clara. Prova é obrigação do modelo para claims de leitura, tool call, escrita,
execução, estado e resultado. Estado externo não medido continua fora de PASS.

## 2. Replay de cristal provado

```text
CRISTAL_PROVADO = REPLAY_FIRST
PROVE_ONLY_NEW_INTEGRATION=true
REUSE_BEFORE_CREATE=true
EVOLVE_EXISTING_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
NO_V1_V2_V3_PARALLEL_OWNER=true
```

Cristal provado não é redescoberto. O fluxo correto é:

```text
receber cristal/pacote/nota/script/prova
→ identificar ID/SHA/hash/fingerprint/manifest/receipt
→ localizar owner equivalente na main
→ se não existir owner direto, procurar owner semântico equivalente
→ comparar fingerprint/estrutura/destino descrito
→ plugar somente o que falta
→ costurar binding mínimo
→ testar efeito vivo
→ registrar receipt
```

Proibido auditar o sistema inteiro sem ordem explícita. Proibido reprovar cristal já provado sem evidência nova. Proibido criar owner paralelo para encaixar material antigo.

## 3. Auto-Grill / Grill-Me

Antes de perguntar ao CHEFE, o executor entrevista a si mesmo usando contrato, cristais, histórico, owners e realidade atual.

Perguntas obrigatórias:

```text
Qual é a intenção real do CHEFE?
Isso é observação ou ordem explícita?
Existe cristal provado?
Qual é o owner correto?
O que exatamente mudou?
Qual é o menor delta possível?
O que precisa ser testado agora?
O que já não precisa ser provado de novo?
Qual rota observa o efeito?
Qual receipt fecha a realidade?
```

Se a resposta está no código, procurar no código. Se está no log, procurar no log. Se está no cristal, reaproveitar o cristal. Perguntar ao CHEFE somente quando restar lacuna real.

## 4. Decisão type-safe opcional GEV/JEV

GEV/JEV não substitui Hermes, SOL nem o capability bus. Ele entra apenas como micropeça opcional de decisão calibrada.

```text
Hermes/SOL normaliza estado
→ Auto-Grill reduz lacunas
→ GEV/JEV ou motor equivalente retorna decisão tipada
→ gate de confiança decide ação
```

Contrato de saída:

```yaml
decision_enum:
  - EXECUTE
  - PROPOSE_ONLY
  - ASK_CHEFE
  - REJECT_OUT_OF_SCOPE
  - PLATFORM_UNAVAILABLE
confidence: 0.0-1.0
reason: curto_auditavel
missing: lacunas_reais_apenas
```

Regra: `CONTRACT_FIRST_ENGINE_LATER`. Primeiro cristaliza o contrato; depois troca o motor se houver credencial/transporte.

## 5. Paridade de superfícies

```text
TEXT ⇄ VOICE ⇄ WORK ⇄ DESKTOP
same_intent_core=true
same_owner_fabric=true
same_capability_bus_when_supported=true
same_receipt_law=true
```

Capacidades que devem ser expostas quando a plataforma suportar:

```text
GitHub read/write
create/update files
create branch / open PR / commit / comment receipt
Desktop Commander read/write/exec
CentralDark MCP calls
Plugin Creator create/update
artifact export
file upload/download
session tracing
tool call tracing
usage/tokens
runtime logs
health probes
intent scoring
Auto-Grill
GEV/JEV typed decision adapter
```

Se uma superfície não expõe a ferramenta real, marcar `PLATFORM_UNAVAILABLE`. Não simular execução. Não dizer que enviou arquivo, subiu commit, usou Desktop Commander ou publicou plugin sem tool call real e receipt.

## 6. Voice Tool Binding

```text
VOICE_TOOL_CALL_VISIBILITY_REUSES_UNIFIED_SURFACE_OWNER=true
TOOL_CALL_EXECUTED != TOOL_CALL_VISIBLE_IN_SIDEBAR
VOICE_MISSING_RENDERER_IS_NOT_EXECUTION_FAILURE=true
VOICE_TOOL_RESULT_IS_NOT_RENDERER_PROOF=true
VOICE_SURFACE_ID_IS_PROVENANCE_ONLY=true
```

A Voz usa o mesmo `SESSION_ID -> TRACE_ID -> TOOL_CALL_ID -> USAGE/TOKENS -> RECEIPT`
quando a plataforma expõe a telemetria. O classificador semântico interpreta a intenção;
ele não vira segundo owner do renderer nem cria trilha paralela.

## 6.1 Papel da Voz no sistema único

```text
VOICE = SURFACE + INTENT_ADAPTER
VOICE != SECOND_BRAIN
VOICE != SECOND_AUTHORITY
VOICE != EXECUTION_PERMISSION_GATE

VOICE_INPUT
→ SAME_INTENT_CORE
→ META_GRILL
→ CLAUSE_RESOLUTION
→ EXISTING_OWNER
→ CAPABILITY_BUS
→ EFFECT
→ COUNTERPROOF
→ REALITY_JUDGE_AFTER_EFFECT
→ RECEIPT
```

A Voz não zera intenção por turno e não transforma `UNKNOWN` em freio global. Ela preserva o Fio Verde, resolve o que é derivável e devolve ao humano somente fronteira humana material.



A lacuna observada é `Voice Tool Binding`: a superfície de voz pode ter permissão conceitual, mas não expor a action real na sessão.

```text
PERMISSION_EXISTS != TOOL_EXPOSED
TOOL_LISTED != TOOL_ACTIVE
VOICE_CLAIM_WITHOUT_TOOL_CALL=INVALID
```

Voz deve herdar as mesmas actions do Texto quando a plataforma suportar. Onde não suportar, o executor deve declarar `PLATFORM_UNAVAILABLE` e entregar next cursor para Worker/Cloud Code/Hermes.

## 6.1 Sessão, tracing e saída equivalentes

Para a mesma intenção/tarefa, Texto e Voz usam um único `SESSION_ID` canônico. Cada evento preserva `SURFACE_ID` para indicar a origem, sem criar sessão ou trilha exclusiva da Voz.

A lateral de observabilidade deve mostrar, na mesma sessão e em ordem:

- sessões e estado;
- tool calls com identificadores e resultado;
- uso/tokens e agregados da sessão;
- receipt e próximo cursor.

O contrato de saída estruturada é igual nas superfícies: `INTENT_ID`, `DECISION`, `OWNER`, `ACTION_RESULT`, `EVIDENCE`, `COUNTERPROOF`, `RECEIPT_ID` e `NEXT_CURSOR`. A apresentação pode acompanhar voz ou texto; intenção, owner, ação, prova e receipt permanecem iguais.

Se a plataforma não expuser sessão, tracing, tool calls ou usage, marcar aquela capacidade como `PLATFORM_UNAVAILABLE`. Não abrir caixa-preta/trilha separada para Voz e não afirmar paridade sem prova.

## 6.2 Roteamento híbrido multi-conta por capability

Este é o mesmo capability bus; não nasce bridge, router, owner ou plugin paralelo. Conta, link e device são bindings de transporte descobertos em runtime.

```text
HYBRID_MULTI_ACCOUNT_CAPABILITY_ROUTING=true
CAPABILITY_FIRST_TOOL_SECOND=true
ACCOUNT_ALIAS_IS_LOGICAL_BINDING=true
RAW_ACCOUNT_EMAIL_IS_NOT_CANONICAL_ID=true
LINK_ID_DISCOVER_AT_RUNTIME=true
DEVICE_ID_DISCOVER_AT_RUNTIME=true
DEVICE_NAME_ALONE_IS_NOT_ROUTE=true
CURRENT_ACCOUNT_TOOL_MISS != CAPABILITY_UNAVAILABLE
CURRENT_LINK_DEVICE_OFFLINE != ORGANISM_CAPABILITY_UNAVAILABLE
PERMISSION_EXISTS != TOOL_EXPOSED
TOOL_EXPOSED != TOOL_EXECUTED
NO_PARALLEL_ADAPTER_FOR_MISSING_TOOL=true
REUSE_EXISTING_CAPABILITY_ROUTE_FIRST=true
```

Rota mínima para qualquer superfície, inclusive Voz:

```text
INTENT
→ CAPABILITY_NEEDED
→ CURRENT_ACCOUNT_NATIVE_TOOL_IF_EXPOSED
→ ALTERNATE_AUTHORIZED_ACCOUNT_SAME_CAPABILITY
→ CENTRALDARK/RDC_ONLINE_DEVICE_WITH_CAPABILITY
→ EXISTING_CASA_OR_VPS_OWNER
→ EXISTING_API_OR_MCP_OWNER
→ PLATFORM_UNAVAILABLE_OR_UNKNOWN_ONLY_AFTER_ALL_AUTHORIZED_EXISTING_ROUTES_FAIL
```

Regras de binding:

- persistir alias lógico da conta e capability; redescobrir `link_id` e `device_id` vivos por sessão;
- dois devices com o mesmo nome em contas diferentes não são a mesma rota;
- ferramenta sem namespace dedicado pode ser atendida por capability equivalente já existente, sem criar wrapper novo;
- Voz, Texto, Work, Desktop, Hermes e futuras superfícies usam a mesma matriz híbrida;
- falha em uma conta abre failover autorizado para a outra conta antes de declarar ausência global;
- estado temporal de device pertence ao receipt, não ao contrato eterno.

Exemplos de equivalência sem arquitetura nova:

```text
VOICE_GITHUB_MISSING_ON_SURFACE → GitHub connector existente; se não exposto, procurar rota autorizada equivalente; nunca criar Voice-GitHub
NO_DEDICATED_TAILSCALE_NAMESPACE → CENTRALDARK/RDC + owner/runtime Tailscale existente
NO_DEDICATED_PM2_SSH_DOCKER_NAMESPACE → CENTRALDARK/RDC no corpo autorizado + owner existente
PROVIDER_NAMESPACE_ABSENT → API/MCP/provider adapter existente; depois RDC/VPS se aplicável; senão UNKNOWN
```

## 7. Estratégia de execução

```text
Worker/Cloud Code = implementação pesada
ChatGPT Texto = oráculo + executor quando tool aparece
Voice = superfície humana rápida com binding explícito
Hermes/Casa = executor local vivo
GitHub = cristal verificável
```

A capacidade não pertence ao modelo. Ela pertence ao barramento. Qualquer modelo autorizado deve consumir a mesma capability real.

## 8. Validação por blast radius

```text
VALIDATION_COST_SHOULD_SCALE_WITH_BLAST_RADIUS=true
```

- docs/cristal sem runtime owner: fast-path + render/parse mínimo + receipt.
- runtime/src/deploy/workflow: teste do owner + contraprova viva + receipt.
- pacote cristal com manifest/fingerprint: replay primeiro + provar só encaixe novo.

## 9. Resposta esperada

Toda execução deve responder em `PASS | UNKNOWN | BLOCKED`:

```text
PASS: efeito medido e receipt registrado
UNKNOWN: ferramenta/estado/fonte não disponível ou não medido
BLOCKED: limitação real, humana, plataforma ou policy
```

Resposta sem rastro para claim de escrita é inválida.

## 10. Frase núcleo

```text
NÃO É DAR PODER AO MODELO.
É EXPOR A MESMA CAPABILITY REAL PARA QUALQUER MODELO AUTORIZADO.
```

## Portão antes de subir (toda caneta)

Várias canetas, uma main. Antes de qualquer envio direto na main, qualquer superfície (Claude, ChatGPT texto/voz/Work, Cowork, Hermes) roda a receita selada — não um portão inventado na hora:

```text
RECIPE=MULTI_PEN_MAIN_GATE_PATH
REGISTRY=docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/PROVEN-CLAIMS.lock.json
REPLAY=claims.MULTI_PEN_MAIN_GATE_PATH.proven_path_replay.replay_command
REUSE_CRYSTAL → pode subir
REVALIDATE → arquivo do portão mudou: rodar os 5 comandos, passar, re-selar (reseal-fingerprint) com causa
DELTA_NEW → não subir; rasgar a causa
PUSH_ONLY_AFTER_GATE_GREEN_ON_REBASED_HEAD=true
EVERY_DIRECT_MAIN_COMMIT_HAS_1562_RECEIPT=true
FULL_FILE_WRITE_MUST_START_FROM_CURRENT_MAIN_BLOB=true
WRITE_FROM_STALE_BASE_SILENTLY_REVERTS_OTHER_PEN=FORBIDDEN
FILES_CHANGED_IN_GATE → RESEAL_BEFORE_PUSH (replay=REVALIDATE não é verde)
```
