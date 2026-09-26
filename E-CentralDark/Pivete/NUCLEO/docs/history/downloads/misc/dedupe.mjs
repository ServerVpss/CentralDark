export function dedupeEvidence(evidenceList) {
  const byHash = new Map();
  const duplicates = [];

  for (const item of evidenceList) {
    const key = `${item.target ?? 'NO_TARGET'}::${item.content_hash}`;
    if (byHash.has(key)) {
      duplicates.push({
        duplicate: item.evidence_id,
        canonical: byHash.get(key).evidence_id,
        reason: 'SAME_TARGET_AND_CONTENT_HASH'
      });
      continue;
    }
    byHash.set(key, item);
  }

  return {
    unique: [...byHash.values()],
    duplicates
  };
}
