# OUTRO - magic-string.es.d.mts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\magic-string@0.30.21@@@1\dist\magic-string.es.d.mts
**SHA:** 2be2227c3810dfd8
**Timestamp:** 2026-08-28T02:24:45.220723
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- move(start: number, end: number, index: number): this;
- start: number,
- update(start: number, end: number, content: string, options?: boolean | UpdateOptions): this;
- remove(start: number, end: number): this;
- reset(start: number, end: number): this;
- slice(start: number, end: number): string;
- snip(start: number, end: number): this;

### Ouro Bruto (primeiros 5000 chars)
```
export interface BundleOptions {
	intro?: string;
	separator?: string;
}

export interface SourceMapOptions {
	/**
	 * Whether the mapping should be high-resolution.
	 * Hi-res mappings map every single character, meaning (for example) your devtools will always
	 * be able to pinpoint the exact location of function calls and so on.
	 * With lo-res mappings, devtools may only be able to identify the correct
	 * line - but they're quicker to generate and less bulky.
	 * You can also set `"boundary"` to generate a semi-hi-res mappings segmented per word boundary
	 * instead of per character, suitable for string semantics that are separated by words.
	 * If sourcemap locations have been specified with s.addSourceMapLocation(), they will be used here.
	 */
	hires?: boolean | 'boundary';
	/**
	 * The filename where you plan to write the sourcemap.
	 */
	file?: string;
	/**
	 * The filename of the file containing the original source.
	 */
	source?: string;
	/**
	 * Whether to include the original content in the map's sourcesContent array.
	 */
	includeContent?: boolean;
}

export type SourceMapSegment =
	| [number]
	| [number, number, number, number]
	| [number, number, number, number, number];

export interface DecodedSourceMap {
	file: string;
	sources: string[];
	sourcesContent?: string[];
	names: string[];
	mappings: SourceMapSegment[][];
	x_google_ignoreList?: number[];
}

export class SourceMap {
	constructor(properties: DecodedSourceMap);

	version: number;
	file: string;
	sources: string[];
	sourcesContent?: string[];
	names: string[];
	mappings: string;
	x_google_ignoreList?: number[];
	debugId?: string;

	/**
	 * Returns the equivalent of `JSON.stringify(map)`
	 */
	toString(): string;
	/**
	 * Returns a DataURI containing the sourcemap. Useful for doing this sort of thing:
	 * `generateMap(options?: SourceMapOptions): SourceMap;`
	 */
	toUrl(): string;
}

export class Bundle {
	constructor(options?: BundleOptions);
	/**
	 * Adds the specified source to the bundle, which can either be a `MagicString` object directly,
	 * or an options object that holds a magic string `content` property and optionally provides
	 * a `filename` for the source within the bundle, as well as an optional `ignoreList` hint
	 * (which defaults to `false`). The `filename` is used when constructing the source map for the
	 * bundle, to identify this `source` in the source map's `sources` field. The `ignoreList` hint
	 * is used to populate the `x_google_ignoreList` extension field in the source map, which is a
	 * mechanism for tools to signal to debuggers that certain sources should be ignored by default
	 * (depending on user preferences).
	 */
	addSource(
		source: MagicString | { filename?: string; content: MagicString; ignoreList?: boolean },
	): this;
	append(str: string, options?: BundleOptions): this;
	clone(): this;
	generateMap(
		options?: SourceMapOptions,
	): Omit<SourceMap, 'sourcesContent'> & { sourcesContent: Array<string | null> };
	generateDecodedMap(
		options?: SourceMapOptions,
	): Omit<DecodedSourceMap, 'sourcesContent'> & { sourcesContent: Array<string | null> };
	getIndentString(): string;
	indent(indentStr?: string): this;
	indentExclusionRanges: ExclusionRange | Array<ExclusionRange>;
	prepend(str: string): this;
	toString(): string;
	trimLines(): this;
	trim(charType?: string): this;
	trimStart(charType?: string): this;
	trimEnd(charType?: string): this;
	isEmpty(): boolean;
	length(): number;
}

export type ExclusionRange = [number, number];

export interface MagicStringOptions {
	filename?: string;
	indentExclusionRanges?: ExclusionRange | Array<ExclusionRange>;
	offset?: number;
}

export interface IndentOptions {
	exclude?: ExclusionRange | Array<ExclusionRange>;
	indentStart?: boolean;
}

export interface OverwriteOptions {
	storeName?: boolean;
	contentOnly?: boolean;
}

export interface UpdateOptions {
	storeName?: boolean;
	overwrite?: boolean;
}

export default class MagicString {
	constructor(str: string, options?: MagicStringOptions);
	/**
	 * Adds the specified character index (with respect to the original string) to sourcemap mappings, if `hires` is false.
	 */
	addSourcemapLocation(char: number): void;
	/**
	 * Appends the specified content to the end of the string.
	 */
	append(content: string): this;
	/**
	 * Appends the specified content at the index in the original string.
	 * If a range *ending* with index is subsequently moved, the insert will be moved with it.
	 * See also `s.prependLeft(...)`.
	 */
	appendLeft(index: number, content: string): this;
	/**
	 * Appends the specified content at the index in the original string.
	 * If a range *starting* with index is subsequently moved, the insert will be moved with it.
	 * See also `s.prependRight(...)`.
	 */
	appendRight(index: number, content: string): this;
	/**
	 * Does what you'd expect.
	 */
	clone(): this;
	/**
	 * Generates a version 3 sourcemap.
	 */
	generateMap(options?: SourceMapOptions): SourceMap;
	/**
	 * Generates a sour
```