#!/usr/bin/env node
/**
 * Gerador do Grafo Vivo — "quem chama quem" com estado REAL em tempo real.
 * A topologia curada continua sendo a base. O grafo projeta a Banda; não vira autoridade.
 */
import { readFileSync, writeFileSync, existsSync, renameSync, unlinkSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Escrita atômica: grava em arquivo temporário no MESMO diretório (mesmo
 * filesystem, exigido para renameSync ser atômico) e só substitui o
 * destino depois que o payload estiver 100% escrito. Se a escrita do
 * temporário falhar (crash, kill, queda de energia etc.), o arquivo
 * oficial nunca é tocado — o último grafo íntegro permanece válido.
 * Não garante durabilidade contra falha de SO/energia durante o próprio
 * write do temporário; apenas elimina a janela de leitura/estado
 * truncado no arquivo de destino.
 */
function writeAtomic(path, data) {
  const tmp = `${path}.tmp.${process.pid}.${Date.now()}`;
  try {
    writeFileSync(tmp, data);
    renameSync(tmp, path);
  } catch (e) {
    try { unlinkSync(tmp); } catch { /* tmp pode não ter sido criado */ }
    throw e;
  }
}

const ROOT = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const GRAPH = `${ROOT}/apps/modulos/status/graph-data.json`;
const GRAPH_PANEL_MIRROR = `${ROOT}/apps/modulos/graph-panel/data/graph.json`;
const BAND_SCORE = `${ROOT}/docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json`;
const APRENDIZADOS = `${ROOT}/docs/CONSCIENCIA/APRENDIZADOS.md`;
const GRAPHRAG = `${ROOT}/apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs`;
const META_LUPA = `${ROOT}/.agents/skills/meta-lupa/SKILL.md`;
const CLAIM_SEALS = `${ROOT}/.agents/skills/meta-lupa/references/claim-seals.jsonl`;
const AGENT_LIBRARY = `${ROOT}/docs/BRAIN/03-DOCUMENTACAO/01-AGENTS-LIBRARY/2026-07-13-overclock-swarm-tier-catalog.json`;
const SECOND_BRAIN = `${ROOT}/SECOND-BRAIN.yml`;
const GWLOG = '/var/log/centralldark/gateway.log';
const DRY = process.argv.includes('--dry');

const ALIAS = {
  elitehttp: 'elite-http-gateway', mcp: 'mcp-server', hubbot: 'bot-telegram', botserver: 'bot-telegram',
  graphpanel: 'graph-panel', webhookdeploy: 'webhook-deploy', telepaineldeploy: 'painel-status',
  hermescore: 'hermes', metalupa: 'meta-lupa', autolupa: 'meta-lupa', claimseals: 'claim-seals',
  githubmain: 'github-main', originmain: 'github-main', casa: 'casa', house: 'casa',
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
  const g = existsSync(GRAPH)
    ? JSON.parse(readFileSync(GRAPH, 'utf8'))
    : { _note: 'Grafo VIVO — bootstrap sem snapshot anterior.', nodes: [], edges: [] };
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
  ensureNode('band-score', { label: `Banda · ${breathTotal} Respirações`, type: 'contrato', group: 'cognicao', source: 'docs/BRAIN/01-CONCEITOS/02-BANDA/BANDA_COMPASSO_GLOBAL.json', authority: false, file_present: existsSync(BAND_SCORE) });
  ensureNode('meta-lupa', { label: 'META LUPA · falsificação contínua', type: 'raciocinio', group: 'cognicao', source: '.agents/skills/meta-lupa/SKILL.md', authority: false, file_present: existsSync(META_LUPA) });
  ensureNode('claim-seals', { label: 'Lacres · claims provados', type: 'memoria', group: 'cognicao', source: '.agents/skills/meta-lupa/references/claim-seals.jsonl', authority: false, file_present: existsSync(CLAIM_SEALS) });
  ensureNode('graphrag-master', { label: 'GraphRAG Master · Biblioteca', type: 'memoria', group: 'cognicao', source: 'apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs', file_present: existsSync(GRAPHRAG), authority: false });
  ensureNode('agent-library', { label: 'Agents Library · scout/builder/reviewer/swarm', type: 'biblioteca', group: 'cognicao', source: 'docs/BRAIN/03-DOCUMENTACAO/01-AGENTS-LIBRARY/2026-07-13-overclock-swarm-tier-catalog.json', file_present: existsSync(AGENT_LIBRARY), authority: false });
  ensureNode('aprendizados', { label: 'Aprendizados Curados', type: 'memoria', group: 'cognicao', source: 'docs/CONSCIENCIA/APRENDIZADOS.md', file_present: existsSync(APRENDIZADOS), authority: false });
  ensureNode('second-brain', { label: 'Segundo Cérebro · mapa lógico', type: 'mapa', group: 'cognicao', source: 'SECOND-BRAIN.yml', file_present: existsSync(SECOND_BRAIN), authority: false });
  ensureNode('casa', { label: 'Casa · clone/Obsidian/Hermes', type: 'surface', group: 'sincronizacao', source: 'scripts/casa/sync-hermes-obsidian.ps1', authority: false });
  ensureNode('github-main', { label: 'GitHub main · verdade estrutural', type: 'source-of-truth', group: 'sincronizacao', source: 'ServerVpss/CentralDark@main', authority: true });
  ensureNode('vps', { label: 'VPS · runtime/deploy', type: 'runtime', group: 'sincronizacao', source: 'scripts/vps/centraldark-deploy.sh', authority: false });

  ensureEdge('band-score', 'meta-lupa', 'compasso / falsificação', 4);
  ensureEdge('meta-lupa', 'claim-seals', 'sela somente prova', 4);
  ensureEdge('claim-seals', 'graphrag-master', 'memória provada', 4);
  ensureEdge('band-score', 'graphrag-master', 'partitura fixa', 4);
  ensureEdge('agent-library', 'graphrag-master', 'capacidades agrupadas', 3);
  ensureEdge('graphrag-master', 'aprendizados', 'consulta / aprende', 3);
  ensureEdge('aprendizados', 'band-score', 'cristaliza delta provado', 2);
  ensureEdge('second-brain', 'band-score', 'mapa lógico', 3);
  ensureEdge('github-main', 'casa', 'PING: head oficial', 3);
  ensureEdge('casa', 'github-main', 'PONG: head/receipt', 3);
  ensureEdge('github-main', 'vps', 'PING: head oficial', 3);
  ensureEdge('vps', 'github-main', 'PONG: head/receipt', 3);
  ensureEdge('casa', 'meta-lupa', 'mesmo protocolo', 3);
  ensureEdge('vps', 'meta-lupa', 'mesmo protocolo', 3);

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

  const compassLinks = [BAND_SCORE, META_LUPA, CLAIM_SEALS, GRAPHRAG, AGENT_LIBRARY, APRENDIZADOS, SECOND_BRAIN].map(path => ({ path: path.replace(`${ROOT}/`, ''), present: existsSync(path) }));
  const brokenCompassLinks = compassLinks.filter(item => !item.present);

  g.updatedAt = new Date().toISOString();
  g._note = `Grafo VIVO — regenerado por scripts/grafo-vivo/gerar-grafo-vivo.mjs. PM2: ${online} online / ${offline} off de ${monitorados} monitorados. Gateway: ${hits} req/15min. Banda: ${breathTotal} respirações declaradas. Compass links quebrados: ${brokenCompassLinks.length}.`;
  g.stats = { ...(g.stats || {}), total_nodes: g.nodes.length, total_edges: g.edges.length, processos_vivos: procs.length, online, offline, monitorados, gateway_req_15min: hits, band_breaths_declared: breathTotal, compass_links_total: compassLinks.length, compass_links_broken: brokenCompassLinks.length, gerado_em: g.updatedAt };
  g.compass_links = compassLinks;
  const resumo = `${g.nodes.length} nós · ${g.edges.length} arestas · ${online}🟢/${offline}🔴 · ${hits} req/15min · banda=${breathTotal} · links_quebrados=${brokenCompassLinks.length}`;
  if (DRY) { console.log('[DRY] ' + resumo); console.log(JSON.stringify(g.stats, null, 2)); return; }
  if (brokenCompassLinks.length) {
    console.error('[grafo-vivo] BLOQUEADO_COMPASS_LINKS=' + brokenCompassLinks.map(item => item.path).join(','));
    process.exitCode = 2;
    return;
  }
  const payload = JSON.stringify(g, null, 2);
  writeAtomic(GRAPH, payload);
  try { writeAtomic(GRAPH_PANEL_MIRROR, payload); }
  catch (e) { console.error('[grafo-vivo] ⚠️ espelho graph-panel falhou: ' + String(e.message || e).slice(0, 120)); }
  console.log('[grafo-vivo] ✅ ' + resumo);
}
main();
