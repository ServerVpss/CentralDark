export { savedPaneSquadFields } from '@overclock-app/core';
/**
 * squadSpawnGateError — pure decision extracted from the bridge.squadSpawn closure.
 *
 * The closure in sidecar/core.ts (around line 3819) reads configs.get(callerPaneId)
 * and calls shouldBlockSquadPaneSpawn.  Extracting that decision here makes the
 * gate testable without standing up the full sidecar HTTP server or configs Map.
 *
 * Returns the error message string if the caller is blocked, null if allowed.
 * The handler throws when this returns non-null.
 *
 * Rules (mirrors shouldBlockSquadPaneSpawn):
 * - callerCfg undefined → null (no callerPaneId / UI bootstrap path)
 * - delegateOnly:true → error (must use agent_invoke, not squad_spawn)
 * - leaf:true → error (depth-cap: leaf cannot bootstrap a new orchestrator)
 * - any other squad member (cinema/absurd orchestrator) → null (allowed)
 */
export declare function squadSpawnGateError(callerCfg: {
    delegateOnly?: boolean;
    leaf?: boolean;
} | undefined): string | null;
/**
 * resolvePersistedSquadFlags — pure extraction of the delegateOnly/leaf persistence
 * logic inside buildSpawnConfig (core.ts).
 *
 * These two fields are opt-in: absent from SpawnInput → they must be absent from
 * the stored SidecarPaneConfig so legacy/avulso panes are byte-identical.
 *
 * delegateOnly MUST be persisted so the pane_spawn bridge gate
 * (shouldBlockSquadPaneSpawn) can read configs.get(callerPaneId).delegateOnly.
 * Without persistence the gate is always a no-op for piloto/chefe panes:
 * configs.get(paneId).delegateOnly is always undefined and
 * shouldBlockSquadPaneSpawn returns false.
 *
 * leaf MUST be persisted so the CLI-agnostic depth-cap gate in
 * spawnIsolatedAgent can read callerCfg.leaf for any CLI.
 */
export declare function resolvePersistedSquadFlags(input: {
    delegateOnly?: boolean;
    leaf?: boolean;
}): {
    delegateOnly?: true;
    leaf?: true;
};
/**
 * buildSpawnInputSquadOverrides — maps the opt-in squad flags from SpawnPaneRequest
 * to the optional SpawnInput spread used in bridgeDeps.spawnPane (core.ts).
 *
 * Extracted from the closure so the forwarding contract is unit-testable.
 * Each field is included only when truthy — absent/false must not appear in
 * the spread so avulso (non-squad) panes are byte-identical to the pre-squad path.
 *
 * P2 fix: `leaf` was previously absent from the inline spread in spawnPane,
 * meaning a pane_spawn call with leaf:true silently dropped the flag — buildSpawnConfig
 * never received it and the Claude tool-strip never ran for that pane.
 */
export declare function buildSpawnInputSquadOverrides(req: {
    delegateOnly?: boolean;
    leaf?: boolean;
}): {
    delegateOnly?: true;
    leaf?: true;
};
/**
 * needsHandoffEnforcement — decides whether a pane gets the PostToolUse+Stop handoff
 * hooks (writeHandoffEnforcementHooks) in buildSpawnConfig.
 *
 * F-037: keying on requireHandoff alone left every pane_spawn worker without the Stop
 * hook — the pane_spawn tool schema has no requireHandoff field and the bridge never
 * set it, so a worker could declare "done" in its own terminal and idle while the
 * orchestrator waited forever. Any pane with a callerPaneId has a caller blocked on
 * handoff_submit, so the caller's presence alone must arm the enforcement.
 *
 * Deliberately does NOT set requireHandoff:true for these panes: that flag also drives
 * --strict-mcp-config and the slim squad system prompt in buildClaudeSpawnArgs —
 * collateral a pane_spawn worker must not inherit. Only the hooks are keyed here.
 */
export declare function needsHandoffEnforcement(input: {
    requireHandoff?: boolean;
    callerPaneId?: string;
}): boolean;
//# sourceMappingURL=squadPersistFields.d.ts.map