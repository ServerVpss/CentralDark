# CentralDark Micro Deploy por PASS comprovado

Regra canônica operacional:

`QUALQUER_PASS_COMPROVADO → MICRO_DEPLOY_DO_ESCOPO_AFETADO → HEALTH/PROVA_RUNTIME → RECEIPT → NEXT_TIK_TAK`

## O que conta como PASS

- Health real retornando 200 no runtime medido.
- Socket/serviço vivo quando o escopo declarado é socket/serviço.
- Systemd/PM2 ativo com owner conhecido quando o escopo declarado é processo supervisionado.
- Receipt local ou GitHub com timestamp, rota, head e resultado.

## O que não conta como PASS

- Badge visual isolado.
- `action_required`.
- PR aberto sem promoção.
- Source alterado sem runtime medido.
- UNKNOWN.

## Cadeado

Micro-deploy é por escopo afetado. Falha em rota separada, como `:8099`, não bloqueia rotas independentes já provadas, mas também não vira verde.
