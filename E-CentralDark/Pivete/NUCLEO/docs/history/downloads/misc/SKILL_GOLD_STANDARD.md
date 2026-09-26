# PADRÃO DE QUALIDADE PARA SKILLS

Aplicável quando a skill realmente tiver consumer/runtime.

```text
TRIGGER
→ MEASURE
→ DIAGNOSE
→ DISCRIMINATING_TEST
→ MINIMAL_REMEDIATION
→ RETEST
→ COUNTERPROOF
→ RECEIPT
→ CRYSTALIZE_REUSABLE_DELTA
→ FIXED_POINT_CHECK
```

Toda skill material deve declarar:
- trigger claro;
- owner e consumidores;
- estado/runtime que mede;
- assinatura de falha quando aplicável;
- config origin quando aplicável;
- menor remediação;
- pós-condições executáveis;
- contraprova;
- proveniência;
- receipt;
- critério de stale/revalidação;
- limites (`UNKNOWN != PASS`);
- contribuição para fixed point.

Não exigir seções irrelevantes apenas para preencher template. O padrão é semântico, não ornamental.
