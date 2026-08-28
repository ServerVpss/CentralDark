# Roteador do pacote Nível 7

Regras determinísticas de roteamento entre os 3 agentes.

| Gatilho | Rota | Justificativa |
|---|---|---|
| entrada nova (chat/observação) | `01-observador-de-padroes` | toda entrada passa pelo Observador antes |
| Observador classificou `fato` de erro comprovado | `02-conversor-de-erro-em-teste` | erro real precisa virar teste permanente |
| Observador classificou `inferencia` ou `hipotese` sobre mecanismo interno contradizendo `fato` do Pivete | descartar hipótese; **não** rotear | precedência epistemológica |
| Conversor produziu teste novo | `03-orquestrador-de-evolucao-aberta` | orquestrador decide promoção |
| Orquestrador em ponto fixo | encerrar | AutoLupa não repete sem delta material |

Regras em JSON: `router/routing-rules.json`.
