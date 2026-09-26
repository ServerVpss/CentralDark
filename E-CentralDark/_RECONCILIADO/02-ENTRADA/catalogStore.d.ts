/**
 * catalogStore.ts — Catalog store para o sidecar Tauri usando node:sqlite.
 *
 * Porta packages/catalog/src/store.ts de better-sqlite3 para node:sqlite
 * (DatabaseSync, built-in Node 24). Abre o GLOBAL messages.db em dataDir
 * (join(dataDir, 'messages.db')) — mesmo arquivo do bus, catalog_items é tabela
 * adicional (CREATE IF NOT EXISTS, sem conflito com token_usage/activity_log_v2).
 *
 * Funções exportadas espelham exatamente as assinaturas de catalog/src/store.ts,
 * mas recebem DatabaseSync em vez de better-sqlite3.Database.
 *
 * node:sqlite: params SQLInputValue (string|number|null|bigint|Uint8Array).
 */
import { DatabaseSync } from 'node:sqlite';
import { type CatalogType, type CatalogItem, type CatalogItemInput, type CatalogListArgs, type CatalogRemoveArgs, type CatalogParseCandidateResult, type RawCatalogCandidate, type ScannerOptions } from '@overclock-app/catalog';
/**
 * Retorna (e cacheia) o DatabaseSync do messages.db global em dataDir.
 * Idempotente — chamadas repetidas retornam a mesma instância.
 */
export declare function getGlobalDb(dataDir: string): DatabaseSync;
export declare const CATALOG_CATEGORIES: readonly ["scout", "builder", "reviewer"];
export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];
export type OverlayRow = {
    identity_key: string;
    type: 'skill' | 'agent';
    name: string;
    category: string;
    purpose: string;
    when_to_use: string;
};
export type UncategorizedRow = {
    identity_key: string;
    type: 'skill' | 'agent';
    name: string;
    path: string;
    description: string;
    trigger: string;
};
export type StackRow = {
    id: string;
    name: string;
    summary: string;
    member_keys: string[];
    intake_questions: unknown[];
    parallel_groups: unknown[];
};
export declare function ensureCatalogSchema(db: DatabaseSync): void;
/**
 * Lista catalog items por tipo. Equivalente a listCatalogItems do catalog/src/store.ts.
 */
export declare function listCatalogItems(db: DatabaseSync, args: CatalogListArgs, opts?: {
    excludeDisabled?: boolean;
}): CatalogItem[];
/** A built-in primitive shipped in the app bundle (mirrors mcp's BuiltinManifestEntry). */
export interface BuiltinManifestEntry {
    identity_key: string;
    type: 'skill' | 'agent';
    name: string;
    category: string;
    purpose: string;
    origin: 'overclock';
}
/** Source of built-in entries — injectable for tests; defaults to mcp's listBuiltinManifest. */
export type BuiltinManifestLike = () => BuiltinManifestEntry[];
/** A catalog row tagged with where it came from. Built-ins are virtual + read-only. */
export type CatalogListItem = CatalogItem & {
    origin: 'user' | 'overclock';
    identity_key: string;
    readOnly?: boolean;
};
/**
 * List catalog items of a type for the catalog UI: the user's disk scan (origin:'user')
 * UNIONed with the in-bundle built-ins (origin:'overclock', readOnly:true). Deduped by
 * (type+name) — the built-in wins so an out-of-date user copy never shadows the shipped one.
 */
export declare function catalogList(db: DatabaseSync, args: {
    type: 'skill' | 'agent';
    includeMissing?: boolean;
    includeBuiltin?: boolean;
}, opts?: {
    excludeDisabled?: boolean;
    builtinSource?: BuiltinManifestLike;
}): CatalogListItem[];
/**
 * Toggle the user `disabled` flag on a catalog item (by type + name). Disabled
 * items still scan/list for the UI but are excluded from the squad capability map.
 */
export declare function setCatalogItemDisabled(db: DatabaseSync, args: {
    type: CatalogType;
    name: string;
    disabled: boolean;
}): void;
/**
 * Upsert do resultado de um scan, tombstoneando itens ausentes.
 * Equivalente a upsertCatalogScanResults do catalog/src/store.ts.
 */
export declare function upsertCatalogScanResults(db: DatabaseSync, args: {
    type: CatalogType;
    items: CatalogItemInput[];
    now?: number;
    tombstoneMissing?: boolean;
}): number;
/**
 * Remove um catalog item por id.
 * Equivalente a removeCatalogItem do catalog/src/store.ts.
 */
export declare function removeCatalogItem(db: DatabaseSync, args: CatalogRemoveArgs): void;
/**
 * Remove todos os itens ausentes (is_present=0) de um tipo.
 * Equivalente a removeMissingCatalogItems do catalog/src/store.ts.
 */
export declare function removeMissingCatalogItems(db: DatabaseSync, args: {
    type: CatalogType;
}): number;
export interface ScanCatalogArgs {
    db: DatabaseSync;
    type: CatalogType;
    scannerOptions: ScannerOptions;
    /** Converte candidato raw em CatalogItemInput(s). Mesmo contrato de createCatalog. */
    parseCandidate: (candidate: RawCatalogCandidate) => Promise<CatalogParseCandidateResult>;
}
export interface ScanCatalogResult {
    count: number;
    warnings: Array<{
        code: string;
        message: string;
    }>;
}
export declare function ensureOverlaySchema(db: DatabaseSync): void;
export declare function listUncategorized(db: DatabaseSync, type: 'skill' | 'agent'): UncategorizedRow[];
export declare function listAllForCatalog(db: DatabaseSync, type: 'skill' | 'agent'): UncategorizedRow[];
export declare function catalogStateCounts(db: DatabaseSync): {
    total: number;
    categorized: number;
    uncategorized: number;
    state: 'empty' | 'partial' | 'full';
};
export declare function upsertOverlay(db: DatabaseSync, rows: OverlayRow[], categorizerVersion: number): number;
export declare function getOverlayMap(db: DatabaseSync): Map<string, {
    category: string;
    purpose: string;
    when_to_use: string;
}>;
export declare function clearOverlay(db: DatabaseSync): void;
export declare function listCategorizedForSynthesis(db: DatabaseSync): Array<{
    identity_key: string;
    type: string;
    name: string;
    category: string;
    purpose: string;
    when_to_use: string;
    path: string;
}>;
export declare function replaceStacks(db: DatabaseSync, stacks: StackRow[], synthesizerVersion: number): number;
export declare function listStacks(db: DatabaseSync): Array<{
    id: string;
    name: string;
    summary: string;
    member_keys: string[];
    intake_questions: unknown[];
    parallel_groups: unknown[];
}>;
export declare function getStack(db: DatabaseSync, id: string): StackRow | null;
/**
 * Executa scanAllClis (puro fs, Electron-free) + parseCandidate e persiste via upsert.
 * Equivalente ao catalog.scan() do Electron (registerCatalogIpcHandlers).
 * O caller (wireCore) injeta parseCandidate com os parsers específicos do app.
 */
export declare function scanCatalog(args: ScanCatalogArgs): Promise<ScanCatalogResult>;
//# sourceMappingURL=catalogStore.d.ts.map