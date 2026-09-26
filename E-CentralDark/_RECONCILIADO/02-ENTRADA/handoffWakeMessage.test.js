import { describe, it, expect } from 'vitest';
import { extractItemRef, buildWakeMessage, buildWakeMessageParts } from './handoffWakeMessage.js';
describe('extractItemRef', () => {
    it('finds a bug item id (F-XXX)', () => {
        expect(extractItemRef('corrigido conforme F-012, testes verdes')).toBe('F-012');
    });
    it('finds a feature sub-item id (C-0XX.N)', () => {
        expect(extractItemRef('fatia C-012.1 concluída')).toBe('C-012.1');
    });
    it('finds a task item id (T-XXX)', () => {
        expect(extractItemRef('ver T-003 pra contexto')).toBe('T-003');
    });
    it('returns undefined when the summary cites no item', () => {
        expect(extractItemRef('build passou, tudo verde')).toBeUndefined();
    });
});
describe('buildWakeMessage', () => {
    it('embeds pane label + item ref + summary + pointer for a done handoff', () => {
        const msg = buildWakeMessage({ paneId: 'pane-16', id: 'h-b', summary: 'corrigido conforme F-012, testes verdes', status: 'done' }, undefined);
        expect(msg).toBe('✓ pane-16 · F-012: corrigido conforme F-012, testes verdes Isto é só o resumo; resultado COMPLETO via mcp__overclock__handoff_list({ids:["h-b"]})');
    });
    it('omits the item segment when the summary cites no item', () => {
        const msg = buildWakeMessage({ paneId: 'pane-16', id: 'h-b', summary: 'build passou', status: 'done' }, undefined);
        expect(msg).toBe('✓ pane-16: build passou Isto é só o resumo; resultado COMPLETO via mcp__overclock__handoff_list({ids:["h-b"]})');
    });
    it('prefers squadRole over the paneId as the label', () => {
        const msg = buildWakeMessage({ paneId: 'pane-16', id: 'h-b', summary: 'ok', status: 'done' }, 'registrador');
        expect(msg.startsWith('✓ registrador:')).toBe(true);
    });
    it('blocked appends guidance instead of the standard pointer-only tail', () => {
        const msg = buildWakeMessage({ paneId: 'pane-16', id: 'h-b', summary: 'preso em X', status: 'blocked' }, undefined);
        expect(msg).toContain('precisa da sua orientação.');
    });
    it('awaiting_clarification body carries the question, no pointer tail', () => {
        const msg = buildWakeMessage({ paneId: 'pane-16', id: 'h-b', summary: 'fallback', status: 'awaiting_clarification', artifacts: { question: 'qual porta?' } }, undefined);
        expect(msg).toContain('pergunta: "qual porta?"');
        expect(msg).not.toContain('handoff_list');
    });
});
describe('buildWakeMessageParts — C-062 voice-safe', () => {
    it('human line carries pane + item + summary, ZERO tool syntax', () => {
        const { human, technical } = buildWakeMessageParts({ paneId: 'pane-16', id: 'h-b', summary: 'corrigido conforme F-012, testes verdes', status: 'done' }, undefined);
        expect(human).toBe('✓ pane-16 · F-012: corrigido conforme F-012, testes verdes');
        expect(human).not.toContain('mcp__');
        expect(human).not.toContain('{');
        expect(technical).toContain('mcp__overclock__handoff_list');
    });
    it('clarify: human line has the question in plain words; pane_write syntax lives in technical', () => {
        const { human, technical } = buildWakeMessageParts({ paneId: 'pane-16', id: 'h-b', summary: 'fb', status: 'awaiting_clarification', artifacts: { question: 'qual porta?' } }, undefined);
        expect(human).toContain('pergunta: "qual porta?"');
        expect(human).not.toContain('mcp__');
        expect(technical).toContain('mcp__overclock__pane_write');
    });
    it('buildWakeMessage = human + technical na mesma linha (contrato PTY intocado)', () => {
        const entry = { paneId: 'pane-16', id: 'h-b', summary: 'ok', status: 'done' };
        const { human, technical } = buildWakeMessageParts(entry, undefined);
        expect(buildWakeMessage(entry, undefined)).toBe(`${human} ${technical}`);
    });
});
describe('buildWakeMessage — F-045 registro incompleto', () => {
    it('nunca imprime status=undefined nem alarma com ✗ quando summary/status faltam', () => {
        const msg = buildWakeMessage({ paneId: 'pane-170', id: 'h-2p', summary: '', status: undefined }, undefined);
        expect(msg).not.toContain('undefined');
        expect(msg.startsWith('✗')).toBe(false);
        expect(msg).toContain('registro incompleto');
    });
});
//# sourceMappingURL=handoffWakeMessage.test.js.map