#!/usr/bin/env node
/**
 * Gerador do Grafo Vivo — "quem chama quem" com estado REAL em tempo real.
 *
 * Estratégia: a topologia curada (nodes/edges do graph-data.json) é a VERDADE de
 * arquitetura. Este gerador NÃO a destrói — sobrepõe o estado vivo:
 *   • PM2 jlist  → status 🟢/🔴/🟡 por processo, refletido no label (render colore por type)
 *   • gateway.log → atividade recente do Elite HTTP (arestas "quentes")
 *   • processos vivos sem nó (ex.: Hermes, Zentinel, Guardiões) → viram nós novos ligados à VPS
 *   • stats + updatedAt recalculados a cada rodada
 *
 * Escreve APENAS o feed de dados apps/modulos/status/graph-data.json (não toca no render).
 * Uso: node gerar-grafo-vivo.mjs [--dry]   (--dry imprime, não grava)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const GRAPH   = '/root/CentralDark/apps/modulos/status/graph-data.json';
const GWLOG   = '/var/log/centralldark/gateway.log';
const DRY     = process.argv.includes('--dry');

// PM2 name → node id do grafo. Chave normalizada (minúsculo, sem prefixo CentralDark-).
const ALIAS = {
  'elitehttp': 'elite-http-gateway',
  'mcp': 'mcp-server',
  'hubbot': 'bot-telegram',
  'botserver': 'bot-telegram',
  'graphpanel': 'graph-panel',
  'webhookdeploy': 'webhook-deploy',
  'telepaineldeploy': 'painel-status',
};
// Processos vivos que merecem virar NÓ novo se ainda não existirem (id → {label,type,group}).
const LIVE_EXTRA = {
  'hermes':               { label: 'Hermes (executor)',   type: 'orquestrador', group: 'monitoramento' },
  'zentinel':             { label: 'Zentinel (latência)', type: 'monitoramento', group: 'monitoramento' },
  'guardiaoconsciencia':  { label: 'Guardião Consciência', type: 'monitoramento', group: 'monitoramento' },
  'guardiaoanalista':     { label: 'Guardião Analista',   type: 'monitoramento', group: 'monitoramento' },
  'eliteanthropic':       { label: 'Elite Anthropic',     type: 'gateway',       group: 'edge-ia' },
  'elitews':              { label: 'Elite WS',            type: 'gateway',       group: 'edge-ia' },
  'evolucaoias':          { label: 'Evolução IAs',        type: 'ia',            group: 'edge-ia' },
  'arsenaladapter':       { label: 'Arsenal Adapter',     type: 'servico',       group: 'edge-ia' },
  'memoria':              { label: 'Memória API',         type: 'servico',       group: 'monitoramento' },
  'telegrammtproto':      { label: 'Telegram MTProto',    type: 'servico',       group: 'edge-telegram' },
};
const norm = s => String(s || '').toLowerCase().replace(/^centraldark-/, '').replace(/[^a-z0-9]/g, '');
const DOT = { online: '🟢', stopped: '🔴', errored: '🟡', launching: '🟡', unknown: '⚪' };
// Remove o dot de status do label. Usa flag u (emoji = surrogate pair) e limpa lixo de corrupção anterior.
const cleanLabel = l => String(l || '')
  .replace(/^[\u{1F7E2}\u{1F534}\u{1F7E1}⚪]\s*/u, '')   // dot de status (pair-aware)
  .replace(/[\uD800-\uDFFF�]/g, '')                     // surrogates órfãos + replacement chars
  .trim();

function pm2State() {
  try {
    const raw = execSync('pm2 jlist', { encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 });
    const procs = JSON.parse(raw);
    const byNorm = {};
    for (const p of procs) byNorm[norm(p.name)] = { name: p.name, status: p.pm2_env?.status || 'unknown' };
    return { procs, byNorm };
  } catch (e) {
    console.error('[grafo-vivo] pm2 jlist falhou:', e.message.slice(0, 120));
    return { procs: [], byNorm: {} };
  }
}

// resolve o status vivo de um node id (via alias ou nome normalizado que bata)
function statusDoNode(id, byNorm) {
  const alvoNorm = Object.keys(ALIAS).find(k => ALIAS[k] === id);
  if (alvoNorm && byNorm[alvoNorm]) return byNorm[alvoNorm];
  const direto = byNorm[norm(id)];
  return direto || null;
}

function atividadeGateway() {
  if (!existsSync(GWLOG)) return 0;
  try {
    const tail = execSync(`tail -n 400 ${GWLOG}`, { encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
    const agora = Date.now();
    let recentes = 0;
    for (const linha of tail.split('\n')) {
      const m = linha.match(/"event":\s*"chat_request"/);
      if (!m) continue;
      const t = linha.match(/"ts":\s*"([^"]+)"/);
      if (t && (agora - new Date(t[1]).getTime()) < 15 * 60 * 1000) recentes++;
    }
    return recentes;
  } catch { return 0; }
}

function main() {
  const g = JSON.parse(readFileSync(GRAPH, 'utf8'));
  const { procs, byNorm } = pm2State();
  const nodesById = new Map(g.nodes.map(n => [n.id, n]));

  // 1) status vivo nos nós existentes (dot no label)
  let online = 0, offline = 0, monitorados = 0;
  for (const n of g.nodes) {
    const st = statusDoNode(n.id, byNorm);
    n.label = cleanLabel(n.label);
    if (st) {
      monitorados++;
      n.status = st.status;
      n.pm2 = st.name;
      n.label = `${DOT[st.status] || DOT.unknown} ${n.label}`;
      st.status === 'online' ? online++ : offline++;
    } else {
      delete n.status; delete n.pm2;
    }
  }

  // 2) processos vivos importantes que ainda não são nós → adiciona e liga à VPS
  for (const [key, meta] of Object.entries(LIVE_EXTRA)) {
    const st = byNorm[key];
    if (!st) continue;
    if (nodesById.has(key)) continue;
    const node = { id: key, label: `${DOT[st.status] || DOT.unknown} ${meta.label}`,
                   type: meta.type, group: meta.group, status: st.status, pm2: st.name };
    g.nodes.push(node); nodesById.set(key, node);
    if (nodesById.has('vps')) g.edges.push({ from: key, to: 'vps', label: 'roda na', weight: 2 });
    monitorados++; st.status === 'online' ? online++ : offline++;
  }

  // 3) atividade real do gateway → engrossa a aresta que chega no elite-http-gateway
  const hits = atividadeGateway();
  if (hits > 0) {
    for (const e of g.edges) {
      if (e.to === 'elite-http-gateway') e.weight = Math.min(9, 3 + Math.ceil(hits / 2));
    }
  }

  // 4) stats vivas
  g.updatedAt = new Date().toISOString();
  g._note = `Grafo VIVO — regenerado por scripts/grafo-vivo/gerar-grafo-vivo.mjs. PM2: ${online} online / ${offline} off de ${monitorados} monitorados. Gateway: ${hits} req/15min.`;
  g.stats = {
    ...(g.stats || {}),
    total_nodes: g.nodes.length,
    total_edges: g.edges.length,
    processos_vivos: procs.length,
    online, offline, monitorados,
    gateway_req_15min: hits,
    gerado_em: g.updatedAt,
  };

  const resumo = `${g.nodes.length} nós · ${g.edges.length} arestas · ${online}🟢/${offline}🔴 · ${hits} req/15min`;
  if (DRY) { console.log('[DRY] ' + resumo); console.log(JSON.stringify(g.stats, null, 2)); return; }
  writeFileSync(GRAPH, JSON.stringify(g, null, 2));
  console.log('[grafo-vivo] ✅ ' + resumo);
}

main();
