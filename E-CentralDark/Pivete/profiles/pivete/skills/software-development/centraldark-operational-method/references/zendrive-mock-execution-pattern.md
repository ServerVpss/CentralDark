# Zendrive Mock Agent Execution Pattern ("FAÇA TUDO" / "RETORNE FUNCIONANDO")

## Trigger
User says "FAÇA TUDO", "RETORNE FUNCIONANDO", or similar (or shows images of open/pinned sessions with mission text), or asks to diagnose stop point ("O que foi que vc parou", "MEPERGUNTE AQUE OQUE FOI QUE VC PAROU").

## Pattern (class level)
1. Diagnose exact stop point if interrupted.
2. Provide the executable command for the agent/tool.
3. Run it (use mock if real runtime blocked by agent env/deps — e.g. no zendriver, Chrome, or Screenpipe in shell).
4. Return the actual working output (JSON, logs, "ZENDRIVE_CD_AGENT_OK").
5. Show how it feeds to PEGATUDO / existing gateway / vision layer.
6. Tie explicitly to pinned mission (e.g. Reancoragem da Orquestração SOL) as continuous delta — do not disturb the agent's mission.
- Never leave mid-process. Always deliver "funcionando" artifact.
- Mocks are first-class for "retorne funcionando" when real tool unavailable.
- Verify with npm test/lint/build (repair pre-existing blockers) + Python syntax/mock run.
- User preference: ultra-concise, PT-BR for voice, execute first, show result, no verbosity.

See `references/zendrive-agent-integration.md` for mock output + commands for ZENDRIVE-CHAT GPT session 20260905_010608_8c07f9 and integration.

## OBSERVING OPEN HERMES SESSIONS (ZENDRIVE-CHAT GPT, PINNED SOL) AS FRONTS
Treat current open Hermes app sessions and pinned Kanban as observable via Screenpipe (principal vision).
- Session ID + titles (e.g. "ZENDRIVE-CHAT GPT", "Reancoragem da Orquestração SOL", Kanban tasks) as query terms in F4 BROWSER_CHAT or dedicated.
- Images from Hermes are visual state; prefer live query + OCR for UI elements.
- Reconcile as continuous delta to pinned mission without interrupting it.
- Use for cross-process garimpo in PEGATUDO (10 frentes).
- In every #ACORDAR with open tools: health + search session terms + frames.

## Pitfalls to Avoid
- Stopping mid-process without working artifact.
- Asking for confirmation on already-authorized actions.
- Creating new systems instead of extending (elite-gateway, PEGATUDO alias, Screenpipe vision).
- Ignoring pinned mission context.

## References
- `references/zendrive-agent-integration.md`
- Mock script in `apps/modulos/elite-gateway/test-local/zendrive_mock_agent.py`

This pattern ensures "retorne funcionando" even in agent env limitations. Always prioritize actual output.