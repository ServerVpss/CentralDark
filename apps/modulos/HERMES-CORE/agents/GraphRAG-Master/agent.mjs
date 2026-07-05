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

const KNOWLEDGE = join(dirname(fileURLToPath(import.meta.url)), '../../knowledge');
const GRAPH_URL = process.env.GRAPH_PANEL_URL || 'http://127.0.0.1:3030';
const GERADOR_GRAFO = '/root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs';
const MAX = 6;

// ── Auto-update: o grafo se mantém vivo sozinho ──
// Roda o gerador oficial (scripts/grafo-vivo/gerar-grafo-vivo.mjs), que recalcula o estado
// REAL (PM2, gateway, processos vivos) e regrava o feed apps/modulos/status/graph-data.json.
// Chamado periodicamente pelo orchestrator — nenhuma missão manual necessária.
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

function termos(missao) {
  return [...new Set(String(missao).toLowerCase().split(/[^a-z0-9@\/.\-]+/).filter(t => t.length >= 4))];
}

// ── Fonte 1: grafo vivo ──
async function buscarNoGrafo(missao) {
  const r = await fetch(`${GRAPH_URL}/api/graph`, { signal: AbortSignal.timeout(4000) });
  if (!r.ok) throw new Error(`grafo HTTP ${r.status}`);
  const { nodes = [], edges = [] } = await r.json();
  const ts = termos(missao);

  const hits = nodes
    .map(n => ({ n, score: ts.filter(t => `${n.id} ${n.label || ''} ${n.title || ''}`.toLowerCase().includes(t)).length }))
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX);
  if (!hits.length) return '';

  const ids = new Set(hits.map(h => h.n.id));
  const vizinhos = (id) => edges
    .filter(e => (e.from ?? e.source) === id || (e.to ?? e.target) === id)
    .map(e => (e.from ?? e.source) === id ? (e.to ?? e.target) : (e.from ?? e.source))
    .slice(0, 4).join(', ');

  return 'Grafo vivo (grafo.centralldark.com):\n' +
    hits.map(({ n }) => `- [${n.group || '?'}] ${n.label || n.id}${vizinhos(n.id) ? ` → conecta: ${vizinhos(n.id)}` : ''}`).join('\n');
}

// ── Fonte 2 (fallback): arquivos locais de knowledge/ ──
function buscarLocal(missao) {
  const ts = termos(missao);
  const ranking = [];
  const varrer = (dir) => {
    for (const e of readdirSync(dir)) {
      const p = join(dir, e);
      try {
        if (statSync(p).isDirectory()) { varrer(p); continue; }
        if (!e.endsWith('.md')) continue;
        const corpo = readFileSync(p, 'utf8').slice(0, 4000).toLowerCase();
        const score = ts.reduce((s, t) => s + (e.toLowerCase().includes(t) ? 3 : 0) + (corpo.includes(t) ? 1 : 0), 0);
        if (score > 0) ranking.push({ p, score, titulo: (corpo.match(/^#\s*(.+)$/m) || [])[1] || e });
      } catch {}
    }
  };
  try { varrer(KNOWLEDGE); } catch { return ''; }
  ranking.sort((a, b) => b.score - a.score);
  if (!ranking.length) return '';
  return 'Docs locais (knowledge/):\n' +
    ranking.slice(0, MAX).map(d => `- ${relative('/root/CentralDark', d.p)} — "${String(d.titulo).slice(0, 80)}"`).join('\n');
}

// ── API principal ──
export async function buscarContexto(missao) {
  try {
    const doGrafo = await buscarNoGrafo(missao);
    if (doGrafo) return doGrafo.slice(0, 1500);
  } catch { /* grafo fora do ar — cai pro local */ }
  return buscarLocal(missao).slice(0, 1500);
}

// compat: nome antigo usado pelo decisor
export { buscarContexto as contexto };

// CLI standalone pra debug
if (import.meta.url === `file://${process.argv[1]}`) {
  buscarContexto(process.argv.slice(2).join(' ') || 'telegram notificacao').then(c => console.log(c || '(sem resultados)'));
}
