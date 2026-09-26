# 12 — AUTOAUDITORIA

| Claim | Implementação | Prova |
|---|---|---|
| mesmo agente constrói e critica | `runtime/orchestrator.py` | `test_orchestrator.py` |
| agente não libera a si mesmo | `runtime/gates.py` | `test_false_green.py` |
| entrada imutável | `runtime/evidence.py` | `test_gates.py` |
| ledger encadeado | `runtime/ledger.py` | `test_ledger.py` |
| estagnação bloqueia | orchestrator | teste de integração |
| abort externo | arquivo `ABORT` | `test_orchestrator.py` |
| sem rede | compose | inspeção |
| hashes de release | manifest | verificador |

## Riscos residuais

1. teste fraco prova propriedade fraca;
2. autocrítica pode ser superficial;
3. não há treino de pesos;
4. estabilidade é local ao conjunto testado;
5. integração real com Hermes/Bolt/VPS ainda exige execução no ambiente;
6. Docker precisa ser validado no host alvo.
