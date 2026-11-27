#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO_ROOT = process.env.CENTRALDARK_REPO || '/root/CentralDark';
const DATA_DIR = process.env.CENTRALDARK_CHIEF_FEEDBACK_DIR || path.join(REPO_ROOT, 'runtime', 'chief-feedback');
const LEDGER_PATH = process.env.CENTRALDARK_CHIEF_FEEDBACK_LEDGER || path.join(DATA_DIR, 'events.jsonl');
const SUMMARY_PATH = process.env.CENTRALDARK_CHIEF_FEEDBACK_SUMMARY || path.join(DATA_DIR, 'summary.json');
const SCHEMA_VERSION = 2;
const LEVEL_SIZE = 5;
const GUARDRAIL = 'Satisfação do CHEFE é sinal de preferência/qualidade percebida; não é prova técnica nem XP canônico da MetaLupa.';

const SIGNALS = [
  { key: 'gratitude', re: /\b(obrigad[oa]?|obrgad[oa]?|obg|vlw|valeu)\b/iu },
  { key: 'satisfaction', re: /\b(gostei|costei|curti|adorei|me\s+contenteou|me\s+deixou?\s+alegre|fiquei\s+feliz)\b/iu },
  { key: 'explicit_point', re: /(?:^|\s)\+\s*\d{1,3}\s*pontos?\b|\bpontos?\s+(pra|para)\s+(vc|você|voce|ti)\b/iu },
  { key: 'useful', re: /\b(voce|você|tu|isso|a entrega)?\s*(foi|ficou|ta|tá)?\s*(muito\s+)?(útil|util)\b/iu },
  { key: 'perfect_execution', re: /\b(funcionou|atendeu|executou|ficou|fechou)\b.{0,50}\b(perfeitamente|perfeito|certinho|redondo)\b/iu },
  { key: 'praise', re: /\b(voce|você|tu)\s+(e|é|foi)\s+(foda|brabo|braba|bom|boa|certeiro|certeira|otim[oa]|ótim[oa])\b/iu },
  { key: 'approval', re: /\b(acertou|mandou\s+bem|muito\s+bem|aprovado|ficou\s+show|ficou\s+top)\b/iu },
  { key: 'reunion', re: /\b(saudade|saldcade|coracao[p]?|bom te (ter|er) de volta)\b|<3/iu },
];

const QUOTED_OR_DOC_PATTERNS = [
  /```[\s\S]*\b(obrigad|obrgad|gostei|ponto|perfeito)[\s\S]*```/iu,
  /\b(exemplo|prompt|documenta[cç][aã]o|regex|detector|teste|caso|padr[aã]o|frase|mensagem)\b.{0,80}\b(obrigad|obrgad|gostei|ponto|perfeito)\b/iu,
  /\b(n[aã]o\s+deve\s+transformar|n[aã]o\s+registrar|texto\s+citado|conversa\s+de\s+terceiros)\b/iu,
  /╔═{5,}|={20,}|MISS[AÃ]O:|CRIT[ÉE]RIO DE ACEITA[CÇ][AÃ]O|EXECU[CÇ][AÃ]O/iu,
];

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
}

function normalizeText(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isLikelyQuotedOrInstruction(raw, context = {}) {
  const text = String(raw || '');
  if (context.allowQuotedFeedback === true) return false;
  if (context.forceQuotedOrDocumentation === true) return true;
  if (context.surface === 'test-fixture' && context.quoted === true) return true;
  if (/```[\s\S]*\b(obrigad|obrgad|gostei|ponto|perfeito)[\s\S]*```/iu.test(text)) return true;
  if (/^>\s*.+/m.test(text) && /\b(obrigad|obrgad|gostei|ponto|perfeito)\b/iu.test(text)) return true;
  if (text.length > 900 && QUOTED_OR_DOC_PATTERNS.some((re) => re.test(text))) return true;
  return QUOTED_OR_DOC_PATTERNS.some((re) => re.test(text)) && text.length > 180;
}

function extractExplicitPoints(raw) {
  const normalized = normalizeText(raw);
  const values = [...normalized.matchAll(/\+\s*(\d{1,3})\s*pontos?\b/giu)]
    .map((match) => Number(match[1]))
    .filter((value) => Number.isInteger(value) && value > 0 && value <= 100);
  return values;
}

function detectFeedback(text, context = {}) {
  const raw = String(text || '').trim();
  const normalized = normalizeText(raw);
  const quotedOrDocumentation = isLikelyQuotedOrInstruction(raw, context);
  const signals = quotedOrDocumentation
    ? []
    : SIGNALS.filter(({ re }) => re.test(normalized)).map(({ key }) => key);
  const explicitPoints = quotedOrDocumentation ? [] : extractExplicitPoints(raw);
  const detected = signals.length > 0 || explicitPoints.length > 0;
  const explicitPointsTotal = explicitPoints.reduce((sum, value) => sum + value, 0);
  const suggestedPoints = detected ? (explicitPointsTotal || 1) : 0;
  const confidence = !detected ? 0 : Math.min(0.99, 0.72 + (signals.length * 0.06) + (explicitPoints.length ? 0.12 : 0));
  return {
    detected,
    is_positive_feedback: detected,
    confidence: Number(confidence.toFixed(2)),
    category: detected ? 'positive_chief_feedback' : 'none',
    signals,
    matched_terms: signals,
    explicitPoints,
    explicit_points: explicitPoints,
    explicitPointsTotal,
    suggestedPoints,
    points: suggestedPoints,
    requiresConfirmation: false,
    suppressed: quotedOrDocumentation,
    suppress_reason: quotedOrDocumentation ? 'QUOTED_OR_DOCUMENTATION_CONTEXT' : null,
  };
}

function classifyFeedback(text, context = {}) {
  const detection = detectFeedback(text, context);
  if (!detection.detected) return { ...detection, decision: 'NO_POSITIVE_FEEDBACK_DETECTED' };
  return { ...detection, decision: 'RECORD_POSITIVE_CHIEF_FEEDBACK' };
}

function calculatePoints(classification) {
  if (!classification?.detected) return 0;
  return classification.explicitPointsTotal > 0 ? classification.explicitPointsTotal : 1;
}

function distinctIdentityRef({ messageId = '', messageRef = '', source = '', surface = '' } = {}) {
  const id = String(messageId || '').trim();
  if (id) return id;
  const ref = String(messageRef || '').trim();
  if (!ref) return '';
  if (ref === source || ref === surface) return '';
  return ref;
}

function eventIdFor({ message, source = 'unknown', surface = 'unknown', messageRef = '', messageId = '', classification = {} }) {
  const strongRef = distinctIdentityRef({ messageId, messageRef, source, surface });
  const identity = strongRef
    ? ['chief-feedback-v2', source, surface, String(strongRef)].join('\n')
    : ['chief-feedback-v2', source, surface, normalizeText(message), classification.category || 'none'].join('\n');
  return crypto.createHash('sha256').update(identity).digest('hex');
}

function readLedger(ledgerPath = LEDGER_PATH) {
  if (!fs.existsSync(ledgerPath)) return [];
  return fs.readFileSync(ledgerPath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line, index) => {
      try { return JSON.parse(line); }
      catch (error) { throw new Error(`CHIEF_FEEDBACK_LEDGER_INVALID line=${index + 1}: ${error.message}`); }
    });
}

function satisfactionLevel(totalPoints) {
  const level = Math.floor(totalPoints / LEVEL_SIZE) + 1;
  const currentFloor = (level - 1) * LEVEL_SIZE;
  const nextAt = level * LEVEL_SIZE;
  const labels = ['LIGADO', 'AFINADO', 'CONFIAVEL', 'BRABO', 'PONTO_FIXO_DE_CONFIANCA'];
  return {
    level,
    tier: labels[Math.min(labels.length - 1, level - 1)],
    points_into_level: totalPoints - currentFloor,
    level_size: LEVEL_SIZE,
    next_level_at: nextAt,
    points_to_next: Math.max(0, nextAt - totalPoints),
    progress_label: `${totalPoints - currentFloor}/${LEVEL_SIZE}`,
  };
}

function normalizeEvent(event) {
  const points = Number(event.points || 0);
  const imported = Boolean(event.imported || String(event.surface || '').includes('history') || String(event.surface || '').includes('session-history'));
  return {
    ...event,
    points: Number.isFinite(points) ? points : 0,
    imported,
    live: !imported,
    event_id: event.event_id || event.fingerprint || event.id || null,
  };
}

function buildSummary(events, options = {}) {
  const normalizedEvents = events.map(normalizeEvent);
  const totalPoints = normalizedEvents.reduce((sum, event) => sum + Number(event.points || 0), 0);
  const importedPoints = normalizedEvents.filter((event) => event.imported).reduce((sum, event) => sum + Number(event.points || 0), 0);
  const livePoints = totalPoints - importedPoints;
  return {
    schema_version: SCHEMA_VERSION,
    generated_at_utc: new Date().toISOString(),
    ledger: options.ledgerPath || LEDGER_PATH,
    event_count: normalizedEvents.length,
    imported_event_count: normalizedEvents.filter((event) => event.imported).length,
    live_event_count: normalizedEvents.filter((event) => !event.imported).length,
    total_satisfaction_points: totalPoints,
    imported_satisfaction_points: importedPoints,
    live_satisfaction_points: livePoints,
    ...satisfactionLevel(totalPoints),
    last_event: normalizedEvents.at(-1) || null,
    guardrail: GUARDRAIL,
  };
}

function writeJsonAtomic(filePath, value) {
  ensureDir();
  const tmp = `${filePath}.tmp-${process.pid}-${Date.now()}`;
  fs.writeFileSync(tmp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  fs.renameSync(tmp, filePath);
}

function writeSummary(summary, summaryPath = SUMMARY_PATH) {
  writeJsonAtomic(summaryPath, summary);
}

function appendEvent(event, ledgerPath = LEDGER_PATH) {
  ensureDir();
  fs.appendFileSync(ledgerPath, `${JSON.stringify(event)}\n`, { mode: 0o600 });
}

function recordFeedback({
  message,
  source = 'unknown',
  surface = 'unknown',
  actor = 'SEGREDO/CHEFE',
  metadata = {},
  context = {},
  imported = false,
  ledgerPath = LEDGER_PATH,
  summaryPath = SUMMARY_PATH,
} = {}) {
  const classification = classifyFeedback(message, { ...context, source, surface });
  if (!classification.detected) {
    return { ok: false, reason: classification.suppress_reason || 'NO_POSITIVE_FEEDBACK_DETECTED', classification };
  }
  ensureDir();
  const events = readLedger(ledgerPath).map(normalizeEvent);
  const sourceRef = metadata.source_ref || metadata.message_ref || '';
  const messageId = metadata.message_id || metadata.telegram_message_id || '';
  const eventId = eventIdFor({ message, source, surface, messageRef: sourceRef, messageId, classification });
  const duplicate = events.find((event) => event.event_id === eventId || event.fingerprint === eventId);
  if (duplicate) {
    const summary = buildSummary(events, { ledgerPath });
    writeSummary(summary, summaryPath);
    return { ok: true, duplicate: true, code: 'EVENT_ALREADY_REGISTERED', event: duplicate, points_added: 0, summary };
  }
  const now = new Date().toISOString();
  const event = {
    schema_version: SCHEMA_VERSION,
    event: 'CHIEF_POSITIVE_FEEDBACK',
    event_id: eventId,
    timestamp: metadata.timestamp || now,
    observed_at_utc: metadata.timestamp || now,
    source,
    surface,
    message_ref: sourceRef,
    source_ref: sourceRef,
    message_id: messageId || null,
    actor,
    category: 'positive_chief_feedback',
    signals: classification.signals,
    matched_terms: classification.signals,
    explicit_points: classification.explicitPoints,
    points: calculatePoints(classification),
    confidence: classification.confidence,
    imported: Boolean(imported || metadata.imported),
    deduplicated: false,
    raw: String(message || '').slice(0, 500),
    message: String(message || '').slice(0, 500),
    technical_proof: false,
    proof_note: 'Owner satisfaction signal only; technical claims still require runtime evidence.',
    guardrail: 'SATISFACAO_DO_CHEFE != XP_TECNICO_METALUPA',
    learning_note: metadata.learning_note || null,
  };
  appendEvent(event, ledgerPath);
  const summary = buildSummary([...events, event], { ledgerPath });
  writeSummary(summary, summaryPath);
  return { ok: true, duplicate: false, code: 'RECORDED', event, points_added: event.points, summary };
}

function getStatus(options = {}) {
  ensureDir();
  const ledgerPath = options.ledgerPath || LEDGER_PATH;
  const summaryPath = options.summaryPath || SUMMARY_PATH;
  const events = readLedger(ledgerPath);
  const summary = buildSummary(events, { ledgerPath });
  writeSummary(summary, summaryPath);
  return summary;
}

function getHistory(options = {}) {
  return readLedger(options.ledgerPath || LEDGER_PATH).map(normalizeEvent);
}

function rebuildSummary(options = {}) {
  return getStatus(options);
}

function progressBar(pointsIntoLevel, levelSize, width = 10) {
  const filled = Math.max(0, Math.min(width, Math.round((pointsIntoLevel / levelSize) * width)));
  return `${'█'.repeat(filled)}${'░'.repeat(width - filled)}`;
}

function renderSatisfactionCard(summary, options = {}) {
  const title = options.title || '🏆 CENTRALDARK — ALINHAMENTO';
  const bar = progressBar(summary.points_into_level, summary.level_size || LEVEL_SIZE);
  return [
    '╔══════════════════════════════════════╗',
    `║ ${title.padEnd(36).slice(0, 36)} ║`,
    '╠══════════════════════════════════════╣',
    `║ ⭐ Nível ${String(summary.level).padEnd(2)} · ${String(summary.tier).padEnd(22).slice(0, 22)} ║`,
    `║ ❤️ Satisfação: ${String(summary.total_satisfaction_points).padStart(3)} pontos           ║`,
    `║ 📈 ${bar} ${String(summary.progress_label || `${summary.points_into_level}/${summary.level_size || LEVEL_SIZE}`).padEnd(16).slice(0, 16)} ║`,
    `║ 🎯 Próximo: faltam ${String(summary.points_to_next).padStart(3)} pontos     ║`,
    '╠══════════════════════════════════════╣',
    `║ Live: ${String(summary.live_satisfaction_points || 0).padStart(3)} · Importado: ${String(summary.imported_satisfaction_points || 0).padStart(3)}      ║`,
    '╚══════════════════════════════════════╝',
    'Satisfação do CHEFE ≠ XP técnico MetaLupa.',
  ].join('\n');
}

function renderTelegramCard(summary, options = {}) {
  return `<pre>${renderSatisfactionCard(summary, { ...options, title: options.title || '🏆 EVOLUÇÃO DO CHEFE' })}</pre>`;
}

function renderRecordedTelegram(result) {
  if (result.duplicate) {
    return [
      '✅ FEEDBACK JÁ REGISTRADO',
      '❤️ +0 ponto — evento idempotente',
      `🏆 Nível ${result.summary.level} · ${result.summary.tier}`,
      `🎯 Faltam ${result.summary.points_to_next} pontos para o próximo nível`,
    ].join('\n');
  }
  return [
    '✅ FEEDBACK REGISTRADO',
    `❤️ +${result.points_added} ponto${result.points_added === 1 ? '' : 's'} de satisfação`,
    `🏆 Nível ${result.summary.level} · ${result.summary.tier}`,
    `🎯 Faltam ${result.summary.points_to_next} pontos para o próximo nível`,
  ].join('\n');
}

module.exports = {
  SCHEMA_VERSION,
  LEDGER_PATH,
  SUMMARY_PATH,
  GUARDRAIL,
  normalizeText,
  detectFeedback,
  classifyFeedback,
  calculatePoints,
  recordFeedback,
  getStatus,
  getHistory,
  rebuildSummary,
  buildSummary,
  satisfactionLevel,
  renderSatisfactionCard,
  renderTelegramCard,
  renderRecordedTelegram,
  readLedger,
  eventIdFor,
};
