# Contraprova do antigo “10 frentes concluídas”

**Estado:** `SUPERSEDED_FALSE_GREEN`
**Medição:** 2026-08-30 UTC
**Owner:** CentralDark Trigger Fabric
**Regra:** este arquivo permanece no mesmo caminho para invalidar a alegação histórica sem apagar sua proveniência.

## O que o registro anterior provava

O registro anterior provava apenas que uma branch foi sincronizada e que a
`main` avançou. Isso é evidência de promoção Git, não de conclusão material das
dez frentes.

```text
COMMIT_EM_MAIN != EXECUCAO_GLOBAL
MERGED != CI_PASS
DOCUMENTED != EXECUTED
10_FRENTES_CLASSIFICADAS != 10_FRENTES_PROVADAS
```

## Contraprova observada

- O HEAD `7e02f999b842f74113736a456d9a581cfde067c0` do PR #1375 foi mesclado,
  embora `porta-de-entrada`, `lupa-conformance`, `Lupa Drift Guard` e
  `Trigger Fabric Full Package` tenham terminado em falha.
- O promotor tratava o modo `FAST` com denominador vazio de workflows:
  `applicableWorkflows = []`. Logo, “clean” podia ser promovido antes da prova
  do mesmo HEAD.
- `centraldark_master_cycle.py` reconhece `!CENTRALDARK`, expande a cadeia e
  pode persistir o booleano de sessão quando o caller fornece arquivo; o receipt
  continua registrando `mutation_authorized=false`. Isso não prova chamada
  automática de GitHub, VPS, MCP, logs ou webhooks.
- `runtime_plug_conformance.py --self-test` valida manifesto, resource fit,
  lease e envelope de troca sem contatar provider. O próprio harness declara
  que invocação viva é outra fronteira.
- A branch da Casa `reconciliacao/casa-20260829-consolidacao` no HEAD curto
  `58e0c6d48` provou testes FABLE no seu escopo. Na medição remota posterior,
  ela estava 10 commits à frente e 2 atrás da `main`, portanto esse fixed point
  local não encerra o objetivo global.

## O que está provado agora

| Escopo | Estado |
|---|---|
| Parser do ciclo mestre e negativos | `PASS` no self-test |
| Persistência booleana com caller explícito | `PASS` no teste de duas invocações |
| Capability selector | `PASS` em 3 fixtures |
| Runtime Plug | `PASS` em 11 checks de harness |
| Espiral | `PASS` em fixture de 5 pontos |
| Execução global do comando na Casa | `UNKNOWN` |
| Health/invocação de todos os runtimes selecionados | `UNKNOWN` |
| GitHub + VPS + MCP + logs + webhooks numa missão única | `UNKNOWN` |
| CI verde no mesmo HEAD antes de promoção | `BROKEN` no PR #1375; política corrigida na `main` pelo PR #1376, contraprova pós-correção pendente |
| Fixed point global | `NOT_REACHED` |

## Critério válido de conclusão

```text
DENOMINADOR_FECHADO
+ MESMO_HEAD_E_ALVO
+ TODOS_OS_GATES_PASS
+ CONSUMIDOR_REAL
+ EFEITO_OBSERVADO
+ CONTRAPROVA
+ UNKNOWN_MATERIAL_ZERO
= FIXED_POINT_DO_ESCOPO
```

A quantidade dez é teto de fanout e classificação. Nunca é prova por contagem.
O próximo cursor causal é provar que a política já incorporada bloqueia uma
promoção enquanto qualquer gate do mesmo HEAD estiver vermelho; depois, provar
o consumidor vivo do `!CENTRALDARK` na Casa.
