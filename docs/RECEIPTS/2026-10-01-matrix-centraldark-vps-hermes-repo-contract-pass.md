# Matrix CentralDark — VPS/Hermes + repo-contract reconciliado

Data: 2026-10-01  
PR-MÃE: #1562  
Estado: PROVADO NO ESCOPO DE REPO-CONTRACT / SOUL-SYNC / RUNNER-POLICY / MICRODEPLOY

## Missão

Usar a VPS como runtime principal, acionar Hermes como braço substituível dentro da Matrix CentralDark e resolver o blocker CURRENT sem criar arquitetura paralela.

## Execução observada

- Hermes foi invocado na VPS com a Matrix canônica e a skill `centraldark-reverse-route`.
- Providers Nous/XAI não entregaram resposta útil no turno; failover/timeout permaneceu FAIL/UNKNOWN, sem falso verde.
- Um fallback OpenRouter retornou `exit 0` mas não cumpriu a resposta semântica exata; `exit 0` não foi promovido a PASS.
- A CentralDark continuou pelos mesmos owners canônicos, provando que o motor é braço substituível e não cérebro/owner do aprendizado.

## Deltas absorvidos

- `8f5003046ee295696c99215dcd147cbaad3bb487` — SOUL absorveu o lifecycle universal de branch/PR e atualizou âncoras após revisão.
- `4fa4f6ae56477c265b90521946f908f7ad8680ba` — `selo-fabric.yml` passou a ser reconhecido pelo fiscal como exceção GitHub-hosted legítima, por ser GitHub-API-only e não executar/deployar runtime.
- main avançou depois para deltas MCP de enforcement de branch/draft; último HEAD observado antes deste receipt: `f679feb7c6cbc274e9e65e614b85f56ecd5dc00d`.

## Leis preservadas

```text
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
ONE_WRITER_PER_SCOPE=true
CURRENT>HISTORY
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
EXIT_CODE_IS_SIGNAL_NOT_CAUSE=true
BRANCH_IS_TRANSPORT_NOT_INTENT=true
NO_BRANCH_PARKING_LOT=true
AUTONOMOUS_PR_DRAFT_DEFAULT=false
AUTHORIZED_INTENT_DRAFT_AUTO_READY=true
EPHEMERAL_BRANCH_DELETE_AFTER_MERGE=true
```

## Prova material

Em worktree limpa da main reconciliada:

- `REPO_CONTRACT_VERIFY=PASS`
- `CANONICAL_RUNNER_POLICY=PASS`
- `SOUL_SYNC_CURRENT_FOR_FIXED_POINT=PASS`
- `failed=0`
- `runner_violations=[]`

Na VPS, após o ciclo:

- `CentralDark-Hermes=online`
- `CentralDark-MCP=online`
- `CentralDark-HubBot-Srver1=online`
- `CentralDark-HubBot-Guardiao=online`
- `CentralDark-OAuthBroker=online`
- `MCP :9100/health = HTTP 200`
- microdeploy owner-scoped do MCP = PASS
- `PULSE_PASS` observado com `unhandled=0`

## Contraprova

- O checkout vivo da VPS permaneceu em drift e não foi resetado à força.
- O PASS do repo-contract não foi usado como prova de toda a CentralDark.
- PRs/deltas independentes ainda podem permanecer abertos; fixed point GLOBAL não foi declarado.

## Fixed point

```text
FIXED_POINT_REPO_CONTRACT=true
FIXED_POINT_SOUL_SYNC=true
FIXED_POINT_RUNNER_POLICY=true
FIXED_POINT_RUNTIME_OWNER_SCOPE=true
FIXED_POINT_GLOBAL=false
```

A Matrix não criou outro owner. Hermes permaneceu motor substituível; SOUL, Trigger Fabric, receipts, Reality Judge e PR-MÃE continuaram sendo o mesmo sistema.
