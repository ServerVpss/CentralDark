# CONTRATO - label-gate.test.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\lupa\label-gate.test.mjs
**SHA:** ee7a359fe7c74ba9
**Timestamp:** 2026-08-28T02:57:36.027849
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Contratos
- console.log('label-gate: PASS');

### Ouro Bruto (primeiros 5000 chars)
```
import assert from 'node:assert/strict';
import { classifyLabels, labelsForDecision } from './label-gate.mjs';

const canonical = new Set(['📚 DOCS', '🟢 CORREÇÃO-SEGURA']);
const authorityAliases = new Set(['permito-segredo', 'PERMITO-SEGREDO']);

assert.deepEqual(
  classifyLabels({ labels: [], canonical, authorityAliases }).status,
  'BLOCK',
  'PR sem label canônica continua bloqueada',
);

assert.deepEqual(
  classifyLabels({ labels: ['📚 DOCS'], canonical, authorityAliases }).status,
  'PASS',
  'label canônica passa',
);

assert.deepEqual(
  classifyLabels({ labels: ['qualquer-coisa'], canonical, authorityAliases }).reason,
  'SEM_LABEL_CANONICA',
  'ausência de label canônica vence antes de classificar lixo lateral',
);

assert.deepEqual(
  classifyLabels({ labels: ['📚 DOCS', 'qualquer-coisa'], canonical, authorityAliases }).reason,
  'LABEL_NAO_CANONICA',
  'label não canônica bloqueia quando já existe label canônica',
);

assert.deepEqual(
  classifyLabels({ labels: ['📚 DOCS', 'permito-segredo'], canonical, authorityAliases }).status,
  'PASS',
  'alias de autoridade compatível não cria segundo catálogo',
);

assert.deepEqual(
  labelsForDecision({ eventAction: 'opened', eventLabels: [], liveLabels: ['📚 DOCS'] }),
  ['📚 DOCS'],
  'opened usa estado vivo convergido quando disponível',
);

assert.deepEqual(
  labelsForDecision({ eventAction: 'opened', eventLabels: [], liveLabels: [] }),
  [],
  'opened sem convergência continua bloqueável',
);

assert.deepEqual(
  labelsForDecision({ eventAction: 'labeled', eventLabels: ['📚 DOCS'], liveLabels: [] }),
  ['📚 DOCS'],
  'eventos posteriores continuam julgando o próprio snapshot do evento',
);

assert.equal(
  classifyLabels({ labels: ['📚 DOCS'], canonical: new Set(), authorityAliases }).reason,
  'CATALOGO_CANONICO_VAZIO',
  'catálogo vazio falha fechado',
);

console.log('label-gate: PASS');

```