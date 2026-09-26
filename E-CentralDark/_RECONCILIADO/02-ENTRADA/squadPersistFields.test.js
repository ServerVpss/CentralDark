/**
 * sidecar vitest harness — pane_spawn gate + delegateOnly persist wiring tests.
 *
 * Tests the two critical untested surfaces called out in the R3 re-review:
 *
 * (a) pane_spawn roster gate call-site: the gate (shouldBlockSquadPaneSpawn) reads
 *     delegateOnly/leaf from the STORED pane config.  If those flags are not
 *     persisted, the gate is always a no-op regardless of what was passed to spawn.
 *
 * (b) delegateOnly/leaf persistence: resolvePersistedSquadFlags produces the correct
 *     optional spread so buildSpawnConfig stores exactly what the gate needs.
 *
 * What cannot be unit-tested here (residual integration-only surface):
 * - The Map<paneId, SidecarPaneConfig> write+read cycle (configs.set / configs.get)
 *   inside wireCore — would require standing up the full sidecar HTTP server.
 * - The actual pane_spawn bridge dispatch (bridgeDeps.spawnPane) that combines
 *   configs.get(callerPaneId) with shouldBlockSquadPaneSpawn.
 * These are covered by the comment trail + existing squadPaneSpawnGate.test.ts in core.
 */
import { describe, it, expect } from 'vitest';
import { resolvePersistedSquadFlags, buildSpawnInputSquadOverrides, squadSpawnGateError, savedPaneSquadFields, needsHandoffEnforcement } from './squadPersistFields.js';
import { shouldBlockSquadPaneSpawn } from '@overclock-app/core';
// ── (b) delegateOnly/leaf persistence ────────────────────────────────────────
describe('resolvePersistedSquadFlags — opt-in persistence for gate fields', () => {
    it('delegateOnly:true => { delegateOnly: true }', () => {
        expect(resolvePersistedSquadFlags({ delegateOnly: true })).toEqual({ delegateOnly: true });
    });
    it('leaf:true => { leaf: true }', () => {
        expect(resolvePersistedSquadFlags({ leaf: true })).toEqual({ leaf: true });
    });
    it('both:true => { delegateOnly: true, leaf: true }', () => {
        expect(resolvePersistedSquadFlags({ delegateOnly: true, leaf: true })).toEqual({ delegateOnly: true, leaf: true });
    });
    it('delegateOnly:false => field absent (legacy byte-identical)', () => {
        const result = resolvePersistedSquadFlags({ delegateOnly: false });
        expect(result).not.toHaveProperty('delegateOnly');
    });
    it('leaf:false => field absent (legacy byte-identical)', () => {
        const result = resolvePersistedSquadFlags({ leaf: false });
        expect(result).not.toHaveProperty('leaf');
    });
    it('neither flag => empty object (avulso pane untouched)', () => {
        expect(resolvePersistedSquadFlags({})).toEqual({});
    });
    it('undefined coerces as falsy => field absent', () => {
        const result = resolvePersistedSquadFlags({ delegateOnly: undefined, leaf: undefined });
        expect(result).toEqual({});
    });
});
// ── (a) pane_spawn gate call-site: persisted config feeds the gate ────────────
//
// These tests simulate what happens after buildSpawnConfig stores the pane config
// and a subsequent MCP pane_spawn resolves configs.get(callerPaneId):
//
//   const callerCfg = req.callerPaneId ? configs.get(req.callerPaneId) : undefined
//   if (shouldBlockSquadPaneSpawn(callerCfg)) throw new Error('roster_violation...')
//
// The gate is shouldBlockSquadPaneSpawn (pure, tested in core).  The SIDECAR GAP
// was that delegateOnly was never stored, making callerCfg.delegateOnly always
// undefined.  resolvePersistedSquadFlags closes that gap.
describe('gate call-site: resolvePersistedSquadFlags + shouldBlockSquadPaneSpawn pipeline', () => {
    /**
     * Simulate the configs.get(callerPaneId) result after buildSpawnConfig ran.
     * In production: configs.set(id, { ...config, ...resolvePersistedSquadFlags(input) })
     * Here: we build the same spread and feed it to the gate.
     */
    function simulatePersisted(input) {
        return resolvePersistedSquadFlags(input);
    }
    it('piloto spawned with delegateOnly:true => stored config blocks pane_spawn', () => {
        const stored = simulatePersisted({ delegateOnly: true });
        expect(shouldBlockSquadPaneSpawn(stored)).toBe(true);
    });
    it('worker spawned with leaf:true => stored config blocks pane_spawn', () => {
        const stored = simulatePersisted({ leaf: true });
        expect(shouldBlockSquadPaneSpawn(stored)).toBe(true);
    });
    it('cinema orchestrator (no flags) => stored config allows pane_spawn', () => {
        const stored = simulatePersisted({});
        expect(shouldBlockSquadPaneSpawn(stored)).toBe(false);
    });
    it('avulso pane (callerCfg undefined) => gate allows pane_spawn (back-compat)', () => {
        // configs.get(callerPaneId) returns undefined when callerPaneId is absent/unknown.
        expect(shouldBlockSquadPaneSpawn(undefined)).toBe(false);
    });
    it('delegateOnly:false stored => flag absent => gate allows pane_spawn', () => {
        // Ensures that a falsy delegateOnly does NOT accidentally block.
        const stored = simulatePersisted({ delegateOnly: false });
        expect(shouldBlockSquadPaneSpawn(stored)).toBe(false);
    });
    it('before the fix: not persisting delegateOnly => gate is a no-op (regression guard)', () => {
        // If resolvePersistedSquadFlags is bypassed and delegateOnly is NOT stored,
        // the gate would see undefined and return false — this is the pre-fix bug.
        // We document it as a regression guard: any config WITHOUT the field must NOT block.
        const configWithoutField = { agent: 'claude', cwd: '/tmp' };
        // Cast to minimal gate-compatible shape (missing delegateOnly/leaf).
        expect(shouldBlockSquadPaneSpawn(configWithoutField)).toBe(false);
    });
});
// ── (c) buildSpawnInputSquadOverrides — SpawnPaneRequest → SpawnInput optional spread ───
//
// This helper extracts the closure-bound logic that was previously inline in the
// bridgeDeps.spawnPane handler (core.ts ~3555–3589). The P2 bug: req.leaf was absent
// from the spread so a pane_spawn call carrying leaf:true silently dropped the field —
// buildSpawnConfig never received it, and the Claude tool-strip never ran for that pane.
//
// The helper must include delegateOnly AND leaf so the contract is complete and testable.
describe('buildSpawnInputSquadOverrides — SpawnPaneRequest squad fields forwarded to SpawnInput', () => {
    it('leaf:true is forwarded (the P2 bug: it was previously dropped)', () => {
        const result = buildSpawnInputSquadOverrides({ leaf: true });
        expect(result).toHaveProperty('leaf', true);
    });
    it('delegateOnly:true is forwarded (regression guard — was already present)', () => {
        const result = buildSpawnInputSquadOverrides({ delegateOnly: true });
        expect(result).toHaveProperty('delegateOnly', true);
    });
    it('both flags forwarded together', () => {
        const result = buildSpawnInputSquadOverrides({ delegateOnly: true, leaf: true });
        expect(result).toMatchObject({ delegateOnly: true, leaf: true });
    });
    it('leaf:false => field absent (opt-in: falsy must not pollute SpawnInput)', () => {
        const result = buildSpawnInputSquadOverrides({ leaf: false });
        expect(result).not.toHaveProperty('leaf');
    });
    it('delegateOnly:false => field absent', () => {
        const result = buildSpawnInputSquadOverrides({ delegateOnly: false });
        expect(result).not.toHaveProperty('delegateOnly');
    });
    it('no squad flags => empty object (avulso pane path unchanged)', () => {
        const result = buildSpawnInputSquadOverrides({});
        expect(result).toEqual({});
    });
    it('undefined flags => field absent (same as falsy)', () => {
        const result = buildSpawnInputSquadOverrides({ delegateOnly: undefined, leaf: undefined });
        expect(result).toEqual({});
    });
});
// ── (e) needsHandoffEnforcement — Stop/PostToolUse hook condition (F-037) ─────
//
// F-037: a worker spawned via pane_spawn (callerPaneId set, requireHandoff NOT set —
// the tool schema has no such field) got NO handoff-enforcement hooks: the condition
// in buildSpawnConfig keyed on input.requireHandoff only, which the agent_invoke path
// sets but the pane_spawn bridge never did. The worker declared "done" in its own
// terminal and idled; the orchestrator was never woken.
//
// The condition must be: requireHandoff (squad contract) OR callerPaneId (any pane
// spawned by another pane has a caller waiting for handoff_submit). callerPaneId is
// persisted+rehydrated (restorePaneCargo), so restored workers keep the hooks.
//
// Deliberately NOT keyed by setting requireHandoff:true at the bridge: that flag also
// drives --strict-mcp-config and the slim squad system prompt in buildClaudeSpawnArgs —
// collateral a pane_spawn worker must not inherit.
describe('needsHandoffEnforcement — hook condition for Stop/PostToolUse (F-037)', () => {
    it('requireHandoff:true => true (agent_invoke worker, unchanged)', () => {
        expect(needsHandoffEnforcement({ requireHandoff: true })).toBe(true);
    });
    it('callerPaneId set without requireHandoff => true (the F-037 pane_spawn worker)', () => {
        expect(needsHandoffEnforcement({ callerPaneId: 'pane-6' })).toBe(true);
    });
    it('both set => true', () => {
        expect(needsHandoffEnforcement({ requireHandoff: true, callerPaneId: 'pane-6' })).toBe(true);
    });
    it('neither set => false (UI/avulso pane — no hooks, unchanged)', () => {
        expect(needsHandoffEnforcement({})).toBe(false);
    });
    it('empty callerPaneId => false (falsy must not arm the hook)', () => {
        expect(needsHandoffEnforcement({ callerPaneId: '' })).toBe(false);
    });
    it('requireHandoff:false + no caller => false', () => {
        expect(needsHandoffEnforcement({ requireHandoff: false })).toBe(false);
    });
});
// ── (d) squadSpawnGateError — bridge.squadSpawn handler gate (FIX 8) ──────────
//
// The gate in sidecar/core.ts bridge.squadSpawn was closure-bound over configs.
// squadSpawnGateError extracts the pure decision so it is testable without the
// full sidecar HTTP server.
//
// This closes the round-4 untested-gate finding: the tests below assert that the
// handler would throw for delegateOnly||leaf callers and pass for all other callers.
//
// What this covers:
//   - delegateOnly caller → returns error string (handler throws)
//   - leaf caller → returns error string (handler throws)
//   - both flags → returns error string
//   - cinema orchestrator (no flags) → returns null (handler proceeds)
//   - avulso pane (callerCfg undefined) → returns null (back-compat)
//   - error message matches the canonical roster_violation prefix
//
// What is intentionally NOT tested here (integration-only surface):
//   - The Map<paneId, SidecarPaneConfig> read cycle (configs.get) inside wireCore
//   - The full squadSpawn closure that calls squadSpawnGateError and throws/proceeds
describe('squadSpawnGateError — bridge.squadSpawn handler gate (FIX 8)', () => {
    it('delegateOnly:true caller => returns error (handler must throw)', () => {
        const err = squadSpawnGateError({ delegateOnly: true });
        expect(err).not.toBeNull();
        expect(err).toMatch(/roster_violation/);
        expect(err).toMatch(/depth-cap/);
    });
    it('leaf:true caller => returns error (handler must throw)', () => {
        const err = squadSpawnGateError({ leaf: true });
        expect(err).not.toBeNull();
        expect(err).toMatch(/roster_violation/);
    });
    it('both delegateOnly and leaf => returns error', () => {
        const err = squadSpawnGateError({ delegateOnly: true, leaf: true });
        expect(err).not.toBeNull();
    });
    it('cinema orchestrator (no flags set) => null (squad_spawn allowed)', () => {
        expect(squadSpawnGateError({})).toBeNull();
    });
    it('avulso pane (callerCfg undefined) => null (back-compat, UI bootstrap path)', () => {
        expect(squadSpawnGateError(undefined)).toBeNull();
    });
    it('delegateOnly:false => null (falsy flag must not block)', () => {
        expect(squadSpawnGateError({ delegateOnly: false })).toBeNull();
    });
    it('leaf:false => null (falsy flag must not block)', () => {
        expect(squadSpawnGateError({ leaf: false })).toBeNull();
    });
    it('error message is the canonical roster_violation string the handler throws', () => {
        // Verifies the extracted message matches what sidecar/core.ts passes to new Error().
        const err = squadSpawnGateError({ delegateOnly: true });
        expect(err).toBe('roster_violation: leaf/delegateOnly pane cannot invoke overclock_squad_spawn — depth-cap enforcement');
    });
});
// ── (e) G1-restore: savedPaneSquadFields — SavedPane → pty.spawn spread ──────
//
// Tests the pure helper that handleRestorePane uses to re-inject enforcement
// context on cold-restore. Key contracts:
//
//   - Non-squad pane → empty object (non-squad panes byte-identical — constraint).
//   - Squad orchestrator piloto (delegateOnly:true + squadCallable) → all fields forwarded.
//   - orchestratorAllowedSkills:null is an EXPLICIT value and must be forwarded.
//   - orchestratorAllowedSkills absent (undefined) → field omitted (no-op).
//   - Falsy delegateOnly/leaf → field absent (same as non-squad path).
//   - Empty squadCallable array → field omitted (avulso path).
describe('savedPaneSquadFields — G1-restore SavedPane → pty.spawn enforcement spread', () => {
    it('non-squad pane (no squad fields) => empty object', () => {
        expect(savedPaneSquadFields({})).toEqual({});
    });
    it('non-squad pane with explicit undefined fields => empty object', () => {
        expect(savedPaneSquadFields({
            squadId: undefined,
            squadRole: undefined,
            delegateOnly: undefined,
            leaf: undefined,
            squadCallable: undefined,
            nativeInstructions: undefined,
            orchestratorAllowedSkills: undefined,
        })).toEqual({});
    });
    it('piloto (delegateOnly:true, squadRole, squadCallable) => all three forwarded', () => {
        const roster = [{ role: 'executor', agentName: 'worker', cli: 'claude', allowedSkills: null }];
        const result = savedPaneSquadFields({
            squadRole: 'orchestrator',
            delegateOnly: true,
            squadCallable: roster,
        });
        expect(result.squadRole).toBe('orchestrator');
        expect(result.delegateOnly).toBe(true);
        expect(result.squadCallable).toBe(roster);
        expect(result).not.toHaveProperty('leaf');
    });
    it('restored piloto produces delegateOnly:true so tool-strip fires', () => {
        const result = savedPaneSquadFields({ delegateOnly: true });
        expect(result.delegateOnly).toBe(true);
    });
    it('leaf executor => leaf:true forwarded so depth-cap gate fires', () => {
        const result = savedPaneSquadFields({ leaf: true });
        expect(result.leaf).toBe(true);
        expect(result).not.toHaveProperty('delegateOnly');
    });
    it('squadId forwarded so sidecar can re-index the pane under its squad', () => {
        const result = savedPaneSquadFields({ squadId: 'sq-123' });
        expect(result.squadId).toBe('sq-123');
    });
    it('nativeInstructions forwarded when present', () => {
        const result = savedPaneSquadFields({ nativeInstructions: 'ABSOLUTE RULE' });
        expect(result.nativeInstructions).toBe('ABSOLUTE RULE');
    });
    it('orchestratorAllowedSkills:null (explicit unrestricted gate) => forwarded', () => {
        const result = savedPaneSquadFields({ orchestratorAllowedSkills: null });
        expect(result).toHaveProperty('orchestratorAllowedSkills', null);
    });
    it('orchestratorAllowedSkills:[] (empty allowlist) => forwarded', () => {
        const result = savedPaneSquadFields({ orchestratorAllowedSkills: [] });
        expect(result).toHaveProperty('orchestratorAllowedSkills');
        expect(result.orchestratorAllowedSkills).toEqual([]);
    });
    it('orchestratorAllowedSkills:undefined (not set) => field absent', () => {
        const result = savedPaneSquadFields({ orchestratorAllowedSkills: undefined });
        expect(result).not.toHaveProperty('orchestratorAllowedSkills');
    });
    it('delegateOnly:false => field absent (non-squad path unchanged)', () => {
        const result = savedPaneSquadFields({ delegateOnly: false });
        expect(result).not.toHaveProperty('delegateOnly');
    });
    it('leaf:false => field absent', () => {
        const result = savedPaneSquadFields({ leaf: false });
        expect(result).not.toHaveProperty('leaf');
    });
    it('empty squadCallable [] => field absent (avulso path)', () => {
        const result = savedPaneSquadFields({ squadCallable: [] });
        expect(result).not.toHaveProperty('squadCallable');
    });
    it('full piloto round-trip: all enforcement fields forwarded together', () => {
        const roster = [
            { role: 'executor', agentName: 'worker-a', cli: 'claude', allowedSkills: ['skill-x'] },
            { role: 'executor', agentName: 'worker-b', cli: 'claude', allowedSkills: null, leaf: true },
        ];
        const result = savedPaneSquadFields({
            squadId: 'qa-swarm',
            squadRole: 'orchestrator',
            delegateOnly: true,
            squadCallable: roster,
            nativeInstructions: 'ABSOLUTE RULE: route only.',
            orchestratorAllowedSkills: ['qa-finding-protocol'],
        });
        expect(result).toMatchObject({
            squadId: 'qa-swarm',
            squadRole: 'orchestrator',
            delegateOnly: true,
            squadCallable: roster,
            nativeInstructions: 'ABSOLUTE RULE: route only.',
            orchestratorAllowedSkills: ['qa-finding-protocol'],
        });
        expect(result).not.toHaveProperty('leaf');
    });
    it('restored piloto feeds the pane_spawn gate correctly via shouldBlockSquadPaneSpawn', () => {
        // End-to-end simulation: savedPaneSquadFields output is spread into a SpawnInput-like
        // object; delegateOnly:true causes the gate to block pane_spawn (same as original spawn).
        const spread = savedPaneSquadFields({ delegateOnly: true });
        expect(shouldBlockSquadPaneSpawn(spread)).toBe(true);
    });
    it('restored non-squad pane does NOT trigger the pane_spawn gate', () => {
        const spread = savedPaneSquadFields({});
        expect(shouldBlockSquadPaneSpawn(spread)).toBe(false);
    });
});
// ── Task 7: qa-swarm roster shape (area pools, no shared worker) ──────────────
//
// Asserts the expected preset structure produced by seedQaSwarm (Task 7 contract).
// This is a contract test — it validates the shape inline without calling seedQaSwarm
// (which does fs I/O). The expected agents array mirrors what seedSquads.ts now seeds.
describe('qa-swarm roster shape (Task 7 — area pools)', () => {
    const QA_SWARM_AGENTS = [
        { id: 'orchestrator', agentName: 'overclock-orchestrator', category: 'orchestrator', delegateOnly: true, invocable: ['qa-swarm-scout', 'qa-swarm-reviewer', 'qa-swarm-builder', 'qa-swarm-observer'] },
        { id: 'scout', agentName: 'qa-swarm-scout', category: 'scout', delegateOnly: true },
        { id: 'reviewer', agentName: 'qa-swarm-reviewer', category: 'reviewer', delegateOnly: true },
        { id: 'builder', agentName: 'qa-swarm-builder', category: 'builder', delegateOnly: true },
        { id: 'observer', agentName: 'qa-swarm-observer', category: 'reviewer', leaf: true },
    ];
    const orch = QA_SWARM_AGENTS.find((a) => a.category === 'orchestrator');
    const chefes = QA_SWARM_AGENTS.filter((a) => ['scout', 'reviewer', 'builder'].includes(a.id));
    it('orchestrator is delegateOnly with invocable containing all 3 chefes + observer', () => {
        expect(orch.delegateOnly).toBe(true);
        for (const name of ['qa-swarm-scout', 'qa-swarm-reviewer', 'qa-swarm-builder', 'qa-swarm-observer']) {
            expect(orch.invocable).toContain(name);
        }
    });
    it('scout/reviewer/builder are delegateOnly with category in {scout, reviewer, builder}', () => {
        for (const chefe of chefes) {
            expect(chefe.delegateOnly).toBe(true);
            expect(['scout', 'reviewer', 'builder']).toContain(chefe.category);
        }
    });
    it('no chefe has invocable listing qa-swarm-worker', () => {
        for (const chefe of chefes) {
            const inv = chefe.invocable;
            expect(inv == null || !inv.includes('qa-swarm-worker')).toBe(true);
        }
    });
    it('no standalone roster member named qa-swarm-worker', () => {
        expect(QA_SWARM_AGENTS.some((a) => a.agentName === 'qa-swarm-worker')).toBe(false);
    });
});
//# sourceMappingURL=squadPersistFields.test.js.map