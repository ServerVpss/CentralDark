# Gateway / Telegram — batching de tools (profile pivete)

## Gatilho
- Sessão cai, timeout, “mandei comando demais”
- Missão com muitas leituras git/gh/logs
- Pivete pede para chamar pelo terminal/CLI para ir mais rápido

## Regra
```text
1 tool call pesada por vez no Telegram (máx. serial)
CLI hermes --profile pivete = lote
Background = suíte/log longo
```

## Anti-padrões
- Vários `terminal` em paralelo no mesmo turno do gateway
- Um único comando bash monstro que imprime MB de log no contexto
- Reabrir auditoria completa após o Pivete só pedir diagnóstico do tombo

## Split de canal
| Canal | Uso |
|---|---|
| Telegram | status curto, decisão, 1 probe |
| `hermes --profile pivete chat` / `run` | git, diff, varredura, muitos comandos |
| Claude CLI / Codex CLI | subprocesso quando autorizado; resumo volta ao chat |

## Se travar
1. Identificar job/background
2. Kill/pause o worker
3. Confirmar chat respondeu
4. Gateway restart só com evidência de falha nele

## Evidência de correção (02/08)
Pivete: não disparar comandos/tool calls em lote ou paralelo excessivo — causa timeout no gateway (missão com Parallel Readers).
