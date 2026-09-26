import { describe, it, expect } from 'vitest';
import { normalizePaneWriteText, shouldUseBracketedPaste, panePastePayload } from './panePaste.js';
describe('panePaste — F-169 (briefing multi-linha chegava cortado)', () => {
    it('normaliza CRLF/CR pra LF (CR cru submeteria no meio do texto)', () => {
        expect(normalizePaneWriteText('a\r\nb\rc\nd')).toBe('a\nb\nc\nd');
    });
    it('bracketed: embrulha o payload em \\x1b[200~ … \\x1b[201~ preservando os \\n internos', () => {
        const payload = panePastePayload('linha 1\nlinha 2\nlinha 3', 'bracketed');
        expect(payload).toBe('\x1b[200~linha 1\nlinha 2\nlinha 3\x1b[201~');
    });
    it('direct: só normaliza, sem wrapper', () => {
        expect(panePastePayload('oi\r\ntchau', 'direct')).toBe('oi\ntchau');
    });
    it('agente TUI (claude/codex/gemini) com texto → bracketed', () => {
        expect(shouldUseBracketedPaste('claude', 'briefing')).toBe(true);
        expect(shouldUseBracketedPaste('codex', 'briefing')).toBe(true);
    });
    it('shell ou agente desconhecido → direct (sem TUI garantido)', () => {
        expect(shouldUseBracketedPaste('shell', 'briefing')).toBe(false);
        expect(shouldUseBracketedPaste(undefined, 'briefing')).toBe(false);
    });
    it('texto vazio → direct (nada a proteger)', () => {
        expect(shouldUseBracketedPaste('claude', '')).toBe(false);
    });
});
//# sourceMappingURL=panePaste.test.js.map