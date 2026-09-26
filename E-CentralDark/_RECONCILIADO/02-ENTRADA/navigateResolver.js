/**
 * resolveQuery — pure matching logic for the overclock_navigate tool.
 *
 * Precedence: exact id → exact title → title contains (case-insensitive).
 * Returns ALL matching items so the caller can enforce "exactly 1 or reject".
 *
 * Extracted to a testable module so the sidecar vitest harness can cover the
 * 0 / 1 / 2+ match contract without standing up the full HTTP server.
 */
export function resolveQuery(items, idOf, titleOf, query) {
    const norm = query.toLowerCase();
    const idExact = items.filter((item) => idOf(item) === query);
    if (idExact.length > 0)
        return idExact;
    const titleExact = items.filter((item) => titleOf(item).toLowerCase() === norm);
    if (titleExact.length > 0)
        return titleExact;
    return items.filter((item) => titleOf(item).toLowerCase().includes(norm));
}
//# sourceMappingURL=navigateResolver.js.map