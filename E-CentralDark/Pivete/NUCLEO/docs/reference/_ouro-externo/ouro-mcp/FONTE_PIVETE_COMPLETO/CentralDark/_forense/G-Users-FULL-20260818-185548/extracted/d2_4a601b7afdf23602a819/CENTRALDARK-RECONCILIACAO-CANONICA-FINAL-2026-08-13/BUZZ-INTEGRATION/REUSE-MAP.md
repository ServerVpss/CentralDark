# REUSE-MAP — Buzz × CentralDark

| Buzz | CentralDark equivalente | Decisão | Motivo |
|------|-------------------------|---------|--------|
| Relay como SoT | ServerVpss/CentralDark + memória/ledger | DO_NOT_USE como SoT | Canônico já definido |
| buzz-audit hash-chain | mae/deny-delete + ledger | REUSE conceito | Writer canônico já existe |
| Channel membership = ACL | Zero Trust + identidade SOL/Hermes | ADAPT | Membership ≠ autorização de infra |
| buzz-acp agents | Hermes / workers | BRIDGE | Identidade operacional CentralDark |
| Presence | Painel mapa vivo | BRIDGE | Visualização |
| Workflows YAML | RSI / gates | DO_NOT_USE como autoridade | Só sinal / alerta |
| Event kinds | EVENT model CentralDark | BRIDGE | Envelope com WHO/ROLE/MISSION_ID |
| Desktop client | PAINEL-UNICO | BLUEPRINT | Não implantado |
| Secrets em mensagens | proibido | DO_NOT_USE | NO_SECRET_IN_MESSAGES |

DUPLICATES_AVOIDED:
- segundo Zero Trust
- segundo ledger writer
- segundo painel como runtime
- Buzz como fonte da verdade
