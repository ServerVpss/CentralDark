# RCRCRC — reprodução, correção e regressão

Ciclo operacional para falhas reais:

```text
REPRODUZIR
→ CONFIRMAR A CAUSA
→ CORRIGIR A FONTE
→ REPETIR O TESTE
→ CRIAR REGRESSÃO
→ EXECUTAR CASO NEGATIVO
```

## Regras

- o teste que encontrou a falha não é alterado para fabricar verde;
- suíte vazia nunca é PASS;
- `FAIL`, `SKIPPED`, `UNKNOWN` e arquivos fora do escopo só valem como zero
  quando são numericamente zero;
- aprendizagem exige proveniência, SHA válido, antes/depois, regressão e reversão;
- contraprova executável vale mais que checklist decorativo.
