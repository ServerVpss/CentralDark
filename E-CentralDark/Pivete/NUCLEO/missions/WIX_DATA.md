# MISSAO - WIX_DATA.md
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\wix\skills\wix-app\references\data-collection\WIX_DATA.md
**SHA:** a2bc307295730d99
**Timestamp:** 2026-08-26T18:42:41.957056
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- between(field: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): WixDataQuery;

### Ouro Bruto (primeiros 5000 chars)
```
# Wix Data SDK Reference

Complete reference for working with Wix Data collections.

## Installation

**IMPORTANT**: The `@wix/data` package must be installed as a dependency before use.

```bash
npm install @wix/data
```

### Troubleshooting

**If you encounter: `Cannot find module '@wix/data'`**

❌ **WRONG**: Do not create mock implementations or workarounds
✅ **CORRECT**: Install the package using `npm install @wix/data`

The `@wix/data` package is a real npm package that provides access to Wix Data collections.
It must be installed before TypeScript compilation will succeed.

## SDK Methods & Interfaces

| Method Call | Import | TypeScript Signature | Description |
| --- | --- | --- | --- |
| `items.get()` | `import { items } from '@wix/data'` | `(collectionId: string, itemId: string, options?: WixDataGetOptions) => Promise<WixDataItem \| null>` | Get a single item by ID |
| `items.query()` | `import { items } from '@wix/data'` | `(collectionId: string) => WixDataQuery` | Build a chainable query (call `.find()` to execute) |
| `items.insert()` | `import { items } from '@wix/data'` | `(collectionId: string, item: Partial<WixDataItem>, options?: WixDataInsertOptions) => Promise<WixDataItem>` | Add a new item to a collection |
| `items.update()` | `import { items } from '@wix/data'` | `(collectionId: string, item: WixDataItem, options?: WixDataUpdateOptions) => Promise<WixDataItem>` | Replace an existing item (item MUST include `_id`) |
| `items.save()` | `import { items } from '@wix/data'` | `(collectionId: string, item: Partial<WixDataItem>, options?: WixDataSaveOptions) => Promise<WixDataItem>` | Insert or update (upsert) based on `_id` |
| `items.remove()` | `import { items } from '@wix/data'` | `(collectionId: string, itemId: string, options?: WixDataRemoveOptions) => Promise<WixDataItem \| null>` | Remove an item by ID |
| `items.bulkInsert()` | `import { items } from '@wix/data'` | `(collectionId: string, items: Partial<WixDataItem>[], options?: WixDataOptions) => Promise<WixDataBulkResult>` | Insert multiple items (max 1000) |
| `items.bulkUpdate()` | `import { items } from '@wix/data'` | `(collectionId: string, items: WixDataItem[], options?: WixDataBulkUpdateOptions) => Promise<WixDataBulkResult>` | Update multiple items (max 1000) |
| `items.bulkRemove()` | `import { items } from '@wix/data'` | `(collectionId: string, itemIds: string[], options?: WixDataBulkRemoveOptions) => Promise<WixDataBulkResult>` | Remove multiple items (max 1000) |
| `items.filter()` | `import { items } from '@wix/data'` | `() => WixDataFilter` | Create a standalone filter (for use with `.or()`, `.and()`, `.not()`) |

## ⚠️ Common Wrong Method Names (DO NOT USE)

| ❌ WRONG (does not exist) | ✅ CORRECT |
| --- | --- |
| `items.queryDataItems()` | `items.query("Collection").find()` |
| `items.insertDataItem()` | `items.insert("Collection", data)` |
| `items.updateDataItem()` | `items.update("Collection", data)` |
| `items.removeDataItem()` | `items.remove("Collection", id)` |
| `items.getDataItem()` | `items.get("Collection", itemId)` |
| `items.bulkInsertDataItems()` | `items.bulkInsert("Collection", items)` |

If you see any method with `DataItem` in the name, it is **wrong**.

## Full Type Definitions

### WixDataItem

```ts
interface WixDataItem {
  _id: string;
  _createdDate?: Date;   // read-only, set by Wix on insert
  _updatedDate?: Date;   // read-only, set by Wix on insert/update
  _owner?: string;       // ID of the user who created the item
  [key: string]: any;    // custom fields from your collection schema
}
```

### WixDataResult (returned by `query().find()`)

```ts
interface WixDataResult {
  readonly items: WixDataItem[];
  readonly totalCount: number | undefined;  // only when returnTotalCount: true
  readonly totalPages: number | undefined;  // only when returnTotalCount: true
  readonly pageSize: number | undefined;
  readonly currentPage: number | undefined;
  readonly length: number;
  hasNext(): boolean;
  hasPrev(): boolean;
  next(): Promise<WixDataResult>;
  prev(): Promise<WixDataResult>;
}
```

### WixDataQuery (returned by `items.query()`)

Chainable query builder. Build filters, then call `.find()`, `.count()`, or `.distinct()`.

```ts
interface WixDataQuery {
  // --- Filters ---
  eq(field: string, value: any): WixDataQuery;
  ne(field: string, value: any): WixDataQuery;
  gt(field: string, value: string | number | Date): WixDataQuery;
  ge(field: string, value: string | number | Date): WixDataQuery;
  lt(field: string, value: string | number | Date): WixDataQuery;
  le(field: string, value: string | number | Date): WixDataQuery;
  between(field: string, rangeStart: string | number | Date, rangeEnd: string | number | Date): WixDataQuery;
  contains(field: string, value: string): WixDataQuery;
  startsWith(field: string, value: string): WixDataQuery;
  endsWith(field: string, value: string): WixDataQuery;
  hasSome(field: string, values: string[] | number[] | Date[]): WixDataQuery;
  hasAll
```