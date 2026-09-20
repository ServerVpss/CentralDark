# MICRO-HANDOFF — runner workspace contém o objeto da main

Data: 2026-09-20

```text
RUNNER_WORKSPACE=/root/CentralDark/actions-runner/_work/CentralDark/CentralDark
WORKSPACE_HEAD=8cfcb165d7cff1b39119dd09b5836d703b08e21b
TARGET_MAIN=6c50b694532e94a657f288dadaa4e084a63ab2b1
git cat-file TARGET_MAIN = PASS
```

Logo há uma ponte Git local, autenticada previamente pelo Actions, que permite transferir o objeto exato sem ler/reutilizar segredo.

`LOCAL_GIT_OBJECT_BRIDGE=PASS`
`SECRET_VALUE_ACCESS_REQUIRED=false`

Próximo cursor: fetch do filesystem → fast-forward VPS para TARGET_MAIN → estado limpo → contraprova.
