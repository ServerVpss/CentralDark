---
title: "Receipt-mãe — 429, conexões, HUD, app e voz"
status: KNOWLEDGE_ONLY
date: 2026-09-08
updated: 2026-09-08T00:00:00-03:00
tags: [receipt-mae, 429, connection-fabric, hud, voice, pr-mae]
category: BRAIN-APRENDIZADOS
sensitivity: INTERNAL
source: "sessão viva do CHEFE e trilha do PR-mãe"
source_class: HUMAN_AUTHORITY
source_rule: "ONE_WRITER_PER_CONFLICT_SCOPE; UNKNOWN_IS_NOT_PASS; ACTION_IS_NOT_PROOF"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/"
---
# 🧿 CENTRALDARK · RECEIPT-MÃE · 429 + CONEXÕES + HUD + APP + VOZ

Data: 2026-09-08

Refs #1444 #1463 #1462 #1458 #1456 #1455 #1454 #1447 #1445 #1378

```text
DESTINO=CENTRALDARK_TERMINADA
PR_MAE=#1444
ONE_SYSTEM_ONLY=true
ONE_CORE=true
REUSE_BEFORE_CREATE=true
NO_V2_V3_PARALLEL_SYSTEMS=true
ONE_WRITER_PER_CONFLICT_SCOPE=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
CURRENT_GT_HISTORICAL=true
```

## 1. Intenção consolidada do CHEFE

Acumular o ouro útil desta sessão inteira sem perder tarefas, mas sem promover automaticamente conversa, screenshot, proposta externa ou estado velho como verdade atual.

A sessão deve virar backlog rastreável no PR-mãe e nos owners existentes. Informação possivelmente parada entra como `INTAKE/HISTORICAL` e só exige remedição quando for usada para decisão, mutação, promoção, deploy ou afirmação de estado vivo.

```text
CHAT_ONLY_STATE=FORBIDDEN_AS_FINAL_STATE
STALE_INFORMATION=KEEP_AS_PROVENANCE
STALE_INFORMATION_AS_CURRENT=FORBIDDEN
CANDIDATE_CAPABILITY!=IMPLEMENTED_CAPABILITY
```

## 2. Estado vivo medido no GitHub no momento deste receipt

```text
MAIN_HEAD=58b7d6c44b1175891c4a97e3c57a54464375c901
MAIN_LAST_DELTA=Dependabot autoprefixer patch #1461
MAIN_PROTECTED=false

PR_1444=OPEN
PR_1444_MERGEABLE=true
PR_1444_BRANCH=reconcile/garimpo-one-site-one-mcp-admin-20260906
PR_1444_HEAD_BEFORE_THIS_RECEIPT=4a63145686f3d1bde48122549914f9b24d91360c

PR_1463=OPEN
PR_1463_MERGEABLE=true
PR_1463_HEAD=969ab7e144ce147df59667f71abb5a24263979df
PR_1463_ROLE=PREANSWER+LABEL/HORN/CLAIM+PR_TRILHO+QUEUE_FABRIC
```

O avanço da `main` invalida qualquer verde antigo que dependia de base/HEAD anterior até nova medição.

## 3. Onde começar fisicamente

### Ordem operacional

```text
1 CASA / VS CODE
2 GARIMPO como fonte de intake/evidência
3 PR owner / testes locais
4 GitHub same-head
5 VPS somente quando a tarefa for runtime/deploy
6 SITE / health / receipt
```

### Caminhos

```text
REPO_LOCAL_DE_EDICAO=E:\CentralDark\Pivete\CentralDark
GARIMPO_CHEFE=E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
VPS_REPO=<caminho-vps>
```

`E:\CentralDark\Pivete` sozinho não é a raiz Git. `GARIMPO-CHEFE` é diretório operacional/intake/receipts, não substitui o working copy Git.

Comando de entrada recomendado:

```powershell
code --new-window "E:\CentralDark\Pivete\CentralDark"
cd "E:\CentralDark\Pivete\CentralDark"
git fetch origin
git status --short --branch
```

Antes de trabalhar no PR-mãe:

```powershell
git switch reconcile/garimpo-one-site-one-mcp-admin-20260906
git pull --ff-only origin reconcile/garimpo-one-site-one-mcp-admin-20260906
```

Não começar pela VPS para trabalho de arquitetura/documentação. VPS entra depois, apenas quando o owner material for runtime/deploy/processo/porta/health.

## 4. Ferida 429 / limites de modelos

A sessão trouxe várias propostas externas: gateway único, fila de prioridade, retry/backoff, cache, fallback de modelos, message bus, estado global, supervisor, dashboard e memória compartilhada.

Essas ideias entram como `CAPABILITY_INTAKE`, não como autorização para criar novos sistemas.

```text
429_RATE_LIMIT=REAL_CLASS_OF_FAILURE
NEW_LITELLM_GATEWAY=NOT_AUTHORIZED_BY_INTAKE_ALONE
NEW_REDIS_OR_RABBITMQ=NOT_AUTHORIZED_BY_INTAKE_ALONE
NEW_QDRANT_OR_CHROMA=NOT_AUTHORIZED_BY_INTAKE_ALONE
NEW_RUST_GO_SUPERVISOR=NOT_AUTHORIZED_BY_INTAKE_ALONE
NEW_STATE_JSON_BRAIN=NOT_AUTHORIZED_BY_INTAKE_ALONE
```

### Reuso obrigatório

A solução deve primeiro tentar absorver o delta nos owners existentes:

```text
CARACOL/ROUTER
+ PROVIDER ACCESS LEASE (#1458)
+ QUEUE FABRIC / CONCURRENCY (#1463)
+ TRIGGER FABRIC / PR-TRILHO
+ HORN / REALITY JUDGE
+ RECEIPTS
```

Capacidades desejadas a incorporar onde já houver owner:

- rate limiter por provider/modelo;
- exponential backoff com jitter;
- retry somente para erros retryable;
- fila de prioridade;
- budget/limite diário e mensal visível no HUD;
- fallback explícito e auditável;
- `provider unavailable` / `quota exhausted` / `auth failed` como estados diferentes;
- dedupe/cache somente quando semanticamente seguro;
- um writer por escopo;
- nenhum segredo no cliente/UI/receipt.

## 5. HUD lateral de limites e conectores

O APP/.exe/painel deve ganhar uma projeção lateral de capacidade. A UI não vira juiz.

```text
HUD
├── Provider / modelo
│   ├── disponível
│   ├── quota/limite observado
│   ├── reset quando conhecido
│   ├── auth
│   └── último erro
├── Conectores
│   ├── INSTALLED
│   ├── CONNECTED
│   ├── AUTHORIZED
│   ├── READ
│   ├── WRITE
│   ├── RESPONDING
│   ├── LATENCY
│   └── LAST_CHECK
├── Queue Fabric 00..12
├── Casa
├── VPS
├── GitHub
├── Site
└── Receipts
```

Screenshot de plano/limites de provedor entra como `VISUAL_SNAPSHOT`, nunca como política durável. O HUD deve medir o provider/conta quando houver API/telemetria disponível.

```text
HUD_VIEW!=PROOF
QUOTA_SCREENSHOT!=LIVE_QUOTA_API
STATUS_GREEN_OLD!=CURRENT_PASS
```

## 6. Connection Fabric

Conectores instalados/autorizados devem ser tratados como capacidades independentes. `INSTALLED != RESPONDING`.

Alvos atuais incluem GitHub, CentralDark MCP, Remote Desktop Commander, Google Drive, Gmail, Calendar, Contacts, Notion, Canva, Malwarebytes e Files, quando disponíveis no ambiente de execução.

Contrato desejado:

```text
CONNECTOR
→ installed?
→ authorized?
→ read capability?
→ write capability?
→ live probe
→ health/latency
→ receipt
```

Falha em um eixo não para os demais:

```text
BLOCKED_IN_ONE_AXIS != STOP_ALL_AXES
SAFE_AXIS_AVAILABLE -> APPLY_MINIMAL_DELTA
```

## 7. Remote Bridge / Casa

Ferida observada na sessão:

```text
DEVICE=SEGREDO
WORKDIR=E:\CentralDark\_MAPA_CASA\GARIMPO-CHEFE
LOCAL_DESKTOP_COMMANDER_CONNECTED=true
REMOTE_MCP_CONNECTION_REACHED=true
PERSISTED_SESSION_ERROR=Invalid Refresh Token: Already Used
WRAPPER_SECONDARY_ERROR=Cannot bind argument to parameter Text because it is an empty string
```

Direção de correção, sem criar bridge V2:

1. classificar refresh token persistido usado/velho como `SESSION_STALE`;
2. não deixar string vazia derrubar o wrapper;
3. acionar renovação oficial de sessão;
4. rerodar a ponte existente;
5. exigir ping ChatGPT → Remote Desktop Commander → SEGREDO;
6. somente então declarar Casa remota disponível.

O Remote Bridge já possui mutex/single-instance, reconexão, backoff e receipt; o .exe deve supervisionar/reusar isso em vez de substituir.

## 8. Hermes Studio / Windows

Observações da sessão preservadas como intake operacional:

```text
HERMES_STUDIO_MCP=Connection closed / parked em várias tentativas
WINDOWS_JOB_OBJECT=Access denied em processos filhos
BFL_LEGACY_CONFIG=observado e tratado em perfil local na sessão
HERMES_WEB_UI_PORT_8648=foi observado sem listener em uma medição
```

Antes de agir novamente, remedir. Não confundir `Job Object Access denied` com causa automática de toda falha MCP.

## 9. VPS / Hermes / providers

Observações registradas na sessão e classificadas como `HISTORICAL_UNTIL_REMEASURED`:

- Hermes Agent apareceu executável na VPS;
- versão observada: `v0.21.0`;
- sessão reportou upstream/local com centenas de commits de diferença;
- projeto mostrou dezenas de skills locais não carregadas por trust;
- providers tiveram erros `401 Missing Authentication header` / chave ausente;
- instalador reportou Node, PM2, Caddy, Docker, Git, Curl, jq, MCP e cofre ativos;
- instalador reportou Cloudflare/token e webhook de atualização automática como parados naquela medição.

Nenhum desses itens deve ser tratado como estado vivo agora sem nova medição na VPS.

## 10. App .exe + JARVIS / FRIDAY + voz

Não criar outro cérebro.

```text
FRIDAY=INTERFACE_PERCEPCAO/VOZ/CONVERSA
JARVIS=ORQUESTRACAO/ROTEAMENTO_DE_INTENCAO
CENTRALDARK_CORE=CONTRATOS+ESTADO+PROVA
HERMES/PIVETE=EXECUCAO/CONTINUIDADE
REALITY_JUDGE=VEREDITO
```

O `.exe` deve chamar os mesmos owners e contratos usados pela CLI/GitHub/VPS:

```text
VOICE/CLI/UI
→ INTENT
→ ROUTER EXISTENTE
→ QUEUE
→ OWNER
→ EXECUTION
→ EVIDENCE
→ CLAIM CONTRACT
→ REALITY JUDGE
→ RECEIPT
→ HUD
```

O `.exe` pode embutir VNC/noVNC autorizado como visão/controle, mas:

```text
VNC_VIEW!=PROOF
```

Prova continua sendo SHA, log, exit code, artifact, HTTP, processo/health e receipt causal.

## 11. Operational Claim Contract

Não criar `answer-label-gate` paralelo. Estender o owner existente Horn/Reality.

```text
INTENT != ACTION
OBSERVATION != ACTION
ACTION != PROOF
COMMIT_RECORDED != CI_PASSED
CHECK_CONCLUDED != CI_PASSED
HTTP_MEASURED != SITE_REACHABLE
PROCESS_MEASURED != CASA_HEALTHY
```

Classes mínimas:

```text
INTENT
OBSERVATION
ACTION
COMMIT_RECORDED
CI_PASSED
MAIN_CONTAINS_DELTA
SITE_REACHABLE
CASA_HEALTHY
UNKNOWN
```

O #1463 continua sendo o owner operacional desse contrato; o #1444 apenas preserva rendezvous/lineage.

## 12. Queue / micro deploy / Dependabot / main

Fila canônica desejada:

```text
00 🧿 BOOT / PR TRILHO
01 🏷️ LABEL GATE
02 🧾 HANDOFF CONTRACT
03 🧪 TEST CONTRACT
04 🦌 HORN LINE GATE
05 🔌 CONNECTOR ROUTER
06 🤖 CODEX VALIDATE
07 📦 PACKAGE / ARTIFACT
08 🚀 MICRO DEPLOY
09 🌐 SITE HTTP CHECK
10 🏠 CASA RECEIPT
11 🧷 MAIN PROMOTION GATE
12 🔁 DEPENDABOT / CONFLICT RESOLVER
```

Regras:

```text
QUEUED|PENDING|IN_PROGRESS -> WAIT
FAILURE -> ROOT_CAUSE or RERUN_FAILED if same-head
CANCELLED|SKIPPED != PASS
OLD_HEAD != CURRENT_PROOF
RERUN_ALL_WHILE_PENDING=false
```

`main` está sem branch protection física na medição atual. A proteção lógica/House Gate não deve ser confundida com proteção GitHub.

## 13. PRs/lane que não podem sumir

```text
#1444 PR_MAE / rendezvous / destino
#1463 governança operacional, claim/label/horn, queue, handoff, preanswer
#1462 CI menos-é-mais / Judge-Porta / null OID
#1458 provider access lease
#1456 memory git-push killswitch (draft)
#1455 painel git-push killswitch (draft)
#1454 Horn / lógica & prova / biblioteca cognitiva
#1447 multi-canetas / handoff / juiz final
#1445 OmniRoute / capability lane citado no PR-mãe
#1378 sanitização CI/external-source
```

Além disso, todas as issues já indexadas no corpo do #1444 permanecem no denominador até classificação `OWNER | DUPLICATE | COMPLEMENTARY | SUPERSEDED | ABSORBED | CONFLICTING | UNIQUE | UNKNOWN`.

## 14. Sequência prática de trabalho

```text
FASE_A CASA_VSCODE
→ abrir E:\CentralDark\Pivete\CentralDark
→ sincronizar branch do owner
→ ler GARIMPO-CHEFE como intake
→ trabalhar um escopo por vez
→ teste local
→ commit pequeno

FASE_B GITHUB
→ PR-trilho
→ same-head CI
→ contraprova
→ Reality Judge
→ receipt volta ao #1444

FASE_C VPS
→ somente tarefa runtime/deploy
→ medir git/runtime/process/ports/health primeiro
→ patch mínimo
→ micro deploy
→ health/log/receipt

FASE_D APP_VOZ
→ ligar UI/voz ao mesmo core
→ HUD de quotas/conectores/queue
→ provar voice→intent→owner→action→receipt
```

## 15. Next cursor global

```text
NEXT_CURSOR_1=CASA_VSCODE_REPO_SYNC
NEXT_CURSOR_2=REMOTE_BRIDGE_SESSION_STALE_FIX_NO_V2
NEXT_CURSOR_3=PR1463_CLAIM_CONTRACT_AND_QUEUE_SAME_HEAD
NEXT_CURSOR_4=429_PROVIDER_RATE_LIMIT_ABSORPTION_EXISTING_ROUTER
NEXT_CURSOR_5=HUD_LIMITS_CONNECTION_FABRIC_IN_EXISTING_APP
NEXT_CURSOR_6=VPS_REMEASURE_ONLY_WHEN_RUNTIME_MATERIAL
NEXT_CURSOR_7=VOICE_INTENT_RECEIPT_END_TO_END
NEXT_CURSOR_8=RETURN_RECEIPTS_TO_PR1444
```

## 16. Fixed point

Ainda não atingido.

```text
FIXED_POINT=false
APP_READY=UNKNOWN
VOICE_END_TO_END=UNKNOWN
CASA_REMOTE=BLOCKED_SESSION_STALE
VPS_CURRENT_STATE=UNKNOWN_UNTIL_REMEASURED
SITE_CURRENT_STATE=UNKNOWN_UNTIL_REMEASURED
CI_SAME_HEAD=REMEASURE_REQUIRED_AFTER_NEW_HEADS
```

A regra final desta sessão fica:

> Nada fica para trás, mas nada velho ganha coroa de estado vivo sem remedição. Primeiro Casa/VS Code, depois PR same-head, VPS só quando a dor for runtime, e todo ouro volta ao #1444.