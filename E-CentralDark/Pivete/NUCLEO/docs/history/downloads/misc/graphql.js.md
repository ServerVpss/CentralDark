# OUTRO - graphql.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\graphql.js.map
**SHA:** 0acfd3b3b7481d8d
**Timestamp:** 2026-08-28T02:23:28.607883
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"graphql.js","sources":["../../../../src/orchestrion/config/graphql.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from 

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"graphql.js","sources":["../../../../src/orchestrion/config/graphql.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from './subscribe-injection';\n\n// `parse`/`validate`/`execute` are top-level named `function` declarations in graphql's compiled\n// files, stable across the supported majors, so `functionName` matches. `execute` returns\n// `PromiseOrValue`, so `Auto` covers both async (settles on `asyncEnd`) and sync (`end`) schemas.\nexport const graphqlConfig = [\n  {\n    channelName: 'parse',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'language/parser.js' },\n    functionQuery: { functionName: 'parse', kind: 'Sync' },\n  },\n  {\n    channelName: 'validate',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'validation/validate.js' },\n    functionQuery: { functionName: 'validate', kind: 'Sync' },\n  },\n  {\n    channelName: 'execute',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'execution/execute.js' },\n    functionQuery: { functionName: 'execute', kind: 'Auto' },\n  },\n] satisfies InstrumentationConfig[];\n\nexport const graphqlChannels = {\n  GRAPHQL_PARSE: 'orchestrion:graphql:parse',\n  GRAPHQL_VALIDATE: 'orchestrion:graphql:validate',\n  GRAPHQL_EXECUTE: 'orchestrion:graphql:execute',\n} as const;\n\nexport const graphqlSubscribeInjection = toSubscribeInjections(graphqlConfig);\n"],"names":["toSubscribeInjections"],"mappings":";;;;AAMO,MAAM,aAAA,GAAgB;AAAA,EAC3B;AAAA,IACE,WAAA,EAAa,OAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,oBAAA,EAAqB;AAAA,IACxF,aAAA,EAAe,EAAE,YAAA,EAAc,OAAA,EAAS,MAAM,MAAA;AAAO,GACvD;AAAA,EACA;AAAA,IACE,WAAA,EAAa,UAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,wBAAA,EAAyB;AAAA,IAC5F,aAAA,EAAe,EAAE,YAAA,EAAc,UAAA,EAAY,MAAM,MAAA;AAAO,GAC1D;AAAA,EACA;AAAA,IACE,WAAA,EAAa,SAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,sBAAA,EAAuB;AAAA,IAC1F,aAAA,EAAe,EAAE,YAAA,EAAc,SAAA,EAAW,MAAM,MAAA;AAAO;AAE3D;AAEO,MAAM,eAAA,GAAkB;AAAA,EAC7B,aAAA,EAAe,2BAAA;AAAA,EACf,gBAAA,EAAkB,8BAAA;AAAA,EAClB,eAAA,EAAiB;AACnB;AAEO,MAAM,yBAAA,GAA4BA,yCAAsB,aAAa;;;;;;"}
```

---

# OUTRO - graphql.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\graphql.js.map
**SHA:** 717a56575226bd99
**Timestamp:** 2026-08-28T02:23:36.453708
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"graphql.js","sources":["../../../../src/orchestrion/config/graphql.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from 

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"graphql.js","sources":["../../../../src/orchestrion/config/graphql.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from './subscribe-injection';\n\n// `parse`/`validate`/`execute` are top-level named `function` declarations in graphql's compiled\n// files, stable across the supported majors, so `functionName` matches. `execute` returns\n// `PromiseOrValue`, so `Auto` covers both async (settles on `asyncEnd`) and sync (`end`) schemas.\nexport const graphqlConfig = [\n  {\n    channelName: 'parse',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'language/parser.js' },\n    functionQuery: { functionName: 'parse', kind: 'Sync' },\n  },\n  {\n    channelName: 'validate',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'validation/validate.js' },\n    functionQuery: { functionName: 'validate', kind: 'Sync' },\n  },\n  {\n    channelName: 'execute',\n    module: { name: 'graphql', versionRange: '>=14.0.0 <17', filePath: 'execution/execute.js' },\n    functionQuery: { functionName: 'execute', kind: 'Auto' },\n  },\n] satisfies InstrumentationConfig[];\n\nexport const graphqlChannels = {\n  GRAPHQL_PARSE: 'orchestrion:graphql:parse',\n  GRAPHQL_VALIDATE: 'orchestrion:graphql:validate',\n  GRAPHQL_EXECUTE: 'orchestrion:graphql:execute',\n} as const;\n\nexport const graphqlSubscribeInjection = toSubscribeInjections(graphqlConfig);\n"],"names":[],"mappings":";;AAMO,MAAM,aAAA,GAAgB;AAAA,EAC3B;AAAA,IACE,WAAA,EAAa,OAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,oBAAA,EAAqB;AAAA,IACxF,aAAA,EAAe,EAAE,YAAA,EAAc,OAAA,EAAS,MAAM,MAAA;AAAO,GACvD;AAAA,EACA;AAAA,IACE,WAAA,EAAa,UAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,wBAAA,EAAyB;AAAA,IAC5F,aAAA,EAAe,EAAE,YAAA,EAAc,UAAA,EAAY,MAAM,MAAA;AAAO,GAC1D;AAAA,EACA;AAAA,IACE,WAAA,EAAa,SAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,cAAA,EAAgB,UAAU,sBAAA,EAAuB;AAAA,IAC1F,aAAA,EAAe,EAAE,YAAA,EAAc,SAAA,EAAW,MAAM,MAAA;AAAO;AAE3D;AAEO,MAAM,eAAA,GAAkB;AAAA,EAC7B,aAAA,EAAe,2BAAA;AAAA,EACf,gBAAA,EAAkB,8BAAA;AAAA,EAClB,eAAA,EAAiB;AACnB;AAEO,MAAM,yBAAA,GAA4B,sBAAsB,aAAa;;;;"}
```