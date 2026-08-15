import crypto from 'node:crypto';

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function sha256Stable(value) {
  return crypto.createHash('sha256').update(stableStringify(value)).digest('hex');
}

function sortedUnique(values) {
  return [...new Set((Array.isArray(values) ? values : []).map(String))].sort();
}

export function canonicalizeFindings(input = {}) {
  const orfas = sortedUnique(input.orfas);
  const noConexoes = sortedUnique(input.noConexoes);
  const semFrontmatter = sortedUnique(input.semFrontmatter);
  const unsafePaths = sortedUnique(input.unsafePaths);
  const brokenLinks = Object.fromEntries(
    Object.entries(input.brokenLinks || {})
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([link, origins]) => [String(link), sortedUnique(origins)])
  );

  return {
    orfas,
    brokenLinks,
    noConexoes,
    semFrontmatter,
    unsafePaths,
    total: orfas.length + Object.keys(brokenLinks).length + noConexoes.length + semFrontmatter.length + unsafePaths.length,
  };
}

export function findingFingerprint(input = {}) {
  return sha256Stable(canonicalizeFindings(input));
}

export function informationGain(previousFingerprint, currentFingerprint) {
  if (!currentFingerprint) throw new TypeError('CURRENT_FINGERPRINT_REQUIRED');
  return String(previousFingerprint || '') !== String(currentFingerprint);
}
