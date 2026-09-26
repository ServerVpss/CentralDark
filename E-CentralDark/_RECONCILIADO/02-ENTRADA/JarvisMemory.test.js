// C-055 — JarvisMemory sobre SharedMemory in-memory (mesmo padrão do bus test).
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';
import { Database, runMigrations, SharedMemory } from '@overclock-app/bus';
import { JarvisMemory, slugifyMemoryKey } from './JarvisMemory.js';
function tmpDb() {
    return join(tmpdir(), `jarvis-mem-test-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
}
describe('slugifyMemoryKey', () => {
    it('normalizes accents, case and separators into a stable kebab slug', () => {
        expect(slugifyMemoryKey('Modelo Preferido')).toBe('modelo-preferido');
        expect(slugifyMemoryKey('missão do João!')).toBe('missao-do-joao');
        expect(slugifyMemoryKey('  ')).toBe('fato');
    });
});
describe('JarvisMemory', () => {
    let dbPath;
    let db;
    let jm;
    beforeEach(() => {
        dbPath = tmpDb();
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');
        runMigrations(db);
        const store = new SharedMemory(db);
        jm = new JarvisMemory(() => store);
    });
    afterEach(() => {
        db.close();
        for (const suffix of ['', '-wal', '-shm']) {
            const f = dbPath + suffix;
            if (existsSync(f))
                unlinkSync(f);
        }
    });
    it('remember → recall round-trip', () => {
        const r = jm.remember('Modelo Preferido', 'sempre sonnet');
        expect(r).toEqual({ ok: true, key: 'modelo-preferido' });
        const all = jm.recall();
        expect(all).toHaveLength(1);
        expect(all[0].key).toBe('modelo-preferido');
        expect(all[0].content).toBe('sempre sonnet');
    });
    it('same key updates the fact (supersedes) instead of duplicating', () => {
        jm.remember('default-panes', '3 panes');
        jm.remember('default-panes', '2 panes');
        const all = jm.recall();
        expect(all).toHaveLength(1);
        expect(all[0].content).toBe('2 panes');
    });
    it('recall filters by substring in content or key', () => {
        jm.remember('modelo-preferido', 'sempre sonnet');
        jm.remember('projeto-principal', 'o projeto principal é overclock-app');
        expect(jm.recall('overclock')).toHaveLength(1);
        expect(jm.recall('Modelo Preferido')).toHaveLength(1);
        expect(jm.recall('inexistente')).toHaveLength(0);
    });
    it('forget by exact key and by content substring', () => {
        jm.remember('modelo-preferido', 'sempre sonnet');
        jm.remember('projeto-principal', 'o projeto principal é overclock-app');
        expect(jm.forget('modelo-preferido')).toEqual({ ok: true, forgotten: ['modelo-preferido'] });
        expect(jm.forget('overclock-app')).toEqual({ ok: true, forgotten: ['projeto-principal'] });
        expect(jm.recall()).toHaveLength(0);
        expect(jm.forget('nada')).toEqual({ ok: false, forgotten: [] });
    });
    it('contextBlock lists facts and is empty without memories', () => {
        expect(jm.contextBlock()).toBe('');
        jm.remember('modelo-preferido', 'sempre sonnet');
        const block = jm.contextBlock();
        expect(block).toContain('MEMÓRIA PERSISTIDA');
        expect(block).toContain('- [modelo-preferido] sempre sonnet');
    });
    it('degrades gracefully when the store is absent', () => {
        const off = new JarvisMemory(() => undefined);
        expect(off.available).toBe(false);
        expect(off.remember('k', 'v').ok).toBe(false);
        expect(off.recall()).toHaveLength(0);
        expect(off.forget('k')).toEqual({ ok: false, forgotten: [] });
        expect(off.contextBlock()).toBe('');
    });
});
//# sourceMappingURL=JarvisMemory.test.js.map