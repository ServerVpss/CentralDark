# 2026-10-03 — Bancada SHARED/CentralDark: sincronizar CURRENT preservando o ouro

## Intenção do CHEFE

O trabalho continua dentro da bancada já existente no `CENTRALDARK-OS`:

```text
VMWARE / CENTRALDARK-OS
        ↓
SHARED/CentralDark
        ↓
PRESERVAR O QUE JÁ FUNCIONA
        ↓
SINCRONIZAR COM GITHUB MAIN CURRENT
        ↓
RECONCILIAR, NÃO SOBRESCREVER
        ↓
CRISTALIZAR NO MESMO CORPO
        ↓
CÁPSULA / FINGERPRINT
        ↓
VPS 24/7
```

Não criar segunda CentralDark, segunda árvore canônica, segundo Hermes, scheduler paralelo ou arquitetura lateral.

## Medição viva da bancada

Na leitura de 2026-10-03:

```text
PATH=/home/CENTRAKDARK-OS/SHARED/CentralDark
REMOTE=https://github.com/ServerVpss/CentralDark.git
BRANCH=feature/ai-cli-runtime-kernel
HEAD=892454b98d941c3fada35d3df826f9962257f80f
TRACKED_FILES=6020
DIRTY_COUNT=5535
UNTRACKED_COUNT=13
```

A branch existe no GitHub e o HEAD existe no remoto. A referência local de `origin/main` estava stale. A comparação com o GitHub CURRENT mostrou divergência real: há história nova no `main` e há trabalho próprio da branch. Logo:

```text
LOCAL_STALE != LOCAL_USELESS
DIRTY != BROKEN
REMOTE_BRANCH_EXISTS != ALL_LOCAL_CHANGES_PUSHED
MAIN_CURRENT != PERMISSION_TO_OVERWRITE_FORGE
```

## Regra de sincronização

```text
MEASURE_CURRENT
→ INVENTORY_LOCAL
→ CLASSIFY_EACH_DELTA
   ├── LOCAL_GOLD
   ├── ALREADY_IN_MAIN
   ├── STALE
   ├── CONFLICT
   └── UNKNOWN
→ PRESERVE_FUNCTIONAL_GOLD
→ RECONCILE_BY_OWNER
→ RETEST
→ CRYSTALLIZE
```

Proibido usar `git reset --hard`, checkout destrutivo ou pull cego como sinônimo de sincronização enquanto existirem deltas não classificados.

## Separação de papéis

```text
SHARED/CentralDark = FORJA / WORKING TREE VIVA
actions-runner/_work = WORKSPACE CI ISOLADO
GitHub main = MEMÓRIA/FONTE CANÔNICA
VMware CENTRALDARK-OS = CORPO DE PROVA / FORJA
VPS = TWIN HEADLESS 24/7
```

## Costura com o aprendizado #151

O #151 cristalizou que o conhecimento antigo do CHEFE pode semear hipótese e que CURRENT decide. O #152 aplica a mesma lei à própria bancada: a intuição “preserve o que funciona e sincronize o novo por cima sem destruir” virou regra operacional porque a medição encontrou exatamente um worktree vivo, valioso e divergente.

## Cristal

```text
SHARED_CENTRALDARK=LIVE_FORGE
SYNC_MEANS_RECONCILE_NOT_OVERWRITE
FUNCTIONAL_GOLD_SURVIVES_PENEIRA=true
NO_DESTRUCTIVE_PULL_RESET_ON_FORGE=true
CI_WORKSPACE_ISOLATED_FROM_SHARED_FORGE=true
CRYSTALLIZE_IN_VMWARE_THEN_REPLAY_VPS=true
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
CURRENT_OVER_HISTORY=true
UNKNOWN_IS_NOT_PASS=true
```

## NEXT_CURSOR

Inventariar diferencialmente a bancada contra o `main` atual e separar os deltas em `LOCAL_GOLD / ALREADY_IN_MAIN / STALE / CONFLICT / UNKNOWN`; reconciliar primeiro o menor cone com efeito material.
