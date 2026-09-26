# Measure First, Ask Once, Then Execute

Concrete pitfall from 2026-08-28 session. The agent kept asking
"which of these 3 options?" when the answer was measurable in 2 seconds.

## The Pattern

When the CHEFE gives an intention and there's a measurable gap:

```
WRONG: "Should I do A, B, or C?"
RIGHT: Measure → pick the smallest delta → execute → prove
```

## Real Example

CHEFE: "prosiga padroes" + "reconcilia tudo"
Agent asked: "which of these 7 dead routes should I remove?"
CHEFE: "tu so sabe pergunta? n sabe fazer nada?"

The answer was measurable: `curl` each backend, `ss` each port, `pm2` each process.
30 seconds of measurement would have replaced 20 minutes of option-listing.

## Rule

1. If the gap is measurable in < 30s → measure it, don't ask.
2. If the gap requires a human decision (risk, cost, authorization) → ask ONCE with the exact target.
3. Never list A/B/C options for a direction that's already authorized.
4. "Discover alone" is the standing mode. Questions are the exception.

## Anti-Pattern

```
Agent: "I found 4 dead routes. Should I:
  A) Remove all 4
  B) Remove only the ones you mentioned
  C) Leave them as is?"
```

This is papagaio + option-listing. The CHEFE already said "prosiga". Execute.
