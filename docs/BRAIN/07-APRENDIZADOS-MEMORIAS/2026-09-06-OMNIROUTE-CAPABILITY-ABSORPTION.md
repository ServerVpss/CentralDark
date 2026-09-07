---
title: "2026-09-06 — Intenção do CHEFE = DELTA ÚTIL + absorção OmniRoute"
status: KNOWLEDGE_ONLY
date: 2026-09-06
updated: 2026-09-07T05:46:09-03:00
tags: ["aprendizado", "omniroute", "roteador", "delta-util", "zero-regressao", "soul", "orquestracao", "blocker-exato"]
category: "B-Aprendizados"
sensitivity: INTERNAL
source: "PR #1445 + intenção do SEGREDO/CHEFE + OmniRoute release/v3.8.51"
source_class: HUMAN_AUTHORITY
source_rule: "INTENCAO_DO_CHEFE_IS_DELTA_UTIL"
owner: "docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md"
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

## Lei complementar — uma intenção, arquitetura inteira

O CHEFE não precisa receber a decomposição técnica como uma fila de tarefas manuais. O sistema pode decompor internamente, mas deve continuar sozinho por todos os passos que consegue medir e executar com capacidades autorizadas.

```text
ONE_COMMAND_EXPANDS_FULL_ARCHITECTURE=true
INTERNAL_MICROSTEPS_ALLOWED=true
HUMAN_MICROMANAGEMENT_REQUIRED=false
MACHINE_MEASURABLE_WORK_MUST_NOT_BE_DELEGATED_TO_HUMAN=true
```

Fluxo consolidado:

```text
INTENCAO_DO_CHEFE
→ #ACORDAR
→ !CALIBRAR
→ HISTORY_RENDEZVOUS
→ ESTADO_VIVO
→ OWNERS + CAPACIDADES + DEPENDENCIAS
→ RECONCILIAR
→ DELTA_UTIL
→ REUSE_BEFORE_CREATE
→ EXECUTAR
→ TESTAR
→ CONTRAPROVAR
→ REMEDIR
→ FIXED_POINT_OU_BLOCKER_EXATO
→ RECEIPT
→ REGISTRA
→ BOOT
```

## Blocker cirúrgico, não genérico

Se a máquina consegue resolver, procura owner, ferramenta, conector/MCP, documentação oficial e web quando necessário, adapta no owner existente, testa e continua. Se não consegue, o blocker precisa provar exatamente por quê.

```text
MACHINE_RESOLVABLE_BLOCKER → AUTO_CONTINUE
GENERIC_BLOCKER_FORBIDDEN=true
EXACT_BLOCKER_RECEIPT_REQUIRED=true
```

Receipt mínimo:

```text
BLOCKER_ID=
CLAIM_TARGET=
EXACT_PATH_OR_ENDPOINT=
OWNER=
OBSERVED_ERROR=
MISSING_DEPENDENCY=
ATTEMPTS_AND_ALTERNATE_ROUTES=
WHY_MACHINE_CANNOT_RESOLVE=
HUMAN_ONLY_INPUT_IF_ANY=
RESUME_CONDITION=
EVIDENCE_REF=
```

Interrupção humana só é justificada por entrada realmente humana ou hard blocker material: secret/senha/MFA, consentimento/aprovação humana exclusiva, ação física, nova decisão fora do escopo, autorização irreversível ainda não concedida, licença/lei, política/segurança, impossibilidade física ou dependência externa indisponível após rotas alternativas.

```text
OPEN_ISSUE_OR_PR != AGENT_FAILURE
OPEN_ISSUE_OR_PR != HUMAN_FAILURE
FAILURE_ATTRIBUTION_REQUIRES_CAUSAL_EVIDENCE
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

## Propagação pelo coração da Casa

A regra não fica apenas neste aprendizado. O owner de identidade operacional foi atualizado no mesmo lane:

```text
docs/CONSCIENCIA/01-IDENTIDADE-E-REGRAS/SOUL-SOL.md
```

Como a porta universal da Casa carrega `SOUL-SOL.md` antes da execução, Hermes/Pivete, SOL e motores substituíveis herdam a mesma lei operacional quando carregam o boot canônico.

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
