---
title: "CHECK-LIST DIARIO CENTRALDARK — HUD + PENDENCIAS + CRISTAL"
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
owner: "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md"
pr_mother: 1562
semantic_role: "session_crystal_continuity_learning_map"
priority: "OBRIGATORIO"
checked_day_utc: "2026-10-02"
updated: "2026-10-02T07:03:33-03:00"
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




## 2026-10-02 — RECONCILIAÇÃO DIÁRIA (medição real)

**Escopo:** GitHub/main, PRs abertos, VPS via SSH, runtime/health, Hermes cron e pendências/mirrors. `UNKNOWN != PASS`.

### ✅ Medido / provado
- [x] GitHub `main` medido em `63d25cb1ee5d956c26a184be6afab7e43e6a7787` (`docs(runtime): bind CentralDark OS runtime inventory`).
- [x] SSH `segredo-vpss` respondeu; VPS identificada como `CENTRALDARK-OS`; runtime `/root/CentralDark` está em `main`, HEAD `3c47d79179697d09cfad03648550a0ec392b4651`, working tree `DIRTY_COUNT=0`.
- [x] Hermes CLI `v0.21.5+5564.g6c51075`; gateway ativo (PID `17048`, heartbeat há `17s`, 5 jobs ativos). Job `f052f0dc37ed` existe e foi despachado no horário; execução atual `57b6b57e81584f039b41860c9bd65b22` está `running`.
- [x] PRs abertos medidos: #1742 (draft, HEAD `d2243a0ada5635c55cb949b7eaa420c491860cf2`, novo delta acima do último registro) e PR-mãe #1562 (open, HEAD `0e5ca854b64ee149d7fab144ab421fb005371566`).

### 🔴 Bloqueado / ⚪ UNKNOWN
- [ ] **VPS canonical-main = UNKNOWN:** `/var/lib/centraldark/canonical-main` não existe/ não respondeu `rev-parse`; não afirmar sincronização de deploy.
- [ ] **PM2/runtime = UNKNOWN:** `pm2` não está disponível no PATH remoto; não foi possível provar processos.
- [ ] **Health local = UNKNOWN:** `127.0.0.1:9400/health` recusou conexão (HTTP 000).
- [ ] **Health público = UNKNOWN:** DNS de `admin.centralldark.com` resolveu para Cloudflare, mas o curl público terminou sem resposta HTTP; não converter em PASS/FAIL causal sem probe discriminante.
- [ ] **Pendências Git (`docs/PENDENCIAS.md`) = UNKNOWN:** workspace local configurado em `E:\CentralDark\CentralDark` não é um worktree Git acessível neste corpo e o conector MCP específico (`pendencias_list`) não está disponível; não inferir ausência de itens.
- [ ] **Execução concluída do cron = UNKNOWN:** o job está `running`; a última tentativa terminou em erro `HTTP 429: The usage limit has been reached` (9 falhas consecutivas). `Dispatch on time` não prova resultado.

### ➡️ Próximo cursor
Remedir VPS com o owner correto de `canonical-main`/PM2 e repetir probes local+público; reabrir o receipt do job `57b6b57e81584f039b41860c9bd65b22` somente após estado terminal e resultado legível.

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
---
title: "CHECK-LIST DIARIO CENTRALDARK — HUD + PENDENCIAS + CRISTAL"
status: "CANÔNICO"
authority: "SEGREDO/CHEFE"
owner: "docs/BRAIN/00-MAPA-SISTEMA/CHECK-LIST-DIARIO.md"
pr_mother: 1562
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
PR_MOTHER=#1562
PR_MOTHER_ROLE=GLOBAL_RENDEZVOUS_LEDGER
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
- [ ] Binding físico `E:\VMs\CENTRALDARK-OS\SHARED ↔ guest HGFS`: NOT_PROVEN nesta medição; Windows `SEGREDO` offline e HGFS não visível/montado no guest.
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
- [ ] `E:\VMs\CENTRALDARK-OS\SHARED ↔ HGFS` permanece NOT_PROVEN; remedir quando a rota Windows/host estiver viva.
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
