# COMANDO - sqlite.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\@types\node\sqlite.d.ts
**SHA:** a3fc63c0d7b03169
**Timestamp:** 2026-08-26T19:32:03.744536
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: T | (() => T);
- *   start: 0,

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * The `node:sqlite` module facilitates working with SQLite databases.
 * To access it:
 *
 * ```js
 * import sqlite from 'node:sqlite';
 * ```
 *
 * This module is only available under the `node:` scheme. The following will not
 * work:
 *
 * ```js
 * import sqlite from 'sqlite';
 * ```
 *
 * The following example shows the basic usage of the `node:sqlite` module to open
 * an in-memory database, write data to the database, and then read the data back.
 *
 * ```js
 * import { DatabaseSync } from 'node:sqlite';
 * const database = new DatabaseSync(':memory:');
 *
 * // Execute SQL statements from strings.
 * database.exec(`
 *   CREATE TABLE data(
 *     key INTEGER PRIMARY KEY,
 *     value TEXT
 *   ) STRICT
 * `);
 * // Create a prepared statement to insert data into the database.
 * const insert = database.prepare('INSERT INTO data (key, value) VALUES (?, ?)');
 * // Execute the prepared statement with bound values.
 * insert.run(1, 'hello');
 * insert.run(2, 'world');
 * // Create a prepared statement to read data from the database.
 * const query = database.prepare('SELECT * FROM data ORDER BY key');
 * // Execute the prepared statement and log the result set.
 * console.log(query.all());
 * // Prints: [ { key: 1, value: 'hello' }, { key: 2, value: 'world' } ]
 * ```
 * @since v22.5.0
 * @experimental
 * @see [source](https://github.com/nodejs/node/blob/v22.x/lib/sqlite.js)
 */
declare module "node:sqlite" {
    import { PathLike } from "node:fs";
    type SQLInputValue = null | number | bigint | string | NodeJS.ArrayBufferView;
    type SQLOutputValue = null | number | bigint | string | NodeJS.NonSharedUint8Array;
    interface DatabaseSyncOptions {
        /**
         * If `true`, the database is opened by the constructor. When
         * this value is `false`, the database must be opened via the `open()` method.
         * @since v22.5.0
         * @default true
         */
        open?: boolean | undefined;
        /**
         * If `true`, foreign key constraints
         * are enabled. This is recommended but can be disabled for compatibility with
         * legacy database schemas. The enforcement of foreign key constraints can be
         * enabled and disabled after opening the database using
         * [`PRAGMA foreign_keys`](https://www.sqlite.org/pragma.html#pragma_foreign_keys).
         * @since v22.10.0
         * @default true
         */
        enableForeignKeyConstraints?: boolean | undefined;
        /**
         * If `true`, SQLite will accept
         * [double-quoted string literals](https://www.sqlite.org/quirks.html#dblquote).
         * This is not recommended but can be
         * enabled for compatibility with legacy database schemas.
         * @since v22.10.0
         * @default false
         */
        enableDoubleQuotedStringLiterals?: boolean | undefined;
        /**
         * If `true`, the database is opened in read-only mode.
         * If the database does not exist, opening it will fail.
         * @since v22.12.0
         * @default false
         */
        readOnly?: boolean | undefined;
        /**
         * If `true`, the `loadExtension` SQL function
         * and the `loadExtension()` method are enabled.
         * You can call `enableLoadExtension(false)` later to disable this feature.
         * @since v22.13.0
         * @default false
         */
        allowExtension?: boolean | undefined;
        /**
         * The [busy timeout](https://sqlite.org/c3ref/busy_timeout.html) in milliseconds. This is the maximum amount of
         * time that SQLite will wait for a database lock to be released before
         * returning an error.
         * @since v22.16.0
         * @default 0
         */
        timeout?: number | undefined;
        /**
         * If `true`, integer fields are read as JavaScript `BigInt` values. If `false`,
         * integer fields are read as JavaScript numbers.
         * @since v22.18.0
         * @default false
         */
        readBigInts?: boolean | undefined;
        /**
         * If `true`, query results are returned as arrays instead of objects.
         * @since v22.18.0
         * @default false
         */
        returnArrays?: boolean | undefined;
        /**
         * If `true`, allows binding named parameters without the prefix
         * character (e.g., `foo` instead of `:foo`).
         * @since v22.18.0
         * @default true
         */
        allowBareNamedParameters?: boolean | undefined;
        /**
         * If `true`, unknown named parameters are ignored when binding.
         * If `false`, an exception is thrown for unknown named parameters.
         * @since v22.18.0
         * @default false
         */
        allowUnknownNamedParameters?: boolean | undefined;
    }
    interface CreateSessionOptions {
        /**
         * A specific table to track changes for. By default, changes to all tables are tracked.
         * @since v22.12.0
         */
        table?: string | undefined;
  
```