# COMANDO - ProxyLogger.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\esm\ProxyLogger.js
**SHA:** 436c54b37cad6cc3
**Timestamp:** 2026-08-28T02:20:42.446264
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._delegate = logger;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { NOOP_LOGGER } from './NoopLogger';
export class ProxyLogger {
    constructor(provider, name, version, options) {
        this._provider = provider;
        this.name = name;
        this.version = version;
        this.options = options;
    }
    /**
     * Emit a log record. This method should only be used by log appenders.
     *
     * @param logRecord
     */
    emit(logRecord) {
        this._getLogger().emit(logRecord);
    }
    enabled(options) {
        return this._getLogger().enabled(options);
    }
    /**
     * Try to get a logger from the proxy logger provider.
     * If the proxy logger provider has no delegate, return a noop logger.
     */
    _getLogger() {
        if (this._delegate) {
            return this._delegate;
        }
        const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
        if (!logger) {
            return NOOP_LOGGER;
        }
        this._delegate = logger;
        return this._delegate;
    }
}
//# sourceMappingURL=ProxyLogger.js.map
```

---

# COMANDO - ProxyLogger.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\src\ProxyLogger.js
**SHA:** 97f0ab9861a5d2b7
**Timestamp:** 2026-08-28T02:20:45.412482
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._delegate = logger;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyLogger = void 0;
const NoopLogger_1 = require("./NoopLogger");
class ProxyLogger {
    constructor(provider, name, version, options) {
        this._provider = provider;
        this.name = name;
        this.version = version;
        this.options = options;
    }
    /**
     * Emit a log record. This method should only be used by log appenders.
     *
     * @param logRecord
     */
    emit(logRecord) {
        this._getLogger().emit(logRecord);
    }
    enabled(options) {
        return this._getLogger().enabled(options);
    }
    /**
     * Try to get a logger from the proxy logger provider.
     * If the proxy logger provider has no delegate, return a noop logger.
     */
    _getLogger() {
        if (this._delegate) {
            return this._delegate;
        }
        const logger = this._provider._getDelegateLogger(this.name, this.version, this.options);
        if (!logger) {
            return NoopLogger_1.NOOP_LOGGER;
        }
        this._delegate = logger;
        return this._delegate;
    }
}
exports.ProxyLogger = ProxyLogger;
//# sourceMappingURL=ProxyLogger.js.map
```