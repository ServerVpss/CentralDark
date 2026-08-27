#!/usr/bin/env node
// 🕸️ GraphRAG-Master — memória oficial do Hermes Core.
// O grafo é projeção derivada. Busca semântica/contextual nunca concede autoridade ou mutação.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const HERE = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE = join(HERE, '../../knowledge');
// O checkout pode morar em qualquer caminho. /root/CentralDark não é contrato.
const REPO_ROOT = process.env.CENTRALDARK_REPO_ROOT || resolve(HERE, '../../../../..');
const GRAPH_URL = process.env.GRAPH_PANEL_URL || 'http://127.0.0.1:3030';
const GERADOR_GRAFO = join(REPO_ROOT, 'scripts/grafo-vivo/gerar-grafo-vivo.mjs');
const MASTER_CYCLE = join(REPO_ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml');
const MAX = 6;

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9!@/.\-\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const MASTER_TERMS = [
  'acordar', 'calibrar', 'multibussola', 'meta lupa', 'reconciliar',
  'contraprova', 'remedicao', 'fixed point', 'registra', 'boot',
  'estado vivo', 'todos os lados', 'prova', 'ponto fixo', 'grafo',
];

function masterAtivo(missao) {
  const tokens = normalizar(missao).split(/\s+/);
  return tokens.includes('!centraldark');
  return tokens.includes('!centraldark') || tokens.includes('!central-dark') || tokens.includes('!cdark');
}

function termos(missao) {
  const base = normalizar(missao).split(/[^a-z0-9@/.\-]+/).filter(t => t.length >= 3);
  const extra = masterAtivo(missao) ? MASTER_TERMS.flatMap(t => normalizar(t).split(' ')) : [];
  return [...new Set([...base, ...extra].filter(t => t.length >= 3))];
}

export function classificarCicloMestre(missao) {
  const active = masterAtivo(missao);
  return {
    mode: 'READ_ONLY',
    master_trigger: '!CENTRALDARK',
    active,
    authority_granted: false,
    mutation_authorized: false,
    graph_is_authority: false,
    contract_present: existsSync(MASTER_CYCLE),
  };
}

// Auto-update do grafo vivo. Chamado pelo orchestrator.
export async function atualizarGrafo() {
  if (!existsSync(GERADOR_GRAFO)) return { ok: false, saida: 'gerador do grafo não encontrado' };
  try {
    const { stdout } = await pexec('node', [GERADOR_GRAFO], { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
    const resumo = (stdout.trim().split('\n').pop() || 'grafo regenerado').slice(0, 200);
    return { ok: true, saida: resumo };
  } catch (error) {
    return { ok: false, saida: `falha ao regenerar grafo: ${(error.stderr || error.message || '').toString().slice(0, 200)}` };
  }
}

async function buscarNoGrafo(missao) {
  const r = await fetch(`${GRAPH_URL}/api/graph`, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`grafo HTTP ${r.status}`);
  const { nodes = [], edges = [] } = await r.json();
  const ts = termos(missao);
  const hits = nodes
    .map(n => ({ n, score: ts.filter(t => normalizar(`${n.id} ${n.label || ''} ${n.title || ''}`).includes(t)).length }))
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX);
  if (!hits.length) return '';

  const vizinhos = (id) => edges
    .filter(e => (e.from ?? e.source) === id || (e.to ?? e.target) === id)
    .map(e => (e.from ?? e.source) === id ? (e.to ?? e.target) : (e.from ?? e.source))
    .slice(0, 4).join(', ');
  return 'Grafo vivo (grafo.centralldark.com):\n' +
    hits.map(({ n }) => `- [${n.group || '?'}] ${n.label || n.id}${vizinhos(n.id) ? ` → conecta: ${vizinhos(n.id)}` : ''}`).join('\n');
}

function buscarLocal(missao) {
  const ts = termos(missao);
  const ranking = [];
  const varrer = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      try {
        if (statSync(p).isDirectory()) { varrer(p); continue; }
        if (!e.endsWith('.md')) continue;
        const raw = readFileSync(p, 'utf8').slice(0, 4000);
        const corpo = normalizar(raw);
        const nome = normalizar(e);
        const score = ts.reduce((s, t) => s + (nome.includes(t) ? 3 : 0) + (corpo.includes(t) ? 1 : 0), 0);
        if (score > 0) ranking.push({ p, score, titulo: (raw.match(/^#\s*(.+)$/m) || [])[1] || e });
      } catch (error) {
        if (process.env.GRAPHRAG_DEBUG === '1') console.warn(`GraphRAG skip ${p}: ${error.message}`);
        continue;
      }
    }
  };
  try {
    varrer(KNOWLEDGE);
  } catch (error) {
    if (process.env.GRAPHRAG_DEBUG === '1') console.warn(`GraphRAG local indisponível: ${error.message}`);
    return '';
  }
  ranking.sort((a, b) => b.score - a.score);
  if (!ranking.length) return '';
  return 'Docs locais (knowledge/):\n' +
    ranking.slice(0, MAX).map(d => `- ${relative(REPO_ROOT, d.p)} — "${String(d.titulo).slice(0, 80)}"`).join('\n');
}

export async function buscarContexto(missao) {
  try {
    const doGrafo = await buscarNoGrafo(missao);
    if (doGrafo) return doGrafo.slice(0, 1500);
  } catch (error) {
    if (process.env.GRAPHRAG_DEBUG === '1') console.warn(`GraphRAG remoto indisponível: ${error.message}`);
  }
  return buscarLocal(missao).slice(0, 1500);
}

export { buscarContexto as contexto };

function selfTest() {
  const positive = classificarCicloMestre('!CENTRALDARK fecha essa missão');
  const negative = classificarCicloMestre('CentralDark é o nome do repo');
  const alias = classificarCicloMestre('!cdark fecha');
  const checks = {
    explicit_master_trigger: positive.active === true,
    alias_master_trigger: alias.active === true,
    plain_word_does_not_trigger: negative.active === false,
    contract_present: positive.contract_present === true,
    semantic_match_no_authority: positive.authority_granted === false && positive.mutation_authorized === false,
    graph_derived_not_authority: positive.graph_is_authority === false,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ ok: failed.length === 0, checks, failed }));
  return failed.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) process.exit(selfTest());
  buscarContexto(args.join(' ') || 'telegram notificacao').then(c => console.log(c || '(sem resultados)'));
}
