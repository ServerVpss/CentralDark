/**
 * RemoteBridge — WebSocket server bridging Overclock panes/PTY/missions to a
 * remote thin client (e.g. iPhone). Agents and CLIs stay on the Mac; the
 * remote side is display + input only.
 *
 * Protocol: JSON frames over WSS (self-signed cert). See PROTOCOL section below.
 *
 * PORT: process.env.OVERCLOCK_REMOTE_PORT ?? (dev sidecar instance ? 8790 : 8789)
 *       Dev and prod get DISTINCT default ports (F-018, same identity split as F-010's
 *       MCP port) so a prod instance holding 8789 no longer silently kills the dev
 *       remote-bridge on EADDRINUSE.
 * TLS:  Self-signed cert generated on first run, stored in
 *       <userData>/remote-bridge/tls.json  (PEM key + cert)
 * AUTH: 6-digit pairing code (rotates every 5 min) → opaque 32-byte hex token.
 *       Token hash (SHA-256) + issuedAt persisted in <userData>/remote-bridge/tokens.json.
 *       Tokens expire after 30 days.
 *
 * Ported from packages/shell/src/main/remote/RemoteBridge.ts (Electron-free).
 */
import { EventEmitter } from 'node:events';
import type { Mission } from '@overclock-app/core';
import type { OutputBuffer } from '@overclock-app/pty';
export interface RemoteBridgeDeps {
    /** Directory where bridge state (TLS cert, token store) is persisted. */
    dataDir: string;
    /** TCP port to bind. Default: OVERCLOCK_REMOTE_PORT env, else 8790 (dev) / 8789 (prod). */
    port?: number;
    /** List all panes (local + remote SSH). */
    listPanes: () => Array<{
        paneId: string;
        agent: string;
        model?: string;
        cwd: string;
        status: string;
        attentionRequired?: boolean;
        missionId?: string;
        squadAgentName?: string;
    }>;
    /** Read current missions from disk. */
    readMissions: () => Promise<Mission[]>;
    /** Access OutputBuffer for a pane (to get scrollback). */
    getPaneBuffer: (paneId: string) => OutputBuffer;
    /** Write raw input to a pane's PTY. The ONLY write path exposed over the wire. */
    writePaneInput: (paneId: string, data: string) => void;
    /** Whether a pane with this id is currently alive in the registry. */
    hasPane: (paneId: string) => boolean;
    /** Resize a pane's terminal dimensions. */
    resizePane: (paneId: string, cols: number, rows: number) => void;
    /** Spawn a new agent pane on the host (remote or local). Returns the new pane id. */
    spawnPane: (opts: {
        agent?: string;
        model?: string;
        effort?: string;
        cwd?: string;
    }) => Promise<string>;
}
export declare class RemoteBridge extends EventEmitter {
    private httpsServer;
    private wss;
    private clients;
    private tokenStore;
    private pairCode;
    private pairCodeExpiresAt;
    /** Global IP-level rate limit: Map<ip, {count, windowStart}>. Keyed by remoteAddress. */
    private ipRateLimit;
    private readonly bridgeDir;
    private readonly port;
    private readonly deps;
    constructor(deps: RemoteBridgeDeps);
    private isIpRateLimited;
    private recordIpFailure;
    rotatePairCode(): void;
    /** Returns the current valid pairing code and its expiry (epoch ms). */
    getPairCode(): {
        code: string;
        expiresAt: number;
    };
    /** Revoke all issued tokens and persist the empty store. */
    revokeAllTokens(): void;
    start(): Promise<{
        port: number;
        certPath: string;
    } | null>;
    stop(): Promise<void>;
    /**
     * Call this whenever a PTY data event fires. The bridge fans the chunk out
     * to all authenticated clients subscribed to this pane.
     */
    onPtyData(paneId: string, data: string): void;
    /** Broadcast pane list update to all authed clients. */
    broadcastPanes(): void;
    /** Broadcast mission list update to all authed clients. */
    broadcastMissions(): Promise<void>;
    private handleConnection;
    private handleMessage;
    private handlePair;
    private handleAuth;
    private handlePanesList;
    private handlePaneSubscribe;
    private handlePaneInput;
    private handlePaneResize;
    private handleMissionsList;
    private handleSquadStatus;
    private serializePanes;
    private serializeMissionList;
    private serializeMissions;
    private send;
}
//# sourceMappingURL=remoteBridge.d.ts.map