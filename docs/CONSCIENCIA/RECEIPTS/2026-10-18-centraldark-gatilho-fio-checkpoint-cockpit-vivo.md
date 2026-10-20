# 🪬 Receipt — !CENTRALDARK, último checkpoint, Hermes e cockpit ativo

DATA: 2026-10-18 (UTC, execução em CENTRAlDARK-OS)
OWNER: `scripts/hermes/verified-checkpoint.py` + adaptador fino `scripts/hermes/centraldark-entry.py`.
INTERFACE EXISTENTE: `apps/instinto-superior/src/components/central/CockpitShell.tsx`, aba Hermes.
FONTE CANÔNICA: `ServerVpss/CentralDark@main`.
POLÍTICA DE PROVA: `EXIT_0 + CRITÉRIO_DE_TESTE + CONTRAPROVA = CHECKPOINT_VERIFICADO`. No PASS por título, enqueue ou publicação apenas.

## Intenção humana

O CHEFE não deve digitar comandos nem ler um manual para retomar missão. O disparo `!CENTRALDARK` (qualquer caixa) ou o botão do cockpit encontra sozinho o último checkpoint verificado na VPS, resgata `INTENCAO | MISSAO | ULTIMO_PASS | NEXT_CURSOR | RECEIPT_SHA256`, e continua. Se existir `active-plan.json` do próprio owner, retoma etapas não verdes. Sem plano, a rota de execução é `hermes kanban create --goal --idempotency-key ... --body-file -` do Hermes já instalado, com mesmo `NEXT_CURSOR` e mandato de produzir novo receipt. Não há outro Hermes, outro cérebro ou nova fila.

## Artefatos publicados na main (leitura GitHub confirmada)

- `scripts/hermes/verified-checkpoint.py`: `latest` read-only, cadeia sha, `active-plan.json`.
- `scripts/hermes/centraldark-entry.py`: `--status`, sem argumentos, `--continue` local ou Kanban Hermes com idempotência.
- `scripts/casa/centraldark-entry.ps1`: adaptador ao mesmo owner por SSH privado `Segredo-VPS`; apenas código publicado, Casa offline na medição.
- `LEIA-ME-IA.md`: owner único `!CENTRALDARK`, correlacionando todas superfícies.
- `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `.github/copilot-instructions.md`: ponte fina ao mesmo owner, sem duplicar regras.
- `apps/instinto-superior/src/lib/checkpoint.functions.ts`: leitura e despacho RPC sob sessão Supabase e papel admin.
- `apps/instinto-superior/src/components/central/CheckpointCentralDark.tsx`: botões `Último checkpoint`, `!CENTRALDARK · Continuar missão`, `Entender CentralDark`, com mission/last PASS/NEXT_CURSOR/SHA.
- `apps/instinto-superior/src/components/central/CockpitShell.tsx`: componente anexado à aba Hermes já existente e botão de acesso no harness.
- `apps/instinto-superior/scripts/fix-node-ssr-cycle.mjs`: reparo reaproveitado do mesmo owner SSR. Novo pacote Nitro gerava `TypeError: createServerRpc is not a function`; remanejamento assertivo da declaração para depois das factories permite HTTP200. Testado no scratch e publicado.

## Evidência no runtime VPS

```text
MODEL_RUNTIME=Hermes Agent existente na VPS (sem modelo alterado)
CHECKPOINT_SCRIPT=/root/.hermes/centraldark/bin/verified-checkpoint.py
ENTRY_SCRIPT=/root/.hermes/centraldark/bin/centraldark-entry.py
MISSION=centraldark-cockpit-fio-vivo-20261018
LAST_VERIFIED_STEP=gatilho-cockpit-publicado-com-prova
NEXT_CURSOR=PROVAR_CLIQUE_ADMIN_CONTINUIDADE_E_CASA_REMOTA
VERIFIED_RECEIPT_SHA256=503149532d9d5ce6da9c985e66eb8dc5db67e6ebbad75eefede14cebbf166e59
INDEPENDENT_VERIFY_EXIT=0
CHECKPOINT_STAYS_OUTSIDE_SESSION=true
PREVIOUS_SMOKE_MISSION=hermes-fio-vivo-smoke-20261018 (not current)
```

Processo de continuidade sem plano (VPS, chamada real):
```text
centraldark-entry.py --status => mission=centraldark-cockpit-fio-vivo-20261018, dispatch_ready=true, plan_ready=false
centraldark-entry.py --continue => ok=true, status=ENQUEUED_AWAITING_RUNTIME_PROOF, task_id=t_adb5b828
centraldark-entry.py --continue (replay) => same task_id=t_adb5b828 (idempotência comprovada)
hermes kanban list --json => id=t_adb5b828, status=ready
checkpoint current.json permaneceu no mesmo receipt SHA; ENQUEUE != PASS.
```

Build/deploy:
```text
STAGE_SRC=origin/main@c1fc2945b08ee0cbef0b5627244f1fcd7318fd96 + mudanças posteriores TSX/RPC e fix SSR verificadas na main.
STAGE=/root/.hermes/centraldark/workspaces/cockpit-c1fc2945b08e
VITE_BUILD_EXIT=0
SSR_FLATTENED_ORDER=FIXED:createServerRpc-DHzXnV6D.mjs
STAGE_PREVIEW_HTTP_COCKPIT=200
STAGE_PREVIEW_HTTP_AUTH=200
STAGE_SSR_TYPEERROR_COUNT=0
CURRENT_RELEASE=/var/opt/centraldark/instinto-releases/4ff4508e7d0920b51d2fbb82e22025314ebb64b1/.output
PREVIOUS_RELEASE=98f780e93f71f48fe97466242b6544ed09acf9a8 (preservada)
APP_OUTPUT_POINTER=/root/CentralDark/apps/instinto-superior/.output (link simbólico versionado)
SERVICE=centraldark-instinto-superior-web.service active
NATIVE_MCP=centraldark-native-mcp-http.service active
HTTP_LOCAL_COCKPIT=200 / HTTP_LOCAL_AUTH=200 / HTTP_LOCAL_SALA_CONTROLE=200 (conferidos)
PUBLIC_COCKPIT=https://admin.centralldark.com/cockpit HTTP=200 (curl VPS)
PUBLIC HTML does not disclose private receipt hash
QUICK_TRIGGER=!CENTRALDARK visible in live SSR HTML
WORKTREE_DIRTY_FILES_PRESERVED=true
ROLLBACK=point .output back to preserved immutable previous release and restart unit
```

### Contraprovas e dívidas sem falso verde

1. `npm run verify:hud` no snapshot isolado: **27/28 PASS**, 1 FAIL no contrato legado `assert.ok(!infra.includes("fetch("))` versus fetch real no `InfraestruturaSistema.tsx`. Não atribuir esse conflito ao novo checkpoint nem alterar o teste só para passar. O build Vite direto foi executado e validado via HTTP.
2. `tsc --noEmit`: falhas históricas em componentes pré-existentes, sem erro atribuído à implementação de checkpoint na listagem obtida. Não declarar compilação TypeScript global como PASS.
3. Teste de clique do botão com token admin humano **NÃO EXECUTADO**. Autorização da leitura/despacho está implementada no server-side; prova E2E do clique permanece `UNKNOWN`, apesar de HTML/HTTP200.
4. Casa física Windows `SEGREDO` **OFFLINE** no Desktop Commander (última leitura ~9h). O adaptador PowerShell existe na main, porém instalação/execução física na Casa = `UNKNOWN`.
5. GitHub commit e instruções universais são fonte; um agente remoto precisa carregar `LEIA-ME-IA.md` e ter conector autorizado para ler estado da VPS. Não confundir instrução com runtime automaticamente ligado.
6. Kanban `t_adb5b828` está **ready**; execução Hermes e conclusão ainda não foram observadas.
7. `admin_commit_main` atualizou a main com readback mas o `deployListener` reportou `fetch failed`; o cockpit foi implantado **separadamente** pelo staging e symlink versionado, com prova HTTP.

## NEXT_CURSOR

```text
NEXT_CURSOR=PROVAR_CLIQUE_ADMIN_CONTINUIDADE_E_CASA_REMOTA
PENDING_1=E2E authenticated UI click + postdispatch receipt/current readback.
PENDING_2=Bring Casa SEGREDO online; test scripts/casa/centraldark-entry.ps1 against same VPS checkpoint.
PENDING_3=Confirm Hermes Kanban task t_adb5b828 actually ran, validate effect, write NEXT VERIFIED checkpoint.
PENDING_4=Resolve preexisting HUD regression separately with its legitimate owner.
```

CHEFE só precisa falar `!CENTRALDARK` ou clicar no botão. O restante é responsabilidade da rota autorizada real que recebeu a intenção. O manual técnico permanece em `scripts/hermes/README-verified-checkpoint.md`; a explicação de uso foi instalada no próprio cockpit em `Entender CentralDark`.
