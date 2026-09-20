# 👑🪬 Three red gates — root-cause classification

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
CHILD_HEAD=3dc6025985d9022713b202552b165c961f5b555b

## Trigger Fabric

Workflow:
Trigger Fabric Full Package

Failed step:
Renderizar arquitetura a partir do Mermaid canônico

Exact error:
ARCHITECTURE.mmd line 84 parse error around:
[EXT_REDACTED]["AIOS ...

Classification:
PRODUCT_ARTIFACT_SYNTAX_DEFECT=true.
MERMAID_ENGINE_FAILURE=false.
TARGETED_PATCH_ALLOWED=true.

## PR auto-review

Deterministic scanner self-test:
PASS cases=7

Diff analysis exported:
SECRET_SUSPECT=true
TOUCHED_SENSITIVE=true

The failing step itself was:
Publicar checklist auditável

Exact external failure:
GitHub API 403
API rate limit exceeded for installation.

Classification:
CHECKLIST_PUBLICATION_PROVIDER_FAILURE=true.
PRODUCT_REGRESSION_FROM_RATE_LIMIT=false.
SECRET_SUSPECT_STILL_REQUIRES_SEPARATE_INVESTIGATION=true.

## Grafo Vivo Markdown

Self-test:
GLOBAL_MARKDOWN_CONFORMANCE_SELF_TEST=PASS

Gate failed against changed Markdown.

Observed debt includes:
- centraldark-operational-method/SKILL.md: MD022/MD024/MD031/MD040/MD009 and others;
- several 2026-09-20 receipts: mainly MD009 trailing spaces;
- docs/CONSCIENCIA/APRENDIZADOS.md: missing final newline, heading spacing, duplicate headings, trailing spaces;
- additional docs graph missing-link findings in changed graph.

Classification:
GATE_ENGINE_PASS=true.
CHANGED_MARKDOWN_DEBT=true.
DISABLE_GATE_FORBIDDEN=true.

## Order of repair

1. Mermaid minimal syntax patch.
2. Secret suspect discrimination.
3. Markdown conformance using existing gate/formatter or minimal normalization.
4. SAME-HEAD CI.

UNKNOWN != PASS.
PROVIDER_FAILURE != PRODUCT_FAILURE.
