import { describe, it, expect } from 'vitest';
import { clarifyBroadcastPayload } from './clarifyBroadcast.js';
describe('clarifyBroadcastPayload', () => {
    it('returns payload for awaiting_clarification with suggestions', () => {
        const out = clarifyBroadcastPayload({
            paneId: 'p1',
            status: 'awaiting_clarification',
            artifacts: { question: 'Objetivo?', suggestions: ['Vender', 'Portfólio'] },
        });
        expect(out).toEqual({ paneId: 'p1', question: 'Objetivo?', suggestions: ['Vender', 'Portfólio'] });
    });
    it('returns null when no suggestions', () => {
        expect(clarifyBroadcastPayload({
            paneId: 'p1', status: 'awaiting_clarification', artifacts: { question: 'Q?' },
        })).toBeNull();
    });
    it('returns null for non-awaiting_clarification status even with suggestions', () => {
        expect(clarifyBroadcastPayload({
            paneId: 'p1', status: 'done', artifacts: { suggestions: ['x'] },
        })).toBeNull();
    });
});
//# sourceMappingURL=clarifyBroadcast.test.js.map