/**
 * F-169: bracketed-paste payload para pane_write — port do trio do Electron
 * (bootstrapMainProcess ~5475-5497: normalizePaneWriteText / shouldUseBracketedPaste /
 * panePastePayload) que ficou pra trás no strangler do sidecar Tauri.
 *
 * Sem bracketed paste, o texto é digitado CRU no PTY: cada \n age como Enter no TUI
 * do CLI — um briefing multi-linha submete no primeiro \n e o resto vira mensagem
 * seguinte (ou é engolido pelo TUI já em turno). Sintoma real (Discord, v1.0.4):
 * "o prompt do orquestrador está indo cortado". Com o wrap \x1b[200~…\x1b[201~ o TUI
 * ingere o bloco inteiro como UM paste (byte-equivalente ao Cmd+V do xterm.js —
 * inocentado na investigação do F-015) e só o \r explícito do writePane submete.
 */
export function normalizePaneWriteText(text) {
    return text.replace(/\r\n?/g, '\n');
}
/** Shell não tem TUI com bracketed paste garantido; agente desconhecido (sem config)
 *  cai em direct por segurança — mesmo critério do Electron. */
export function shouldUseBracketedPaste(agent, text) {
    if (!agent || agent === 'shell')
        return false;
    return text.length > 0;
}
export function panePastePayload(text, pasteMode) {
    const normalized = normalizePaneWriteText(text);
    if (pasteMode === 'bracketed')
        return `\x1b[200~${normalized}\x1b[201~`;
    return normalized;
}
//# sourceMappingURL=panePaste.js.map