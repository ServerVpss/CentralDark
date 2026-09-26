import { describe, it, expect } from 'vitest';
import { voiceSafeText } from './voiceSafeText.js';
describe('voiceSafeText — C-062 (a voz nunca soletra sintaxe)', () => {
    it('strips o ponteiro técnico do wake message de handoff, preserva a linha humana', () => {
        const wake = '✓ pane-253 · F-065: Conta 2 no ar e operacional Mais detalhes: mcp__overclock__handoff_list({ids:["h-5t"]})';
        const out = voiceSafeText(wake);
        expect(out).toBe('✓ pane-253 · F-065: Conta 2 no ar e operacional');
        expect(out).not.toContain('mcp__');
        expect(out).not.toContain('{');
    });
    it('strips chamada mcp__ com JSON aninhado 1 nível', () => {
        const out = voiceSafeText('faça via mcp__overclock__pane_write({paneId:"pane-1",opts:{a:1}}) agora');
        expect(out).not.toContain('mcp__');
        expect(out).not.toContain('paneId');
    });
    it('strips nome mcp__ solto (sem args)', () => {
        expect(voiceSafeText('use mcp__overclock__pane_list pra ver')).toBe('use pra ver');
    });
    it('strips bloco de código cercado inteiro', () => {
        const out = voiceSafeText('resultado:\n```ts\nconst x = 1\n```\ntudo verde');
        expect(out).toBe('resultado: tudo verde');
    });
    it('strips JSON de payload solto', () => {
        const out = voiceSafeText('retorno {"ok":true,"count":7} recebido');
        expect(out).toBe('retorno recebido');
    });
    it('inline code: palavra simples é mantida, sintaxe some', () => {
        expect(voiceSafeText('a branch `main` passou')).toBe('a branch main passou');
        expect(voiceSafeText('rode `pnpm run dev()` aí')).toBe('rode aí');
    });
    it('texto humano puro passa intocado', () => {
        const human = 'o pane 253 terminou: Conta 2 no ar e operacional';
        expect(voiceSafeText(human)).toBe(human);
    });
});
//# sourceMappingURL=voiceSafeText.test.js.map