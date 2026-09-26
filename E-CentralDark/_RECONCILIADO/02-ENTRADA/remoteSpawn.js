/**
 * remoteSpawn.ts — sidecar-side remote (ssh://) spawn routing.
 *
 * Mirrors the Electron bootstrap remote branch (bootstrapMainProcess.ts ~5771-5883):
 * parse the workspace ref, probe the remote host for the agent CLI, HARD-FAIL when the
 * CLI is absent, then spawn a real `ssh -tt` child through RemoteSshTmuxManager (from
 * @overclock-app/core). Without this, the sidecar built a LOCAL PaneConfig with cwd=ssh://
 * and the PtyManager cwd guard skipped url-scheme cwds — a bogus local spawn returned ok.
 *
 * Remote CLI detection is a minimal port of packages/shell/src/main/remote/RemoteCliDetector.ts
 * (which couples to electron-log). Kept in the sidecar — not @overclock-app/core — so core stays
 * electron-free without needing a logger; promoting the full cached detector to core is the
 * RemoteMove phase's job. SECURITY: host aliases are validated (no shell-meta injection); the
 * probe runs over `ssh -o BatchMode=yes` so a password-only host fails fast instead of hanging.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
const KNOWN_CLIS = ['claude', 'codex', 'gemini', 'kimi', 'antigravity', 'grok'];
export function shQuote(value) {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}
function isSafeAlias(alias) {
    return /^[A-Za-z0-9._-]+$/.test(alias) && !alias.startsWith('-');
}
/**
 * List orphan overclock_* tmux sessions on a remote host so the user can reattach agents that
 * survived on the host but aren't tracked by the app (launched before tracking, or after a restart
 * whose hashed session name can't be re-derived). Best-effort: a failed SSH returns []. The session
 * name is opaque (sha256 hash) — reattach is by raw name, see RemoteSpawnConfig.remoteTmuxSession.
 */
export async function listRemoteOrphanSessions(hostAlias) {
    if (!isSafeAlias(hostAlias))
        return [];
    const script = [
        'command -v tmux >/dev/null 2>&1 || exit 0',
        `for s in $(tmux list-sessions -F '#{session_name}' 2>/dev/null | grep '^overclock_'); do`,
        `  act=$(tmux display-message -t "$s" -p '#{session_activity}' 2>/dev/null)`,
        `  mid=$(tmux show-options -t "$s" -v @ovc_mission 2>/dev/null)`,
        `  pid=$(tmux show-options -t "$s" -v @ovc_pane 2>/dev/null)`,
        `  ag=$(tmux show-options -t "$s" -v @ovc_agent 2>/dev/null)`,
        `  md=$(tmux show-options -t "$s" -v @ovc_model 2>/dev/null)`,
        `  prev=$(tmux capture-pane -t "$s" -p 2>/dev/null | grep -v '^[[:space:]]*$' | tail -1)`,
        // preview LAST: it may contain tabs, so the parser takes the first 6 fields and joins the rest.
        `  printf '%s\\t%s\\t%s\\t%s\\t%s\\t%s\\t%s\\n' "$s" "$act" "$mid" "$pid" "$ag" "$md" "$prev"`,
        'done',
    ].join('\n');
    const remoteCommand = `SHELL_PATH="\${SHELL:-/bin/sh}"; exec "$SHELL_PATH" -lc ${shQuote(script)}`;
    try {
        const result = await execFileAsync('ssh', [
            '-o', 'BatchMode=yes',
            '-o', 'ConnectTimeout=8',
            hostAlias,
            remoteCommand,
        ], { encoding: 'utf8', timeout: 12_000, maxBuffer: 512_000 });
        const out = [];
        for (const line of (result.stdout ?? '').split(/\r?\n/)) {
            if (!line.trim())
                continue;
            const [session, act, mid, pid, ag, md, ...rest] = line.split('\t');
            if (!session?.startsWith('overclock_'))
                continue;
            out.push({
                session,
                lastActivity: Number(act) * 1000 || 0,
                preview: rest.join('\t').slice(0, 200),
                ...(mid ? { missionId: mid } : {}),
                ...(pid ? { paneId: pid } : {}),
                ...(ag ? { agent: ag } : {}),
                ...(md ? { model: md } : {}),
            });
        }
        return out.sort((a, b) => b.lastActivity - a.lastActivity);
    }
    catch {
        return [];
    }
}
export async function detectRemoteClis(hostAlias) {
    if (!isSafeAlias(hostAlias))
        return new Set();
    const script = [
        'for pair in "claude claude" "codex codex" "gemini gemini" "kimi kimi" "antigravity agy" "grok grok"; do',
        '  name=${pair%% *}',
        '  binary=${pair#* }',
        '  path=$(command -v "$binary" 2>/dev/null || true)',
        '  if [ -n "$path" ]; then printf "%s\\t%s\\n" "$name" "$path"; fi',
        'done',
    ].join('\n');
    const remoteCommand = `SHELL_PATH="\${SHELL:-/bin/sh}"; exec "$SHELL_PATH" -lc ${shQuote(script)}`;
    try {
        const result = await execFileAsync('ssh', [
            '-o', 'BatchMode=yes',
            '-o', 'ConnectTimeout=8',
            hostAlias,
            remoteCommand,
        ], { encoding: 'utf8', timeout: 10_000, maxBuffer: 128_000 });
        const found = new Set();
        for (const line of (result.stdout ?? '').split(/\r?\n/)) {
            const name = line.split('\t')[0];
            if (KNOWN_CLIS.includes(name))
                found.add(name);
        }
        return found;
    }
    catch {
        return new Set();
    }
}
//# sourceMappingURL=remoteSpawn.js.map