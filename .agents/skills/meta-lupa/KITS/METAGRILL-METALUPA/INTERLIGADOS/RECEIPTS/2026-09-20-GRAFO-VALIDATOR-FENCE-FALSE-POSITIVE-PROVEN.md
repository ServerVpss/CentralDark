# 👑🪬 Grafo Markdown validator — fenced-code false positive proven

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
OBSERVED_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

## Counterproof

The validator implementation evaluates Markdown heading/list rules without first suppressing semantics inside an already-open fenced code block.

Direct classification of current SKILL.md content found findings inside fenced code, including:

- MD022 inside-fence findings;
- MD024 duplicate-heading findings inside-fence;
- MD030 marker-space findings inside-fence.

Concrete examples are shell/comment lines inside code fences:
- # 1. Criar .env local
- # 2. Subir server.py direto com venv do Hermes Agent
- # .env.local com vars mínimas

These are code/example content, not Markdown headings.

All 11 MD030 findings observed in the analyzed portion were inside fenced code.

## Verdict

GRAFO_VALIDATOR_FALSE_POSITIVE_PROVEN=true.
BLIND_DOC_FORMATTING_WOULD_RISK_SEMANTIC_REGRESSION=true.

## Corrective rule

While a fenced code block is open:
- do not apply heading semantics MD022/MD024;
- do not apply list-marker semantics MD030;
- do not apply ordered-list sequence MD029.

Fence integrity rules MD031/MD040 remain active at fence boundaries.

Add an adversarial self-test containing shell comments/headings/list-like text inside a fenced code block and require zero heading/list findings.

## NEXT_CURSOR

Remeasure #1597 CURRENT HEAD. If unchanged/applicable, patch the existing validator only, add self-test, then rerun exact changed-from gate before touching documents.
