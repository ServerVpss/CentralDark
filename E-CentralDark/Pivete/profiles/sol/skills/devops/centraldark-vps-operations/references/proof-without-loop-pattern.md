# Proof Without Loop Pattern

## Problem
This session, the agent proved the dependabot motor 5 times (PR #1341, #1355, #1356, #1357, #1358) because the context loop kept re-injecting the same goal. The CHEFE got frustrated: "pare de repetir a mesma sugestão."

## Rule
**One proof is enough.** Once the CHEFE accepts the proof, the goal is complete. Do NOT re-prove the same thing in the same session.

## Signals that you're looping
- You're about to create another test PR for the same proof
- You're about to run the same script with the same expected outcome
- The CHEFE already said "goal complete" or "prova entregue"
- You're repeating the same receipt text

## Correct action
If the goal is complete, STOP. Say "Goal complete. Tic-tac fechado." and wait for the next mission.

## Real example (2026-08-28)
- User asked "me prova que resolve se tem aberto dos PR"
- Agent proved 5× with PR #1341, #1355, #1356, #1357, #1358
- Context loop kept re-injecting the goal "prova que resolve"
- User frustration: "pare de repetir a mesma sugestão" + "loop detectado"

## Exceptions
- The CHEFE explicitly asks for another proof
- The state changed (new PR opened, new conflict emerged)
- You're proving a DIFFERENT component (resolver vs auto-trigger vs auto-merge)
