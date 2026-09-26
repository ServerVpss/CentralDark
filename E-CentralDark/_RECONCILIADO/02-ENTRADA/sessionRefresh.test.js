/**
 * Unit tests for shouldRefreshSession — the "expired → refresh" decision that keeps the
 * ~1h Supabase access token alive (login once, refresh_token auto-renews) instead of
 * dropping the user to a re-login screen.
 *
 * Pure helper: no network, no fs. The actual refresh + atomic write are exercised by the
 * sidecar at runtime; here we lock the gate logic so the boundary cases never regress.
 */
import { describe, it, expect } from 'vitest';
import { shouldRefreshSession } from './core.js';
const NOW = 1_700_000_000_000;
describe('shouldRefreshSession', () => {
    it('refreshes when the token is already expired', () => {
        expect(shouldRefreshSession(NOW - 1_000, NOW)).toBe(true);
    });
    it('refreshes when the token expires within the 60s skew window', () => {
        // 30s left → inside the 60s proactive window.
        expect(shouldRefreshSession(NOW + 30_000, NOW)).toBe(true);
    });
    it('does NOT refresh a token with comfortable life left', () => {
        // 10 minutes left.
        expect(shouldRefreshSession(NOW + 600_000, NOW)).toBe(false);
    });
    it('does NOT refresh when expiresAt is unknown (null)', () => {
        expect(shouldRefreshSession(null, NOW)).toBe(false);
    });
    it('treats exactly the skew boundary as not-yet-due (strict greater-than)', () => {
        // expiresAt - skew === now → now > (expiresAt - skew) is false.
        expect(shouldRefreshSession(NOW + 60_000, NOW)).toBe(false);
        // one ms past the boundary → due.
        expect(shouldRefreshSession(NOW + 60_000 - 1, NOW)).toBe(true);
    });
    it('honors a custom skew window', () => {
        // 90s left, 120s skew → due.
        expect(shouldRefreshSession(NOW + 90_000, NOW, 120_000)).toBe(true);
        // 90s left, 30s skew → not due.
        expect(shouldRefreshSession(NOW + 90_000, NOW, 30_000)).toBe(false);
    });
});
//# sourceMappingURL=sessionRefresh.test.js.map