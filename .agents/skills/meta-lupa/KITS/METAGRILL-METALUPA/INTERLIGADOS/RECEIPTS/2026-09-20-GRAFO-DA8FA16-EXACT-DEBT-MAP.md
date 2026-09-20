# 👑🪬 Grafo Vivo — exact debt map on da8fa16

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
TESTED_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0
BASE=cead445aa2a9386352d701070a56dfe5c8e066b4

## Gate

GLOBAL_MARKDOWN_CONFORMANCE_SELF_TEST=PASS
GRAFO_EXIT=1

Artifact was parsed BOM-aware after PowerShell UTF-16 redirection.

## Changed Markdown

FILES_CHECKED=3
FAILING_FILES=3
GLOBAL_CHANGED_STATUS=FAIL

Rule totals:
- MD022=382
- MD024=23
- MD030=11
- MD047=1

### .agents/skills/centraldark-operational-method/SKILL.md

FINDINGS=274
- MD022=244
- MD024=19
- MD030=11

### docs/CONSCIENCIA/APRENDIZADOS.md

FINDINGS=117
- MD022=112
- MD024=4
- MD047=1

### docs/CONSCIENCIA/CONTRATO-HIBRIDO-GRAFO-LOGS-LOCAL.md

FINDINGS=26
- MD022=26

## Non-hygiene stable-owner errors

6 stable owners are reported as missing frontmatter:
- docs/CONSCIENCIA/PADRAO-RESPOSTA-SEGREDO-CHEFE.md
- docs/CONSCIENCIA/GUIA-COMUNICACAO-SEGREDO-CHEFE.md
- docs/BRAIN/00-MAPA-SISTEMA/01-HUB/POSTURA-SEGREDO-CHEFE.md
- docs/CONSCIENCIA/HERMES-CADEIA-OPERACIONAL.md
- docs/CONSCIENCIA/PADRAO-GRAFO-VIVO-MARKDOWN.md
- docs/RECEIPTS/README.md

## Critical validator question

markdownHygieneErrors currently evaluates heading/list rules before fence state is used to suppress Markdown semantics inside fenced code.

Potential consequence:
CODE_FENCE_CONTENT_MAY_BE_COUNTED_AS_MARKDOWN_SYNTAX=true.

Blindly inserting blank lines/renaming headings before proving this would risk changing code/example semantics.

## NEXT_CURSOR

On exact CURRENT head, classify every MD022/MD024/MD030 finding as inside-fence vs outside-fence. If any inside-fence findings exist, fix the validator first and add counterproof; only then normalize genuine document debt.
