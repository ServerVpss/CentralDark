# Receipt: VPS Autonomous Git Sync

**Data:** 2026-10-06T09:19Z
**Commit:** 6ae79a9ec
**Agente:** Claude Opus 4.6 (Casa SEGREDO → SSH → CENTRALDARK-OS)
**Escopo:** scripts/vps/auto-sync-main.sh + cron root

## O que foi feito

1. **git pull origin main** na VPS CENTRALDARK-OS
   - Antes: 47d072212 (166 learnings atrás)
   - Depois: 070671b19 → 6ae79a9ec (177 arquivos sincronizados + script commitado)

2. **gh CLI v2.102.0** instalado via apt
   - Auth pendente: precisa gh auth login manual (token HTTPS funciona para sync)

3. **Script auto-sync criado**: /root/CentralDark/scripts/vps/auto-sync-main.sh
   - flock (sem execução dupla)
   - stash automático de dirty changes
   - pull --ff-only com fallback para rebase
   - log rotation (300 linhas)
   - Nunca: force-push, blind reset, restart all, secret echo

4. **Cron persistente**: */5 * * * * (a cada 5 minutos)
   - Teste manual: PASS ([OK] already up-to-date)

## Prova

    commit: 6ae79a9ec (pushed to origin/main)
    crontab -l: */5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh
    log: /root/CentralDark/scripts/vps/auto-sync.log
    test: 2026-10-06T09:19:30+00:00 [OK] already up-to-date at 070671b19

## Cadeados respeitados

    FORCE_PUSH=false
    BLIND_RESET=false
    RESTART_ALL=false
    SECRET_ECHO=false
    SECRET_COMMIT=false

## NEXT_CURSOR

- gh auth login manual na VPS (ou via Casa com link)
- Monitorar log de sync nos próximos ciclos
- Considerar systemd timer como alternativa ao cron se precisar de mais controle


## CURRENT — Direção 1: source-only na branch viva (2026-10-14 21:44 BRT)

**INTENT_ID=CENTRALDARK-FORJA-AUTOSYNC-DIRECAO-1-20261014** · **OWNER=scripts/vps/auto-sync-main.sh**, o sincronizador e seu receipt existentes. A seção de 06/10 acima é histórica: o código vigente já não aplica stash nem rebase automático.

**Por que reutilizar, não mover o scratch:** `/root/CentralDark/_worktrees/main-pinned-runtime-fastpath` existe e estava limpo em `910c2d67f230`, porém pertence exclusivamente a `scripts/vps/main-pinned-microdeploy.sh` e `scripts/vps/apply-current-learning.sh`; o contrato manda reset/clean sob lock em cada uso. É scratch efêmero, **não** espelho Git persistente.

**DELTA no mesmo arquivo:**
- `main` limpa continua seguindo os gates existentes (`flock`, checkout limpo, fast-forward only, rollback de untracked).
- Se o checkout ativo estiver em branch de trabalho, `git fetch --quiet origin main` atualiza apenas objetos/ref `origin/main`, sem `checkout`, `switch`, `reset`, `merge`, `stash`, `push`, `deploy`, restart nem acionamento de `main-pulse-reconciler.sh`.
- O estado fica `result=PARTIAL`, `SOURCE_REF_SYNC_PASS`, `CHECKOUT_SYNC=BLOCKED`, `RUNTIME_DEPLOY=UNKNOWN`, evitando falso-verde.

**Prova em runtime, VPS CENTRALDARK-OS:**
- GitHub: `DELTA_COMMIT=0c377e6d2dfe57006febde63b07de1f9c76d4c51`, arquivo em `main` com blob `7b44b03f24463de4091121053320af9c65aa2e94`.
- VPS: blob antigo `513c8d1a0fe31cf71b5e19a19370700a961afe4a` provado; cópia íntegra armazenada em `/root/CentralDark-Recovery/auto-sync-main/20261015T004417Z/auto-sync-main.sh`; substituição **somente desse owner** por blob Git canônico idêntico; `bash -n=PASS`.
- Execução `bash scripts/vps/auto-sync-main.sh --manual` em 2026-10-15T00:44:30Z: **exit 0**, log `[SOURCE_ONLY] REMOTE_MAIN_FETCH_PASS sha=0c377e6...`. `logs/auto-sync-status.json` retornou `result=PARTIAL` e os marcadores de bloqueio acima.
- Branch viva **não alterada**: `fix/ai-andarilho-casa-bridge@c77e50195fcd`. Alterações tracked continuam preservadas: `docs/HUD/HUD.html` (preexistente) e `scripts/vps/auto-sync-main.sh` (novo delta canônico aplicado à branch de trabalho). Worktrees e missões não foram tocados.
- Cron existente: `*/5 * * * * /root/CentralDark/scripts/vps/auto-sync-main.sh` permanece intacto. Próxima rodada automática deve ser observada em log antes de declarar `CRON_SOURCE_ONLY_PASS`.
- Nenhuma PR nova, novo checkout, outro sincronizador, push cego do `K:\`, rebase/reset, alteração em SSH ou deploy.

**FIXED_POINT_SOB_ESCOPO=SOURCE_REF_AUTOSYNC_ON_WORK_BRANCH_PASS.** **GLOBAL_AUTO_SYNC=PARTIAL**, **RUNTIME_MCP_PROMOTION=BLOCKED** pelo fileset `apps/modulos/mcp/src/admin.js`; `MAIN_PINNED_MICRODEPLOY=NOT_RUN_IN_THIS_DELTA`.

**NEXT_CURSOR:** provar o primeiro ciclo de cron após o delta; reconciliar separadamente os commits/arquivos pendentes da Casa com owners e gates da PR, sem auto-stage de `K:\`; classificar/validar fileset MCP antes de retomar `main-pulse`; só então medir deploy e readback do runtime. A Forja continua na branch de trabalho enquanto o Git acompanha a fonte `origin/main` em modo observador.


### Contraprova do cron real — 2026-10-14 21:45 BRT

O cron não precisou ser reiniciado nem editado. Na rodada seguinte à instalação do delta, `2026-10-15T00:45:03Z`, registrou automaticamente:
```text
[SOURCE_ONLY] REMOTE_MAIN_FETCH_PASS sha=48db33b154bdb08f9118a779dbebea403d714cde
branch=fix/ai-andarilho-casa-bridge
head=c77e50195fcd270cb2d7c5dbfdb16612d2ecaf82
tracked_count=2; CHECKOUT_PRESERVED=YES; RUNTIME_DEPLOY=UNKNOWN
```
Readback `logs/auto-sync-status.json` às `00:45:04Z`: `result=PARTIAL`, `SOURCE_REF_SYNC_PASS`, `CHECKOUT_SYNC=BLOCKED`, `RUNTIME_DEPLOY=UNKNOWN`. `CRON_SOURCE_ONLY_PASS=PASS`. O SHA do owner runtime permanece `7b44b03f24463de4091121053320af9c65aa2e94`; branch/HEAD da Forja permanecem inalterados. **O circuito de atualização da referência foi provado também no agendamento; a promoção de checkout/runtime continua bloqueada pelos gates existentes.**

