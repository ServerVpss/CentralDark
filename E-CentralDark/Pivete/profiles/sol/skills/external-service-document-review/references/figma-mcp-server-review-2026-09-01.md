# Figma MCP Server — Doc Review (2026-09-01)

Fonte: fragments relayed in-session from Figma help content (signed URL present
in session; treat as transient transport, not a public reference to re-emit).

## Rate limits (tier × seat)

| Seat | Starter | Professional | Organization | Enterprise |
|------|---------|--------------|--------------|------------|
| View / Collab | Up to 20/month | Up to 6/month | Up to 6/month | Up to 6/month |
| Dev / Full | Up to 200/day · 10/min | Up to 200/day · 15/min | Up to 600/day · 20/min | (Enterprise tier — least limited) |

Education plans use the same limits as Dev/Full on Professional:
200 tool calls/day, 10/min.

## Exempt tools

- `add_code_connect_map`
- `create_new_file`
- `whoami`

Limits apply to Figma MCP server tools that read data. Tools that write to
Figma files are exempt.

## Auth

- Normal flow: each user goes through OAuth login.
- Enterprise-managed authorization: supported only for **Claude** via **Okta
  Cross App Access (XAA)**.
- With Okta XAA, a member signs in once through Okta and Claude can then work
  with the Figma MCP server without asking that member to authorize again.

## Supported clients

- Needs an MCP-capable editor/application (for example: VS Code, Cursor,
  Claude Code).
- Only clients in the [Figma MCP Catalog] are able to connect.
- New MCP client integration: waitlist.

## Permission errors

If resources can't be accessed:

1. Check the file link — must be a valid Figma Design, FigJam, or Figma Make file.
2. Run `whoiami` to confirm the email used for auth and the plans/seat types.
3. Confirm the user belongs to the plan the file belongs to.

## Upgrade paths

- Starter (20/month) → Pro / Organization / Enterprise, with Full or Dev seat.
- View/Collab seat on Org/Enterprise (6/month) → Full or Dev seat.
- Full/Dev seat on Organization (200/day) → Enterprise (600/day).
- Education (200/day) → Organization or Enterprise for higher limits.

Full/Dev seats on Enterprise get the least-limited usage.

## Notes

- Figma reserves the right to change rate limits.
- If evaluating this for the Casa, the practical gating questions are: current
  seat type, target client, auth model, and whether read-heavy usage fits the
  tier or seat before hitting single-digit-per-month limits on View/Collab seats.
