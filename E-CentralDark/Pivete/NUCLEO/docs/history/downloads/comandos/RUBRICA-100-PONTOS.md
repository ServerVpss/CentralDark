# RUBRICA DE AVALIAÇÃO — 100 PONTOS

| Pilar | Pontos |
|---|---:|
| Reconciliação correta em 200 seeds | 25 |
| Ledger, hash e recuperação | 20 |
| Concorrência e idempotência | 15 |
| Segurança e autorização | 15 |
| Determinismo e ponto fixo | 10 |
| Portabilidade e caminhos | 5 |
| AutoLupa: erros detectados e corrigidos | 5 |
| Escopo do diff e rastreabilidade | 5 |

## Gate de 100%

100/100 exige simultaneamente:

- 25/25 testes verdes em três execuções consecutivas;
- 200/200 seeds;
- 32 threads no BEGIN e 50 eventos independentes;
- zero alteração fora de `omega_solver.py` na solução;
- zero secret;
- ponto fixo byte a byte;
- adulteração detectada;
- PR draft sem merge/deploy/restart.

Qualquer teste alterado invalida o resultado.
