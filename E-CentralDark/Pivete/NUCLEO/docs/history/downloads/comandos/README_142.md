# CENTRALDARK — PACOTE ÚNICO ATÉ DEPLOY

Objetivo final: `https://centralldark.com` = **1 site + 1 painel + 1 backend/gateway de entrada**.

Referência medida ao gerar o pacote:
- CentralDark: `ServerVpss/CentralDark@0af4e2f9f4ef0c33ad6fde00f51fcce8a641b81f`
- Buzz: `block/buzz@f88cda9eb886500ec7d205e1d265ac6f654aa433`

Regras:
- REUSE_BEFORE_CREATE
- ONE_SYSTEM_ONLY
- ONE_WRITER_PER_SCOPE
- NO_V1_V2_V3
- UNKNOWN != PASS
- Menos é Mais
- MetaLupa bloqueia falso verde
- Não parar por erro técnico solucionável
- Só pedir humano para bloqueio externo realmente impossível de obter autonomamente

Começar por `00-agent-prompt.md` e consumir os YAML de `config/` em ordem.
