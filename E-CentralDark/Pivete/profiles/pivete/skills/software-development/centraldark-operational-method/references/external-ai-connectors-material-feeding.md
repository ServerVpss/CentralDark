# External AI Connectors & Feeding Material to Hermes

## External AI + GitHub Connector Pattern (updated 2026-09)

User deliberately uses external LLMs (ChatGPT/GPT) as **frontmeira** (preprocessor) to draft and improve bootstrap texts and rule files (e.g. .claude/rules/00-centraldark-boot-universal.md).

**Current workflow (user correction)**:
- External prepares the content (clean bootstrap pointing to LEIA-ME-IA + SOUL, no duplication).
- User triggers the GitHub connector permission dialog.
- Agent instructs: "Aperta 'Permitir uma vez'".
- User notifies agent ("terminou" or sends sha/link).
- **Agent owns everything after**: fetch the branch, diff the proposed change vs local state (handle UU conflicts using git-conflict-resolve-house-standard), compare to main/remote, decide and execute git actions.
- Do NOT hand options back to user ("which button?", "what now?"). User explicitly said: "VOC MESMO RODA E VOCE MESMO COMPARA AO INVES DE ME ENTREGA ESSA OPÇAO".

**Response style**:
- Ultra-concise. When user asks for quick calc/percent or "só isso", deliver number + one-line max.
- No re-explaining full SOUL/green box unless asked.
- After permission given by user, agent takes the wheel on repo side.

## Screen Observation
When user says "usa o screenpipe /screenpipe skill que dá pra vc ver a tela":
- Use the running screenpipe service (:3030) with its vision/OCR/UI recorder for direct screen content instead of waiting for pasted screenshots.
- Query recent frames, search for dialog text (GitHub, Permitir, Update file, .claude, bootstrap), or use UI events.
- Note: API may require Bearer token from `screenpipe auth token`. Fall back to computer_use capture if needed.

## Feeding Content (unchanged core)
Preferred: texto puro > screenshot > PDF (with A4/Carta, 1 per sheet, 100% scale).

## References
- Main: centraldark-operational-method SKILL.md (PREFERÊNCIAS DE COMUNICAÇÃO + EXECUÇÃO sections).
- Screenpipe health/usage details in session transcripts.