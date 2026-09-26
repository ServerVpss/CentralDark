/**
 * Unit tests for resolveQuery — the 0 / 1 / 2+ match contract.
 *
 * These cover the never-navigate-on-ambiguity invariant that was called out in
 * the code review: exact-id beats exact-title beats contains, and anything other
 * than exactly-1 result must NOT cause navigation.
 */
import { describe, it, expect } from 'vitest';
import { resolveQuery } from './navigateResolver.js';
// Items where id is a stable key and title is the human-readable label.
const ws = [
    { id: '/home/user/alpha', title: 'alpha' },
    { id: '/home/user/beta', title: 'beta' },
    { id: '/home/user/alpha-project', title: 'alpha-project' },
    { id: '/home/user/gamma', title: 'gamma' },
];
const idOf = (item) => item.id;
const titleOf = (item) => item.title;
describe('resolveQuery — 0 matches', () => {
    it('returns [] when nothing matches by id, exact title, or contains', () => {
        const result = resolveQuery(ws, idOf, titleOf, 'zzzzzz');
        expect(result).toHaveLength(0);
    });
});
describe('resolveQuery — 1 match (navigation green-light)', () => {
    it('exact id match returns exactly that item', () => {
        const result = resolveQuery(ws, idOf, titleOf, '/home/user/beta');
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('/home/user/beta');
    });
    it('exact title match returns exactly that item (no id matches)', () => {
        const result = resolveQuery(ws, idOf, titleOf, 'gamma');
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('gamma');
    });
    it('contains match returns a single item when only one title contains the substring', () => {
        // 'gamm' only matches 'gamma'
        const result = resolveQuery(ws, idOf, titleOf, 'gamm');
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('gamma');
    });
});
describe('resolveQuery — 2+ matches (ambiguous — caller MUST reject navigation)', () => {
    it('contains returns all items whose title contains the substring', () => {
        // 'alpha' and 'alpha-project' both contain 'alph' (no id or exact-title match for 'alph')
        const result = resolveQuery(ws, idOf, titleOf, 'alph');
        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(result.map((r) => r.title)).toContain('alpha');
        expect(result.map((r) => r.title)).toContain('alpha-project');
    });
    it('exact title ambiguity: two items with same exact title both returned', () => {
        const dup = [
            { id: 'id-1', title: 'My Project' },
            { id: 'id-2', title: 'My Project' },
        ];
        const result = resolveQuery(dup, (o) => o.id, (o) => o.title, 'My Project');
        expect(result).toHaveLength(2);
    });
});
describe('resolveQuery — precedence ladder', () => {
    const pool = [
        { id: 'target-id', title: 'Unrelated title' }, // id exactly matches query
        { id: 'exact-t', title: 'target-id' }, // title exactly matches query
        { id: 'other-id', title: 'target-id contains' }, // title merely contains query
    ];
    const pId = (o) => o.id;
    const pTitle = (o) => o.title;
    const query = 'target-id';
    it('exact-id beats exact-title beats contains', () => {
        const result = resolveQuery(pool, pId, pTitle, query);
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('target-id');
    });
    it('exact-title fires when no exact-id match', () => {
        const noIdExact = [
            { id: 'other-1', title: 'target-id' }, // exact title match
            { id: 'other-2', title: 'target-id extra' }, // contains only
        ];
        const result = resolveQuery(noIdExact, pId, pTitle, query);
        expect(result).toHaveLength(1);
        expect(result[0].title).toBe('target-id');
    });
    it('contains fires as last resort — 2 results signals ambiguity', () => {
        const containsOnly = [
            { id: 'a', title: 'foo target-id bar' },
            { id: 'b', title: 'baz target-id qux' },
        ];
        const result = resolveQuery(containsOnly, (o) => o.id, (o) => o.title, query);
        expect(result).toHaveLength(2);
    });
});
//# sourceMappingURL=navigateResolver.test.js.map