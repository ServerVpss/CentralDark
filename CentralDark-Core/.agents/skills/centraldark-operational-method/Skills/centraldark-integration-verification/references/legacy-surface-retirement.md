# Retiring a legacy surface safely

Use this recipe when an old file was temporary but still appears in gates or tests.

1. Measure the canonical checkout first: `git status --short --branch`, `git rev-parse HEAD`, and `git rev-parse origin/main`. Preserve dirty work owned by another writer; do not reset or normalize it blindly.
2. Identify the existing runtime owner and prove it in code (import/export, route, handler, or rendered consumer). Do not create a replacement owner.
3. Inventory legacy capabilities in a structured snapshot. Treat the snapshot as an inventory, not functional parity proof.
4. Migrate every operational reader—boot gates, afterburners, tests, scripts—to the owner or to a snapshot plus a fixed Git blob for historical-origin checks. Never leave a hidden runtime read of the legacy file.
5. Preserve provenance explicitly: keep the legacy path only as `legacy_source`/history metadata, never as an active runtime requirement.
6. Compare text artifacts with normalized line endings when the only difference is CRLF versus LF; report the normalization and do not rewrite the legacy artifact merely to force matching hashes.
7. Remove the legacy file only after all readers are migrated and owner tests pass. Then run syntax, focused tests, `git diff --check`, and the applicable build/lint commands.
8. Report local source proof separately from functional parity, runtime readback, deployment, and VPS promotion. A local owner gate can pass while parity remains `UNKNOWN` or `BLOCKED`.

Pitfalls:
- Do not call an adapter, snapshot, documentation page, or healthy endpoint an integration without a causal consumer and readback.
- Do not infer an Obsidian or other user-home path; use an explicit configured mirror only, because inferred paths turn optional mirrors into hidden runtime dependencies.
- Do not declare full parity when the inventory marks migration as unproven; preserve the exact missing capability and next cursor.
- Keep historical Git-blob checks separate from current owner checks; the former prove provenance, not current behavior.
