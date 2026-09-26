/**
 * clarifyBroadcastPayload — extract a pane:clarify push payload from a HandoffRegistry
 * submit entry, or return null if the entry is not an awaiting_clarification carrying
 * a non-empty suggestions array.
 */
export interface ClarifySubmitEntry {
    paneId: string;
    status: string;
    artifacts?: {
        question?: unknown;
        suggestions?: unknown;
    } | Record<string, unknown>;
}
export interface ClarifyPushPayload {
    paneId: string;
    question: string;
    suggestions: string[];
}
export declare function clarifyBroadcastPayload(entry: ClarifySubmitEntry): ClarifyPushPayload | null;
//# sourceMappingURL=clarifyBroadcast.d.ts.map