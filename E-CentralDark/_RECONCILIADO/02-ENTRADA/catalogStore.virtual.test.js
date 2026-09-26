import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseSync } from 'node:sqlite';
import { ensureCatalogSchema, ensureOverlaySchema, catalogList, } from './catalogStore.js';
function freshDb() {
    const db = new DatabaseSync(':memory:');
    ensureCatalogSchema(db);
    ensureOverlaySchema(db);
    return db;
}
// Seeds a disk-scanned item the way upsertCatalogScanResults would (origin = user).
function seedDiskItem(db, type, name) {
    db.prepare(`
    INSERT INTO catalog_items (type, name, description, installations, first_seen_at, last_seen_at, identity_key, disabled)
    VALUES (?, ?, ?, ?, 0, 0, ?, 0)
  `).run(type, name, `${name} desc`, JSON.stringify([{ cli: 'claude', path: `/u/.claude/skills/${name}.md` }]), `["${type}","${name}"]`);
}
// A stub that mimics listBuiltinManifest() — the real one fs-scans the in-bundle resources.
// We inject it so the union/dedup/origin logic is proven WITHOUT depending on @overclock-app/mcp
// being rebuilt/re-exported (the import there degrades to [] until the bundle ships the symbol).
const builtinStub = () => [
    { identity_key: 'overclock-cinema-shot', type: 'skill', name: 'overclock-cinema-shot', category: 'builder', purpose: 'Write and generate a cinematic shot', origin: 'overclock' },
    { identity_key: 'overclock-cinema-director', type: 'agent', name: 'overclock-cinema-director', category: 'scout', purpose: 'Direct the shoot', origin: 'overclock' },
];
describe('catalogList — virtual built-in entries', () => {
    let db;
    beforeEach(() => { db = freshDb(); });
    it('surfaces a built-in skill (origin=overclock, readOnly) EVEN with an empty disk catalog', () => {
        // disk is empty — nothing in catalog_items
        const items = catalogList(db, { type: 'skill', includeBuiltin: true }, { builtinSource: builtinStub });
        const shot = items.find((i) => i.name === 'overclock-cinema-shot');
        expect(shot).toBeDefined();
        expect(shot?.origin).toBe('overclock');
        expect(shot?.readOnly).toBe(true);
    });
    it('filters built-ins by the requested type', () => {
        const skills = catalogList(db, { type: 'skill', includeBuiltin: true }, { builtinSource: builtinStub });
        expect(skills.some((i) => i.name === 'overclock-cinema-director')).toBe(false); // that one is an agent
        const agents = catalogList(db, { type: 'agent', includeBuiltin: true }, { builtinSource: builtinStub });
        expect(agents.some((i) => i.name === 'overclock-cinema-director')).toBe(true);
    });
    it('unions disk items (origin=user) with built-ins (origin=overclock)', () => {
        seedDiskItem(db, 'skill', 'make-site');
        const items = catalogList(db, { type: 'skill', includeBuiltin: true }, { builtinSource: builtinStub });
        const disk = items.find((i) => i.name === 'make-site');
        expect(disk).toBeDefined();
        expect(disk?.origin).toBe('user');
        expect(disk?.readOnly).toBeFalsy();
        expect(items.find((i) => i.name === 'overclock-cinema-shot')?.origin).toBe('overclock');
    });
    it('dedupes by identity (built-in wins) when a disk item collides with a built-in', () => {
        seedDiskItem(db, 'skill', 'overclock-cinema-shot'); // user has a same-named copy on disk
        const items = catalogList(db, { type: 'skill', includeBuiltin: true }, { builtinSource: builtinStub });
        const matches = items.filter((i) => i.name === 'overclock-cinema-shot');
        expect(matches).toHaveLength(1);
        expect(matches[0]?.origin).toBe('overclock');
        expect(matches[0]?.readOnly).toBe(true);
    });
    it('omits built-ins when includeBuiltin is false', () => {
        seedDiskItem(db, 'skill', 'make-site');
        const items = catalogList(db, { type: 'skill', includeBuiltin: false }, { builtinSource: builtinStub });
        expect(items.some((i) => i.name === 'overclock-cinema-shot')).toBe(false);
        expect(items.some((i) => i.name === 'make-site')).toBe(true);
    });
});
//# sourceMappingURL=catalogStore.virtual.test.js.map