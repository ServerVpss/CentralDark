# 🩹 HERMES CENTRALDARK PET — DUPLICATE RENDER / GHOST FRAME — GRILL-ME RECEIPT

PR_MOTHER=#1562
PR_MOTHER_ROLE=RENDEZVOUS_LEDGER_NOT_WRITER
BOT_ENTRY=!CENTRALDARK
BOOT_CHAIN=#ACORDAR → !CALIBRAR → !META_LUPA → GRILL-ME → !CONTRAPROVA
OBSERVED_DATE=2026-09-22
SOURCE=USER_SCREENSHOT
REALITY_IS_JUDGE=true
UNKNOWN_IS_NOT_PASS=true
DOCUMENTED_IS_NOT_EXECUTED=true
NEW_OWNER_REQUIRED=false
NEW_PET_ID_REQUIRED=false

## Intenção

Registrar no ledger do PR-mãe a ferida visual observada na CLI do Hermes sem inventar causa e sem criar pet V2, segundo owner ou segundo pacote.

## Evidência observada

Screenshot fornecido pelo CHEFE mostra, na mesma sessão/CLI:

- um Hermes renderizado de forma nítida;
- uma segunda materialização visual do mesmo personagem no canto inferior direito;
- a segunda materialização aparece degradada/fantasma em relação ao render principal.

Classificação:

```text
DUPLICATE_VISIBLE_RENDER=PROVED_BY_USER_SCREENSHOT
SECOND_RUNTIME_PROCESS=UNKNOWN
SECOND_PACKAGE_ID=NOT_PROVEN
SECOND_OWNER=NOT_PROVEN
ROOT_CAUSE=UNKNOWN
```

## Grill-Me — hipóteses sobreviventes

```text
H1_STALE_FRAME_NOT_CLEARED=STRONG_HYPOTHESIS
H2_TWO_RENDER_OWNERS=STRONG_HYPOTHESIS
H3_BAD_SPRITESHEET_CAUSES_DUPLICATION=WEAKER_HYPOTHESIS
```

Nenhuma hipótese acima é promovida a PASS sem medir o renderer real.

## Regra de correção

```text
DO_NOT_REBUILD_ASSET
DO_NOT_CREATE_PET_V2
DO_NOT_CREATE_SECOND_OWNER
MEASURE_RENDER_LIFECYCLE_FIRST=true
RETRY_FAILED_EDGE_ONLY=true
```

Cadeia a medir:

```text
PET_PACKAGE
→ PET_LOADER
→ ACTIVE_PET_INSTANCE
→ RENDER_OWNER
→ POSITION
→ DRAW
→ CLEAR_PREVIOUS_FRAME
→ DRAW_NEXT_FRAME
→ DISPOSE_ON_RESIZE_OR_STATE_CHANGE
```

Invariante alvo:

```text
SESSION_ID + PET_ID
→ MAX_ACTIVE_RENDERERS=1
```

## Testes discriminantes

1. Se os dois renders animarem independentemente → aumentar evidência para `TWO_RENDER_OWNERS`.
2. Se um ficar congelado e o outro animar → aumentar evidência para `STALE_FRAME_NOT_CLEARED`.
3. Se resize criar terceiro fantasma → `CLEAR_ON_RESIZE` é falha material.
4. Se refresh/clear remover fantasma e ele voltar depois → falha de lifecycle/redraw.

## Fixed point deste receipt

```text
PACKAGE_UNIQUE=PROVED_PREVIOUSLY
PET_FUNCTIONAL=PROVED_PREVIOUSLY
DUPLICATE_VISIBLE_RENDER=PROVED
ROOT_CAUSE=UNKNOWN
FIXED_POINT=false
NEXT_CURSOR=MEASURE_ACTIVE_RENDERERS_AND_CLEAR_DISPOSE_LIFECYCLE
```

Este receipt registra evidência e próximo teste. Não executa correção e não declara runtime corrigido.
