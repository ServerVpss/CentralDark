# OUTRO - mysql2-types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types\integrations\tracing\mysql2\vendored\mysql2-types.d.ts
**SHA:** ae105e492107523e
**Timestamp:** 2026-08-28T02:23:12.659644
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: (...args: any[]) => Query;

### Ouro Bruto (primeiros 5000 chars)
```
export interface Connection {
    config: ConnectionConfig;
    query: (...args: any[]) => Query;
    execute: (...args: any[]) => Query;
    [key: string]: any;
}
export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    connectionConfig?: ConnectionConfig;
    [key: string]: any;
}
export interface Query {
    sql: string;
    onResult?: (...args: any[]) => any;
    once(event: string, callback: (...args: any[]) => void): Query;
    [key: string]: any;
}
export interface QueryOptions {
    sql: string;
    values?: any | any[] | {
        [param: string]: any;
    };
    [key: string]: any;
}
export interface QueryError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
    [key: string]: any;
}
export interface FieldPacket {
    [key: string]: any;
}
export type FormatFunction = (sql: string, values?: any[], stringifyObjects?: boolean, timeZone?: string) => string;
//# sourceMappingURL=mysql2-types.d.ts.map
```

---

# OUTRO - mysql2-types.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\node@10.71.0@@@1\build\types-ts3.8\integrations\tracing\mysql2\vendored\mysql2-types.d.ts
**SHA:** 9836f7f7b59b7bee
**Timestamp:** 2026-08-28T02:23:18.609375
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute: (...args: any[]) => Query;

### Ouro Bruto (primeiros 5000 chars)
```
export interface Connection {
    config: ConnectionConfig;
    query: (...args: any[]) => Query;
    execute: (...args: any[]) => Query;
    [key: string]: any;
}
export interface ConnectionConfig {
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    connectionConfig?: ConnectionConfig;
    [key: string]: any;
}
export interface Query {
    sql: string;
    onResult?: (...args: any[]) => any;
    once(event: string, callback: (...args: any[]) => void): Query;
    [key: string]: any;
}
export interface QueryOptions {
    sql: string;
    values?: any | any[] | {
        [param: string]: any;
    };
    [key: string]: any;
}
export interface QueryError extends Error {
    code?: string;
    errno?: number;
    sqlState?: string;
    sqlMessage?: string;
    [key: string]: any;
}
export interface FieldPacket {
    [key: string]: any;
}
export type FormatFunction = (sql: string, values?: any[], stringifyObjects?: boolean, timeZone?: string) => string;
//# sourceMappingURL=mysql2-types.d.ts.map

```