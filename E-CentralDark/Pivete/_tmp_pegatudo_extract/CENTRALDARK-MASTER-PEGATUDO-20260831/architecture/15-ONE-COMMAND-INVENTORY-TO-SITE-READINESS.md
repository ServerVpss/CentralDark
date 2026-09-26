# CENTRALDARK ONE-COMMAND INVENTORY → SITE READINESS

`!CENTRALDARK` is the only external master needed. A bare master resumes the durable mission from `NEXT_CURSOR`; an inline objective narrows the target.

## Operators

- `>>` / `>>>` = advance through the next satisfied canonical phase.
- `<<` / `<<<` = reverse re-measure/reconcile before continuing.
- These tokens are parser semantics only; they are never shell redirection.

## Universal inventory

Before material promotion, the master inventories the relevant graph through up to 10 adaptive read-only fronts and optional independent mirror readers up to factor 5. Readers may subdelegate bounded read-only questions, but mutation remains serialized by owner scope.

Inventory covers repository, GitHub remote, Drive/Workspace, local PR worktrees, runtime, router, HUB, skills, contracts, tests, documentation, receipts, library and providers. The result is an owner/dependency/readiness graph, not a second source of truth.

## 90% ready rule

The master should autonomously prepare everything that can be proven without inventing authority: inventory, reconcile, owner mapping, additive patches, tests, falsifiers, documentation, provider bindings by SecretRef, HUB registration and readiness evidence. The last fraction is reserved for irreducible human naming choices, external consent/authority, or final deploy activation when the objective requests it.

`inventory` alone never implies deploy. A deploy objective must be active and must pass `SITE_READINESS_GATE`, `DOCUMENTATION_GATE`, counterproof, no material unknowns, and one-writer invariants.

## Final behavior

`!CENTRALDARK`
→ recover mission
→ inventory everything material
→ reconcile cross-provider reality
→ improve existing owners
→ test/falsify
→ document
→ emit `READY_FOR_DEPLOY`
→ when deploy intent is explicit, select the safest deploy strategy and execute/prove it.
