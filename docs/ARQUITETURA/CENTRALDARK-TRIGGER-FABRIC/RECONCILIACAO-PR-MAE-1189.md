# Reconciliação do PR-mãe #1189 — delta útil até a arquitetura inteira

Status: `PROVENANCE_RECEIPT_NOT_RUNTIME_AUTHORITY`

Este arquivo é **recibo de reconciliação**, não novo owner. O owner continua
sendo a família `CENTRALDARK-TRIGGER-FABRIC` e os owners especializados
referenciados por ela.

## Intenção recuperada

PR-mãe:

```text
#1189
CENTRALDARK — INTENÇÃO ÚNICA, PROPRIEDADES E CICLO MESTRE
```

A intenção era manter uma bancada única para:

```text
LER
→ DEDUPE
→ ABSORVER DELTA ÚTIL
→ RECONCILIAR CONTRADIÇÃO
→ ATUALIZAR O MESMO CORPO
```

O PR foi mergeado. Logo:

```text
PR_MAE_MERGED=true
HISTORICAL_BRANCH_IS_CURRENT_BASE=false
CONTINUATION_BASE=CURRENT_MAIN
OLD_COMMITS_ARE_PROVENANCE_NOT_CHERRY_PICK_DEFAULT
```

## Regra de garimpo aplicada

```text
REPETIÇÃO_PURA → DROP
DETALHE_NOVO → ABSORB
PROVA_MAIS_NOVA → REPLACE_STALE_PROOF
CONTRADIÇÃO → META_LUPA + RECONCILE
CAPACIDADE_JÁ_EXISTENTE → REUSE
NOME_NOVO_SEM_CAPACIDADE → REFERENCE_ONLY
RUNTIME_NÃO_MEDIDO → UNKNOWN
```

## Linhagem útil

| PR | Disposição | Delta preservado |
|---:|---|---|
| #1115 | ABSORB | one-core-many-arms, fanout read-only adaptativo, rendezvous, evidência em vez de voto |
| #1157 | ABSORB | Omni Router: uma porta, motores substituíveis |
| #1161 | ABSORB | capability ladder + engine-gap fixed point bounded |
| #1166/#1167/#1168/#1169/#1170 | ALREADY_ABSORBED_BY_1189 | semântica, engine gap, GraphRAG e reconciliação histórica |
| #1172 | ALREADY_ABSORBED_BY_1189 | ciclo mestre reconciliado |
| #1189 | PR_MOTHER | intenção única + delta harvest + propriedades + mesmo corpo |
| #1206 | OUTSIDE_CORE_ALREADY_PROMOTED | receipt Electron; não ressuscitar branch-mãe |
| #1240 | ABSORB | gate MetaLupa/N7 precisa executar no runtime real do runner |
| #1241 | ABSORB | adapter herda owner por referência; cópia não governa |
| #1243 | ABSORB | árvore semântica é estrutura/navegação, não autoridade |
| #1245 | ABSORB_ONLY_MATERIAL | material Lovable só onde reforça owner/capacidade existente |
| #1269 | ABSORB | role/model/provider não define autoridade/identidade |
| #1300 | ABSORB | taxonomia Overclock `scout/builder/reviewer`; catálogo não é agente |
| #1314 | ABSORB | MetaLupa regenerativa/event-driven + mineração AGI reconciliada |
| #1330 | ABSORB | writer lease, PR pin, release, redecision/CAS como padrão |
| #1335 | CANDIDATE_RESERVE | dependency impact, dynamic gates, digest, orphan inventory |
| #1336 | ABSORB | Hermes Core consolidado |
| #1339 | ABSORB | menor unidade verificável; derived/cache/view não é autoridade |
| #1349 | ABSORB | filtro novo precisa caso de resposta conhecida |
| #1350 | ABSORB | `COMPONENT_PASS != INTEGRATION_PASS` |
| #1354 | ABSORB_AS_TEMPORAL_EVIDENCE | rotas atuais documentadas; não eternizar runtime |

## Achados atuais que mudaram o corpo

### 1. MASTER-CYCLE YAML

Encontrado no estado vivo da `main`:

```text
duplicate status
duplicate execution_model
invalid scalar nesting
duplicate source_prs/policy
```

Classificação: `GAP_REAL`.

A correção atualiza **o mesmo `MASTER-CYCLE.yml`**, sem V2.

### 2. Package verifier

Antes verificava hashes/presença/strings, mas não validava a gramática dos
contratos YAML.

```text
COMPONENT_SELF_TEST_PASS
!=
CONTRACT_ARTIFACT_PARSE_PASS
```

Classificação: `GAP_REAL`.

A correção estende **o mesmo `verify_package.py`**.

### 3. MODEL_TOUCH

O Omni Router já emitia receipt observável:

```text
engine
resolved_model
duration_ms
fallback_used
action_is_proof
```

O Evidence Envelope já existia com `mission_id`, `trace_id`, `sha`,
`writer_scope`, latência, custo e dedupe causal.

Criar outro collector seria duplicação. A costura correta é:

```text
OMNI_ROUTER
→ model_touch
→ agent-log
→ Evidence Envelope
→ agent_events
```

Classificação: `EXTEND_EXISTING_GAP`.

## Reservas — guardadas, não ativadas

```text
ODS=DEFERRED_UNTIL_MEASURED
BUZZ=RESERVE_REFERENCE
OPENMAUSBOT=RESERVE_REFERENCE
OPEN_LOVABLE=RESERVE_REFERENCE
GROK_BUILD=FUTURE_ENGINE_CANDIDATE
AIOS_AIOX=CANDIDATE_EXTERNAL_LEARNING
```

Esses itens preservam disponibilidade futura. Nenhum deles vira cérebro,
autoridade ou runtime ativo por estar documentado.

## IA local

Decisão desta continuação:

```text
LOCAL_AI_RUNTIME=UNKNOWN
LOCAL_AI_DEFERRED_UNTIL_MEASURED=true
```

Critério mínimo para mudar isso:

```text
LIVE_TARGET
+ ENGINE/ENDPOINT OBSERVED
+ REAL INVOCATION
+ RECEIPT
+ COUNTERPROOF
→ REALITY_JUDGE
```

## O que NÃO entrou

- branch histórica do #1189 como nova baseline;
- cherry-pick de commits cujo efeito já está na main;
- 23 agentes fictícios a partir do catálogo Overclock;
- segundo router;
- segundo event bus;
- segundo cérebro;
- segundo Reality Judge;
- raw AIOS/AIOX control plane;
- ODS/Buzz/OpenMausBot/Open-Lovable como runtime presumido;
- local AI como `PASS` sem medição.

## Resultado arquitetural

```text
PAST
→ PROVENANCE
→ DELTA USEFUL ONLY
→ EXISTING OWNER
→ CURRENT MAIN
→ TEST
→ COUNTERPROOF
→ REALITY
→ NEXT BASELINE
```

Este receipt acompanha o pacote para impedir que uma sessão futura precise
reconstruir a mesma reconciliação do zero.
