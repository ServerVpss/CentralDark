export type ElementPurpose = "read" | "automation" | "computer-use";
export type ElementFormat = "outline" | "automation" | "preferred";
/** Map an explicit agent purpose to an element projection.
 *
 * An omitted purpose deliberately delegates to the desktop capture profile.
 * The old `computer-use` spelling remains an input alias for existing agents.
 */
export declare function formatForElementPurpose(purpose: unknown): ElementFormat;
