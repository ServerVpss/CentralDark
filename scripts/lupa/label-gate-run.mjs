#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import {
  classifyAuthorityAction,
  classifyLabels,
  labelsForDecision,
} from './label-gate.mjs';

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
const baseSha = process.env.BASE_SHA || event.pull_request?.base?.sha || '';
const token = process.env.GITHUB_TOKEN || '';
const repo = process.env.GITHUB_REPOSITORY || '';
const action = String(event.action || '');
const eventLabels = (event.pull_request?.labels || []).map((item) => String(item?.name || ''));

if (!baseSha) {
  console.error('LABEL_GATE_BLOCKED=BASE_SHA_AUSENTE');
  process.exit(1);
}

const seed = execFileSync('git', ['show', `${baseSha}:.github/workflows/bots-labels-seed.yml`], { encoding: 'utf8' });
const canonicalBlock = seed.match(
  /const canonical\s*=\s*\[([\s\S]*?)\]\.map\(\(\[name,\s*color,\s*description\]\)\s*=>/,
)?.[1] || '';
const canonical = new Set(
  [...canonicalBlock.matchAll(/\[\s*'([^']+)'\s*,\s*'[0-9A-Fa-f]{6}'\s*,/g)].map((match) => match[1]),
);
const authorityAliases = new Set(['permito-segredo', 'PERMITO-SEGREDO']);

async function fetchLiveLabels() {
  if (action !== 'opened') return null;
  if (!token || !repo || !event.pull_request?.number) return null;
  const response = await fetch(`https://api.github.com/repos/${repo}/issues/${event.pull_request.number}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'centraldark-label-gate/1.0',
    },
  });
  if (!response.ok) {
    console.error(`LABEL_GATE_LIVE_FETCH=UNAVAILABLE status=${response.status}`);
    return null;
  }
  const live = await response.json();
  return (live.labels || []).map((item) => String(item?.name || item || '')).filter(Boolean);
}

const liveLabels = await fetchLiveLabels();
const labels = labelsForDecision({ eventAction: action, eventLabels, liveLabels });
const result = classifyLabels({ labels, canonical, authorityAliases });

if (action === 'opened') {
  console.log(`LABEL_GATE_SOURCE=${Array.isArray(liveLabels) ? 'LIVE_CONVERGED' : 'EVENT_SNAPSHOT'}`);
}

if (result.status !== 'PASS') {
  if (result.reason === 'LABEL_NAO_CANONICA') {
    console.error(`LABEL_GATE_BLOCKED=${result.reason} count=${result.invalid.length}`);
  } else {
    console.error(`LABEL_GATE_BLOCKED=${result.reason}`);
  }
  process.exit(1);
}

if (result.authorityCompat.length > 0) {
  console.log(`LABEL_GATE_COMPAT_AUTHORITY=${result.authorityCompat.length} aguardando_migracao_issue_707=1`);
  console.log(`LABEL_GATE_AUTHORITY_SEGREDO=${result.authorityCompat.length}`);
}

const actionClass = String(process.env.CENTRALDARK_ACTION_CLASS || '').trim();
const authorityAction = classifyAuthorityAction({
  labels,
  actionClass,
  intentAuthorized: String(process.env.CENTRALDARK_INTENT_AUTHORIZED || '').toLowerCase() === 'true',
  target: process.env.CENTRALDARK_DEPLOY_TARGET || '',
  rollbackReady: String(process.env.CENTRALDARK_ROLLBACK_READY || '').toLowerCase() === 'true',
});

if (authorityAction.status === 'BLOCK') {
  console.error(`PERMITO_SEGREDO_ACTION=BLOCK reason=${authorityAction.reason} class=${authorityAction.actionClass || 'UNKNOWN'}`);
  process.exit(1);
}
if (authorityAction.status === 'PASS') {
  console.log(`PERMITO_SEGREDO_ACTION=PASS class=${authorityAction.actionClass} permit=${authorityAction.permit}`);
}

console.log(`LABEL_GATE=PASS canonical=${result.canonicalPresent.length} catalog=${canonical.size}`);
