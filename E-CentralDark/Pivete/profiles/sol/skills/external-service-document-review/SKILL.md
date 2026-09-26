---
name: external-service-document-review
description: >
  Review external docs and produce structured summaries.
version: "1.0.0"
category: integration-review
tags: [external-service, rate-limits, auth, mcp, documentation-review]
author: Hermes Agent
related_skills: []
---

# External Service Document Review

## When to use

Use when the user shares an external service's documentation (or fragments of it)
and the conversation needs a clean, structured recap that captures what matters
for decisions:

- rate limits per tier/seat
- auth model (OAuth, enterprise-managed, SSO providers, etc.)
- supported clients / catalog restrictions
- exempt tools or operations
- common permission errors and what to check
- upgrade paths or constraint trade-offs

Also use when the user sends a link to hosted docs (Azure blob, help center,
etc.) and the content is being relayed in pieces.

## What "good" looks like

A good review produces, at minimum:

1. **A short structured recap** the user can scan in seconds.
2. **The constraint table** (tiers × seats × limits), not just prose.
3. **The exemption list** (if any).
4. **The auth model, with provider and caveats** (e.g. "Okta XAA works with
   Claude only").
5. **The supported-client list + waitlist caveat**, if present.
6. **Troubleshooting checklist** for the most common failures.
7. **A short "what this means for us" note**, only if the user asked for it
   or the constraints clearly gate a decision.

Do NOT pad with generic explanation unless asked. The recap should be compact and
scannable. If the source is fragmentary, say what is still missing rather than
filling gaps with guesses.

## Parsing fragmentary source material

When the user sends doc fragments (HTML tags, table rows, partial excerpts):

1. Accumulate fragments in order; do not finalize until the structure is clear.
2. Reconstruct the logical table: headers × rows.
3. Preserve the source structure enough that the user can map it back.
4. Flag any row/column/sentence that did not arrive before finalizing.
5. If a link/token is present in the relayed content, do NOT treat the URL as
   something to re-fetch in-band; use it only as provenance metadata.

## Decision-gating questions to surface

When reviewing limits/auth/clients, explicitly answer:

- **Is this usable at our current tier/seat?** If the limit is tiny (e.g.
  single-digit-per-month), say so plainly.
- **Does auth require a specific client/model?** If yes, that narrows who can
  use it (e.g. enterprise-managed auth tied to one assistant).
- **Are we dependent on a catalog/waitlist for clients?** If yes, that is a real
  constraint, not a footnote.
- **What is exempt?** Exempt operations can change the cost/feasibility calculus.
- **What breaks first under load?** The smallest tier or seat usually does.

## Anti-patterns

- Copying the whole upstream page as a "summary."
- Inventing limits, seats, or auth providers not present in the source.
- Treating a fragmentary relay as complete.
- Reading the URL as "something I should fetch now" when the user relayed content
  from it; respect the user's delivery and treat the URL as provenance, not a
  new retrieval task, unless asked.
- Smuggling in advice that is not grounded in the doc the user shared.

## Evidence capture

When the source came through a link with a transient token or signed URL:

- Record a short provenance note: source type, approximate time, what was
  captured.
- Do NOT re-emit the signed URL in a way that extends its effective life for
  others. Treat it as sensitive transport, not public reference.
- If there is any doubt about confidentiality, prefer local capture in the
  Casa's own notes over re-posting the link.

## Output shape

Prefer:

- a compact recap section
- a table for tier/seat/limit data
- bullet lists for auth, clients, exemptions, troubleshooting
- one short "implications" block only when it changes a decision

Avoid:

- long restatements of the source
- category-docs-as-summary
- speculative notes presented as facts

## Pitfalls

- **Table reconstruction can mislead if rows span cells.** When `rowspan` or
  merged cells appear, preserve the grouping and label it rather than pretending
  every cell is independent.
- **Rate-limit prose and table values can disagree across sections.** Prefer the
  most specific statement and note the discrepancy if it exists.
- **"Supported clients" lists can be incomplete at the edge.** If the doc says
  "only clients in the catalog" and there is a waitlist, capture that as a real
  constraint.
- **Enterprise auth is often narrower than general auth.** If enterprise-managed
  auth is limited to one assistant or one IdP, say so explicitly.

## Related considerations

If this review is part of a larger integration decision (e.g. whether to adopt
an MCP server, whether limits are acceptable, whether auth fits the stack),
carry the summary into the integration decision conversation rather than leaving
it as a standalone recap. The value is in what changes because of the review.

## References

- `references/figma-mcp-server-review-2026-09-01.md` — captured recap of the
  Figma MCP Server doc fragments shared in-session: rate-limit table, exempt
  tools, auth (Okta XAA for Claude), supported clients, permission-error
  checklist, upgrade paths.

