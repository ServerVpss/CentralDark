/**
 * spawnHelpers — sidecar-level wiring tests for writeDangerousCommandGate.
 *
 * This test file closes the coverage gap called out in the portability-backlog
 * review: dangerousCommand.test.ts:17 previously claimed "wiring into the
 * PreToolUse hook is tested via spawnHelpers" but no such test existed.
 *
 * What this covers (the seam the review demanded):
 *  (a) writeDangerousCommandGate writes a gate .mjs to disk — the file exists
 *      and contains the expected gate source (OPT-IN payload).
 *  (b) blockMode=false (warn-only) vs blockMode=true (hard block) are reflected
 *      in the written source — the runtime behaviour differs at the seam.
 *  (c) permanentAllowlist is serialised into the written source.
 *  (d) The OPT-IN ABSOLUTE contract: WorkspaceConfigStore.get() returns
 *      dangerousCommandGate=null by default (no workspace.json) — confirming
 *      the guard `dcCfg !== null` in core.ts correctly skips the hook push
 *      for any workspace that has not opted in.
 *
 * What is intentionally NOT tested here (integration-only surface):
 *  - The full core.ts buildSpawnConfig closure that calls workspaceConfigStore.get()
 *    and conditionally calls writeDangerousCommandGate — that branch requires
 *    standing up the full sidecar HTTP server + pane spawn pipeline.
 *  - The runtime node execution of the gate .mjs (subprocess I/O).
 *
 * OPT-IN ABSOLUTE RULE: absent workspace config => no gate hook is pushed.
 * That invariant is asserted by (d) combined with the guard comment in core.ts.
 */
export {};
//# sourceMappingURL=spawnHelpers.test.d.ts.map