# PR_TITLE_CONTRACT_RAW_CODE_AUDIT

owner: `.agents/skills/centraldark-operational-method/SKILL.md`  
refs: `#1444`, `#1463`  
status: `CODE_BACKING_ADDED`  
mode: `BISTURI_NAO_CEGO`

## 0_DOR

```text
SINTOMA:
  PRs abertos apareciam fora do padrão visual da Casa:
    - sem emoji situacional no início
    - texto não MAIÚSCULO

ERRO_DA_ANALISE_ANTERIOR:
  eu medi o workflow e disse "contrato forte" cedo demais.

CAUSA_RAIZ_REAL:
  contrato existia dentro do YAML `.github/workflows/pr-title-contract.yml`,
  mas não existia como script bruto, importável, testável e reaproveitável.

VEREDITO:
  YAML_INLINE_NODE == FRACO_POR_BAIXO
  SCRIPT_REUTILIZAVEL + TESTE == CODIGO_BRUTO
```

## 1_PROVA_ANTES

```text
ANTES:
  .github/workflows/pr-title-contract.yml
    -> tinha validação inline em `node <<'NODE'`
    -> não havia `scripts/ci/pr-title-contract.mjs`
    -> não havia `scripts/ci/pr-title-contract.test.mjs`

IMPACTO:
  regra visível na UI, mas difícil de reutilizar por CLI, bots, auditoria local, PR sweep ou testes diretos.
```

## 2_CORRECAO

```text
CRIADO:
  scripts/ci/pr-title-contract.mjs
  scripts/ci/pr-title-contract.test.mjs

ALTERADO:
  .github/workflows/pr-title-contract.yml

NOVO FLUXO:
  PR_TITLE
    ↓
  scripts/ci/pr-title-contract.mjs
    ↓
  validatePrTitle()
    ↓
  errors[]
    ↓
  PASS/FAIL + suggestedPrTitle()
```

## 3_REGRAS_BRUTAS

```text
PR_TITLE_EMPTY -> FAIL
PR_TITLE_MISSING_EMOJI_PREFIX -> FAIL
PR_TITLE_EMOJI_PREFIX_NOT_CANONICAL -> FAIL
PR_TITLE_TEXT_EMPTY_AFTER_EMOJI -> FAIL
PR_TITLE_TEXT_HAS_NO_LETTERS -> FAIL
PR_TITLE_TEXT_NOT_UPPERCASE -> FAIL

VALID_TITLE -> PASS
```

## 4_EMOJI_CANONICO_POR_SITUACAO

```text
🧿 CENTRALDARK / GOVERNANCA / GATE / CONSCIENCIA
🛠️ FIX / CI / REMEDIACAO
🤖 AUTO / BOT / DEPENDABOT / AUTOMACAO
🔐 PROVIDER / ACCESS / SECURITY CONTROL PLANE
🔒 FAIL-CLOSED / KILLSWITCH / SAFETY GATE
🧮 HORN / LOGICA / PROVA
🧠 BRAIN / MEMORIA / COGNICAO
📚 DOCS / BIBLIOTECA
⚙️ INFRA / RUNTIME / PIPELINE
✨ MELHORIA
🐞 BUG
```

## 5_BIBLICO_TECNICO

```text
Pv 18:13:
  responder/validar antes de ouvir a regra inteira = erro.

1Ts 5:21:
  examinar workflow + script + teste; reter o que passa.

Mt 7:16:
  PR title contract se conhece pelo fruto: teste, erro nomeado, sugestao.

Tg 1:22:
  workflow documentado sem script bruto = ouvinte; script + teste = praticante.
```

```text
baianes:
  se a placa tá bonita mas o prego tá frouxo, aperta o prego.
```

## 6_NAO_TOCADO

```text
NO_MAIN_DIRECT_PUSH=true
NO_MERGE=true
NO_DEPLOY=true
NO_RUNTIME_CLAIM=true
NO_PROVIDER_ACCESS_LEASE_TOUCH=true
NO_AUTHORITY_LABEL_AUTO=true
```

## 7_NEXT_CURSOR

```text
1. CI rodar no HEAD do PR #1463.
2. Verificar se `node --test scripts/ci/pr-title-contract.test.mjs` passa.
3. Auditar se todos PRs abertos ficam com emoji canônico + MAIÚSCULO.
4. Depois, se necessário, criar sweep seguro de sugestão/normalização, não autoautoridade.
```
