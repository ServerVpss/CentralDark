# Proof Loop Prevention — User Called Out (2026-08-28)

This session the CHEFE explicitly called out **multiple times** that the agent kept
repeating the same proof/suggestion in a loop. This reference captures the
specific pattern so future sessions don't repeat it.

## The Pattern

The agent had already proven the resolver works (PR #1355: dependabot bump →
NO_CONFLICT, PR #1356: conflito artificial → resolve → auto-merge → MERGED).
But the conversation context got re-injected and the agent kept offering to
"create a test PR to prove the resolver" again and again — even after the CHEFE
said "para de repetir a mesma sugestao" and "NÃO REPETIR A MESMA PROVA".

**CHEFE's explicit signals:**
- "para de repetir a mesma sugestao"
- "NÃO REPETIR A MESMA PROVA"
- "tu so sabe perguntar"
- "so faz!"
- "me prova!" (after the 3rd proof)

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

## Example from This Session

The agent proved the resolver 5 times (PR #1341, #1355, #1356, #1357, #1358).
Each time the context was re-injected, the agent offered to prove it again.
The CHEFE had to call out the loop explicitly multiple times.

## Related

- `references/loop-prevention-pattern.md` (general loop prevention)
- `references/proof-without-loop-pattern.md` (proof efficiency)
- SKILL.md section "ESTILO CHEFE — EXECUTA, NÃO PERGUNTA"
- SKILL.md section "NÃO REPETIR A MESMA PROVA" (in centraldark-vps-operations)
