#!/usr/bin/env node
// EXTENSAO_CANONICA do GraphRAG-Master. Nao cria segundo cerebro/RAG/autoridade.
import { buscarContexto } from './agent.mjs';

const AUTHORITY_RANK = Object.freeze({
  CANONICAL: 60,
  PROOF_LEDGER: 55,
  DERIVED_INDEX: 35,
  CANDIDATE: 30,
  CAPABILITY_INDEX: 25,
  HISTORY: 15,
  UNKNOWN: 0,
});

const TEMPORAL_RANK = Object.freeze({
  CURRENT: 30,
  NON_TEMPORAL: 25,
  MIXED: 15,
  HISTORY: 5,
  UNKNOWN: 0,
});

function termos(missao) {
  return [...new Set(String(missao || '')
    .toLowerCase()
    .split(/[^a-z0-9@\/.\-]+/)
    .filter(t => t.length >= 4))];
}

export function classificarBlocoContexto(texto) {
  const head = String(texto || '').split('\n')[0].trim().toLowerCase();
  if (head.startsWith('partitura fixa centraldark:')) return { source: 'band-score', authority: 'CANONICAL', temporal: 'CURRENT', weight: 600 };
  if (head.startsWith('claims selados')) return { source: 'claim-seals', authority: 'PROOF_LEDGER', temporal: 'MIXED', weight: 550 };
  if (head.startsWith('aprendizados curados')) return { source: 'aprendizados', authority: 'CANONICAL', temporal: 'CURRENT', weight: 500 };
  if (head.startsWith('grafo vivo')) return { source: 'graph-derived', authority: 'DERIVED_INDEX', temporal: 'CURRENT', weight: 350 };
  if (head.startsWith('docs locais')) return { source: 'knowledge-local', authority: 'CANDIDATE', temporal: 'UNKNOWN', weight: 300 };
  if (head.startsWith('biblioteca de agentes')) return { source: 'agent-library', authority: 'CAPABILITY_INDEX', temporal: 'CURRENT', weight: 250 };
  if (head.startsWith('missões concluídas')) return { source: 'missions-history', authority: 'HISTORY', temporal: 'HISTORY', weight: 150 };
  if (head.startsWith('debates/evolução')) return { source: 'debates-history', authority: 'HISTORY', temporal: 'HISTORY', weight: 100 };
  return { source: 'unknown', authority: 'UNKNOWN', temporal: 'UNKNOWN', weight: 0 };
}

function scoreEvidence(item) {
  return (AUTHORITY_RANK[item?.authority] || 0) + (TEMPORAL_RANK[item?.temporal] || 0);
}

export function resolverEvidencias(evidencias = []) {
  const groups = new Map();
  for (const item of evidencias) {
    const claim = String(item?.claim || '').trim();
    if (!claim) continue;
    if (!groups.has(claim)) groups.set(claim, []);
    groups.get(claim).push(item);
  }

  const resolved = [];
  for (const [claim, candidates] of groups) {
    const ranked = [...candidates].sort((a, b) => scoreEvidence(b) - scoreEvidence(a));
    const first = ranked[0] || null;
    const second = ranked[1] || null;
    const conflict = Boolean(
      first && second &&
      scoreEvidence(first) === scoreEvidence(second) &&
      String(first.value) !== String(second.value)
    );
    resolved.push({
      claim,
      status: conflict ? 'CONFLICT' : first ? 'PASS' : 'UNKNOWN',
      winner: conflict ? null : first,
      candidates: ranked,
    });
  }
  return resolved;
}

function dividirBlocos(contexto) {
  return String(contexto || '')
    .split(/\n\n(?=[A-ZÁÉÍÓÚ])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function extrairAnchor(contexto) {
  const explicit = String(contexto || '').match(/^- \[ANCHOR\]\[[^\]]+\]\s+(.+?)(?:\s+→|$)/m);
  if (explicit) return explicit[1].trim().slice(0, 120);
  const graphBlock = dividirBlocos(contexto).find(b => classificarBlocoContexto(b).source === 'graph-derived');
  const first = String(graphBlock || '').match(/^- \[[^\]]+\]\s+(.+?)(?:\s+→|$)/m);
  return first ? first[1].trim().slice(0, 120) : 'UNKNOWN';
}

export function alinharContexto(missao, contexto) {
  const rawBlocks = dividirBlocos(contexto);
  const ranked = rawBlocks
    .map((text, index) => ({ text, index, ...classificarBlocoContexto(text) }))
    .sort((a, b) => (b.weight - a.weight) || (a.index - b.index));

  const envelope = [
    'ALIGNMENT_ENVELOPE centraldark.cognitive-context.v1',
    '- status=EVIDENCE_ROUTING_ACTIVE',
    `- anchor=${extrairAnchor(contexto)}`,
    `- intent_tokens=${termos(missao).slice(0, 12).join(', ') || 'NONE'}`,
    '- authority_order=CANONICAL>PROOF_LEDGER>DERIVED_INDEX>CANDIDATE>CAPABILITY_INDEX>HISTORY>UNKNOWN',
    '- temporal_order=CURRENT>NON_TEMPORAL>MIXED>HISTORY>UNKNOWN',
    '- conflict_policy=SAME_RANK_DIFFERENT_VALUE=>CONFLICT/UNKNOWN',
    '- graph_role=DERIVED_INDEX_NOT_AUTHORITY',
    '- current_state_beats_history=true',
  ].join('\n');

  return [envelope, ...ranked.map(b => b.text)].filter(Boolean).join('\n\n');
}

export async function buscarContextoAlinhado(missao) {
  const contexto = await buscarContexto(missao);
  return alinharContexto(missao, contexto).slice(0, 4000);
}

export function selfTest() {
  const currentWinsHistory = resolverEvidencias([
    { claim: 'memory-owner', value: 'GraphRAG-Master', authority: 'CANONICAL', temporal: 'CURRENT' },
    { claim: 'memory-owner', value: 'OldMemoryAgent', authority: 'HISTORY', temporal: 'HISTORY' },
  ])[0];
  const equalRankConflict = resolverEvidencias([
    { claim: 'owner-x', value: 'A', authority: 'CANONICAL', temporal: 'CURRENT' },
    { claim: 'owner-x', value: 'B', authority: 'CANONICAL', temporal: 'CURRENT' },
  ])[0];
  const sample = [
    'Debates/Evolução (Arsenal — perguntas e respostas reais entre IAs):\n- legado',
    'Grafo vivo (grafo.centralldark.com):\n- [owner] GraphRAG-Master → conecta: hermes-core',
    'Partitura fixa CentralDark:\n- schema=centraldark.band-score.v1',
  ].join('\n\n');
  const aligned = alinharContexto('corrigir Hermes sem criar sistema paralelo', sample);

  const checks = {
    graph_is_derived: classificarBlocoContexto('Grafo vivo (grafo.centralldark.com):').authority === 'DERIVED_INDEX',
    history_is_history: classificarBlocoContexto('Missões concluídas (Hermes — trajetória real de execução):').authority === 'HISTORY',
    current_canonical_beats_history: currentWinsHistory?.status === 'PASS' && currentWinsHistory?.winner?.value === 'GraphRAG-Master',
    equal_rank_conflict_is_unknown: equalRankConflict?.status === 'CONFLICT' && equalRankConflict?.winner === null,
    envelope_has_anchor: /anchor=GraphRAG-Master/.test(aligned),
    canonical_precedes_graph: aligned.indexOf('Partitura fixa CentralDark:') < aligned.indexOf('Grafo vivo'),
    graph_remains_non_authority: /graph_role=DERIVED_INDEX_NOT_AUTHORITY/.test(aligned),
  };
  const ok = Object.values(checks).every(Boolean);
  return {
    schema: 'centraldark.graphrag-cognitive-alignment-self-test.v1',
    status: ok ? 'PASS' : 'FAIL',
    ok,
    checks,
    live_sources_contacted: false,
    proof_scope: 'STATIC_ALIGNMENT_ROUTING_AND_CONFLICT_POLICY_ONLY',
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  if (args[0] === '--self-test') {
    const result = selfTest();
    console.log(JSON.stringify(result, null, 2));
    process.exitCode = result.ok ? 0 : 1;
  } else {
    const mission = args.join(' ') || 'centraldark memoria hermes';
    buscarContextoAlinhado(mission)
      .then(context => console.log(context || '(sem resultados)'))
      .catch(error => {
        console.error(JSON.stringify({ status: 'FAIL', error: String(error?.message || error) }));
        process.exitCode = 1;
      });
  }
}
