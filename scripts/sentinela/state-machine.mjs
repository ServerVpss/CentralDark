import { createHash } from 'node:crypto';

const ISSUE_RE = /\[SENTINELA sentinela-([a-f0-9]{10})\]/i;

function requiredString(value, field) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`${field} obrigatório`);
  }
  return value.trim();
}

export function findingId(finding) {
  const area = requiredString(finding?.area, 'finding.area');
  const titulo = requiredString(finding?.titulo, 'finding.titulo');
  return createHash('sha1').update(`${area}|${titulo}`).digest('hex').slice(0, 10);
}

export function parseSentinelaIssue(issue) {
  const title = String(issue?.title || '');
  const match = title.match(ISSUE_RE);
  if (!match) return null;

  const number = Number(issue?.number ?? issue?.issue_number ?? 0);
  if (!Number.isInteger(number) || number <= 0) return null;

  return { id: match[1].toLowerCase(), number, title };
}

export function normalizeFindings(findings = []) {
  if (!Array.isArray(findings)) throw new TypeError('findings deve ser array');
  const map = new Map();
  for (const finding of findings) {
    const id = findingId(finding);
    if (!map.has(id)) map.set(id, { ...finding, id });
  }
  return [...map.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function reconcileFindingState({ findings = [], openIssues = [] } = {}) {
  if (!Array.isArray(openIssues)) throw new TypeError('openIssues deve ser array');

  const current = new Map(normalizeFindings(findings).map((f) => [f.id, f]));
  const openById = new Map();
  const duplicates = [];

  for (const raw of openIssues) {
    const parsed = parseSentinelaIssue(raw);
    if (!parsed) continue;
    const existing = openById.get(parsed.id);
    if (!existing) {
      openById.set(parsed.id, parsed);
      continue;
    }
    const canonical = existing.number <= parsed.number ? existing : parsed;
    const duplicate = canonical === existing ? parsed : existing;
    openById.set(parsed.id, canonical);
    duplicates.push({ type: 'DUPLICATE_OPEN', id: parsed.id, canonical, duplicate });
  }

  const create = [];
  const keep = [];
  const recover = [];

  for (const [id, finding] of current) {
    const issue = openById.get(id);
    if (issue) keep.push({ type: 'KEEP', id, finding, issue });
    else create.push({ type: 'ALERT', id, finding });
  }

  for (const [id, issue] of openById) {
    if (!current.has(id)) recover.push({ type: 'RECOVERY', id, issue });
  }

  return {
    create,
    keep,
    recover,
    duplicates: duplicates.sort((a, b) => a.duplicate.number - b.duplicate.number),
    counts: {
      current: current.size,
      create: create.length,
      keep: keep.length,
      recover: recover.length,
      duplicates: duplicates.length,
    },
  };
}
