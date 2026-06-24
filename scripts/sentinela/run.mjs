#!/usr/bin/env node
// Sentinela 24/7 — varre divergências e abre Issues com dedupe.
// Read-only no repo/VPS (não toca em produção). Usa apenas HTTPS público + gh CLI.

import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const SNAPSHOT_DIR = 'docs/sentinela';
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');
const REPORT_FILE = path.join(SNAPSHOT_DIR, 'last-report.md');

mkdirSync(SNAPSHOT_DIR, { recursive: true });

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health', bot: 'grok' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json', bot: 'grok' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json', bot: 'codex' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json', bot: 'lovable' },
  { name: 'Painel', url: 'https://status.centralldark.com/', bot: 'lovable' },
  { name: 'API', url: 'https://api.centralldark.com/health', bot: 'codex' },
];

const divergencias = [];

async function checkEndpoint(ep) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(ep.url, { signal: ctrl.signal });
    clearTimeout(to);
    const dt = Date.now() - t0;
    const cors = r.headers.get('access-control-allow-origin');
    return { ...ep, status: r.status, latencyMs: dt, cors };
  } catch (e) {
    return { ...ep, status: 0, latencyMs: Date.now() - t0, error: String(e.message || e) };
  }
}

function hash(s) {
  return createHash('sha1').update(s).digest('hex').slice(0, 10);
}

function ghIssueExists(titleHash) {
  try {
    const out = execSync(
      `gh issue list -R "${REPO}" --state open --search "in:title sentinela-${titleHash}" --json number,title --limit 5`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    return arr.find((i) => i.title.includes(titleHash));
  } catch {
    return null;
  }
}

function ghOpenIssue({ title, body, labels }) {
  if (DRY_RUN) return { number: 0, dry: true };
  const labelArgs = labels.map((l) => `--label "${l}"`).join(' ');
  const tmpBody = path.join('/tmp', `sent-${Date.now()}.md`);
  writeFileSync(tmpBody, body);
  try {
    const out = execSync(
      `gh issue create -R "${REPO}" --title "${title.replace(/"/g, '\\"')}" --body-file "${tmpBody}" ${labelArgs}`,
      { encoding: 'utf8' }
    );
    const m = out.match(/\/issues\/(\d+)/);
    return { number: m ? Number(m[1]) : 0 };
  } catch (e) {
    return { error: String(e.message || e) };
  }
}

function ensureLabels() {
  if (DRY_RUN) return;
  const labels = [
    ['sentinela', 'B60205', 'Aberta automaticamente pela sentinela'],
    ['auto', 'CCCCCC', 'Criada por bot'],
    ['p1', 'FF0000', 'Alta prioridade'],
    ['p2', 'FFA500', 'Média'],
    ['p3', 'FFFF00', 'Baixa'],
    ['assign:codex', '5319E7', 'Bot responsável: Codex'],
    ['assign:supabase-bot', '3ECF8E', 'Bot responsável: Supabase'],
    ['assign:lovable', 'FF80B0', 'Bot responsável: Lovable'],
    ['assign:grok', '1F6FEB', 'Bot responsável: Grok'],
    ['assign:chatgpt', '10A37F', 'Bot responsável: ChatGPT'],
    ['stale', '6E6E6E', 'Passou do TTL'],
  ];
  for (const [name, color, desc] of labels) {
    try {
      execSync(`gh label create "${name}" -R "${REPO}" -c "${color}" -d "${desc}" --force`, { stdio: 'ignore' });
    } catch {}
  }
}

// === Checks ===

async function checkEndpoints() {
  const out = await Promise.all(ENDPOINTS.map(checkEndpoint));
  for (const r of out) {
    if (r.status >= 200 && r.status < 400) continue;
    divergencias.push({
      area: 'Endpoints',
      bot: r.bot,
      sev: r.status === 0 ? 'p1' : 'p2',
      titulo: `Endpoint ${r.name} fora do ar (HTTP ${r.status})`,
      detalhe: `URL: ${r.url}\nStatus: ${r.status}\nLatência: ${r.latencyMs}ms\nErro: ${r.error || '-'}`,
    });
  }
  // CORS check
  for (const r of out) {
    if (r.url.includes('mcp.centralldark.com') && r.status >= 200 && r.status < 400 && !r.cors) {
      divergencias.push({
        area: 'CORS',
        bot: 'grok',
        sev: 'p2',
        titulo: `MCP sem CORS no painel: ${r.name}`,
        detalhe: `${r.url} responde 200 mas não envia Access-Control-Allow-Origin. O painel status.centralldark.com não consegue ler.`,
      });
    }
  }
  return out;
}

async function checkWorkflowsRuins() {
  try {
    const out = execSync(
      `gh run list -R "${REPO}" --status failure --created ">=$(date -u -d '-24 hours' +%Y-%m-%dT%H:%M:%SZ)" --json name,databaseId,conclusion,headBranch --limit 20`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    for (const r of arr) {
      divergencias.push({
        area: 'Workflows',
        bot: 'codex',
        sev: 'p2',
        titulo: `Workflow vermelho: ${r.name}`,
        detalhe: `Run ID: ${r.databaseId}\nBranch: ${r.headBranch}\nLink: https://github.com/${REPO}/actions/runs/${r.databaseId}`,
      });
    }
    return arr.length;
  } catch (e) {
    return 0;
  }
}

// === Run ===

ensureLabels();
const endpointsResult = await checkEndpoints();
const wfCount = await checkWorkflowsRuins();

// Snapshot
const snapshot = {
  at: new Date().toISOString(),
  endpoints: endpointsResult,
  workflowsFailures24h: wfCount,
  divergencias: divergencias.length,
};
writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));

// Abrir issues com dedupe
const abertas = [];
for (const d of divergencias) {
  const h = hash(`${d.area}|${d.titulo}`);
  const title = `[SENTINELA sentinela-${h}] ${d.area}: ${d.titulo}`;
  const existing = ghIssueExists(h);
  if (existing) {
    abertas.push({ ...d, hash: h, ja: existing.number });
    continue;
  }
  const body = `> Aberta automaticamente pela **sentinela** (run ${process.env.GITHUB_RUN_ID || 'local'}).
> Hash de dedupe: \`sentinela-${h}\` — não reabre se já existir.

## Área
${d.area}

## Severidade
${d.sev}

## Bot responsável
\`assign:${d.bot}\`

## Detalhe (sanitizado)
\`\`\`
${d.detalhe}
\`\`\`

## Critério pra fechar
- Endpoint volta 200 / workflow verde / CORS configurado / pendência registrada.
- Bot dono comenta com PR ou justificativa.
- Após 7 dias sem ação, sentinela-stale escala.

---
_Anti-loop: só o bot com label \`assign:${d.bot}\` deve agir._
`;
  const labels = ['sentinela', 'auto', d.sev, `assign:${d.bot}`];
  const r = ghOpenIssue({ title, body, labels });
  abertas.push({ ...d, hash: h, nova: r.number, erro: r.error });
}

// Relatório
const report = `# Sentinela — ${snapshot.at}

| Métrica | Valor |
|---|---|
| Endpoints checados | ${endpointsResult.length} |
| Endpoints fora | ${endpointsResult.filter((r) => r.status < 200 || r.status >= 400).length} |
| Workflows vermelhos 24h | ${wfCount} |
| Divergências detectadas | ${divergencias.length} |
| Issues novas | ${abertas.filter((a) => a.nova).length} |
| Issues já abertas (dedupe) | ${abertas.filter((a) => a.ja).length} |
| Dry-run? | ${DRY_RUN ? 'sim' : 'não'} |

## Endpoints

${endpointsResult.map((r) => `- ${r.status >= 200 && r.status < 400 ? '🟢' : '🔴'} **${r.name}** — \`${r.status}\` em ${r.latencyMs}ms${r.cors ? ` · CORS=\`${r.cors}\`` : ''}${r.error ? ` · erro: ${r.error}` : ''}`).join('\n')}

## Divergências

${divergencias.length === 0 ? '_Nenhuma divergência. Tudo verde._' : divergencias.map((d, i) => `- **[${d.sev}]** ${d.area} → ${d.titulo} (bot: \`${d.bot}\`)`).join('\n')}
`;
writeFileSync(REPORT_FILE, report);

console.log(`Sentinela rodou. Divergências: ${divergencias.length}. Issues novas: ${abertas.filter((a) => a.nova).length}.`);
