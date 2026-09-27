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
- Voice input reached this ChatGPT interaction, became visible text in the same interaction, and the interaction continued into proven tool calls.
- Text input and voice-originated input both participate in the same visible conversation flow observed by the user.
- Tool calls are real and visible in an observed surface.

LIMITS:
- Functional Voice/Text continuity in this interaction is PASS.
- Exact internal telemetry identity is a different claim: canonical SESSION_ID equality, hidden ordered trace identity, and model-token accounting equality are not directly exposed here for field-by-field verification.
- Remote ping does not prove CentralDark internal MCP audit/receipt matching.
- Tool-call success does not prove every tool is active.

CURRENT:
TOOL_CALL_EXISTS=PASS
TOOL_CALL_VISIBLE_IN_OBSERVED_SURFACE=PASS
CHATGPT_TOOL_CALLS=PASS
REMOTE_SEGREDO_ONLINE=PASS
REMOTE_SEGREDO_PING=PASS
VOICE_INPUT_THIS_INTERACTION=PASS
VOICE_TO_TEXT_VISIBLE_SAME_INTERACTION=PASS
VOICE_TEXT_FUNCTIONAL_CONTINUITY=PASS
VOICE_TRIGGERED_FLOW_REACHED_TOOL_CALLS=PASS
EXACT_INTERNAL_SESSION_TRACE_TOKEN_IDENTITY=UNKNOWN
CENTRALDARK_INTERNAL_MCP_AUDIT_MATCH=UNKNOWN

EVIDENCE_RULE:
- Do not merely claim that a tool was used.
- Show TOOL_CALL / RECEIPT / SHA / TRACE when the claim depends on tool execution.
- CLAIM_WITHOUT_MATCHING_TOOL_EVIDENCE=INVALID.
- DOCUMENTED!=EXECUTED.
- TOOL_LISTED!=TOOL_ACTIVE.
- FUNCTIONAL_PARITY must not be downgraded merely because hidden telemetry fields are unavailable.
- INTERNAL_TELEMETRY_IDENTITY is a separate claim from FUNCTIONAL_PARITY.

RECIPE:
1. Reuse the existing TOOL-CALL receipt owner.
2. Observe voice-originated input become visible text in the same interaction.
3. Continue the same interaction into a real tool call.
4. Require a structured tool response.
5. For remote proof, list devices, select an online device and execute a read-only ping.
6. Record result, timestamp, SHA and readback.
7. Mark Voice/Text functional continuity PASS when the visible interaction and tool flow are continuous.
8. Only require SESSION_ID/ordered-trace/token field equality for the narrower internal-telemetry-identity claim.
9. Do not promote broader runtime claims without matching evidence.

NEXT_CURSOR=CENTRALDARK_READ_ONLY_CALL->AUDIT_EVENT->RECEIPT_MATCH->COUNTERPROOF
