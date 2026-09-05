# 2026-09-05 — FULL TRIGGER BOOT + PROVEN LOCK

## Lei

Tudo que for comprovado e reutilizável deve convergir para implementação determinística no owner existente, com teste positivo/negativo, receipt e lock de claim.

`PROVADO → DETERMINÍSTICO → TESTE → CONTRAPROVA → RECEIPT → CLAIM_SEAL`

Depois do selo:

`NO_NEW_INFORMATION → REUSE_PROOF → NEXT_CURSOR`

O claim só reabre quando a mesma identidade `CLAIM_KEY + OWNER` apresentar:

`SAME_LOCK_KEY + REOPEN_CAUSE_REF + MATERIAL_IMPROVEMENT + COUNTERPROOF_PLAN + CURRENT_TARGET_REMEASURED`.

Falha de candidato não é descarte:

- `REFUTED_MINERAL` quando refutado;
- `UNRESOLVED_MINERAL` quando ainda sem prova;
- `CRYSTAL_GOLD` quando comprovado e melhor.

## Full Trigger Boot

Owner: `scripts/trigger-fabric/centraldark_full_trigger_boot.py`.

Ele lê o mesmo Trigger Fabric canônico e monta o fluxo completo, sem criar segundo cérebro/router/judge.

Entradas humanas de comando são normalizadas para maiúscula/minúscula e `!/#`; menções no meio de prosa não ativam o motor por acidente.

O registry completo é carregado, mas o motor executa somente fases materialmente aplicáveis. Isso preserva:

`NO_NEW_INFORMATION → NO_CHANGE → NEXT`.

## Comando universal

```text
!CENTRALDARK FULL_BOOT
MODE=PERSISTENT
LOAD_ALL_TRIGGERS=true
EXECUTE_MATERIAL_ONLY=true
PROVEN_TO_DETERMINISTIC=true
CLAIM_SEAL=true
REOPEN_POLICY=SAME_KEY_PLUS_CAUSE_PLUS_IMPROVEMENT_PLUS_COUNTERPROOF
FAILED_LEARNING=REFUTED_MINERAL
UNRESOLVED_LEARNING=UNRESOLVED_MINERAL
NO_NEW_INFORMATION=REUSE_PROOF
VERTEX_INVERSO=ON
META_LUPA=CONTINUOUS
CARACOL=UNTIL_FIXED_POINT
ONE_WRITER_PER_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
```

CLI determinístico correspondente:

`python scripts/trigger-fabric/centraldark_full_trigger_boot.py boot --input "!CENTRALDARK"`

## Fronteira de prova

A existência de contrato/código/teste no PR prova source candidato. A ativação persistente em runtime só vira `PROVADO` quando houver consumidor real chamando o loader e receipt observável no mesmo alvo.
