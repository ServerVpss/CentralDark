#!/usr/bin/env node
/**
 * Gerador do Grafo Vivo — "quem chama quem" com estado REAL em tempo real.
 * A topologia curada continua sendo a base. O grafo projeta a Banda; não vira autoridade.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const ROOT = '/root/CentralDark';
const GRAPH = `${ROOT}/apps/modulos/status/graph-data.json`;
const GRAPH_PANEL_MIRROR = `${ROOT}/apps/modulos/graph-panel/data/graph.json`;
const BAND_SCORE = `${ROOT}/docs/BRAIN/01-CONCEITOS/Banda/BANDA_COMPASSO_GLOBAL.json`;
const APRENDIZADOS = `${ROOT}/docs/CONSCIENCIA/APRENDIZADOS.md`;
const GRAPHRAG = `${ROOT}/apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs`;
const GWLOG = '/var/log/centralldark/gateway.log';
const DRY = process.argv.includes('--dry');

const ALIAS = {
  elitehttp: 'elite-http-gateway', mcp: 'mcp-server', hubbot: 'bot-telegram', botserver: 'bot-telegram',
  graphpanel: 'graph-panel', webhookdeploy: 'webhook-deploy', telepaineldeploy: 'painel-status',
};
const LIVE_EXTRA = {
  hermes: { label: 'Hermes (executor)', type: 'orquestrador', group: 'monitoramento' },
  zentinel: { label: 'Zentinel (latência)', type: 'monitoramento', group: 'monitoramento' },
  guardiaoconsciencia: { label: 'Guardião Consciência', type: 'monitoramento', group: 'monitoramento' },
  guardiaoanalista: { label: 'Guardião Analista', type: 'monitoramento', group: 'monitoramento' },
  eliteanthropic: { label: 'Elite Anthropic', type: 'gateway', group: 'edge-ia' },
  elitews: { label: 'Elite WS', type: 'gateway', group: 'edge-ia' },
  evolucaoias: { label: 'Evolução IAs', type: 'ia', group: 'edge-ia' },
  arsenaladapter: { label: 'Arsenal Adapter', type: 'servico', group: 'edge-ia' },
  memoria: { label: 'Memória API', type: 'servico', group: 'monitoramento' },
  telegrammtproto: { label: 'Telegram MTProto', type: 'servico', group: 'edge-telegram' },
};
const norm = s => String(s || '').toLowerCase().replace(/^centraldark-/, '').replace(/[^a-z0-9]/g, '');
const DOT = { online: '🟢', stopped: '🔴', errored: '🟡', launching: '🟡', unknown: '⚪' };
const cleanLabel = l => String(l || '').replace(/^[\u{1F7E2}\u{1F534}\u{1F7E1}⚪]\s*/u, '').replace(/[\uD800-\uDFFF�]/g, '').trim();

function pm2State() {
  try {
    const procs = JSON.parse(execSync('pm2 jlist', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }));
    const byNorm = {};
    for (const p of procs) byNorm[norm(p.name)] = { name: p.name, status: p.pm2_env?.status || 'unknown' };
    return { procs, byNorm };
  } catch (e) {
    console.error('[grafo-vivo] pm2 jlist falhou:', e.message.slice(0, 120));
    return { procs: [], byNorm: {} };
  }
}
function statusDoNode(id, byNorm) {
  const alvoNorm = Object.keys(ALIAS).find(k => ALIAS[k] === id);
  if (alvoNorm && byNorm[alvoNorm]) return byNorm[alvoNorm];
  return byNorm[norm(id)] || null;
}
function atividadeGateway() {
  if (!existsSync(GWLOG)) return 0;
  try {
    const tail = execSync(`tail -n 400 ${GWLOG}`, { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
    const agora = Date.now();
    let recentes = 0;
    for (const linha of tail.split('\n')) {
      if (!/"event":\s*"chat_request"/.test(linha)) continue;
      const t = linha.match(/"ts":\s*"([^"]+)"/);
      if (t && agora - new Date(t[1]).getTime() < 15 * 60 * 1000) recentes++;
    }
    return recentes;
  } catch { return 0; }
}
function bandBreathTotal() {
  if (!existsSync(BAND_SCORE)) return 'UNKNOWN';
  try {
    const score = JSON.parse(readFileSync(BAND_SCORE, 'utf8'));
    return Number.isInteger(score?.breaths?.total) ? score.breaths.total : 'UNKNOWN';
  } catch { return 'UNKNOWN'; }
}

function main() {
  const g = JSON.parse(readFileSync(GRAPH, 'utf8'));
  const { procs, byNorm } = pm2State();
  const nodesById = new Map(g.nodes.map(n => [n.id, n]));
  const ensureNode = (id, meta) => {
    const current = nodesById.get(id);
    if (current) { Object.assign(current, { ...meta, id }); return current; }
    const node = { id, ...meta };
    g.nodes.push(node); nodesById.set(id, node); return node;
  };
  const ensureEdge = (from, to, label, weight = 2) => {
    const found = g.edges.some(e => (e.from ?? e.source) === from && (e.to ?? e.target) === to && String(e.label || '') === label);
    if (!found) g.edges.push({ from, to, label, weight });
  };

  const breathTotal = bandBreathTotal();
  ensureNode('band-score', { label: `Banda · ${breathTotal} Respirações`, type: 'contrato', group: 'cognicao', source: 'docs/BRAIN/01-CONCEITOS/Banda/BANDA_COMPASSO_GLOBAL.json', authority: false });
  ensureNode('graphrag-master', { label: 'GraphRAG Master · Biblioteca', type: 'memoria', group: 'cognicao', source: 'apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs', file_present: existsSync(GRAPHRAG), authority: false });
  ensureNode('aprendizados', { label: 'Aprendizados Curados', type: 'memoria', group: 'cognicao', source: 'docs/CONSCIENCIA/APRENDIZADOS.md', file_present: existsSync(APRENDIZADOS), authority: false });
  ensureEdge('band-score', 'graphrag-master', 'partitura fixa', 4);
  ensureEdge('graphrag-master', 'aprendizados', 'consulta / aprende', 3);
  ensureEdge('aprendizados', 'band-score', 'cristaliza delta provado', 2);

  let online = 0, offline = 0, monitorados = 0;
  for (const n of g.nodes) {
    const st = statusDoNode(n.id, byNorm);
    n.label = cleanLabel(n.label);
    if (st) {
      monitorados++; n.status = st.status; n.pm2 = st.name;
      n.label = `${DOT[st.status] || DOT.unknown} ${n.label}`;
      st.status === 'online' ? online++ : offline++;
    } else { delete n.status; delete n.pm2; }
  }
  for (const [key, meta] of Object.entries(LIVE_EXTRA)) {
    const st = byNorm[key];
    if (!st || nodesById.has(key)) continue;
    const node = { id: key, label: `${DOT[st.status] || DOT.unknown} ${meta.label}`, type: meta.type, group: meta.group, status: st.status, pm2: st.name };
    g.nodes.push(node); nodesById.set(key, node);
    if (nodesById.has('vps')) g.edges.push({ from: key, to: 'vps', label: 'roda na', weight: 2 });
    monitorados++; st.status === 'online' ? online++ : offline++;
  }
  const hits = atividadeGateway();
  if (hits > 0) for (const e of g.edges) if (e.to === 'elite-http-gateway') e.weight = Math.min(9, 3 + Math.ceil(hits / 2));

  g.updatedAt = new Date().toISOString();
  g._note = `Grafo VIVO — regenerado por scripts/grafo-vivo/gerar-grafo-vivo.mjs. PM2: ${online} online / ${offline} off de ${monitorados} monitorados. Gateway: ${hits} req/15min. Banda: ${breathTotal} respirações declaradas.`;
  g.stats = { ...(g.stats || {}), total_nodes: g.nodes.length, total_edges: g.edges.length, processos_vivos: procs.length, online, offline, monitorados, gateway_req_15min: hits, band_breaths_declared: breathTotal, gerado_em: g.updatedAt };
  const resumo = `${g.nodes.length} nós · ${g.edges.length} arestas · ${online}🟢/${offline}🔴 · ${hits} req/15min · banda=${breathTotal}`;
  if (DRY) { console.log('[DRY] ' + resumo); console.log(JSON.stringify(g.stats, null, 2)); return; }
  const payload = JSON.stringify(g, null, 2);
  writeFileSync(GRAPH, payload);
  try { writeFileSync(GRAPH_PANEL_MIRROR, payload); }
  catch (e) { console.error('[grafo-vivo] ⚠️ espelho graph-panel falhou: ' + String(e.message || e).slice(0, 120)); }
  console.log('[grafo-vivo] ✅ ' + resumo);
}
main();
