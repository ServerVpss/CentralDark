---
name: engine-gap-closure
description: Fecha lacunas amarelas de engine/routing sem falso verde, reutilizando owners canônicos e medindo runtime, Writer e prova.
---

# ENGINE GAP CLOSURE

## Gatilho
Use quando `#ACORDAR`/`!CALIBRAR` encontrar:

```text
BOUNDARY_GUARD_UNBOUND
CI_NO_STATUS
WRITER_UNKNOWN
RUNTIME_UNMEASURED
ENGINE_CAPABILITY_UNKNOWN
PROOF_TARGET_MISMATCH
```

Esta skill não cria novo cérebro, dispatcher, Judge, Writer, autoridade ou runtime.

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
```

## Padrões de design absorvidos

```text
CARD                -> estado/capacidade visível e auditável
SAFE_ZONE           -> mutação somente em escopo isolado/autorizado
ECHO                -> anomalia que dispara observação, não acusação
DISCOVERY           -> inventário automático antes de perguntar ao humano
SCALABLE_DIFFICULTY -> profundidade de prova proporcional ao risco
```

## Arquitetura

```text
SEGREDO/CHEFE_INTENT
→ #ACORDAR
→ !CALIBRAR
→ DISCOVERY
→ ENGINE_CAPABILITY_CARD
→ YELLOW_GAP_CLASSIFY
→ SAFE_ZONE_CHECK
→ BOUNDARY_GUARD_PROFILE
→ WRITER_RESOLUTION
→ RUNTIME_PROBE
→ PROOF_DISCOVERY
→ SELF_HEALING_FAILURE_LOOP
→ !META_LUPA
→ REALITY_JUDGE
   ├─ PASS    -> FIXED_POINT_CHECK -> RECEIPT + NEXT_CURSOR
   ├─ FAIL    -> EXISTING_OWNER + MINIMUM_DELTA + RETEST
   └─ UNKNOWN -> READ_ONLY + DISCRIMINATING_TEST
```

## ENGINE_CAPABILITY_CARD

```yaml
ENGINE_CAPABILITY_CARD:
  engine: ""
  transport: ""
  configured: false
  router_reachable: false
  invocation_proven: false
  observed_at: ""
  evidence: []
  verdict: "PASS|FAIL|UNKNOWN|BLOCKED"
```

`configured=true` não implica `invocation_proven=true`.

## SAFE_ZONE

```text
SAFE_ZONE = ISOLATED_BRANCH_OR_WORKTREE + AUTHORIZED_SCOPE + ROLLBACK_PATH
```

Fora disso:

```text
MUTATION=BLOCKED
MODE=READ_ONLY
```

Nunca escrever direto em `main` a partir de estado local incerto.

## ECHO

```text
OBSERVED_MISMATCH
→ PRESERVE_EVIDENCE
→ READ_ONLY
→ CLASSIFY
→ DISCRIMINATING_TEST
```

`ECHO != CAUSE`.

## DISCOVERY

```text
REPO/HEAD/PR
→ OWNERS/HANDOFF
→ ROUTER_HEALTH
→ CHECKS/WORKFLOW/REVIEW
→ CURRENT_CARD
```

Se uma superfície não estiver disponível, preservar `UNKNOWN`.

## Fechamento das lacunas amarelas

### BOUNDARY_GUARD_UNBOUND

```text
BOUNDARY_GUARD_PROFILE
= TRUST_FIREWALL
+ PERMISSIONS
+ META_LUPA
+ PROOF_OWNERSHIP
+ OUTPUT_GUARD
```

Pergunta operacional: `ESTA_ACAO_PODE_ATRAVESSAR_ESTA_FRONTEIRA?`

### CI_NO_STATUS

```text
COMBINED_STATUS
→ WORKFLOW_RUNS
→ PR_REVIEW
→ SAME_HEAD_EVIDENCE
```

Sem evidência aplicável:

```text
CI_VERDICT=UNKNOWN
CI_REASON=NO_APPLICABLE_EVIDENCE
```

### WRITER_UNKNOWN

```text
ACTIVE_HANDOFF_OR_LEASE
→ CURRENT_PR_HEAD_SCOPE
→ EXPLICIT_CURRENT_AUTHORIZATION
```

Se continuar desconhecido:

```text
WRITER=UNKNOWN
MUTATION=BLOCKED
MODE=READ_ONLY
```

### RUNTIME_UNMEASURED
Usar o probe canônico:

```text
python scripts/trigger-fabric/engine_gap_probe.py
```

Health alcançável prova o router observado naquele instante; não prova cada engine ponta a ponta.

### ENGINE_CAPABILITY_UNKNOWN

```text
DECLARED
→ CONFIGURED
→ ROUTER_OBSERVED
→ INVOCATION_OBSERVED
→ COUNTERPROOF_SURVIVED
```

Saltos de nível são proibidos.

## SELF_HEALING_FAILURE_LOOP

O controlador canônico desta skill é:

```text
python scripts/trigger-fabric/engine_gap_fixed_point.py
```

Ele reaproveita o probe, remede e converge somente enquanto existe ganho informacional. Não faz deploy, restart, merge, troca credencial ou mutação de produção.

```text
MEASURE_CURRENT_STATE
→ CLASSIFY_FAILURE_SIGNATURE
→ SEARCH_EXISTING_CRYSTAL
→ CHOOSE_DISCRIMINATING_TEST
→ REMEASURE
→ COUNTERPROOF
→ REALITY_JUDGE
→ FIXED_POINT | REMEDIATION_REQUIRED | HUMAN_OR_EXTERNAL_FRONTIER
```

Regras:

```text
SAME_FAILURE_NO_NEW_INFO -> STOP_AND_PRESERVE_FRONTIER
UNKNOWN -> NEVER_PASS
FAIL -> EXISTING_OWNER + MINIMUM_DELTA + RETEST
MUTATION -> ONLY_INSIDE_AUTHORIZED_SAFE_ZONE
HUMAN_FRONTIER -> RETURN_WITH_RECEIPT
```

O self-healing é **bounded**, não autonomia irrestrita.

## Dificuldade de prova proporcional ao risco

```text
R0/R1 -> prova mínima discriminante
R2    -> baseline + rollback + teste
R3    -> MetaLupa + Judge independente + receipt
R4    -> autorização atual específica + prova de runtime + rollback + Judge
```

## Fixed point

```text
BOUNDARY_GUARD_BOUND
AND WRITER_RESOLVED_FOR_MUTATION
AND RUNTIME_CLAIM_MEASURED
AND CI_CLAIM_HAS_APPLICABLE_EVIDENCE
AND ENGINE_CARD_MATCHES_OBSERVED_STATE
AND PROVIDER_INVOCATION_PROVEN
AND NO_MATERIAL_UNKNOWN_FOR_VERDICT
AND COUNTERPROOF_SURVIVED
→ ENGINE_GAP_FIXED_POINT
```

Qualquer termo ausente preserva o amarelo no ponto exato.

## Contraprova obrigatória

O self-test deve provar os dois lados:

```text
POSITIVE: todas as condições verdadeiras -> ENGINE_GAP_FIXED_POINT
NEGATIVE: Writer UNKNOWN ou runtime UNKNOWN -> FIXED_POINT=false
```

Se o teste negativo não bloquear falso verde, a skill falhou.

## Regra curta

```text
CARD MOSTRA.
DISCOVERY ENCONTRA.
ECHO ALERTA.
GUARDRAIL FILTRA.
WRITER ESCREVE.
LOOP REMEDE.
JUDGE CONTRALÊ.
REALIDADE SENTENCIA.
FIXED POINT ENCERRA.
```
