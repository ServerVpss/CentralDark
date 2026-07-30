#!/usr/bin/env node
/**
 * Sentinela — coletor determinístico e read-only.
 *
 * Este processo não cria Issue, não faz commit e não executa `git push`.
 * O workflow é o escritor único: decide entre auto-fix + PR ou Issue deduplicada.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const OUTPUT_DIR = process.env.SENTINELA_OUTPUT_DIR || '.artifacts/sentinela';
const JSON_FILE = path.join(OUTPUT_DIR, 'report.json');
const MARKDOWN_FILE = path.join(OUTPUT_DIR, 'report.md');
const TIMEOUT_MS = Number(process.env.SENTINELA_TIMEOUT_MS || 8000);

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json' },
  { name: 'Painel', url: 'https://status.centralldark.com/' },
  { name: 'API', url: 'https://api.centralldark.com/health' },
];

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

async function checkEndpoint(endpoint) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(endpoint.url, { signal: controller.signal });
    return {
      ...endpoint,
      status: response.status,
      ok: response.status >= 200 && response.status < 400,
      latency_ms: Date.now() - started,
      cors: response.headers.get('access-control-allow-origin') || '',
      error: '',
    };
  } catch (error) {
    return {
      ...endpoint,
      status: 0,
      ok: false,
      latency_ms: Date.now() - started,
      cors: '',
      error: error?.name === 'AbortError' ? 'TIMEOUT' : String(error?.message || error),
    };
  } finally {
    clearTimeout(timer);
  }
}

function workflowFailures() {
  try {
    const raw = execFileSync('gh', [
      'run', 'list', '-R', REPO,
      '--status', 'failure',
      '--json', 'name,databaseId,conclusion,headBranch,createdAt,url',
      '--limit', '20',
    ], { encoding: 'utf8', timeout: 30000 });
    const rows = JSON.parse(raw);
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    return {
      ok: true,
      rows: rows.filter((row) => Date.parse(row.createdAt || 0) >= cutoff),
      error: '',
    };
  } catch (error) {
    return {
      ok: false,
      rows: [],
      error: `GITHUB_ACTIONS_QUERY_FAILED:${String(error?.message || error).slice(0, 200)}`,
    };
  }
}

function autonomyAudit() {
  try {
    const raw = execFileSync('python3', [
      'scripts/evolucao/auditar-autonomia.py', '--json-stdout',
    ], { encoding: 'utf8', timeout: 120000 });
    return { ok: true, report: JSON.parse(raw), error: '' };
  } catch (error) {
    // Exit 1 significa achados, não falha do auditor. stdout ainda é a prova.
    const stdout = String(error?.stdout || '');
    if (stdout.trim()) {
      try { return { ok: true, report: JSON.parse(stdout), error: '' }; } catch {}
    }
    return { ok: false, report: null, error: `AUTONOMY_AUDIT_FAILED:${String(error?.message || error).slice(0, 200)}` };
  }
}

function finding(id, severity, area, title, evidence, autofix = false) {
  return { id, severity, area, title, evidence, autofix };
}

const endpointResults = await Promise.all(ENDPOINTS.map(checkEndpoint));
const workflows = workflowFailures();
const autonomy = autonomyAudit();
const findings = [];

for (const result of endpointResults) {
  if (!result.ok) {
    findings.push(finding(
      `SENT-ENDPOINT-${hash(result.url).slice(0, 10)}`,
      result.status === 0 ? 'p1' : 'p2',
      'endpoints',
      `${result.name} indisponível`,
      `status=${result.status};latency_ms=${result.latency_ms};error=${result.error || '-'}`,
    ));
  }
  if (result.ok && result.url.includes('mcp.centralldark.com') && !result.cors) {
    findings.push(finding(
      `SENT-CORS-${hash(result.url).slice(0, 10)}`,
      'p2', 'cors', `${result.name} sem CORS`,
      'resposta saudável sem access-control-allow-origin',
    ));
  }
}

if (!workflows.ok) {
  findings.push(finding('SENT-GITHUB-ACTIONS-UNPROVEN', 'p1', 'workflows', 'Consulta de workflows falhou', workflows.error));
} else {
  for (const row of workflows.rows) {
    findings.push(finding(
      `SENT-WORKFLOW-${row.databaseId}`,
      'p2', 'workflows', `Workflow vermelho: ${row.name}`,
      `run_id=${row.databaseId};branch=${row.headBranch};url=${row.url || ''}`,
    ));
  }
}

if (!autonomy.ok) {
  findings.push(finding('SENT-AUTONOMY-UNPROVEN', 'p1', 'autonomia', 'Auditoria de autonomia não executou', autonomy.error));
} else {
  for (const item of autonomy.report.findings || []) {
    findings.push(finding(item.id, item.severity === 'blocker' ? 'p1' : 'p3', 'autonomia', item.title, `${item.path}:${item.evidence}`, Boolean(item.autofix)));
  }
}

findings.sort((a, b) => a.id.localeCompare(b.id));
const stable = {
  schema: 2,
  repository: REPO,
  summary: {
    endpoints_checked: endpointResults.length,
    endpoints_failed: endpointResults.filter((item) => !item.ok).length,
    workflow_failures_24h: workflows.rows.length,
    findings: findings.length,
    autofix_candidates: findings.filter((item) => item.autofix).length,
  },
  endpoints: endpointResults,
  workflow_query_ok: workflows.ok,
  autonomy_audit_ok: autonomy.ok,
  findings,
};
stable.evidence_sha256 = hash(canonical(stable));
const report = { ...stable, generated_at_utc: new Date().toISOString(), github_run_id: process.env.GITHUB_RUN_ID || '' };

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(JSON_FILE, `${JSON.stringify(report, null, 2)}\n`);
const markdown = [
  '# Sentinela', '',
  `- Evidência SHA-256: \`${report.evidence_sha256}\``,
  `- Endpoints com falha: **${report.summary.endpoints_failed}**`,
  `- Workflows vermelhos em 24h: **${report.summary.workflow_failures_24h}**`,
  `- Achados totais: **${report.summary.findings}**`,
  `- Candidatos a auto-fix: **${report.summary.autofix_candidates}**`, '',
  '| ID | Prioridade | Área | Achado | Auto-fix |',
  '|---|---|---|---|---|',
  ...(findings.length
    ? findings.map((item) => `| \`${item.id}\` | ${item.severity} | ${item.area} | ${item.title} | ${item.autofix ? 'sim' : 'não'} |`)
    : ['| _nenhum_ | - | - | Nenhum achado dentro do escopo auditado | - |']),
  '',
  '> Ausência de achado não prova componentes fora do escopo. Falha de coleta vira achado p1.',
].join('\n');
writeFileSync(MARKDOWN_FILE, `${markdown}\n`);
console.log(JSON.stringify({ summary: report.summary, evidence_sha256: report.evidence_sha256 }));
process.exitCode = findings.length ? 1 : 0;
