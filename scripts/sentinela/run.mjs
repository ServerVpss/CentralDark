#!/usr/bin/env node
// Sentinela 24/7 — detecta divergências e só reage a mudança real de estado.
// Read-only no repo/VPS; mutações ficam restritas a Issues operacionais deduplicadas.

import { execSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { evaluateDrift, toDivergencia, describeRecovery } from './drift.mjs';
import { reconcileFindingState } from './state-machine.mjs';
import { notifyViaHermes } from './hermes-notify.mjs';

const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const SNAPSHOT_DIR = 'docs/sentinela';
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');
const REPORT_FILE = path.join(SNAPSHOT_DIR, 'last-report.md');

mkdirSync(SNAPSHOT_DIR, { recursive: true });

const previousSnapshot = existsSync(SNAPSHOT_FILE)
  ? JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'))
  : null;

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health', bot: 'grok' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json', bot: 'grok' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json', bot: 'codex' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json', bot: 'claude' },
  { name: 'Painel', url: 'https://status.centralldark.com/', bot: 'claude' },
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

function ghListOpenSentinelaIssues() {
  try {
    const out = execFileSync('gh', [
      'issue', 'list', '-R', REPO,
      '--state', 'open',
      '--search', 'sentinela- in:title',
      '--json', 'number,title,labels',
      '--limit', '500',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true, issues: JSON.parse(out) };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

function ghAvailableLabels() {
  try {
    const out = execFileSync('gh', [
      'label', 'list', '-R', REPO,
      '--json', 'name',
      '--limit', '500',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return new Set(JSON.parse(out).map((item) => String(item.name || '')));
  } catch {
    return new Set();
  }
}

const AGENT_LABEL = {
  chatgpt: '🧠 AGENTE-CHATGPT',
  claude: '🧠 AGENTE-CLAUDE',
  codex: '🧠 AGENTE-CODEX',
  grok: '🧠 AGENTE-GROK',
  lovable: '🧠 AGENTE-LOVABLE',
  'supabase-bot': '🧠 AGENTE-SUPABASE',
};

const PRIORITY_LABEL = {
  p1: '🔴 PRIORIDADE-ALTA',
  p2: '🟡 PRIORIDADE-MÉDIA',
  p3: '🟢 PRIORIDADE-BAIXA',
};

function canonicalLabelsForFinding(finding, availableLabels) {
  const desired = [
    '🛡️ SENTINELA',
    '🤖 AUTO',
    PRIORITY_LABEL[finding?.sev],
    AGENT_LABEL[finding?.bot],
  ];
  if (finding?.area === 'Workflows' || finding?.area === 'Drift-VPS') {
    desired.push('🔄 GIT');
  }
  return [...new Set(desired.filter(Boolean))].filter((label) => availableLabels.has(label));
}

function ghOpenIssue({ title, body, labels }) {
  if (DRY_RUN) return { number: 0, dry: true };
  const tmpBody = path.join('/tmp', `sent-${process.pid}-${Date.now()}.md`);
  writeFileSync(tmpBody, body);
  try {
    const args = ['issue', 'create', '-R', REPO, '--title', title, '--body-file', tmpBody];
    for (const label of labels) args.push('--label', label);
    const out = execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const match = out.match(/\/issues\/(\d+)/);
    return { number: match ? Number(match[1]) : 0, url: out.trim() };
  } catch (e) {
    return { error: String(e.message || e) };
  } finally {
    try { rmSync(tmpBody, { force: true }); } catch {}
  }
}

function ghCloseIssue(number, comment) {
  if (DRY_RUN) return { ok: true, dry: true };
  try {
    execFileSync('gh', [
      'issue', 'close', String(number), '-R', REPO,
      '--comment', comment,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e.message || e) };
  }
}

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
  } catch {
    return 0;
  }
}

function realGit(args) {
  return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

function checkVpsDrift() {
  const repoPath = process.env.VPS_REPO_PATH || '';
  if (!repoPath) {
    return {
      status: 'ERROR',
      code: 'CAMINHO_AUSENTE',
      motivo: 'VPS_REPO_PATH (secrets.CENTRALDARK_ROOT) ausente no runner — falhando fechado, sem adivinhar caminho',
      at: new Date().toISOString(),
      repository: REPO,
    };
  }
  return evaluateDrift({ repoPath, expectedRepo: REPO, branch: 'main', git: realGit });
}

const endpointsResult = await checkEndpoints();
const wfCount = await checkWorkflowsRuins();
const driftEvidence = checkVpsDrift();
const driftDivergencia = toDivergencia(driftEvidence);
if (driftDivergencia) divergencias.push(driftDivergencia);
const recoveryNote = describeRecovery(previousSnapshot, driftEvidence);

const snapshot = {
  at: new Date().toISOString(),
  endpoints: endpointsResult,
  workflowsFailures24h: wfCount,
  vpsDrift: driftEvidence,
  divergencias: divergencias.length,
};
writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));

const issueInventory = ghListOpenSentinelaIssues();
if (!issueInventory.ok) {
  const report = `# Sentinela — ${snapshot.at}\n\nSTATUS=BLOCKED\nREASON=ISSUE_INVENTORY_UNAVAILABLE\n\nNenhuma Issue foi criada/fechada e nenhum Telegram foi enviado porque o inventário de Issues Sentinela abertas não pôde ser lido.\n`;
  writeFileSync(REPORT_FILE, report);
  console.error('Sentinela bloqueada: não foi possível ler Issues abertas; nenhuma mutação executada.');
  process.exitCode = 2;
} else {
  const transitions = reconcileFindingState({ findings: divergencias, openIssues: issueInventory.issues });
  const availableLabels = ghAvailableLabels();
  const eventos = [];

  for (const item of transitions.create) {
    const d = item.finding;
    const title = `[SENTINELA sentinela-${item.id}] ${d.area}: ${d.titulo}`;
    const body = `> Aberta automaticamente pela **Sentinela** (run ${process.env.GITHUB_RUN_ID || 'local'}).\n> ID determinístico: \`sentinela-${item.id}\`.\n\n## Área\n${d.area}\n\n## Severidade\n${d.sev}\n\n## Agente sugerido\n\`${d.bot || 'não definido'}\`\n\n## Detalhe sanitizado\n\`\`\`\n${d.detalhe}\n\`\`\`\n\n## Critério para fechar\n- condição deixa de existir na próxima medição determinística;\n- recuperação é registrada antes do fechamento;\n- ausência de mudança mantém silêncio.\n\n---\n_A Sentinela detecta; Hermes explica/notifica; IA é opcional para diagnóstico/refino._\n`;
    const created = ghOpenIssue({
      title,
      body,
      labels: canonicalLabelsForFinding(d, availableLabels),
    });

    let notify = { status: DRY_RUN ? 'DRY_RUN' : 'NOT_SENT' };
    if (created.number > 0 && !DRY_RUN) {
      notify = notifyViaHermes({
        type: 'ALERT',
        area: d.area,
        title: d.titulo,
        issueNumber: created.number,
        url: created.url || `https://github.com/${REPO}/issues/${created.number}`,
      });
    }
    eventos.push({ type: 'ALERT', id: item.id, issue: created.number || 0, error: created.error || null, notify: notify.status });
  }

  for (const item of transitions.keep) {
    eventos.push({ type: 'KEEP', id: item.id, issue: item.issue.number, notify: 'SILENT' });
  }

  for (const item of transitions.recover) {
    const closed = ghCloseIssue(
      item.issue.number,
      `🟢 **RECUPERAÇÃO SENTINELA**\n\nA condição \`sentinela-${item.id}\` não está mais presente na medição atual. Fechamento por transição real de estado; se voltar, um novo ALERT poderá ser emitido.`
    );
    let notify = { status: DRY_RUN ? 'DRY_RUN' : (item.issue.canonicalProducer ? 'NOT_SENT' : 'SILENT_LEGACY_BOOTSTRAP') };
    if (closed.ok && !DRY_RUN && item.issue.canonicalProducer) {
      notify = notifyViaHermes({
        type: 'RECOVERY',
        area: 'Sentinela',
        title: item.issue.title,
        issueNumber: item.issue.number,
        url: `https://github.com/${REPO}/issues/${item.issue.number}`,
      });
    }
    eventos.push({ type: 'RECOVERY', id: item.id, issue: item.issue.number, error: closed.error || null, notify: notify.status });
  }

  for (const item of transitions.duplicates) {
    const closed = ghCloseIssue(
      item.duplicate.number,
      `♻️ Duplicata determinística de #${item.canonical.number} (mesmo \`sentinela-${item.id}\`). Mantida a Issue mais antiga como canônica.`
    );
    eventos.push({
      type: 'DUPLICATE_OPEN',
      id: item.id,
      issue: item.duplicate.number,
      canonical: item.canonical.number,
      error: closed.error || null,
      notify: 'SILENT',
    });
  }

  const counts = {
    alerts: eventos.filter((e) => e.type === 'ALERT' && e.issue > 0).length,
    keep: eventos.filter((e) => e.type === 'KEEP').length,
    recoveries: eventos.filter((e) => e.type === 'RECOVERY' && !e.error).length,
    duplicatesClosed: eventos.filter((e) => e.type === 'DUPLICATE_OPEN' && !e.error).length,
    telegramSent: eventos.filter((e) => e.notify === 'SENT').length,
    telegramUnavailable: eventos.filter((e) => e.notify === 'UNAVAILABLE').length,
    telegramFailed: eventos.filter((e) => e.notify === 'FAILED' || e.notify === 'UNKNOWN').length,
    legacyRecoveriesSilent: eventos.filter((e) => e.type === 'RECOVERY' && e.notify === 'SILENT_LEGACY_BOOTSTRAP').length,
  };

  const report = `# Sentinela — ${snapshot.at}\n\n| Métrica | Valor |\n|---|---|\n| Endpoints checados | ${endpointsResult.length} |\n| Endpoints fora | ${endpointsResult.filter((r) => r.status < 200 || r.status >= 400).length} |\n| Workflows vermelhos 24h | ${wfCount} |\n| Divergências atuais | ${divergencias.length} |\n| ALERT novos | ${counts.alerts} |\n| KEEP silenciosos | ${counts.keep} |\n| RECOVERY | ${counts.recoveries} |\n| Duplicatas fechadas | ${counts.duplicatesClosed} |\n| Telegram SENT | ${counts.telegramSent} |\n| Telegram UNAVAILABLE | ${counts.telegramUnavailable} |\n| Telegram FAILED/UNKNOWN | ${counts.telegramFailed} |\n| Recovery legado silencioso | ${counts.legacyRecoveriesSilent} |\n| Dry-run? | ${DRY_RUN ? 'sim' : 'não'} |\n\n## Endpoints\n\n${endpointsResult.map((r) => `- ${r.status >= 200 && r.status < 400 ? '🟢' : '🔴'} **${r.name}** — \`${r.status}\` em ${r.latencyMs}ms${r.cors ? ` · CORS=\`${r.cors}\`` : ''}${r.error ? ` · erro: ${r.error}` : ''}`).join('\n')}\n\n## Divergências atuais\n\n${divergencias.length === 0 ? '_Nenhuma divergência._' : divergencias.map((d) => `- **[${d.sev}]** ${d.area} → ${d.titulo} (agente sugerido: \`${d.bot}\`)`).join('\n')}\n\n## Drift GitHub <-> VPS\n\n- Status: \`${driftEvidence.status}\` (${driftEvidence.code})\n- ${driftEvidence.motivo}\n${recoveryNote ? `- ${recoveryNote}` : ''}\n`;
  writeFileSync(REPORT_FILE, report);

  console.log(`Sentinela rodou. ALERT=${counts.alerts} KEEP=${counts.keep} RECOVERY=${counts.recoveries} DUPLICATE_CLOSED=${counts.duplicatesClosed} TELEGRAM_SENT=${counts.telegramSent}.`);
}
