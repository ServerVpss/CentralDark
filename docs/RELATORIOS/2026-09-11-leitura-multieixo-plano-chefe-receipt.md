# Receipt - Leitura Multieixo do Plano do Chefe

MISSION_ID=LEITURA_MULTIEIXO_PLANO_CHEFE_20260911
STATUS=CRISTALIZADO_COMO_DELTA_EXPLICITO
TARGET_BRANCH=main
OWNER_EXISTENTE=.agents/skills/centraldark-operational-method/SKILL.md
REFERENCE_FILE=.agents/skills/centraldark-operational-method/references/2026-09-10-leitura-do-plano-do-chefe.md

## Pedido do CHEFE

Tornar explicito que, antes de responder sobre o plano do CHEFE, a Casa deve consultar todos os eixos relevantes: intencao, trajetoria, padrao, delta util, ferida real, owner, prova, risco, metacognicao, vertex ida-volta e sentido maior do plano.

## Ferida

A regra ja existia na conversa, mas ainda nao estava cristalizada explicitamente na peca oficial. Isso podia fazer um agente responder por uma unica ponta: chat, main, VPS, print, ferramenta ou aba.

## Correcao

Atualizada a referencia existente para adicionar a secao:

```text
🧭 Leitura multieixo do plano
```

A secao explicita:

```text
ANTES_DE_RESPONDER_SOBRE_PLANO:
  olhar: [INTENCAO, TRAJETORIA, PADRAO, DELTA_UTIL, FERIDA_REAL, OWNER, PROVA, RISCO, METACOGNICAO, VERTEX_IDA_VOLTA, SENTIDO]
  falar_primeiro: [INTENCAO, DIRECAO, EVOLUCAO, RISCO, PECA_FALTANTE, VEREDITO]
  esconder_ruido: true
  mostrar_tecnico_so_quando_mudar_decisao: true
```

## Traducoes simples adicionadas

```text
vertex = ida e volta da conclusao
multieixo = olhar por varios lados antes de falar
metafisico = sentido maior do plano, nao prova magica
```

## Nao tocado

```text
codigo executavel
workflows
runners
VPS
MCP
Desktop Commander
arquitetura paralela
novo owner
v1/v2/v3
```

## Prova disponivel

```text
OWNER_REUSED=true
REFERENCE_UPDATED=true
RECEIPT_ADDED=true
NO_EXECUTABLE_CHANGE=true
NO_RUNTIME_MUTATION=true
SECRETS_EXPOSED=false
```

## Limite honesto

Este receipt prova cristalizacao documental da regra multieixo. Nao prova runtime, CI verde, deploy, ferramenta ativa, comportamento de outro agente ou fixed point global.

## Next cursor

Aplicar este formato nas proximas leituras do plano do CHEFE e, quando as 9 guias forem trazidas, responder pelo plano primeiro e pela prova tecnica somente quando ela mudar a decisao.
