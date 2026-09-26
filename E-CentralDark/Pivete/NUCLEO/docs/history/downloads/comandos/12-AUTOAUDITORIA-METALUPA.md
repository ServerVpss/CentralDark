# 12 — AUTOAUDITORIA DA META LUPA

| Claim | Implementação | Teste |
|---|---|---|
| mesmo agente produz e se confronta | `runtime/adapters.py` | `test_orchestrator.py` |
| erro próprio é obrigatório | `runtime/gates.py` | `test_false_green.py` |
| mecanismo é obrigatório | `runtime/gates.py` | `test_false_green.py` |
| transferência é obrigatória | `runtime/orchestrator.py` | `test_orchestrator.py` |
| classificação tríplice | contratos + gates | `test_gates.py` |
| repetição bloqueia | gates | `test_false_green.py` |
| ledger detecta adulteração | `runtime/ledger.py` | `test_ledger.py` |

Hipótese contrária: o agente pode obter PASS repetindo a resposta. O pacote deve bloquear por mecanismo ausente, transferência falha ou repetição.

```text
VERDICT=APROVAR_COM_ESCOPO
ESCOPO=PROTOCOLO_FUNCIONAL_DE_AUTOCONFRONTO
NAO_PROVADO=CONSCIENCIA_OU_APRENDIZAGEM_PERMANENTE
```
