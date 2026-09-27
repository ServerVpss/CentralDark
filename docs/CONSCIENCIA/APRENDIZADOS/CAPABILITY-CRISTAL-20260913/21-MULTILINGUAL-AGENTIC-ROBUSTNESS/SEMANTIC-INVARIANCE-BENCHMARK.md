# Benchmark de invariância semântica

Para uma mesma missão, executar N workers/providers com permissão para responder
em idiomas diferentes.

Métricas:

- stable_identifier_recall
- semantic_claim_agreement
- contradiction_rate
- owner_resolution_agreement
- action_plan_equivalence
- evidence_reference_preservation
- language_switch_failure_rate

Gate sugerido:

```text
IDENTIFIERS >= 0.98
EVIDENCE_PRESERVATION >= 0.98
OWNER_AGREEMENT >= 0.95
SEMANTIC_AGREEMENT >= 0.90
CONTRADICTION_RATE <= 0.05
```

Esses limiares são candidatos de benchmark, não prova de runtime atual.
