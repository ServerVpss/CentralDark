# CENTRALDARK — TRIGGER FABRIC FULL PACKAGE

Família canônica para interligar gatilhos, owners, motores, evidência e evolução
da Casa sem criar cérebro concorrente, dispatcher, MCP, router, promotor ou
workflow paralelo.

## Continuidade do PR-mãe

```text
PR_MAE_PROVENANCE=#1189
PR_MAE_STATUS=MERGED
THIS_PACKAGE=CONTINUATION_ON_CURRENT_MAIN
HISTORY_IS_NOT_CURRENT_STATE=true
DELTA_USEFUL_ONLY=true
ONE_SYSTEM_ONLY=true
SECOND_BRAIN_LOGICAL=ONE
TWO_COGNITIVE_ROLES_ONE_LOGICAL_BRAIN=true
```

O PR #1189 foi a bancada de **INTENÇÃO ÚNICA, PROPRIEDADES E CICLO MESTRE**.
Como ele já foi mergeado, a continuidade não ressuscita a branch histórica:
parte da `main` viva, deduplica o que já entrou e preserva somente deltas que
aumentam capacidade, prova, owner binding ou reduzem complexidade.

A linhagem e a disposição dos deltas estão em
`RECONCILIACAO-PR-MAE-1189.md`.

## Trigger mestre humano

```text
!CENTRALDARK
```

Expansão auditável:

```text
#ACORDAR
→ !CALIBRAR
→ !MULTIBUSSOLA
→ !META_LUPA
→ !RECONCILIAR
→ !CONTRAPROVA
→ !REMEDICAO
→ !FIXED_POINT
→ !REGISTRA
→ !BOOT
```

Todo bot/modelo/agente que entra na CentralDark herda a mesma Casa.
Motor/provider nunca vira autoridade.

## Corpo reconciliado

A arquitetura completa está em `ARCHITECTURE.md` e `ARCHITECTURE.mmd`.

```text
CHEFE
→ SOL/T0
→ MASTER CYCLE
→ META_LUPA
→ CAPABILITY ROUTER
→ CÉREBRO DA FRENTE / OPERACIONAL
→ JARVIS ONE CORE/MANY ARMS
→ AGENT CALL + HUB
→ OMNI ROUTER
→ REPLACEABLE ENGINES
→ OVERCLOCK ROLES
→ ENXAME / ARSENAL
→ HERMES/N7/WORKERS
→ TOOLS/BUILDERS
→ EXECUTION
→ TRACE + EVIDENCE
→ CÉREBRO DE RETAGUARDA / MEMORY LAYER
→ RENDEZVOUS
→ META_LUPA HARVEST
→ MEMORY LINKER / DREAM REVIEW / PATTERN DISCOVERY
→ EVOLUTION GATES
→ ONE WRITER
→ COUNTERPROOF / REGRESSION
→ REALITY JUDGE
→ PROMOTE | REJECT
→ MISSION FIXED POINT
→ OURO / OWNER / CRYSTAL / FLASH
→ NEXT #ACORDAR
```

### Dois papéis cognitivos, uma Casa

```text
CÉREBRO DA FRENTE
= missão + decisão + execução atual

CÉREBRO DE RETAGUARDA
= memória + minério + fragmentos + histórico + proveniência

MEMORY LINKER / DREAM REVIEW
= mineradores/revisores da retaguarda, não o cérebro nem autoridade

SECOND_BRAIN_LOGICAL=ONE
TWO_COGNITIVE_ROLES != TWO_AUTHORITIES
```

O contrato canônico dessa distinção é `SECOND-BRAIN.yml`.

## Ingressos de contexto e matéria — mesma Casa

O material salvo `Screenpipe Activity reshapes CentralDark integration` foi
reconciliado como **delta de ingestão**, não como Browser V2 ou segundo
Harvester. O owner continua `MATERIAL-INGEST.md`.

```text
CONVERSA / SUPERFÍCIE AUTORIZADA
→ contexto necessário?
→ Screenpipe | HTML salvo | Recorder | screenshot | PDF | runtime/logs
→ provenance + tempo + origem
→ sanitize / quarantine sensitive
→ dedupe + delta
→ CÉREBRO DE RETAGUARDA
→ Harvester / Memory Linker / Knowledge Compiler
→ Reality Judge
→ ouro | NO_CHANGE
```

Regras:

```text
SURFACE_ADAPTER != AUTHORITY
TEMP_LOCALSTATE = FONTE, NÃO MEMÓRIA
SCREENPIPE = SENSOR/CONTEXTO, NÃO CÉREBRO
SCREENPIPE_TO_HERMES = UNKNOWN ATÉ PROVA CAUSAL
SAVED_HTML != LIVE_STATE
PRINT_PDF != LIVE_STATE
SCREENSHOT != RUNTIME_PROOF
NO_BLIND_TEMP_OR_CREDENTIAL_HARVEST=true
```

A Casa escolhe a menor representação suficiente: HTML para estrutura,
screenshot para aparência, Recorder para sequência, PDF para documento e
runtime/log/network/storage para estado vivo quando realmente medidos.

## MODEL_TOUCH

O Omni Router reutiliza o Evidence Envelope existente. Quando a rota de
telemetria estiver configurada, cada invocação concluída pode emitir um
`model_touch` sanitizado para `agent-log`.

```text
OMNI_ROUTER_RECEIPT
→ MODEL_TOUCH
→ agent-log
→ evidence-envelope
→ agent_events
→ memory rearguard
```

A telemetria é observação:

```text
TELEMETRY_CONFIGURED != TELEMETRY_DELIVERED
TELEMETRY_FAILURE != PROVIDER_FAILURE
PROVIDER_INVOCATION != ACTION_PROOF
```

## IA local

IA local não é promovida por presença de documentação, configuração ou desejo
futuro.

```text
LOCAL_AI_RUNTIME=UNKNOWN
LOCAL_AI_DEFERRED_UNTIL_MEASURED=true
CONFIGURED != ACTIVE
HEALTH != INVOCATION_PROVEN
```

ODS e qualquer runtime/modelo local permanecem reserva de capacidade até
medição no alvo vivo + invocação + receipt + contraprova.

## Reservas preservadas

O pacote registra como disponibilidade futura, sem instalar ou transformar em
governo:

- ODS — corpo de capacidades locais, `DEFERRED_UNTIL_MEASURED`;
- Buzz — collaboration/event-view adapter sobre Evidence/Hub;
- OpenMausBot — roster/UX sobre agentes da Casa;
- Open-Lovable — fonte de padrão para o Builder, cujo owner continua Bolt;
- Grok Build — futuro engine candidato;
- AIOS/[EXT_REDACTED] — deltas externos candidatos, sem importar control plane.

`RESERVE != ACTIVE_RUNTIME`.

## Conteúdo desta família

- `ARCHITECTURE.md`
- `ARCHITECTURE.mmd`
- `CONTRACT.yml`
- `TRIGGERS.yml`
- `ENGINE_BINDING.yml`
- `MASTER-CYCLE.yml`
- `ADVERSARIAL_HANDOFF.yml`
- `ARTIFACT-PROPERTIES.yml`
- `SECOND-BRAIN.yml`
- `MATERIAL-INGEST.md`
- `LIVE_STATE.md`
- `HISTORY.md`
- `COUNTERPROOF.md`
- `RASTRO.md`
- `RECEIPT.md`
- `SOURCES.json`
- `RECONCILIACAO-PR-MAE-1189.md`

A workflow existente `.github/workflows/trigger-fabric-package.yml` gera:

- `ARCHITECTURE.png`;
- `MANIFEST.json`;
- `SHA256SUMS.txt`;
- `VERIFY-RESULT.txt`;
- `CENTRALDARK_TRIGGER_FABRIC_FULL_PACKAGE.zip`.

## Gate de integridade estrutural

O pacote não considera mais `arquivo existe + string existe` suficiente para
contratos YAML.

```text
YAML_TEXT_PRESENT != YAML_PARSE_PASS
YAML_PARSE_PASS != UNIQUE_KEYS_PASS
COMPONENT_PASS != CONTRACT_ARTIFACT_PASS
```

`verify_package.py` parseia os YAMLs do pacote com PyYAML e falha em chave
duplicada. A fresh-extraction counterproof aplica o mesmo verificador ao ZIP
extraído.

## CI / PR / labels — REUSE_BEFORE_CREATE

Não nasce segundo pipeline. Reutiliza:

```text
.github/workflows/porta-de-entrada.yml
.github/workflows/autonomia-promocao.yml
.github/workflows/trigger-fabric-package.yml
```

Label é sinal, não autoridade. `👑 PERMITO-SEGREDO` representa autoridade
humana aplicável; `✅ PR CONFIRMADO` é resultado derivado pós-prova.

## Anti-ruído e continuidade

```text
NO_NEW_INFORMATION → NO_CHANGE → NEXT
BYTE_IDENTICAL → PROCESS_ONCE_KEEP_PROVENANCE
LAST_GOOD_STATE → INPUT_DIFF → TARGETED_REVALIDATION → NEXT_CURSOR
MODEL_SWITCH != RESET
SESSION_SWITCH != RESET
PAST_PR != CURRENT_STATE
```

## Limite da prova

```text
PACKAGE_100_PERCENT = permitido somente se o verificador do pacote passar
GLOBAL_RUNTIME_100_PERCENT = NOT_PROVEN
ENGINE_BINDING_DOCUMENTED != ENGINE_RUNTIME_LOADED
LOCAL_AI_DOCUMENTED != LOCAL_AI_ACTIVE
SCREENPIPE_CONFIGURED != SCREENPIPE_TO_HERMES_PROVEN
```

O pacote prova integridade/reprodutibilidade do artefato e das catracas
aplicáveis. Código no GitHub não prova que o mesmo runtime está vivo agora em
Windows/VPS/outro alvo.

## Base viva

A família não congela HEAD como verdade permanente. Qualquer HEAD posterior,
runtime novo ou troca material de alvo exige remedição antes de promover claim
de estado atual.
