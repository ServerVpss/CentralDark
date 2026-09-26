---
name: meta-lupa-checkout-pattern
description: "Meta-lupa missing? Check sol checkout."
---

## Trigger
Meta-lupa / autolupa required but `.agents/skills/meta-lupa/` missing from workspace root.

## Discovery steps
1. Confirm workspace root has no `.agents/`.
2. Search `sol/01-FONTES/CentralDark-C-CHECKOUT-20260830/.agents/skills/meta-lupa/` for `SKILL.md` and `AUTOLUPA_CANONICAL_SHA`.
3. Read `SKILL.md` from checkout path.
4. Prove with short excerpt.

## Pitfalls
- Partial checkout: absence at root does not mean absence overall.
- Load from file; never invent content.

## References
- `sol/01-FONTES/CentralDark-C-CHECKOUT-20260830/.agents/skills/meta-lupa/SKILL.md`
- `sol/01-FONTES/CentralDark-C-CHECKOUT-20260830/.agents/skills/meta-lupa/AUTOLUPA_CANONICAL_SHA`
