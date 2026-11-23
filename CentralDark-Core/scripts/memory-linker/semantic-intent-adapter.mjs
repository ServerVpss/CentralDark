import { execFileSync } from 'node:child_process';
import path from 'node:path';

function thresholdFrom(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n < -1 || n > 1) throw new TypeError('SEMANTIC_THRESHOLD_INVALID');
  return n;
}
function repoRoot() { return process.env.CENTRALDARK_REPO_ROOT || process.cwd(); }

export function semanticIntentPrefilter(proposal, {
  modelConfigured = Boolean(process.env.SEMANTIC_MODEL_HOME),
  threshold = process.env.SEMANTIC_INTENT_THRESHOLD,
} = {}) {
  if (!proposal || typeof proposal !== 'object' || Array.isArray(proposal)) throw new TypeError('PROPOSAL_INVALID');
  const items = (proposal.candidates ?? []).map((candidate) => String(candidate.learning_delta ?? '').trim()).filter(Boolean);
  const numericThreshold = thresholdFrom(threshold);
  const base = {
    schema_version: 1,
    mode: 'GLOVE_PREFILTER_PERCEPTION_ONLY',
    model_id: 'nilc-glove-50d@9296f6537f6b0a24d449a2677c21c18c2c0c3bdd',
    affects_pattern_decision: false,
    automatic_merge: false,
    same_intent_claim: false,
    threshold: numericThreshold,
    threshold_source: numericThreshold === null ? 'UNPROVEN' : 'RUNTIME_CONFIG_REQUIRES_CALIBRATION_EVIDENCE',
  };
  if (!modelConfigured) return { ...base, status: 'MODEL_NOT_CONFIGURED', pair_count: 0, pairs: [] };
  if (items.length < 2) return { ...base, status: 'NOT_ENOUGH_ITEMS', pair_count: 0, pairs: [] };

  const python = process.env.SEMANTIC_PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const bridge = process.env.SEMANTIC_BRIDGE_PATH || path.join(repoRoot(), 'infra', 'mcp', 'semantic_bridge.py');
  const args = JSON.stringify({ items, ...(numericThreshold === null ? {} : { threshold: numericThreshold }) });
  try {
    const raw = execFileSync(python, [bridge, '--operation', 'semantic_dedupe', '--args', args], {
      cwd: repoRoot(), env: process.env, encoding: 'utf8', timeout: Number(process.env.SEMANTIC_BRIDGE_TIMEOUT_MS || 60000), stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    const envelope = JSON.parse(raw);
    if (envelope?.ok !== true) return { ...base, status: envelope?.error || 'SEMANTIC_ERROR', pair_count: 0, pairs: [] };
    const result = envelope.result ?? {};
    return { ...base, status: result.decision || 'CANDIDATES_ONLY', pair_count: Array.isArray(result.pairs) ? result.pairs.length : 0,
      pairs: Array.isArray(result.pairs) ? result.pairs : [], merge_candidates: Array.isArray(result.merge_candidates) ? result.merge_candidates : [], provenance: result.provenance ?? null };
  } catch (error) {
    return { ...base, status: 'SEMANTIC_UNAVAILABLE', error: String(error?.message || error), pair_count: 0, pairs: [] };
  }
}
export function attachSemanticIntentPrefilter(proposal, options = {}) {
  return { ...proposal, semantic_prefilter: semanticIntentPrefilter(proposal, options) };
}
