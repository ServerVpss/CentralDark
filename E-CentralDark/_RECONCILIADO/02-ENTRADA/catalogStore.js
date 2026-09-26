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
// @ts-ignore — built-in Node 24; sem @types ainda.
import { DatabaseSync } from 'node:sqlite';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { scanAllClis, dedupeCatalogItems, identityKey, } from '@overclock-app/catalog';
// Namespace import (NOT a named import): built-ins ship in the app bundle and are
// enumerated by listBuiltinManifest() in @overclock-app/mcp. A named import would
// hard-crash module linking while mcp's dist still predates the symbol; the namespace
// access degrades to `undefined` → [] instead, and lights up once mcp re-exports it.
import * as mcpPkg from '@overclock-app/mcp';
// ---------------------------------------------------------------------------
// Singleton do DB global (messages.db no dataDir)
// ---------------------------------------------------------------------------
let _globalDb = null;
/**
 * Retorna (e cacheia) o DatabaseSync do messages.db global em dataDir.
 * Idempotente — chamadas repetidas retornam a mesma instância.
 */
export function getGlobalDb(dataDir) {
    if (_globalDb !== null)
        return _globalDb;
    try {
        mkdirSync(dataDir, { recursive: true });
    }
    catch { /* já existe */ }
    const dbPath = join(dataDir, 'messages.db');
    const db = new DatabaseSync(dbPath);
    // WAL para reduzir lock contention com o processo bus/Electron.
    db.exec('PRAGMA journal_mode = WAL');
    db.exec('PRAGMA synchronous = NORMAL');
    _globalDb = db;
    return db;
}
// ---------------------------------------------------------------------------
// Helpers de (de)serialização — idênticos aos de catalog/src/store.ts
// ---------------------------------------------------------------------------
function parseJson(value, fallback) {
    if (value === null)
        return fallback;
    try {
        return JSON.parse(value);
    }
    catch {
        return fallback;
    }
}
function serializeMetadata(metadata) {
    return metadata === null ? null : JSON.stringify(metadata);
}
function rowToCatalogItem(row) {
    return {
        id: row.id,
        type: row.type,
        name: row.name,
        description: row.description ?? '',
        installations: parseJson(row.installations, []),
        is_present: row.is_present === 1,
        first_seen_at: row.first_seen_at,
        last_seen_at: row.last_seen_at,
        metadata: parseJson(row.metadata, null),
        disabled: row.disabled === 1,
    };
}
// ---------------------------------------------------------------------------
// identity_key — delega para identityKey de catalog/src/dedup.ts
// ---------------------------------------------------------------------------
function computeIdentityKey(item) {
    return identityKey(item);
}
// ---------------------------------------------------------------------------
// Closed taxonomy for catalog overlay categorization
// ---------------------------------------------------------------------------
export const CATALOG_CATEGORIES = ['scout', 'builder', 'reviewer'];
const CATEGORY_SET = new Set(CATALOG_CATEGORIES);
function coerceCategory(c) {
    return CATEGORY_SET.has(c) ? c : 'builder';
}
// ---------------------------------------------------------------------------
// Migration de catalog_items — schema idêntico ao de catalog/src/store.ts
// ---------------------------------------------------------------------------
export function ensureCatalogSchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_items (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      type          TEXT    NOT NULL,
      name          TEXT    NOT NULL,
      description   TEXT,
      installations TEXT    NOT NULL,
      is_present    INTEGER NOT NULL DEFAULT 1,
      first_seen_at INTEGER NOT NULL,
      last_seen_at  INTEGER NOT NULL,
      metadata      TEXT,
      identity_key  TEXT    NOT NULL DEFAULT '',
      UNIQUE(type, identity_key)
    );

    CREATE INDEX IF NOT EXISTS idx_catalog_type     ON catalog_items(type);
    CREATE INDEX IF NOT EXISTS idx_catalog_present  ON catalog_items(is_present);
    CREATE INDEX IF NOT EXISTS idx_catalog_identity ON catalog_items(type, identity_key);
  `);
    // `disabled` is a user toggle (catalog UI). Add via ALTER for pre-existing tables;
    // CREATE IF NOT EXISTS above won't add a column to a table that already exists.
    // The scan upsert intentionally never touches this column, so the flag survives rescans.
    const cols = db.prepare(`PRAGMA table_info(catalog_items)`).all();
    if (!cols.some((c) => c.name === 'disabled')) {
        db.exec(`ALTER TABLE catalog_items ADD COLUMN disabled INTEGER NOT NULL DEFAULT 0`);
    }
    // One-time cleanup: remove linhas Gemini deixadas por scans antigos (idêntico ao original).
    db.exec(`
    DELETE FROM catalog_items
    WHERE installations LIKE '%"cli":"gemini"%'
       OR installations LIKE '%"cli": "gemini"%';
  `);
}
// Guard para rodar migration apenas uma vez por instância de DB.
const migratedDbs = new WeakSet();
function ensureSchema(db) {
    if (migratedDbs.has(db))
        return;
    ensureCatalogSchema(db);
    migratedDbs.add(db);
}
// ---------------------------------------------------------------------------
// Funções públicas — espelham catalog/src/store.ts
// ---------------------------------------------------------------------------
/**
 * Lista catalog items por tipo. Equivalente a listCatalogItems do catalog/src/store.ts.
 */
export function listCatalogItems(db, args, opts) {
    ensureSchema(db);
    const where = ['type = ?'];
    if (!args.includeMissing)
        where.push('is_present = 1');
    if (opts?.excludeDisabled)
        where.push('disabled = 0');
    const sql = `SELECT * FROM catalog_items WHERE ${where.join(' AND ')} ORDER BY name COLLATE NOCASE ASC, id ASC`;
    const rows = db.prepare(sql).all(args.type);
    return rows.map(rowToCatalogItem);
}
/** Resolve listBuiltinManifest() lazily; [] until mcp's bundle re-exports it. */
function defaultBuiltinSource() {
    const fn = mcpPkg.listBuiltinManifest;
    return typeof fn === 'function' ? fn() : [];
}
/** Map a built-in manifest entry into the virtual catalog item shape. */
function builtinToCatalogItem(e) {
    return {
        id: -1,
        type: e.type,
        name: e.name,
        description: e.purpose,
        installations: [],
        is_present: true,
        first_seen_at: 0,
        last_seen_at: 0,
        metadata: null,
        disabled: false,
        origin: 'overclock',
        identity_key: e.identity_key,
        readOnly: true,
    };
}
/**
 * List catalog items of a type for the catalog UI: the user's disk scan (origin:'user')
 * UNIONed with the in-bundle built-ins (origin:'overclock', readOnly:true). Deduped by
 * (type+name) — the built-in wins so an out-of-date user copy never shadows the shipped one.
 */
export function catalogList(db, args, opts) {
    const diskItems = listCatalogItems(db, { type: args.type, includeMissing: args.includeMissing }, opts).map((item) => ({
        ...item,
        origin: 'user',
        identity_key: computeIdentityKey(item),
    }));
    const includeBuiltin = args.includeBuiltin !== false;
    const builtins = includeBuiltin
        ? (opts?.builtinSource ?? defaultBuiltinSource)()
            .filter((e) => e.type === args.type)
            .map(builtinToCatalogItem)
        : [];
    // Dedup by type+name; built-in wins (drop the colliding disk copy).
    const builtinKeys = new Set(builtins.map((b) => `${b.type}:${b.name}`));
    const merged = [
        ...diskItems.filter((d) => !builtinKeys.has(`${d.type}:${d.name}`)),
        ...builtins,
    ];
    merged.sort((a, b) => a.name.localeCompare(b.name));
    return merged;
}
/**
 * Toggle the user `disabled` flag on a catalog item (by type + name). Disabled
 * items still scan/list for the UI but are excluded from the squad capability map.
 */
export function setCatalogItemDisabled(db, args) {
    ensureSchema(db);
    db.prepare('UPDATE catalog_items SET disabled = ? WHERE type = ? AND name = ?')
        .run(args.disabled ? 1 : 0, args.type, args.name);
}
/**
 * Upsert do resultado de um scan, tombstoneando itens ausentes.
 * Equivalente a upsertCatalogScanResults do catalog/src/store.ts.
 */
export function upsertCatalogScanResults(db, args) {
    ensureSchema(db);
    const now = args.now ?? Date.now();
    const items = dedupeCatalogItems(args.items.filter((item) => item.type === args.type));
    // node:sqlite não tem db.transaction() — usamos BEGIN/COMMIT explícito.
    db.exec('BEGIN');
    try {
        const upsert = db.prepare(`
      INSERT INTO catalog_items (
        type, name, description, installations,
        is_present, first_seen_at, last_seen_at, metadata, identity_key
      )
      VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)
      ON CONFLICT(type, identity_key) DO UPDATE SET
        name         = excluded.name,
        description  = excluded.description,
        installations= excluded.installations,
        is_present   = 1,
        last_seen_at = excluded.last_seen_at,
        metadata     = excluded.metadata
    `);
        for (const item of items) {
            upsert.run(item.type, item.name, item.description ?? null, JSON.stringify(item.installations), now, now, serializeMetadata(item.metadata ?? null), computeIdentityKey(item));
        }
        if (args.tombstoneMissing !== false) {
            const presentIdentities = new Set(items.map(computeIdentityKey));
            const existingRows = db
                .prepare('SELECT id, type, name, identity_key FROM catalog_items WHERE type = ?')
                .all(args.type);
            const tombstone = db.prepare('UPDATE catalog_items SET is_present = 0 WHERE id = ?');
            for (const row of existingRows) {
                if (presentIdentities.has(row.identity_key))
                    continue;
                tombstone.run(row.id);
            }
        }
        db.exec('COMMIT');
    }
    catch (err) {
        db.exec('ROLLBACK');
        throw err;
    }
    return items.length;
}
/**
 * Remove um catalog item por id.
 * Equivalente a removeCatalogItem do catalog/src/store.ts.
 */
export function removeCatalogItem(db, args) {
    ensureSchema(db);
    db.prepare('DELETE FROM catalog_items WHERE id = ?').run(args.id);
}
/**
 * Remove todos os itens ausentes (is_present=0) de um tipo.
 * Equivalente a removeMissingCatalogItems do catalog/src/store.ts.
 */
export function removeMissingCatalogItems(db, args) {
    ensureSchema(db);
    const result = db
        .prepare('DELETE FROM catalog_items WHERE type = ? AND is_present = 0')
        .run(args.type);
    return result.changes;
}
/** Normaliza o resultado polimórfico de parseCandidate para CatalogItemInput[]. */
function normalizeParsed(result) {
    if (result === null || result === undefined)
        return [];
    if (Array.isArray(result))
        return result;
    if ('items' in result)
        return result.items;
    return [result];
}
// ---------------------------------------------------------------------------
// Overlay + stacks schema
// ---------------------------------------------------------------------------
export function ensureOverlaySchema(db) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS catalog_overlay (
      identity_key        TEXT PRIMARY KEY,
      type                TEXT NOT NULL,
      name                TEXT NOT NULL,
      category            TEXT NOT NULL,
      purpose             TEXT NOT NULL DEFAULT '',
      when_to_use         TEXT NOT NULL DEFAULT '',
      categorized_at      INTEGER NOT NULL,
      categorizer_version INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS catalog_stacks (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      summary             TEXT NOT NULL DEFAULT '',
      member_keys         TEXT NOT NULL DEFAULT '[]',
      intake_questions    TEXT NOT NULL DEFAULT '[]',
      parallel_groups     TEXT NOT NULL DEFAULT '[]',
      synthesized_at      INTEGER NOT NULL,
      synthesizer_version INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_overlay_category ON catalog_overlay(category);
  `);
    // Migration: drop overlay rows whose category is not a valid role (legacy 16-domain
    // taxonomy). They get re-categorized by the scout on the next immersion. Idempotent.
    db.exec(`DELETE FROM catalog_overlay WHERE category NOT IN ('scout','builder','reviewer')`);
}
// ---------------------------------------------------------------------------
// Overlay + stacks store functions
// ---------------------------------------------------------------------------
function mapCatalogItemRow(r) {
    let path = '';
    try {
        const inst = JSON.parse(String(r.installations ?? '[]'));
        path = inst[0]?.path ?? '';
    }
    catch {
        path = '';
    }
    return {
        identity_key: String(r.identity_key),
        type: String(r.type),
        name: String(r.name),
        path,
        description: String(r.description ?? ''),
        trigger: '',
    };
}
export function listUncategorized(db, type) {
    const rows = db.prepare(`
    SELECT ci.identity_key AS identity_key, ci.type AS type, ci.name AS name,
           ci.description AS description, ci.installations AS installations
      FROM catalog_items ci
      LEFT JOIN catalog_overlay co ON co.identity_key = ci.identity_key
     WHERE ci.type = ? AND ci.disabled = 0 AND co.identity_key IS NULL
     ORDER BY ci.name
  `).all(type);
    return rows.map(mapCatalogItemRow);
}
// Like listUncategorized but returns EVERY active item of a type, INCLUDING already-categorized
// ones. Used by the explicit "recatalog geral" path: the cataloger re-reads the full set and
// overlay_write (INSERT OR REPLACE) overwrites in place — no DELETE/clear needed.
export function listAllForCatalog(db, type) {
    const rows = db.prepare(`
    SELECT ci.identity_key AS identity_key, ci.type AS type, ci.name AS name,
           ci.description AS description, ci.installations AS installations
      FROM catalog_items ci
     WHERE ci.type = ? AND ci.disabled = 0
     ORDER BY ci.name
  `).all(type);
    return rows.map(mapCatalogItemRow);
}
// State machine for the CLI intake affordance (technique-over-prompt): the piloto renders
// "catalogar" / "atualizar" / nothing from this — it does NOT decide the wording itself.
//   empty   → no item carries an overlay row  → ask to CATALOG (first immersion)
//   partial → some categorized, some not      → ask to UPDATE (categorize the delta)
//   full    → all categorized (or 0 installed) → show nothing
export function catalogStateCounts(db) {
    const row = db.prepare(`
    SELECT
      (SELECT count(*) FROM catalog_items WHERE disabled = 0) AS total,
      (SELECT count(*) FROM catalog_items ci
         JOIN catalog_overlay co ON co.identity_key = ci.identity_key
        WHERE ci.disabled = 0) AS categorized
  `).get();
    const total = Number(row.total);
    const categorized = Number(row.categorized);
    const uncategorized = total - categorized;
    const state = total === 0 ? 'full'
        : categorized === 0 ? 'empty'
            : uncategorized > 0 ? 'partial'
                : 'full';
    return { total, categorized, uncategorized, state };
}
export function upsertOverlay(db, rows, categorizerVersion) {
    if (rows.length === 0)
        return 0;
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO catalog_overlay
      (identity_key, type, name, category, purpose, when_to_use, categorized_at, categorizer_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    db.exec('BEGIN');
    try {
        for (const r of rows) {
            stmt.run(r.identity_key, r.type, r.name, coerceCategory(r.category), r.purpose ?? '', r.when_to_use ?? '', now, categorizerVersion);
        }
        db.exec('COMMIT');
    }
    catch (e) {
        db.exec('ROLLBACK');
        throw e;
    }
    return rows.length;
}
export function getOverlayMap(db) {
    const rows = db.prepare(`SELECT identity_key, category, purpose, when_to_use FROM catalog_overlay`).all();
    const m = new Map();
    for (const r of rows) {
        m.set(String(r.identity_key), {
            category: String(r.category),
            purpose: String(r.purpose ?? ''),
            when_to_use: String(r.when_to_use ?? ''),
        });
    }
    return m;
}
export function clearOverlay(db) {
    db.exec('DELETE FROM catalog_overlay');
}
export function listCategorizedForSynthesis(db) {
    const rows = db.prepare(`
    SELECT co.identity_key AS identity_key, co.type AS type, co.name AS name,
           co.category AS category, co.purpose AS purpose, co.when_to_use AS when_to_use,
           ci.installations AS installations
      FROM catalog_overlay co
      LEFT JOIN catalog_items ci ON ci.identity_key = co.identity_key
     ORDER BY co.category, co.name
  `).all();
    return rows.map((r) => {
        let path = '';
        try {
            const inst = JSON.parse(String(r.installations ?? '[]'));
            path = inst[0]?.path ?? '';
        }
        catch {
            path = '';
        }
        return {
            identity_key: String(r.identity_key),
            type: String(r.type),
            name: String(r.name),
            category: String(r.category),
            purpose: String(r.purpose ?? ''),
            when_to_use: String(r.when_to_use ?? ''),
            path,
        };
    });
}
export function replaceStacks(db, stacks, synthesizerVersion) {
    if (stacks.length === 0)
        return 0;
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT OR REPLACE INTO catalog_stacks
      (id, name, summary, member_keys, intake_questions, parallel_groups, synthesized_at, synthesizer_version)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
    db.exec('BEGIN');
    try {
        db.exec('DELETE FROM catalog_stacks');
        for (const s of stacks) {
            stmt.run(s.id, s.name, s.summary ?? '', JSON.stringify(s.member_keys ?? []), JSON.stringify(s.intake_questions ?? []), JSON.stringify(s.parallel_groups ?? []), now, synthesizerVersion);
        }
        db.exec('COMMIT');
    }
    catch (e) {
        db.exec('ROLLBACK');
        throw e;
    }
    return stacks.length;
}
export function listStacks(db) {
    const rows = db.prepare(`
    SELECT id, name, summary, member_keys, intake_questions, parallel_groups
      FROM catalog_stacks ORDER BY name
  `).all();
    const parse = (v) => {
        try {
            const x = JSON.parse(String(v ?? '[]'));
            return Array.isArray(x) ? x : [];
        }
        catch {
            return [];
        }
    };
    return rows.map((r) => ({
        id: String(r.id),
        name: String(r.name),
        summary: String(r.summary ?? ''),
        member_keys: parse(r.member_keys),
        intake_questions: parse(r.intake_questions),
        parallel_groups: parse(r.parallel_groups),
    }));
}
export function getStack(db, id) {
    const row = db.prepare(`
    SELECT id, name, summary, member_keys, intake_questions, parallel_groups
      FROM catalog_stacks WHERE id = ?
  `).get(id);
    if (!row)
        return null;
    const parse = (v) => {
        try {
            const p = JSON.parse(String(v ?? '[]'));
            return Array.isArray(p) ? p : [];
        }
        catch {
            return [];
        }
    };
    return {
        id: String(row.id),
        name: String(row.name),
        summary: String(row.summary ?? ''),
        member_keys: parse(row.member_keys),
        intake_questions: parse(row.intake_questions),
        parallel_groups: parse(row.parallel_groups),
    };
}
// ---------------------------------------------------------------------------
// scanCatalog
// ---------------------------------------------------------------------------
/**
 * Executa scanAllClis (puro fs, Electron-free) + parseCandidate e persiste via upsert.
 * Equivalente ao catalog.scan() do Electron (registerCatalogIpcHandlers).
 * O caller (wireCore) injeta parseCandidate com os parsers específicos do app.
 */
export async function scanCatalog(args) {
    const { db, type, scannerOptions, parseCandidate } = args;
    const scanResult = await scanAllClis(scannerOptions, type);
    // Parsear cada candidato raw em paralelo (mesmo padrão do createCatalog do catalog).
    const parseResults = await Promise.allSettled(scanResult.candidates.map((c) => parseCandidate(c)));
    const items = [];
    for (const result of parseResults) {
        if (result.status === 'fulfilled') {
            items.push(...normalizeParsed(result.value));
        }
        // rejected = ignorado silenciosamente (parseCandidate não deve lançar, mas por segurança)
    }
    const count = upsertCatalogScanResults(db, {
        type,
        items,
        tombstoneMissing: true,
    });
    return {
        count,
        warnings: scanResult.warnings.map((w) => ({ code: w.code, message: w.message })),
    };
}
//# sourceMappingURL=catalogStore.js.map