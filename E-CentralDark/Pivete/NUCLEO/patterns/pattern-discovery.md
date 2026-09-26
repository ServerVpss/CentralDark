# PADRAO - pattern-discovery.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\memory-linker\pattern-discovery.mjs
**SHA:** f2b5d2e4ca992868
**Timestamp:** 2026-08-28T02:57:36.898415
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- const pattern = patternById.get(item?.pattern_id);
- if (queuedPatternIds.has(item?.pattern_id)) errors.push(`AUTONOMY_DUPLICATE_PATTERN:${id}`);

### Ouro Bruto (primeiros 5000 chars)
```
import crypto from 'node:crypto';

const DEFAULT_MIN_SIMILARITY = 0.6;
const DEFAULT_MIN_SHARED_TOKENS = 3;
const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'ate', 'com', 'como', 'da', 'das', 'de', 'do', 'dos', 'e', 'em', 'entre',
  'essa', 'esse', 'esta', 'este', 'isso', 'mais', 'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela',
  'pelas', 'pelo', 'pelos', 'por', 'que', 'se', 'sem', 'ser', 'sua', 'suas', 'um', 'uma', 'uns', 'umas',
  'and', 'are', 'before', 'for', 'from', 'into', 'is', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with',
]);

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function sha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function sortedUnique(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(String))].sort();
}

export function patternTokens(value) {
  const normalized = String(value ?? '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!normalized) return [];
  return sortedUnique(normalized
    .split(/\s+/)
    .filter((token) => token.length >= 4 && !STOPWORDS.has(token)));
}

function intersection(values) {
  if (!Array.isArray(values) || values.length === 0) return [];
  let current = new Set(values[0]);
  for (const list of values.slice(1)) {
    const next = new Set(list);
    current = new Set([...current].filter((item) => next.has(item)));
  }
  return [...current].sort();
}

export function jaccardSimilarity(left, right) {
  const a = new Set(left);
  const b = new Set(right);
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const value of a) if (b.has(value)) shared += 1;
  const union = a.size + b.size - shared;
  return union === 0 ? 0 : shared / union;
}

function pairMetrics(left, right) {
  const leftTokens = patternTokens(left.learning_delta);
  const rightTokens = patternTokens(right.learning_delta);
  const sharedTokens = leftTokens.filter((token) => rightTokens.includes(token));
  return {
    leftTokens,
    rightTokens,
    sharedTokens,
    similarity: jaccardSimilarity(leftTokens, rightTokens),
  };
}

function samePatternBoundary(left, right, { minSimilarity, minSharedTokens }) {
  if (left.kind !== right.kind || left.target !== right.target) return false;
  if (left.fingerprint === right.fingerprint) return false;
  const metrics = pairMetrics(left, right);
  return metrics.sharedTokens.length >= minSharedTokens && metrics.similarity >= minSimilarity;
}

function clusterCandidates(candidates, options) {
  const clusters = [];
  const ordered = [...candidates].sort((a, b) => String(a.fingerprint).localeCompare(String(b.fingerprint)));

  for (const candidate of ordered) {
    let placed = false;
    for (const cluster of clusters) {
      if (cluster.every((member) => samePatternBoundary(member, candidate, options))) {
        cluster.push(candidate);
        placed = true;
        break;
      }
    }
    if (!placed) clusters.push([candidate]);
  }

  return clusters.filter((cluster) => cluster.length >= 2);
}

function buildPattern(cluster, proposal, options) {
  const memberCandidateIds = cluster.map((candidate) => candidate.id).sort();
  const memberFingerprints = cluster.map((candidate) => candidate.fingerprint).sort();
  const tokenSets = cluster.map((candidate) => patternTokens(candidate.learning_delta));
  const sharedTokens = intersection(tokenSets);
  const pairSimilarities = [];

  for (let i = 0; i < cluster.length; i += 1) {
    for (let j = i + 1; j < cluster.length; j += 1) {
      pairSimilarities.push(pairMetrics(cluster[i], cluster[j]).similarity);
    }
  }

  const sessionIds = sortedUnique(cluster.flatMap((candidate) => candidate.session_ids ?? []));
  const sources = sortedUnique(cluster.flatMap((candidate) => candidate.sources ?? []));
  const sourceClasses = sortedUnique(cluster.flatMap((candidate) => candidate.source_classes ?? []));
  const quarantineOnly = cluster.every((candidate) => candidate?.promotion?.status === 'QUARANTINE');
  const allMembersAutoAbsorbEligible = cluster.every((candidate) => candidate?.promotion?.auto_absorb_eligible === true);
  const recurrenceDiversity = sessionIds.length >= 2 && sources.length >= 2;
  const autonomyHandoffEligible =
    !quarantineOnly &&
    allMembersAutoAbsorbEligible &&
    recurrenceDiversity &&
    sharedTokens.length >= options.minSharedTokens;

  const idSeed = stableStringify({
    head_sha: proposal.head_sha,
    kind: cluster[0].kind,
    target: cluster[0].target,
    member_fingerprints: memberFingerprints,
  });
  const patternId = `pattern-${sha256(idSeed).slice(0, 16)}`;

  return {
    id: patternId,
    status: qu
```