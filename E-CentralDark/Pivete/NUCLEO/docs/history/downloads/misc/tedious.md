# OUTRO - tedious.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\tedious.js
**SHA:** 29f57b6fa1227901
**Timestamp:** 2026-08-28T02:23:29.583640
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- TEDIOUS_EXECUTE: "orchestrion:tedious:execute"

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const subscribeInjection = require('./subscribe-injection.js');

const MODULE_NAME = "tedious";
const FILE_PATH = "lib/connection.js";
const VERSION_RANGE = ">=1.11.0 <20";
const METHODS = ["connect", "execSql", "execSqlBatch", "callProcedure", "execBulkLoad", "prepare", "execute"];
const tediousConfig = METHODS.map((methodName) => ({
  channelName: methodName,
  module: { name: MODULE_NAME, versionRange: VERSION_RANGE, filePath: FILE_PATH },
  functionQuery: { className: "Connection", methodName, kind: "Sync" }
}));
const tediousChannels = {
  TEDIOUS_CONNECT: "orchestrion:tedious:connect",
  TEDIOUS_EXEC_SQL: "orchestrion:tedious:execSql",
  TEDIOUS_EXEC_SQL_BATCH: "orchestrion:tedious:execSqlBatch",
  TEDIOUS_CALL_PROCEDURE: "orchestrion:tedious:callProcedure",
  TEDIOUS_EXEC_BULK_LOAD: "orchestrion:tedious:execBulkLoad",
  TEDIOUS_PREPARE: "orchestrion:tedious:prepare",
  TEDIOUS_EXECUTE: "orchestrion:tedious:execute"
};
const tediousSubscribeInjection = subscribeInjection.toSubscribeInjections(tediousConfig);

exports.tediousChannels = tediousChannels;
exports.tediousConfig = tediousConfig;
exports.tediousSubscribeInjection = tediousSubscribeInjection;
//# sourceMappingURL=tedious.js.map

```

---

# OUTRO - tedious.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\tedious.js
**SHA:** aaab60f3a9b88738
**Timestamp:** 2026-08-28T02:23:37.158298
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- TEDIOUS_EXECUTE: "orchestrion:tedious:execute"

### Ouro Bruto (primeiros 5000 chars)
```
import { toSubscribeInjections } from './subscribe-injection.js';

const MODULE_NAME = "tedious";
const FILE_PATH = "lib/connection.js";
const VERSION_RANGE = ">=1.11.0 <20";
const METHODS = ["connect", "execSql", "execSqlBatch", "callProcedure", "execBulkLoad", "prepare", "execute"];
const tediousConfig = METHODS.map((methodName) => ({
  channelName: methodName,
  module: { name: MODULE_NAME, versionRange: VERSION_RANGE, filePath: FILE_PATH },
  functionQuery: { className: "Connection", methodName, kind: "Sync" }
}));
const tediousChannels = {
  TEDIOUS_CONNECT: "orchestrion:tedious:connect",
  TEDIOUS_EXEC_SQL: "orchestrion:tedious:execSql",
  TEDIOUS_EXEC_SQL_BATCH: "orchestrion:tedious:execSqlBatch",
  TEDIOUS_CALL_PROCEDURE: "orchestrion:tedious:callProcedure",
  TEDIOUS_EXEC_BULK_LOAD: "orchestrion:tedious:execBulkLoad",
  TEDIOUS_PREPARE: "orchestrion:tedious:prepare",
  TEDIOUS_EXECUTE: "orchestrion:tedious:execute"
};
const tediousSubscribeInjection = toSubscribeInjections(tediousConfig);

export { tediousChannels, tediousConfig, tediousSubscribeInjection };
//# sourceMappingURL=tedious.js.map

```