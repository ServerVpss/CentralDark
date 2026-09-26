# COMANDO - ProxyTracerProvider.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\api@1.9.1@@@1\build\esm\trace\ProxyTracerProvider.d.ts
**SHA:** a7b739a91b48b951
**Timestamp:** 2026-08-28T02:20:50.570053
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- setDelegate(delegate: TracerProvider): void;

### Ouro Bruto (primeiros 5000 chars)
```
import type { Tracer } from './tracer';
import type { TracerProvider } from './tracer_provider';
import type { TracerOptions } from './tracer_options';
/**
 * Tracer provider which provides {@link ProxyTracer}s.
 *
 * Before a delegate is set, tracers provided are NoOp.
 *   When a delegate is set, traces are provided from the delegate.
 *   When a delegate is set after tracers have already been provided,
 *   all tracers already provided will use the provided delegate implementation.
 *
 * @deprecated This will be removed in the next major version.
 * @since 1.0.0
 */
export declare class ProxyTracerProvider implements TracerProvider {
    private _delegate?;
    /**
     * Get a {@link ProxyTracer}
     */
    getTracer(name: string, version?: string, options?: TracerOptions): Tracer;
    getDelegate(): TracerProvider;
    /**
     * Set the delegate tracer provider
     */
    setDelegate(delegate: TracerProvider): void;
    getDelegateTracer(name: string, version?: string, options?: TracerOptions): Tracer | undefined;
}
//# sourceMappingURL=ProxyTracerProvider.d.ts.map
```