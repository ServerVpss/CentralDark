# ROTA FIXA — Arsenal Council: endpoints

## Portas na VPS

| Serviço | Porta | Base URL local | Auth |
|---|---|---|---|
| ArsenalProxy | 8083 | `http://localhost:8083` | (interno, sem key) |
| ArsenalAdapter (OpenAI-compat) | 8090 | `http://localhost:8090/v1` | `Bearer arsenal-key-local-2026` |
| CentralDark-Tools (sidecar) | 9077 | `http://localhost:9077` | (interno) |

## Endpoints ArsenalProxy (8083)

- `GET /arsenal/neural` — modelo neural único
- `POST /arsenal/swarm` — enxame paralelo
- `POST /arsenal/chain` — cadeia sequencial
- `GET /arsenal/intel` — snapshot de inteligência
- `GET /arsenal/stats` — métricas

## Modelos verbais ArsenalAdapter (8090, OpenAI-compat)

| Modelo | Latência típica | Uso |
|---|---|---|
| `arsenal-router` | ~2.5s | Roteia pergunta pro melhor modelo |
| `arsenal-parallel` | ~10s | Dispara N modelos em paralelo |
| `arsenal-debate` | ~43s | Debate entre 2+ modelos |
| `arsenal-hermes` | ~50s | Hermes autônomo com loop |

## Slash-commands no WebUI (webui.db)

`/router` `/swarm` `/chain` `/debate` `/hermes` — todos apontam pros verbos acima.

## Proibido

- ❌ Porta 9000 (conflita com webhook GitHub)
- ❌ Chamar o adapter externamente (chave só valida `127.0.0.1`)
