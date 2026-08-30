# CENTRALDARK — arquitetura inteira reconciliada

> Continuação arquitetural do PR-mãe **#1189 — INTENÇÃO ÚNICA, PROPRIEDADES E CICLO MESTRE**.
> O PR #1189 foi mergeado; este corpo continua a mesma intenção sobre a `main`
> viva. Histórico é proveniência. Estado atual precisa ser medido.

A Trigger Fabric continua sendo **contrato de interligação**, não um novo
orquestrador. Esta página consolida os owners que nasceram ou amadureceram
depois do PR-mãe sem criar `V2`, cérebro concorrente, segundo router ou segundo
Reality Judge.

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_OWNER_PER_CAPABILITY=true
ONE_WRITER_PER_SCOPE=true
PARALLELIZE_PERCEPTION=true
SERIALIZE_MUTATION=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
HISTORY_IS_NOT_CURRENT_STATE=true
MODEL_IS_REPLACEABLE=true
SECOND_BRAIN_LOGICAL=ONE
TWO_COGNITIVE_ROLES_ONE_LOGICAL_BRAIN=true
```

## 1. A cadeia inteira

```text
SEGREDO/CHEFE
      ↓
INTENÇÃO + DESTINO + PROOF TARGET
      ↓
SOL / T0
      ↓
!CENTRALDARK MASTER CYCLE
      ↓
#ACORDAR → !CALIBRAR → !MULTIBUSSOLA
      ↓
!META_LUPA → !RECONCILIAR → !CONTRAPROVA
      ↓
!REMEDICAO → !FIXED_POINT → !REGISTRA → !BOOT
      ↓
CAPABILITY CONTRACT ROUTER
      ↓
JARVIS — ONE CORE / MANY ARMS
      ↓
READ-ONLY FANOUT / RENDEZVOUS / ONE WRITER
      ↓
CENTRALDARK_AGENT_CALL_V1 + HUB MISSION/CLAIM
      ↓
CENTRALDARK OMNI ROUTER
      ↓
REPLACEABLE ENGINES
      ├─ OpenAI
      ├─ Claude Code
      ├─ Hermes endpoint
      ├─ Nous
      └─ futuros motores medidos
      ↓
OVERCLOCK ROLE TAXONOMY
      ├─ SCOUT
      ├─ BUILDER
      └─ REVIEWER
      ↓
ENXAME / FAN-OUT + FAN-IN
      ↓
ARSENAL / PARALLEL / DEBATE / JUDGE
      ↓
HERMES CORE + N7 + WORKERS
      ↓
TOOLS / MCP / APIs / BUILDERS
      ↓
EXECUÇÃO
      ↓
CAUSAL TRACE + EVIDENCE RECEIPT
      ↓
CÉREBRO DE RETAGUARDA / MEMORY LAYER
      ├─ matéria bruta
      ├─ fragmentos
      ├─ histórico
      ├─ proveniência
      └─ conhecimento candidato
      ↓
EVIDENCE ENVELOPE
      ↓
RENDEZVOUS + DEDUPE + CONTRADIÇÃO
      ↓
META_LUPA HARVEST
      ↓
MEMORY LINKER + DREAM REVIEW + PATTERN DISCOVERY
      ↓
EVOLUTION CANDIDATE
      ↓
EVOLUTION GATE / SERIES GATE / AGI CLAIM GATE
      ↓
ONE WRITER
      ↓
BEFORE → AFTER / EXPERIMENTO
      ↓
SELF VERIFICATION
      ↓
CONTRAPROVA
      ↓
REGRESSION GATE
      ↓
PROOF OWNERSHIP
      ↓
REALITY JUDGE
   ┌───────┴────────┐
   ↓                ↓
PROMOTE       REJECT / ROLLBACK
   └───────┬────────┘
           ↓
FIXED POINT DA MISSÃO
           ↓
REGISTRO DO OURO / OWNER CANÔNICO
           ↓
PRÓXIMO #ACORDAR ↺
```

A quantidade de braços nunca multiplica autoridade nem Writers:

```text
N_JANELAS
N_MODELOS
N_AGENTES
N_TESTES
→ UMA INTENÇÃO
→ UMA CASA
→ UM OWNER POR CAPACIDADE
→ UM WRITER POR ESCOPO MUTÁVEL
→ REALIDADE JULGANDO
```

### 1.1 Dois cérebros funcionais, um cérebro lógico

A Casa preserva a distinção histórica que o PR #1131 reconciliou como
`SECOND_BRAIN_LOGICAL=ONE`. Existem **dois papéis cognitivos complementares**,
mas não duas autoridades ou dois sistemas concorrentes.

```text
🧠 CÉREBRO DA FRENTE / OPERACIONAL
missão + decisão + roteamento + execução
        │
        │ trabalha e deixa rastros observáveis
        ▼
TRACE + EVIDENCE + RECEIPT
        │
        ▼
🧠 CÉREBRO DE RETAGUARDA / MEMÓRIA
preserva matéria + minério + fragmentos + histórico + proveniência
        │
        ▼
MEMORY LINKER / SESSION HARVESTER
        │
        ▼
DREAM REVIEW / PATTERN DISCOVERY
        │
        ▼
META_LUPA + CONTRAPROVA + REALITY
        │
        ▼
OURO → OWNER / CRYSTAL / FLASH
        │
        └──────────────→ próxima missão operacional
```

A correção semântica importante é:

```text
MEMORY_REARGUARD = CÉREBRO/MEMÓRIA DE RETAGUARDA
MEMORY_LINKER = MINERADOR, NÃO O CÉREBRO
DREAM_REVIEW = REVISOR/MINERADOR, NÃO AUTORIDADE
BRAIN/OBSIDIAN = SUPERFÍCIE DE MEMÓRIA/NAVEGAÇÃO, NÃO RUNTIME SOBERANO
GRAPH/VECTOR = ÍNDICES DERIVADOS, NÃO AUTORIDADE
TWO_COGNITIVE_ROLES != TWO_AUTHORITIES
SECOND_BRAIN_LOGICAL=ONE
```

O owner dessa distinção é `SECOND-BRAIN.yml`; este mapa apenas a projeta.

## 2. Owner por órgão

| Capacidade | Owner observado |
|---|---|
| Boot/governança | `LEIA-ME-IA.md`, `AGENTS.md`, `docs/CONSCIENCIA/00-PORTA-DE-ENTRADA-IA.md` |
| Ciclo mestre | `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/` |
| Segundo cérebro lógico / retaguarda de memória | `docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SECOND-BRAIN.yml` |
| Navegação/memória derivada | `docs/BRAIN/00-MAPA-SISTEMA/BRAIN.md` |
| `!MULTIBUSSOLA` | `docs/CONSCIENCIA/MULTIBUSSOLA.md` |
| MetaLupa | `.agents/skills/meta-lupa/` |
| Capability Router | `.agents/skills/capability-contract-router/` |
| JARVIS / coordenação | `docs/ARQUITETURA/JARVIS-ORQUESTRACAO-DELTA-E-ESCRITOR-UNICO.md` |
| Agent call | `scripts/agent-call.mjs` |
| Missões Hermes | `apps/modulos/HERMES-CORE/core/orchestrator.mjs` |
| Hermes Core | `apps/modulos/HERMES-CORE/` |
| Omni Router | `apps/modulos/elite-gateway/scripts/centraldark_omni_router.py` |
| Engine gap closure | `.agents/skills/engine-gap-closure/` |
| Evidence Envelope | `supabase/functions/_shared/evidence-envelope.mjs` |
| Evidence ingest | `supabase/functions/agent-log/index.ts` |
| MCP trace context | `apps/modulos/mcp/src/trace-context.js` + `correlation.js` |
| Memory Linker / Dream Review / patterns | `scripts/memory-linker/` |
| Colheita de sessão | `.agents/skills/session-intelligence-harvester/` |
| Cristalização | `.agents/skills/knowledge-compiler/` |
| N7 | `.agents/skills/meta-lupa/agents/nivel-7/` |
| Evolution gate | `.agents/skills/meta-lupa/scripts/evolution_gate.py` |
| Evolution series | `.agents/skills/meta-lupa/scripts/evolution_series_gate.py` |
| AGI external claim gate | `.agents/skills/meta-lupa/scripts/agi_claim_gate.py` |
| Proof ownership | `docs/CONSCIENCIA/PROOF-OWNERSHIP.json` |
| Builder | `apps/modulos/Bolt/` |
| Gate global de entrada | `.github/workflows/porta-de-entrada.yml` |
| Juiz/promotor | `.github/workflows/autonomia-promocao.yml` |
| Pacote/counterproof | `.github/workflows/trigger-fabric-package.yml` |

Nenhuma marca de modelo vira owner.

## 3. MODEL_TOUCH — quem passa deixa rastro

O Omni Router já conhece o motor resolvido, modelo resolvido, duração, fallback
e a fronteira `ACTION_IS_NOT_PROOF`. O Evidence Envelope já conhece
`mission_id`, `writer_scope`, `sha`, `trace_id`, latência, tokens, custo,
resultado e fingerprint causal.

A costura mínima é:

```text
MODEL / ENGINE INVOCATION
→ OMNI ROUTER RECEIPT
→ MODEL_TOUCH EVENT
→ agent-log
→ Evidence Envelope
→ causal dedupe
→ public.agent_events
→ CÉREBRO DE RETAGUARDA / matéria observável
→ MetaLupa Harvest
```

Regras:

```text
TELEMETRY_CONFIGURED != TELEMETRY_DELIVERED
ROUTER_HEALTH_PASS != PROVIDER_INVOCATION_PASS
PROVIDER_INVOCATION_PASS != ACTION_PROOF
TELEMETRY_FAILURE != PROVIDER_FAILURE
TELEMETRY_FAILURE_MUST_BE_VISIBLE
MISSION_ID_MUST_NOT_BE_FABRICATED
SECRETS_MUST_BE_REDACTED
```

O evento não copia raciocínio privado. Guarda apenas o observável necessário
para causalidade, avaliação e aprendizado.

## 4. MetaLupa regenerativa sem MetaLupa V2

```text
META_LUPA_TRACE
→ EVALUATION
→ EXPERIMENTATION
→ SELF_VERIFICATION
→ META_IMPROVEMENT
→ CROSS_META_REFINEMENT
→ EVOLUTION_GATE
→ COUNTERPROOF
→ REGRESSION
→ REALITY_JUDGE
```

Se sobrevive:

```text
META_LUPA_ATUAL + DELTA_PROVADO
→ MESMO OWNER CANÔNICO ATUALIZADO
```

Se falha:

```text
REJECT
→ ROLLBACK
→ aprendizado/proveniência preservados
```

A MetaLupa não é “final”; a missão é que pode atingir ponto fixo:

```text
MISSION_FIXED_POINT=true
META_LUPA_EVOLUTION=EVENT_DRIVEN
META_LUPA_FINAL=false
NO_NEW_INFORMATION → FIXED_POINT → STOP
```

## 5. Overclock, Enxame e Arsenal

### Overclock

O garimpo do PR #1300 preservou a taxonomia:

```text
SCOUT    → descobre / explora em leitura
BUILDER  → executa dentro do writer_scope
REVIEWER → revisa / contraprova / julga sem colisão de Writer
```

O catálogo recuperado não implementava 23 agentes completos.

```text
TAXONOMIA_NOMEADA != AGENTE_IMPLEMENTADO
CATALOGO != CAPACIDADE
```

A taxonomia entra como **papel atribuível pelo JARVIS/Capability Router**.
Não nasce um segundo orquestrador.

### Enxame Ômega

Permanece método de fan-out/fan-in:

```text
PERCEPÇÕES INDEPENDENTES
→ CRÍTICA / CONTRAPROVA
→ RENDEZVOUS
→ REALIDADE
```

Quantidade de respostas não é verdade. Modelo-voto não governa o veredito.

### Arsenal

O Arsenal é superfície de router/parallel/debate/judge. Ele pode executar
conselhos e debates; não substitui o Reality Judge nem o owner de roteamento
por capacidade.

## 6. Dream Review e evolução

O fluxo atual preserva uma fronteira importante:

```text
MATÉRIA NO CÉREBRO DE RETAGUARDA
→ Memory Linker
→ Dream Review
→ sanitização + proveniência + HEAD
→ dedupe
→ candidato
→ Pattern Discovery
→ CENTRALDARK_AGENT_CALL_V1 validado
→ TRANSPORTE FÍSICO SEPARADO
```

`transport_execution=false` histórico continua sendo uma fronteira até o
transporte aplicável ser medido. Não inventar wiring porque o contrato existe.

Recorrência não é prova causal:

```text
PATTERN != PROOF
RECURRENCE_ONLY_NOT_CAUSAL_PROOF
```

## 7. IA local — só depois da medição

A disponibilidade futura de IA local fica preservada, mas o estado atual é:

```text
LOCAL_AI_RUNTIME=UNKNOWN
LOCAL_AI_DEFERRED_UNTIL_MEASURED=true
REPOSITORY_REFERENCE != RUNTIME_PROOF
CONFIGURED != ACTIVE
HEALTH != PROVIDER_INVOCATION_PROOF
```

Para sair de `UNKNOWN`, medir no alvo vivo:

```text
TARGET
→ binary/endpoint observado
→ configuração observada
→ invocação real
→ receipt preso ao engine/model
→ contraprova
→ Reality Judge
```

Até isso existir, nenhum local model entra no routing padrão como se estivesse
ativo.

## 8. Reservas de futuro — disponibilidade sem governo

| Reserva | Classificação | Papel possível | Regra |
|---|---|---|---|
| ODS | `DEFERRED_UNTIL_MEASURED` | corpo de capacidades locais | não é cérebro/autoridade |
| Buzz | `RESERVE_REFERENCE` | workspace/rooms/event-view | reutiliza Evidence/Hub; não cria event bus |
| OpenMausBot | `RESERVE_REFERENCE` | roster/UX de agentes | view sobre JARVIS/Hub |
| Open-Lovable | `RESERVE_REFERENCE` | fonte de padrão para Builder | owner continua Bolt |
| Grok Build | `FUTURE_ENGINE_CANDIDATE` | motor substituível | invocação precisa ser medida |
| AIOS/AI-OX | `CANDIDATE_EXTERNAL_LEARNING` | deltas de impacto/gates/mapa | raw runtime/control-plane rejeitado |

Preservar no mapa não significa instalar, ligar ou promover.

## 9. Builder — owner presente, gaps explícitos

O owner é `apps/modulos/Bolt/`. Estado preservado:

```text
BUILDER_CODE_PRESENT=true
PREVIEW_RUNTIME=UNPROVEN
WORKSPACE_PER_PROJECT=NOT_IMPLEMENTED
HERMES_INTEGRATION=NOT_IMPLEMENTED
OPEN_LOVABLE_BRIDGE=NOT_IMPLEMENTED
```

Open-Lovable é fonte externa de padrão, não segundo Builder.

## 10. Ouro útil pós-PR-mãe #1189

O corpo atual absorve somente ganho de informação dos seguintes marcos:

| PR | Delta útil |
|---:|---|
| #1115 | one-core-many-arms, fan-out adaptativo read-only, convergência por evidência |
| #1131 | segundo cérebro lógico único: GitHub canônico + Obsidian/local + graph/vector derivados; sem autoridade paralela |
| #1157 | Omni Router / one entrypoint / engines substituíveis |
| #1161/#1168 | capability ladder e fechamento bounded de gap de engine |
| #1172 | ciclo mestre precursor reconciliado |
| #1189 | intenção única / bancada mãe / delta útil / propriedades |
| #1240 | CI de N7/MetaLupa realmente executável no ambiente |
| #1241 | herança por referência em adapters |
| #1243 | árvore semântica como estrutura, não autoridade |
| #1245 | resgate Lovable somente onde há owner/capacidade material |
| #1269 | role/model não governa identidade/autoridade |
| #1300 | taxonomia `scout/builder/reviewer` do Overclock |
| #1314 | organismo regenerativo MetaLupa + mineração AGI reconciliada |
| #1330 | claim/lease/CAS/writer-scope como padrão de coordenação |
| #1335 | AI-OX: impacto, gate dinâmico, digest e inventory como candidatos |
| #1336 | Hermes Core consolidado |
| #1339 | smallest independently verifiable unit + cache/view != autoridade |
| #1349 | filtro não testado contra caso conhecido = fonte de falso-verde |
| #1350 | componente que passa != integração que passa |
| #1354 | mapa temporal de rotas como evidência, não runtime eterno |

Tudo que já estava absorvido é deduplicado. Histórico não é cherry-pickado de
novo só porque nasceu num PR antigo.

## 11. Gaps materiais atuais

```text
GAP_1 MASTER-CYCLE.yml tinha estrutura YAML inválida/duplicada
GAP_2 pacote verificava strings/hashes mas não parseava YAML
GAP_3 Omni receipt não alimentava o Evidence Envelope
GAP_4 Dream Review physical transport continua UNPROVEN
GAP_5 23 roles Overclock não são 23 agentes implementados
GAP_6 Builder↔Hermes não implementado
GAP_7 workspace isolado por projeto no Builder não implementado
GAP_8 Builder↔Open-Lovable não implementado
GAP_9 IA local permanece UNKNOWN até medição
```

Este pacote corrige **GAP_1**, fecha o enforcement de **GAP_2** e costura
**GAP_3** sem criar novo collector. Os demais ficam visíveis até o owner
aplicável ser medido/trabalhado.

## 12. CASCO VIVO

`CASCO VIVO` continua perfil da mesma Trigger Fabric:

```text
CASCO_INTERNO
= CHEFE_AUTHORITY
+ INTENT
+ BOUNDARY
+ WRITER
+ PROOF_STANDARD
+ REALITY_IS_JUDGE
+ UNKNOWN_IS_NOT_PASS

CASCO_EXTERNO
= MODEL
+ TOOL
+ ROUTE
+ ORDER
+ FREQUENCY
+ WORKER
+ RETRY_STRATEGY
+ OBSERVATION_CHANNEL
```

Sob pressão:

```text
PERTURBATION
→ CLASSIFY
→ LOCALIZE
→ BOUNDARY_CHECK
→ CONTAIN_IF_PROPAGATION_RISK
→ ADAPT_MINIMALLY
→ REMEASURE
→ COUNTERPROOF
→ REALITY_JUDGE
```

## 13. Fixed point

```text
INTENT_PRESERVED
AND OWNER_RESOLVED
AND ONE_WRITER_PER_SCOPE
AND CLAIMS_BOUND_TO_APPLICABLE_EVIDENCE
AND COUNTERPROOF_SURVIVED
AND NO_CRITICAL_REGRESSION
AND NO_MATERIAL_UNKNOWN_FOR_SCOPE
AND NO_NEW_INFORMATION
→ MISSION_FIXED_POINT
```

`GLOBAL_RUNTIME_100_PERCENT` continua `NOT_PROVEN` sem denominador e medição
correspondentes.

## 14. Frase-trava

```text
QUEM TOCA NA META_LUPA DEIXA RASTRO.
RASTRO VIRA EVIDÊNCIA.
EVIDÊNCIA ALIMENTA A RETAGUARDA DE MEMÓRIA.
A RETAGUARDA GUARDA MINÉRIO; OS MINERADORES EXTRAEM DELTA.
DELTA É TESTADO.
DELTA QUE SOBREVIVE MELHORA O OWNER CANÔNICO.
O OWNER MELHOR JULGA A PRÓXIMA PASSAGEM.
```

Não nasce MetaLupa V2. Não nasce cérebro concorrente. O **Segundo Cérebro
lógico já existente** continua sendo a retaguarda/memória da mesma Casa, sem
segunda autoridade, segundo Writer ou segundo Judge. A Casa cresce por
**reconciliação + delta provado**.
