---
title: "CHECK-LIST DIARIO CENTRALDARK — HUD + PENDENCIAS + CRISTAL"
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
owner: "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md"
pr_mother: 1757
semantic_role: "session_crystal_continuity_learning_map"
priority: "OBRIGATORIO"
checked_day_utc: "2026-10-02"
updated: "2026-10-02"
source_rule: "CANONICO -> ARTEFATO; artefato nao inventa canonico"
mirror_role: "CASA-VAULT = memoria operacional/espelho; Git+owners continuam autoridade tecnica"
aliases:
  - "CHECKLISTDIARIO"
  - "CHECK LIST"
  - "DIARIO"
  - "REGISTRA"
---

# 📋 CHECK-LIST DIARIO — controle operacional do CHEFE

## 🧪 Diagnóstico universal de EXIT CODE

- [x] `exit code 0` = candidato a sucesso; efeito/receipt ainda obrigatórios.
- [x] `exit code 1` = falha genérica; causa NÃO pode ser inferida só pelo número.
- [x] `exit code 2` = hint de uso/política somente quando o contexto da ferramenta sustenta; causa real continua medida.
- [x] `126/127/128+signal` = convenções de shell tratadas como hints, nunca autoridade universal.
- [x] Qualquer outro não-zero entra em diagnóstico causal por stdout/stderr/runtime/source.
- [x] Causa conhecida reutiliza owner/resolvedor existente; causa desconhecida permanece UNKNOWN.
- [x] Depois do reparo, repetir a mesma probe discriminante antes de verde.

## 🫀 CURRENT VIVO — 2026-10-02 — FUNIL BAYESIANO

```text
MAIN_BASE_MEASURED_FOR_FUNNEL=b5a50c084e389f4c0d1ff26541af8bb7023473f5
PORTABLE_OPERATION_CONTRACT=CANONICAL_REQUIRED
BAYESIAN_REANCHOR_MEASUREMENT=CANONICAL_REQUIRED
PR_MOTHER=#1757
PR_MOTHER_ROLE=GLOBAL_RENDEZVOUS_LEDGER
PR_MOTHER_LEGACY=#1562
PR_MOTHER_COMMENTS_ARE_NOT_LEDGER=true
PR_MOTHER_RECEIPTS_OWNER=repository
CHECKLIST_ROLE=OPERATIONAL_HUD_NOT_SOURCE_OF_TRUTH
```

### ✅ Passagem do mini contrato pelo funil oficial

Definições:

\[
M = \text{mini contrato/candidato}
\]

\[
O = \text{contrato oficial canônico}
\]

Caso o candidato já esteja semanticamente contido no oficial:

\[
M \subseteq O
\]

\[
\Delta = M \setminus O = \varnothing
\]

\[
IG_{create}=0
\]

Resultado operacional:

```text
DROP_DUPLICATE
→ REUSE_OFFICIAL_OWNER
→ NO_SECOND_CONTRACT
→ NO_SECOND_OWNER
→ SAME_FINGERPRINT? REUSE_CRYSTAL
```

Se houver delta compatível real:

\[
\Delta = M \setminus O \neq \varnothing
\]

```text
ABSORB_ONLY_DELTA
→ EVOLVE_SAME_OFFICIAL_OWNER
→ UPDATE_FINGERPRINT
→ REVALIDATE_AFFECTED_CONE_ONLY
```

Se houver cláusula contraditória:

\[
C = \{x \in M : x \text{ contradiz } O\},\qquad C \neq \varnothing
\]

```text
META_LUPA
→ META_MULTIBUSSOLA
→ TESTE_DISCRIMINANTE
→ CONTRAPROVA
→ CANDIDATO_SOBREVIVE? EVOLVE_O : REJECT_CONFLICTING_CONE
```

Isto reutiliza regras já canônicas do funil: `ABSORB_BEFORE_DUPLICATE`, `NO_NEW_INFORMATION_NO_CHANGE`, `EVOLVE_SAME_OBJECT`, `same_finding_without_new_evidence=DROP_DUPLICATE` e `REUSE_OR_EXTEND_EXISTING`.

### ✅ Meta-Lupa — CURRENT

- [x] Identity/hash guard: PASS.
- [x] `SKILL.md` blob esperado = observado: `05b8664f6753fd4117e6cfc34e81edb1e7f5367b`.
- [x] Formato canônico lock: PASS.
- [x] Teste direto sem pytest: `53/53 PASS`.
- [x] Meta-Lupa 3 temperaturas: PASS.
- [x] CLI Bayes: prior=0.3, LR=[5,2] → posterior=0.8108; entropia 0.8813→0.6998.
- [ ] `pytest` global da Casa: BLOQUEADO NO INSTRUMENTO por `ModuleNotFoundError: pygments.lexers._mapping`; não classificar como falha da Meta-Lupa.

### ✅ Meta-Multibússola — CURRENT

- [x] Owner: `docs/CONSCIENCIA/MULTIBUSSOLA.md`.
- [x] Perfil `META_MULTIBUSSOLA` existe sem segundo comando/motor.
- [x] Master cycle: 4 aliases, 4 routes, 6 proof gates.
- [x] Evaluator: estado completo → `FIXED_POINT_PASS`.
- [x] Evaluator com `unknown_material=1` → `LOCAL_FIXED_POINT_NOT_YET`.
- [x] Teste isolado `test_meta_bussola_is_existing_meta_multibussola_not_new_command`: PASS.
- [x] Registry item de `!MULTIBUSSOLA`: PASS.
- [ ] Suite ampla de convergência contém 2 falhas fora do cone da Meta-Multibússola: webhook esperado retired mas CURRENT está active; `normative_hierarchy:` esperado pelo teste mas ausente no CONTRACT.
- [ ] Registry administrativo global tem drift independente: marcador `!EXECUTOR_CENTRALDARK` sem item correspondente em `ADMINISTRAVEIS.json`.

### 🔒 Selado nesta passagem

```text
MINI_CONTRACT_IS_NOT_SECOND_OWNER=true
SUBSET_OF_OFFICIAL_CONTRACT=DROP_DUPLICATE_REUSE
COMPATIBLE_NEW_DELTA=ABSORB_INTO_OFFICIAL_OWNER
CONFLICT=DISCRIMINATE_BEFORE_EVOLVE
META_LUPA_CORE_BROKEN=false
PYTEST_ENVIRONMENT_BROKEN_ON_CASA=true
META_MULTIBUSSOLA_CORE_BROKEN=false
BROADER_UNRELATED_DRIFT_PRESERVED=true
```

### ➡️ NEXT_CURSOR

O contrato portátil Bayesiano já está absorvido no owner oficial; não criar segundo contrato. Próximo cone material separado: reconciliar somente os drifts globais de teste/registry se eles entrarem na missão vigente.

### 📓 Caderneta — método comparativo de vermelhos #141

- [x] Owner de resposta evoluído: `docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md`.
- [x] BOOT portátil herdou `RED_SECTOR_DETECTOR_OWNER_MATRIX`.
- [x] Aprendizado `#141` + NeuroLink `L140→L141`.
- [x] Fiscal ganhou checks `CHEFE_FAILURE_COMPARATIVE_MATRIX_*`.
- [x] Receipt: `docs/receipts/2026-10-02-failure-comparative-matrix-response.md`.
- [x] Contraprova do cone: `PYCOMPILE=PASS`; `TARGET_ASSERTS=PASS`; cleanup do worktree = PASS.

```text
RED_NAME | SECTOR | DETECTOR | DIRECTORY_OR_OWNER
DETECTOR_FAIL != TARGET_FAIL
LOCAL_RED != GLOBAL_RED
ONE_TEST_FAIL != CORE_BROKEN
CORE_PASS + ADJACENT_RED = SHOW_SEPARATELY
COMPARISON_FIRST
EXPLANATION_SECOND
```

**Regra de uso:** quando o CHEFE perguntar quais vermelhos existem, onde estão ou qual setor está afetado, responder primeiro com a matriz curta. Expandir causa/efeito/reparo apenas se material ou solicitado.

### 📓 Caderneta — fallback de canal #144

- [x] Mesmo owner evoluído: `SOUL-SOL.md#15`.
- [x] Aprendizado compacto: `#144`.
- [x] Expansão recuperável: `LEMBRANCAS/2026-10-02-CHANNEL-LIMIT-COMPACT-RECORD-EXPANDED-REMEMBRANCE.md`.
- [x] NeuroLink: `L143→L144`.
- [x] BOOT portátil herdou o fallback.
- [x] Fiscal: `CHANNEL_LIMIT_RECOVERABLE_COMPRESSION_*`.
- [x] Contraprova: `CHANNEL_144_ASSERTS=PASS`; `PYCOMPILE=PASS`; cleanup=PASS.

```text
CHANNEL_LIMIT
→ COMPACT_CANONICAL_RECORD
→ EXPANDED_REMEMBRANCE
→ BACKLINK
→ SAME_OWNER
→ CONTINUE

CHANNEL_LIMIT != MISSION_BLOCKED
COMPRESSION != INFORMATION_LOSS
NO_V1_V2_V3
```

### 📓 Caderneta — CHAT_GLOBAL / capability / inferência #145

- [x] `CHAT_GLOBAL` virou classe portátil; ChatGPT/Claude/Gemini/Grok ficam como superfícies/proveniência.
- [x] Capability agora deriva do toolset medido, não da marca.
- [x] `GITHUB_ACCESS != SHELL_ACCESS`.
- [x] CHAT_GLOBAL com shell/bridge autorizado pode executar no escopo provado.
- [x] Evidência medida vence inferência não medida somente no mesmo claim + escopo + tempo.
- [x] Proveniência histórica por marca foi preservada; owners normativos foram evoluídos.
- [x] SOUL/MetaCog/BOOT/Hermes/Telegram/Voice/Golden Capsule/surface parity reconciliados.
- [x] Teste executável `runtime-proof-same-target.test.mjs`: PASS em `4354dd7adba43f3455f72302ac23c42d8af7351f`.
- [x] Receipt: `docs/receipts/2026-10-02-chat-global-surface-capability-evidence.md`.

```text
BRAND != SURFACE_CLASS
SURFACE != CAPABILITY
GITHUB_ACCESS != SHELL_ACCESS
TOOLSET -> CAPABILITY
SAME_CLAIM+SCOPE+TIME: MEASURED_EVIDENCE > UNMEASURED_INFERENCE
```

### 📓 Caderneta — sistema híbrido multirota #146

- [x] Aprendizado #146 registrado e encadeado em `L145→L146`.
- [x] Lembrança expandida registrada.
- [x] Receita executável registrada em `PROVEN-CLAIMS.lock.json`.
- [x] Lock determinístico registrado em `PROVEN-DETERMINISTIC-LOCK.yml`.
- [x] Trigger `CAPABILITY_GAP` ligado à receita `HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`.
- [x] Trigger `TERRITORY_ROUTE_CHANGE` ligado à mesma receita.
- [x] Sentinel classifica `ROUTE_FAILURE` e roteia para `CAPABILITY_GAP → HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH`.
- [x] Verifier fiscaliza trigger + sentinel + machine recipe.
- [x] Consumer real provado no `CENTRALDARK-OS/root:/root/CentralDark`.
- [x] Ferida discriminante: `origin/main` tinha o checklist, mas o sparse-checkout do consumer não materializava `docs/BRAIN/00-MAPA-SISTEMA`; `CHECK_PRESENT_IN_GIT != CHECK_PRESENT_IN_RUNTIME`.
- [x] Delta mínimo aplicado: `docs/BRAIN/00-MAPA-SISTEMA` adicionado ao sparse-checkout existente.
- [x] Pós-remediação: `HYBRID_MULTIROUTE_HOOK_CONTRACT=PASS`, `SENTINEL_HOOK=PASS`, `MACHINE_RECIPE=PASS`, `CHECKLIST_CONTRACT=PASS`, `RECIPE_COMPLETENESS=PASS`.
- [x] Consumer self-test preserva marcador factual: `multiroute_recipe_hook=true`.
- [x] Verifier global permanece vermelho fora do cone (`GLOBAL_FAILED=30` na medição); `CONE_PASS != GLOBAL_PASS`.
- [x] Binding físico `E:\VMs\CENTRALDARK-OS\SHARED ↔ guest HGFS`: PASS_CURRENT_MEASUREMENT; host path + VMX RW + mount `vmhgfs-fuse` + SHA cruzado de `!CENTRALDARK.txt` fecharam (`d4e99f0fef87b499a97f567b767fe7b71dc5dce8f1303a6779135b35571fa130`). Persistência pós-reboot continua UNKNOWN.
- [x] PR-MÃE #1562 continua ledger/rendezvous; não é writer.
- [ ] PR #1743 está aberta e não-mergeável; tratar como projeção/checklist histórica até reconciliação.
- [ ] PR #1742 está aberta e não-mergeável; runtime panel continua separado desta prova de hook e deve remedir seu próprio cone.

```text
LEARNING_REGISTERED != RECIPE_REGISTERED
RECIPE_REGISTERED != HOOK_BOUND
HOOK_BOUND != CONSUMER_PROVEN
CONSUMER_PROVEN != CHECKLIST_REGISTERED
CHECKLIST_REGISTERED != PR_MOTHER_RECEIPT

FIXED_POINT_REQUIRES_ALL_APPLICABLE_LAYERS
```

### 📓 Caderneta — Lei da Peneira Completa #147

- [x] Aprendizado #147 registrado.
- [x] Lembrança expandida registrada.
- [x] NeuroLink `L146→L147` registrado.
- [x] Receita #146 evoluída com materialização, hook real, binding físico condicional e novo fingerprint.
- [x] Hook real Hermes `pre_verify` fiscaliza fontes mínimas da peneira materializadas no consumer.
- [x] `docs/receipts` entrou no sparse-checkout do consumer; o receipt é camada aplicável da peneira.
- [x] Lei discriminante: `SPARSE_PATH_ENABLED != FILE_PRESENT_AT_CURRENT_HEAD`; prova usa o mesmo HEAD do claim.
- [x] Trigger `PRE_HUMAN_RETURN` recebeu `COMPLETE_SIEVE_APPLICABILITY_CHECK` + `COMPLETE_SIEVE_READBACK`.
- [x] BOOT carrega `complete_sieve_registration`.
- [x] Consumer `CENTRALDARK-OS/root` materializa `docs/BRAIN/00-MAPA-SISTEMA` no sparse-checkout.
- [x] Cone multirota #146 passou os cinco checks aplicáveis após a correção do sparse.
- [ ] Verifier global completo ainda tem vermelhos fora do cone; não chamar repo globalmente verde.
- [x] `E:\VMs\CENTRALDARK-OS\SHARED ↔ HGFS` = PASS_CURRENT_MEASUREMENT; `SEGREDO` host path + VMX + guest `/home/CENTRAKDARK-OS/vmware-shares/CENTRALDARK-SHARED` + SHA host↔guest idêntico. Boot persistence continua UNKNOWN e é claim separado.
- [ ] PR #1742 continua aberta/não-mergeável na última medição; cone runtime-panel próprio.
- [ ] PR #1743 continua aberta/não-mergeável na última medição; projeção checklist própria.
- [x] PR-MÃE #1562 continua somente ledger/rendezvous.

```text
APRENDIZADO -> LEMBRANCA -> RECEITA -> HOOK -> TRIGGER -> BOOT -> VERIFIER
-> CONSUMER_REAL -> CHECKLIST_DIARIO -> PR_MAE_1562
-> RELATED_PR_IF_SCOPE_INTERSECTS -> PHYSICAL_BINDING_IF_MATERIAL -> READBACK

FIXED_POINT_REQUIRES_ALL_APPLICABLE_LAYERS=true
CHECK_PRESENT_IN_GIT != CHECK_PRESENT_IN_RUNTIME
CONE_PASS != GLOBAL_PASS
```
## 🫀 CURRENT VIVO — 2026-09-30

```text
CHECKED_DAY_UTC=2026-09-30
PR_MOTHER=#1562
PR_MOTHER_ROLE=HISTORY_HANDOFF_LEDGER_NOT_WRITER
OPEN_PROMOTION_CHILD=NONE_OBSERVED
MAIN_BASE_BEFORE_THIS_CHECKLIST_UPDATE=2b48b95165114303429021bd8a1166f136b0e62b
VPS_LIVE_HEAD=ab8fe2d80eb66873d0854485555f279c71aa3f70
VPS_LIVE_HEAD_DRIFT=VISIBLE_NOT_RESET
PULSE_OWNER_SCOPED=PASS@bd7943985376025af734757764b825fba9ccc474
MCP_HEALTH_9100=HTTP_200
HERMES_PM2=ONLINE
MCP_PM2=ONLINE
HUBBOT_SRVER1_PM2=ONLINE
HUBBOT_GUARDIAO_PM2=ONLINE
OAUTH_BROKER_PM2=ONLINE
HERMES_PROVIDER=nous
HERMES_MODEL=upstage/solar-pro4:free
ROUTE_HERMES_NOUS_SOLAR=PROVEN_REGISTERED
ROUTE_HERMES_REVERSE_ROUTE=PROVEN_REGISTERED
DIAGRAM_ROUTE_GATE=PASS
REPO_CONTRACT_GLOBAL=NOT_PASS
DEPLOY_RUN_36778115556=QUEUED_AT_LAST_MEASUREMENT
UNKNOWN_IS_NOT_PASS=true
MERGED_IS_NOT_DEPLOYED=true
```

### ✅ Feito / provado nesta rodada
- [x] Microdeploy passou a tratar deleções da `main` com backup/rollback no owner existente.
- [x] Ordem causal corrigida: HERMES-CORE antes do MCP quando o MCP importa dependência do Hermes.
- [x] Import duplicado do MCP corrigido; `:9100/health` remediado e medido em HTTP 200.
- [x] Hermes, MCP, HubBot Srver1, HubBot Guardião e OAuthBroker medidos online no PM2.
- [x] Grafo Mestre absorveu as rotas Hermes→Nous→Solar e reverse-route no `FLOW-REGISTRY.json`.
- [x] `ARCHITECTURE.mmd` permanece projeção derivada; `DIAGRAM_ROUTE_GATE=PASS`.
- [x] Receipt vivo registrado na PR-MÃE #1562.

### 🔴/⚪ Residual material
- [ ] `verify_repo_contract.py` global ainda não está verde; não converter em PASS.
- [ ] Runner-policy residual observado em workflows existentes precisa reconciliação no mesmo owner.
- [ ] Run `36778115556` estava `QUEUED` na última leitura; remedir antes de chamar DEPLOYED.
- [ ] VPS live HEAD continua diferente de `main`; tracked dirty foi preservado de propósito.

### ➡️ NEXT_CURSOR
Remedir fiscal global + run de deploy + runtime; corrigir somente o próximo blocker material no owner existente e voltar ao #1562.


Este arquivo define o **painel diário obrigatório** da CentralDark. Ele não cria novo cérebro, ledger, promotor, workflow ou autoridade. Ele projeta o estado já registrado pelos owners, receipts, PRs, runtime e Segundo Cérebro para o CHEFE enxergar, em uma tela, o que aconteceu hoje e o que ainda falta.

```text
CHECKLIST_IS_DERIVED_VIEW=true
CHECKLIST_IS_NOT_SOURCE_OF_TRUTH=true
CHECKLIST_DOES_NOT_OVERRIDE_LIVE_STATE=true
CHECKLIST_DOES_NOT_PROVE_RUNTIME=true
UNKNOWN != PASS
CURRENT > HISTORICAL
REGISTER_BEFORE_REPORT=true
```

## Quando atualizar

Atualização obrigatória quando houver delta material:

```text
#ACORDAR
→ MEDIR CURRENT
→ EXECUTAR NO OWNER
→ REMEDIR T1
→ !REGISTRA
→ PERSISTIR RECEIPT/COMMIT/LEDGER
→ 🪡 ATUALIZAR CHECK-LIST DIARIO
→ READBACK
→ RELATAR AO CHEFE
```

Também atualizar após merge/promoção, deploy/remediação, bloqueio material, mudança de NEXT_CURSOR ou decisão selada. Sem delta material, não inventar atividade.

## Estados visuais

- ✅ **FEITO / PROVADO** — efeito e evidência aplicável existem.
- 🟡 **EM ANDAMENTO** — execução real em curso; não é PASS.
- 🔴 **BLOQUEADO / FALHOU** — há impedimento ou contraprova.
- ⚪ **UNKNOWN** — falta medição; nunca converter em verde.
- 🔒 **SELADO** — decisão/fixed point já fechado; reabrir só com nova intenção.
- ➡️ **PRÓXIMO** — próximo cursor único e executável.

## Modelo diário mínimo

### 🎯 Norte de hoje
- INTENÇÃO:
- ESCOPO:
- OWNER:
- PR_MOTHER: #1562
- CHILD_PR:
- HEAD:
- MAIN_HEAD:

### ✅ Feito / provado hoje
Para cada item:
- O QUE:
- ONDE:
- EVIDÊNCIA:
- COMMIT_SHA:
- CHECKSUM quando bytes forem materiais:
- STATUS:

### 🟡 Em andamento
- ITEM:
- OWNER:
- ESTADO:
- PRÓXIMO GATE:

### 🔴 Bloqueado / ⚪ UNKNOWN
- ITEM:
- CAUSA PROVADA ou UNKNOWN:
- EVIDÊNCIA:
- O QUE FALTA MEDIR:

### 🔒 Selado hoje
- DECISÃO:
- LAST_GOOD_STATE / HEAD:
- REGRA DE REABERTURA:

### ➡️ Próximo cursor
- UMA próxima ação:
- OWNER:
- PROVA esperada:

## Prova por tópico

```text
[TÓPICO]
CLAIM=
SCOPE=
OWNER=
T0=
ACTION=
T1=
EVIDENCE_REF=
COMMIT_SHA=
FILE_BLOB_SHA=
SHA256=
TEST=
COUNTERPROOF=
CI_SAME_HEAD=
RUNTIME_PROOF=
STATUS=PROVEN|UNKNOWN|NOT_PROVEN|BLOCKED
NEXT_CURSOR=
```

Hash prova identidade de bytes, não funcionamento. Commit SHA prova versão Git, não runtime. Workflow verde prova o workflow aplicável naquele HEAD, não toda a CentralDark.

## Fontes permitidas do painel

```text
PR/ISSUE/COMMIT/CI
+ RECEIPTS
+ docs/PENDENCIAS.md
+ BRAIN_VAULT
+ RUNTIME MEDIDO
+ LAST_GOOD_STATE
→ DEDUPE
→ CHECK-LIST DIARIO
```

Chat isolado não é fonte durável. Screenshot é observação da tela e precisa ser classificado pelo claim que realmente prova.

## Espelho da Casa / Obsidian

O espelho local pode aparecer como:

`CASA-VAULT/00-CANONICO/CHECK-LIST DIARIO.md`

Ele é uma **projeção operacional** deste contrato e do estado registrado. Não vira segundo owner e não sobrepõe Git/owners técnicos.

## Fechamento diário

O CHEFE deve conseguir responder olhando só este painel:

1. O que eu fiz hoje?
2. O que ficou provado?
3. O que ainda está rodando?
4. O que falhou/bloqueou?
5. O que está UNKNOWN?
6. O que foi selado e não deve ser refeito?
7. Qual é a próxima ação única?

## 🫀 CURRENT VIVO — 2026-10-03 — PREFLIGHT GLOBAL CROSS-CONTEXT

```text
MAIN_CURRENT=RESOLVE_AT_READ\nMAIN_PREWRITE_MEASUREMENT=3deb814ebb4feddb9d57fac3a762b56b08fd05b4
PR_MOTHER=#1757 · OPEN · DO_NOT_MERGE · CLEAN_HUD
OPEN_PRS=#1562 🔒 🪬 PR-MÃE #1562 · HUD/FUNIL PERMANENTE CENTRALDARK · NÃO MERGEAR | #1742 local-ai: reconcile CENTRALDARK-OS runtime panel with CURRENT probes | #1743 🧾 CHECK-LIST DIARIO · PR-MÃE #1562
CENTRALDARK_GLOBAL_CROSS_CONTEXT_PREFLIGHT_V1=true
CONTRACT_MATERIALIZED=PASS
GITHUB_READBACK_15_BINDINGS=PASS
SOUL_SYNC_REANCHORED=PASS
FULL_VERIFIER_EXECUTION=UNKNOWN
UNKNOWN_IS_NOT_PASS=true
CURRENT_OVER_HISTORY=true
```

### ✅ Contrato materializado
- [x] Trigger Fabric `CONTRACT.yml` ganhou owner único do preflight global.
- [x] `ENGINE_BINDING.yml` aplica o preflight a motores/superfícies atuais e futuros.
- [x] `CENTRALDARK_AI_BOOT.yaml`, SOUL, MetaCog, `LEIA-ME-IA.md` e `AGENTS.md` herdaram a regra.
- [x] `CLAUDE.md`, `CODEX.md`, `.claude/rules`, `.claude/BOOT-PIVETE.md`, HERMES-CORE e bot obrigatório estão vinculados.
- [x] Todo artefato/pacote/Markdown/arquitetura herda por pertencimento ao repositório, sem copiar a doutrina em milhares de arquivos.
- [x] `scripts/trigger-fabric/verify_repo_contract.py` inventaria dinamicamente tracked/Markdown/packages/.claude/.agents/arquiteturas/Hermes/bots e verifica os bindings.
- [x] `package.json` expõe `verify:centraldark-contract`.
- [x] Aprendizado #150 + Lembrança + índice materializados.

### ⚪ Fronteira
- [ ] `FULL_VERIFIER_EXECUTION`: UNKNOWN. A tentativa de clone limpo no guest VMware ficou presa na rota de rede e foi terminada; não promover para PASS sem execução real.
- [ ] PRs #1742 e #1743 precisam ser reconciliados contra o novo `main` antes de qualquer claim SAME_HEAD.

### ➡️ NEXT_CURSOR
Executar `python3 scripts/trigger-fabric/verify_repo_contract.py` em checkout limpo do CURRENT quando a rota de checkout estiver viva; depois continuar o cone VMware → Hermes original → Qwen/Kylin → runner self-hosted → cápsula/replay VPS.

## 🫀 CURRENT VIVO — 2026-10-03 — LEARNING_152_SHARED_FORGE

```text
LEARNING_152_SHARED_FORGE=true
SHARED_CENTRALDARK=LIVE_FORGE
SYNC_MEANS_RECONCILE_NOT_OVERWRITE
FUNCTIONAL_GOLD_SURVIVES_PENEIRA=true
NO_DESTRUCTIVE_PULL_RESET_ON_FORGE=true
CI_WORKSPACE_ISOLATED_FROM_SHARED_FORGE=true
CRYSTALLIZE_IN_VMWARE_THEN_REPLAY_VPS=true
UNKNOWN_IS_NOT_PASS=true
```

### ✅ PROVADO
- [x] `/home/CENTRAKDARK-OS/SHARED/CentralDark` existe como Git válido ligado a `ServerVpss/CentralDark`.
- [x] branch medida: `feature/ai-cli-runtime-kernel`.
- [x] HEAD medido: `892454b98d941c3fada35d3df826f9962257f80f`.
- [x] snapshot da bancada: `TRACKED_FILES=6020`, `DIRTY_COUNT=5535`, `UNTRACKED_COUNT=13`.
- [x] a branch existe no GitHub; o HEAD existe no remoto.
- [x] a árvore local e o GitHub CURRENT divergem; há história do main não absorvida e trabalho próprio da bancada.
- [x] Aprendizado #152 + Lembrança + NeuroLink + índice materializados.

### ⚠️ NÃO FAZER
- [ ] não executar `git reset --hard`, pull cego ou checkout destrutivo enquanto o delta local não estiver classificado;
- [ ] não usar `SHARED/CentralDark` como workspace de CI;
- [ ] não criar segunda árvore CentralDark para resolver o sync.

### ➡️ NEXT_CURSOR
Inventariar diferencialmente a bancada contra o `main` CURRENT e classificar cada delta em `LOCAL_GOLD / ALREADY_IN_MAIN / STALE / CONFLICT / UNKNOWN`; reconciliar primeiro o menor cone material e retestar.

## 🫀 CURRENT VIVO — 2026-10-03 — LEARNING_153_INVARIANT_BINDINGS

```text
LEARNING_153_INVARIANT_BINDINGS=true
RAW_COUNT_IS_NOT_ARCHITECTURE=true
COMPRESS_BY_INVARIANT_BEFORE_CREATING=true
QUEUED_IS_NOT_RUNNING=true
VMWARE_SHARED_SSH_BINDING=PASS
VMWARE_SHARED_SECRETS_BINDING=PASS
VPS_TCP22_REACHABLE=PASS
CASA_REQUIRED_AS_SSH_HOP=NO
KNOWN_HOSTS_STALE=PROVEN
SSH_AUTH_VMWARE_TO_VPS=NOT_PROVEN
SECRETS_STAY_OUT_OF_GIT=true
UNKNOWN_IS_NOT_PASS=true
```

### ✅ PROVADO
- [x] VMware enxerga `SHARED/ssh` e `SHARED/secrets`.
- [x] bindings SSH materiais comparados entre SHARED e ~/.ssh são equivalentes por SHA-256.
- [x] alias VPS existe dentro da VMware e TCP/22 VM→VPS passa.
- [x] jobs self-hosted/Linux amarelos medidos permanecem queued sem runner_name; não chamar de execução.
- [x] Desktop Commander da VPS offline não significou VPS down; TCP/22 foi alcançado por outra rota.
- [x] Aprendizado #153 + Lembrança + NeuroLink + índice materializados.

### 🔴 / ⚪ FRONTEIRA
- [ ] known_hosts da VM está stale frente à identidade atual observada da VPS.
- [ ] não aceitar/promover host key nova sem âncora independente/autorizada.
- [ ] SSH autenticado VMware→VPS ainda não está provado.
- [ ] runner self-hosted físico que executará os jobs atuais ainda não está provado por runner_name.

### ➡️ NEXT_CURSOR
Validar identidade SSH atual da VPS por âncora independente/autorizada; atualizar somente known_hosts afetado; provar VMware→VPS autenticado; então matricular/provar runner VMware e só depois comprimir/rebindar workflows por família.

## 🫀 CURRENT VIVO — 2026-10-03 — LEARNING_154_VMWARE_VPS_DIRECT_SSH

```text
LEARNING_154_VMWARE_VPS_DIRECT_SSH=true
VMWARE_TO_VPS_TCP=PASS
VMWARE_TO_VPS_SSH_AUTH=PASS
REMOTE_USER=root
CASA_REQUIRED_AS_SSH_HOP=NO
BINDING_ROOT_CAUSE=WINDOWS_IDENTITYFILE_PATH_INSIDE_LINUX
BINDING_FIX=LOCAL_VM_IDENTITYFILE_PATH_ONLY
CONFIG_BACKUP=PASS
LOCAL_REMOTE_MACHINE_ID_DIFFER=PASS
PERSISTENT_HOSTKEY_TRUST=UNKNOWN
TEMP_HOSTKEY_BYPASS=PROOF_ONLY
SECRETS_STAY_OUT_OF_GIT=true
```

### ✅ PROVADO
- [x] `ssh -G segredo-vpss` revelou path Windows dentro do guest Linux antes do delta.
- [x] backup local do config criado antes da mutação.
- [x] somente `IdentityFile` foi adaptado para `~/.ssh/segredo_vps_ed25519`.
- [x] readback `ssh -G` confirma binding Linux correto.
- [x] SSH VMware→VPS autenticou sem Casa; usuário remoto `root`.
- [x] VM e VPS têm hashes de `/etc/machine-id` distintos, evitando falso-verde apesar do mesmo hostname.
- [x] receita executável registrada em `PROVEN-CLAIMS.lock.json#VMWARE_VPS_DIRECT_SSH_BINDING_PATH`.
- [x] Aprendizado #154 + Lembrança expandida com Mermaid + parâmetros + fingerprint materializados.

### ⚪ FRONTEIRA
- [ ] trust persistente da host key atual da VPS continua UNKNOWN até âncora independente/autorizada.
- [ ] probe temporário de bypass de host-key foi usado só para isolar autenticação; não vira política padrão.
- [ ] runner GitHub self-hosted VMware ainda precisa matrícula + `runner_name` real em job.

### ➡️ NEXT_CURSOR
Validar host key VPS por âncora independente/autorizada → atualizar somente `known_hosts` → replay SSH com trust normal → matricular/provar runner VMware → comprimir/rebindar workflows por famílias medidas.

## 🫀 CURRENT VIVO — 2026-10-03 — LEARNING_155_VMWARE_FORGE_OBSIDIAN_SYNC

```text
LEARNING_155_VMWARE_FORGE_OBSIDIAN_SYNC=true
RECIPE=VMWARE_FORGE_OBSIDIAN_PRESERVE_GOLD_SYNC
DEPENDENCY_FINGERPRINT=557819f7b6230625330f8870cd41d69c1a16f21e3e40d644f00cd7aea4b9ff24
OBSIDIAN_VAULT_ROOT=SHARED/CentralDark
SYNC_MEANS_RECONCILE_NOT_OVERWRITE=true
LOCAL_GOLD_PRESERVED=true
UNKNOWN_NOT_OVERWRITTEN=true
DOT_OBSIDIAN_LOCAL_STATE_NOT_COMMITTED=true
CI_WORKSPACE_ISOLATED_FROM_SHARED_FORGE=true
HUD_HTML_RUNTIME_BUILD_REQUIRED=false
PLUGIN_BUILD_REQUIRED_ONLY_ON_SOURCE_CHANGE=true
RUNTIME_SYNC_EXECUTION=PENDING
```

### ✅ PROVADO / MATERIALIZADO
- [x] share dedicado `CENTRALDARK-SHARED` passou write/readback no backing da bancada.
- [x] `Home.md`, `HUD.html`, `Pendências.md` foram materializados na forja.
- [x] `.obsidian/` foi criada localmente e permanece ignorada pelo Git.
- [x] build existente de `centraldark-grafo-vivo` foi reaproveitado; nenhum plugin paralelo foi criado.
- [x] HUD/Home/Pendências ligam a Lembrança #152 e o BRAIN.
- [x] recipe/claim #155 foi selada nos owners existentes.

### ⚪ FRONTEIRAS
- [ ] sync preservativo contra a `main` CURRENT ainda não foi executado: `PENDING`.
- [ ] bytes/configs da antiga `.obsidian` do vault Windows separado: `UNKNOWN`.
- [ ] plugin presente/buildado não prova plugin carregado no runtime Obsidian.
- [ ] runner self-hosted VMware ainda exige prova com `runner_name` real.

### ➡️ NEXT_CURSOR
Executar `VMWARE_FORGE_OBSIDIAN_PRESERVE_GOLD_SYNC`: inventário diferencial → preservar `LOCAL_GOLD/UNKNOWN` → reconciliar delta seguro → receipt. Depois provar runner self-hosted VMware e reutilizar #154 para replay VPS.

## 🧬 CURRENT VIVO — 2026-10-03 — LEARNING_156_PORTABLE_CRYSTAL_COMPILER

```text
LEARNING_156_PORTABLE_CRYSTAL_COMPILER=true
OWNER=.agents/skills/knowledge-compiler/
BACKEND=.agents/skills/knowledge-compiler/scripts/crystal-runtime-compiler.py
CRYSTAL=.agents/skills/knowledge-compiler/crystals/vmware-forge-obsidian-preserve-gold-sync.json
TEST=.agents/skills/knowledge-compiler/tests/crystal-runtime-compiler.test.py

PARENT_PACKAGE_SHA256=4da29cd8345591f25695909c2159dc54de393120c6f78673e2b0cd98689efde6
LOCAL_SUCCESSOR_PACKAGE_SHA256=9e99657b37dbc99a474067957956ccb52067c142c3108558be79aa9e2bbee2f0
CANONICAL_COMPILED_CRYSTAL_FINGERPRINT=d1fd0fc3f30b4e35ea864a24ec522cdaa227a1c19a9b4119cd20d1779538746e

CRYSTAL_RUNTIME_COMPILER_TEST=PASS
VMWARE_PLAN_COMPILE=PASS
FORGE_MUTABLE_RECONCILIATION=PENDING
PERSISTENT_HOSTKEY_TRUST=UNKNOWN
VMWARE_RUNNER_ASSIGNMENT=UNKNOWN

RESEARCH_OUTPUT_IS_CANDIDATE_NOT_AUTHORITY=true
DELAY_IS_NOT_PROOF=true
SSH_AUTH_IS_NOT_HOSTKEY_TRUST=true
QUEUED_IS_NOT_RUNNER_ASSIGNMENT=true
CHANGED_BYTES_REQUIRE_NEW_SHA256=true
```

### ✅ PROVADO
- [x] Knowledge Compiler existente foi reutilizado como owner; nenhum segundo cérebro/compilador conceitual foi criado.
- [x] Backend Python e cristal v2 foram materializados no `main`.
- [x] Teste determinístico passou dentro da VMware: `CRYSTAL_RUNTIME_COMPILER_TEST=PASS`.
- [x] Target `vmware` compilou `centraldark.compiled-plan.v2`.
- [x] Retorno da Pesquisa Aprofundada foi peneirado contra CURRENT, não promovido por prestígio/atraso.
- [x] SHA-256 v1 foi preservado como parent; bytes evoluídos receberam identidade nova.

### ⚪ FRONTEIRAS
- [ ] executar `inspect` contra a forge viva e emitir inventário diferencial real.
- [ ] `PERSISTENT_HOSTKEY_TRUST`: exige âncora independente; continua `UNKNOWN`.
- [ ] `VMWARE_RUNNER_ASSIGNMENT`: exige job real com runner_id/name e machine-id; continua `UNKNOWN`.
- [ ] full gate `lupa-conformance` do mesmo HEAD ainda não foi observado nesta cristalização.

### ➡️ NEXT_CURSOR
Executar o cristal #156 em modo inspect na forge viva; reconciliar somente delta seguro. Depois fechar host-key trust e runner assignment como claims independentes.



## 🫀 CURRENT VIVO — 2026-10-06 — LEARNING_168_MCP_UNIFIED_CAPABILITY_CATALOG

```text
LEARNING_168_MCP_UNIFIED_CAPABILITY_CATALOG=true
CATALOG_OWNER=apps/modulos/mcp/src/tools/core/mcp-admin.js
CATALOG_CONSUMER=mcp_admin_catalog
CATALOG_SCOPE=centraldark_unified_capability_catalog
CATALOG_EXPECTED_ROUTES=11
CATALOG_FINGERPRINT=42c132bf864a3a82b16495bc6109a2d09c90e7c0806988fb389103e021011bd5
SCREENPIPE_AND_RDC_SHARE_ONE_MCP_CATALOG=true
HOOK=REUSE_CAPABILITY_GAP_AND_TERRITORY_ROUTE_CHANGE
RECIPE=HYBRID_MULTIROUTE_CAPABILITY_REPLAY_PATH
PR_MOTHER_CURRENT=#1757
PR_MOTHER_LEGACY=#1562
LIVE_MCP_CATALOG_RELOAD=UNKNOWN_UNTIL_READBACK
```

### ✅ MATERIALIZADO
- [x] `RDC_DESKTOP_COMMANDER` no catálogo unificado.
- [x] `SCREENPIPE_LOCAL_SENSOR` no mesmo catálogo.
- [x] filtro de `mcp_admin_catalog` cobre tools e routes.
- [x] fingerprint explícito e routeCount/routeReturned no payload.
- [x] receita multirota existente evoluída; nenhum segundo owner/router/MCP.
- [x] aprendizado + lembrança + receipt materializados.
- [x] verifier amarrado aos marcadores do catálogo.
- [x] hook/trigger reais existentes reutilizados.

### ⚪ FRONTEIRA
- [ ] runtime MCP vivo precisa devolver fingerprint + 11 rotas antes de `LIVE_MCP_CATALOG_RELOAD=PASS`.
- [ ] status atual de Screenpipe e RDC continua por binding; entrada no catálogo não os torna online.

### ➡️ NEXT_CURSOR
`LIVE_MCP_CATALOG_READBACK → VERIFY_FINGERPRINT_AND_11_ROUTES → FILTER_SCREENPIPE → FILTER_DESKTOP → ROUTE_FAILOVER_REPLAY → FIXED_POINT`
