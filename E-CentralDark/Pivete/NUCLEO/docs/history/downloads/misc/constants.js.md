# OUTRO - constants.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\integrations\tracing-channel\graphql\constants.js.map
**SHA:** d722863fcc2b8eb2
**Timestamp:** 2026-08-28T02:23:26.940052
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"constants.js","sources":["../../../../../src/integrations/tracing-channel/graphql/constants.ts"],"sourcesContent":["/*\n * These mirror the constants in `@sentry/server-utils`'s n

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"constants.js","sources":["../../../../../src/integrations/tracing-channel/graphql/constants.ts"],"sourcesContent":["/*\n * These mirror the constants in `@sentry/server-utils`'s native graphql subscriber\n * (`src/graphql/graphql-dc-subscriber.ts`) so the orchestrion path (graphql v14–16) and the native\n * `diagnostics_channel` path (graphql >= 17) emit identical spans — same origin, span names and\n * field-attribute keys. `graphql.document`/`graphql.operation.*` and the span `op` come from\n * `@sentry/conventions` directly and are imported where used.\n */\n\nexport const ORIGIN = 'auto.graphql.diagnostic_channel';\n\nexport const SPAN_NAME_PARSE = 'graphql.parse';\nexport const SPAN_NAME_VALIDATE = 'graphql.validate';\nexport const SPAN_NAME_EXECUTE = 'graphql.execute';\nexport const SPAN_NAME_RESOLVE = 'graphql.resolve';\n\n// Field-level resolver-span attributes; not in `@sentry/conventions`.\nexport const GRAPHQL_FIELD_NAME = 'graphql.field.name';\nexport const GRAPHQL_FIELD_PATH = 'graphql.field.path';\nexport const GRAPHQL_FIELD_TYPE = 'graphql.field.type';\nexport const GRAPHQL_PARENT_NAME = 'graphql.parent.name';\n\n// `Symbol.for` keys shared with any co-resident OTel graphql instrumentation on purpose: the paths are\n// mutually exclusive at runtime, and reusing the key keeps nested-execute detection and resolver\n// parenting consistent if both ever load.\nexport const GRAPHQL_DATA_SYMBOL = Symbol.for('opentelemetry.graphql_data');\nexport const GRAPHQL_PATCHED_SYMBOL = Symbol.for('opentelemetry.patched');\n"],"names":[],"mappings":";;AAQO,MAAM,MAAA,GAAS;AAEf,MAAM,eAAA,GAAkB;AACxB,MAAM,kBAAA,GAAqB;AAC3B,MAAM,iBAAA,GAAoB;AAC1B,MAAM,iBAAA,GAAoB;AAG1B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,mBAAA,GAAsB;AAK5B,MAAM,mBAAA,mBAAsB,MAAA,CAAO,GAAA,CAAI,4BAA4B;AACnE,MAAM,sBAAA,mBAAyB,MAAA,CAAO,GAAA,CAAI,uBAAuB;;;;;;;;;;;;;;"}
```

---

# OUTRO - constants.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\integrations\tracing-channel\graphql\constants.js.map
**SHA:** 0dd9eb395a970a95
**Timestamp:** 2026-08-28T02:23:35.229960
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"constants.js","sources":["../../../../../src/integrations/tracing-channel/graphql/constants.ts"],"sourcesContent":["/*\n * These mirror the constants in `@sentry/server-utils`'s n

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"constants.js","sources":["../../../../../src/integrations/tracing-channel/graphql/constants.ts"],"sourcesContent":["/*\n * These mirror the constants in `@sentry/server-utils`'s native graphql subscriber\n * (`src/graphql/graphql-dc-subscriber.ts`) so the orchestrion path (graphql v14–16) and the native\n * `diagnostics_channel` path (graphql >= 17) emit identical spans — same origin, span names and\n * field-attribute keys. `graphql.document`/`graphql.operation.*` and the span `op` come from\n * `@sentry/conventions` directly and are imported where used.\n */\n\nexport const ORIGIN = 'auto.graphql.diagnostic_channel';\n\nexport const SPAN_NAME_PARSE = 'graphql.parse';\nexport const SPAN_NAME_VALIDATE = 'graphql.validate';\nexport const SPAN_NAME_EXECUTE = 'graphql.execute';\nexport const SPAN_NAME_RESOLVE = 'graphql.resolve';\n\n// Field-level resolver-span attributes; not in `@sentry/conventions`.\nexport const GRAPHQL_FIELD_NAME = 'graphql.field.name';\nexport const GRAPHQL_FIELD_PATH = 'graphql.field.path';\nexport const GRAPHQL_FIELD_TYPE = 'graphql.field.type';\nexport const GRAPHQL_PARENT_NAME = 'graphql.parent.name';\n\n// `Symbol.for` keys shared with any co-resident OTel graphql instrumentation on purpose: the paths are\n// mutually exclusive at runtime, and reusing the key keeps nested-execute detection and resolver\n// parenting consistent if both ever load.\nexport const GRAPHQL_DATA_SYMBOL = Symbol.for('opentelemetry.graphql_data');\nexport const GRAPHQL_PATCHED_SYMBOL = Symbol.for('opentelemetry.patched');\n"],"names":[],"mappings":"AAQO,MAAM,MAAA,GAAS;AAEf,MAAM,eAAA,GAAkB;AACxB,MAAM,kBAAA,GAAqB;AAC3B,MAAM,iBAAA,GAAoB;AAC1B,MAAM,iBAAA,GAAoB;AAG1B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,kBAAA,GAAqB;AAC3B,MAAM,mBAAA,GAAsB;AAK5B,MAAM,mBAAA,mBAAsB,MAAA,CAAO,GAAA,CAAI,4BAA4B;AACnE,MAAM,sBAAA,mBAAyB,MAAA,CAAO,GAAA,CAAI,uBAAuB;;;;"}
```