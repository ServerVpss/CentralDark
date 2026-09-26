# COMANDO - ProxyLoggerProvider.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api-logs@0.220.0@@@1\build\esm\ProxyLoggerProvider.d.ts
**SHA:** 5960998dc2ae027e
**Timestamp:** 2026-08-28T02:20:42.643787
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- _setDelegate(delegate: LoggerProvider): void;

### Ouro Bruto (primeiros 5000 chars)
```
import type { LoggerProvider } from './types/LoggerProvider';
import type { Logger } from './types/Logger';
import type { LoggerOptions } from './types/LoggerOptions';
export declare class ProxyLoggerProvider implements LoggerProvider {
    private _delegate?;
    getLogger(name: string, version?: string | undefined, options?: LoggerOptions | undefined): Logger;
    /**
     * Get the delegate logger provider.
     * Used by tests only.
     * @internal
     */
    _getDelegate(): LoggerProvider;
    /**
     * Set the delegate logger provider
     * @internal
     */
    _setDelegate(delegate: LoggerProvider): void;
    /**
     * @internal
     */
    _getDelegateLogger(name: string, version?: string | undefined, options?: LoggerOptions | undefined): Logger | undefined;
}
//# sourceMappingURL=ProxyLoggerProvider.d.ts.map
```