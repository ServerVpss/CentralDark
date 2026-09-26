# Receipt — convergência Casa/VPS/GitHub: CI root contract + deploy gate

CHEFE_INTENT: Executar agora a convergência Casa + VPS + GitHub no mesmo organismo CentralDark, corrigindo somente deltas reais encontrados até PASS com prova, causa-raiz ou bloqueio real.

START_HEAD: f3693fda6b18a23436db5b34ab127f5240ea4c91
END_HEAD: COMMIT_CONTAINING_THIS_RECEIPT (resolved after push as PR HEAD)
OWNER: GitHub workflows + deploy guard + root contract validator
WRITER_SCOPE: scratch E:/CentralDark/_WORKTREES/main-pinned-runtime-fastpath, branch a criar a partir de origin/main

FILES_CHANGED:
- .github/workflows/inventario-casa.yml
- .github/workflows/recibo-telegram-gabarito.yml
- .github/workflows/remote-desktop-multi-account-live-reconcile.yml
- .github/workflows/porta-de-entrada.yml
- .github/workflows/status-badge-fabric.yml
- scripts/vps/deploy-operational-guards.sh
- docs/CONSCIENCIA/RECEIPTS/2026-09-25-convergencia-casa-vps-github-ci-root.md

CAUSE_ROOT:
- GitHub main f3693fda6b18a23436db5b34ab127f5240ea4c91 tinha failure no workflow porta-de-entrada.
- Log do run 36206146775/job 108302996706 mostrou:
  - DEPLOY_GATE_BYPASS:scripts/vps/deploy-operational-guards.sh:esperado=scripts/vps/deploy-guards-dispatcher.sh
  - falha de validação mascarada: .github/workflows/remote-desktop-multi-account-live-reconcile.yml:77
- Contraprova local do verify_repo_contract.py também mostrou política global de runner falhando por ubuntu-latest em inventario-casa.yml e recibo-telegram-gabarito.yml.
- Após push do PR filho, nova branch acionou porta-de-entrada com github.event.before zerado; o gate de identidade caiu em EXTERNAL_DELTA_REF_INCOMPLETE porque auditou HEAD sem base material.
- Status Badge Fabric disparou em push de branch filha e tentou criar PR com GITHUB_TOKEN, bloqueado pela política GitHub Actions createPullRequest.

DELTA:
- scripts/vps/deploy-operational-guards.sh agora declara explicitamente CANONICAL_DEPLOY_GATE="scripts/vps/deploy-guards-dispatcher.sh" junto ao dispatcher existente.
- remote-desktop-multi-account-live-reconcile.yml removeu o padrão `test ... || true` que mascarava validação; agora usa if explícito e emite WATCHDOG_STATE_MISSING quando o arquivo não existe.
- inventario-casa.yml e recibo-telegram-gabarito.yml passaram de ubuntu-latest para [self-hosted, Linux], preservando a política canônica já existente.
- porta-de-entrada.yml agora transforma before=40 zeros em fallback explícito para origin/main antes dos relatórios/gate de identidade.
- status-badge-fabric.yml não executa a job de regeneração em push de branch filha; preserva schedule/workflow_dispatch/push main.

TESTS:
- bash -n scripts/vps/deploy-operational-guards.sh: PASS
- node scripts/lupa/validar-porta-de-entrada.mjs: PASS, ERROS=0
- python3 scripts/trigger-fabric/verify_repo_contract.py .: PASS, failed=0, CANONICAL_RUNNER_POLICY=PASS
- node apps/modulos/mapeamento/core/validar-mapa.mjs --repo-root .: PASS (exit 0)
- python scripts/lupa/validar_autolupa_hash.py: PASS, IDENTIDADE_LOCAL=PASS, FORMATO_RESPOSTA=LOCKED

RUNTIME_PROOF:
- GITHUB_CURRENT_MAIN medido por gh api: f3693fda6b18a23436db5b34ab127f5240ea4c91.
- CASA local medida: repo E:/CentralDark presente, branch fix/mcp-health-telegram-owner-20260920 dirty; Screenpipe local 3030/3031 indisponível; Desktop Commander porta 3210 ativa; CentralDarkBridge process presente.
- VPS medido por SSH: /root/CentralDark main em ce7d7053df197d437b9c740a3b9bede108ee8d23, origin/main local f3693fda6b18a23436db5b34ab127f5240ea4c91, behind 18, dirty_count=132; PM2 CentralDark-MCP online; Omni Router online; GraphPanel ocupa 127.0.0.1:3030; 3031 ausente; Screenpipe bloqueado por GLIBC_2.38/2.39 ausentes em Ubuntu GLIBC 2.35.

COUNTERPROOF:
- PATCHED != FIXED aplicado: o mesmo gate local que falhava foi rerodado e passou no SAME_WORKTREE/START_HEAD com delta aplicado.
- O fix não declara deploy/runtime atualizado: CI remoto e VPS continuam como estado independente a revalidar após push/PR.
- Screenpipe não foi declarado PASS: processo/captura/query/MCP continuam não provados.

UNKNOWNS:
- GitHub CI remoto para o commit final ainda não executado até este receipt pré-commit.
- VPS /root/CentralDark tem dirty state não classificado e não foi sobrescrito.
- Casa Screenpipe 24x7 continua sem processo/health local no momento da medição.
- MCP Screenpipe 3031 continua indisponível.

BLOCKERS:
- SCREENPIPE_CASA_24X7=BLOCKED_DEVICE_OR_RUNTIME_OFFLINE_FOR_SCREENPIPE: 127.0.0.1:3030 e 3031 recusaram conexão na Casa; nenhum processo screenpipe detectado.
- SCREENPIPE_VPS=BLOCKED_BY_GLIBC_MISMATCH: binário observado requer GLIBC_2.38/2.39 e host tem GLIBC 2.35; porta 3030 pertence ao CentralDark-GraphPanel e não deve ser apropriada.
- VPS_DEPLOY_SYNC=BLOCKED_DIRTY_RUNTIME: /root/CentralDark está atrás do origin/main local e dirty_count=132; não houve reset/clean/restart.

FINGERPRINT:
- ROOT_CAUSE_GITHUB_RUN=36206146775
- ROOT_CAUSE_GITHUB_JOB=108302996706
- START_MAIN=f3693fda6b18a23436db5b34ab127f5240ea4c91
- LOCAL_TEST_SET=bash-n+validar-porta+verify_repo_contract+validar-mapa+autolupa

NEXT_CURSOR:
- Commitar este delta em branch filha, abrir/atualizar PR contra main, anexar receipt ao PR-mãe #1562, aguardar/remedir CI do HEAD final.
- Depois do merge/deploy, medir SAME_HEAD remoto e VPS sem sobrescrever worktree suja.
- Para Screenpipe: quando Casa runtime estiver disponível, provar PROCESS + HEALTH + RECENT_DATA + QUERY_USABLE + MCP_CONSUMPTION no owner existente; no VPS, manter 3030 do GraphPanel e não tentar daemon nativo bloqueado por GLIBC.

FIXED_POINT: false — delta local provado; CI remoto, deploy e Screenpipe permanecem pendentes/bloqueados conforme acima.

## Continuação — badge coverage no HEAD d4a9c4ae0d0ebf0339f080ab1e2572f575c6c9e6

CURRENT: PR #1698 head d4a9c4ae0d0ebf0339f080ab1e2572f575c6c9e6. Porta-de-entrada no run 36212760342/job 108355764409 falhou no step Status Badge Fabric: WORKFLOW_FILES=65, WORKFLOW_BADGES_INDEXED=62, MISSING=3 (centraldark-execution-contract.yml, inventario-casa.yml, recibo-telegram-gabarito.yml). Os steps anteriores passaram, incluindo REPO_CONTRACT_VERIFY, CANONICAL_RUNNER_POLICY, SELF_HEALING_CONTRACT e PORTA_OK.

CAUSE_ROOT: os três workflows acabaram de entrar/serem atualizados no conjunto de workflows, mas o índice canônico docs/STATUS-BADGES.md não havia sido regenerado. O teste do radar também localizou os mesmos 3 workflows como violações do cânone visual; esse delta visual já foi corrigido no HEAD d4a9c4ae0d0ebf0339f080ab1e2572f575c6c9e6.

CORRECTION: executado o gerador existente em modo local determinístico `BADGE_FABRIC_LOCAL_ONLY=1 python3 scripts/ci/generate_status_badges.py`, sem inventar branch/PR/run telemetry. O mesmo índice canônico foi regenerado, cobrindo os 65 workflows atuais.

COUNTERPROOF: `python3 scripts/ci/verify_status_badge_coverage.test.py` PASS (3 testes); `python3 scripts/ci/verify_status_badge_coverage.py` PASS (`WORKFLOW_FILES=65`, `WORKFLOW_BADGES_INDEXED=65`, `MISSING=0`, `EXTRA=0`); `git diff --check` PASS. O novo delta foi aplicado ao mesmo branch/owner; o CI do commit subsequente ainda precisa reexecutar para provar GitHub/SAME_HEAD.

FILES_CHANGED_THIS_CONTINUATION: docs/STATUS-BADGES.md.
NEXT_CURSOR: commitar e subir regeneração do índice; medir falha exata no commit novo; continuar até CI SAME_HEAD, causa-raiz remanescente ou blocker real. Não promover enquanto checks materiais falharem/penderem.

## Medição de bloqueadores vivos após push

SNAPSHOT_2026-09-26T10:21Z:
- PR #1698 OPEN + MERGEABLE, branch head `c7642b588b979306189e76e371107ad7e2f8532a`; checks do HEAD acionados, incluindo porta-de-entrada, permanecem QUEUED.
- GitHub Actions runner inventory: `vmi3256920` (labels `self-hosted, Linux, X64, centraldark`) OFFLINE e `vmi3256920-centraldark` (labels `self-hosted, Linux, X64, centraldark-ci`) OFFLINE; ambos `busy=false`. Causa material para impossibilidade de executar os gates self-hosted enquanto offline.
- VPS SSH via alias `segredo-vpss` resolve a `89.117.78.124:22`, user `root`, identity local configurada; probe BatchMode/ConnectTimeout=8 retornou `Connection timed out` (exit 255). SSH_CONFIG foi lido sem expor chave privada. Rota VPS indisponível a partir desta sessão; VPS/deploy/runtime permanece UNKNOWN, sem mutação.
- CASA medida diretamente em `E:/CentralDark`: branch `fix/mcp-health-telegram-owner-20260920`, HEAD `375558fd59f4ea9e9b1cd59961b81c25d2e8d17d`, `git status --porcelain`=55 entradas (dirty não classificado; preservado), Node v26.7.0, npm 11.19.0; Hermes.exe e pycharm64.exe em execução. Portas Screenpipe 3030/3031 não aparecem em LISTEN; 3210 LISTEN em loopback (serviço separado, não presumido Screenpipe). Nenhuma alteração feita na Casa.
- GitHub `main` re-medida: `f3693fda6b18a23436db5b34ab127f5240ea4c91`. PR-mãe #1562 OPEN e não mergeado. Registro de progresso publicado e re-lido: https://github.com/ServerVpss/CentralDark/pull/1562#issuecomment-5845438868.

BLOCKER_EXACT: BOTH_SELF_HOSTED_RUNNERS_OFFLINE prevents queued CI jobs from starting; SSH_TCP_22_TIMEOUT_TO_89.117.78.124 prevents VPS readback/deploy diagnosis. No authorization to mutate server/runner or reset dirty Casa state. Recovery condition: at least one existing labeled runner online OR authorized alternate runner capacity; SSH transport reachable again (or another already-authorized proof channel), then resume at PR HEAD checks and VPS read-only reconciliation.

FIXED_POINT: false. Local badge-index delta proved; remote CI SAME_HEAD, deployment, VPS runtime, Screenpipe and global CASA/GitHub/VPS convergence not proven.
NEXT_CURSOR: keep PR #1698 open; resume on one existing runner returning online, rerun/read checks for current HEAD, fix any new causal failure; retry VPS read-only SSH after transport recovery. Do not merge #1562 or claim deploy/total convergence.

## Re-prova de saúde pública e origem — 2026-09-26T10:32Z

- HTTPS `https://admin.centralldark.com/contas/health` retornou HTTP 523 via Cloudflare, corpo `error code: 523`; `https://admin.centralldark.com/contas/ai-review.html` e `https://centralldark.com/health` também retornaram 523.
- Leitura Cloudflare API: zona `centralldark.com` ACTIVE; DNS tem 16 registros e todos os A observados (incluindo admin, api, app, raiz, wildcard) apontam para `89.117.78.124` proxied=true. Nenhum health check Cloudflare configurado. Configuração de DNS está coerente com o IP esperado; sem prova de erro DNS/cache.
- Prova direta Casa → IP `89.117.78.124` em TCP ports 22, 80, 443, 8099, 3030, 3031, 9400: todos TIMEOUT. Origem inacessível da Casa; Cloudflare também não alcança a origem (523).
- Provider identificado por RDAP/web lookup como Contabo AS40021; esta sessão não tem ferramenta de gestão Contabo conectada nem canal comprovado para poder ligar/inspecionar VM. Nenhum reboot/power/DNS mutation executado.
- API GitHub re-medida: os dois runners seguem OFFLINE/busy=false; gate `🧩 Porta...` para head `1722661ae52f4c9d77846fd1ae2b5c664f81c9d8` está QUEUED (outros checks também permanecem queued). PR #1698 OPEN/MERGEABLE, main `f3693fda6b18a23436db5b34ab127f5240ea4c91`.

BLOCKER_ID=ORIGIN_VPS_UNREACHABLE_AND_EXISTING_RUNNERS_OFFLINE
CLAIM_TARGET=89.117.78.124 (VM Contabo que hospeda CentralDark e dois runners self-hosted)
OBSERVED_ERROR=SSH/TCP timeout em múltiplas portas; Cloudflare HTTP 523; ambos runner IDs visíveis na API como OFFLINE
WHY_MACHINE_CANNOT_RESOLVE=sem reachability da VM e sem conectado no provedor Contabo para inspecionar/power-cycle; não há API de gerenciamento Contabo nem runner disponível nesta sessão. Alterar DNS não resolveria a falta de conexão com origem; criar runner hospedado violaria política existente.
HUMAN_ONLY_INPUT_IF_ANY=restaurar a VM/rede existente no painel Contabo ou prover canal de gestão autorizado já usado pela Casa; depois desta única fronteira, retomar de forma autônoma.
RESUME_CONDITION=origem reachável e pelo menos um runner existente online; health público responde, CI SAME_HEAD conclui; depois reconciliar VPS runtime e Screenpipe.
EVIDENCE_REF=issuecomment-5845459762; Cloudflare zone 6986cded70ab6bec23a765496807b614; GitHub runner API /actions/runners; HEAD check run 36235717988; HTTPS 523.
FIXED_POINT: false.
NEXT_CURSOR: após recuperar VM/canal de gerenciamento, iniciar exatamente os dois owners runner existentes conforme supervisão segura, reexecutar CI no HEAD atual, confirmar health público e read-only status VPS; resolver delta causal remanescente. Não mergear PR-mãe #1562.
