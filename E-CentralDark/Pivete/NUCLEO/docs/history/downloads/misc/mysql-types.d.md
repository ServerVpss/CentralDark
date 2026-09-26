# OUTRO - mysql-types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types\integrations\tracing\mysql\vendored\mysql-types.d.ts
**SHA:** 842a816157bc7cb5
**Timestamp:** 2026-08-28T02:23:12.356352
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- getConnection(pattern: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
- getConnection(pattern: string, selector: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;

### Ouro Bruto (primeiros 5000 chars)
```
export interface MysqlError extends Error {
    code: string;
    errno: number;
    fatal: boolean;
    sql?: string;
    sqlState?: string;
    sqlMessage?: string;
    [key: string]: unknown;
}
export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    [key: string]: unknown;
}
export interface PoolConfig extends ConnectionConfig {
    connectionConfig?: ConnectionConfig;
    [key: string]: unknown;
}
export interface QueryOptions {
    sql: string;
    values?: unknown;
    [key: string]: unknown;
}
export interface FieldInfo {
    catalog: string;
    db: string;
    table: string;
    orgTable: string;
    name: string;
    orgName: string;
    charsetNr: number;
    length: number;
    type: number;
    [key: string]: unknown;
}
export type queryCallback = (err: MysqlError | null, results?: unknown, fields?: FieldInfo[]) => void;
export interface Query {
    sql: string;
    values?: unknown;
    on(event: string, listener: (...args: unknown[]) => void): this;
    [key: string]: unknown;
}
export type QueryFunction = {
    (query: string | QueryOptions, callback?: queryCallback): Query;
    (query: string | QueryOptions, values?: unknown, callback?: queryCallback): Query;
};
export interface Connection {
    config: ConnectionConfig;
    query: QueryFunction;
    [key: string]: unknown;
}
export interface PoolConnection extends Connection {
    release(): void;
    [key: string]: unknown;
}
export interface Pool {
    config: PoolConfig;
    query: QueryFunction;
    getConnection(callback: (err: MysqlError, connection: PoolConnection) => void): void;
    end(callback?: (err?: MysqlError) => void): void;
    on(event: string, listener: (...args: unknown[]) => void): this;
    [key: string]: unknown;
}
export interface PoolCluster {
    getConnection(callback: (err: MysqlError, connection: PoolConnection) => void): void;
    getConnection(pattern: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
    getConnection(pattern: string, selector: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
    add(config: PoolConfig): void;
    add(id: string, config: PoolConfig): void;
    [key: string]: unknown;
}
export declare function createConnection(connectionUri: string | ConnectionConfig): Connection;
export declare function createPool(config: string | PoolConfig): Pool;
export declare function createPoolCluster(config?: PoolConfig): PoolCluster;
//# sourceMappingURL=mysql-types.d.ts.map
```

---

# OUTRO - mysql-types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types-ts3.8\integrations\tracing\mysql\vendored\mysql-types.d.ts
**SHA:** ba4f5f4bdfe9265a
**Timestamp:** 2026-08-28T02:23:17.861142
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- getConnection(pattern: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
- getConnection(pattern: string, selector: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;

### Ouro Bruto (primeiros 5000 chars)
```
export interface MysqlError extends Error {
    code: string;
    errno: number;
    fatal: boolean;
    sql?: string;
    sqlState?: string;
    sqlMessage?: string;
    [key: string]: unknown;
}
export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    [key: string]: unknown;
}
export interface PoolConfig extends ConnectionConfig {
    connectionConfig?: ConnectionConfig;
    [key: string]: unknown;
}
export interface QueryOptions {
    sql: string;
    values?: unknown;
    [key: string]: unknown;
}
export interface FieldInfo {
    catalog: string;
    db: string;
    table: string;
    orgTable: string;
    name: string;
    orgName: string;
    charsetNr: number;
    length: number;
    type: number;
    [key: string]: unknown;
}
export type queryCallback = (err: MysqlError | null, results?: unknown, fields?: FieldInfo[]) => void;
export interface Query {
    sql: string;
    values?: unknown;
    on(event: string, listener: (...args: unknown[]) => void): this;
    [key: string]: unknown;
}
export type QueryFunction = {
    (query: string | QueryOptions, callback?: queryCallback): Query;
    (query: string | QueryOptions, values?: unknown, callback?: queryCallback): Query;
};
export interface Connection {
    config: ConnectionConfig;
    query: QueryFunction;
    [key: string]: unknown;
}
export interface PoolConnection extends Connection {
    release(): void;
    [key: string]: unknown;
}
export interface Pool {
    config: PoolConfig;
    query: QueryFunction;
    getConnection(callback: (err: MysqlError, connection: PoolConnection) => void): void;
    end(callback?: (err?: MysqlError) => void): void;
    on(event: string, listener: (...args: unknown[]) => void): this;
    [key: string]: unknown;
}
export interface PoolCluster {
    getConnection(callback: (err: MysqlError, connection: PoolConnection) => void): void;
    getConnection(pattern: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
    getConnection(pattern: string, selector: string, callback: (err: MysqlError, connection: PoolConnection) => void): void;
    add(config: PoolConfig): void;
    add(id: string, config: PoolConfig): void;
    [key: string]: unknown;
}
export declare function createConnection(connectionUri: string | ConnectionConfig): Connection;
export declare function createPool(config: string | PoolConfig): Pool;
export declare function createPoolCluster(config?: PoolConfig): PoolCluster;
//# sourceMappingURL=mysql-types.d.ts.map

```