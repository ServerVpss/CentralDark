/**
 * Terminal nudge state
 *
 * Tracks, per terminal, whether the agent has set a title and how fresh its last
 * activity update is. The hooks (title-gate-hook + title-nudge-hook) read these files
 * directly from the shell to decide whether to remind. main.js writes them when
 * it dispatches the matching notifications, and clears them on terminal close / fresh start.
 *
 * KEYS — two parallel schemes are written so the hook can pick the renumber-proof one:
 *   ~/.codeagentswarm/terminal-nudge-state/<terminalId>.title    (STABLE id, preferred)
 *   ~/.codeagentswarm/terminal-nudge-state/<quadrant>.title      (0-based quadrant, fallback)
 *   (and the matching .activity files)
 *
 * Why the stable id: the quadrant is MUTABLE — CAS renumbers terminals when a
 * low-index one closes (7 -> 9). The shell's CODEAGENTSWARM_CURRENT_QUADRANT is frozen
 * at spawn, so after a renumber a quadrant-keyed title written for the LIVE quadrant no
 * longer matched the STALE quadrant the hook read -> the reminder kept firing on an
 * already-titled terminal (a false nag). The stable CODEAGENTSWARM_TERMINAL_ID is frozen
 * at spawn AND is what main.js writes under (it resolves the terminal object), so the
 * id-keyed file always matches and a titled terminal is never falsely reminded. The
 * quadrant-keyed file is kept for older terminals spawned before this env var existed.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const STATE_DIR = path.join(os.homedir(), '.codeagentswarm', 'terminal-nudge-state');

function isValidQuadrant(quadrant) {
    return Number.isInteger(quadrant) && quadrant >= 0;
}

// A terminal id is an opaque string (UUID). Sanitise to a safe, dot-free filename
// segment so it can never escape the state dir or collide with the `<n>.title` scheme.
function safeId(terminalId) {
    if (typeof terminalId !== 'string') return '';
    const cleaned = terminalId.replace(/[^A-Za-z0-9_-]/g, '_');
    return cleaned.length ? cleaned : '';
}

function fileFor(quadrant, kind) {
    return path.join(STATE_DIR, `${quadrant}.${kind}`);
}

function fileForId(terminalId, kind) {
    const id = safeId(terminalId);
    return id ? path.join(STATE_DIR, `${id}.${kind}`) : null;
}

function ensureDir() {
    try {
        fs.mkdirSync(STATE_DIR, { recursive: true });
    } catch (e) {
        // best-effort: a missing dir just means the hook will keep nudging
    }
}

function writeMarker(file, content) {
    if (!file) return;
    try {
        fs.writeFileSync(file, content !== undefined ? String(content) : String(Date.now()));
    } catch (e) {
        // best-effort
    }
}

function removeMarker(file) {
    if (!file) return;
    try {
        fs.rmSync(file, { force: true });
    } catch (e) {
        // best-effort
    }
}

/**
 * Mark that this terminal has a title set. Idempotent.
 * @param {number} quadrant     0-based quadrant (back-compat key)
 * @param {string} [terminalId] stable terminal id (renumber-proof key, preferred)
 */
function markTitleSet(quadrant, terminalId) {
    ensureDir();
    if (isValidQuadrant(quadrant)) writeMarker(fileFor(quadrant, 'title'));
    writeMarker(fileForId(terminalId, 'title'));
}

/**
 * Refresh this terminal's activity timestamp (its mtime is what the nudge checks).
 * @param {number} quadrant
 * @param {string} [terminalId]
 */
function markActivity(quadrant, terminalId) {
    ensureDir();
    if (isValidQuadrant(quadrant)) writeMarker(fileFor(quadrant, 'activity'));
    writeMarker(fileForId(terminalId, 'activity'));
}

/**
 * Record this terminal's current work-phase STATUS for the nudge hook. Unlike the
 * title/activity markers (whose mtime is the signal), the .status file's CONTENT is
 * the current status key, so the nudge can remind the agent to flip to 'working'
 * when the user prompts a terminal that is resting (needs_testing / done / ...).
 * A null/empty statusKey removes the marker (status cleared).
 * @param {number} quadrant
 * @param {string} [terminalId]
 * @param {string|null} statusKey
 */
function markStatus(quadrant, terminalId, statusKey) {
    ensureDir();
    const files = [];
    if (isValidQuadrant(quadrant)) files.push(fileFor(quadrant, 'status'));
    const idFile = fileForId(terminalId, 'status');
    if (idFile) files.push(idFile);
    for (const f of files) {
        if (statusKey) writeMarker(f, statusKey);
        else removeMarker(f);
    }
}

// Role markers last for the open Chat, including paused/revoked supervision.
function markCoordinator(quadrant, terminalId, coordinator) {
    ensureDir();
    const files = [fileForId(terminalId, 'coordinator')];
    if (isValidQuadrant(quadrant)) files.push(fileFor(quadrant, 'coordinator'));
    for (const file of files) {
        if (coordinator && file && !fs.existsSync(file)) writeMarker(file, '1');
        else if (coordinator) continue;
        else removeMarker(file);
    }
    if (coordinator) markStatus(quadrant, terminalId, null);
}

function isCoordinator(quadrant, terminalId) {
    const file = terminalId ? fileForId(terminalId, 'coordinator') : fileFor(quadrant, 'coordinator');
    return !!file && fs.existsSync(file);
}

/**
 * Per-agent Privacy flag for the work-phase-status feature. When the feature is
 * OFF for an agent (Settings > Privacy), main.js writes `status-off-<agentId>` in
 * the state dir; the hook scripts (SessionStart / UserPromptSubmit nudge /
 * PreToolUse gate) read it at RUNTIME and silence ONLY their status parts, so a
 * toggle applies to already-open sessions with no hook reinstall. The flag is
 * INTENT, not staleness: its name deliberately matches none of the
 * pruneStaleMarkers patterns so it survives the 24h prune.
 * @param {string} agentId  'claude' | 'codex' | 'antigravity' | 'opencode'
 * @param {boolean} off     true → write the flag; false → remove it
 */
function setStatusFeatureOff(agentId, off) {
    const id = safeId(agentId);
    if (!id) return;
    const file = path.join(STATE_DIR, `status-off-${id}`);
    if (off) {
        ensureDir();
        writeMarker(file);
    } else {
        removeMarker(file);
    }
}

/**
 * Per-agent flag for the dynamic-titles feature, same contract as
 * setStatusFeatureOff: main.js writes `titles-off-<agentId>` whenever titles or
 * the whole MCP connection are not effective for the agent. Hook-based agents
 * never see this file — their nudges are uninstalled instead — but the
 * host-side status-nudge cannot be uninstalled, so it reads the flag at runtime
 * to stop asking for set_terminal_title the agent does not have. Like
 * `status-off-*`, the name matches no pruneStaleMarkers pattern.
 * @param {string} agentId
 * @param {boolean} off     true → write the flag; false → remove it
 */
function setTitlesFeatureOff(agentId, off) {
    const id = safeId(agentId);
    if (!id) return;
    const file = path.join(STATE_DIR, `titles-off-${id}`);
    if (off) {
        ensureDir();
        writeMarker(file);
    } else {
        removeMarker(file);
    }
}

/**
 * Forget a terminal's nudge state so its slot starts fresh (re-nudges). Call on terminal
 * close and when a brand-new session takes a slot, so a reused quadrant/id is not wrongly
 * treated as already titled. Clears BOTH the quadrant- and id-keyed markers.
 * @param {number} quadrant
 * @param {string} [terminalId]
 */
function clearTerminalNudgeState(quadrant, terminalId) {
    const files = [];
    if (isValidQuadrant(quadrant)) {
        files.push(fileFor(quadrant, 'title'), fileFor(quadrant, 'activity'), fileFor(quadrant, 'status'), fileFor(quadrant, 'coordinator'));
    }
    for (const kind of ['title', 'activity', 'status', 'coordinator']) {
        const idFile = fileForId(terminalId, kind);
        if (idFile) files.push(idFile);
    }
    for (const f of files) {
        try {
            fs.rmSync(f, { force: true });
        } catch (e) {
            // best-effort
        }
    }
}

/**
 * Prune stale marker files so the state dir cannot grow unbounded across crashes/restarts.
 * Removes title/activity markers AND the per-session gate caps (.gate-seen-*, .gate-count-*)
 * whose mtime is older than maxAgeMs. SAFE for live terminals: a live terminal's title is
 * fresh on set and its activity is refreshed continuously, and a freshly restored terminal
 * writes new markers with a current mtime — so only DEAD (old) markers match. Default 24h.
 * The per-agent `status-off-*` flags are intent markers (not staleness) and are
 * deliberately NOT matched here, so a disabled status feature survives the prune.
 * Best-effort and never throws.
 * @param {number} [maxAgeMs] markers older than this are removed (default 24h)
 * @returns {number} count of files removed
 */
function pruneStaleMarkers(maxAgeMs = 24 * 60 * 60 * 1000) {
    let removed = 0;
    let entries;
    try {
        entries = fs.readdirSync(STATE_DIR);
    } catch (e) {
        return 0; // dir missing -> nothing to prune
    }
    const cutoff = Date.now() - maxAgeMs;
    for (const name of entries) {
        const isMarker = name.endsWith('.title') || name.endsWith('.activity') || name.endsWith('.status')
            || name.startsWith('.gate-seen-') || name.startsWith('.gate-count-')
            || name.startsWith('.status-count-');
        if (!isMarker) continue;
        const full = path.join(STATE_DIR, name);
        try {
            const st = fs.statSync(full);
            if (st.isFile() && st.mtimeMs < cutoff) {
                fs.rmSync(full, { force: true });
                removed++;
            }
        } catch (e) {
            // best-effort: skip anything we cannot stat/remove
        }
    }
    return removed;
}

module.exports = {
    STATE_DIR,
    fileFor,
    fileForId,
    safeId,
    markTitleSet,
    markActivity,
    markStatus,
    markCoordinator,
    isCoordinator,
    setStatusFeatureOff,
    setTitlesFeatureOff,
    clearTerminalNudgeState,
    pruneStaleMarkers,
};
