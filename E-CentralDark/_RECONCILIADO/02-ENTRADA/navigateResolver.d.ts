/**
 * resolveQuery — pure matching logic for the overclock_navigate tool.
 *
 * Precedence: exact id → exact title → title contains (case-insensitive).
 * Returns ALL matching items so the caller can enforce "exactly 1 or reject".
 *
 * Extracted to a testable module so the sidecar vitest harness can cover the
 * 0 / 1 / 2+ match contract without standing up the full HTTP server.
 */
export declare function resolveQuery<T>(items: T[], idOf: (item: T) => string, titleOf: (item: T) => string, query: string): T[];
//# sourceMappingURL=navigateResolver.d.ts.map