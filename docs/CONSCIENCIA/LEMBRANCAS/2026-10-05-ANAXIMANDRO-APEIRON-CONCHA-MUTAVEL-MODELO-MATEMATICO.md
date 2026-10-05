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

## 5. Tempo e gnomon operacional

Para ticks `t_k = t_0 + kΔt`:

```text
STATE(t_k) = MEASURE(WORLD, t_k)
STATE(t_k) != ASSUME(STATE(t_(k-1)))
```

Toda evidência mutável carrega tempo, source/fingerprint e, quando aplicável, TTL.

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
