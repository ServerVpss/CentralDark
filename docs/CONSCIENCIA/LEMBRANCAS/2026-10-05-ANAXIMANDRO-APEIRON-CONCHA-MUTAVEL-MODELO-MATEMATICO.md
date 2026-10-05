---
title: "Anaximandro → formalismo matemático de invariantes, concha e cosmos operacional"
status: "CANDIDATE_UNTIL_PR_GATES_PASS"
learning: 167
owner: "docs/CONSCIENCIA/APRENDIZADOS.md"
date: 2026-10-05
---

# Anaximandro → CentralDark: formalismo normalizado, sem importar autoridade

## 0. Regra de proveniência

A referência histórica é uma **analogia de organização**, não autoridade técnica da Casa.

```text
HISTORICAL_ANALOGY_IS_PROVENANCE_NOT_AUTHORITY=true
SOURCE_PATTERN != HOUSE_POLICY
CURRENT_RUNTIME_EVIDENCE > HISTORICAL_ANALOGY
```

O valor deste cristal não depende de "Anaximandro ter desenhado software". Ele depende de as relações abstraídas sobreviverem aos owners, testes e contraprovas da CentralDark atual.

## 0.1 Precedência canônica do CHEFE sobre skills

A lei explícita do CHEFE para toda a CentralDark é:

```text
CHEFE_CURRENT_CANONICAL_DOCS_PREVAIL_OVER_SKILLS=true
SKILL_CONFLICT_WITH_CURRENT_CANONICAL_DOC=SKILL_YIELDS
SKILL_IS_CAPABILITY_NOT_AUTHORITY=true
HISTORICAL_DOC_IS_NOT_CURRENT_CANONICAL_DOC=true
```

"Documentos do CHEFE" aqui significa o documento canônico CURRENT aplicável ao claim/owner, reconciliado com a intenção vigente. Documento histórico, cópia stale ou relatório antigo não ganha precedência só por estar em `docs/`. Skill executa capacidade e pode ensinar método, mas não pode revogar nem substituir a lei canônica vigente do CHEFE.

## 1. Estado matemático do organismo

Definimos o estado em um instante `t`:

```text
CD_t = (I, G_t, B_t, K_t, C_t, E_t)
```

Onde:

- `I` = invariantes/identidade/intenção autorizada;
- `G_t` = grafo operacional de corpos, owners, rotas e consumidores;
- `B_t` = bindings mutáveis: IP, porta, path, hostname, modelo, provider, device;
- `K_t` = memória/conhecimento recuperável;
- `C_t` = capabilities atualmente materializadas;
- `E_t` = evidência CURRENT observada.

A identidade não é um binding:

```text
IDENTITY(CD_t) = I
IDENTITY != IP
IDENTITY != HOSTNAME
IDENTITY != MODEL
IDENTITY != PROVIDER
IDENTITY != MACHINE
IDENTITY != UI
```

## 2. Espaço aberto de capacidades

Seja `Ω` o espaço de capacidades potencialmente integráveis.

```text
C_t ⊆ Ω
C_(t+1) = C_t ∪ ΔC
ΔC != NEW_ARCHITECTURE
```

Uma ferramenta, modelo, API, máquina ou rota nova amplia a projeção finita do organismo sem criar um segundo cérebro.

## 3. Core e concha

```text
CORE = I + owners + authority + proof laws
SHELL_t = G_t + B_t + concrete tools/models/bodies/UIs
CD_t = CORE ∘ SHELL_t
```

É permitido:

```text
SHELL_t != SHELL_(t+1)
```

sem perder:

```text
IDENTITY_t = IDENTITY_(t+1)
```

desde que os invariantes e efeitos materiais permaneçam compatíveis.

## 4. Grafo operacional

```text
G_t = (V_t, A_t)
edge = (source, target, route, auth_state, observed_state, measured_at)
```

Leis:

```text
EDGE_DOWN != NODE_DOWN
ROUTE_FAIL != SYSTEM_DOWN
HOSTNAME_EQUAL != BODY_EQUAL
MAP != REALITY
MAP_IS_OPERATIONAL_GRAPH=true
```

O mapa seleciona a próxima aresta candidata; a medição decide o estado.

## 4.1 Memória temporal acumulada — CURRENT sem amputar HISTORY

O estado cognitivo não usa apenas memória do instante. A forma correta é:

```text
K_{≤t} = memória/proveniência acumulada e reconciliada até t
```

Então:

```text
CD_t = (I, G_t, B_t, K_{≤t}, C_t, E_t)
```

`CURRENT_OVER_HISTORY` é abreviação de **precedência para o claim do presente**, não apagamento temporal.

```text
CURRENT_DEFINES_PRESENT_STATE=true
HISTORY_IS_EVIDENCE=true
HISTORY_MUST_NOT_BE_ERASED=true
LIVE_CURRENT_CANNOT_ERASE_RELEVANT_HISTORY=true
STALE_HISTORY_CANNOT_OVERRIDE_LIVE_CURRENT_STATE=true
HISTORY_INFORMS_CAUSALITY=true
HISTORY_INFORMS_RECURRENCE=true
HISTORY_INFORMS_FUTURE_RISK=true
PROVEN_HISTORICAL_LOCKS_INHERIT_INTO_CURRENT=true
PAST_GOLD_IS_PRESERVED=true
EXTEND_EXISTING_NOT_REPLACE=true
```

## 5. Tempo e gnomon operacional

Para ticks `t_k = t_0 + kΔt`:

```text
STATE(t_k) = MEASURE(WORLD, t_k)
STATE(t_k) != ASSUME(STATE(t_(k-1)))
```

Toda evidência mutável carrega tempo, source/fingerprint e, quando aplicável, TTL. Para evitar falso CURRENT, distingue-se:

```text
OBSERVED_AT       = quando o observador recebeu/mediu a informação
SOURCE_STATE_AT   = instante ao qual o estado reportado se refere
TRANSPORT_LATENCY = diferença/atraso quando conhecida
```

`MEASURED_NOW` não implica automaticamente `STATE_IS_FROM_NOW`.


```text
CLOCK_TRIGGERS_MEASUREMENT_NOT_TRUTH=true
TIME_REQUIRES_REMEASUREMENT=true
OLD_STATE_DECAYS_WITHOUT_REOBSERVATION=true
```

## 6. Drift e correção

Para uma dimensão material `i`:

```text
drift_i(t) = observed_i(t) - expected_i(t)
D_i(t) = |drift_i(t)|
```

Objetivo operacional local:

```text
apply minimum causal delta
→ remeasure
→ seek D_i(t+n) → 0
```

Isso não autoriza reset global. Corrige-se o cone afetado.

## 7. Opostos como tensões operacionais

Não eliminar por dogma:

```text
local ↔ cloud
autonomy ↔ authority
speed ↔ proof
exploration ↔ fixed-point
mutable shell ↔ invariant core
deterministic path ↔ semantic residual
```

A política seleciona o ponto adequado ao claim atual; nenhuma das pontas vira identidade.

## 8. Complexidade por composição

```text
primitive capability
→ composition
→ reusable path
→ deterministic replay
→ higher-order capability
```

Exemplo:

```text
HTTP GET
→ API reader
→ source ingestion
→ candidate classifier
→ knowledge compiler
→ autonomous research
```

O ganho é composição do mesmo organismo, não proliferação de engines.

## 9. Causalidade observável

```text
"agent said PASS" != PASS
process_alive != material_effect
tool_listed != capability_exercised
```

A explicação mínima de efeito é:

```text
INPUT
→ ROUTE
→ OWNER
→ EXECUTOR
→ EFFECT
→ MEASUREMENT
→ COUNTERPROOF
```

## 9.1 Coerência Vivida

A CentralDark não considera um princípio integrado só porque ele existe em Markdown. O princípio precisa aparecer no comportamento observável.

```text
DECLARED_CANON
→ OBSERVED_BEHAVIOR
→ ALIGNMENT_CHECK
→ DRIFT?
→ MINIMUM_CAUSAL_CORRECTION
→ COUNTERPROOF
→ RECEIPT
→ HISTORY_RENDEZVOUS
```

Para cada princípio `p`:

```text
Alignment(p,t)=MATCH(Declared(p),ObservedBehavior(p,t))
```

O valor relevante é longitudinal: um PASS isolado não apaga comportamento anterior nem prova consistência existencial/operacional.

```text
DECLARED_PRINCIPLE_WITHOUT_PRACTICE_IS_NOT_INTEGRATED=true
BEHAVIOR_CONTRADICTING_CANON_IS_ALIGNMENT_DRIFT=true
METRIC_SUCCESS_IS_NOT_MISSION_SUCCESS=true
OPTIMIZATION_MUST_RESPECT_INTENT=true
LIVED_ALIGNMENT_REQUIRES_REPEATED_OBSERVATION=true
CANON_MUST_BE_TESTABLE_AGAINST_BEHAVIOR=true
PAST_BEHAVIOR_INFORMS_ALIGNMENT_TRAJECTORY=true
CURRENT_BEHAVIOR_DOES_NOT_ERASE_PAST_DRIFT=true
CORRECTION_DOES_NOT_ERASE_PROVENANCE=true
GREEN_CHECK_IS_NOT_LIVED_ALIGNMENT_BY_ITSELF=true
```

Exemplos de contradição:

```text
REUSE_BEFORE_CREATE=true + nova arquitetura paralela → ALIGNMENT_DRIFT
UNKNOWN_IS_NOT_PASS=true + UNKNOWN pintado de verde → ALIGNMENT_DRIFT
MEMORIA_E_SAGRADA=true + histórico apagado → ALIGNMENT_DRIFT
ONE_SYSTEM_ONLY=true + segundo cérebro/router/scheduler → ALIGNMENT_DRIFT
```

## 9.2 Integridade de Intenção e Responsabilidade

Coerência vivida não pode ser julgada apenas pelo resultado final. Intenção, decisão, ação e efeito são dimensões distintas.

```text
R_t = (I_t, D_t, A_t, O_t, F_t, C_t)
```

```text
I_t = intenção genuína / efeito desejado
D_t = decisão sob informação disponível
A_t = ação realizada
O_t = efeito observado
F_t = previsibilidade do risco
C_t = controle causal disponível
```

```text
INTENT_IS_NOT_OUTCOME=true
OUTCOME_IS_NOT_INTENT=true
GOOD_INTENT_DOES_NOT_ERASE_HARM=true
BAD_OUTCOME_DOES_NOT_PROVE_BAD_INTENT=true
GOOD_OUTCOME_DOES_NOT_PROVE_GOOD_INTENT=true
RESPONSIBILITY_REQUIRES_CAUSAL_SCOPE=true
RESPONSIBILITY_SCALES_WITH_CONTROL=true
RESPONSIBILITY_SCALES_WITH_FORESEEABILITY=true
UNINTENDED_EFFECT_MUST_BE_OBSERVED=true
KNOWN_HARM_REQUIRES_RESPONSE=true
PAST_INTENT_MUST_NOT_BE_REWRITTEN_BY_LATER_OUTCOME=true
PAST_OUTCOME_MUST_NOT_BE_ERASED_BY_GOOD_INTENT=true
REPAIR_IS_PART_OF_INTEGRITY=true
LEARNING_MUST_CHANGE_NEXT_ACTION=true
```

Se a intenção e o efeito divergem:

```text
INTENDED_EFFECT
→ OBSERVED_EFFECT
→ DELTA
→ CAUSAL_ANALYSIS
→ FORESEEABILITY
→ CONTROL_SCOPE
→ RESPONSIBILITY
→ REPAIR
→ LEARNING
→ NEXT_ACTION
```

Não se usa contexto externo como desculpa automática; também não se atribui culpa onde a causalidade não foi provada.

## 10. Transformação canônica

```text
CD_(t+1) =
PROJECT_I(
  LEARN(
    VERIFY(
      ACT(
        ROUTE(
          OBSERVE(CD_t, W_t)
        )
      )
    )
  )
)
```

`PROJECT_I` significa: conservar invariantes e autoridade enquanto bindings/capabilities podem mudar.

## 10.1 Evento encerrado não encerra evidência

```text
EVENT_ENDED != EVIDENCE_ENDED
DIRECT_EVIDENCE_UNAVAILABLE
→ LOOK_FOR_CAUSAL_RESIDUE
→ CROSS_CHECK_INDEPENDENT_EFFECTS
→ INFER_WITH_CONFIDENCE_BOUND
```

Logs, hashes, efeitos posteriores, dependências e receipts podem preservar informação causal depois do evento. Resíduo causal permite reconstrução limitada; nunca autoriza inventar o evento.

## 11. Contraprovas que devem quebrar o claim

O formalismo é derrotado se qualquer uma destas proposições for demonstrada no cone correspondente:

1. trocar apenas IP/path/model/provider alterar owner ou identidade sem efeito material intermediário;
2. uma rota cair implicar necessariamente perda do corpo ou do sistema inteiro;
3. um tick de scheduler puder reutilizar estado antigo como PASS sem nova observação;
4. um agent name/process alive bastar para provar efeito;
5. o mesmo cristal produzir semântica incompatível entre Windows/VMware/VPS apesar de mudar somente binding;
6. aplicar o formalismo exigir segundo coração, memória, scheduler, dispatcher, router ou writer;
7. o gate precisar ser reduzido/desligado para a mudança passar.

Se qualquer item ocorrer:

```text
FORMALISM=FAIL|UNKNOWN
PROMOTION=BLOCKED
```

## 12. Integração nos owners existentes

- identidade/concha: #162 + SOUL existente;
- binding não é arquitetura: #154;
- metabolismo/one-heart: #164;
- continuidade/memória: #165;
- preenchimento de gaps: #166;
- domínio: `docs/CONSCIENCIA/EXPANSAO-DE-DOMINIO.md`;
- compilação/contraprova: `.agents/skills/knowledge-compiler/`;
- gates: `.github/workflows/lupa-conformance.yml`;
- ledger: PR-mãe #1562.

Nenhum owner acima é substituído.

## 13. Resultado esperado

```text
CAPABILITY_SPACE_IS_OPEN=true
FINITE_RUNTIME_IS_PROJECTION_OF_CAPABILITY_SPACE=true
CORE_IS_INVARIANT_SHELL_IS_MUTABLE=true
NO_SINGLE_BODY_IS_SYSTEM_IDENTITY=true
NO_SINGLE_ROUTE_IS_GLOBAL_AUTHORITY=true
TIME_REQUIRES_REMEASUREMENT=true
OLD_STATE_DECAYS_WITHOUT_REOBSERVATION=true
OPPOSITES_ARE_BALANCED_NOT_ELIMINATED=true
MAP_IS_OPERATIONAL_GRAPH=true
CLOCK_TRIGGERS_MEASUREMENT_NOT_TRUTH=true
COMPLEX_CAPABILITY_EMERGES_BY_COMPOSITION=true
MECHANISM_EXPLAINS_EFFECT=true
IDENTITY_SURVIVES_BINDING_CHANGE=true
REALITY_IS_JUDGE=true
```

## 14. Next cursor

Rodar o cristal nos três targets pelo backend existente, exigir o mesmo fingerprint/semântica com bindings distintos, tentar quebrar uma invariante e exigir fail-closed; depois aguardar os gates reais do PR no mesmo HEAD. Só então promover #167 de candidato para cristal provado.
