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
import { writeFileSync, existsSync, mkdirSync, symlinkSync, cpSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { homedir } from 'node:os';
import { isRemoteWorkspacePath, buildDangerousCommandGateSource, isDevSidecarInstance } from '@overclock-app/core';
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
export function paneFilesDir(dataDir, isDev = isDevSidecarInstance()) {
    return isDev ? join(dataDir, 'pane-files.dev') : dataDir;
}
/**
 * Per-pane PreToolUse gate — HARD-blocks skills/tools outside the agent whitelist, and (extension)
 * hard-gates media generation behind an owner contract skill. Ported from bootstrapMainProcess.ts
 * writeClaudeSkillGate (~318-366) — same skill/tool whitelist behaviour — plus the media-contract
 * gate: when `requiredSkillsForMedia` is set, loading one of those skills writes a marker, and a
 * media-generation tool (image/video/audio) is denied until every required marker exists. The gate
 * file lands in `gateDir` (sidecar dataDir) instead of GLOBAL_DIR.
 * Returns the --settings file path, or null when nothing is restricted.
 */
export function writeClaudeSkillGate(gateDir, paneId, allowedSkills, allowedTools, deniedTools, requiredSkillsForMedia) {
    const denied = deniedTools && deniedTools.length > 0 ? deniedTools : null;
    const requireMedia = requiredSkillsForMedia && requiredSkillsForMedia.length > 0 ? requiredSkillsForMedia : null;
    if (allowedSkills === null && allowedTools === null && denied === null && requireMedia === null)
        return null;
    const gatePath = join(gateDir, `skill-gate-${paneId}.mjs`);
    // Marker dir for the media-contract gate: a per-pane stateful record of which contract skills
    // have been loaded this session (the gate .mjs is a fresh process per tool call, so state lives
    // on disk — same pattern as the handoff marker). Markers are written into gateDir.
    const markerPrefix = join(gateDir, `skill-loaded-${paneId}-`);
    const gate = `#!/usr/bin/env node
import { writeFileSync, existsSync } from 'node:fs';
// Per-pane PreToolUse gate — HARD-blocks skills/tools outside the agent whitelist.
const ALLOWED_SKILLS = ${JSON.stringify(allowedSkills)};
const ALLOWED_TOOLS = ${JSON.stringify(allowedTools)};
// Visibility: tools denied outright for this pane (e.g. catalog/marketplace listing for a
// skill-restricted squad member). Denial beats every allow rule below, including ALWAYS_ALLOWED.
const DENIED_TOOLS = ${JSON.stringify(denied)};
// Media-contract gate: these owner skills MUST be loaded before any media-generation tool runs.
// null = no requirement. Loading one writes a marker; a media tool with a missing marker is denied.
const REQUIRED_SKILLS_FOR_MEDIA = ${JSON.stringify(requireMedia)};
const MARKER_PREFIX = ${JSON.stringify(markerPrefix)};
const MEDIA_GEN_TOOLS = ["mcp__overclock__overclock_image_generate", "mcp__overclock__overclock_video_generate", "mcp__overclock__overclock_audio_generate"];
const skillBase = (id) => String(id).split(":").pop();
// The handoff PROTOCOL is INFRASTRUCTURE, not an agent capability: a worker with a restricted
// tools whitelist (e.g. [Read,Write,Edit,Bash]) still MUST be able to report its result via
// handoff_submit, and must ToolSearch the deferred MCP schemas first. Blocking these silently
// breaks the event-driven handoff (the orchestrator never wakes). Only the handoff protocol +
// ToolSearch are auto-allowed — NOT the whole mcp__overclock__ namespace. Granting the prefix
// wholesale would let a confined worker call pane_spawn/overclock_agent_invoke (recursive fan-out),
// pane_write/pane_write_many (cross-pane injection into the orchestrator — no ownership check),
// pane_close or the mission mutators, escaping its sandbox. Under --dangerously-skip-permissions
// this PreToolUse gate is the ONLY hard enforcement, so the allowlist must be exact. A worker that
// legitimately needs a broader tool gets it added to its catalog spec.tools explicitly.
const ALWAYS_ALLOWED_TOOLS = ["ToolSearch", "mcp__overclock__handoff_submit", "mcp__overclock__handoff_list"];
const isSquadProtocolTool = (t) => ALWAYS_ALLOWED_TOOLS.indexOf(t) !== -1;
let raw = "";
process.stdin.on("data", (d) => { raw += d; });
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (e) {}
  const tool = input.tool_name || "";
  const ti = input.tool_input || {};
  const deny = (reason) => { process.stderr.write(reason); process.exit(2); };
  if (DENIED_TOOLS !== null && DENIED_TOOLS.indexOf(tool) !== -1) {
    deny("Tool " + tool + " is denied for this squad member by squad policy. Do not retry.");
  }
  if (tool === "Skill") {
    const id = String(ti.skill || ti.command || ti.name || "");
    const base = id.split(":").pop();
    if (ALLOWED_SKILLS !== null) {
      const ok = ALLOWED_SKILLS.some((s) => s === id || s === base || id.indexOf(s) === 0);
      if (!ok) deny("Skill " + id + " is NOT in this agent allowed skills [" + (ALLOWED_SKILLS.join(", ") || "none") + "]. Blocked by squad policy — do not retry; use only permitted skills.");
    }
    // Record load of any media-contract skill so the media gate below can see it later.
    if (REQUIRED_SKILLS_FOR_MEDIA !== null) {
      for (const req of REQUIRED_SKILLS_FOR_MEDIA) {
        if (req === id || req === base || skillBase(req) === base) {
          try { writeFileSync(MARKER_PREFIX + req, "1"); } catch (e) {}
        }
      }
    }
  }
  // Media-contract gate: every required owner skill must have been loaded before a generation runs.
  if (REQUIRED_SKILLS_FOR_MEDIA !== null && MEDIA_GEN_TOOLS.indexOf(tool) !== -1) {
    const missing = REQUIRED_SKILLS_FOR_MEDIA.filter((req) => { try { return !existsSync(MARKER_PREFIX + req); } catch (e) { return true; } });
    if (missing.length > 0) {
      deny("Tool " + tool + " is BLOCKED: load the owner contract skill(s) first — [" + missing.join(", ") + "]. This is a scrub/web-hero pane: the OWNER skill is overclock-site-scrub (the scrub contract + pre-generation lint), NOT the generic vocabulary skill. Call the Skill tool to load it BEFORE generating, then retry. Do not bypass.");
    }
  }
  if (ALLOWED_TOOLS !== null && tool && tool !== "Skill" && !isSquadProtocolTool(tool)) {
    if (ALLOWED_TOOLS.indexOf(tool) === -1) deny("Tool " + tool + " is NOT in this agent allowed tools. Blocked by squad policy.");
  }
  process.exit(0);
});
`;
    writeFileSync(gatePath, gate, 'utf8');
    return gatePath;
}
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
export function writeResourceGate(gateDir, paneId) {
    const gatePath = join(gateDir, `resource-gate-${paneId}.mjs`);
    const gate = `#!/usr/bin/env node
// PreResourceUse gate — media-resource access control (provider keys + provider hosts).
// Distinct from the skill/tool gate: keeps generation inside overclock_*_generate, where the squad
// provider allowlist + cost live. Blocks the two Bash bypass routes: reading the key store, and
// calling a provider host directly.
const SECRET_MARKERS = ["service-keys.json", ".overclock-app/service-keys", "/.overclock-app"];
const PROVIDER_HOSTS = ["api.replicate.com", "replicate.delivery", "queue.fal.run", "fal.run", "rest.alpha.fal.ai", "api.openai.com", "generativelanguage.googleapis.com", "api.elevenlabs.io"];
let raw = "";
process.stdin.on("data", (d) => { raw += d; });
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(raw); } catch (e) {}
  const tool = input.tool_name || "";
  const ti = input.tool_input || {};
  const deny = (reason) => { process.stderr.write(reason); process.exit(2); };
  // Only shell tools can bypass the MCP layer; the resource MCP tools are governed by the server allowlist.
  if (tool === "Bash" || tool === "Shell" || tool === "shell") {
    const cmd = String(ti.command || ti.cmd || "");
    const low = cmd.toLowerCase();
    if (SECRET_MARKERS.some((p) => cmd.indexOf(p) !== -1)) {
      deny("PreResourceUse: reading Overclock's service-keys store is blocked by policy. Provider API keys are NOT agent-accessible. Generate media ONLY via overclock_image_generate / overclock_video_generate / overclock_audio_generate — they hold the key and enforce this squad's allowed providers. Do not read the key file; do not retry.");
    }
    if (PROVIDER_HOSTS.some((h) => low.indexOf(h) !== -1)) {
      deny("PreResourceUse: calling a media-provider API host directly is blocked by policy. Route ALL image/video/audio generation through the overclock_*_generate tools — they enforce this squad's allowed providers and cost policy. If a generation fails (e.g. content moderation / E005), STOP and surface the capability gap; do NOT switch engines or call the provider directly.");
    }
  }
  process.exit(0);
});
`;
    writeFileSync(gatePath, gate, 'utf8');
    return gatePath;
}
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
export function writeDangerousCommandGate(gateDir, paneId, permanentAllowlist, blockMode) {
    const gatePath = join(gateDir, `dangerous-cmd-gate-${paneId}.mjs`);
    const source = buildDangerousCommandGateSource({ permanentAllowlist, blockMode });
    writeFileSync(gatePath, source, 'utf8');
    return gatePath;
}
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
export function writeWorkflowDenyGate(gateDir, paneId) {
    const gatePath = join(gateDir, `workflow-deny-${paneId}.mjs`);
    const script = `#!/usr/bin/env node
let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => {
  let input = {}
  try { input = JSON.parse(raw) } catch (e) {}
  if ((input.tool_name || '') === 'Workflow') {
    process.stderr.write(
      'BLOCKED: Workflow tool is disabled for delegation chefes (delegateOnly+requireHandoff). ' +
      'Overclock requires visible pane delegation — invisible background agents violate the ' +
      'visible-delegation contract. Use overclock_agent_invoke to spawn visible worker panes: ' +
      'mcp__overclock__overclock_agent_invoke({role:"executor",goal:"...",tools:[...]}). ' +
      'Each worker appears as a visible pane in the workspace grid with full audit trail.'
    )
    process.exit(2)
  }
  process.exit(0)
})
`;
    writeFileSync(gatePath, script, 'utf8');
    return gatePath;
}
/**
 * Squad worker handoff enforcement hooks. Byte-identical to bootstrapMainProcess.ts
 * writeHandoffEnforcementHooks (~434-465), except files land in `gateDir`.
 * Returns the PostToolUse + Stop hook .mjs paths.
 */
export function writeHandoffEnforcementHooks(gateDir, paneId) {
    const marker = join(gateDir, `handoff-marker-${paneId}`);
    const counter = join(gateDir, `handoff-stopcount-${paneId}`);
    const postPath = join(gateDir, `handoff-post-${paneId}.mjs`);
    const stopPath = join(gateDir, `handoff-stop-${paneId}.mjs`);
    const clarifyMarker = join(gateDir, `clarify-marker-${paneId}`);
    const pendingMarker = join(gateDir, `handoff-pending-${paneId}`);
    const workflowInflightMarker = join(gateDir, `workflow-inflight-${paneId}`);
    const post = `#!/usr/bin/env node
import { writeFileSync, unlinkSync } from 'node:fs'
let raw = ''
process.stdin.on('data', (d) => { raw += d })
process.stdin.on('end', () => {
  let input = {}
  try { input = JSON.parse(raw) } catch (e) {}
  const tool = input.tool_name || ''
  if (tool === 'mcp__overclock__handoff_submit') {
    try { writeFileSync(${JSON.stringify(marker)}, '1') } catch (e) {}
    // Worker finished after a clarification — clear the clarify marker so the
    // Stop-hook no longer treats this pane as parked.
    try { unlinkSync(${JSON.stringify(clarifyMarker)}) } catch (e) {}
    // Clear any in-flight Workflow marker — handoff supersedes it.
    try { unlinkSync(${JSON.stringify(workflowInflightMarker)}) } catch (e) {}
  }
  // overclock_clarify parks the pane waiting for a human answer — treat as satisfied
  // so the Stop-hook does NOT nag the worker to call handoff_submit.
  if (tool === 'mcp__overclock__overclock_clarify') {
    try { writeFileSync(${JSON.stringify(clarifyMarker)}, '1') } catch (e) {}
  }
  // Workflow (non-blocking): tool returns a task ID immediately; the pane is legitimately
  // waiting for the background task notification — NOT idle. Mark it so the Stop-hook
  // doesn't pressure it to handoff while the workflow agents are still running.
  // Cleared when handoff_submit fires (above) or when the pane eventually exits.
  if (tool === 'Workflow') {
    try { writeFileSync(${JSON.stringify(workflowInflightMarker)}, '1') } catch (e) {}
  }
  process.exit(0)
})
`;
    const stop = `#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
// handoff_submit was called — worker is done.
try { if (existsSync(${JSON.stringify(marker)})) process.exit(0) } catch (e) {}
// overclock_clarify was called — pane is parked awaiting human answer. Let it idle.
try { if (existsSync(${JSON.stringify(clarifyMarker)})) process.exit(0) } catch (e) {}
// delegateOnly orchestrator with workers still pending — let it idle; worker handoffs re-wake it.
try { if (existsSync(${JSON.stringify(pendingMarker)})) process.exit(0) } catch (e) {}
// in-flight Workflow: pane is waiting for background task notification — NOT idle.
// Do NOT force handoff while Workflow agents are still running (forcing caused write-conflict bugs
// where the chefe wrote files concurrently with the Workflow synthesis agent → corrupted output).
try { if (existsSync(${JSON.stringify(workflowInflightMarker)})) process.exit(0) } catch (e) {}
let n = 0
try { n = parseInt(readFileSync(${JSON.stringify(counter)}, 'utf8'), 10) || 0 } catch (e) {}
if (n >= 3) process.exit(0)
try { writeFileSync(${JSON.stringify(counter)}, String(n + 1)) } catch (e) {}
process.stderr.write('You have NOT called mcp__overclock__handoff_submit yet — the orchestrator is BLOCKED waiting and cannot continue. Call mcp__overclock__handoff_submit NOW: status done/blocked/error, a 1-3 sentence summary, and your full result in artifacts. This is REQUIRED before you may stop.')
process.exit(2)
`;
    writeFileSync(postPath, post, 'utf8');
    writeFileSync(stopPath, stop, 'utf8');
    return { post: postPath, stop: stopPath };
}
/**
 * Extract the numeric suffix of a `pane-<N>` id. Returns null for any other id shape (browser /
 * tmux / remote ids that aren't `pane-<int>`), so a mixed id set can be fed to nextPaneId safely.
 */
export function paneIdNumber(id) {
    const m = /^pane-(\d+)$/.exec(id);
    if (!m)
        return null;
    const n = Number(m[1]);
    return Number.isSafeInteger(n) ? n : null;
}
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
export function nextPaneId(seq, used) {
    let max = Number.isFinite(seq) ? Math.floor(seq) : 0;
    for (const n of used)
        if (Number.isFinite(n) && n > max)
            max = Math.floor(n);
    const next = max + 1;
    return { id: `pane-${next}`, seq: next };
}
// Skill dirs per CLI — mirrors SKILL_ROOTS_BY_CLI in the Electron bootstrap. The
// codex/gemini/antigravity entries match the catalog scanners' install paths.
const SKILL_ROOTS_BY_CLI = {
    claude: join(homedir(), '.claude', 'skills'),
    codex: join(homedir(), '.codex', 'skills'),
    gemini: join(homedir(), '.gemini', 'config', 'skills'),
    antigravity: join(homedir(), '.gemini', 'antigravity', 'skills'),
};
/**
 * Deterministic cross-CLI skill availability — byte-identical logic to bootstrap
 * ensureSkillsForCli (~2901-2926): mirror each bound skill from whichever CLI root
 * has it into the member's own CLI skill dir (symlink, fallback recursive copy).
 */
export function ensureSkillsForCli(cli, skills) {
    if (!cli || !skills?.length)
        return;
    const dstRoot = SKILL_ROOTS_BY_CLI[cli];
    if (!dstRoot)
        return;
    for (const skill of skills) {
        try {
            const dst = join(dstRoot, skill);
            if (existsSync(dst))
                continue;
            const srcRoot = Object.values(SKILL_ROOTS_BY_CLI).find((root) => root !== dstRoot && existsSync(join(root, skill)));
            if (!srcRoot)
                continue;
            mkdirSync(dstRoot, { recursive: true });
            const src = join(srcRoot, skill);
            try {
                symlinkSync(src, dst, 'dir');
            }
            catch {
                cpSync(src, dst, { recursive: true });
            }
        }
        catch {
            /* best-effort */
        }
    }
}
/**
 * Workspace access policy prompt — byte-identical to bootstrap workspaceAccessInstruction
 * (~2928-2954). `globalDir` is the sidecar dataDir (the GLOBAL_DIR equivalent: a workspace
 * equal to it yields ''). Reads the workspace access mode via the shared WorkspaceConfigStore.
 */
export function workspaceAccessInstruction(workspacePath, globalDir, workspaceConfigStore) {
    if (!workspacePath || workspacePath === globalDir)
        return '';
    if (isRemoteWorkspacePath(workspacePath)) {
        return [
            'Overclock workspace access policy:',
            `- Primary workspace: ${workspacePath}`,
            '- Treat this remote host/path as the active workspace boundary.',
            '- Do not operate on another remote host/path unless the user opens that workspace explicitly.',
        ].join('\n');
    }
    const ownerRoot = resolve(workspacePath);
    // Mirror bootstrap workspaceConfigForAccess: resilient read (default on throw).
    let accessMode = 'write_external';
    try {
        accessMode = workspaceConfigStore.get(ownerRoot).accessMode;
    }
    catch {
        accessMode = 'write_external';
    }
    const lines = [
        'Overclock workspace access policy:',
        `- Primary workspace: ${ownerRoot}`,
    ];
    if (accessMode === 'read_external') {
        lines.push('- Mode: read_external. Edit only the primary workspace; read-only access is allowed outside the workspace.');
    }
    else {
        lines.push('- Mode: write_external. Read and edit inside and outside the primary workspace.');
    }
    lines.push('- If a requested file operation is outside this policy, ask the user to update Workspace settings first.');
    return lines.join('\n');
}
//# sourceMappingURL=spawnHelpers.js.map