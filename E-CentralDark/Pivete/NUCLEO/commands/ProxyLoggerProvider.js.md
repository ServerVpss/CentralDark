# COMANDO - ProxyLoggerProvider.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\esm\ProxyLoggerProvider.js.map
**SHA:** c73e7863fe39a1c4
**Timestamp:** 2026-08-28T02:20:42.520948
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- {"version":3,"file":"ProxyLoggerProvider.js","sourceRoot":"","sources":["../../src/ProxyLoggerProvider.ts"],"names":[],"mappings":"AAAA;;;GAGG;AAKH,OAAO,EAAE,oBAAoB,EAAE,MAAM,sBAAsB,CAAC;AAC5D,OAAO,EA

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"ProxyLoggerProvider.js","sourceRoot":"","sources":["../../src/ProxyLoggerProvider.ts"],"names":[],"mappings":"AAAA;;;GAGG;AAKH,OAAO,EAAE,oBAAoB,EAAE,MAAM,sBAAsB,CAAC;AAC5D,OAAO,EAAE,WAAW,EAAE,MAAM,eAAe,CAAC;AAE5C,MAAM,OAAO,mBAAmB;IAG9B,SAAS,CACP,IAAY,EACZ,OAA4B,EAC5B,OAAmC;;QAEnC,OAAO,CACL,MAAA,IAAI,CAAC,kBAAkB,CAAC,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,mCAC/C,IAAI,WAAW,CAAC,IAAI,EAAE,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,CAC9C,CAAC;IACJ,CAAC;IAED;;;;OAIG;IACH,YAAY;;QACV,OAAO,MAAA,IAAI,CAAC,SAAS,mCAAI,oBAAoB,CAAC;IAChD,CAAC;IAED;;;OAGG;IACH,YAAY,CAAC,QAAwB;QACnC,IAAI,CAAC,SAAS,GAAG,QAAQ,CAAC;IAC5B,CAAC;IAED;;OAEG;IACH,kBAAkB,CAChB,IAAY,EACZ,OAA4B,EAC5B,OAAmC;;QAEnC,OAAO,MAAA,IAAI,CAAC,SAAS,0CAAE,SAAS,CAAC,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC;IAC3D,CAAC;CACF","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\n * SPDX-License-Identifier: Apache-2.0\n */\n\nimport type { LoggerProvider } from './types/LoggerProvider';\nimport type { Logger } from './types/Logger';\nimport type { LoggerOptions } from './types/LoggerOptions';\nimport { NOOP_LOGGER_PROVIDER } from './NoopLoggerProvider';\nimport { ProxyLogger } from './ProxyLogger';\n\nexport class ProxyLoggerProvider implements LoggerProvider {\n  private _delegate?: LoggerProvider;\n\n  getLogger(\n    name: string,\n    version?: string | undefined,\n    options?: LoggerOptions | undefined\n  ): Logger {\n    return (\n      this._getDelegateLogger(name, version, options) ??\n      new ProxyLogger(this, name, version, options)\n    );\n  }\n\n  /**\n   * Get the delegate logger provider.\n   * Used by tests only.\n   * @internal\n   */\n  _getDelegate(): LoggerProvider {\n    return this._delegate ?? NOOP_LOGGER_PROVIDER;\n  }\n\n  /**\n   * Set the delegate logger provider\n   * @internal\n   */\n  _setDelegate(delegate: LoggerProvider) {\n    this._delegate = delegate;\n  }\n\n  /**\n   * @internal\n   */\n  _getDelegateLogger(\n    name: string,\n    version?: string | undefined,\n    options?: LoggerOptions | undefined\n  ): Logger | undefined {\n    return this._delegate?.getLogger(name, version, options);\n  }\n}\n"]}
```

---

# COMANDO - ProxyLoggerProvider.js.map
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\src\ProxyLoggerProvider.js.map
**SHA:** 71c020871e3a848f
**Timestamp:** 2026-08-28T02:20:45.452914
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- {"version":3,"file":"ProxyLoggerProvider.js","sourceRoot":"","sources":["../../src/ProxyLoggerProvider.ts"],"names":[],"mappings":";AAAA;;;GAGG;;;AAKH,6DAA4D;AAC5D,+CAA4C;AAE5C,MAAa,mBAAmB;IAG9B,SAAS,

### Ouro Bruto (primeiros 5000 chars)
```
{"version":3,"file":"ProxyLoggerProvider.js","sourceRoot":"","sources":["../../src/ProxyLoggerProvider.ts"],"names":[],"mappings":";AAAA;;;GAGG;;;AAKH,6DAA4D;AAC5D,+CAA4C;AAE5C,MAAa,mBAAmB;IAG9B,SAAS,CACP,IAAY,EACZ,OAA4B,EAC5B,OAAmC;;QAEnC,OAAO,CACL,MAAA,IAAI,CAAC,kBAAkB,CAAC,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,mCAC/C,IAAI,yBAAW,CAAC,IAAI,EAAE,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,CAC9C,CAAC;IACJ,CAAC;IAED;;;;OAIG;IACH,YAAY;;QACV,OAAO,MAAA,IAAI,CAAC,SAAS,mCAAI,yCAAoB,CAAC;IAChD,CAAC;IAED;;;OAGG;IACH,YAAY,CAAC,QAAwB;QACnC,IAAI,CAAC,SAAS,GAAG,QAAQ,CAAC;IAC5B,CAAC;IAED;;OAEG;IACH,kBAAkB,CAChB,IAAY,EACZ,OAA4B,EAC5B,OAAmC;;QAEnC,OAAO,MAAA,IAAI,CAAC,SAAS,0CAAE,SAAS,CAAC,IAAI,EAAE,OAAO,EAAE,OAAO,CAAC,CAAC;IAC3D,CAAC;CACF;AAzCD,kDAyCC","sourcesContent":["/*\n * Copyright The OpenTelemetry Authors\n * SPDX-License-Identifier: Apache-2.0\n */\n\nimport type { LoggerProvider } from './types/LoggerProvider';\nimport type { Logger } from './types/Logger';\nimport type { LoggerOptions } from './types/LoggerOptions';\nimport { NOOP_LOGGER_PROVIDER } from './NoopLoggerProvider';\nimport { ProxyLogger } from './ProxyLogger';\n\nexport class ProxyLoggerProvider implements LoggerProvider {\n  private _delegate?: LoggerProvider;\n\n  getLogger(\n    name: string,\n    version?: string | undefined,\n    options?: LoggerOptions | undefined\n  ): Logger {\n    return (\n      this._getDelegateLogger(name, version, options) ??\n      new ProxyLogger(this, name, version, options)\n    );\n  }\n\n  /**\n   * Get the delegate logger provider.\n   * Used by tests only.\n   * @internal\n   */\n  _getDelegate(): LoggerProvider {\n    return this._delegate ?? NOOP_LOGGER_PROVIDER;\n  }\n\n  /**\n   * Set the delegate logger provider\n   * @internal\n   */\n  _setDelegate(delegate: LoggerProvider) {\n    this._delegate = delegate;\n  }\n\n  /**\n   * @internal\n   */\n  _getDelegateLogger(\n    name: string,\n    version?: string | undefined,\n    options?: LoggerOptions | undefined\n  ): Logger | undefined {\n    return this._delegate?.getLogger(name, version, options);\n  }\n}\n"]}
```