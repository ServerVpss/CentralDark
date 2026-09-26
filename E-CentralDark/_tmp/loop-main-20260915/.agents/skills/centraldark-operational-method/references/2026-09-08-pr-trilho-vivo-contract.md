# 🧿 PR_TRILHO_VIVO_CONTRACT

status: `DELTA_UTIL_REGISTERED`
owner: `.agents/skills/centraldark-operational-method/SKILL.md`
pr: `#1463`
refs: `#1444`, `#1463`
writer: `SOL`
authority: `PERMITO SEGREDO EXPLICITAMENTE`
mode: `PR_TRILHO_VIVO + MAIN_VIVA + SITE_FIRST + ZERO_REGRESSION`

## INTENÇÃO

Transformar a intenção do CHEFE em fluxo operacional testável:

```text
CHEFE_INTENT
  -> PR_TRILHO
  -> COMMITS_PEQUENOS
  -> CHECKS_SAME_HEAD
  -> MAIN_VIVA
  -> DEPLOY/SITE quando aplicável
  -> RECEIPT
  -> VOLTA_AO_PR_MAE
```

## PAPÉIS

```text
#1444 = PR_MAE / RENDEZVOUS / ÍNDICE VIVO / HISTÓRICO PRESENTE
#1463 = CONTRATO OPERACIONAL / CÓDIGO BRUTO / TESTE / WORKFLOW
PR_FILHO = MISSÃO MATERIAL ESPECÍFICA
MAIN = FONTE DA VERDADE ESTÁVEL
SITE = PROVA PÚBLICA VIA ARTIFACT + DEPLOY + HTTP
CASA = PROVA LOCAL VIA DEVICE + WORKDIR + PROCESSO + RECEIPT
```

## REGRA

```text
UM_PR_TRILHO_POR_MISSÃO
NÃO_UM_PR_GIGANTE_PARA_O_UNIVERSO_INTEIRO
PR_ANTIGO_VIRA_LINEAGE
NOVO_PR_HERDA_NEXT_CURSOR
TODO_FILHO_VOLTA_AO_1444
```

## CÓDIGO

```text
scripts/ci/centraldark-pr-trilho-contract.mjs
scripts/ci/centraldark-pr-trilho-contract.test.mjs
.github/workflows/centraldark-pr-trilho-contract.yml
```

## CAMPOS_OBRIGATÓRIOS

```text
PR_MAE_REF
MISSION_ID
CHEFE_INTENT / INTENÇÃO
OWNER
WRITER
SCOPE / SCOPE_CLASS
LIVE_STATE
FILES_CHANGED / ARQUIVOS
EVIDENCE / EVIDÊNCIA
COUNTERPROOF / CONTRAPROVA
BLOCKERS / UNKNOWN / PENDÊNCIA
NEXT_CURSOR
```

## BLOQUEIOS

```text
UNKNOWN = PASS -> FAIL
DOCUMENTED = EXECUTED -> FAIL
MERGED = DEPLOYED -> FAIL
PR sem vínculo com #1444 -> FAIL
SCOPE_CLASS desconhecido -> FAIL
V2/V3/V4 sem GAP_PROVADO -> FAIL
```

## DISTINÇÃO_DE_PROVAS

```text
PROVAR_SITE != PROVAR_CASA
PROVAR_CASA != PROVAR_SITE
PROVAR_MAIN != PROVAR_DEPLOY
PROVAR_DEPLOY != FIXED_POINT_GLOBAL
```

## ESCOPO_DO_PERMITO

```text
PERMITO_SEGREDO_EXPLICITAMENTE:
  allowed:
    - criar contrato PR-trilho no #1463
    - criar teste
    - criar workflow
    - registrar receipt
    - atualizar handoff do PR
  forbidden:
    - tocar main diretamente
    - deploy
    - restart
    - copiar código externo
    - criar V2/V3/V4
    - expor secrets
```

## NEXT_CURSOR

```text
medir CI same-head do #1463 após HEAD novo
se falhar:
  puxar job/log
  corrigir primeira causa raiz
se passar:
  avaliar merge com expected_head_sha
```

UNKNOWN != PASS
DOCUMENTED != EXECUTED
ACTION != PROOF
