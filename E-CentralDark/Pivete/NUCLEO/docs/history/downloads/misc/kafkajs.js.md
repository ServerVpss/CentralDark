# OUTRO - kafkajs.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\kafkajs.js.map
**SHA:** 7ebc3816b3e1e052
**Timestamp:** 2026-08-28T02:23:28.704880
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"kafkajs.js","sources":["../../../../src/orchestrion/config/kafkajs.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from 

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"kafkajs.js","sources":["../../../../src/orchestrion/config/kafkajs.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from './subscribe-injection';\n\nexport const kafkajsConfig = [\n  {\n    channelName: 'send_batch',\n    module: { name: 'kafkajs', versionRange: '>=2.0.0 <3', filePath: 'src/producer/messageProducer.js' },\n    // `const sendBatch = async (...) => {...}` — `expressionName` matches the `const` assignment.\n    // We instrument ONLY `sendBatch`: `send` funnels into it internally, so `producer.send`,\n    // `producer.sendBatch` and their transactional variants all flow through this one channel.\n    // Instrumenting `send` too would double-count spans.\n    functionQuery: { expressionName: 'sendBatch', kind: 'Async' },\n  },\n  {\n    channelName: 'consumer_run',\n    module: { name: 'kafkajs', versionRange: '>=2.0.0 <3', filePath: 'src/consumer/index.js' },\n    // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:\n    // the `start` subscriber swaps `config.eachMessage`/`eachBatch` (on `ctx.arguments[0]`) for\n    // span-creating wrappers before the original runs. This works because the transform re-reads\n    // `ctx.arguments` when invoking the original.\n    functionQuery: { expressionName: 'run', kind: 'Async' },\n  },\n] satisfies InstrumentationConfig[];\n\nexport const kafkajsChannels = {\n  KAFKAJS_SEND_BATCH: 'orchestrion:kafkajs:send_batch',\n  KAFKAJS_CONSUMER_RUN: 'orchestrion:kafkajs:consumer_run',\n} as const;\n\nexport const kafkajsSubscribeInjection = toSubscribeInjections(kafkajsConfig);\n"],"names":["toSubscribeInjections"],"mappings":";;;;AAGO,MAAM,aAAA,GAAgB;AAAA,EAC3B;AAAA,IACE,WAAA,EAAa,YAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,YAAA,EAAc,UAAU,iCAAA,EAAkC;AAAA;AAAA;AAAA;AAAA;AAAA,IAKnG,aAAA,EAAe,EAAE,cAAA,EAAgB,WAAA,EAAa,MAAM,OAAA;AAAQ,GAC9D;AAAA,EACA;AAAA,IACE,WAAA,EAAa,cAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,YAAA,EAAc,UAAU,uBAAA,EAAwB;AAAA;AAAA;AAAA;AAAA;AAAA,IAKzF,aAAA,EAAe,EAAE,cAAA,EAAgB,KAAA,EAAO,MAAM,OAAA;AAAQ;AAE1D;AAEO,MAAM,eAAA,GAAkB;AAAA,EAC7B,kBAAA,EAAoB,gCAAA;AAAA,EACpB,oBAAA,EAAsB;AACxB;AAEO,MAAM,yBAAA,GAA4BA,yCAAsB,aAAa;;;;;;"}
```

---

# OUTRO - kafkajs.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\kafkajs.js.map
**SHA:** 17d2781e9f7a428e
**Timestamp:** 2026-08-28T02:23:36.629379
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- {"version":3,"file":"kafkajs.js","sources":["../../../../src/orchestrion/config/kafkajs.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from 

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"kafkajs.js","sources":["../../../../src/orchestrion/config/kafkajs.ts"],"sourcesContent":["import type { InstrumentationConfig } from '..';\nimport { toSubscribeInjections } from './subscribe-injection';\n\nexport const kafkajsConfig = [\n  {\n    channelName: 'send_batch',\n    module: { name: 'kafkajs', versionRange: '>=2.0.0 <3', filePath: 'src/producer/messageProducer.js' },\n    // `const sendBatch = async (...) => {...}` — `expressionName` matches the `const` assignment.\n    // We instrument ONLY `sendBatch`: `send` funnels into it internally, so `producer.send`,\n    // `producer.sendBatch` and their transactional variants all flow through this one channel.\n    // Instrumenting `send` too would double-count spans.\n    functionQuery: { expressionName: 'sendBatch', kind: 'Async' },\n  },\n  {\n    channelName: 'consumer_run',\n    module: { name: 'kafkajs', versionRange: '>=2.0.0 <3', filePath: 'src/consumer/index.js' },\n    // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:\n    // the `start` subscriber swaps `config.eachMessage`/`eachBatch` (on `ctx.arguments[0]`) for\n    // span-creating wrappers before the original runs. This works because the transform re-reads\n    // `ctx.arguments` when invoking the original.\n    functionQuery: { expressionName: 'run', kind: 'Async' },\n  },\n] satisfies InstrumentationConfig[];\n\nexport const kafkajsChannels = {\n  KAFKAJS_SEND_BATCH: 'orchestrion:kafkajs:send_batch',\n  KAFKAJS_CONSUMER_RUN: 'orchestrion:kafkajs:consumer_run',\n} as const;\n\nexport const kafkajsSubscribeInjection = toSubscribeInjections(kafkajsConfig);\n"],"names":[],"mappings":";;AAGO,MAAM,aAAA,GAAgB;AAAA,EAC3B;AAAA,IACE,WAAA,EAAa,YAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,YAAA,EAAc,UAAU,iCAAA,EAAkC;AAAA;AAAA;AAAA;AAAA;AAAA,IAKnG,aAAA,EAAe,EAAE,cAAA,EAAgB,WAAA,EAAa,MAAM,OAAA;AAAQ,GAC9D;AAAA,EACA;AAAA,IACE,WAAA,EAAa,cAAA;AAAA,IACb,QAAQ,EAAE,IAAA,EAAM,WAAW,YAAA,EAAc,YAAA,EAAc,UAAU,uBAAA,EAAwB;AAAA;AAAA;AAAA;AAAA;AAAA,IAKzF,aAAA,EAAe,EAAE,cAAA,EAAgB,KAAA,EAAO,MAAM,OAAA;AAAQ;AAE1D;AAEO,MAAM,eAAA,GAAkB;AAAA,EAC7B,kBAAA,EAAoB,gCAAA;AAAA,EACpB,oBAAA,EAAsB;AACxB;AAEO,MAAM,yBAAA,GAA4B,sBAAsB,aAAa;;;;"}
```