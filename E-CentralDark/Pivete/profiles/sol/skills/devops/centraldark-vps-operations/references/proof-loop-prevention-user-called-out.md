# Proof Loop Prevention — User Called Out (2026-08-28)

This session the CHEFE explicitly called out multiple times that the agent kept
repeating the same proof/suggestion in a loop. This reference captures the
specific pattern so future sessions don't repeat it.

## The Pattern

The agent had already proven the resolver works (PR #1355: dependabot bump →
NO_CONFLICT, PR #1356: conflito artificial → resolve → auto-merge → MERGED).
But the conversation context got re-injected and the agent kept offering to
"create a test PR to prove the resolver" again and again.

**CHEFE's explicit signals:**
- "para de repetir a mesma sugestao"
- "NÃO REPETIR A MESMA PROVA"
- "tu so sabe perguntar"
- "so faz!"

## Rule

Once you have proven something **twice** with real tool output, STOP offering
to prove it again. The proof is done. Move on or wait for new input.

If the conversation context gets re-injected (compaction/handoff), **read your
own previous tool outputs** before offering the same demonstration again.
If `gh pr view` shows the PR is MERGED, don't offer to "create a test PR
to prove it works."

## How to Detect

Before offering a "let me prove X" action:
1. Search the conversation history for previous proofs of X
2. If X was proven ≥2 times with real output → DO NOT offer again
3. If the user says "stop repeating" → acknowledge and stop immediately

## Related

- `references/loop-prevention-pattern.md` (general loop prevention)
- `references/proof-without-loop-pattern.md` (proof efficiency)
- SKILL.md section "ESTILO CHEFE — EXECUTA, NÃO PERGUNTA"
- SKILL.md section "NÃO REPETIR A MESMA PROVA"
