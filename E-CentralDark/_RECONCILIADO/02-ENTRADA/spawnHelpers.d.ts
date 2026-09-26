/**
 * spawnHelpers.ts — sidecar-side equivalents of the Electron bootstrap FS side effects
 * that buildClaudeSpawnArgs (from @overclock-app/core) intentionally does NOT perform:
 *
 *   - writeClaudeSkillGate     — the per-pane PreToolUse skill/tool gate .mjs (HARD enforcement)
 *   - writeHandoffEnforcementHooks — the PostToolUse marker + Stop blocker for squad workers
 *   - ensureSkillsForCli       — mirror a member's bound skills into its CLI's skill dir
 *   - workspaceAccessInstruction — the workspace access policy prompt
 *
 * These are byte-identical ports of bootstrapMainProcess.ts (~318-366, ~434-465, ~2901-2954),
 * with GLOBAL_DIR replaced by the sidecar's dataDir (the host controls where files land — exactly
 * the contract buildClaudeSpawnArgs documents). The gate .mjs SOURCE STRING is identical so the
 * runtime behaviour matches Electron; only the file location differs.
 *
 * VERIFY RULE 5: the gate hook command is `node ${JSON.stringify(gatePath)}` — it requires `node`
 * on the spawned claude pane's PATH. The sidecar PTY inherits the sidecar process env (PtyManager
 * merges `process.env`), so the gate runs iff the sidecar's PATH contains node. Under a Finder/Dock
 * GUI launch that PATH would otherwise be minimal (no /usr/local/bin, /opt/homebrew/bin, nvm/volta),
 * so the Tauri shell augments it before spawning the sidecar: src-tauri/src/lib.rs `augment_child_path()`
 * (called at `spawn_sidecar`, `cmd.env("PATH", augment_child_path())`) prepends the standard node
 * locations cross-platform (macOS/Linux: homebrew + npm-global/volta/nvm/bun; Windows: APPDATA\\npm,
 * Program Files\\nodejs, etc.). The augmented PATH rides process.env → the PTY child (claude) → the
 * hook child. The gate is therefore NOT a silent no-op under GUI launch.
 */
import type { WorkspaceConfigStore } from '@overclock-app/core';
/**
 * F-067: per-instance home for ALL per-pane artifacts (mcp-pane-*.json + gate/hook/marker files).
 * Dev and prod share the same dataDir (~/.overclock-app — F-054, dataDir split still pending), so
 * two live sidecars were writing/boot-cleaning each other's pane files: a dev restart deleted the
 * prod panes' MCP configs and colliding pane-N ids swapped configs across instances — which is how
 * a spawned child lost its caller's providerId and fell back to the global default account.
 * Same per-identity recipe as F-010 (mcp-port.dev) / F-017 (panes.dev.json), as a subdir because
 * the artifact set spans several name shapes (json/mjs/extensionless markers) matched by prefix.
 * Prod keeps writing directly into dataDir — no migration for existing installs.
 */
export declare function paneFilesDir(dataDir: string, isDev?: boolean): string;
/**
 * Per-pane PreToolUse gate — HARD-blocks skills/tools outside the agent whitelist, and (extension)
 * hard-gates media generation behind an owner contract skill. Ported from bootstrapMainProcess.ts
 * writeClaudeSkillGate (~318-366) — same skill/tool whitelist behaviour — plus the media-contract
 * gate: when `requiredSkillsForMedia` is set, loading one of those skills writes a marker, and a
 * media-generation tool (image/video/audio) is denied until every required marker exists. The gate
 * file lands in `gateDir` (sidecar dataDir) instead of GLOBAL_DIR.
 * Returns the --settings file path, or null when nothing is restricted.
 */
export declare function writeClaudeSkillGate(gateDir: string, paneId: string, allowedSkills: string[] | null, allowedTools: string[] | null, deniedTools?: string[] | null, requiredSkillsForMedia?: string[] | null): string | null;
/**
 * Per-pane PreResourceUse gate — governs access to MEDIA RESOURCES (image/video/audio providers
 * and their API keys). This is a SEPARATE concept from the skill/tool gate above: that one decides
 * which of the hundreds of generic tools/skills a pane may call; THIS one has a single, narrow job —
 * keep all media generation INSIDE the sanctioned overclock_*_generate tools, where the squad's
 * provider allowlist and cost policy are enforced.
 *
 * A pane runs as the user with a real shell, so a Bash-capable agent can bypass the MCP tool two
 * ways: (1) read the plaintext service-keys store and lift a provider key, (2) curl the provider API
 * host directly. Both routes escape the allowlist / Seedance-only / cost controls entirely. This gate
 * is a PreToolUse hook (the only Bash interception point) that denies exactly those two patterns and
 * tells the agent to route through the tool — and, on failure, to surface the gap instead of swapping
 * engines. Returns the gate .mjs path.
 */
export declare function writeResourceGate(gateDir: string, paneId: string): string;
/**
 * Per-pane PreToolUse dangerous-command gate — screens Bash tool_input.command
 * against the DANGEROUS_PATTERNS catalog before execution.
 *
 * OPT-IN ABSOLUTE: absent config the gate is warn-only (exits 0 even when a
 * pattern matches, so behaviour is identical to today). Hard-block mode is only
 * enabled when the caller explicitly sets blockMode=true via WorkspaceConfig.
 *
 * Returns the .mjs gate path written into gateDir.
 */
export declare function writeDangerousCommandGate(gateDir: string, paneId: string, permanentAllowlist: string[], blockMode: boolean): string;
/**
 * PreToolUse DENY gate for the Workflow tool on delegation chefes.
 *
 * Targets: delegateOnly + requireHandoff panes — sub-level chefes whose job is to
 * delegate via overclock_agent_invoke (visible panes). They must NOT use the Claude Code
 * Workflow tool, which spawns invisible background agents and violates AGENTS.md's
 * visible-delegation principle. The gate is the hard enforcement; PROSE alone failed
 * (Run4 chefe used Workflow → 5 invisible agents → no audit trail).
 *
 * Top-level orchestrators (delegateOnly but NO requireHandoff) are NOT blocked.
 * Leaf workers (requireHandoff but NOT delegateOnly) are NOT blocked.
 */
export declare function writeWorkflowDenyGate(gateDir: string, paneId: string): string;
/**
 * Squad worker handoff enforcement hooks. Byte-identical to bootstrapMainProcess.ts
 * writeHandoffEnforcementHooks (~434-465), except files land in `gateDir`.
 * Returns the PostToolUse + Stop hook .mjs paths.
 */
export declare function writeHandoffEnforcementHooks(gateDir: string, paneId: string): {
    post: string;
    stop: string;
};
/**
 * Extract the numeric suffix of a `pane-<N>` id. Returns null for any other id shape (browser /
 * tmux / remote ids that aren't `pane-<int>`), so a mixed id set can be fed to nextPaneId safely.
 */
export declare function paneIdNumber(id: string): number | null;
/**
 * F-008: allocate the next unique pane id. paneSeq is process-local and resets to 0 on every
 * sidecar restart, so a raw `pane-${++seq}` re-emits the ids of panes RESUMED from panes.json as
 * the counter climbs — clobbering the live caller (pane_write lands in the wrong pane), overwriting
 * a restorable panes.json entry, and making the new pane inherit the dead homonym's token telemetry
 * (keyed `pane:<id>`). This returns an id STRICTLY greater than both the running counter and every
 * id still in play, so the result is unique among live panes; combined with a persisted high-water
 * seed for `seq` it also never reuses a number from a prior session (no telemetry inheritance, no
 * restorable-entry clobber).
 */
export declare function nextPaneId(seq: number, used: Iterable<number>): {
    id: string;
    seq: number;
};
/**
 * Deterministic cross-CLI skill availability — byte-identical logic to bootstrap
 * ensureSkillsForCli (~2901-2926): mirror each bound skill from whichever CLI root
 * has it into the member's own CLI skill dir (symlink, fallback recursive copy).
 */
export declare function ensureSkillsForCli(cli: string | undefined, skills: string[] | null | undefined): void;
/**
 * Workspace access policy prompt — byte-identical to bootstrap workspaceAccessInstruction
 * (~2928-2954). `globalDir` is the sidecar dataDir (the GLOBAL_DIR equivalent: a workspace
 * equal to it yields ''). Reads the workspace access mode via the shared WorkspaceConfigStore.
 */
export declare function workspaceAccessInstruction(workspacePath: string, globalDir: string, workspaceConfigStore: WorkspaceConfigStore): string;
//# sourceMappingURL=spawnHelpers.d.ts.map