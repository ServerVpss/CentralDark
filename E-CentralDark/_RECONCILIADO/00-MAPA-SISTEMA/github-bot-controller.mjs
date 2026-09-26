#!/usr/bin/env node

/**
 * CentralDark GitHub Bot Controller
 *
 * Objetivo:
 * - Auditar PRs abertas.
 * - Quando uma PR mergeada declarar `Bot-Supersedes: #14 #16`, comentar e fechar PRs substituídas.
 * - Nunca faz merge automático.
 * - Não toca VPS, PM2, Caddy, Docker, WuzAPI, WhatsApp, CRM ou banco real.
 */

import fs from 'node:fs';

const apiBase = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const expectedRepository = process.env.BOT_EXPECTED_REPOSITORY || 'ServerVpss/CentralDark';
const eventName = process.env.GITHUB_EVENT_NAME || 'manual';
const eventPath = process.env.GITHUB_EVENT_PATH;
const manualSupersedes = process.env.BOT_SUPERSEDES || '';
const manualMergedPr = Number(process.env.BOT_MERGED_PR || 0) || undefined;
const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (!token) {
  throw new Error('GITHUB_TOKEN ausente.');
}

if (!repository || !repository.includes('/')) {
  throw new Error('GITHUB_REPOSITORY inválido.');
}

const [owner, repo] = repository.split('/');

function isPullRequestMergedEvent(event) {
  return eventName === 'pull_request' && event?.action === 'closed' && event?.pull_request?.merged === true;
}

function resolveDryRun(event) {
  const raw = String(process.env.DRY_RUN || '').trim().toLowerCase();

  if (raw === 'false') return false;
  if (raw === 'true') return true;

  // Para evento automático de PR mergeada com Bot-Supersedes, o fluxo pode aplicar a ação real.
  // Para schedule/manual sem input explícito, mantém auditoria em dry-run.
  return !isPullRequestMergedEvent(event);
}

function validateOfficialRepository({ dryRun }) {
  if (repository === expectedRepository) return;

  const message = [
    `Repositório atual não autorizado: ${repository}`,
    `Esperado: ${expectedRepository}`,
    'O GitHub Bot Controller não fecha PRs fora do repositório oficial.',
  ].join('\n');

  if (!dryRun) {
    throw new Error(message);
  }

  log(`[dry-run] ${message.replaceAll('\n', ' | ')}`);
}

function log(message) {
  console.log(`[github-bot-controller] ${message}`);
}

function parseSupersedes(text) {
  if (!text) return [];

  const matches = [];
  const regex = /^\s*Bot-Supersedes\s*:\s*(.+)$/gim;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const line = match[1] || '';
    const nums = [...line.matchAll(/#(\d+)/g)].map((m) => Number(m[1])).filter(Boolean);
    matches.push(...nums);
  }

  return [...new Set(matches)].sort((a, b) => a - b);
}

async function gh(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || 'GET',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(`GitHub API ${options.method || 'GET'} ${path} falhou: ${response.status} ${JSON.stringify(data).slice(0, 500)}`);
  }

  return data;
}

async function listOpenPullRequests() {
  const prs = await gh(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`);
  return Array.isArray(prs) ? prs : [];
}

async function getPullRequest(number) {
  return gh(`/repos/${owner}/${repo}/pulls/${number}`);
}

async function commentIssue(number, body, { dryRun }) {
  if (dryRun) {
    log(`[dry-run] comentaria na PR #${number}: ${body.split('\n')[0]}`);
    return;
  }

  await gh(`/repos/${owner}/${repo}/issues/${number}/comments`, {
    method: 'POST',
    body: { body },
  });
}

async function closePullRequest(number, { dryRun }) {
  if (dryRun) {
    log(`[dry-run] fecharia a PR #${number}`);
    return;
  }

  await gh(`/repos/${owner}/${repo}/pulls/${number}`, {
    method: 'PATCH',
    body: { state: 'closed' },
  });
}

function readEvent() {
  if (!eventPath) return {};
  try {
    return JSON.parse(fs.readFileSync(eventPath, 'utf8'));
  } catch {
    return {};
  }
}

function appendSummary(markdown) {
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, `${markdown}\n`);
}

async function auditOpenPrs({ dryRun }) {
  const prs = await listOpenPullRequests();

  const rows = prs.map((pr) => ({
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: Boolean(pr.draft),
    head: pr.head?.ref,
    base: pr.base?.ref,
    updated_at: pr.updated_at,
  }));

  log(`PRs abertas: ${rows.length}`);
  for (const pr of rows) {
    log(`#${pr.number} ${pr.title} (${pr.head} -> ${pr.base})`);
  }

  appendSummary([
    '# GitHub Bot Controller',
    '',
    'Modo: auditoria',
    `Dry-run: ${dryRun}`,
    `Repositório: ${repository}`,
    `PRs abertas: ${rows.length}`,
    '',
    ...rows.map((pr) => `- #${pr.number} ${pr.title} \`${pr.head}->${pr.base}\``),
    '',
  ].join('\n'));

  return rows;
}

async function closeSupersededPrs({ mergedPrNumber, supersededNumbers, dryRun }) {
  validateOfficialRepository({ dryRun });

  if (!mergedPrNumber) {
    throw new Error('mergedPrNumber ausente para fechar PRs substituídas.');
  }

  const uniqueTargets = [...new Set(supersededNumbers)]
    .filter((number) => Number.isInteger(number) && number > 0 && number !== mergedPrNumber)
    .sort((a, b) => a - b);

  if (uniqueTargets.length === 0) {
    log('Nenhuma PR substituída informada.');
    return [];
  }

  const mergedPr = await getPullRequest(mergedPrNumber);
  if (!mergedPr.merged) {
    throw new Error(`PR #${mergedPrNumber} não está mergeada. Não vou fechar substituídas.`);
  }

  const results = [];

  for (const target of uniqueTargets) {
    const pr = await getPullRequest(target);

    if (pr.state !== 'open') {
      results.push({ number: target, action: 'skip', reason: `state=${pr.state}` });
      continue;
    }

    const body = [
      'Fechando automaticamente porque esta PR foi substituída por uma PR consolidada já mergeada.',
      '',
      `Substituída por: #${mergedPrNumber}`,
      '',
      'Bot-Supersedes detectado pelo GitHub Bot Controller.',
      '',
      dryRun ? '**Dry-run ativo: nada foi fechado.**' : '**Ação aplicada: PR fechada.**',
    ].join('\n');

    await commentIssue(target, body, { dryRun });
    await closePullRequest(target, { dryRun });
    results.push({ number: target, action: dryRun ? 'dry-run' : 'closed', reason: `superseded_by=#${mergedPrNumber}` });
  }

  appendSummary([
    '# GitHub Bot Controller',
    '',
    'Modo: fechar substituídas',
    `Dry-run: ${dryRun}`,
    `Repositório: ${repository}`,
    `PR consolidada: #${mergedPrNumber}`,
    '',
    ...results.map((r) => `- #${r.number}: ${r.action} (${r.reason})`),
    '',
  ].join('\n'));

  return results;
}

async function main() {
  const event = readEvent();
  const dryRun = resolveDryRun(event);

  log(`event=${eventName} dryRun=${dryRun} repository=${repository}`);

  if (eventName === 'pull_request') {
    const pr = event.pull_request;

    if (!pr || event.action !== 'closed' || !pr.merged) {
      log('Evento pull_request não é merge de PR. Rodando apenas auditoria.');
      await auditOpenPrs({ dryRun: true });
      return;
    }

    const superseded = parseSupersedes([pr.title, pr.body].filter(Boolean).join('\n'));

    if (superseded.length === 0) {
      log(`PR #${pr.number} mergeada sem Bot-Supersedes. Rodando auditoria.`);
      await auditOpenPrs({ dryRun: true });
      return;
    }

    const results = await closeSupersededPrs({
      mergedPrNumber: pr.number,
      supersededNumbers: superseded,
      dryRun,
    });

    log(`Resultados: ${JSON.stringify(results)}`);
    return;
  }

  if (manualSupersedes.trim()) {
    const superseded = parseSupersedes(`Bot-Supersedes: ${manualSupersedes}`);
    const results = await closeSupersededPrs({
      mergedPrNumber: manualMergedPr,
      supersededNumbers: superseded,
      dryRun,
    });
    log(`Resultados manuais: ${JSON.stringify(results)}`);
    return;
  }

  validateOfficialRepository({ dryRun: true });
  await auditOpenPrs({ dryRun });
}

main().catch((error) => {
  console.error(error);
  appendSummary(`\n## Erro\n\n\`\`\`txt\n${String(error.stack || error.message || error).slice(0, 4000)}\n\`\`\``);
  process.exit(1);
});
