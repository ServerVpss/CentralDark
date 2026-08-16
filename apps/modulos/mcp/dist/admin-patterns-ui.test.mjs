import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { injectPatternAdmin } from './admin-patterns-ui.js';
const TEMPLATE = `<!doctype html><style>__PATTERN_ADMIN_STYLE__</style><nav>__PATTERN_ADMIN_TAB__</nav><main>__PATTERN_ADMIN_PANE__</main><script>__PATTERN_ADMIN_SCRIPT__</script>`;
function fixture(title) {
    return {
        schema_version: 1,
        mode: 'PATTERN_LIBRARY_LONGITUDINAL',
        status: 'PATTERNS_AVAILABLE',
        head_sha: 'a'.repeat(40),
        updated_at: '2026-08-16T03:00:00.000Z',
        candidate_count: 2,
        pattern_count: 1,
        session_count: 2,
        source_count: 2,
        private_reasoning_included: false,
        raw_session_content_included: false,
        candidates: [],
        patterns: [],
        drawers: [{
                kind: 'RULE',
                id: 'regras',
                label: 'Regras',
                purpose: 'Evitar repetir erro conhecido.',
                candidate_count: 0,
                pattern_count: 1,
                items: [{
                        id: 'learned-safe',
                        kind: 'RULE',
                        drawer: 'regras',
                        status: 'READY_FOR_REVALIDATION',
                        target: 'docs/CONSCIENCIA/APRENDIZADOS.md',
                        title,
                        what_was_learned: [title],
                        how_to_use: ['consultar antes de repetir a mesma classe de erro'],
                        shared_tokens: ['repetir', 'erro', 'consultar'],
                        first_seen: '2026-08-16T01:00:00.000Z',
                        last_seen: '2026-08-16T02:00:00.000Z',
                        session_ids: ['session-a', 'session-b'],
                        session_count: 2,
                        sources: ['tool:a', 'tool:b'],
                        source_count: 2,
                        source_classes: ['TOOL_MEASURED'],
                        member_candidate_ids: ['a', 'b'],
                        member_fingerprints: ['1'.repeat(64), '2'.repeat(64)],
                        candidate_count: 2,
                        observation_count: 2,
                        similarity_floor: 0.8,
                        verified_consumer_evidence_count: 1,
                        verified_owner_evidence_count: 1,
                        same_head_revalidation_required: true,
                        meta_lupa_required: true,
                        pattern_is_proof: false,
                    }],
            }],
    };
}
test('Admin injeta biblioteca sanitizada sem permitir fechamento de script pelo conteúdo', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-admin-patterns-'));
    const file = path.join(dir, 'pattern-library.json');
    const old = process.env.CENTRALDARK_PATTERN_LIBRARY_PATH;
    try {
        const dangerous = '</script><script>globalThis.__patternPwned=true</script>';
        fs.writeFileSync(file, `${JSON.stringify(fixture(dangerous), null, 2)}\n`, 'utf8');
        process.env.CENTRALDARK_PATTERN_LIBRARY_PATH = file;
        const html = injectPatternAdmin(TEMPLATE);
        assert.equal(html.includes('__PATTERN_ADMIN_'), false);
        assert.equal(html.includes('__PATTERN_LIBRARY_JSON__'), false);
        assert.equal(html.includes(dangerous), false);
        assert.equal(html.includes('\\u003c/script\\u003e'), true);
        assert.equal(html.includes('Escritório de padrões'), true);
        assert.equal(html.includes('PATTERNS_AVAILABLE'), true);
    }
    finally {
        if (old === undefined)
            delete process.env.CENTRALDARK_PATTERN_LIBRARY_PATH;
        else
            process.env.CENTRALDARK_PATTERN_LIBRARY_PATH = old;
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
test('Admin continua abrindo com biblioteca ausente', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'centraldark-admin-patterns-empty-'));
    const old = process.env.CENTRALDARK_PATTERN_LIBRARY_PATH;
    try {
        process.env.CENTRALDARK_PATTERN_LIBRARY_PATH = path.join(dir, 'missing.json');
        const html = injectPatternAdmin(TEMPLATE);
        assert.equal(html.includes('__PATTERN_ADMIN_'), false);
        assert.equal(html.includes('"status":"EMPTY"'), true);
        assert.equal(html.includes('private_reasoning_included'), true);
    }
    finally {
        if (old === undefined)
            delete process.env.CENTRALDARK_PATTERN_LIBRARY_PATH;
        else
            process.env.CENTRALDARK_PATTERN_LIBRARY_PATH = old;
        fs.rmSync(dir, { recursive: true, force: true });
    }
});
//# sourceMappingURL=admin-patterns-ui.test.mjs.map