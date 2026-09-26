/**
 * Pure builder for the wake message poked into an orchestrator's PTY input on a
 * worker handoff (F-012). Extracted from attachHandoffDelivery's inline closure
 * (sidecar/core.ts) so the human-legibility contract — pane + item reference (when
 * the worker's summary cites one) + human summary + pointer — is unit-testable
 * without a live sidecar/PTY/HandoffRegistry.
 */
/** Extracts the FIRST item id a worker's summary cites, if any (e.g. "F-012" from
 *  "corrigido conforme F-012, testes verdes"). Undefined when the summary is silent
 *  on which item it addresses — the wake message then omits the item segment rather
 *  than guessing. */
export declare function extractItemRef(summary: string): string | undefined;
export interface WakeMessageEntry {
    paneId: string;
    id?: string;
    summary: string;
    status: 'done' | 'blocked' | 'error' | 'dead' | 'awaiting_clarification' | 'stalled' | 'progress';
    artifacts?: unknown;
}
export interface WakeMessageParts {
    /** Voice-safe sentence (pane + item + human summary) — no tool syntax, no JSON. */
    human: string;
    /** Tool-call syntax the orchestrator CLI needs; a voice layer must NEVER narrate it. */
    technical: string;
}
/**
 * C-062: the human line and the technical pointer are built as SEPARATE fields
 * (humanResult pattern from C-057) so a voice consumer can narrate `human` and
 * drop `technical`. buildWakeMessage joins them back into the single PTY line.
 */
export declare function buildWakeMessageParts(entry: WakeMessageEntry, squadRole: string | undefined): WakeMessageParts;
/** Builds the raw (pre-sanitize) wake message text poked into the orchestrator's input. */
export declare function buildWakeMessage(entry: WakeMessageEntry, squadRole: string | undefined): string;
//# sourceMappingURL=handoffWakeMessage.d.ts.map