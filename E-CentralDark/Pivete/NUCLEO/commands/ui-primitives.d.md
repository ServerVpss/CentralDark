# COMANDO - ui-primitives.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.cursor\skills-cursor\canvas\sdk\ui-primitives.d.ts
**SHA:** a53c17d2c1f87574
**Timestamp:** 2026-08-28T02:38:08.456151
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- * <Stack gap={16}>
- * <Row gap={8} align="center">
- * <Row gap={8}>
- * <Row gap={8}>
- * <Grid columns={3} gap={16}>

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * UI primitives for `cursor/canvas`. Styling follows the Cursor dark theme; no extra packages required.
 */
import { type CSSProperties, type JSX, type ReactNode } from "react";
/**
 * Shallow-merge style objects with `override` taking precedence.
 *
 * Use for small tweaks on built-in components (e.g. extra padding or width).
 * **Do not** use this to build elaborate custom chrome — prefer the built-in
 * components and flat solid token colors. No gradients, no box-shadows.
 *
 * @example
 * ```tsx
 * // Good — minor override on a built-in component
 * <CardBody style={mergeStyle({ padding: 16 })}>…</CardBody>
 *
 * // Bad — hand-rolled decorative styling
 * <div style={mergeStyle(base, { background: "linear-gradient(…)" })}>…</div>
 * ```
 */
export declare function mergeStyle(base: CSSProperties, override?: CSSProperties): CSSProperties;
export type StackProps = {
    children?: ReactNode;
    gap?: number;
    style?: CSSProperties;
};
/**
 * Vertical flex column. Use as the top-level page wrapper or to stack cards/sections.
 *
 * @example
 * ```tsx
 * <Stack gap={16}>
 *   <H1>Dashboard</H1>
 *   <Card>…</Card>
 *   <Card>…</Card>
 * </Stack>
 * ```
 */
export declare function Stack({ children, gap, style }: StackProps): JSX.Element;
export type RowProps = {
    children?: ReactNode;
    gap?: number;
    align?: "start" | "center" | "end" | "stretch";
    justify?: "start" | "center" | "end" | "space-between";
    wrap?: boolean;
    style?: CSSProperties;
};
/**
 * Horizontal flex row. Use for inline groups of buttons, badges, or metadata.
 *
 * @example
 * ```tsx
 * <Row gap={8} align="center">
 *   <Button variant="primary">Save</Button>
 *   <Button variant="ghost">Cancel</Button>
 * </Row>
 * ```
 */
export declare function Row({ children, gap, align, justify, wrap, style }: RowProps): JSX.Element;
/**
 * CSS Grid with tokenized gap. Prefer this over `Row` + `wrap` when you need a
 * fixed number of equal-width columns: wrapped flex items can land on their
 * own row and grow to full width (`flex-grow`), which is often surprising for
 * boards and dashboards.
 */
export type GridProps = {
    children?: ReactNode;
    /**
     * Equal columns: pass a number (uses `repeat(n, minmax(0, 1fr))`), or a CSS
     * `grid-template-columns` string (e.g. `"1fr 2fr"` or `"minmax(0, 200px) 1fr"`).
     */
    columns: number | string;
    gap?: number;
    align?: "start" | "center" | "end" | "stretch";
    style?: CSSProperties;
};
export declare function Grid({ children, columns, gap, align, style }: GridProps): JSX.Element;
export type DividerProps = {
    style?: CSSProperties;
};
/**
 * Horizontal line for visually separating sections. Uses `stroke.tertiary`
 * to match the Card/Table hairline weight.
 *
 * @example
 * ```tsx
 * <Stack>
 *   <Text>Section one</Text>
 *   <Divider />
 *   <Text>Section two</Text>
 * </Stack>
 * ```
 */
export declare function Divider({ style }: DividerProps): JSX.Element;
/**
 * Flex spacer that pushes siblings apart. Place inside a `Row` to push
 * trailing content to the right edge.
 *
 * @example
 * ```tsx
 * <Row>
 *   <Text>Title</Text>
 *   <Spacer />
 *   <Button variant="primary">Save</Button>
 * </Row>
 * ```
 */
export declare function Spacer(): JSX.Element;
/** Horizontal alignment for a table column. */
export type TableColumnAlign = "left" | "center" | "right";
/** Semantic tone for a table row — marker dot in the first column. */
export type TableRowTone = "success" | "danger" | "warning" | "info" | "neutral";
export type TableProps = {
    /** Column titles, left to right. Column count is fixed by this array. */
    headers: ReactNode[];
    /**
     * Body rows. Each row is an array of cells in the same order as `headers`.
     * Shorter rows are padded with empty cells; extra cells are ignored.
     */
    rows: ReactNode[][];
    /** Optional alignment per column index (headers/rows). Defaults to left. */
    columnAlign?: Array<TableColumnAlign | undefined>;
    /**
     * Optional semantic tone per row index. Renders a small colored dot before
     * the first column's content (no row fill or border). Sparse: `undefined`
     * entries are unstyled.
     */
    rowTone?: Array<TableRowTone | undefined>;
    /** When true (default), bordered rounded shell with horizontal scroll if needed. */
    framed?: boolean;
    /** Alternate subtle fill on even rows for easier scanning in large tables. */
    striped?: boolean;
    /** Stick the header row when the framed container scrolls vertically. */
    stickyHeader?: boolean;
    style?: CSSProperties;
    /** Shown in a single spanning cell when `rows` is empty. */
    emptyMessage?: ReactNode;
};
/**
 * Data table with column headers and rows. Framed by default with its own
 * bordered container — **do not wrap in a Card** unless the card itself is
 * a named entity that happens to contain a table. Render directly under a
 * heading in the normal case.
 *
 * @example
 * ```tsx
 * // Good — table dire
```