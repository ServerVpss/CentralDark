---
name: centraldark-capability-hud
description: Boot de capacidades reais da sessão. Use no começo de missão operacional e como parte obrigatória de #ACORDAR/!ACORDAR antes de alegar que uma ferramenta, conector, workflow, runtime, arquivo ou ponte não está disponível; mede o que está carregado, tenta probes seguros e retorna bloqueio real com próximo identificador mínimo.
metadata:
  type: diagnostic
  version: "1.1"
  owner: SEGREDO/CHEFE
centraldark_autosync: true
centraldark_autosync_policy: main-runtime-lock
oracle_review_on_change: true
---

# CENTRALDARK CAPABILITY HUD

## Quando usar

Use no começo de missão operacional e sempre que o CHEFE cobrar execução direta, ferramenta conectada, GitHub, workflow, Desktop Commander, Google Drive, Casa, VPS, runtime ou ponte.

Também é parte obrigatória de:

```text
#ACORDAR
!ACORDAR
#acordar
!acordar
ACORDAR
```

`#ACORDAR` não é só recuperar memória/HEAD. Agora ele também acorda a capacidade real da sessão: quais ferramentas existem, quais foram probeadas, onde parou e qual identificador mínimo falta.

Use antes de responder:

```text
nao consigo
nao tenho ferramenta
preciso do link
preciso do run id
```

## Regra curta

```text
#ACORDAR
→ LOAD_CAPABILITY_HUD
→ MAPEAR_ROTAS_DISPONIVEIS
→ PROBE_RELEVANTE_SEGURO
→ SEGUIR ATE PASS | CAUSA_RAIZ | BLOQUEIO_REAL

INTENCAO >= 95%
→ IDENTIFICAR OWNER/ROTA
→ DESCOBRIR FERRAMENTA DISPONIVEL
→ PROBE SEGURO
→ EXECUTAR ATE PASS | CAUSA_RAIZ | BLOQUEIO_REAL
→ SO ENTAO RESPONDER
```

## HUD minimo

```text
TOOL_OR_ROUTE=
DISCOVERED_CAPABILITY=
PROBE_ATTEMPTED=
RESULT=
BLOCKER_IF_ANY=
NEXT_REQUIRED_IDENTIFIER=
CONFIDENCE_ACTING_PERCENT=
```

## Probes obrigatorios por rota

### GitHub

```text
fetch main/commit
→ se CI: workflow runs by SHA
→ jobs
→ logs
→ erro exato ou PASS
```

Nao parar em leitura de commit se a intenção for workflow/CI/log.

### Desktop Commander / RDC

```text
discover/list devices
→ confirmar auth context
→ probe read-only ou harmless command
→ stdout/stderr
→ device/auth/tool blocker real
```

Nao confundir OAuth conectado com device utilizavel.

### Google Drive / arquivos

```text
discover/list/search
→ read exact artifact
→ materialize somente quando bytes forem necessários
→ gap real se arquivo/folder/id nao existir ou conector bloquear
```

### Casa / VPS / runtime

```text
separar Casa de VPS
→ identificar bridge
→ probe harmless: pwd/git status/health
→ provar efeito no alvo certo
```

## Cadeados

```text
TOOL_LISTED != TOOL_ACTIVE
OAUTH_CONNECTED != DEVICE_USABLE
SEARCHED != VERIFIED
COMMIT_EXISTS != CI_PASS
PATCHED != ROOT_CAUSE_FIXED
HISTORY != CURRENT
UNKNOWN != PASS
```

## Resposta esperada

Se conseguir executar, entregue resultado primeiro.

Se travar, entregue somente:

```text
PAREI_EM=
BLOQUEIO_REAL=
JA_TENTEI=
IDENTIFICADOR_MINIMO_PARA_CONTINUAR=
```

Nunca voltar cedo por suposição de limitação.
