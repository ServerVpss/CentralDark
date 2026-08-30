#!/usr/bin/env node
// 🕸️  GraphRAG-Master — memória oficial do Hermes Core.
// buscarContexto(missao): consulta o grafo vivo (grafo.centralldark.com / graph-panel :3030);
// se o grafo falhar ou não achar nada, cai pros docs locais de knowledge/;
// e sempre soma a 3ª fonte — Condefonte Universal (trajetórias/aprendizados já em disco,
// sem API externa nem credencial: substitui o Condefonte-Lovable antigo, que dependia de
// um JWT de sessão de browser expirando em 1h e nunca conseguiu autenticar de verdade).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const BASE = join(dirname(fileURLToPath(import.meta.url)), '../..'); // HERMES-CORE/
const KNOWLEDGE = join(BASE, 'knowledge');
const GRAPH_URL = process.env.GRAPH_PANEL_URL || 'http://127.0.0.1:3030';
const GERADOR_GRAFO = '/root/CentralDark/scripts/grafo-vivo/gerar-grafo-vivo.mjs';
const MAX = 6;

// ── Condefonte Universal: fontes locais de memória (sem API externa) ──
const CONCLUIDAS = join(BASE, 'missions/concluidas');
const DEBATES_DIRS = [
  '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/DEBATES',
  '/root/CentralDark/docs/CONSCIENCIA/ARSENAL/EVOLUCAO',
];
const APRENDIZADOS_MD = '/root/CentralDark/docs/CONSCIENCIA/APRENDIZADOS.md';

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

// ── Fonte 3a: DEBATES/EVOLUCAO — pergunta+resposta reais entre IAs (Arsenal) ──
function buscarDebates(missao) {
  const ts = termos(missao);
  const ranking = [];
  for (const dir of DEBATES_DIRS) {
    if (!existsSync(dir)) continue;
    const varrer = (d) => {
      for (const e of readdirSync(d)) {
        const p = join(d, e);
        try {
          if (statSync(p).isDirectory()) { varrer(p); continue; }
          if (!e.endsWith('.md') || e.endsWith('.md.erro')) continue;
          const corpo = readFileSync(p, 'utf8').slice(0, 3000).toLowerCase();
          const score = ts.reduce((s, t) => s + (e.toLowerCase().includes(t) ? 2 : 0) + (corpo.includes(t) ? 1 : 0), 0);
          if (score > 0) ranking.push({ p, score });
        } catch {}
      }
    };
    try { varrer(dir); } catch {}
  }
  if (!ranking.length) return '';
  ranking.sort((a, b) => b.score - a.score);
  return 'Debates/Evolução (Arsenal — perguntas e respostas reais entre IAs):\n' +
    ranking.slice(0, MAX).map(d => `- ${relative('/root/CentralDark', d.p)}`).join('\n');
}

// ── Fonte 3b: missões concluídas do próprio Hermes — trajetória real (comando→resultado) ──
function buscarMissoesConcluidas(missao) {
  if (!existsSync(CONCLUIDAS)) return '';
  const ts = termos(missao);
  const ranking = [];
  try {
    for (const data of readdirSync(CONCLUIDAS)) {
      const dirData = join(CONCLUIDAS, data);
      if (!statSync(dirData).isDirectory()) continue;
      for (const nome of readdirSync(dirData)) {
        const statePath = join(dirData, nome, 'state.json');
        if (!existsSync(statePath)) continue;
        try {
          const s = JSON.parse(readFileSync(statePath, 'utf8'));
          const corpo = String(s.missao || '').toLowerCase();
          const score = ts.reduce((sc, t) => sc + (nome.toLowerCase().includes(t) ? 2 : 0) + (corpo.includes(t) ? 1 : 0), 0);
          if (score > 0) {
            const etapas = Array.isArray(s.historico) ? s.historico.length : 0;
            const falhas = Array.isArray(s.historico) ? s.historico.filter(h => h.ok === false).length : 0;
            ranking.push({ nome, data, score, etapas, falhas });
          }
        } catch {}
      }
    }
  } catch { return ''; }
  if (!ranking.length) return '';
  ranking.sort((a, b) => b.score - a.score);
  return 'Missões concluídas (Hermes — trajetória real de execução):\n' +
    ranking.slice(0, MAX).map(m => `- ${m.data}/${m.nome} (${m.etapas} etapas, ${m.falhas} falhas)`).join('\n');
}

// ── Fonte 3c: APRENDIZADOS.md — lições já curadas (causa → correção) ──
function buscarAprendizados(missao) {
  if (!existsSync(APRENDIZADOS_MD)) return '';
  const ts = termos(missao);
  try {
    const conteudo = readFileSync(APRENDIZADOS_MD, 'utf8');
    const blocos = conteudo.split(/^###\s+/m).slice(1); // cada entrada começa com "### N. Título"
    const ranking = [];
    for (const b of blocos) {
      const titulo = (b.split('\n')[0] || '').trim();
      const corpo = b.slice(0, 1200).toLowerCase();
      const score = ts.reduce((s, t) => s + (titulo.toLowerCase().includes(t) ? 2 : 0) + (corpo.includes(t) ? 1 : 0), 0);
      if (score > 0) ranking.push({ titulo, score });
    }
    if (!ranking.length) return '';
    ranking.sort((a, b) => b.score - a.score);
    return 'Aprendizados curados (APRENDIZADOS.md):\n' +
      ranking.slice(0, MAX).map(a => `- ${a.titulo}`).join('\n');
  } catch { return ''; }
}

// ── Condefonte Universal: combina as 3 fontes locais acima ──
function buscarCondefonteUniversal(missao) {
  const blocos = [buscarDebates(missao), buscarMissoesConcluidas(missao), buscarAprendizados(missao)]
    .filter(Boolean);
  return blocos.join('\n\n');
}

// ── API principal ──
export async function buscarContexto(missao) {
  let base = '';
  try {
    base = await buscarNoGrafo(missao);
  } catch { /* grafo fora do ar — cai pro local */ }
  if (!base) base = buscarLocal(missao);

  const universal = buscarCondefonteUniversal(missao);
  const combinado = [base, universal].filter(Boolean).join('\n\n');
  return combinado.slice(0, 1500);
}

// compat: nome antigo usado pelo decisor
export { buscarContexto as contexto };

export function selfTest() {
  const normalized = termos('CentralDark centraldark memoria API x');
  const checks = {
    token_normalization_dedupes: JSON.stringify(normalized) === JSON.stringify(['centraldark', 'memoria']),
    short_tokens_are_ignored: !normalized.includes('api') && !normalized.includes('x'),
    empty_query_is_safe: termos('').length === 0,
  };
  const ok = Object.values(checks).every(Boolean);
  return {
    schema: 'centraldark.graphrag-master-self-test.v1',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    checks,
    live_sources_contacted: false,
    proof_scope: 'QUERY_NORMALIZATION_ONLY',
  };
}

// CLI standalone pra debug e gate determinístico.
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === '--self-test') {
    const result = selfTest();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } else {
    buscarContexto(args.join(' ') || 'telegram notificacao')
      .then(c => console.log(c || '(sem resultados)'));
  }
}
