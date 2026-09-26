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
export type RemoteCliName = 'claude' | 'codex' | 'gemini' | 'kimi' | 'antigravity' | 'grok';
export declare function shQuote(value: string): string;
/**
 * Probe a remote host for installed CLIs. Returns the set of CLI names found on PATH.
 * Byte-equivalent probe script to RemoteCliDetector.probeRemoteClis. Best-effort:
 * a failed SSH connection returns an empty set (the caller HARD-FAILs on absence).
 */
export interface RemoteOrphanSession {
    session: string;
    lastActivity: number;
    preview: string;
    /** Recovered from @ovc_* tmux user-options set at spawn/reattach (RemoteSshTmuxManager). Absent
     * for legacy sessions created before tagging — those stay true orphans until reattached once. */
    missionId?: string;
    paneId?: string;
    agent?: string;
    model?: string;
}
/**
 * List orphan overclock_* tmux sessions on a remote host so the user can reattach agents that
 * survived on the host but aren't tracked by the app (launched before tracking, or after a restart
 * whose hashed session name can't be re-derived). Best-effort: a failed SSH returns []. The session
 * name is opaque (sha256 hash) — reattach is by raw name, see RemoteSpawnConfig.remoteTmuxSession.
 */
export declare function listRemoteOrphanSessions(hostAlias: string): Promise<RemoteOrphanSession[]>;
export declare function detectRemoteClis(hostAlias: string): Promise<Set<RemoteCliName>>;
//# sourceMappingURL=remoteSpawn.d.ts.map