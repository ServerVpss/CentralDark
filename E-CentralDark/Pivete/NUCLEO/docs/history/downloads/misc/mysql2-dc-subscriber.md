# OUTRO - mysql2-dc-subscriber.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\mysql2\mysql2-dc-subscriber.js
**SHA:** 57048b1576e460c8
**Timestamp:** 2026-08-28T02:23:27.522524
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";
- exports.MYSQL2_DC_CHANNEL_EXECUTE = MYSQL2_DC_CHANNEL_EXECUTE;

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const attributes = require('@sentry/conventions/attributes');
const core = require('@sentry/core');
const tracingChannel = require('../tracing-channel.js');

const MYSQL2_DC_CHANNEL_QUERY = "mysql2:query";
const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";
const MYSQL2_DC_CHANNEL_CONNECT = "mysql2:connect";
const MYSQL2_DC_CHANNEL_POOL_CONNECT = "mysql2:pool:connect";
const ORIGIN = "auto.db.mysql2.diagnostic_channel";
const DB_SYSTEM_NAME_VALUE_MYSQL = "mysql";
const SQL_OPERATION_RE = /^\s*(\w+)/;
function subscribeMysql2DiagnosticChannels(tracingChannel) {
  setupQueryChannel(tracingChannel, MYSQL2_DC_CHANNEL_QUERY);
  setupQueryChannel(tracingChannel, MYSQL2_DC_CHANNEL_EXECUTE);
  setupConnectChannel(tracingChannel, MYSQL2_DC_CHANNEL_CONNECT, "mysql2.connect");
  setupConnectChannel(tracingChannel, MYSQL2_DC_CHANNEL_POOL_CONNECT, "mysql2.pool.connect");
}
function setupQueryChannel(tracingChannel$1, channelName) {
  tracingChannel.bindTracingChannelToSpan(
    tracingChannel$1(channelName),
    (data) => {
      const queryText = data.query ? core._INTERNAL_sanitizeSqlQuery(data.query) : void 0;
      const operation = queryText?.match(SQL_OPERATION_RE)?.[1]?.toUpperCase();
      return core.startInactiveSpan({
        name: queryText || "mysql2.query",
        attributes: {
          [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
          [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
          [attributes.DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_MYSQL,
          [attributes.DB_QUERY_TEXT]: queryText,
          [attributes.DB_OPERATION_NAME]: operation,
          [attributes.DB_NAMESPACE]: data.database || void 0,
          [attributes.SERVER_ADDRESS]: data.serverAddress,
          [attributes.SERVER_PORT]: data.serverPort
        }
      });
    },
    { requiresParentSpan: true }
  );
}
function setupConnectChannel(tracingChannel$1, channelName, spanName) {
  tracingChannel.bindTracingChannelToSpan(
    tracingChannel$1(channelName),
    (data) => {
      return core.startInactiveSpan({
        name: spanName,
        attributes: {
          [core.SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
          [core.SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
          [attributes.DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_MYSQL,
          [attributes.DB_NAMESPACE]: data.database || void 0,
          [attributes.SERVER_ADDRESS]: data.serverAddress,
          [attributes.SERVER_PORT]: data.serverPort
        }
      });
    },
    { requiresParentSpan: true }
  );
}

exports.MYSQL2_DC_CHANNEL_CONNECT = MYSQL2_DC_CHANNEL_CONNECT;
exports.MYSQL2_DC_CHANNEL_EXECUTE = MYSQL2_DC_CHANNEL_EXECUTE;
exports.MYSQL2_DC_CHANNEL_POOL_CONNECT = MYSQL2_DC_CHANNEL_POOL_CONNECT;
exports.MYSQL2_DC_CHANNEL_QUERY = MYSQL2_DC_CHANNEL_QUERY;
exports.subscribeMysql2DiagnosticChannels = subscribeMysql2DiagnosticChannels;
//# sourceMappingURL=mysql2-dc-subscriber.js.map

```

---

# OUTRO - mysql2-dc-subscriber.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\mysql2\mysql2-dc-subscriber.js
**SHA:** eb9fad63f9e162f8
**Timestamp:** 2026-08-28T02:23:35.712196
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";

### Ouro Bruto (primeiros 5000 chars)
```
import { SERVER_PORT, SERVER_ADDRESS, DB_NAMESPACE, DB_OPERATION_NAME, DB_QUERY_TEXT, DB_SYSTEM_NAME } from '@sentry/conventions/attributes';
import { _INTERNAL_sanitizeSqlQuery, startInactiveSpan, SEMANTIC_ATTRIBUTE_SENTRY_OP, SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN } from '@sentry/core';
import { bindTracingChannelToSpan } from '../tracing-channel.js';

const MYSQL2_DC_CHANNEL_QUERY = "mysql2:query";
const MYSQL2_DC_CHANNEL_EXECUTE = "mysql2:execute";
const MYSQL2_DC_CHANNEL_CONNECT = "mysql2:connect";
const MYSQL2_DC_CHANNEL_POOL_CONNECT = "mysql2:pool:connect";
const ORIGIN = "auto.db.mysql2.diagnostic_channel";
const DB_SYSTEM_NAME_VALUE_MYSQL = "mysql";
const SQL_OPERATION_RE = /^\s*(\w+)/;
function subscribeMysql2DiagnosticChannels(tracingChannel) {
  setupQueryChannel(tracingChannel, MYSQL2_DC_CHANNEL_QUERY);
  setupQueryChannel(tracingChannel, MYSQL2_DC_CHANNEL_EXECUTE);
  setupConnectChannel(tracingChannel, MYSQL2_DC_CHANNEL_CONNECT, "mysql2.connect");
  setupConnectChannel(tracingChannel, MYSQL2_DC_CHANNEL_POOL_CONNECT, "mysql2.pool.connect");
}
function setupQueryChannel(tracingChannel, channelName) {
  bindTracingChannelToSpan(
    tracingChannel(channelName),
    (data) => {
      const queryText = data.query ? _INTERNAL_sanitizeSqlQuery(data.query) : void 0;
      const operation = queryText?.match(SQL_OPERATION_RE)?.[1]?.toUpperCase();
      return startInactiveSpan({
        name: queryText || "mysql2.query",
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
          [DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_MYSQL,
          [DB_QUERY_TEXT]: queryText,
          [DB_OPERATION_NAME]: operation,
          [DB_NAMESPACE]: data.database || void 0,
          [SERVER_ADDRESS]: data.serverAddress,
          [SERVER_PORT]: data.serverPort
        }
      });
    },
    { requiresParentSpan: true }
  );
}
function setupConnectChannel(tracingChannel, channelName, spanName) {
  bindTracingChannelToSpan(
    tracingChannel(channelName),
    (data) => {
      return startInactiveSpan({
        name: spanName,
        attributes: {
          [SEMANTIC_ATTRIBUTE_SENTRY_ORIGIN]: ORIGIN,
          [SEMANTIC_ATTRIBUTE_SENTRY_OP]: "db",
          [DB_SYSTEM_NAME]: DB_SYSTEM_NAME_VALUE_MYSQL,
          [DB_NAMESPACE]: data.database || void 0,
          [SERVER_ADDRESS]: data.serverAddress,
          [SERVER_PORT]: data.serverPort
        }
      });
    },
    { requiresParentSpan: true }
  );
}

export { MYSQL2_DC_CHANNEL_CONNECT, MYSQL2_DC_CHANNEL_EXECUTE, MYSQL2_DC_CHANNEL_POOL_CONNECT, MYSQL2_DC_CHANNEL_QUERY, subscribeMysql2DiagnosticChannels };
//# sourceMappingURL=mysql2-dc-subscriber.js.map

```