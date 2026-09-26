# Diretriz de Infra

Antes de qualquer execução:

```text
MEASURE
→ DIAGNOSE
→ CAUSE
→ MINIMAL_REMEDIATION
→ RETEST
→ COUNTERPROOF
```

Invariantes:
- extensão segura > substituição;
- zero regressão é requisito;
- preservar DB e arquitetura legada;
- rollback antes de mutação material;
- patch no owner > paralelo;
- novo componente só com gap real provado;
- nenhuma limpeza/restart/deploy destrutivo implícito.
