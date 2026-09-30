# Grafo Mestre — rotas Hermes provadas em runtime

Status: PROVEN_IN_SESSION  
Owner conceitual: CentralDark / Trigger Fabric  
Projeção: FLOW-REGISTRY + ARCHITECTURE.mmd  
Reality Judge: efeito observado no alvo real; ACTION != PROOF.

## ROUTE_HERMES_NOUS_SOLAR

- capacidade: inferência LLM
- alvo: VPS vmi3256920
- runtime: Hermes
- provider configurado e lido de volta: `nous`
- modelo configurado e lido de volta: `upstage/solar-pro4:free`
- microprova observada nesta sessão: `SOLAR_ROUTE_OK`
- regra: executor/modelo é substituível; identidade da rota pertence ao grafo canônico
- invalidação: provider/model/config/gateway ou efeito material mudou

## ROUTE_HERMES_REVERSE_ROUTE

- capacidade: rastreio reverso de execução
- alvo: VPS vmi3256920
- skill materializada: `/root/.hermes/skills/centraldark-reverse-route/SKILL.md`
- microprova observada nesta sessão: `REVERSE_ROUTE_SKILL_OK`
- direção: efeito -> processo -> parent -> runtime -> transporte -> provider/modelo -> owner
- invalidação: skill/config/runtime/owner material mudou

## Deploy / runtime reconciliado

No mesmo ciclo, o `centraldark-main-pulse` foi corrigido sem apagar o checkout vivo:

- deleções em `main` passam a ser promoção válida com backup/rollback;
- HERMES-CORE é promovido antes do MCP quando há dependência cruzada;
- tracked dirty do checkout vivo é preservado; convergência continua owner-scoped;
- receipts runtime emitidos para Hermes, MCP, HubBot e OAuthBroker;
- `PULSE_PASS` observado para `bd7943985376025af734757764b825fba9ccc474`;
- `CentralDark-MCP` respondeu HTTP 200 em `:9100/health`;
- `CentralDark-Hermes`, `CentralDark-MCP`, os dois HubBots e `CentralDark-OAuthBroker` observados online.

## Lei de absorção

`PROVEN_ROUTE -> ATTACH_TO_EXISTING_GRAPH -> REUSE_BEFORE_CREATE`

Este receipt não cria novo cérebro, router ou autoridade. O registry e o Mermaid são projeções/índices do owner existente.
