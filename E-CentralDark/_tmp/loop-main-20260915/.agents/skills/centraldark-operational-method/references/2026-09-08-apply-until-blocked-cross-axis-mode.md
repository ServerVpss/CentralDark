# 🧿 APPLY_UNTIL_BLOCKED · CROSS_AXIS_MODE

status: `DELTA_UTIL_REGISTERED`
owner: `.agents/skills/centraldark-operational-method/SKILL.md`
pr: `#1463`
refs: `#1444`, `#1463`
writer: `SOL`
mode: `APPLY_UNTIL_BLOCKED`
created_at: `2026-09-08T12:06:00-03:00`

## 0_INTENCAO

Registrar no PR a bronca correta do CHEFE: conversa operacional que identifica dor real deve virar melhoria aplicada, rastro, script, teste, workflow ou receipt quando houver eixo seguro para escrever.

```text
CHAT_RESPONSE_ONLY = FRACO
ANALYSIS_WITHOUT_APPLICATION = DRIFT
BLOCKED_IN_ONE_AXIS != STOP_ALL_AXES
SAFE_AXIS_AVAILABLE -> APPLY_MINIMAL_DELTA
```

## 1_REGRA_DO_MODO

```text
#ACORDAR APPLY_UNTIL_BLOCKED

1. medir estado vivo;
2. classificar a fala e a acao;
3. aplicar o menor delta seguro no owner existente;
4. registrar commit/receipt no PR-trilho;
5. medir efeito;
6. se um eixo bloquear, continuar pelos eixos ainda seguros;
7. parar somente com causa explicita.
```

## 2_EIXOS

```yaml
axes:
  chat:
    role: explicar, classificar, dar comando, registrar next_cursor
    proof_limit: nao prova execucao sozinho
  github:
    role: PR, commit, diff, checks, workflow, issue, receipt
    safe_action: commit em branch de PR existente
  casa:
    role: device, workdir, processo local, .exe, testes locais, receipt
    proof_requires: HEAD_LOCAL + comando + exit_code + log + receipt
  vps:
    role: runtime remoto, PM2, portas, health, logs, deploy hibrido
    proof_requires: git SHA + process status + health + log + rollback
  site:
    role: superficie publica
    proof_requires: artifact + deploy + HTTP + receipt
  app_exe:
    role: interface local do CentralDark/Jarvis/Friday
    proof_requires: processo + versao + comando interno + log + receipt
  remote_desktop:
    role: ponte para Casa quando online
    proof_limit: acesso/visao nao equivale prova
  vnc:
    role: visao e controle autorizado
    proof_limit: VNC_VIEW != PROOF
```

## 3_TRAVAS

```text
UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
MERGED != DEPLOYED
QUEUED != PASS
PENDING != PASS
SKIPPED != PASS
CANCELLED != PASS
RERUN_ALL_WHILE_QUEUED=false
SAME_HEAD_REQUIRED=true
MAIN_TOUCH_REQUIRES_PROMOTION_GATE=true
DEPLOY_REQUIRES_ARTIFACT_ROLLBACK_HEALTH=true
```

## 4_FALHAS_QUE_EXPLICAM_A_TRAVA_ANTIGA

```text
1. analise e aplicacao estavam misturadas;
2. bloqueio em Casa/VPS fazia a missao voltar para explicacao;
3. CI queued/pending impedia prova, mas nao deveria impedir delta seguro no PR;
4. falta de fila padronizada deixava checks parecerem bagunca;
5. falta de contrato cross-axis deixava CLI, .exe, VPS e site sem uma saida comum.
```

## 5_FORMA_DO_PRODUTO

Nome operacional candidato:

```text
CENTRALDARK PROOF FABRIC
```

Comandos-alvo:

```text
centraldark proof github --pr 1463
centraldark proof casa --pr 1463
centraldark proof vps --target mcp
centraldark proof site --url centraldark
centraldark proof queue --pr 1463
centraldark proof deploy --micro
```

Formato minimo de receipt:

```text
DOMAIN=CASA|VPS|GITHUB|SITE|APP|REMOTE_DESKTOP|VNC
TARGET_PR=1463
HEAD_EXPECTED=
HEAD_OBSERVED=
WORKDIR=
PROCESS=
TESTS=
HTTP=
ARTIFACT=
EXIT_CODE=
RESULT=PASS|FAIL|UNKNOWN|STALE
RECEIPT_SHA256=
NEXT_CURSOR=
```

## 6_CLI_EXE_CENTRALDARK_VPS

```text
CentralDark.exe
  -> chama o mesmo motor `centraldark proof`
  -> mostra fila por fase/emoji
  -> permite VNC/noVNC autorizado como visao
  -> executa somente comandos autorizados
  -> salva receipt
  -> pode anexar receipt ao PR

CLI
  -> mesmo contrato
  -> mesma saida JSON/Markdown
  -> roda em Casa, VPS e CI

VPS
  -> prova runtime remoto com SHA, PM2/processo, porta, health e log
```

## 7_POLITICA_VNC

```text
VNC_INTEGRADO = CANDIDATO_BOM
VNC_VIEW != PROOF
VNC_PUBLICO_CRU=false
VNC_VIA_TUNEL_AUTORIZADO=true
READ_ONLY_FIRST=true
DANGEROUS_ACTION_REQUIRES_CONFIRMATION=true
```

Uso correto:

```text
ver tela do app
ver terminal
ver erro reproduzido
ver browser local
ver logs
```

Prova correta:

```text
exit code
SHA
log
HTTP
artifact
receipt
```

## 8_RERUN_POLICY

```text
queued_or_pending -> WAIT
in_progress -> WAIT
completed_success -> KEEP
completed_failure -> RERUN_FAILED_ONLY_OR_FIX_ROOT_CAUSE
completed_cancelled -> RERUN_FAILED_ONLY_IF_HEAD_STILL_CURRENT
head_changed -> DO_NOT_RERUN_OLD_HEAD
```

`rerun all jobs` so deve ser usado depois da fila encerrar e quando o HEAD ainda for o atual. Enquanto ha queued/pending, rerun all aumenta ruido e nao gera prova melhor.

## 9_NEXT_CURSOR

```text
1. medir CI same-head do PR #1463;
2. rodar prova local da Casa contra o HEAD atual;
3. se Casa bloquear, registrar causa e seguir GitHub/VPS/site quando seguro;
4. transformar `centraldark proof` em CLI real reaproveitado pelo .exe;
5. integrar Queue Fabric como visor de fila do app;
6. somente depois avaliar main/squash/micro-deploy.
```

## 10_RECEIPT

```text
REQUEST=fazz o comit no pr disso que tu acabo de dizer
ACTION=commit_cross_axis_apply_mode_receipt
MAIN_TOUCH=false
MERGE=false
DEPLOY=false
PR=1463
BRANCH=sol/preanswer-github-gate-20260908
RESULT=COMMITTED_TO_PR_BRANCH
```
