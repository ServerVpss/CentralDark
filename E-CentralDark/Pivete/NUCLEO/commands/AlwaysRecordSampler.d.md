# COMANDO - AlwaysRecordSampler.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.bun\install\cache\@opentelemetry\sdk-trace@2.10.0@@@1\build\esm\sampler\AlwaysRecordSampler.d.ts
**SHA:** eddb46fd8fabf604
**Timestamp:** 2026-08-28T02:21:35.579373
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- export declare function createAlwaysRecordSampler(delegate: Sampler): Sampler;

### Ouro Bruto (primeiros 5000 chars)
```
import type { Sampler } from '../Sampler';
/**
 * Creates a sampler that wraps a delegate and upgrades NOT_RECORD decisions to
 * RECORD, ensuring all spans are recorded without affecting the sampling rate.
 */
export declare function createAlwaysRecordSampler(delegate: Sampler): Sampler;
//# sourceMappingURL=AlwaysRecordSampler.d.ts.map
```