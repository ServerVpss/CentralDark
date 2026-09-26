// Diagnóstico em memória dos últimos eventos WuzAPI processados.
// Tudo aqui é EFÊMERO e some no restart do PM2. Sem tokens, sem corpo de msg.
// sync-marker 2026-05-22T23:10Z — pareado com diag.routes.js (safeSnapshot defensivo).
const MAX = 20;
const state = {
  startedAt: new Date().toISOString(),
  lastType: null,
  lastNormalizedKind: null,
  lastReceivedAt: null,
  jsonDataParsedCount: 0,
  jsonDataFailedCount: 0,
  unknownCount: 0,
  totalCount: 0,
  byKind: {},
  lastEvents: [], // [{ts, type, kind, connection_id, parsedJsonData}]
  lastError: null,
};

function recordEvent({ type, kind, connection_id, parsedJsonData }) {
  state.totalCount += 1;
  state.lastType = type || 'unknown';
  state.lastNormalizedKind = kind || null;
  state.lastReceivedAt = new Date().toISOString();
  if (parsedJsonData === true) state.jsonDataParsedCount += 1;
  if (parsedJsonData === false) state.jsonDataFailedCount += 1;
  if (kind && kind.startsWith('unknown:')) state.unknownCount += 1;
  if (kind) state.byKind[kind] = (state.byKind[kind] || 0) + 1;
  state.lastEvents.unshift({
    ts: state.lastReceivedAt,
    type: type || null,
    kind: kind || null,
    connection_id: connection_id || null,
  });
  if (state.lastEvents.length > MAX) state.lastEvents.length = MAX;
}

function recordError(err) {
  state.lastError = {
    ts: new Date().toISOString(),
    message: err && err.message ? String(err.message).slice(0, 300) : String(err).slice(0, 300),
  };
}

function snapshot() {
  return { ...state, byKind: { ...state.byKind }, lastEvents: [...state.lastEvents] };
}

module.exports = { recordEvent, recordError, snapshot };
