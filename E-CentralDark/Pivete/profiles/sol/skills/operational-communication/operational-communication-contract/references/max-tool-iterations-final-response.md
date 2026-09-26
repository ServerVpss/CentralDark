# Max Tool Iterations — Final Response Protocol

**Trigger:** System message "You've reached the maximum number of tool-calling iterations allowed."

**Required behavior:**
- STOP all tool calls immediately. No exceptions, no "just one more" to verify or finish.
- Deliver a *final response only*.
- The response MUST summarize:
  - What was found and accomplished so far (cite specific tool outputs, receipts, evidence from this session).
  - Current state at cutoff (what succeeded, what is pending, what is UNKNOWN).
  - Key artifacts (files, SHAs, statuses, measurements).
- Do NOT:
  - Attempt any tool call.
  - Invent completion or "almost done" claims.
  - Re-ask for authorization or direction (the max is the direction).
  - Produce empty or partial "I reached max" without the summary of accomplishments.
- Style: ultra-concise per contract. Use baianês/direct when natural. Evidence-first. No papagaio.

This is a hard system boundary on the tool loop. The session ends the tool phase here; the summary is the deliverable.

**Relation to other rules:**
- UNKNOWN ≠ PASS still holds for anything not proven by the cutoff.
- ACTION ≠ PROOF for anything not completed.
- Respect "provide a final response summarizing what you've found and accomplished so far, without calling any more tools."

**Example output shape (concise):**
"Max iterations reached.
Accomplished: X (evidence: tool Y returned Z at HH:MM).
Found: A, B.
Pending: C (no proof).
Cutoff state: D."

**Provenance:** User directive in session 2026-09-03 during tool-heavy execution after long SOUL/context load.