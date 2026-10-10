#!/usr/bin/env node
// Sentinela 24/7 — varre divergências e abre Issues com dedupe.
// Read-only no repo/VPS (não toca em produção). Usa apenas HTTPS público + gh CLI.
// Labels são consumidas do catálogo canônico; este script nunca recria aliases legados.

import { execSync, execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { evaluateDrift, toDivergencia, describeRecovery } from './drift.mjs';

const DRY_RUN = String(process.env.DRY_RUN || 'false').toLowerCase() === 'true';
const REPO = process.env.REPO_ALVO || 'ServerVpss/CentralDark';
const SNAPSHOT_DIR = 'docs/sentinela';
const SNAPSHOT_FILE = path.join(SNAPSHOT_DIR, 'last-snapshot.json');
const REPORT_FILE = path.join(SNAPSHOT_DIR, 'last-report.md');
const SYSTEM_SENTINEL = path.resolve('scripts/trigger-fabric/system_sentinel.py');
const SYSTEM_SENTINEL_CONTRACT = path.resolve('docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/SYSTEM-SENTINEL.yml');
const RUN_T0 = new Date().toISOString();

const CANONICAL = Object.freeze({
  sentinela: '🛡️ SENTINELA',
  auto: '🤖 AUTO',
  p1: '🔴 PRIORIDADE-ALTA',
  p2: '🟡 PRIORIDADE-MÉDIA',
  p3: '🟢 PRIORIDADE-BAIXA',
  stale: '🧊 PARADO',
  codex: '🧠 AGENTE-CODEX',
  supabase: '🧠 AGENTE-SUPABASE',
  claude: '🧠 AGENTE-CLAUDE',
  grok: '🧠 AGENTE-GROK',
  chatgpt: '🧠 AGENTE-CHATGPT',
});

function severityLabel(sev) {
  return CANONICAL[sev] || CANONICAL.p2;
}

function agentLabel(bot) {
  return CANONICAL[String(bot || '').toLowerCase()] || CANONICAL.codex;
}

mkdirSync(SNAPSHOT_DIR, { recursive: true });

const previousSnapshot = existsSync(SNAPSHOT_FILE)
  ? JSON.parse(readFileSync(SNAPSHOT_FILE, 'utf8'))
  : null;

const ENDPOINTS = [
  { name: 'MCP health', url: 'https://mcp.centralldark.com/health', expectedStatus: 200, bot: 'grok' },
  { name: 'MCP status', url: 'https://mcp.centralldark.com/status.json', expectedStatus: 200, bot: 'grok' },
  { name: 'MCP tools', url: 'https://mcp.centralldark.com/tools.json', expectedStatus: 200, bot: 'codex' },
  { name: 'Install status', url: 'https://install.centralldark.com/status.json', expectedStatus: 200, bot: 'claude' },
  { name: 'Painel', url: 'https://status.centralldark.com/', expectedStatus: 200, bot: 'claude' },
  { name: 'API', url: 'https://api.centralldark.com/health', expectedStatus: 200, bot: 'codex' },
];

const divergencias = [];

async function checkEndpoint(ep) {
  const t0 = Date.now();
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(ep.url, { signal: ctrl.signal, redirect: 'manual' });
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

function sha256(s) {
  return createHash('sha256').update(String(s)).digest('hex');
}

function dispatchEventFromEnv() {
  const source = String(process.env.SENTINEL_API_SOURCE || '').trim();
  if (!source) return null;
  return {
    source_surface: source,
    event_class: String(process.env.SENTINEL_API_EVENT_CLASS || 'STATE_CHANGED').trim(),
    state: String(process.env.SENTINEL_API_STATE || 'STATE_CHANGED').trim(),
    target: String(process.env.SENTINEL_API_TARGET || '').trim(),
    owner: String(process.env.SENTINEL_API_OWNER || '').trim(),
    head_sha: String(process.env.SENTINEL_API_HEAD_SHA || '').trim(),
    evidence_ref: String(process.env.SENTINEL_API_EVIDENCE_REF || '').trim(),
    next_cursor: String(process.env.SENTINEL_API_NEXT_CURSOR || '').trim(),
  };
}

function runFixedRoute(payload) {
  const stdout = execFileSync(
    'python3',
    [SYSTEM_SENTINEL, '--route-json', JSON.stringify(payload)],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
      maxBuffer: 2 * 1024 * 1024,
    },
  );
  return JSON.parse(stdout);
}

function ghIssueExists(titleHash) {
  try {
    const out = execSync(
      `gh issue list -R "${REPO}" --state open --json number,title --limit 1000`,
      { encoding: 'utf8' }
    );
    const arr = JSON.parse(out);
    return arr.find((i) => i.title.includes(`sentinela-${titleHash}`));
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

// === Checks ===

async function checkEndpoints() {
  const out = await Promise.all(ENDPOINTS.map(checkEndpoint));
  for (const r of out) {
    if (r.status === r.expectedStatus) continue;
    divergencias.push({
      area: 'Endpoints',
      bot: r.bot,
      sev: r.status === 0 ? 'p1' : 'p2',
      titulo: `Endpoint ${r.name} fora do ar (HTTP ${r.status})`,
      detalhe: `URL: ${r.url}\nEsperado: HTTP ${r.expectedStatus}\nObtido: HTTP ${r.status}\nLatência: ${r.latencyMs}ms\nErro: ${r.error || '-'}`,
    });
  }
  for (const r of out) {
    if (r.url.includes('mcp.centralldark.com') && r.status === r.expectedStatus && !r.cors) {
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

const dispatchEvent = dispatchEventFromEnv();
const contractHash = existsSync(SYSTEM_SENTINEL_CONTRACT)
  ? sha256(readFileSync(SYSTEM_SENTINEL_CONTRACT, 'utf8'))
  : '';
const inputsHash = sha256(JSON.stringify(
  dispatchEvent
    ? { dispatch: dispatchEvent }
    : {
        endpoints: endpointsResult.map((item) => ({
          name: item.name,
          status: item.status,
          cors: item.cors || null,
        })),
        workflowsFailures24h: wfCount,
        drift: {
          status: driftEvidence.status,
          code: driftEvidence.code,
          shaLocal: driftEvidence.shaLocal || null,
          shaOrigin: driftEvidence.shaOrigin || null,
          ahead: driftEvidence.ahead ?? null,
          behind: driftEvidence.behind ?? null,
          dirty: driftEvidence.dirty ?? null,
        },
      },
));
const localFixedPoint = !dispatchEvent && divergencias.length === 0 && driftEvidence.status === 'OK';
const routeInput = {
  source_surface: dispatchEvent?.source_surface || 'SYSTEM_SENTINEL_RUNNER',
  event_class: dispatchEvent?.event_class || (localFixedPoint ? 'FIXED_POINT' : 'STATE_CHANGED'),
  state: dispatchEvent?.state || (localFixedPoint ? 'FIXED_POINT_LOCAL' : 'STATE_CHANGED'),
  target: dispatchEvent?.target || 'CENTRALDARK_SENTINELA',
  owner: dispatchEvent?.owner || 'scripts/sentinela/run.mjs',
  inputs_hash: inputsHash,
  config_hash: contractHash,
  head_sha: dispatchEvent?.head_sha || driftEvidence.shaOrigin || process.env.GITHUB_SHA || '',
  security_boundary: 'SELF_HOSTED_SENTINEL_READ_ONLY_GITHUB_API',
  counterproof: localFixedPoint ? 'PASS' : 'UNKNOWN',
  reality_judge: localFixedPoint ? 'PASS' : 'UNKNOWN',
  t0: RUN_T0,
  t1: new Date().toISOString(),
  evidence_ref: dispatchEvent?.evidence_ref || `sha256:${inputsHash}`,
  next_cursor: dispatchEvent?.next_cursor || (localFixedPoint ? 'WAIT_FOR_MATERIAL_DELTA' : 'REMEASURE_AFFECTED_CHAIN_ONLY'),
  fixed_point_scope: 'SENTINEL_ROUTE_LOCAL',
};

let deterministicRoute;
try {
  deterministicRoute = runFixedRoute(routeInput);
} catch (error) {
  deterministicRoute = {
    schema: 'centraldark.sentinel-fixed-route.v1',
    proof_state: 'NOT_PROVEN',
    decision: 'RUN_DETERMINISTIC_ROUTE',
    reason: 'SENTINEL_KERNEL_ROUTE_FAILED',
    next_cursor: 'REPAIR_SENTINEL_KERNEL_ROUTE',
    error: String(error?.stderr || error?.message || error).slice(0, 1200),
  };
  divergencias.push({
    area: 'Sentinela-Route',
    bot: 'codex',
    sev: 'p1',
    titulo: 'Rota determinística do Sentinela não produziu receipt',
    detalhe: deterministicRoute.error,
  });
}

const snapshot = {
  at: new Date().toISOString(),
  endpoints: endpointsResult,
  workflowsFailures24h: wfCount,
  vpsDrift: driftEvidence,
  apiEvent: dispatchEvent,
  deterministicRoute,
  divergencias: divergencias.length,
};
writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot, null, 2));

const abertas = [];
const seenHashes = new Map();
for (const d of divergencias) {
  const h = hash(`${d.area}|${d.titulo}`);
  const title = `[SENTINELA sentinela-${h}] ${d.area}: ${d.titulo}`;
  const seen = seenHashes.get(h);
  if (seen) {
    abertas.push({ ...d, hash: h, ja: seen });
    continue;
  }
  const existing = ghIssueExists(h);
  if (existing) {
    seenHashes.set(h, existing.number);
    abertas.push({ ...d, hash: h, ja: existing.number });
    continue;
  }

  const agente = agentLabel(d.bot);
  const prioridade = severityLabel(d.sev);
  const body = `> Aberta automaticamente pela **Sentinela** (run ${process.env.GITHUB_RUN_ID || 'local'}).
> Hash de dedupe: \`sentinela-${h}\` — não reabre se já existir.

## Área
${d.area}

## Severidade
${prioridade}

## Capacidade roteada
\`${agente}\`

## Detalhe (sanitizado)
\`\`\`
${d.detalhe}
\`\`\`

## Critério pra fechar
- Endpoint volta 200 / workflow verde / CORS configurado / pendência registrada.
- A capacidade roteada comenta com PR ou justificativa.
- Telemetria transitória não vira autoridade nem Writer permanente.

---
_Anti-loop: atualizar a ferida material existente; label roteia capacidade, não autoridade._
`;
  const labels = [CANONICAL.sentinela, CANONICAL.auto, prioridade, agente];
  const r = ghOpenIssue({ title, body, labels });
  if (r.number) seenHashes.set(h, r.number);
  abertas.push({ ...d, hash: h, nova: r.number, erro: r.error });
}

const report = `# Sentinela — ${snapshot.at}

| Métrica | Valor |
|---|---|
| Endpoints checados | ${endpointsResult.length} |
| Endpoints fora | ${endpointsResult.filter((r) => r.status !== r.expectedStatus).length} |
| Workflows vermelhos 24h | ${wfCount} |
| Divergências detectadas | ${divergencias.length} |
| Issues novas | ${abertas.filter((a) => a.nova).length} |
| Issues já abertas (dedupe) | ${abertas.filter((a) => a.ja).length} |
| Dry-run? | ${DRY_RUN ? 'sim' : 'não'} |

## Endpoints

${endpointsResult.map((r) => `- ${r.status === r.expectedStatus ? '🟢' : '🔴'} **${r.name}** — \`${r.status}\` em ${r.latencyMs}ms${r.cors ? ` · CORS=\`${r.cors}\`` : ''}${r.error ? ` · erro: ${r.error}` : ''}`).join('\n')}

## Divergências

${divergencias.length === 0 ? '_Nenhuma divergência. Tudo verde._' : divergencias.map((d) => `- **[${severityLabel(d.sev)}]** ${d.area} → ${d.titulo} (capacidade: \`${agentLabel(d.bot)}\`)`).join('\n')}

## Drift GitHub <-> VPS

- Status: \`${driftEvidence.status}\` (${driftEvidence.code})
- ${driftEvidence.motivo}
${recoveryNote ? `- ${recoveryNote}` : ''}

## Rota determinística / TIK-TAK

- Decisão: \`${deterministicRoute.decision || 'UNKNOWN'}\`
- Proof state: \`${deterministicRoute.proof_state || 'UNKNOWN'}\`
- Motivo: \`${deterministicRoute.reason || 'UNKNOWN'}\`
- Fingerprint: \`${deterministicRoute.dependency_fingerprint || 'UNKNOWN'}\`
- NEXT_CURSOR: \`${deterministicRoute.next_cursor || 'UNKNOWN'}\`
- API transport: \`${deterministicRoute.api_transport || 'UNKNOWN'}\`
`;
writeFileSync(REPORT_FILE, report);

console.log(`Sentinela rodou. Divergências: ${divergencias.length}. Issues novas: ${abertas.filter((a) => a.nova).length}. Rota: ${deterministicRoute.decision || 'UNKNOWN'}.`);
