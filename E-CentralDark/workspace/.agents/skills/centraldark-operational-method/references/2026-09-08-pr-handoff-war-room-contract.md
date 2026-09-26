# PR_HANDOFF_WAR_ROOM_CONTRACT

owner: `.agents/skills/centraldark-operational-method/SKILL.md`  
refs: `#1444`, `#1454`, `#1463`  
status: `CANDIDATE_FUNCTIONAL_MODE`  
mode: `RAW_WAR_ROOM_CONTRACT`  
reason: `CHEFE determinou que informação operacional não pode ficar só no chat; precisa permanecer no PR/commit/issue`  

## 0_REGRA_DO_CHEFE

```text
CHAT_RESPONSE_ONLY = FRACO
PR_COMMIT_ISSUE_TRACE = FORTE
HANDOFF_SEM_PR = QUEBRA_DE_CONTINUIDADE
```

```text
QUALQUER_PR_NOVO_FUTURO
  ↓
DEVE_CARREGAR_HANDOFF
  ↓
PR_BODY + COMMITS + ISSUES + FILES + CHECKS
  ↓
AGENTES_CONVERSAM_NA_ZONA_DE_GUERRA_BRUTA
  ↓
REALIDADE_JULGA
```

## 1_BIBLICAL_GUARDRAILS

```text
# Pv 18:13
# responder antes de ouvir/medir = vergonha operacional.

# 1Ts 5:21
# examinar tudo; conservar o que atravessa teste/check/log.

# Mt 7:16
# fruto = commit, teste, check, artifact, runtime, receipt.

# Tg 1:22
# não basta ouvir/documentar; executar/provar.
```

```text
# baianês técnico:
# conversa boa que não vira rastro some no vento.
# botou na guerra, deixa placa, mapa, recibo e próxima trilha.
```

## 2_REQUIRED_PR_HANDOFF_FIELDS

```yaml
PR_HANDOFF_REQUIRED:
  title:
    - emoji_prefix
    - uppercase_text
  body:
    - INTENCAO
    - Refs_or_Issue_number
    - AGENTE_or_WRITER_or_OWNER
    - HEAD_or_SHA_or_COMMITS
    - ARQUIVOS_or_FILES
    - PROVADO_or_PROOF_or_TESTE
    - QUEBRADO_or_BLOCKED_or_UNKNOWN_or_EVIDENCIA_FALTANTE
    - NEXT_CURSOR
  invariants:
    - UNKNOWN != PASS
    - DOCUMENTED != EXECUTED
    - MERGED != DEPLOYED
```

## 3_AGENT_COMMUNICATION_STANDARD

```text
AGENTE_ENTRA_NO_PR:
  ↓
  MEDE_MAIN_HEAD
  ↓
  MEDE_PR_HEAD
  ↓
  LÊ_BODY_ATUAL
  ↓
  LÊ_ISSUES_REFS
  ↓
  LÊ_ARQUIVOS_ALTERADOS
  ↓
  POSTA_OU_ATUALIZA_HANDOFF
  ↓
  NÃO_PERDE_CONTEXT
```

## 4_RAW_OUTPUT_TEMPLATE

```markdown
# 🧿 INTENÇÃO

Refs #____

WRITER: ____
OWNER: ____
HEAD: ____
COMMITS: ____
ARQUIVOS: ____

## PROVADO
- ____

## QUEBRADO
- ____

## EVIDÊNCIA_FALTANTE
- ____

## RAIZ
- ____

## NEXT_CURSOR
- ____

UNKNOWN != PASS  
DOCUMENTED != EXECUTED  
MERGED != DEPLOYED
```

## 5_FAIL_CLOSED

```text
missing_refs -> fail
missing_writer_or_owner -> fail
missing_files_or_commits -> fail
missing_proof -> fail
missing_blockers_or_unknown_bucket -> fail
missing_next_cursor -> fail
unknown_as_pass -> fail
documented_as_executed -> fail
```

## 6_CODE_BINDING

```text
scripts/ci/pr-handoff-contract.mjs
  ↓
scripts/ci/pr-handoff-contract.test.mjs
  ↓
.github/workflows/pr-handoff-contract.yml
  ↓
PR_FUTURO
```

## 7_SESSION_TRACE

```yaml
session_delta:
  source: chat_session_2026_09_08
  complaint: "não adianta mandar só pra mim; trava handoff direcionado sempre no PR"
  correction: "PR handoff contract as reusable script + test + workflow"
  pr: 1463
  branch: sol/preanswer-github-gate-20260908
  files:
    - scripts/ci/pr-handoff-contract.mjs
    - scripts/ci/pr-handoff-contract.test.mjs
    - .github/workflows/pr-handoff-contract.yml
    - .agents/skills/centraldark-operational-method/references/2026-09-08-pr-handoff-war-room-contract.md
```

## 8_NON_GOALS

```text
NO_AUTO_MERGE=true
NO_MAIN_DIRECT_WRITE=true
NO_DEPLOY_CLAIM=true
NO_RUNTIME_CLAIM=true
NO_SECRET_IN_RECEIPT=true
NO_SECOND_SYSTEM=true
```
