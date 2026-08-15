# Wire strategy (já no repo)

1. Em `decisor.mjs` no topo:
```js
import { applyRoutingStrategy } from './routing-strategy.mjs';
```

2. Em `carregarCadeia()`, após montar `darkai`:
```js
const strategy = (j.routing && j.routing.strategy) || 'priority';
const darkaiWithMeta = ativos
  .filter(m => (m.via || 'darkai') !== 'elite-anthropic' && (m.via || '') !== 'centraldark-gateway')
  .map(m => ({
    modelo: m.modelo,
    timeout_ms: (m.timeout_s || 30) * 1000,
    cost_weight: m.cost_weight,
    tier: m.tier,
  }));
const darkai = applyRoutingStrategy(
  darkaiWithMeta.length ? darkaiWithMeta : CADEIA_FALLBACK_DARKAI,
  strategy
);
```

Elite (via centraldark-gateway / elite) permanece fallback final, fora da strategy.

ZERO_DEPLOY. Runtime ativo após reload PM2 Hermes (humano ou deploy causal separado).
