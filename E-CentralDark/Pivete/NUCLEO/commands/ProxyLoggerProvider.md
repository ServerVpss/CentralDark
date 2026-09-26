# COMANDO - ProxyLoggerProvider.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\esm\ProxyLoggerProvider.js
**SHA:** 73c94160c51f3e97
**Timestamp:** 2026-08-28T02:20:42.509898
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
import { NOOP_LOGGER_PROVIDER } from './NoopLoggerProvider';
import { ProxyLogger } from './ProxyLogger';
export class ProxyLoggerProvider {
    getLogger(name, version, options) {
        var _a;
        return ((_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger(this, name, version, options));
    }
    /**
     * Get the delegate logger provider.
     * Used by tests only.
     * @internal
     */
    _getDelegate() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_LOGGER_PROVIDER;
    }
    /**
     * Set the delegate logger provider
     * @internal
     */
    _setDelegate(delegate) {
        this._delegate = delegate;
    }
    /**
     * @internal
     */
    _getDelegateLogger(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
    }
}
//# sourceMappingURL=ProxyLoggerProvider.js.map
```

---

# COMANDO - ProxyLoggerProvider.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\src\ProxyLoggerProvider.js
**SHA:** 8dcb2ffa83752c9e
**Timestamp:** 2026-08-28T02:20:45.441082
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- this._delegate = delegate;

### Ouro Bruto (primeiros 5000 chars)
```
"use strict";
/*
 * Copyright The OpenTelemetry Authors
 * SPDX-License-Identifier: Apache-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyLoggerProvider = void 0;
const NoopLoggerProvider_1 = require("./NoopLoggerProvider");
const ProxyLogger_1 = require("./ProxyLogger");
class ProxyLoggerProvider {
    getLogger(name, version, options) {
        var _a;
        return ((_a = this._getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger_1.ProxyLogger(this, name, version, options));
    }
    /**
     * Get the delegate logger provider.
     * Used by tests only.
     * @internal
     */
    _getDelegate() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER;
    }
    /**
     * Set the delegate logger provider
     * @internal
     */
    _setDelegate(delegate) {
        this._delegate = delegate;
    }
    /**
     * @internal
     */
    _getDelegateLogger(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
    }
}
exports.ProxyLoggerProvider = ProxyLoggerProvider;
//# sourceMappingURL=ProxyLoggerProvider.js.map
```