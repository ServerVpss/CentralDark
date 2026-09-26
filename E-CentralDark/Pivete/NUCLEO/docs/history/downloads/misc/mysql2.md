# OUTRO - mysql2.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\cjs\orchestrion\config\mysql2.js
**SHA:** 3d3f0c8093a3783d
**Timestamp:** 2026-08-28T02:23:29.180399
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- MYSQL2_EXECUTE: "orchestrion:mysql2:execute"

### Ouro Bruto (primeiros 5000 chars)
```
Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });

const subscribeInjection = require('./subscribe-injection.js');

const mysql2Config = [
  {
    channelName: "query",
    module: { name: "mysql2", versionRange: ">=1.4.2 <3.11.5", filePath: "lib/connection.js" },
    functionQuery: { className: "Connection", methodName: "query", kind: "Callback" }
  },
  {
    channelName: "execute",
    module: { name: "mysql2", versionRange: ">=1.4.2 <3.11.5", filePath: "lib/connection.js" },
    functionQuery: { className: "Connection", methodName: "execute", kind: "Callback" }
  },
  {
    channelName: "query",
    module: { name: "mysql2", versionRange: ">=3.11.5 <3.20.0", filePath: "lib/base/connection.js" },
    functionQuery: { className: "BaseConnection", methodName: "query", kind: "Callback" }
  },
  {
    channelName: "execute",
    module: { name: "mysql2", versionRange: ">=3.11.5 <3.20.0", filePath: "lib/base/connection.js" },
    functionQuery: { className: "BaseConnection", methodName: "execute", kind: "Callback" }
  }
];
const mysql2Channels = {
  MYSQL2_QUERY: "orchestrion:mysql2:query",
  MYSQL2_EXECUTE: "orchestrion:mysql2:execute"
};
const mysql2SubscribeInjection = subscribeInjection.toSubscribeInjections(mysql2Config);

exports.mysql2Channels = mysql2Channels;
exports.mysql2Config = mysql2Config;
exports.mysql2SubscribeInjection = mysql2SubscribeInjection;
//# sourceMappingURL=mysql2.js.map

```

---

# OUTRO - mysql2.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@sentry\server-utils@10.71.0@@@1\build\esm\orchestrion\config\mysql2.js
**SHA:** e4231036e1fd0212
**Timestamp:** 2026-08-28T02:23:36.909357
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- MYSQL2_EXECUTE: "orchestrion:mysql2:execute"

### Ouro Bruto (primeiros 5000 chars)
```
import { toSubscribeInjections } from './subscribe-injection.js';

const mysql2Config = [
  {
    channelName: "query",
    module: { name: "mysql2", versionRange: ">=1.4.2 <3.11.5", filePath: "lib/connection.js" },
    functionQuery: { className: "Connection", methodName: "query", kind: "Callback" }
  },
  {
    channelName: "execute",
    module: { name: "mysql2", versionRange: ">=1.4.2 <3.11.5", filePath: "lib/connection.js" },
    functionQuery: { className: "Connection", methodName: "execute", kind: "Callback" }
  },
  {
    channelName: "query",
    module: { name: "mysql2", versionRange: ">=3.11.5 <3.20.0", filePath: "lib/base/connection.js" },
    functionQuery: { className: "BaseConnection", methodName: "query", kind: "Callback" }
  },
  {
    channelName: "execute",
    module: { name: "mysql2", versionRange: ">=3.11.5 <3.20.0", filePath: "lib/base/connection.js" },
    functionQuery: { className: "BaseConnection", methodName: "execute", kind: "Callback" }
  }
];
const mysql2Channels = {
  MYSQL2_QUERY: "orchestrion:mysql2:query",
  MYSQL2_EXECUTE: "orchestrion:mysql2:execute"
};
const mysql2SubscribeInjection = toSubscribeInjections(mysql2Config);

export { mysql2Channels, mysql2Config, mysql2SubscribeInjection };
//# sourceMappingURL=mysql2.js.map

```