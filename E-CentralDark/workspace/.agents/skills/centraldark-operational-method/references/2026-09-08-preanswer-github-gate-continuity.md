# CENTRALDARK_PREANSWER_GATE_RAW_CONTRACT

owner: `.agents/skills/centraldark-operational-method/SKILL.md`  
refs: `#1444`, `#1189`, `#1454`, `#1463`  
status: `CANDIDATE_FUNCTIONAL_MODE`  
mode: `RAW_DEV_CONTRACT`  
reason: `tampa ferida: resposta operacional sem GitHub/PR/issues medidos`

```text
#ACORDAR != TEXTO_BONITO
#ACORDAR == MEDIR -> ALINHAR -> RECONCILIAR -> RESPONDER
```

## 0_BOOT_BIBLICO_TECNICO

```text
# Pv 18:13 aplicado:
# responder antes de ouvir/medir = falha operacional.

# 1Ts 5:21 aplicado:
# examinar tudo -> segurar só o que passa na prova.

# Mt 7:16 aplicado:
# árvore se conhece pelo fruto -> sistema se conhece por log/teste/runtime.

# Tg 1:22 aplicado:
# ouvir/documentar não basta -> tem que executar/provar.

# baianês técnico:
# antes de cantar vitória, mede o terreiro.
```

## 1_FACTS_REQUIRED

```yaml
FACTS_REQUIRED_BEFORE_OPERATIONAL_ANSWER:
  repo_confirmed: required
  main_head_measured: required
  relevant_prs_measured: required
  relevant_issues_measured_when_material: required
  workflows_or_checks_measured_when_material: required

FACTS_OPTIONAL_BUT_EXPLICIT:
  remote_desktop_measured: optional_mark_unknown_or_blocked
  runtime_measured: optional_mark_unknown_or_blocked
  deploy_measured: optional_mark_unknown_or_blocked
  site_measured: optional_mark_unknown_or_blocked
  attachment_materialized: optional_mark_evidence_missing
```

## 2_HORN_RULES

```prolog
% p1 && ... && pn -> p
% p1 && ... && pn -> false

centraldark_command :- token_acordar.
centraldark_command :- token_centraldark.
centraldark_command :- asks_repo_state.
centraldark_command :- asks_pr_or_issue.
centraldark_command :- asks_runtime_or_deploy.
centraldark_command :- asks_operational_agenda.

answer_blocked :- centraldark_command, not_github_measured.
answer_blocked :- centraldark_command, relevant_issues_material, not_issues_measured.
answer_blocked :- centraldark_command, workflows_material, not_workflows_measured.

repo_context_ready :- github_measured, repo_confirmed, main_head_measured.
pr_context_ready :- relevant_prs_measured.
issue_context_ready :- issues_measured_or_not_material.
workflow_context_ready :- workflows_measured_or_not_material.

answer_allowed :-
  centraldark_command,
  repo_context_ready,
  pr_context_ready,
  issue_context_ready,
  workflow_context_ready.
```

## 3_EXECUTION_PIPE

```text
INPUT
  ↓
CLASSIFY_TRIGGER
  ↓
IF centraldark_command == true
  ↓
  MEASURE_GITHUB
    repo
    main_head
    prs
    issues
    workflows/checks
    commits/files_when_material
  ↓
  MEASURE_LOCAL_IF_AVAILABLE
    remote_desktop
    runtime
    deploy
    site
  ↓
  MARK_MISSING_AS_UNKNOWN_OR_BLOCKED
  ↓
  HORN_CLOSE_FACTS_UNTIL_FIXED_POINT
  ↓
  IF answer_blocked == true
      RETURN BLOCKED_WITH_CAUSE
  ELSE
      RETURN OPERATIONAL_ANSWER
```

## 4_OUTPUT_SHAPE

```yaml
ANSWER_SHAPE:
  PROVADO:
    - fato
    - evidencia
    - fonte
  QUEBRADO:
    - sintoma
    - causa_quando_provada
    - arquivo_ou_workflow_quando_existir
  EVIDENCIA_FALTANTE:
    - lacuna
    - porque_nao_foi_medida
  RAIZ:
    - primeiro_elo_vermelho_ou_unknown_material
  NEXT_CURSOR:
    - exatamente_um_proximo_passo
```

## 5_ATTACHMENT_CONTINUITY

```text
PRINT_NOVO != PARA_FLUXO
PRINT_NOVO == DELTA_CANDIDATO
ANEXO_NOVO != PARA_FLUXO
ANEXO_NOVO == DELTA_CANDIDATO

LER
  ↓
COMPREENDER
  ↓
COSTURAR_COM_ESTADO_VIVO
  ↓
CLASSIFICAR
  ↓
CONTINUAR
```

## 6_LINK_AND_SHORTCUT_INVARIANTS

```text
LINK != CAPABILITY_PROVEN
LNK_FILE != TARGET_PROVEN
ZIP_FILE != WORKFLOW_PROVEN
SCREENSHOT != RUNTIME_PROVEN
SESSION_JSON_BOOTING != BRIDGE_ONLINE
MERGED != DEPLOYED
DOCUMENTED != EXECUTED
UNKNOWN != PASS
SKIPPED_WITHOUT_REASON != PASS
HISTORICAL_GREEN + NEW_HEAD -> REMEASURE
```

## 7_CURRENT_SESSION_TRACE

```yaml
trace:
  repo: ServerVpss/CentralDark
  main_head_measured: ad4ed0ac76cb2361b005684c9c1323876a5174a5
  pr_1189: closed_merged_historical_lineage
  pr_1444: umbrella_rendezvous_current
  pr_1463: open_candidate_preanswer_gate
  skill_owner_found: .agents/skills/centraldark-operational-method/SKILL.md
  pdf_base: tlc23(2).pdf
  horn_subset: implication_and_fail_closed_negative_clause
  bridge_script: CentralDark-Remote-Bridge(1).ps1
  bridge_session_json: BOOTING_no_attempts
  remote_desktop_commander: timeout_no_response_from_device
  github_actions_ftp_zip: evidence_missing_not_listed_in_conversation_files
  github_copilot_lnk: evidence_missing_not_listed_in_conversation_files
```

## 8_TEST_EXPECTATION

```text
TEST_FILE=scripts/ci/centraldark-preanswer-gate.test.mjs

CASE_1:
  centraldark_command=true
  github_measured=false
  EXPECT answer_blocked=true

CASE_2:
  centraldark_command=true
  github_measured=true
  repo_confirmed=true
  main_head_measured=true
  relevant_prs_measured=true
  issues_measured_or_not_material=true
  EXPECT answer_allowed=true

CASE_3:
  centraldark_command=true
  github_measured=true
  relevant_prs_measured=true
  issues_materiality_unknown=true
  EXPECT answer_allowed=false
```

## 9_HOUSE_RULE

```text
DEVELOPER_MODE:
  pretty_text: false
  evidence_first: true
  arrows_visible: true
  raw_contract_first: true
  biblical_refs_as_guardrails: true
  baianes_comment_only: true

# baianês técnico:
# se não mediu, não enfeita. Se mediu, aponta o caminho da dor.
```

## 10_RULE_ZERO_AND_CONNECTOR_DEMAND

```text
REGRA_ZERO_RECEIPT=.agents/skills/centraldark-operational-method/references/2026-09-08-rule-zero-horn-connector-demand.md
HORN_LINE_GATE=scripts/ci/centraldark-horn-line-gate.mjs
HORN_LINE_GATE_TEST=scripts/ci/centraldark-horn-line-gate.test.mjs
CONNECTOR_DEMAND_ROUTER=scripts/ci/centraldark-connector-demand-router.mjs
CONNECTOR_DEMAND_ROUTER_TEST=scripts/ci/centraldark-connector-demand-router.test.mjs
```

```text
CHEFE_INTENT -> CENTRALDARK -> LIVE_STATE -> ALIGNMENT -> MINIMAL_DELTA -> EVIDENCE -> COUNTERPROOF -> REALITY_JUDGE
```

```text
NAO_ACIONAR_TODOS_CONECTORES_CEGAMENTE
ACIONAR_CONECTOR_SOMENTE_POR_DEMANDA_MATERIAL
WEBHOOK_SOMENTE_COM_SCHEMA_EVENTO_SUPORTADO
PROVAR_CASA != PROVAR_SITE
PROVAR_SITE != PROVAR_CASA
```

## 11_LABEL_GATE_DELTA_UTIL

```text
LABEL_GATE_RECEIPT=.agents/skills/centraldark-operational-method/references/2026-09-08-label-gate-delta-util-audit.md
LABEL_GATE=scripts/lupa/label-gate.mjs
LABEL_GATE_TEST=scripts/lupa/label-gate.test.mjs
LABEL_GATE_WORKFLOW=.github/workflows/centraldark-label-gate.yml
AUTONOMIA_TEST=scripts/github-autonomia-varredura.test.mjs
```

```text
GPT_IS_REQUIRED_AS_JUDGE=false
AGENTE_CHATGPT_AS_OLD_TEST_REQUIREMENT=true
AGENT_LABEL_AS_PROVENANCE=true
CONTRACTS_CONFLICTING=true
```

```text
PROMOTION = 👑 PERMITO-SEGREDO + 🔄 GIT + 🤖 AUTO + 🟡 IA-PRECISA-REVISAR
PROVENANCE = 🧠 AGENTE-*
CAPABILITY = 🤖 IA-* / AGENTIC-DEVOPS
CATEGORY = assunto do PR
STATUS = telemetria/triagem
RESULT = pós-prova/pós-merge

PROVENANCE != AUTHORITY
STATUS != PROOF
RESULT != PROMOTION_INPUT
UNKNOWN_LABEL_CONSUMER != PASS
```
