# COMANDO - record-request-session.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\cjs\integrations\http\record-request-session.js
**SHA:** dbde00611aa79794
**Timestamp:** 2026-08-28T02:21:49.466720
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
- const newClientAggregate = { [dateBucketKey]: bucket };

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const debugLogger = require('../../utils/debug-logger.js');
const debugBuild = require('../../debug-build.js');
const randomSafeContext = require('../../utils/randomSafeContext.js');
const timer = require('../../utils/timer.js');

const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new WeakMap();
function recordRequestSession(client, {
  requestIsolationScope,
  response,
  sessionFlushingDelayMS
}) {
  requestIsolationScope.setSDKProcessingMetadata({
    requestSession: { status: "ok" }
  });
  response.once("close", () => {
    const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
    if (client && requestSession) {
      debugBuild.DEBUG_BUILD && debugLogger.debug.log(`Recorded request session with status: ${requestSession.status}`);
      const roundedDate = new Date(randomSafeContext.safeDateNow());
      roundedDate.setSeconds(0, 0);
      const dateBucketKey = roundedDate.toISOString();
      const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
      const bucket = existingClientAggregate?.[dateBucketKey] || { exited: 0, crashed: 0, errored: 0 };
      bucket[{ ok: "exited", crashed: "crashed", errored: "errored" }[requestSession.status]]++;
      if (existingClientAggregate) {
        existingClientAggregate[dateBucketKey] = bucket;
      } else {
        debugBuild.DEBUG_BUILD && debugLogger.debug.log("Opened new request session aggregate.");
        const newClientAggregate = { [dateBucketKey]: bucket };
        clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
        const flushPendingClientAggregates = () => {
          clearTimeout(timeout);
          unregisterClientFlushHook();
          clientToRequestSessionAggregatesMap.delete(client);
          const aggregatePayload = Object.entries(newClientAggregate).map(
            ([timestamp, value]) => ({
              started: timestamp,
              exited: value.exited,
              errored: value.errored,
              crashed: value.crashed
            })
          );
          client.sendSession({ aggregates: aggregatePayload });
        };
        const unregisterClientFlushHook = client.on("flush", () => {
          debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending request session aggregate due to client flush");
          flushPendingClientAggregates();
        });
        const timeout = setTimeout(() => {
          debugBuild.DEBUG_BUILD && debugLogger.debug.log("Sending request session aggregate due to flushing schedule");
          flushPendingClientAggregates();
        }, sessionFlushingDelayMS);
        timer.safeUnref(timeout);
      }
    }
  });
}

exports.recordRequestSession = recordRequestSession;
//# sourceMappingURL=record-request-session.js.map

```

---

# COMANDO - record-request-session.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\core@10.71.0@@@1\build\esm\integrations\http\record-request-session.js
**SHA:** c1e1cf4ae0f25a7d
**Timestamp:** 2026-08-28T02:22:03.231743
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
- const newClientAggregate = { [dateBucketKey]: bucket };

### Ouro Bruto (primeiros 5000 chars)
```
import { debug } from '../../utils/debug-logger.js';
import { DEBUG_BUILD } from '../../debug-build.js';
import { safeDateNow } from '../../utils/randomSafeContext.js';
import { safeUnref } from '../../utils/timer.js';

const clientToRequestSessionAggregatesMap = /* @__PURE__ */ new WeakMap();
function recordRequestSession(client, {
  requestIsolationScope,
  response,
  sessionFlushingDelayMS
}) {
  requestIsolationScope.setSDKProcessingMetadata({
    requestSession: { status: "ok" }
  });
  response.once("close", () => {
    const requestSession = requestIsolationScope.getScopeData().sdkProcessingMetadata.requestSession;
    if (client && requestSession) {
      DEBUG_BUILD && debug.log(`Recorded request session with status: ${requestSession.status}`);
      const roundedDate = new Date(safeDateNow());
      roundedDate.setSeconds(0, 0);
      const dateBucketKey = roundedDate.toISOString();
      const existingClientAggregate = clientToRequestSessionAggregatesMap.get(client);
      const bucket = existingClientAggregate?.[dateBucketKey] || { exited: 0, crashed: 0, errored: 0 };
      bucket[{ ok: "exited", crashed: "crashed", errored: "errored" }[requestSession.status]]++;
      if (existingClientAggregate) {
        existingClientAggregate[dateBucketKey] = bucket;
      } else {
        DEBUG_BUILD && debug.log("Opened new request session aggregate.");
        const newClientAggregate = { [dateBucketKey]: bucket };
        clientToRequestSessionAggregatesMap.set(client, newClientAggregate);
        const flushPendingClientAggregates = () => {
          clearTimeout(timeout);
          unregisterClientFlushHook();
          clientToRequestSessionAggregatesMap.delete(client);
          const aggregatePayload = Object.entries(newClientAggregate).map(
            ([timestamp, value]) => ({
              started: timestamp,
              exited: value.exited,
              errored: value.errored,
              crashed: value.crashed
            })
          );
          client.sendSession({ aggregates: aggregatePayload });
        };
        const unregisterClientFlushHook = client.on("flush", () => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to client flush");
          flushPendingClientAggregates();
        });
        const timeout = setTimeout(() => {
          DEBUG_BUILD && debug.log("Sending request session aggregate due to flushing schedule");
          flushPendingClientAggregates();
        }, sessionFlushingDelayMS);
        safeUnref(timeout);
      }
    }
  });
}

export { recordRequestSession };
//# sourceMappingURL=record-request-session.js.map

```