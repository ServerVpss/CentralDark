/**
 * Pure builder for the wake message poked into an orchestrator's PTY input on a
 * worker handoff (F-012). Extracted from attachHandoffDelivery's inline closure
 * (sidecar/core.ts) so the human-legibility contract — pane + item reference (when
 * the worker's summary cites one) + human summary + pointer — is unit-testable
 * without a live sidecar/PTY/HandoffRegistry.
 */
/** Matches item ids the repo's cartão convention uses: F-012, C-012.1, T-003. */
const ITEM_REF_RE = /\b([FCT]-\d{3}(?:\.\d+)?)\b/;
/** Extracts the FIRST item id a worker's summary cites, if any (e.g. "F-012" from
 *  "corrigido conforme F-012, testes verdes"). Undefined when the summary is silent
 *  on which item it addresses — the wake message then omits the item segment rather
 *  than guessing. */
export function extractItemRef(summary) {
    return ITEM_REF_RE.exec(summary)?.[1];
}
/**
 * C-062: the human line and the technical pointer are built as SEPARATE fields
 * (humanResult pattern from C-057) so a voice consumer can narrate `human` and
 * drop `technical`. buildWakeMessage joins them back into the single PTY line.
 */
export function buildWakeMessageParts(entry, squadRole) {
    const isClarify = entry.status === 'awaiting_clarification';
    const isStalled = entry.status === 'stalled';
    const glyph = entry.status === 'done' ? '✓'
        : entry.status === 'progress' ? '▸'
            : isClarify ? '❓'
                : isStalled ? '…'
                    : entry.status === 'blocked' ? '⚠'
                        : entry.status === 'error' || entry.status === 'dead' ? '✗'
                            : '⚠'; // F-045: status ausente/desconhecido ≠ falha — não alarme com ✗
    const paneLabel = squadRole ?? entry.paneId.split('_').pop() ?? entry.paneId;
    const itemRef = extractItemRef(entry.summary);
    const label = itemRef ? `${paneLabel} · ${itemRef}` : paneLabel;
    let body;
    let technical;
    if (isClarify) {
        const arts = entry.artifacts;
        body = `pergunta: "${arts?.question ?? entry.summary}" — repasse ao humano e escreva a resposta de volta no pane. O pane está vivo, não respawne.`;
        technical = `Responda via mcp__overclock__pane_write({paneId:"${entry.paneId}",text:"<resposta>"})`;
    }
    else {
        // F-045: legacy/malformed registry entries may lack summary AND status — never
        // render "status=undefined"; say what actually happened and point at handoff_list.
        body = entry.summary || (entry.status ? `status=${entry.status}` : 'handoff sem summary/status (registro incompleto)');
        if (entry.status === 'blocked')
            body += ' — precisa da sua orientação.';
        else if (entry.status === 'error' || entry.status === 'dead')
            body += ' — não declare done; investigue ou re-invoque.';
        else if (isStalled)
            body += ' — vivo mas quieto; sonde antes de agir.';
        // F-169: o wake é BY DESIGN um digest de 1 linha — orquestradores de usuário tratavam
        // o resumo como a resposta completa do worker ("resposta chegou cortada"). Dizer
        // explicitamente que isto é resumo e onde mora o resultado íntegro.
        technical = `Isto é só o resumo; resultado COMPLETO via mcp__overclock__handoff_list({ids:["${entry.id}"]})`;
    }
    return { human: `${glyph} ${label}: ${body}`, technical };
}
/** Builds the raw (pre-sanitize) wake message text poked into the orchestrator's input. */
export function buildWakeMessage(entry, squadRole) {
    const { human, technical } = buildWakeMessageParts(entry, squadRole);
    return technical ? `${human} ${technical}` : human;
}
//# sourceMappingURL=handoffWakeMessage.js.map