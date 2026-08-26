# Sessão — erros e provas reais (não imaginados)

## Separações

| Afirmação falsa | Realidade medida |
|-----------------|------------------|
| Motor morto | CentralDark-Hermes PM2 online, 0 restarts anormais |
| Precisa site | CHEFE pediu só motor |
| Cache npm resolve deploy | Gargalo = setup-node + 1 runner + fila |
| Deploy keys = causa da fila | Policy ServerVpss; zero keys; não afeta runner queue |
| GitHub App desbloqueia esteira | App = auth fina; runner = capacidade de execução |

## SHAs e runs (exemplos da sessão)

- main Node fast path — `e2c6fcb` (#1164)
- VPS checkout — `5958d3ce` · ~1252 atrás · dirty preservado
- Deploy dispatch — run `32910608109` · pending em e2c6fcb
- Runner job proof — `vmi3256920-centraldark` runner_id=2

## PM2 residuals

- online — Hermes, HermesVerificador, MCP, Memoria, Grafo, bots, proxies
- stopped — AiDiag (opcional), WebhookDeploy (intencional no deploy canônico)

## Limite de agente (Grok + connectors)

- Pode — medir, cancelar runs, dispatch workflow, ler SHA/PM2 status
- Não pode — `pm2 restart all`, `systemctl` runner, `node -v` no user do service, criar GitHub App pela API disponível
