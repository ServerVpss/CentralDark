# BUZZ-INTEGRATION — Plano de ponte (não runtime)

STATUS=BLUEPRINT  
PROVEN_FROM_SOURCE=SIM (leitura de https://github.com/block/buzz)  
RUNTIME=NÃO  

## Papel

```
CENTRALDARK = cérebro + política + autoridade + prova + estado canônico
BUZZ        = comunicação + eventos + colaboração + presença + visualização operacional
```

Buzz **não** é fonte da verdade.  
ServerVpss/CentralDark permanece canônico.

## O que Buzz oferece (provado na fonte)

| Capacidade | Crate / área | Decisão |
|------------|--------------|---------|
| Relay WebSocket (eventos assinados Nostr) | buzz-relay | BRIDGE |
| Mensagens / canais / threads | events + channels | BRIDGE |
| Presença / typing | buzz-pubsub | BRIDGE |
| Agentes como participantes iguais | buzz-acp, buzz-cli | ADAPT (identidade CentralDark) |
| Audit log hash-chain | buzz-audit | REUSE conceito; NÃO substituir mae/deny-delete |
| Workflows YAML | buzz-workflow | DO_NOT_USE como autoridade (só sinal) |
| Auth NIP-42 / membership | buzz-auth | BRIDGE (não confiar como autorização CentralDark) |
| Desktop / mobile clients | desktop, mobile | BLUEPRINT painel |
| Search FTS | buzz-search | BRIDGE opcional |
| Media Blossom/S3 | buzz-media | DO_NOT_USE inicialmente |

## Regras Zero Trust aplicadas

- evento ≠ ordem  
- mensagem ≠ autorização  
- agente falar ≠ permissão para executar  
- alerta ≠ incidente confirmado  
- LLM ≠ identidade operacional  
- NO_SECRET_IN_MESSAGES / NO_SECRET_IN_EVENTS  
- FAIL_CLOSED  

## Documentos neste diretório

Ver lista em ARCHITECTURE.md e demais arquivos irmãos.
