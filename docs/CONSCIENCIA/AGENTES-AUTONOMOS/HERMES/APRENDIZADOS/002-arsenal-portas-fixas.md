# 002 — Arsenal Council: portas e endpoints fixos

**Data:** 2026-07-03  
**Categoria:** atalho

## Contexto
Bloco 2 (Arsenal Tools) fechou 6/6. Mapa ficou espalhado, virou rota fixa pra Hermes/próximas IAs não redescobrirem.

## Aprendizado
- **ArsenalProxy porta 8083** — expõe `/arsenal/{neural,swarm,chain,intel,stats}`
- **ArsenalAdapter porta 8090** — OpenAI-compatible, 4 modelos verbais:
  - `arsenal-router` (~2.5s)
  - `arsenal-parallel` (~10s)
  - `arsenal-debate` (~43s)
  - `arsenal-hermes` (~50s)
  - Key: `arsenal-key-local-2026`
- **CentralDark-Tools sidecar porta 9077** (`network_mode: host`) — expõe `/intel` e `/stats` via httpx pro `127.0.0.1:8083`
- **Porta 9000 PROIBIDA** — conflita com webhook GitHub
- **5 slash-commands plantados** no `webui.db`: `/router` `/swarm` `/chain` `/debate` `/hermes`
- Tudo registrado em `TOOL_SERVER_CONNECTIONS` do `docker-compose.override.yml`

Pra qualquer nova integração de modelo/tool, usar esse esqueleto — não criar sidecar novo.

## Ver também
- AULA-001 (Arsenal Council completo)
- ROTAS-FIXAS/arsenal-endpoints.md
- ROTAS-FIXAS/comandos-curl-baseline.md
