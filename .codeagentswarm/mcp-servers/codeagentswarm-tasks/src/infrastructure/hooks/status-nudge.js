/**
 * status-nudge.js
 *
 * Host-side work-phase STATUS reminders for agents WITHOUT a hook channel.
 *
 * Claude gets its "set the matching status before ending your turn" reminder
 * injected on every user prompt (UserPromptSubmit in hooks-manager.js); codex,
 * kimi and grok get the mid-turn equivalent through the shared PreToolUse
 * title-gate (title-gate-script.js). ACP-driven agents — devin, cursor, opencode
 * — expose no hook surface at all, so nothing ever reminded them: the global
 * agent-instructions block is early context that compaction can drop, and the
 * set_terminal_status tool description is easy to skim past. That asymmetry is
 * why hookless agents end turns without declaring their closing status.
 *
 * This module mirrors the bash nudge's decisions reading the SAME marker files
 * (~/.codeagentswarm/terminal-nudge-state, see terminal-nudge-state.js):
 *   - promptStatusNudge()            -> the UserPromptSubmit equivalent: reminder
 *     text to ride inside the prompt's <session-instructions> envelope, or null.
 *   - activityResultStatusReminder() -> the PreToolUse equivalent: a one-line
 *     reminder attached to update_terminal_activity results (the tool agents
 *     are told to call OFTEN, including as their final action), or null.
 *
 * Every path is fail-silent like the shell scripts: any ambiguity returns null
 * (no reminder) except the provider gate, which fails the other way — an
 * unknown agent GETS the nudge, because a redundant line costs little and a
 * missing one leaves the badge wrong for the whole session.
 */
const fs = require('fs');
const path = require('path');
const nudgeState = require('./terminal-nudge-state');

// Agents whose own hook surface already delivers a status reminder: Claude via
// SessionStart/UserPromptSubmit, codex/kimi/grok via the shared PreToolUse
// title-gate. Everyone else — and any unknown/future agent — is eligible for
// the prompt-level nudge (fail-safe, mirroring agentHasBgWaitSignal).
const AGENTS_WITH_HOOK_STATUS_NUDGE = new Set(['claude', 'codex', 'kimi', 'grok']);

// Mirrors STATUS_GRACE_SECONDS in title-gate-script.js: a status the agent set
// this recently was deliberate — do not second-guess it on the next call.
const STATUS_GRACE_MS = 120 * 1000;

// Message texts intentionally mirror the UserPromptSubmit bash script so every
// agent hears the same contract regardless of the delivery channel.
const NO_TITLE_NUDGE =
    'CodeAgentSwarm: this agent still has no title. Before doing anything else, call set_terminal_title with a short feature-level title, then update_terminal_activity with what you are about to do, and set_terminal_status with status="working".';
const NO_TITLE_NUDGE_NO_STATUS =
    'CodeAgentSwarm: this agent still has no title. Before doing anything else, call set_terminal_title with a short feature-level title, then update_terminal_activity with what you are about to do.';
const NO_STATUS_NUDGE =
    'CodeAgentSwarm: this agent has no work-phase status yet. If you are starting to work, call set_terminal_status with status="working" and keep it updated at every phase change.';
const CLOSING_STATUS_REMINDER =
    'Before your final response, call set_terminal_status with the most specific enabled status for the outcome; its description lists the live catalog.';

function restingStatusNudge(status) {
    return `CodeAgentSwarm: the user just sent a prompt while this agent's status is '${status}'. If you are going to work on it, call set_terminal_status with status="working" NOW; and when you stop again (asking something, handing over for testing, or finished) set the matching status before ending your turn.`;
}

function _quadrant(quadrant) {
    const q = Number.parseInt(quadrant, 10);
    return Number.isInteger(q) && q >= 0 ? q : null;
}

// Candidate marker files for a kind, stable terminal id first (renumber-proof)
// and the legacy quadrant key as fallback — exactly like the bash nudge.
function _markerFiles(terminalId, quadrant, kind) {
    const files = [];
    if (terminalId) {
        const idFile = nudgeState.fileForId(terminalId, kind);
        if (idFile) files.push(idFile);
    }
    const q = _quadrant(quadrant);
    if (q !== null) files.push(nudgeState.fileFor(q, kind));
    return files;
}

function _firstExisting(terminalId, quadrant, kind) {
    for (const file of _markerFiles(terminalId, quadrant, kind)) {
        try {
            if (fs.existsSync(file)) return file;
        } catch (e) { /* next candidate */ }
    }
    return null;
}

// The .status file's CONTENT is the current status key; its mtime is when the
// agent last declared it (written by the MCP server and by main.js on badge
// flips). Returns { status, mtimeMs } or null when never declared.
function _readStatusMarker(terminalId, quadrant) {
    const file = _firstExisting(terminalId, quadrant, 'status');
    if (!file) return null;
    try {
        return {
            status: String(fs.readFileSync(file, 'utf8') || '').trim(),
            mtimeMs: fs.statSync(file).mtimeMs
        };
    } catch (e) {
        return null;
    }
}

// Coordinators carry no task status, and the per-agent Privacy toggle
// (status-off-<agent>) silences the feature — both mirror the hooks' exits.
function _statusFeatureSilenced(terminalId, quadrant, agentId) {
    if (nudgeState.isCoordinator(_quadrant(quadrant) ?? -1, terminalId)) return true;
    const agentKey = agentId ? nudgeState.safeId(agentId) : '';
    if (!agentKey) return false;
    try {
        return fs.existsSync(path.join(nudgeState.STATE_DIR, `status-off-${agentKey}`));
    } catch (e) {
        return false;
    }
}

// Per-agent titles-off flag (titles or the whole MCP connection disabled).
// Hook agents never need it — their nudges are uninstalled — but a host-side
// nudge cannot be uninstalled, so without this check the title nag would fire on
// every prompt forever for an agent that has no set_terminal_title tool.
function _titlesFeatureOff(agentId) {
    const agentKey = agentId ? nudgeState.safeId(agentId) : '';
    if (!agentKey) return false;
    try {
        return fs.existsSync(path.join(nudgeState.STATE_DIR, `titles-off-${agentKey}`));
    } catch (e) {
        return false;
    }
}

function _hasCasIdentity(terminalId, quadrant) {
    return Boolean(terminalId) || _quadrant(quadrant) !== null;
}

/**
 * The UserPromptSubmit status nudge for prompt-injected delivery (chat/ACP
 * sessions). Returns the reminder text, or null when nothing is needed.
 * Branch order mirrors title-nudge-hook.sh: untitled -> combined bootstrap;
 * coordinator/status-off -> title-only variant or silence; missing status ->
 * bootstrap; resting (non-working) -> flip-to-working + close-with-matching.
 */
function promptStatusNudge({ terminalId, quadrant, agentId } = {}) {
    try {
        if (!_hasCasIdentity(terminalId, quadrant)) return null;
        if (agentId && AGENTS_WITH_HOOK_STATUS_NUDGE.has(String(agentId).toLowerCase())) return null;
        const silenced = _statusFeatureSilenced(terminalId, quadrant, agentId);
        if (!_firstExisting(terminalId, quadrant, 'title') && !_titlesFeatureOff(agentId)) {
            return silenced ? NO_TITLE_NUDGE_NO_STATUS : NO_TITLE_NUDGE;
        }
        if (silenced) return null;
        const marker = _readStatusMarker(terminalId, quadrant);
        if (!marker || !marker.status) return NO_STATUS_NUDGE;
        if (marker.status !== 'working') return restingStatusNudge(marker.status);
        return null;
    } catch (e) {
        return null;
    }
}

/**
 * The mid-turn counterpart: a one-line closing reminder for
 * update_terminal_activity results. No provider gate — hooked agents tolerate
 * the extra line and it reaches agents mid-work, closer to the decision point
 * than any prompt can. Silenced for coordinators, when the feature is off for
 * the caller, right after a fresh deliberate status (the hook's grace), and
 * whenever the badge already rests on a closing status — unlike the PreToolUse
 * gate, which exits on 'working' because mid-tool nagging under honest work is
 * noise, here 'working' is exactly the state the reminder exists for, while a
 * resting status means the agent already declared its close and nagging on
 * every activity call would be unbounded noise.
 */
function activityResultStatusReminder({ terminalId, quadrant, agentId } = {}) {
    try {
        if (!_hasCasIdentity(terminalId, quadrant)) return null;
        if (_statusFeatureSilenced(terminalId, quadrant, agentId)) return null;
        const marker = _readStatusMarker(terminalId, quadrant);
        if (marker && marker.status && marker.status !== 'working') return null;
        if (marker && Number.isFinite(marker.mtimeMs) && Date.now() - marker.mtimeMs < STATUS_GRACE_MS) return null;
        return CLOSING_STATUS_REMINDER;
    } catch (e) {
        return null;
    }
}

module.exports = {
    STATUS_GRACE_MS,
    NO_TITLE_NUDGE,
    NO_TITLE_NUDGE_NO_STATUS,
    NO_STATUS_NUDGE,
    CLOSING_STATUS_REMINDER,
    promptStatusNudge,
    activityResultStatusReminder
};
