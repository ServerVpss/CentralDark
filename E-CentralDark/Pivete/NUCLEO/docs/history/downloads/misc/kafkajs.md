# OUTRO - kafkajs.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\kafkajs.js
**SHA:** a780d26fd722a4e9
**Timestamp:** 2026-08-28T02:23:28.698367
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:
- KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run"

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const subscribeInjection = require('./subscribe-injection.js');

const kafkajsConfig = [
  {
    channelName: "send_batch",
    module: { name: "kafkajs", versionRange: ">=2.0.0 <3", filePath: "src/producer/messageProducer.js" },
    // `const sendBatch = async (...) => {...}` — `expressionName` matches the `const` assignment.
    // We instrument ONLY `sendBatch`: `send` funnels into it internally, so `producer.send`,
    // `producer.sendBatch` and their transactional variants all flow through this one channel.
    // Instrumenting `send` too would double-count spans.
    functionQuery: { expressionName: "sendBatch", kind: "Async" }
  },
  {
    channelName: "consumer_run",
    module: { name: "kafkajs", versionRange: ">=2.0.0 <3", filePath: "src/consumer/index.js" },
    // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:
    // the `start` subscriber swaps `config.eachMessage`/`eachBatch` (on `ctx.arguments[0]`) for
    // span-creating wrappers before the original runs. This works because the transform re-reads
    // `ctx.arguments` when invoking the original.
    functionQuery: { expressionName: "run", kind: "Async" }
  }
];
const kafkajsChannels = {
  KAFKAJS_SEND_BATCH: "orchestrion:kafkajs:send_batch",
  KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run"
};
const kafkajsSubscribeInjection = subscribeInjection.toSubscribeInjections(kafkajsConfig);

exports.kafkajsChannels = kafkajsChannels;
exports.kafkajsConfig = kafkajsConfig;
exports.kafkajsSubscribeInjection = kafkajsSubscribeInjection;
//# sourceMappingURL=kafkajs.js.map

```

---

# OUTRO - kafkajs.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\kafkajs.js
**SHA:** 83a79906ba5cba38
**Timestamp:** 2026-08-28T02:23:36.626873
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:
- KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run"

### Ouro Bruto (primeiros 5000 chars)
```
import { toSubscribeInjections } from './subscribe-injection.js';

const kafkajsConfig = [
  {
    channelName: "send_batch",
    module: { name: "kafkajs", versionRange: ">=2.0.0 <3", filePath: "src/producer/messageProducer.js" },
    // `const sendBatch = async (...) => {...}` — `expressionName` matches the `const` assignment.
    // We instrument ONLY `sendBatch`: `send` funnels into it internally, so `producer.send`,
    // `producer.sendBatch` and their transactional variants all flow through this one channel.
    // Instrumenting `send` too would double-count spans.
    functionQuery: { expressionName: "sendBatch", kind: "Async" }
  },
  {
    channelName: "consumer_run",
    module: { name: "kafkajs", versionRange: ">=2.0.0 <3", filePath: "src/consumer/index.js" },
    // `const run = async (config) => {...}` — matched by `expressionName`. We don't span `run` itself:
    // the `start` subscriber swaps `config.eachMessage`/`eachBatch` (on `ctx.arguments[0]`) for
    // span-creating wrappers before the original runs. This works because the transform re-reads
    // `ctx.arguments` when invoking the original.
    functionQuery: { expressionName: "run", kind: "Async" }
  }
];
const kafkajsChannels = {
  KAFKAJS_SEND_BATCH: "orchestrion:kafkajs:send_batch",
  KAFKAJS_CONSUMER_RUN: "orchestrion:kafkajs:consumer_run"
};
const kafkajsSubscribeInjection = toSubscribeInjections(kafkajsConfig);

export { kafkajsChannels, kafkajsConfig, kafkajsSubscribeInjection };
//# sourceMappingURL=kafkajs.js.map

```