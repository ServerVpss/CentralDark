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
    status: quarantineOnly ? 'QUARANTINE' : 'PATTERN_CANDIDATE',
    head_sha: proposal.head_sha,
    kind: cluster[0].kind,
    target: cluster[0].target,
    member_candidate_ids: memberCandidateIds,
    member_fingerprints: memberFingerprints,
    candidate_count: cluster.length,
    observation_count: cluster.reduce((total, candidate) => total + Number(candidate.observations ?? 0), 0),
    session_ids: sessionIds,
    sources,
    source_classes: sourceClasses,
    shared_tokens: sharedTokens,
    similarity_floor: Number(Math.min(...pairSimilarities).toFixed(6)),
    algorithm: 'COMPLETE_LINK_JACCARD_V1',
    recurrence_diversity: recurrenceDiversity,
    evidence_scope: 'RECURRENCE_ONLY_NOT_CAUSAL_PROOF',
    direct_canonical_mutation: false,
    meta_lupa_required: true,
    same_head_revalidation_required: true,
    proof_ownership_when_applicable: true,
    all_members_auto_absorb_eligible: allMembersAutoAbsorbEligible,
    autonomy_handoff_eligible: autonomyHandoffEligible,
  };
}

export function discoverPatterns(proposal, {
  minSimilarity = DEFAULT_MIN_SIMILARITY,
  minSharedTokens = DEFAULT_MIN_SHARED_TOKENS,
} = {}) {
  if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) throw new TypeError('PROPOSAL_INVALID');
  if (!Array.isArray(proposal.candidates)) throw new TypeError('CANDIDATES_INVALID');
  if (!(minSimilarity > 0 && minSimilarity <= 1)) throw new TypeError('MIN_SIMILARITY_INVALID');
  if (!Number.isInteger(minSharedTokens) || minSharedTokens < 1) throw new TypeError('MIN_SHARED_TOKENS_INVALID');

  const options = { minSimilarity, minSharedTokens };
  const patterns = clusterCandidates(proposal.candidates, options)
    .map((cluster) => buildPattern(cluster, proposal, options))
    .sort((a, b) => a.id.localeCompare(b.id));

  const autonomyQueue = patterns
    .filter((pattern) => pattern.autonomy_handoff_eligible === true)
    .map((pattern) => ({
      id: `handoff-${pattern.id.slice('pattern-'.length)}`,
      action: 'HANDOFF_TO_AUTHORIZED_WRITER',
      head_sha: proposal.head_sha,
      pattern_id: pattern.id,
      kind: pattern.kind,
      target: pattern.target,
      member_candidate_ids: pattern.member_candidate_ids,
      apply_directly: false,
      required_gates: [
        'SAME_HEAD_REVALIDATION',
        'WRITER_SCOPE_MATCH',
        'AUTHORIZED_REVERSIBLE_SCOPE',
        'META_LUPA',
        'PROOF_OWNERSHIP_WHEN_APPLICABLE',
      ],
    }));

  return {
    schema_version: 1,
    mode: 'DETERMINISTIC_PATTERN_DISCOVERY',
    algorithm: 'COMPLETE_LINK_JACCARD_V1',
    min_similarity: minSimilarity,
    min_shared_tokens: minSharedTokens,
    same_kind_required: true,
    same_target_required: true,
    direct_canonical_mutation: false,
    pattern_is_proof: false,
    pattern_count: patterns.length,
    autonomy_handoff_eligible_count: autonomyQueue.length,
    patterns,
    autonomy_queue: autonomyQueue,
  };
}

export function enrichDreamProposal(proposal, options = {}) {
  return {
    ...proposal,
    pattern_discovery: discoverPatterns(proposal, options),
  };
}

export function validatePatternDiscovery(proposal) {
  const errors = [];
  const discovery = proposal?.pattern_discovery;
  if (!discovery || typeof discovery !== 'object' || Array.isArray(discovery)) {
    return { ok: false, errors: ['PATTERN_DISCOVERY_MISSING'] };
  }

  if (discovery.mode !== 'DETERMINISTIC_PATTERN_DISCOVERY') errors.push('PATTERN_MODE_INVALID');
  if (discovery.algorithm !== 'COMPLETE_LINK_JACCARD_V1') errors.push('PATTERN_ALGORITHM_INVALID');
  if (discovery.direct_canonical_mutation !== false) errors.push('PATTERN_DIRECT_MUTATION_FORBIDDEN');
  if (discovery.pattern_is_proof !== false) errors.push('PATTERN_CANNOT_BE_PROOF');
  if (discovery.same_kind_required !== true) errors.push('PATTERN_SAME_KIND_REQUIRED');
  if (discovery.same_target_required !== true) errors.push('PATTERN_SAME_TARGET_REQUIRED');
  if (!Array.isArray(discovery.patterns)) errors.push('PATTERNS_INVALID');
  if (!Array.isArray(discovery.autonomy_queue)) errors.push('AUTONOMY_QUEUE_INVALID');

  const candidateById = new Map((proposal?.candidates ?? []).map((candidate) => [candidate.id, candidate]));
  const patternById = new Map();

  for (const pattern of discovery.patterns ?? []) {
    const id = pattern?.id ?? 'UNKNOWN';
    patternById.set(id, pattern);
    if (!Array.isArray(pattern?.member_candidate_ids) || pattern.member_candidate_ids.length < 2) {
      errors.push(`PATTERN_REQUIRES_MULTIPLE_CANDIDATES:${id}`);
      continue;
    }
    if (pattern?.direct_canonical_mutation !== false) errors.push(`PATTERN_DIRECT_MUTATION_FORBIDDEN:${id}`);
    if (pattern?.evidence_scope !== 'RECURRENCE_ONLY_NOT_CAUSAL_PROOF') errors.push(`PATTERN_EVIDENCE_SCOPE_INVALID:${id}`);
    if (pattern?.meta_lupa_required !== true) errors.push(`PATTERN_META_LUPA_REQUIRED:${id}`);
    if (pattern?.same_head_revalidation_required !== true) errors.push(`PATTERN_SAME_HEAD_REQUIRED:${id}`);
    if (pattern?.proof_ownership_when_applicable !== true) errors.push(`PATTERN_PROOF_OWNERSHIP_REQUIRED:${id}`);

    const members = pattern.member_candidate_ids.map((memberId) => candidateById.get(memberId));
    if (members.some((member) => !member)) {
      errors.push(`PATTERN_MEMBER_UNKNOWN:${id}`);
      continue;
    }
    if (members.some((member) => member.kind !== pattern.kind)) errors.push(`PATTERN_KIND_DRIFT:${id}`);
    if (members.some((member) => member.target !== pattern.target)) errors.push(`PATTERN_TARGET_DRIFT:${id}`);
    if (new Set(members.map((member) => member.fingerprint)).size < 2) errors.push(`PATTERN_NEEDS_DISTINCT_FINGERPRINTS:${id}`);

    if (pattern.autonomy_handoff_eligible === true) {
      if (pattern.status === 'QUARANTINE') errors.push(`QUARANTINE_CANNOT_HANDOFF:${id}`);
      if (pattern.recurrence_diversity !== true) errors.push(`HANDOFF_REQUIRES_RECURRENCE_DIVERSITY:${id}`);
      if (members.some((member) => member?.promotion?.auto_absorb_eligible !== true)) {
        errors.push(`HANDOFF_MEMBER_NOT_AUTO_ABSORB_ELIGIBLE:${id}`);
      }
    }
  }

  const queuedPatternIds = new Set();
  for (const item of discovery.autonomy_queue ?? []) {
    const id = item?.id ?? 'UNKNOWN';
    if (item?.action !== 'HANDOFF_TO_AUTHORIZED_WRITER') errors.push(`AUTONOMY_ACTION_INVALID:${id}`);
    if (item?.apply_directly !== false) errors.push(`AUTONOMY_DIRECT_APPLY_FORBIDDEN:${id}`);
    if (item?.head_sha !== proposal?.head_sha) errors.push(`AUTONOMY_HEAD_MISMATCH:${id}`);
    const pattern = patternById.get(item?.pattern_id);
    if (!pattern) errors.push(`AUTONOMY_PATTERN_UNKNOWN:${id}`);
    else if (pattern.autonomy_handoff_eligible !== true) errors.push(`AUTONOMY_PATTERN_NOT_ELIGIBLE:${id}`);
    if (queuedPatternIds.has(item?.pattern_id)) errors.push(`AUTONOMY_DUPLICATE_PATTERN:${id}`);
    queuedPatternIds.add(item?.pattern_id);
  }

  const eligiblePatterns = (discovery.patterns ?? []).filter((pattern) => pattern.autonomy_handoff_eligible === true);
  if (eligiblePatterns.length !== (discovery.autonomy_queue ?? []).length) errors.push('AUTONOMY_QUEUE_COUNT_MISMATCH');
  if (Number(discovery.pattern_count) !== (discovery.patterns ?? []).length) errors.push('PATTERN_COUNT_MISMATCH');
  if (Number(discovery.autonomy_handoff_eligible_count) !== (discovery.autonomy_queue ?? []).length) {
    errors.push('AUTONOMY_HANDOFF_COUNT_MISMATCH');
  }

  return { ok: errors.length === 0, errors };
}
