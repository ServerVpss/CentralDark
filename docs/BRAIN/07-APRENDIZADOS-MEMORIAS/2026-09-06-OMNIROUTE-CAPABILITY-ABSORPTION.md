---
title: "2026-09-06 — Intenção do CHEFE = DELTA ÚTIL + absorção OmniRoute"
date: 2026-09-06
tags: ["aprendizado", "omniroute", "roteador", "delta-util", "zero-regressao"]
---

# Aprendizado cristalizado

## Lei corrigida pelo CHEFE

```text
INTENCAO_DO_CHEFE = DELTA_UTIL
AGENTE_DECIDE_SE_E_UTIL = FALSE
```

O agente pode e deve contestar uma implementação, medir risco, identificar owner, reduzir blast radius, exigir prova e escolher o caminho técnico mais seguro. O agente não transforma a própria preferência em veto sobre a intenção humana autorizada.

```text
CHEFE_PEDIU=true
→ DELTA_UTIL=true
→ MEDIR
→ RECONCILIAR
→ REUTILIZAR
→ IMPLEMENTAR/ADAPTAR
→ PROVAR
```

Isso preserva simultaneamente:

```text
AGENT_MAY_REDUCE_HUMAN_OBJECTIVE=false
METHOD_MAY_OPTIMIZE_OBJECTIVE_MUST_BE_PRESERVED=true
REUSE_BEFORE_CREATE=true
ZERO_REGRESSION=true
UNKNOWN_IS_NOT_PASS=true
```

## Aplicação ao #722

Pedido desta passagem: absorver capacidades do OmniRoute oficial dentro do organismo CentralDark, sem importar uma segunda identidade/control plane.

Fonte pinada:

```text
repo=diegosouzapw/OmniRoute
ref=release/v3.8.51
sha=f9a1cc8a9b7336e394ef921c753f5da691798df9
license=MIT
```

O owner de routing CentralDark já existe:

```text
apps/modulos/elite-gateway/scripts/centraldark_omni_router.py
```

Portanto:

```text
OMNIROUTE_CAPABILITIES
→ processar denominador completo
→ comparar com CentralDark
→ capability existente: REUSE/REFINE
→ capability ausente: ADAPTAR NO OWNER CORRETO
→ owner desconhecido: OWNER_DISCOVERY_REQUIRED
→ nunca apagar a intenção do denominador
```

## Primeira materialização

Foi criada uma superfície funcional única no site CentralDark:

```text
/roteador
```

Ela não declara paridade que ainda não existe. Ela torna visível o denominador de capability, o owner, a decisão e o nível de prova.

Manifest:

```text
public/central-dark-instinct-2/public/centraldark/router-capabilities.json
```

Estados explícitos:

```text
NATIVE
OWNER_EXISTS
ADAPTATION_REQUIRED
OWNER_DISCOVERY_REQUIRED
RUNTIME_UNKNOWN
```

### Regra de UI

```text
BOTAO_ROTEADOR_CENTRALDARK
!= ATALHO_PARA_SISTEMA_EXTERNO

BOTAO_ROTEADOR_CENTRALDARK
= SUPERFICIE_DA_CAPACIDADE_CENTRALDARK
```

O detalhe técnico pode continuar por baixo da superfície, mas o CHEFE vê um produto só.

## Contraprova deste aprendizado

Este arquivo não prova runtime, deploy, provider, CORS, VPS nem paridade completa. Ele registra a intenção, o método e a implementação candidata no Git.

```text
DOCUMENTED != EXECUTED
CAPABILITY_MAPPED != CAPABILITY_IMPLEMENTED
BUTTON_EXISTS != BACKEND_PARITY
SOURCE_REPO_FEATURE != CENTRALDARK_RUNTIME
```

A promoção depende dos checks no HEAD aplicável e de receipt pós-merge.

`PAPAGAIO=OFF · ZERO_REGRESSION=true`
