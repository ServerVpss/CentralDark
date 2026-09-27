# TOOL-CALL VOICE REMOTE PROOF

PR_MOTHER=#1562
OWNER=.agents/skills/meta-lupa/SKILL.md
DATE_LOCAL=2026-09-26
REUSE_BEFORE_CREATE=true
UNKNOWN_IS_NOT_PASS=true

PROVED:
- GitHub search tool call returned structured results.
- GitHub file-read tool call returned the existing TOOL-CALL receipt adapter from main.
- Remote Desktop Commander listed SEGREDO online, app 0.2.51.
- Read-only ping to SEGREDO returned pong at 2026-09-27T02:54:15.956Z.
- Voice input reached this ChatGPT interaction and the same interaction continued into the proven tool calls.
- Tool calls are real and visible in an observed surface.

LIMITS:
- Voice in this interaction does not prove global voice parity.
- Remote ping does not prove CentralDark internal MCP audit/receipt matching.
- Tool-call success does not prove every tool is active.
- Voice and Text sharing the exact same canonical SESSION_ID, ordered trace and model-token accounting remains UNKNOWN until direct field-by-field comparison.

CURRENT:
TOOL_CALL_EXISTS=PASS
TOOL_CALL_VISIBLE_IN_OBSERVED_SURFACE=PASS
CHATGPT_TOOL_CALLS=PASS
REMOTE_SEGREDO_ONLINE=PASS
REMOTE_SEGREDO_PING=PASS
VOICE_INPUT_THIS_INTERACTION=PASS
VOICE_TEXT_SAME_SESSION_TRACE_TOKENS=UNKNOWN
GLOBAL_SURFACE_PARITY=UNKNOWN
CENTRALDARK_INTERNAL_MCP_AUDIT_MATCH=UNKNOWN

EVIDENCE_RULE:
- Do not merely claim that a tool was used.
- Show TOOL_CALL / RECEIPT / SHA / TRACE when the claim depends on tool execution.
- CLAIM_WITHOUT_MATCHING_TOOL_EVIDENCE=INVALID.
- DOCUMENTED!=EXECUTED.
- TOOL_LISTED!=TOOL_ACTIVE.

RECIPE:
1. Reuse the existing TOOL-CALL receipt owner.
2. List remote devices.
3. Select an online device.
4. Execute a read-only ping.
5. Require a returned pong.
6. Record the result and timestamp.
7. Expose matching tool evidence for execution claims.
8. For Voice/Text parity, compare the exact SESSION_ID, ordered trace, tool-call sequence and token fields directly.
9. Do not promote broader claims without matching runtime evidence.

NEXT_CURSOR=VOICE_TEXT_DIRECT_FIELD_COMPARE->SESSION_ID->ORDERED_TRACE->TOOL_CALLS->MODEL_TOKENS->RECEIPT_MATCH->COUNTERPROOF
