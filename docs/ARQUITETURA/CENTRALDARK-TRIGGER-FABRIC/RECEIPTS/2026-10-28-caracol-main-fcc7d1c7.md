# CARACOL — proof on main fcc7d1c7 (2026-10-28)

- Scope: read-only verification of existing CARACOL and Loop Mestre owners. No second router, runner, skill or graph authority.
- Before tests: `main` HEAD = `fcc7d1c73b3615e1cd46ef51b6fbaea1ab1584db`, equal to `origin/main`; working tree clean.
- `python scripts/trigger-fabric/spiral_traversal.py --self-test`: `PASS`, exit 0; negative duplicate test blocks; forward/reverse same denominator; nucleus tail proven.
- `python scripts/trigger-fabric/spiral_traversal.py --repo-root . --source repo --compact`: `PASS`, exit 0; denominator 16676; forward visited 16676, reverse visited 16676; forward/reverse missing and extra empty; 2 rounds each; semantic edges created 0; traversal SHA256 `d7607c119561c056dea5d5152b4690dd69bbcc386675f243361c4e249145975b`.
- `python -m unittest scripts.trigger-fabric.test_centraldark_master_cycle`: 36 tests, `OK` (the test runner output was read back).
- Verdict: `CARACOL_FUNCTIONAL_PROVEN_ON_MAIN_fcc7d1c7` (repo traversal and owner test scope only). `GOAL_DONE=NOT_PROVEN`; no change to Hermes paused Goal. No claim that unrelated repository-wide contract gates, frontend TypeScript, or live Cockpit deployment pass.
- NEXT_CURSOR: consume this receipt through existing Cockpit/receipt lane, then isolate existing unrelated gate failures under their current owners. Revalidate only if applicable contract, environment or proof key changed.