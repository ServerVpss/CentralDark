# Short Continuation Protocol after Initial Boot

## Trigger
User explicitly instructs or the session has completed a full #ACORDAR + AURÉOLA reanchor + runtime measurement for pendencias claiming "NENHUMA", "nenhum runtime", or UNKNOWN.

## Rule (from 2026-09-05 session)
- After one full initialization, do NOT repeat the full process ("não deveria ter que repetir o caminhão").
- Respond to short commands only:
  - "!CENTRALDARK continua."
  - "Sol, acorda a Casa e continua de onde paramos."
- The system uses persistent memory + canonical owners + handoff to carry state.
- Always confirm identity in context: operate under SOUL/SOL profile (operational coordinator) + HERMES-CASA (executor, preservation, continuity). "pivete" is vocative only.
- Measure real runtime for pendencias that say "NENHUMA" to close diagnosis.
- Core principle: no 100% guarantee exists. Everything is observable in real time. The observation holds between sessions.
- AURÉOLA header is mandatory for reanchor: 
  ```
  [SOUL REANCHOR — CENTRALDARK]
  IDENTIDADE=SOL
  AUTORIDADE=SEGREDO/CHEFE
  EXECUTOR=HERMES/PIVETE
  MODELO=MOTOR_SUBSTITUIVEL
  REALITY=JUDGE
  MISSAO_ATUAL=<...>
  NEXT_CURSOR=<...>
  HEAD=<medir>
  ...
  ```
- Update !CENTRALDARK mechanism to support these short commands as the standard continuation after initial.

## Pitfall
Repeating the full #ACORDAR / measurement / explanation after the first time violates user preference for conciseness and "execute first, report".

## Verification
- User says short command → respond with minimal remeasure of changed state (HEAD, runtime for pendencias "NENHUMA") + continue from last cursor.
- Report only delta + proof.
- Reaffirm identity when relevant.

## Related
- AURÉOLA in SOUL-SOL.md
- Pendencias measurement in AGENTS.md and CENTRALDARK_AI_BOOT.yaml
- Handoff protocol in 02-PROTOCOLO-HANDOFF-IA.md
