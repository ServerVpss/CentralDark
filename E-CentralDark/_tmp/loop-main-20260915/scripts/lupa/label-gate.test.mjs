import assert from 'node:assert/strict';
import {
  auditPromotionLabels,
  classifyAuthorityAction,
  classifyLabels,
  classifyOperationalLabels,
  LABEL_CLASSES,
  labelsForDecision,
} from './label-gate.mjs';

const canonical = new Set(['📚 DOCS', '🟢 CORREÇÃO-SEGURA']);
const authorityAliases = new Set(['permito-segredo', 'PERMITO-SEGREDO']);
const promotionLabels = [
  '👑 PERMITO-SEGREDO',
  '🔄 GIT',
  '🤖 AUTO',
  '🟡 IA-PRECISA-REVISAR',
];

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

assert.deepEqual(
  LABEL_CLASSES.PROMOTION,
  promotionLabels,
  'promoção normal exige só selo + baseline, não label de agente',
);

assert.equal(
  LABEL_CLASSES.PROVENANCE.includes('🧠 AGENTE-CHATGPT'),
  true,
  'AGENTE-CHATGPT existe como proveniência',
);

assert.equal(
  LABEL_CLASSES.PROMOTION.includes('🧠 AGENTE-CHATGPT'),
  false,
  'AGENTE-CHATGPT não entra no gate obrigatório de promoção',
);

assert.equal(
  auditPromotionLabels([...promotionLabels]).status,
  'PASS',
  'promotion labels completas passam sem AGENTE-CHATGPT',
);

assert.equal(
  auditPromotionLabels([...promotionLabels, '🧠 AGENTE-HERMES']).okForPromotionLabelSet,
  true,
  'label de agente diferente não bloqueia promoção quando selo existe',
);

assert.equal(
  auditPromotionLabels(['🔄 GIT', '🤖 AUTO', '🟡 IA-PRECISA-REVISAR']).errors.includes('PROMOTION_LABEL_MISSING:👑 PERMITO-SEGREDO'),
  true,
  'sem autoridade canônica, promoção falha',
);

assert.equal(
  auditPromotionLabels([...promotionLabels, 'permito-segredo']).warnings.includes('DUPLICATE_AUTHORITY_ALIAS:permito-segredo'),
  true,
  'alias de autoridade é compatibilidade/ruído, não nova autoridade',
);

assert.equal(
  auditPromotionLabels([...promotionLabels, '🟢 SUCESSO']).warnings.includes('RESULT_LABEL_NOT_PROMOTION_INPUT'),
  true,
  'resultado visual não vira input de promoção',
);

assert.equal(
  auditPromotionLabels([...promotionLabels, '🟢 CORREÇÃO-SEGURA']).warnings.includes('STATUS_LABEL_NOT_PROOF'),
  true,
  'status verde sem execução não vira prova',
);

assert.equal(
  auditPromotionLabels([...promotionLabels, 'label-solta']).warnings.includes('UNKNOWN_LABEL_CONSUMER:label-solta'),
  true,
  'label sem consumidor fica UNKNOWN, não PASS',
);

assert.deepEqual(
  classifyOperationalLabels(['🤖 IA-VALIDAR', '🐞 BUG', 'dependencies']).map((item) => item.class),
  ['CAPABILITY', 'CATEGORY', 'GENERIC_METADATA'],
  'capacidade, categoria e metadado não se substituem',
);

assert.equal(
  classifyAuthorityAction({
    labels: ['👑 PERMITO-SEGREDO'],
    actionClass: 'DEPLOY',
    intentAuthorized: true,
    target: 'site',
    rollbackReady: true,
  }).status,
  'PASS',
  'deploy exige autoridade + classe + alvo + rollback',
);

console.log('label-gate: PASS');
