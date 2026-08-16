import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const MEMORY_RESERVE_PATH = 'docs/CONSCIENCIA/LEMBRANCAS/LEMBRANCAS.md';
const DEFAULT_FILE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', MEMORY_RESERVE_PATH);
const ALLOWED_KINDS = new Set(['MEMORY', 'SKILL', 'RULE', 'TEST', 'GUARDRAIL', 'CONTRACT']);
const SHA40_RE = /^[a-f0-9]{40}$/i;

function field(block, label) {
  const match = block.match(new RegExp(`\\*\\*${label}:\\*\\*\\s*([^\\n]+)`, 'i'));
  return match ? match[1].trim() : '';
}

function normalizeKind(value, tags = []) {
  const explicit = String(value || '').trim().toUpperCase();
  if (ALLOWED_KINDS.has(explicit)) return explicit;
  const tagSet = new Set(tags.map((tag) => String(tag).trim().toLowerCase()));
  if ([...tagSet].some((tag) => ['regra', 'rule', 'padrao', 'padrão'].includes(tag))) return 'RULE';
  if ([...tagSet].some((tag) => ['skill', 'capacidade'].includes(tag))) return 'SKILL';
  if ([...tagSet].some((tag) => ['teste', 'test', 'regressao', 'regressão'].includes(tag))) return 'TEST';
  if ([...tagSet].some((tag) => ['guardrail', 'trava', 'seguranca', 'segurança'].includes(tag))) return 'GUARDRAIL';
  if ([...tagSet].some((tag) => ['contrato', 'contract', 'governanca', 'governança'].includes(tag))) return 'CONTRACT';
  return 'MEMORY';
}

function parseTimestamp(id, date) {
  const raw = String(id || '').trim();
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw)) return `${raw}:00-03:00`;
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(raw)) return raw;
  const day = String(date || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(day)) return `${day}T12:00:00-03:00`;
  return null;
}

function contentOf(block) {
  const match = block.match(/(?:^|\n)Conte[úu]do:\s*([\s\S]*)$/i);
  return match ? match[1].trim() : '';
}

export function parseMemoryReserve(markdown, {
  headSha,
  today = new Date().toISOString().slice(0, 10),
  includeExpired = false,
} = {}) {
  if (!SHA40_RE.test(String(headSha || ''))) throw new TypeError('HEAD_SHA_INVALID');
  const blocks = String(markdown || '')
    .split(/\n(?=### )/)
    .map((block) => block.trim())
    .filter((block) => block.startsWith('### '));

  const events = [];
  const skipped = [];
  for (let index = 0; index < blocks.length; index += 1) {
    const block = blocks[index];
    const heading = (block.match(/^###\s+(?:\[([^\]]+)\]\s*)?(.+)$/m) || []);
    const id = String(heading[1] || '').trim();
    const title = String(heading[2] || heading[1] || '').trim();
    const tagsRaw = field(block, 'Tags');
    const tags = tagsRaw ? tagsRaw.split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean) : [];
    const promoted = /^s/i.test(field(block, 'Promovida'));
    const expires = field(block, 'Expira');
    if (!includeExpired && !promoted && /^\d{4}-\d{2}-\d{2}$/.test(expires) && expires < today) {
      skipped.push({ index, id: id || null, reason: 'EXPIRED' });
      continue;
    }

    const delta = contentOf(block);
    const eventTime = parseTimestamp(id, field(block, 'Data'));
    if (!title || !delta || !eventTime) {
      skipped.push({ index, id: id || null, reason: 'INCOMPLETE_MEMORY_ENTRY' });
      continue;
    }

    const kind = normalizeKind(field(block, 'Tipo'), tags);
    const target = field(block, 'Target') || MEMORY_RESERVE_PATH;
    const sessionId = field(block, 'Sess(?:ã|a)o') || 'UNKNOWN_SESSION';
    const source = field(block, 'Fonte') || 'mcp:consolidar_pensamento';

    events.push({
      timestamp: eventTime,
      event_time: eventTime,
      observed_at: eventTime,
      source,
      source_class: 'INTERNAL',
      session_id: sessionId,
      head_sha: String(headSha).toLowerCase(),
      kind,
      target,
      claim: title,
      learning_delta: delta,
      evidence: [`git-memory:${MEMORY_RESERVE_PATH}#${id || index}`],
      consumer_evidence: [],
      owner_evidence: [],
      memory_reserve: {
        entry_id: id || null,
        tags,
        promoted,
        expires: expires || null,
      },
    });
  }

  return { events, skipped, scanned: blocks.length };
}

export function loadMemoryReserveEvents({
  headSha,
  filePath = '',
  today,
  includeExpired = false,
} = {}) {
  const resolved = path.resolve(filePath || process.env.CENTRALDARK_MEMORY_RESERVE_PATH || DEFAULT_FILE);
  if (!fs.existsSync(resolved)) {
    return { status: 'MEMORY_RESERVE_MISSING', path: resolved, events: [], skipped: [], scanned: 0 };
  }
  const parsed = parseMemoryReserve(fs.readFileSync(resolved, 'utf8'), { headSha, today, includeExpired });
  return { status: 'MEMORY_RESERVE_LOADED', path: resolved, ...parsed };
}
