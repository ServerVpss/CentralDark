---
name: centraldark-consolidated-inventory
description: Inventory consolidated areas mapa-canonico.json read-only.
version: 1.0
---
# CentralDark Consolidated Inventory

Perform a read‑only inventory of the consolidated areas listed in `apps/modulos/mapeamento/config/mapa-canonico.json`. Classify each item as TRACKED, ABSENT, GITLINK, UNTRACKED, or EMPTY_DIR, and record its associated canonical contract, validation test, and gate workflow.

## When to use
- Before proposing deterministic contracts or changes to consolidated areas.
- During FASE 1 (read‑only inventory) of the deterministic‑contract workflow.
- To verify that the mapa‑canônico matches the actual repository state.

## Steps
1. Load the map file.
2. For each entry in `consolidated_areas`:
   - Determine status:
     * File: `git ls-files --error-unmatch <path>` → 0 = TRACKED, else = UNTRACKED.
     * Directory: check for gitlink (`160000`), then tracked files, then any untracked files, else EMPTY_DIR.
     * If path does not exist → ABSENT.
   - Assign contract, test, and gate metadata from the map (canonical_contracts section) or fallback defaults.
3. Emit a Markdown table with columns: `| Area | Path | Since | Status | Contract | Test | Gate |`.
4. Optionally run the map validation script to confirm consistency.

## Outputs
- A Markdown table ready for inclusion in documentation or a card.
- No file modifications; operation is read‑only.

## Notes
- Treat `ABSENT` items marked as "Material sensível proibido no Git" as expected; otherwise investigate.
- `GITLINK` indicates a submodule; its content is tracked via the gitlink entry.
- This inventory is a prerequisite for defining deterministic contracts: only items that are TRACKED (or expected ABSENT/GITLINK) can be turned into a closed‑loop contract with test and gate.

## Related skills
- `centraldark-pr` – for PR workflows once contracts are defined.
- `meta-lupa` – for final verification of any proposed changes.
- `hermes-agent` – for configuring the Hermes agent if automation is needed later.