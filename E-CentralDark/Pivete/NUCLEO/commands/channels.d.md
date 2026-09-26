# COMANDO - channels.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types\orchestrion\channels.d.ts
**SHA:** 65b0766505733b03
**Timestamp:** 2026-08-28T02:23:41.162933
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- readonly TEDIOUS_EXECUTE: "orchestrion:tedious:execute";
- readonly POSTGRESJS_EXECUTE: "orchestrion:postgres:execute";
- readonly MYSQL2_EXECUTE: "orchestrion:mysql2:execute";
- readonly KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run";
- readonly GRAPHQL_EXECUTE: "orchestrion:graphql:execute";

### Contratos
- readonly MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate";

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Fully-qualified `diagnostics_channel` names that orchestrion publishes to.
 *
 * Orchestrion's transform always prefixes the configured `channelName` with
 * `orchestrion:${module.name}:`. So a config of
 *   `{ channelName: 'query', module: { name: 'mysql' } }`
 * publishes to `orchestrion:mysql:query`.
 *
 * Subscribers (`integrations/<lib>/tracing-channel.ts`) consume the full
 * prefixed string from this map; the config files set only the unprefixed
 * suffix in `channelName`. Keeping both pieces in one file is what guarantees
 * they don't drift apart and silently stop firing.
 *
 * Kept sorted alphabetically by module so concurrent additions insert at different
 * points rather than all appending to the end (fewer merge conflicts).
 */
export declare const CHANNELS: {
    readonly VERCEL_AI_GENERATE_TEXT: "orchestrion:ai:generateText";
    readonly VERCEL_AI_STREAM_TEXT: "orchestrion:ai:streamText";
    readonly VERCEL_AI_GENERATE_OBJECT: "orchestrion:ai:generateObject";
    readonly VERCEL_AI_EMBED: "orchestrion:ai:embed";
    readonly VERCEL_AI_EMBED_MANY: "orchestrion:ai:embedMany";
    readonly VERCEL_AI_EXECUTE_TOOL_CALL: "orchestrion:ai:executeToolCall";
    readonly VERCEL_AI_RESOLVE_LANGUAGE_MODEL: "orchestrion:ai:resolveLanguageModel";
    readonly TEDIOUS_CONNECT: "orchestrion:tedious:connect";
    readonly TEDIOUS_EXEC_SQL: "orchestrion:tedious:execSql";
    readonly TEDIOUS_EXEC_SQL_BATCH: "orchestrion:tedious:execSqlBatch";
    readonly TEDIOUS_CALL_PROCEDURE: "orchestrion:tedious:callProcedure";
    readonly TEDIOUS_EXEC_BULK_LOAD: "orchestrion:tedious:execBulkLoad";
    readonly TEDIOUS_PREPARE: "orchestrion:tedious:prepare";
    readonly TEDIOUS_EXECUTE: "orchestrion:tedious:execute";
    readonly REMIX_REQUEST_HANDLER: "orchestrion:@remix-run/server-runtime:requestHandler";
    readonly REMIX_MATCH_SERVER_ROUTES: "orchestrion:@remix-run/server-runtime:matchServerRoutes";
    readonly REMIX_CALL_ROUTE_LOADER: "orchestrion:@remix-run/server-runtime:callRouteLoader";
    readonly REMIX_CALL_ROUTE_ACTION: "orchestrion:@remix-run/server-runtime:callRouteAction";
    readonly REDIS_COMMAND: "orchestrion:redis:command";
    readonly NODE_REDIS_COMMAND: "orchestrion:@redis/client:command";
    readonly NODE_REDIS_EXECUTOR: "orchestrion:@redis/client:executor";
    readonly NODE_REDIS_CONNECT: "orchestrion:@redis/client:connect";
    readonly NODE_REDIS_MULTI: "orchestrion:@redis/client:multi";
    readonly NODE_REDIS_PIPELINE: "orchestrion:@redis/client:pipeline";
    readonly NODE_REDIS_BATCH: "orchestrion:@redis/client:batch";
    readonly POSTGRESJS_HANDLE: "orchestrion:postgres:handle";
    readonly POSTGRESJS_CONNECTION: "orchestrion:postgres:connection";
    readonly POSTGRESJS_EXECUTE: "orchestrion:postgres:execute";
    readonly POSTGRESJS_CONNECT: "orchestrion:postgres:connect";
    readonly PG_QUERY: "orchestrion:pg:query";
    readonly PG_CONNECT: "orchestrion:pg:connect";
    readonly PGPOOL_CONNECT: "orchestrion:pg-pool:connect";
    readonly OPENAI_CHAT: "orchestrion:openai:chat";
    readonly OPENAI_EMBEDDINGS: "orchestrion:openai:embeddings";
    readonly NESTJS_APP_CREATION: "orchestrion:@nestjs/core:nestFactoryCreate";
    readonly NESTJS_ROUTER_CONTEXT: "orchestrion:@nestjs/core:routerExecutionContextCreate";
    readonly NESTJS_INJECTABLE: "orchestrion:@nestjs/common:injectableDecorator";
    readonly NESTJS_CATCH: "orchestrion:@nestjs/common:catchDecorator";
    readonly NESTJS_SCHEDULE_CRON: "orchestrion:@nestjs/schedule:cronDecorator";
    readonly NESTJS_SCHEDULE_INTERVAL: "orchestrion:@nestjs/schedule:intervalDecorator";
    readonly NESTJS_SCHEDULE_TIMEOUT: "orchestrion:@nestjs/schedule:timeoutDecorator";
    readonly NESTJS_ONEVENT: "orchestrion:@nestjs/event-emitter:onEventDecorator";
    readonly NESTJS_PROCESSOR: "orchestrion:@nestjs/bullmq:processorDecorator";
    readonly MYSQL_QUERY: "orchestrion:mysql:query";
    readonly MYSQL2_QUERY: "orchestrion:mysql2:query";
    readonly MYSQL2_EXECUTE: "orchestrion:mysql2:execute";
    readonly MONGOOSE_QUERY_EXEC: "orchestrion:mongoose:query_exec";
    readonly MONGOOSE_AGGREGATE_EXEC: "orchestrion:mongoose:aggregate_exec";
    readonly MONGOOSE_MODEL_SAVE: "orchestrion:mongoose:model_save";
    readonly MONGOOSE_MODEL_INSERT_MANY: "orchestrion:mongoose:model_insert_many";
    readonly MONGOOSE_MODEL_BULK_WRITE: "orchestrion:mongoose:model_bulk_write";
    readonly MONGOOSE_MODEL_REMOVE: "orchestrion:mongoose:model_remove";
    readonly MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate";
    readonly MONGODB_COMMAND: "orchestrion:mongodb:command";
    readonly MONGODB_CHECKOUT: "orchestrion:mongodb:checkout";
    readonly MONGODB_V3_INSERT: "orchestrion:mongodb:v3_insert";
    readonly MONGODB_V3_UPDATE: "orchestrion:mongodb:v3_update";
    readonly MONGODB_V3_REMOVE: "orchestrion:mongodb:v3_remove";
    readonly MONGODB_V3_COMMAND: "orchestrion:mongodb:v3_command";
    readonly MONGODB_V3_QUERY: "
```

---

# COMANDO - channels.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\types-ts3.8\orchestrion\channels.d.ts
**SHA:** 3aa7b607fd097ca5
**Timestamp:** 2026-08-28T02:23:45.742307
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- readonly TEDIOUS_EXECUTE: "orchestrion:tedious:execute";
- readonly POSTGRESJS_EXECUTE: "orchestrion:postgres:execute";
- readonly MYSQL2_EXECUTE: "orchestrion:mysql2:execute";
- readonly KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run";
- readonly GRAPHQL_EXECUTE: "orchestrion:graphql:execute";

### Contratos
- readonly MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate";

### Ouro Bruto (primeiros 5000 chars)
```
/**
 * Fully-qualified `diagnostics_channel` names that orchestrion publishes to.
 *
 * Orchestrion's transform always prefixes the configured `channelName` with
 * `orchestrion:${module.name}:`. So a config of
 *   `{ channelName: 'query', module: { name: 'mysql' } }`
 * publishes to `orchestrion:mysql:query`.
 *
 * Subscribers (`integrations/<lib>/tracing-channel.ts`) consume the full
 * prefixed string from this map; the config files set only the unprefixed
 * suffix in `channelName`. Keeping both pieces in one file is what guarantees
 * they don't drift apart and silently stop firing.
 *
 * Kept sorted alphabetically by module so concurrent additions insert at different
 * points rather than all appending to the end (fewer merge conflicts).
 */
export declare const CHANNELS: {
    readonly VERCEL_AI_GENERATE_TEXT: "orchestrion:ai:generateText";
    readonly VERCEL_AI_STREAM_TEXT: "orchestrion:ai:streamText";
    readonly VERCEL_AI_GENERATE_OBJECT: "orchestrion:ai:generateObject";
    readonly VERCEL_AI_EMBED: "orchestrion:ai:embed";
    readonly VERCEL_AI_EMBED_MANY: "orchestrion:ai:embedMany";
    readonly VERCEL_AI_EXECUTE_TOOL_CALL: "orchestrion:ai:executeToolCall";
    readonly VERCEL_AI_RESOLVE_LANGUAGE_MODEL: "orchestrion:ai:resolveLanguageModel";
    readonly TEDIOUS_CONNECT: "orchestrion:tedious:connect";
    readonly TEDIOUS_EXEC_SQL: "orchestrion:tedious:execSql";
    readonly TEDIOUS_EXEC_SQL_BATCH: "orchestrion:tedious:execSqlBatch";
    readonly TEDIOUS_CALL_PROCEDURE: "orchestrion:tedious:callProcedure";
    readonly TEDIOUS_EXEC_BULK_LOAD: "orchestrion:tedious:execBulkLoad";
    readonly TEDIOUS_PREPARE: "orchestrion:tedious:prepare";
    readonly TEDIOUS_EXECUTE: "orchestrion:tedious:execute";
    readonly REMIX_REQUEST_HANDLER: "orchestrion:@remix-run/server-runtime:requestHandler";
    readonly REMIX_MATCH_SERVER_ROUTES: "orchestrion:@remix-run/server-runtime:matchServerRoutes";
    readonly REMIX_CALL_ROUTE_LOADER: "orchestrion:@remix-run/server-runtime:callRouteLoader";
    readonly REMIX_CALL_ROUTE_ACTION: "orchestrion:@remix-run/server-runtime:callRouteAction";
    readonly REDIS_COMMAND: "orchestrion:redis:command";
    readonly NODE_REDIS_COMMAND: "orchestrion:@redis/client:command";
    readonly NODE_REDIS_EXECUTOR: "orchestrion:@redis/client:executor";
    readonly NODE_REDIS_CONNECT: "orchestrion:@redis/client:connect";
    readonly NODE_REDIS_MULTI: "orchestrion:@redis/client:multi";
    readonly NODE_REDIS_PIPELINE: "orchestrion:@redis/client:pipeline";
    readonly NODE_REDIS_BATCH: "orchestrion:@redis/client:batch";
    readonly POSTGRESJS_HANDLE: "orchestrion:postgres:handle";
    readonly POSTGRESJS_CONNECTION: "orchestrion:postgres:connection";
    readonly POSTGRESJS_EXECUTE: "orchestrion:postgres:execute";
    readonly POSTGRESJS_CONNECT: "orchestrion:postgres:connect";
    readonly PG_QUERY: "orchestrion:pg:query";
    readonly PG_CONNECT: "orchestrion:pg:connect";
    readonly PGPOOL_CONNECT: "orchestrion:pg-pool:connect";
    readonly OPENAI_CHAT: "orchestrion:openai:chat";
    readonly OPENAI_EMBEDDINGS: "orchestrion:openai:embeddings";
    readonly NESTJS_APP_CREATION: "orchestrion:@nestjs/core:nestFactoryCreate";
    readonly NESTJS_ROUTER_CONTEXT: "orchestrion:@nestjs/core:routerExecutionContextCreate";
    readonly NESTJS_INJECTABLE: "orchestrion:@nestjs/common:injectableDecorator";
    readonly NESTJS_CATCH: "orchestrion:@nestjs/common:catchDecorator";
    readonly NESTJS_SCHEDULE_CRON: "orchestrion:@nestjs/schedule:cronDecorator";
    readonly NESTJS_SCHEDULE_INTERVAL: "orchestrion:@nestjs/schedule:intervalDecorator";
    readonly NESTJS_SCHEDULE_TIMEOUT: "orchestrion:@nestjs/schedule:timeoutDecorator";
    readonly NESTJS_ONEVENT: "orchestrion:@nestjs/event-emitter:onEventDecorator";
    readonly NESTJS_PROCESSOR: "orchestrion:@nestjs/bullmq:processorDecorator";
    readonly MYSQL_QUERY: "orchestrion:mysql:query";
    readonly MYSQL2_QUERY: "orchestrion:mysql2:query";
    readonly MYSQL2_EXECUTE: "orchestrion:mysql2:execute";
    readonly MONGOOSE_QUERY_EXEC: "orchestrion:mongoose:query_exec";
    readonly MONGOOSE_AGGREGATE_EXEC: "orchestrion:mongoose:aggregate_exec";
    readonly MONGOOSE_MODEL_SAVE: "orchestrion:mongoose:model_save";
    readonly MONGOOSE_MODEL_INSERT_MANY: "orchestrion:mongoose:model_insert_many";
    readonly MONGOOSE_MODEL_BULK_WRITE: "orchestrion:mongoose:model_bulk_write";
    readonly MONGOOSE_MODEL_REMOVE: "orchestrion:mongoose:model_remove";
    readonly MONGOOSE_MODEL_AGGREGATE: "orchestrion:mongoose:model_aggregate";
    readonly MONGODB_COMMAND: "orchestrion:mongodb:command";
    readonly MONGODB_CHECKOUT: "orchestrion:mongodb:checkout";
    readonly MONGODB_V3_INSERT: "orchestrion:mongodb:v3_insert";
    readonly MONGODB_V3_UPDATE: "orchestrion:mongodb:v3_update";
    readonly MONGODB_V3_REMOVE: "orchestrion:mongodb:v3_remove";
    readonly MONGODB_V3_COMMAND: "orchestrion:mongodb:v3_command";
    readonly MONGODB_V3_QUERY: "
```