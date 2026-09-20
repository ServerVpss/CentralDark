# 👑🪬 Mermaid wound persists on CURRENT

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
CURRENT_HEAD=7e10c6acc84d25ecf16d07ed7802907fabebff67

Direct read of:
docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ARCHITECTURE.mmd

shows the same invalid node syntax around line 84:
a bracketed token used as a node identifier before ["AIOS/..."].

The corresponding edge also uses the same invalid bracketed token.

MERMAID_WOUND_CURRENT=true.
MERMAID_ENGINE_FAILURE=false.
MINIMAL_ID_ONLY_PATCH_AUTHORIZED=true.

Patch rule:
replace only the invalid node identifier with a valid stable Mermaid id (AIOS_EXT), preserving the human-readable label and edge semantics.
