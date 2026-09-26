import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { ensureCatalogSchema, ensureOverlaySchema, listUncategorized, upsertOverlay, getOverlayMap, clearOverlay, listCategorizedForSynthesis, replaceStacks, listStacks, } from './catalogStore.js';
// trigger column does not exist in catalog_items — seed omits it, listUncategorized returns trigger:''
function seed(db) {
    ensureCatalogSchema(db);
    ensureOverlaySchema(db);
    const ins = db.prepare(`INSERT INTO catalog_items (identity_key, type, name, description, installations, metadata, disabled, first_seen_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)`);
    ins.run('skill:make-site', 'skill', 'make-site', 'Builds sites', JSON.stringify([{ cli: 'claude', path: '/u/.claude/skills/make-site/SKILL.md' }]), '{}');
    ins.run('skill:write-copy', 'skill', 'write-copy', 'Writes copy', JSON.stringify([{ cli: 'claude', path: '/u/.claude/skills/write-copy/SKILL.md' }]), '{}');
}
describe('catalog overlay store', () => {
    let db;
    beforeEach(() => {
        db = new DatabaseSync(':memory:');
        seed(db);
    });
    it('lists uncategorized items with paths and clears them as overlay rows land', () => {
        const before = listUncategorized(db, 'skill');
        expect(before.map((r) => r.identity_key).sort()).toEqual(['skill:make-site', 'skill:write-copy']);
        expect(before[0].path).toContain('SKILL.md');
        const written = upsertOverlay(db, [
            { identity_key: 'skill:make-site', type: 'skill', name: 'make-site', category: 'builder', purpose: 'scaffold a site', when_to_use: 'user wants a website' },
        ], 1);
        expect(written).toBe(1);
        const after = listUncategorized(db, 'skill');
        expect(after.map((r) => r.identity_key)).toEqual(['skill:write-copy']);
    });
    it('round-trips overlay map and clears it without touching scan rows', () => {
        upsertOverlay(db, [
            { identity_key: 'skill:make-site', type: 'skill', name: 'make-site', category: 'builder', purpose: 'scaffold a site', when_to_use: 'user wants a website' },
        ], 1);
        expect(getOverlayMap(db).get('skill:make-site')?.category).toBe('builder');
        clearOverlay(db);
        expect(getOverlayMap(db).size).toBe(0);
        // scan rows survive
        expect(listUncategorized(db, 'skill')).toHaveLength(2);
    });
    it('coerces unknown categories to builder on write', () => {
        upsertOverlay(db, [
            { identity_key: 'skill:make-site', type: 'skill', name: 'make-site', category: 'totally-made-up', purpose: 'x', when_to_use: 'y' },
        ], 1);
        expect(getOverlayMap(db).get('skill:make-site')?.category).toBe('builder');
    });
    it('keeps a valid role category as-is', () => {
        upsertOverlay(db, [
            { identity_key: 'skill:write-copy', type: 'skill', name: 'write-copy', category: 'scout', purpose: 'x', when_to_use: 'y' },
        ], 1);
        expect(getOverlayMap(db).get('skill:write-copy')?.category).toBe('scout');
    });
    it('migration drops overlay rows with legacy non-role categories', () => {
        db.prepare(`INSERT INTO catalog_overlay (identity_key, type, name, category, purpose, when_to_use, categorized_at, categorizer_version)
       VALUES ('skill:make-site', 'skill', 'make-site', 'site-build', '', '', 0, 1)`).run();
        ensureOverlaySchema(db); // re-run runs the migration
        expect(getOverlayMap(db).has('skill:make-site')).toBe(false);
        expect(listUncategorized(db, 'skill').map((r) => r.identity_key)).toContain('skill:make-site');
    });
    it('replaces stacks fully and round-trips JSON columns', () => {
        const n = replaceStacks(db, [
            { id: 'site', name: 'Fazer site', summary: 'end-to-end site', member_keys: ['skill:make-site', 'skill:write-copy'], intake_questions: [{ id: 'goal', q: 'objetivo?' }], parallel_groups: [['skill:make-site'], ['skill:write-copy']] },
        ], 1);
        expect(n).toBe(1);
        const stacks = listStacks(db);
        expect(stacks).toHaveLength(1);
        expect(stacks[0].member_keys).toEqual(['skill:make-site', 'skill:write-copy']);
        expect(stacks[0].parallel_groups).toEqual([['skill:make-site'], ['skill:write-copy']]);
        // empty replace is a no-op (keeps prior)
        expect(replaceStacks(db, [], 1)).toBe(0);
        expect(listStacks(db)).toHaveLength(1);
    });
    it('listCategorizedForSynthesis returns only categorized items with path', () => {
        upsertOverlay(db, [
            { identity_key: 'skill:make-site', type: 'skill', name: 'make-site', category: 'builder', purpose: 'scaffold', when_to_use: 'site' },
        ], 1);
        const rows = listCategorizedForSynthesis(db);
        expect(rows.map((r) => r.identity_key)).toEqual(['skill:make-site']);
        expect(rows[0].purpose).toBe('scaffold');
        expect(rows[0].path).toContain('SKILL.md');
    });
});
//# sourceMappingURL=catalogStore.overlay.test.js.map