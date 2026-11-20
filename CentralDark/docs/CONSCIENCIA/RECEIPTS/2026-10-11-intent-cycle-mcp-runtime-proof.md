# 🪬 CentralDark — Intent Cycle MCP em produção: contraprova T1

**INTENÇÃO:** promover o ciclo tipado `Gênesis → Fixed Point` da implementação `bed4dc6` ao MCP real sem repetir trabalho provado, substituir o Hermes original nem esmagar owners concorrentes.

**DATA DA MEDIÇÃO:** 2026-10-11T18:54:20Z. **ESCOPO:** somente adaptador MCP de intenção, API/status, saúde HTTP e proteção administrativa. **JUIZ:** prova de execução real, não texto/commit.

## Fonte e correção
- Implementação inicial: [`bed4dc669838e4b582f65ea5f779432b9cae21df`](https://github.com/ServerVpss/CentralDark/commit/bed4dc669838e4b582f65ea5f779432b9cae21df).
- Correção `647be27fb60f2c3a04e2c9218409852afcf3cc68`: `publicIntentStatus()` agora invalida recibo vencido, SHA divergente e fonte de prova que regrediu; teste negativo adicionado no mesmo owner `apps/modulos/mcp/src/intent-cycle-adapter.test.mjs`.
- Correção `97e5c410f4243fef8002ff8064f081187afdc3fb`: substituiu caminhos mascarados na transferência por `homedir()` no mesmo adaptador. **O transporte via ferramenta havia alterado bytes;** a guarda de hash abortou a primeira tentativa ANTES da mutação.
- Blob GitHub exato após correção: `791ab168e67fc21a6232046d4aa1b34fc0be18e3` no owner `apps/modulos/mcp/src/intent-cycle-adapter.js`. Hash dos bytes instalados no MCP vivo = `791ab168e67fc21a6232046d4aa1b34fc0be18e3` (readback).

## Execução e provas
- Código da `main` recuperado pela conexão GitHub autorizada, copiado a `/tmp` com `git hash-object` igual ao blob exato e testado isoladamente na VPS. **`node --test` → 10/10 PASS**, inclusive fila original Hermes, idempotência, recibo Critic, falsa prova, estado vencido e divergência de SHA. Não usar a saída do compilador como substituto do runtime.
- Target único: arquivo `intent-cycle-adapter.js` da cópia `dist/` realmente carregada pelo `centraldark-native-mcp-http.service`. Backup do arquivo antigo (blob `b7dd94a089a2a6570f38c7d273c4a7b5e69c753b`) preservado sob `/root/.centraldark/backups/intent-adapter-647be27-*`. Os arquivos `dist/admin.js`, `dist/index.js`, o HUD dirty e o checkout `/root/CentralDark` **não foram sobrescritos**.
- Reinício controlado do **serviço MCP existente**, sem criar outro serviço. O job launcher foi encerrado durante o próprio reinício do serviço; portanto seu status local `DEPLOY=START` isoladamente **não é prova**. Foi executado readback independente a partir do novo processo, sem depender do launcher.
- Contraprova HTTP no runtime após o reinício: `http://127.0.0.1:9100/intent/status` → **200**; `https://mcp.centralldark.com/intent/status` → **200**; `/health` local → **200**; `/admin/api/intent` sem sessão → **401**.
- Corpo `/intent/status`: `STATE=STALE`, `FIXED_POINT=false`, `NEXT_CURSOR=VERIFY_SOURCE_CURRENT`, `SOURCE_CURRENT=STALE`; o receipt antigo deixou de produzir um selo verde indevido. **T1 = PASS no escopo do fail-closed da API real.**
- Receipt categorizado no funil de logs existente: `event_id=0759c81b-9bcb-4742-8efd-21f8e47740e2`; `sector=consciencia`, `service=intent-cycle`, `kind=runtime_deploy_proof`, `key=intent-647be27-20261011`.

## Fronteiras que permanecem

```text
INTENT_CORE_TESTS=10/10_PASS
API_LIVE_PUBLIC=HTTP_200
STATUS_FALSE_GREEN_GUARD=PASS
AUTH_DENY_NO_SESSION=HTTP_401
RUNTIME_BLOB_READBACK=PASS
CI_OF_LATEST_MAIN=NOT_GLOBALLY_PASS
VPS_GIT_CHECKOUT=5344bd870 (antigo, com tracked dirty protegido)
HERMES_ADMIN_POST_E2E=NOT_TESTED_WITH_AUTHENTICATED_SESSION
FULL_GOAL_T_9040803D_FIXED_POINT=NOT_PROVEN
HUD_CASA_CURRENT=UNKNOWN
GLOBAL_FIXED_POINT=NOT_PROVEN
```

**Receita de continuidade (sem repetir T1):** recuperar commit `97e5c41`, os blobs e este receipt; confirmar que o adaptador vivo segue no mesmo hash. Para expandir cobertura, provar separadamente o **POST administrativo com sessão autorizada** e o ciclo real de fila/execução/selagem Hermes, confrontar a `main` e o checkout dirty pelo owner já existente, provar os critérios remanescentes e atualizar o mesmo HUD/One Heart sem falso verde. Não refazer o replay L000→L170 por causa de um gate independente. `COMMIT != DEPLOY`; `HEARTBEAT != APRENDIZADO`; `UNKNOWN != PASS`; `ONE_WRITER_PER_SCOPE=true`.
