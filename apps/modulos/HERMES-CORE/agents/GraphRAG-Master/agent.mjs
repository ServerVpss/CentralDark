#!/usr/bin/env node
// 🕸️  GraphRAG-Master — memória oficial do Hermes Core.
// Partitura fixa (Banda/17 Respirações) + memória dinâmica (grafo/knowledge/aprendizados).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const pexec = promisify(execFile);

const BASE = join(dirname(fileURLToPath(import.meta.url)), '../..');
const REPO_ROOT = join(BASE, '../../..');
const KNOWLEDGE = join(BASE, 'knowledge');
const GRAPH_URL = process.env.GRAPH_PANEL_URL || 'http://127.0.0.1:3030';
const GERADOR_GRAFO = join(REPO_ROOT, 'scripts/grafo-vivo/gerar-grafo-vivo.mjs');
const BAND_SCORE_PATH = join(REPO_ROOT, 'docs/BRAIN/01-CONCEITOS/Banda/BANDA_COMPASSO_GLOBAL.json');
const AGENT_CALL_PATH = join(REPO_ROOT, 'scripts/agent-call.mjs');
const MAX = 6;

const CONCLUIDAS = join(BASE, 'missions/concluidas');
const DEBATES_DIRS = [
  join(REPO_ROOT, 'docs/CONSCIENCIA/ARSENAL/DEBATES'),
  join(REPO_ROOT, 'docs/CONSCIENCIA/ARSENAL/EVOLUCAO'),
];
const APRENDIZADOS_MD = join(REPO_ROOT, 'docs/CONSCIENCIA/APRENDIZADOS.md');

function termos(missao) {
  return [...new Set(String(missao).toLowerCase().split(/[^a-z0-9@\/.\-]+/).filter(t => t.length >= 4))];
}

function validarPartituraObjeto(score) {
  const items = Array.isArray(score?.breaths?.items) ? score.breaths.items : [];
  const ids = items.map(item => String(item?.id || '')).filter(Boolean);
  const noteFields = Array.isArray(score?.note_contract?.required_fields) ? score.note_contract.required_fields : [];
  const requiredNoteFields = [
    'mission_id', 'event_id', 'parent_event_id', 'trail_id', 'observed_head',
    'writer', 'breath_id', 'note_id', 'action', 'observation',
    'evidence_refs', 'verdict', 'next_breath', 'learning_ref',
  ];
  const graphEdges = Array.isArray(score?.bindings?.graph?.required_edges) ? score.bindings.graph.required_edges : [];
  const checks = {
    schema_v1: score?.schema === 'centraldark.band-score.v1',
    status_active: score?.status === 'ACTIVE_CONTRACT',
    breaths_declared_17: score?.breaths?.total === 17,
    breaths_materialized_17: items.length === 17,
    breath_ids_unique_17: ids.length === 17 && new Set(ids).size === 17,
    thunder_uses_agent_call: score?.thunder_trail?.owner === 'scripts/agent-call.mjs',
    thunder_protocol_v1: score?.thunder_trail?.protocol === 'CENTRALDARK_AGENT_CALL_V1',
    thunder_reuses_trail: score?.thunder_trail?.reuse_existing_trail_id === true,
    no_new_event_bus: score?.thunder_trail?.new_event_bus === false,
    note_after_material_event: score?.note_contract?.emit_after_each_material_note === true,
    note_fields_complete: requiredNoteFields.every(field => noteFields.includes(field)),
    learning_binding_present: score?.bindings?.learning?.path === 'docs/CONSCIENCIA/APRENDIZADOS.md',
    graphrag_binding_present: score?.bindings?.graphrag?.path === 'apps/modulos/HERMES-CORE/agents/GraphRAG-Master/agent.mjs',
    graph_is_derived: score?.bindings?.graph?.derived_not_authority === true,
    graph_band_to_graphrag: graphEdges.some(edge => edge?.[0] === 'band-score' && edge?.[1] === 'graphrag-master'),
    graph_graphrag_to_learning: graphEdges.some(edge => edge?.[0] === 'graphrag-master' && edge?.[1] === 'aprendizados'),
    envelope_parseable: score?.response_envelope?.always_parseable === true,
    error_not_swallowed: score?.response_envelope?.error_policy === 'STRUCTURED_NOT_SWALLOWED',
    fail_closed: score?.response_envelope?.fail_closed === true,
  };
  const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([name]) => name);
  return { ok: failed.length === 0, status: failed.length === 0 ? 'PASS' : 'FAIL', checks, failed };
}

export function carregarPartitura() {
  try {
    const score = JSON.parse(readFileSync(BAND_SCORE_PATH, 'utf8'));
    const validation = validarPartituraObjeto(score);
    if (!validation.ok) {
      return {
        ok: false,
        status: 'BAND_SCORE_INVALID',
        error: { code: 'BAND_SCORE_INVALID', failed: validation.failed },
        validation,
        score: null,
      };
    }
    return { ok: true, status: 'PASS', error: null, validation, score };
  } catch (e) {
    return {
      ok: false,
      status: 'BAND_SCORE_LOAD_FAILED',
      error: { code: 'BAND_SCORE_LOAD_FAILED', message: String(e.message || e).slice(0, 240) },
      validation: null,
      score: null,
    };
  }
}

function contextoPartitura() {
  const loaded = carregarPartitura();
  if (!loaded.ok) return `Partitura fixa CentralDark: ${loaded.status}; FAIL_CLOSED=true; error=${JSON.stringify(loaded.error)}`;
  const names = loaded.score.breaths.items.map(item => item.name).join(', ');
  return [
    'Partitura fixa CentralDark:',
    `- schema=${loaded.score.schema}; breaths=17; writer=ONE_WRITER_PER_SCOPE; judge=REALIDADE`,
    `- thunder_trail=${loaded.score.thunder_trail.protocol}; owner=${loaded.score.thunder_trail.owner}`,
    `- respirações=${names}`,
  ].join('\n');
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
    .map(n => ({ n, score: ts.filter(t => `${n.id} ${n.label || ''} ${n.title || ''}`.toLowerCase().includes(t)).length }))
    .filter(h => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX);
  if (!hits.length) return '';
  const vizinhos = id => edges
    .filter(e => (e.from ?? e.source) === id || (e.to ?? e.target) === id)
    .map(e => (e.from ?? e.source) === id ? (e.to ?? e.target) : (e.from ?? e.source))
    .slice(0, 4).join(', ');
  return 'Grafo vivo (grafo.centralldark.com):\n' +
    hits.map(({ n }) => `- [${n.group || '?'}] ${n.label || n.id}${vizinhos(n.id) ? ` → conecta: ${vizinhos(n.id)}` : ''}`).join('\n');
}

function buscarLocal(missao) {
  const ts = termos(missao);
  const ranking = [];
  const varrer = dir => {
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
  return 'Docs locais (knowledge/):\n' + ranking.slice(0, MAX).map(d => `- ${relative(REPO_ROOT, d.p)} — "${String(d.titulo).slice(0, 80)}"`).join('\n');
}

function buscarDebates(missao) {
  const ts = termos(missao);
  const ranking = [];
  for (const dir of DEBATES_DIRS) {
    if (!existsSync(dir)) continue;
    const varrer = d => {
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
  return 'Debates/Evolução (Arsenal — perguntas e respostas reais entre IAs):\n' + ranking.slice(0, MAX).map(d => `- ${relative(REPO_ROOT, d.p)}`).join('\n');
}

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
  return 'Missões concluídas (Hermes — trajetória real de execução):\n' + ranking.slice(0, MAX).map(m => `- ${m.data}/${m.nome} (${m.etapas} etapas, ${m.falhas} falhas)`).join('\n');
}

function buscarAprendizados(missao) {
  if (!existsSync(APRENDIZADOS_MD)) return '';
  const ts = termos(missao);
  try {
    const conteudo = readFileSync(APRENDIZADOS_MD, 'utf8');
    const blocos = conteudo.split(/^###\s+/m).slice(1);
    const ranking = [];
    for (const b of blocos) {
      const titulo = (b.split('\n')[0] || '').trim();
      const corpo = b.slice(0, 1200).toLowerCase();
      const score = ts.reduce((s, t) => s + (titulo.toLowerCase().includes(t) ? 2 : 0) + (corpo.includes(t) ? 1 : 0), 0);
      if (score > 0) ranking.push({ titulo, score });
    }
    if (!ranking.length) return '';
    ranking.sort((a, b) => b.score - a.score);
    return 'Aprendizados curados (APRENDIZADOS.md):\n' + ranking.slice(0, MAX).map(a => `- ${a.titulo}`).join('\n');
  } catch { return ''; }
}

function buscarCondefonteUniversal(missao) {
  return [buscarDebates(missao), buscarMissoesConcluidas(missao), buscarAprendizados(missao)].filter(Boolean).join('\n\n');
}

export async function buscarContexto(missao) {
  const partitura = contextoPartitura();
  let base = '';
  try { base = await buscarNoGrafo(missao); } catch {}
  if (!base) base = buscarLocal(missao);
  const universal = buscarCondefonteUniversal(missao);
  return [partitura, base, universal].filter(Boolean).join('\n\n').slice(0, 2400);
}

export { buscarContexto as contexto };

export function selfTest() {
  const normalized = termos('CentralDark centraldark memoria API x');
  const loaded = carregarPartitura();
  const graphSource = existsSync(GERADOR_GRAFO) ? readFileSync(GERADOR_GRAFO, 'utf8') : '';
  const agentCallSource = existsSync(AGENT_CALL_PATH) ? readFileSync(AGENT_CALL_PATH, 'utf8') : '';
  let inverseMissingBreathRejected = false;
  let inverseTrailProtocolRejected = false;
  if (loaded.ok) {
    const missingBreath = JSON.parse(JSON.stringify(loaded.score));
    missingBreath.breaths.items.pop();
    missingBreath.breaths.total = 16;
    inverseMissingBreathRejected = validarPartituraObjeto(missingBreath).ok === false;
    const wrongTrail = JSON.parse(JSON.stringify(loaded.score));
    wrongTrail.thunder_trail.protocol = 'WRONG';
    inverseTrailProtocolRejected = validarPartituraObjeto(wrongTrail).ok === false;
  }
  const checks = {
    token_normalization_dedupes: JSON.stringify(normalized) === JSON.stringify(['centraldark', 'memoria']),
    short_tokens_are_ignored: !normalized.includes('api') && !normalized.includes('x'),
    empty_query_is_safe: termos('').length === 0,
    band_score_loads_and_validates: loaded.ok === true,
    band_score_has_17_unique_breaths: loaded.ok === true && loaded.score.breaths.items.length === 17,
    agent_call_trail_owner_exists: /CENTRALDARK_AGENT_CALL_V1/.test(agentCallSource) && /trail_id/.test(agentCallSource),
    graph_binding_band_to_graphrag: /band-score/.test(graphSource) && /graphrag-master/.test(graphSource),
    graph_binding_learning: /aprendizados/.test(graphSource),
    counterproof_missing_breath_is_rejected: inverseMissingBreathRejected,
    counterproof_wrong_trail_protocol_is_rejected: inverseTrailProtocolRejected,
  };
  const ok = Object.values(checks).every(Boolean);
  return {
    schema: 'centraldark.graphrag-master-self-test.v2',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    checks,
    band_validation: loaded.validation,
    live_sources_contacted: false,
    proof_scope: 'STATIC_BAND_SCORE_AND_QUERY_CONTRACT_ONLY',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === '--self-test') {
    const result = selfTest();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } else {
    buscarContexto(args.join(' ') || 'telegram notificacao').then(c => console.log(c || '(sem resultados)'));
  }
}
