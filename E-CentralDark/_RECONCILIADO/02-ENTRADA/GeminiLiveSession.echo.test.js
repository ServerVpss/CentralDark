import { describe, it, expect } from 'vitest';
import { normEcho, isEchoOf } from './GeminiLiveSession.js';
// F-126: supressão de auto-eco — o TTS do Jarvis volta pelo mic, é transcrito como "fala do
// usuário" (prefixo exato do que ele acabou de falar) e dispara loop. isEchoOf descarta esse
// eco SEM matar o barge-in real (fala DIFERENTE do TTS).
describe('normEcho', () => {
    it('minúsculas, tira acento e pontuação, colapsa espaço', () => {
        expect(normEcho('Quero criar um, CRIE!')).toBe('quero criar um crie');
        expect(normEcho('  Olá  Mundo  ')).toBe('ola mundo');
    });
});
describe('isEchoOf (F-126)', () => {
    // Os casos exatos do trace: o TTS falou "quero criar um crie uma pasta chamada 002-agentic"
    // e o mic devolveu prefixos dele como se fossem fala do usuário.
    const spoken = normEcho('quero criar um crie uma pasta chamada 002-agentic');
    it('descarta prefixo exato do TTS recém-falado (eco)', () => {
        expect(isEchoOf(spoken, 'Quero criar um')).toBe(true);
        expect(isEchoOf(spoken, 'quero criar')).toBe(true);
        expect(isEchoOf(spoken, 'cria uma')).toBe(true);
        expect(isEchoOf(spoken, 'pasta chamada 002-agentic')).toBe(true);
    });
    it('deixa passar barge-in REAL (fala diferente do TTS)', () => {
        expect(isEchoOf(spoken, 'para tudo agora')).toBe(false);
        expect(isEchoOf(spoken, 'desativa o jarvis')).toBe(false);
        expect(isEchoOf(spoken, 'abre a missão de vendas')).toBe(false);
    });
    it('fuzzy: eco com 1 palavra trocada pelo STT ainda casa (>=80%)', () => {
        // 4 palavras significativas, 3 presentes na janela falada = 75% < 80% → passa;
        // 5 palavras, 4 presentes = 80% → eco.
        expect(isEchoOf(spoken, 'quero criar uma pasta nova')).toBe(true);
    });
    it('não é eco quando janela vazia ou input curto demais', () => {
        expect(isEchoOf('', 'quero criar um')).toBe(false);
        expect(isEchoOf(spoken, 'oi')).toBe(false);
        expect(isEchoOf(spoken, 'sim')).toBe(false);
    });
});
//# sourceMappingURL=GeminiLiveSession.echo.test.js.map