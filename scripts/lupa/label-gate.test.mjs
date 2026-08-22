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
