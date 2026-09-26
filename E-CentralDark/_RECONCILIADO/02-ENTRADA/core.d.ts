import type { HostAdapter } from './WsHost.js';
/**
 * Pure decision: should the stored session be refreshed BEFORE it is used?
 * True when an expiry is known and is in the past, or within `skewMs` of now
 * (default 60s) so a token that is about to die is renewed proactively. A null
 * expiresAt means "unknown" — we do not force a refresh on it (the verify path
 * still reacts to a 401). Exported for unit testing without network/fs.
 */
export declare function shouldRefreshSession(expiresAt: number | null, now: number, skewMs?: number): boolean;
export declare function wireCore(host: HostAdapter, opts?: {
    /** @deprecated use keystoreKeys */
    keystoreMasterKey?: Buffer | null;
    keystoreKeys?: {
        fileKey: Buffer;
        legacyKey?: Buffer;
    } | null;
}): {
    dispose: () => void;
};
//# sourceMappingURL=core.d.ts.map