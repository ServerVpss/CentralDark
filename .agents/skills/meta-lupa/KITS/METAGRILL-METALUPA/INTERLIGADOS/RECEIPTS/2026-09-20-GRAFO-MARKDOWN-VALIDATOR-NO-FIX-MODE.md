# 👑🪬 Grafo Vivo Markdown — validator only, no fix mode

PR_MOTHER=#1562
MOTHER_BRANCH=sol/meta-lupa-corpo-operacional-20260917-current
CHILD_PR=#1597
REVIEWED_HEAD=da8fa16fdc286beae1ad7deb6936a63130b02af0

Owner:
scripts/lupa/grafo-vivo-markdown-conformance.mjs

## CLI observed

Supported:
- --self-test
- --changed-from <sha>

No observed support for:
- --fix
- --format
- --write
- auto-remediation

## Validator rules

Current hygiene checks include:
- MD047 final newline
- MD010 tabs
- MD009 trailing spaces
- MD012 multiple blank lines
- MD030 list marker spacing
- MD024 duplicate headings
- MD022 heading blank spacing
- MD029 ordered-list sequence
- MD040 fenced code language
- MD031 fenced block blank spacing/unclosed fence

The gate applies hygiene only to Markdown files changed from the supplied base SHA.

## Verdict

GATE_IS_VALIDATOR_ONLY=true.
NO_CANONICAL_AUTO_FIX_MODE=true.
BLIND_GLOBAL_FORMATTER_FORBIDDEN=true.

## Next cursor

Run validator on exact current head against the PR base; save JSON; summarize failing files and rule counts; normalize only changed files and only rules proven by the gate.
