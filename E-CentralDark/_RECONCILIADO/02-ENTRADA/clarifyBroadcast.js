/**
 * clarifyBroadcastPayload — extract a pane:clarify push payload from a HandoffRegistry
 * submit entry, or return null if the entry is not an awaiting_clarification carrying
 * a non-empty suggestions array.
 */
export function clarifyBroadcastPayload(entry) {
    if (entry.status !== 'awaiting_clarification')
        return null;
    const raw = entry.artifacts?.suggestions;
    if (!Array.isArray(raw))
        return null;
    const suggestions = raw.map((s) => String(s)).filter((s) => s.trim().length > 0);
    if (suggestions.length === 0)
        return null;
    const question = String(entry.artifacts?.question ?? '');
    return { paneId: entry.paneId, question, suggestions };
}
//# sourceMappingURL=clarifyBroadcast.js.map