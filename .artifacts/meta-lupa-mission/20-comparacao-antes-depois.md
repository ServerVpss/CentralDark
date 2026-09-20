# Comparação ANTES → DEPOIS

Input repetido: alegação de integração perfeita baseada apenas em HTTP 200.

| Critério | Baseline | META LUPA | Ganho | Regressão |
|---|---|---|---|---|
| discovery | nome antigo | `meta-lupa` habilitada | nome único | não |
| carregamento real | carregou caminho antigo quando explícito | carregou `.agents/skills/meta-lupa/SKILL.md` | caminho canônico | não |
| falso verde | aprovou a alegação | recusou suficiência; `FALSO_VERDE_BLOQUEADO=SIM` | proteção real | não |
| veredito runtime | `APROVADA` | `INSUFICIENTE` | não aprova | formato ainda não canônico |
| delta runtime | `0` | `0` | nenhum delta inventado | não |
| prova contrária | ausente | ausente | lacuna ficou visível | pendência |
| motor determinístico | sem 3T | FRIA/MÉDIA/QUENTE e gates | 7 testes novos | não |
| autorização | apenas texto | R0–R4 validado | bloqueio R3/R4 | não |
| segredo | sanitização de ledger | sanitização + bloqueio de entrada | defesa ampliada | não |
| mesmo SHA | contrato textual | gate determinístico | divergência bloqueia | não |
| ledger | BEGIN/FINAL | preservado e relido | sem ledger paralelo | não |
| rollback | descrito | requerido em R2+ | gate novo | não |

Conclusão: a candidata bloqueia o falso verde que a baseline aprovava. O runtime não usou o literal `BLOQUEAR`; respondeu `INSUFICIENTE`. Isso é risco de conformidade de formato, não aprovação indevida.
