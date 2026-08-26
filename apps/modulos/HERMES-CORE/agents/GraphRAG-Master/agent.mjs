#!/usr/bin/env node
// 🕸️  GraphRAG-Master — memória oficial do Hermes Core.
// buscarContexto(missao): consulta o grafo vivo (grafo.centralldark.com / graph-panel :3030);
// se o grafo falhar ou não achar nada, fallback pros arquivos locais de knowledge/.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const HERE = dirname(fileURLToPath(import.meta.url));
const KNOWLEDGE = join(HERE, '../../knowledge');
const REPO_ROOT = process.env.CENTRALDARK_REPO_ROOT || '/root/CentralDark';
const GRAPH_URL = process.env.GRAPH_PANEL_URL || 'http://127.0.0.1:3030';
const GERADOR_GRAFO = join(REPO_ROOT, 'scripts/grafo-vivo/gerar-grafo-vivo.mjs');
const SEMANTIC_TRIGGER_MAP = join(REPO_ROOT, 'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SEMANTIC-TRIGGERS.json');
const MAX = 6;

function normalizar(texto) {
  return String(texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9@/.\-\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function carregarMapaSemantico() {
  try {
    if (!existsSync(SEMANTIC_TRIGGER_MAP)) return null;
    const parsed = JSON.parse(readFileSync(SEMANTIC_TRIGGER_MAP, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function familiasSemanticas(missao) {
  const mapa = carregarMapaSemantico();
  if (!mapa?.families || typeof mapa.families !== 'object') return [];
  const alvo = normalizar(missao);
  const hits = [];
  for (const [family, cfg] of Object.entries(mapa.families)) {
    const terms = Array.isArray(cfg?.terms) ? cfg.terms : [];
    const matched = terms.filter(term => {
      const t = normalizar(term);
      return t.length >= 3 && alvo.includes(t);
    });
    if (matched.length) hits.push({ family, matched, route: cfg.route || [] });
  }
  return hits;
}

function termos(missao) {
  const base = normalizar(missao).split(/[^a-z0-9@/.\-]+/).filter(t => t.length >= 3);
  const semantic = familiasSemanticas(missao)
    .flatMap(hit => [hit.family.toLowerCase(), ...hit.matched.flatMap(normalizar).flatMap(x => x.split(' '))])
    .filter(t => t.length >= 3);
  return [...new Set([...base, ...semantic])];
}

export function classificarSemantica(missao) {
  return {
    mode: 'READ_ONLY',
    authority_granted: false,
    mutation_authorized: false,
    families: familiasSemanticas(missao),
  };
}

export async function atualizarGrafo() {
  if (!existsSync(GERADOR_GRAFO)) return { ok: false, saida: 'gerador do grafo não encontrado' };
  try {
    const { stdout } = await pexec('node', [GERADOR_GRAFO], { timeout: 60_000, maxBuffer: 8 * 1024 * 1024 });
    const resumo = (stdout.trim().split('\n').pop() || 'grafo regenerado').slice(0, 200);
    return { ok: true, saida: resumo };
  } catch (e) {
    return { ok: false, saida: `falha ao regenerar grafo: ${(e.stderr || e.message || '').toString().slice(0, 200)}` };
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
        const corpo = normalizar(readFileSync(p, 'utf8').slice(0, 4000));
        const nome = normalizar(e);
        const score = ts.reduce((s, t) => s + (nome.includes(t) ? 3 : 0) + (corpo.includes(t) ? 1 : 0), 0);
        if (score > 0) ranking.push({ p, score, titulo: e });
      } catch {}
    }
  };
  try { varrer(KNOWLEDGE); } catch { return ''; }
  ranking.sort((a, b) => b.score - a.score);
  if (!ranking.length) return '';
  return 'Docs locais (knowledge/):\n' +
    ranking.slice(0, MAX).map(d => `- ${relative(REPO_ROOT, d.p)} — "${String(d.titulo).slice(0, 80)}"`).join('\n');
}

export async function buscarContexto(missao) {
  try {
    const doGrafo = await buscarNoGrafo(missao);
    if (doGrafo) return doGrafo.slice(0, 1500);
  } catch { /* grafo fora do ar — cai pro local */ }
  return buscarLocal(missao).slice(0, 1500);
}

export { buscarContexto as contexto };

function selfTest() {
  const typo = classificarSemantica('proar isso com meta lupe e chega no ponto fisxo');
  const graph = classificarSemantica('sincronize o mapa mental cognitivo com o grafo');
  const families = new Set(typo.families.map(x => x.family));
  const graphFamilies = new Set(graph.families.map(x => x.family));
  const checks = {
    typo_meta_lupa: families.has('META_LUPA'),
    typo_fixed_point: families.has('FIXED_POINT'),
    graph_semantic: graphFamilies.has('GRAPH_COGNITIVE'),
    semantic_match_no_authority: typo.authority_granted === false && typo.mutation_authorized === false,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  console.log(JSON.stringify({ ok: failed.length === 0, checks, failed }));
  return failed.length ? 1 : 0;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args.includes('--self-test')) process.exit(selfTest());
  const missao = args.join(' ') || 'telegram notificacao';
  buscarContexto(missao).then(c => console.log(c || '(sem resultados)'));
}
