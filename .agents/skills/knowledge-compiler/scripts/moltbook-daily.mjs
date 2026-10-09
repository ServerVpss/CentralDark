// Public Moltbook data is EXTERNAL_UNTRUSTED, never an instruction channel.
// Read-only, no account token, no posting, no secondary scheduler.
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const SOURCE_URL = 'https://www.moltbook.com/api/v1/posts?sort=new&limit=12';
const STATE_PATH = path.join(os.homedir(), '.hermes', 'state', 'centraldark', 'moltbook-daily.json');
const hash = (data) => createHash('sha256').update(JSON.stringify(data)).digest('hex');

export function normalizePublicPosts(feed) {
  if (!feed || feed.success !== true || !Array.isArray(feed.posts)) {
    throw new Error('INVALID_PUBLIC_FEED_SCHEMA');
  }
  const seen = new Set();
  return feed.posts.slice(0, 12).flatMap((post) => {
    const id = typeof post?.id === 'string' ? post.id.trim() : '';
    if (!/^[a-zA-Z0-9_-]{6,100}$/.test(id) || seen.has(id)) return [];
    seen.add(id);
    const title = typeof post.title === 'string'
      ? post.title.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160)
      : '';
    return { id, title, fingerprint: hash([id, title]), status: 'EXTERNAL_CANDIDATE' };
  });
}

async function readReceipt(file) {
  try {
    const st = await fs.lstat(file);
    if (!st.isFile()) throw new Error('INVALID_STATE_FILE');
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function collectDaily({
  now = new Date(), statePath = STATE_PATH, fetcher = fetch, dryRun = false,
} = {}) {
  const day = now.toISOString().slice(0, 10);
  const previous = await readReceipt(statePath);
  if (!dryRun && previous?.day_utc === day && previous?.status === 'READ_OK') {
    return { status: 'ALREADY_READ', day_utc: day, new_count: 0, state_path: statePath };
  }
  const response = await fetcher(SOURCE_URL, {
    method: 'GET', redirect: 'manual',
    headers: { Accept: 'application/json', 'User-Agent': 'CentralDark-Destilador-ReadOnly/1.0' },
    signal: AbortSignal.timeout(12000),
  });
  if (response.status >= 300 && response.status < 400) throw new Error('REDIRECT_BLOCKED');
  if (response.status !== 200) throw new Error('HTTP_' + response.status);
  if (response.url && new URL(response.url).origin !== 'https://www.moltbook.com') {
    throw new Error('SOURCE_ORIGIN_CHANGED');
  }
  const body = await response.text();
  if (body.length > 200000) throw new Error('FEED_TOO_LARGE');
  const posts = normalizePublicPosts(JSON.parse(body));
  const historical = new Set(Array.isArray(previous?.seen_ids)
    ? previous.seen_ids.filter((v) => typeof v === 'string') : []);
  const candidates = posts.filter((p) => !historical.has(p.id));
  const state = {
    schema: 'centraldark.moltbook.daily.v1',
    status: 'READ_OK', day_utc: day, observed_at_utc: now.toISOString(),
    source: SOURCE_URL, http_status: 200,
    identity_status: 'NOT_TESTED_PUBLIC_READ',
    collection_hash: hash(posts.map((p) => p.fingerprint)),
    new_count: candidates.length, candidates,
    seen_ids: [...new Set([...historical, ...posts.map((p) => p.id)])].slice(-300),
    disposition: 'EXTERNAL_CANDIDATE_ONLY_NO_AUTO_APPLY',
    next_cursor: 'KNOWLEDGE_COMPILER_DEDUPE_AND_TEST_EXISTING_OWNER',
  };
  if (!dryRun) {
    await fs.mkdir(path.dirname(statePath), { recursive: true, mode: 0o700 });
    const tmp = statePath + '.' + process.pid + '.tmp';
    try {
      await fs.writeFile(tmp, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
      await fs.rename(tmp, statePath);
    } finally { await fs.unlink(tmp).catch(() => {}); }
  }
  return {
    status: 'READ_OK', day_utc: day, new_count: candidates.length,
    candidates, collection_hash: state.collection_hash,
    state_path: dryRun ? 'NOT_WRITTEN_DRY_RUN' : statePath,
    identity_status: state.identity_status,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  collectDaily({ dryRun: process.argv.includes('--probe') })
    .then((output) => console.log(JSON.stringify(output)))
    .catch((err) => {
      console.error(JSON.stringify({
        status: 'SOURCE_UNAVAILABLE', error: String(err.message).slice(0, 100),
        next_cursor: 'MOLTBOOK_READONLY_RETRY_EXISTING_HERMES_JOB',
      }));
      process.exitCode = 2;
    });
}
