import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { ensureCatalogSchema, ensureOverlaySchema, replaceStacks, getStack, } from './catalogStore.js';
function freshDb() {
    const db = new DatabaseSync(':memory:');
    ensureCatalogSchema(db);
    ensureOverlaySchema(db);
    return db;
}
describe('getStack', () => {
    let db;
    beforeEach(() => { db = freshDb(); });
    it('returns the full parsed row for an existing id, null otherwise', () => {
        replaceStacks(db, [{
                id: 'fazer-site',
                name: 'Fazer site',
                summary: 'pitch',
                member_keys: ['skill:frontend-design', 'skill:seo-optimizer'],
                intake_questions: [{ id: 'objetivo', kind: 'choice', prompt: 'Qual o objetivo?', suggestions: ['Vender', 'Portfólio'], can_scout: false }],
                parallel_groups: [['design-system', 'info-arch'], ['builder'], ['seo']],
            }], 1);
        const hit = getStack(db, 'fazer-site');
        expect(hit?.name).toBe('Fazer site');
        expect(hit?.member_keys).toEqual(['skill:frontend-design', 'skill:seo-optimizer']);
        expect(hit?.intake_questions).toHaveLength(1);
        expect((hit?.parallel_groups)[0]).toEqual(['design-system', 'info-arch']);
        expect(getStack(db, 'nope')).toBeNull();
    });
});
//# sourceMappingURL=catalogStore.test.js.map