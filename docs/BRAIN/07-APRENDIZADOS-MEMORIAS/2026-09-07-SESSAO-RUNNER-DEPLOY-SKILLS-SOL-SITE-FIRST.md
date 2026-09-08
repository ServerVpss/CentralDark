---
title: "SESSÃO 2026-09-07 — runner, deploy, skills, SOL e prioridade SITE-FIRST"
status: KNOWLEDGE_ONLY
date: 2026-09-07
updated: 2026-09-07T05:46:00-03:00
tags: [brain, sessao, runner, deploy, skills, sol, site-first]
category: BRAIN-APRENDIZADO
sensitivity: INTERNAL
source: "PR #1444 + GitHub Actions + reconciliação da sessão"
source_class: INTERNAL
source_rule: "CURRENT > HISTORY; UNKNOWN != PASS; REUSE_BEFORE_CREATE"
owner: "docs/BRAIN/07-APRENDIZADOS-MEMORIAS/"
---
# SESSÃO 2026-09-07 — runner, deploy, skills, SOL e prioridade SITE-FIRST

**Natureza:** receipt de reconciliação da sessão; **não é novo owner**, não cria segundo cérebro, segundo router, segundo deploy ou V2/V3.
**Autoridade de intenção:** SEGREDO/CHEFE.
**PR-mãe de rendezvous:** #1444.
**Writer desta cristalização:** ChatGPT/GPT-5.6 Sol, escopo documental BRAIN/arquitetura da sessão.
**Regra:** estado vivo medido vence histórico deste documento.

```text
MISSION_ID=CASA_GITHUB_CARACOL_RECONCILIATION
ONE_SYSTEM_ONLY=true
REUSE_BEFORE_CREATE=true
NO_PLAN_LOSS=true
UNKNOWN_IS_NOT_PASS=true
ACTION_IS_NOT_PROOF=true
DOCUMENTED_IS_NOT_EXECUTED=true
MERGED_IS_NOT_DEPLOYED=true
ZERO_REGRESSION_REQUIRED=true
```

## 1. Medição viva antes deste receipt

```text
MAIN=b3de3d82067c9476657d8fff3c6115f05afa079a
PR_MOTHER=#1444
PR_HEAD_BEFORE_RECEIPT=454e2540f2ae919cdbed39a2317917888a3e92dc
COMPARE_MAIN_TO_PR=AHEAD
AHEAD_BY=23
BEHIND_BY=0
MERGEABLE=true
```

A descrição histórica do #1444 ainda carregava uma medição anterior de divergência. Ela não governa o presente.

### SAME-HEAD CI observado em `454e2540...`

```text
PR Title Contract=PASS
PR artefato de aprendizado automático=PASS
Lupa Drift Guard=PASS
Pipeline Telegram + Painel=PASS
codex-validate=PASS
CodeQL=SKIPPED
porta-de-entrada=FAIL
lupa-conformance=FAIL
Trigger Fabric pacote e contraprova=FAIL
PR auto-review=FAIL
FIXED_POINT=false
```

O receipt registra o vermelho; não o converte em verde.

## 2. Runner self-hosted: causa real vs hipótese de cache

A sessão começou comparando o incidente público `actions/runner#3609` com o runner CentralDark.

Medição mais nova no próprio job do #1444:

```text
RUNNER_VERSION=2.337.0
RUNNER_NAME=vmi3256920-centraldark
MACHINE=vmi3256920
EXECUTOR=self-hosted-linux
CHECKOUT_HEAD=454e2540f2ae919cdbed39a2317917888a3e92dc
NODE_SYSTEM=v22.22.2
NODE_TOOLCACHE=v24.19.0
NODE_HIT=toolcache
NODE24_READY=1
JOB_WAS_PICKED_UP=true
CHECKOUT_EXECUTED=true
POST_JOB_CLEANUP_EXECUTED=true
```

Conclusão desta medição:

```text
RUNNER_STUCK_LIKE_ISSUE_3609=NOT_OBSERVED
CACHE_AS_CURRENT_ROOT_CAUSE=NOT_PROVEN
TOOLCACHE_NODE24=WORKING
DELETE__work__tool=FORBIDDEN_WITHOUT_NEW_CAUSAL_EVIDENCE
```

O runner recebe job, executa steps e reutiliza o toolcache. Limpeza destrutiva não é remediação válida sem causa.

Se houver suspeita futura de lixo:

```text
MEASURE_FIRST
→ df/du
→ _diag
→ active_job_check
→ only_then_scope_cleanup
```

`_work/_temp` pode ser candidato a limpeza **somente** quando antigo, comprovadamente dispensável e sem job ativo. `.runner`, `.credentials*`, `bin/`, `externals/` e `_work/_tool` não entram em faxina cega.

## 3. Falhas atuais do #1444 que o runner apenas revelou

O gate `verify_repo_contract.py` encontrou, no HEAD medido:

```text
TRIGGER_FABRIC_PACKAGE_CONTRACT=FAIL
GLOBAL_RUNNER_POLICY=FAIL
```

Materialmente observado:

- `.github/workflows/trigger-fabric-package.yml` não satisfazia marcadores esperados `Trigger Fabric Full Package` e `Fresh-extraction counterproof`;
- `.github/workflows/build-centraldark-architecture-package.yml` usa `ubuntu-latest` e é workflow novo, contrariando a regra global de self-hosted/reuse do contrato atual;
- `centraldark-desktop-windows-installer.yml` também aparece no denominador global com hosted labels; isto precisa ser classificado pelo owner, não atribuído automaticamente a este receipt;
- o mapa bloqueou área protegida alterada sem `permito-segredo` no snapshot do job;
- o validador registrou `NOVO_WORKFLOW_BLOQUEADO_REUTILIZE_EXISTENTE` para `build-centraldark-architecture-package.yml`;
- há canonicals órfãos e achados de external-source/unpinned-action que precisam ser reconciliados pelos seus owners/lane corretos.

```text
RUNNER_RED != RUNNER_BROKEN
CI_RED = CONTRACT_FINDINGS_TO_RECONCILE
BASELINE_DEBT != PR_CAUSE_WITHOUT_DIFF_ATTRIBUTION
```

## 4. Arquitetura híbrida Casa ON / Casa OFF

Intenção confirmada:

```text
CASA_ON
→ Hermes/SOL/Grok/local podem participar
→ GitHub continua canônico
→ VPS continua disponível

CASA_OFF
→ GitHub + VPS continuam a missão persistente
→ PC local não pode ser dependência operacional obrigatória
```

A arquitetura não cria dois pipelines. É **um sistema com braços substituíveis**:

```text
                    CENTRALDARK
                        │
                 GITHUB CANÔNICO
                        │
                MESMO CONTRATO
                        │
          ┌─────────────┴─────────────┐
          │                           │
       CASA ON                     CASA OFF
          │                           │
  capacidade adicional          braço ausente
          └─────────────┬─────────────┘
                        ▼
                 VPS SELF-HOSTED
                        │
                 RUNTIME/DEPLOY
                        │
               HEALTH + RECEIPT
```

A Casa não é removida quando a VPS assume continuidade. Ela permanece braço local, superfície humana, desenvolvimento, percepção e failback.

## 5. Self-hosted normal ≠ SSH

Princípio consolidado a partir da documentação/tutoriais estudados:

```text
NORMAL_JOB_FLOW:
VPS actions-runner
→ conexão de saída com GitHub
→ GitHub entrega job compatível
→ job executa localmente na VPS

SSH_NOT_REQUIRED_FOR_NORMAL_JOB_PICKUP=true
```

SSH entra como rota de administração/socorro, não como mecanismo normal de entrega de job.

## 6. Recovery do runner: reutilizar owners existentes

Já existem owners de recuperação externa:

```text
.github/workflows/vps-wake-hosted-ssh.yml
.github/workflows/vps-reboot-forensic.yml
```

Logo:

```text
CREATE_runner-health-monitor.yml=false
CREATE_runner-auto-recover.yml=false
REUSE_BEFORE_CREATE=true
```

Arquitetura desejada, **ainda não implementada automaticamente por este receipt**:

```text
LINHA_1: systemd/service policy recupera processo local quando possível
LINHA_2: vigia externo detecta estado material persistente
LINHA_3: vps-wake-hosted-ssh tenta recuperação do runner quando SSH/VPS respondem
LINHA_4: vps-reboot-forensic é escalada quando a VPS/porta de administração está degradada
```

Antes de restartar:

```text
ONE_OFFLINE_SAMPLE → OBSERVE
REPEATED_OFFLINE + SERVICE_INACTIVE → RECOVER
GITHUB_OFFLINE + SERVICE_ACTIVE → FORENSICS/_diag BEFORE_RESTART
SSH_UNREACHABLE → ESCALATE_VPS, NOT_FAKE_RUNNER_FIX
```

Alertas devem ser deduplicados por runner/incidente:

```text
OFFLINE_FIRST → CREATE/OPEN_ONE_RECEIPT
OFFLINE_CONTINUES → UPDATE_EXISTING
RECOVERED → RECORD + CLOSE
```

A API de listagem de self-hosted runners pode exigir permissão administrativa/read específica; `contents: read` sozinho não deve ser presumido suficiente. Um monitor que recebe 403 é vigia sem olhos.

## 7. Delta de Docker/artefato: build once, promote exact bytes

O garimpo de CI/CD + Docker reforçou um plano de artefato sem impor Docker a tudo:

```text
SOURCE_SHA
→ BUILD
→ TEST
→ IMMUTABLE_ARTIFACT
→ DIGEST/HASH
→ REGISTRY_OR_CANONICAL_ARTIFACT_STORE
→ PROMOTE_EXACT_ARTIFACT
→ RUNTIME
→ HEALTH
→ COUNTERPROOF
→ RECEIPT
```

Princípios absorvidos:

```text
BUILD_ONCE_PROMOTE_SAME_ARTIFACT=true
ARTIFACT_IDENTITY_MUST_BIND_TO_SOURCE_SHA=true
RUNTIME_DIGEST_MUST_MATCH_EXPECTED_WHEN_APPLICABLE=true
LAST_KNOWN_GOOD_REQUIRED=true
GC_MUST_BE_MEASURED_NOT_BLIND=true
BUILD_HOST != RUNTIME_HOST
DOCKER_IS_CAPABILITY_NOT_RELIGION=true
```

Material legado de `docker-machine`, Shipyard, Swarm clássico e registry HTTP inseguro não vira arquitetura por presença em tutorial antigo.

O mapa de runtime atual já contém serviços Docker e não-Docker; nenhuma migração big-bang é autorizada por este aprendizado.

## 8. AWS DevOps Agent Skills + AI-OX: delta útil sem segundo sistema

O estudo de AWS DevOps Agent Skills reforçou capacidades que se encaixam nos owners existentes:

```text
SKILL_SOURCE_IN_GIT
SKILL.md_REQUIRED
VERSIONED_SKILL_SOURCE
ROLE/TASK_TARGETED_LOADING
ACTIVE/INACTIVE_LIFECYCLE
SKILL_SYNC
SKILL != MEMORY
PIPELINE_TOPOLOGY
```

AI-OX já foi absorvido como fonte de padrões/capacidades na arquitetura CentralDark; não vira autoridade, brain, router ou runtime obrigatório.

Quatro deltas ficam **preservados, mas não implementados só por terem sido descobertos**:

```text
#1 skill_lifecycle_activation
#2 skill_sync_sha_checksum
#3 pipeline_topology_derived
#4 runner_off_auto_recovery
```

Contrato:

```text
DELTA_UTIL_PRESERVADO=true
IMPLEMENT_ONLY_WHEN_RUNTIME_OR_CI_MAKES_IT_MATERIAL=true
NO_PREMATURE_ARCHITECTURE_WORK=true
```

Estados conceituais úteis para skill:

```text
AVAILABLE
ACTIVE
SELECTED
LOADED
INACTIVE
EXPERIMENTAL
UNAVAILABLE
```

`SKILL_EXISTS != SKILL_SELECTED != SKILL_LOADED`.

Pipeline topology deve ser **derivada, não nova autoridade**:

```text
COMMIT
→ PR/GATE
→ WORKFLOW
→ RUNNER
→ BUILD
→ ARTIFACT
→ PROMOTION
→ PROCESS
→ PORT
→ PROXY/ROUTE
→ DOMAIN
→ HEALTH
→ CONSUMER

REVERSE_REQUIRED=true
```

CARACOL pode percorrer essa topologia forward/reverse sem transformar traversal edge em semantic edge.

## 9. Planos antigos/futuros não são perdidos

Nenhum aprendizado desta sessão autoriza remover reserva só porque não está ativa.

Preservar:

```text
ODS
BUZZ
OPENMAUSBOT
OPEN_LOVABLE
LOCAL_AI
GROK_BUILD
AI-OX_DERIVED_CAPABILITIES
FUTURE_DISCOVERED_CAPABILITIES
```

Regras:

```text
CANDIDATE != DISCARDED
DEFERRED != CANCELLED
RESERVE != DEAD
UNKNOWN != REMOVED
NO_PLAN_DELETION_BECAUSE_INACTIVE=true
```

### Grok Build

A medição mais nova da `main` já encontra adapter/contrato/teste de Grok Build; portanto a classificação histórica `FUTURE_ENGINE_CANDIDATE` é provenance antiga, não estado suficiente do presente.

Intenção do CHEFE preservada:

```text
SITE_FIRST=true
AFTER_SITE_LIVE:
  HERMES + GROK_BUILD
  → trabalhar juntos como capacidades rápidas
  → paralelizar percepção/escopos independentes
  → um Writer por escopo de conflito
  → rendezvous
  → counterproof
```

Nenhum claim de runtime Grok ativo é feito por este receipt.

### Buzz

Buzz permanece reserva/reference para colaboração/event-view sobre owners existentes. Não criar colmeia/brain/event bus paralelo só para honrar o nome; capacidades futuras são absorvidas no owner correto.

## 10. Prioridade atual do CHEFE: SITE NO AR

A ordem vigente da sessão é inequívoca:

```text
PRIORIDADE_ATUAL=SITE_NO_AR

SITE_NO_AR
→ RUNTIME_REAL
→ DOMAIN/ROUTES
→ HEALTH
→ LOGS
→ SOURCE_SHA/ARTIFACT_IDENTITY
→ MINIMUM_REAL_ACTION
→ COUNTERPROOF
→ REALITY_JUDGE
```

Os quatro deltas #1–#4 não devem sequestrar a missão antes de doerem de verdade.

Critério:

```text
SKILL_SELECTION_DOI → materializa #1
SKILL_DRIFT_DOI → materializa #2
TRACE_COMMIT_TO_RUNTIME_DOI → materializa #3
RUNNER_OFFLINE_CONTINUITY_DOI → materializa #4
```

Até lá, preservar e seguir.

## 11. SOL Voice-First / superfície local observada

Snapshot visual da sessão mostrou a superfície SOL em `localhost:1420` respondendo ao diagnóstico `SOL_UI_DIAG_OK`, com receipt visual contendo `mutation:false`, `status:"PASS"`, `route:1` e coverage `5/5`.

Escopo correto da evidência:

```text
SCREENSHOT_PROVES=VISIBLE_UI_RESPONSE
SCREENSHOT_DOES_NOT_PROVE=GLOBAL_FIXED_POINT
UI_PASS != SITE_PRODUCTION_PASS
UI_PASS != ALL_CAPABILITIES_RUNTIME_PASS
```

A superfície local pode ser uma porta humana quando medida, mas produção/site real continua alvo separado.

## 12. Contrato PAPAGAIO invertido: CHEFE livre, SOL deduplica

Correção semântica importante da sessão:

```text
CHEFE_CAN_PAPAGAIO=true
SOL_MUST_NOT_PAPAGAIO=true
```

O CHEFE pode falar livremente, repetir contexto, misturar passado/presente/futuro, hipótese, ideia, resenha e fragmentos. Isso não é erro de entrada.

Responsabilidade da máquina:

```text
RECOVER_CONTEXT
→ RECOVER_LIVE_STATE
→ IDENTIFY_DOMINANT_INTENT
→ SPLIT(PAST,PRESENT,FUTURE,REPETITION,DELTA)
→ DEDUPE
→ RECONCILE_CONTRADICTIONS
→ FIND_EXISTING_OWNER
→ CHOOSE_TECHNICAL_DIRECTION
→ EXECUTE/MEASURE_WHEN_AUTHORIZED
→ RETURN_ONLY_MATERIAL_DELTA
```

```text
CHEFE_REPEAT != SOL_REPEAT
CHEFE_REPEAT_MAY_REINFORCE_INTENT=true
SOL_DEDUPLICATES_AUTOMATICALLY=true
MACHINE_RESOLVABLE_DIRECTION_IS_MACHINE_DUTY=true
HUMAN_REASK_ONLY_FOR_REAL_INTENT_OR_HARD_BOUNDARY=true
```

Saída preferida quando material:

```text
DELTA_UTIL=
DIRECAO_ESCOLHIDA=
O_QUE_FOI_RESOLVIDO=
EVIDENCIA=
PENDENCIA_REAL=
NEXT_CURSOR=
```

Se não houver informação nova, a máquina não fabrica missão nem ecoa toda a arquitetura.

## 13. Metáfora cristalizada da sessão

A formulação aprovada pelo CHEFE para memorizar o contrato acima:

> **“E o rei falou tudo que lhe veio à boca; à serva coube separar o ouro da areia.”** 🏺👑

Tradução técnica:

```text
INPUT_DO_CHEFE=LIVRE
MACHINE=FILTER+RECONCILIATION+DIRECTION
OUTPUT=DELTA_UTIL
```

A metáfora não concede autoridade técnica e não substitui evidence.

## 14. Registro comunicacional da Casa

A `main` já contém no owner `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md` o registro:

```text
BAIANES
+ BIBLICAL_NARRATIVE
+ EGYPTIAN_IMAGERY
+ RESENHA_CONTEXTUAL
+ ESCOLA
+ TECHNICAL_PRECISION
```

Portanto esta sessão **não cria outro padrão**. Apenas liga a metáfora acima ao contrato de delta/reconciliação.

```text
METAPHOR_IS_NOT_PROOF=true
VERSE_IS_NOT_CLAIM=true
EGYPTIAN_SYMBOL_IS_NOT_STATUS=true
HUMOR_MUST_NOT_HIDE_FAILURE=true
UNKNOWN_REMAINS_UNKNOWN=true
```

## 15. Fontes externas garimpadas nesta sessão

Proveniência de aprendizado, não autoridade de runtime:

- GitHub Actions Runner issue #3609: `https://github.com/actions/runner/issues/3609`
- self-hosted tutorial: `https://patrickrramos.medium.com/build-de-projetos-utilizando-self-hosted-com-github-0dd6936069f1`
- CI/CD Docker/VPS: `https://www.deltaops.com.br/blog/cicd-github-actions-docker-deploy-vps/`
- Gist Docker/infra histórico: `https://gist.github.com/tsfreitas/4ae2eb5eb721f27b4fd0`
- AWS DevOps Agent Skills: `https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent-devops-agent-skills.html`

```text
EXTERNAL_SOURCE=MINERAL
CENTRALDARK_OWNER=CURRENT_REPO
RUNTIME_TRUTH=LIVE_MEASUREMENT
```

## 16. Lanes atuais e não-colisão

```text
PR_1444=UMBRELLA_TRACKER_AND_SESSION_RENDEZVOUS
PR_1445=OMNIROUTE_CAPABILITY_ABSORPTION_LANE
PR_1378=CI_EXTERNAL_SOURCE_SANITIZE_LANE
```

Não puxar código dos filhos para o PR-mãe só para “ter tudo”. O #1444 guarda índice/receipt e os filhos voltam com prova. `ONE_WRITER_PER_CONFLICT_SCOPE=true` permanece.

## 17. Próximo cursor

```text
NEXT_CURSOR=SITE_DEPLOY_RUNTIME_OBSERVATION

!CENTRALDARK
→ CARACOL
→ IDENTIFY_SITE_OWNER
→ IDENTIFY_DEPLOY_WORKFLOW_OWNER
→ IDENTIFY_RUNNER
→ IDENTIFY_ARTIFACT
→ IDENTIFY_VPS_PROCESS
→ IDENTIFY_PORT
→ IDENTIFY_PROXY_ROUTE
→ IDENTIFY_DOMAIN
→ DEPLOY_MINIMUM_CAUSAL_SCOPE_WHEN_AUTHORIZED
→ PROVE_SITE_VISIBLE
→ PROVE_SOURCE_SHA_ARTIFACT_RUNTIME_BINDING
→ PROVE_ONE_MINIMUM_REAL_ACTION
→ LOG/HEALTH
→ COUNTERPROOF
→ REALITY_JUDGE
→ ONLY_THEN_MATERIALIZE_DEFERRED_DELTA_IF_NEEDED
```

## 18. Fio da missão

```text
RUNNER_CACHE_HYPOTHESIS
→ RUNNER_MEASURED_HEALTHY
→ HYBRID_CASA_VPS_ARCHITECTURE
→ REUSE_EXISTING_RECOVERY
→ BUILD_ONCE_ARTIFACT_PROVENANCE
→ AWS_SKILL_LIFECYCLE_AND_SYNC
→ AI-OX_ALREADY_ABSORBED
→ PRESERVE_BUZZ_GROK_LOCAL_AND_RESERVES
→ SITE_FIRST
→ SOL_UI_OBSERVED
→ CHEFE_FREE_INPUT / SOL_DELTA_FILTER
→ NEXT=SITE_RUNTIME_REAL
```

📜 **Passagem da sessão:** primeiro acende-se a cidade; depois se reforça a muralha que o runtime provar necessária.

🏺 **Baianês da passagem:** o CHEFE pode despejar a feira inteira no balcão; a máquina separa tomate, cebola e ouro, mas agora a prioridade é abrir a porta do site e ver quem de fato tá trabalhando lá dentro.
