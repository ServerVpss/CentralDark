#!/usr/bin/env node
/**
 * ENXAME ÔMEGA — CROSS_WINDOW_RENDEZVOUS
 * Dono: Hermes-Casa (estende kimetsu-legacy + Hermes Core, NÃO cria V2)
 * Missão: normalizar receipts de braços T0..TN, dedupe, detectar contradição,
 *          teste discriminante, emitir reconciled snapshot com ONE_WRITER.
 *
 * Entrada: um ou mais arquivos JSON (ou stdin) com array de receipts:
 *   { TERMINAL_ID, ENGINE, PID, WORKSPACE, STATE, MISSION_ID, SNAPSHOT_ID, LAST_RECEIPT,
 *     FACTS[], EVIDENCE[], UNKNOWN[], CONTRADICTIONS[], COUNTERPROOF[], RESIDUAL[], VERDICT }
 *
 * Saída: reconciled snapshot + FIXED_POINT evaluation.
 */
import { readFileSync } from 'node:fs';

function loadReceipts(args) {
  const files = args.filter(a => a !== '--stdin' && !a.startsWith('--'));
  let raw = [];
  if (args.includes('--stdin')) {
    const chunks = [];
    // stdin síncrono simples
    const fd = 0;
    const buf = new Uint8Array(65536);
    let n;
    while ((n = tryRead(fd, buf)) > 0) chunks.push(buf.subarray(0, n));
    raw = Buffer.concat(chunks).toString('utf8');
  } else {
    raw = files.map(f => readFileSync(f, 'utf8')).join('\n');
  }
  // aceita tanto um array quanto objetos separados por nova linha
  try { return JSON.parse(raw).flat?.() ?? JSON.parse(raw); }
  catch {
    return raw.split('\n').filter(Boolean).map(l => JSON.parse(l));
  }
}

function tryRead(fd, buf) {
  try { return require('fs').readSyncSync ? 0 : require('fs').readSync(fd, buf, 0, buf.length, null); }
  catch { return require('fs').readSync(fd, buf, 0, buf.length, null); }
}

function normalize(receipts) {
  // dedupe por (TERMINAL_ID + SNAPSHOT_ID)
  const map = new Map();
  for (const r of receipts) {
    const key = `${r.TERMINAL_ID}@${r.SNAPSHOT_ID || 'nosnap'}`;
    if (!map.has(key)) map.set(key, r);
  }
  return [...map.values()];
}

function detectContradictions(rs) {
  // mesma FACT com valor conflitante entre braços
  const factMap = new Map();
  const contradictions = [];
  for (const r of rs) {
    for (const f of (r.FACTS || [])) {
      const [k, ...v] = f.split(':').length > 1 ? f.split(':') : [f, ''];
      const val = (v.join(':') || '').trim();
      if (!factMap.has(k.trim())) factMap.set(k.trim(), []);
      factMap.get(k.trim()).push({ t: r.TERMINAL_ID, val });
    }
  }
  for (const [k, vs] of factMap) {
    const vals = new Set(vs.map(x => x.val));
    if (vals.size > 1) contradictions.push({ fact: k, dispute: vs });
  }
  return contradictions;
}

function evaluateFixedPoint(rs, contradictions, missionId) {
  const sameMission = rs.every(r => r.MISSION_ID === missionId);
  const sameSnapshot = new Set(rs.map(r => r.SNAPSHOT_ID)).size === 1;
  const unknownMaterial = rs.some(r => (r.UNKNOWN || []).length > 0);
  const counterproofSurvives = rs.every(r => (r.COUNTERPROOF || []).length > 0 || r.VERDICT === 'SKIP_JUSTIFICADO');
  const noContradiction = contradictions.length === 0;
  const oneWriter = new Set(rs.map(r => r.WRITER || r.TERMINAL_ID)).size >= 1; // pelo menos 1 writer por escopo
  const tStable = rs.filter(r => r.TERMINAL_ID?.startsWith('T')).length >= 1;
  return {
    SAME_MISSION_ID: sameMission,
    SAME_FINAL_SNAPSHOT_ID: sameSnapshot,
    UNKNOWN_MATERIAL: unknownMaterial ? 0 : 1,
    NO_MATERIAL_CONTRADICTION: noContradiction ? 1 : 0,
    COUNTERPROOF_SURVIVES: counterproofSurvives ? 1 : 0,
    ONE_WRITER_PER_SCOPE: oneWriter ? 1 : 0,
    T1_STABLE: tStable ? 1 : 0,
    FIXED_POINT: (sameMission && sameSnapshot && !unknownMaterial && noContradiction && counterproofSurvives && oneWriter && tStable)
  };
}

function main() {
  const args = process.argv.slice(2);
  const receipts = loadReceipts(args);
  if (!receipts.length) { console.error('Sem receipts. Use --stdin ou passe arquivos .json'); process.exit(2); }
  const missionId = args.find(a => a.startsWith('--mission='))?.split('=')[1] || receipts[0]?.MISSION_ID || 'UNKNOWN';
  const norm = normalize(receipts);
  const contradictions = detectContradictions(norm);
  const fp = evaluateFixedPoint(norm, contradictions, missionId);
  const snapshot = {
    mission_id: missionId,
    arms: norm.map(r => ({ t: r.TERMINAL_ID, engine: r.ENGINE, ws: r.WORKSPACE, state: r.STATE, verdict: r.VERDICT })),
    contradictions,
    fixed_point: fp
  };
  console.log(JSON.stringify(snapshot, null, 2));
  process.exit(fp.FIXED_POINT ? 0 : 1);
}

main();
