import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const defaultManifestPath = path.join(repoRoot, 'docs', 'OPERACAO', 'centraldark-queue-fabric.json');

export function loadQueueFabric(manifestPath = defaultManifestPath) {
  const raw = fs.readFileSync(manifestPath, 'utf8');
  return JSON.parse(raw);
}

export function validateQueueFabric(fabric) {
  const errors = [];
  const requiredInvariants = [
    'QUEUED != PASS',
    'PENDING != PASS',
    'SKIPPED != PASS',
    'CANCELLED != PASS',
    'RERUN_ALL_WHILE_QUEUED=false',
    'SAME_HEAD_REQUIRED=true',
    'VNC_VIEW != PROOF'
  ];

  if (fabric.schema !== 'centraldark.queue-fabric.v1') {
    errors.push('QUEUE_FABRIC_SCHEMA_INVALID');
  }

  if (!Array.isArray(fabric.phases) || fabric.phases.length < 12) {
    errors.push('QUEUE_FABRIC_PHASES_INSUFFICIENT');
  }

  for (const invariant of requiredInvariants) {
    if (!fabric.invariants?.includes(invariant)) {
      errors.push(`QUEUE_FABRIC_MISSING_INVARIANT:${invariant}`);
    }
  }

  const ids = new Set();
  const prefixes = new Set();
  let lastNumber = -1;

  for (const phase of fabric.phases ?? []) {
    if (!/^\d{2}_[A-Z0-9_]+$/.test(phase.id ?? '')) {
      errors.push(`QUEUE_FABRIC_BAD_PHASE_ID:${phase.id}`);
    }

    const phaseNumber = Number(String(phase.id).slice(0, 2));
    if (!Number.isInteger(phaseNumber) || phaseNumber <= lastNumber) {
      errors.push(`QUEUE_FABRIC_PHASE_ORDER_INVALID:${phase.id}`);
    }
    lastNumber = phaseNumber;

    if (!phase.emoji || !phase.name_prefix || !phase.domain || !phase.role) {
      errors.push(`QUEUE_FABRIC_PHASE_INCOMPLETE:${phase.id}`);
    }

    if (ids.has(phase.id)) {
      errors.push(`QUEUE_FABRIC_DUPLICATE_PHASE:${phase.id}`);
    }
    ids.add(phase.id);

    if (prefixes.has(phase.name_prefix)) {
      errors.push(`QUEUE_FABRIC_DUPLICATE_PREFIX:${phase.name_prefix}`);
    }
    prefixes.add(phase.name_prefix);
  }

  return {
    ok: errors.length === 0,
    errors
  };
}

export function classifyCheckName(name, fabric) {
  const text = String(name ?? '').toLowerCase();
  const direct = (fabric.phases ?? []).find((phase) => text.startsWith(String(phase.name_prefix).toLowerCase()));
  if (direct) return direct.id;

  const heuristics = [
    ['label', '01_LABEL_GATE'],
    ['handoff', '02_HANDOFF_CONTRACT'],
    ['title', '03_TEST_CONTRACT'],
    ['horn', '04_HORN_LINE_GATE'],
    ['connector', '05_CONNECTOR_ROUTER'],
    ['codex', '06_CODEX_VALIDATE'],
    ['package', '07_PACKAGE_ARTIFACT'],
    ['pacote', '07_PACKAGE_ARTIFACT'],
    ['deploy', '08_MICRO_DEPLOY'],
    ['site', '09_SITE_HTTP_CHECK'],
    ['casa', '10_CASA_RECEIPT'],
    ['main', '11_MAIN_PROMOTION_GATE'],
    ['dependabot', '12_DEPENDABOT_CONFLICT_RESOLVER'],
    ['conflict', '12_DEPENDABOT_CONFLICT_RESOLVER']
  ];

  const match = heuristics.find(([needle]) => text.includes(needle));
  return match?.[1] ?? 'UNKNOWN_QUEUE_PHASE';
}

export function decideRerunAction({ status, conclusion, headChanged = false }) {
  if (headChanged) return 'DO_NOT_RERUN_OLD_HEAD';
  if (status === 'queued' || status === 'pending' || status === 'in_progress') return 'WAIT';
  if (status === 'completed' && conclusion === 'success') return 'KEEP';
  if (status === 'completed' && (conclusion === 'failure' || conclusion === 'timed_out')) return 'RERUN_FAILED_ONLY_OR_FIX_ROOT_CAUSE';
  if (status === 'completed' && conclusion === 'cancelled') return 'RERUN_FAILED_ONLY_IF_HEAD_STILL_CURRENT';
  if (status === 'completed' && conclusion === 'skipped') return 'SKIPPED_IS_VISIBLE_DEBT_NOT_PASS';
  return 'UNKNOWN';
}

export function summarizeQueueRuns(runs, fabric) {
  return runs.map((run) => ({
    name: run.name,
    phase: classifyCheckName(run.name, fabric),
    status: run.status,
    conclusion: run.conclusion ?? null,
    rerun_action: decideRerunAction(run)
  }));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const fabric = loadQueueFabric(process.argv[2] ?? defaultManifestPath);
  const result = validateQueueFabric(fabric);

  console.log(JSON.stringify({
    tool: 'centraldark-queue-fabric',
    ok: result.ok,
    phase_count: fabric.phases?.length ?? 0,
    errors: result.errors,
    invariants: fabric.invariants
  }, null, 2));

  if (!result.ok) {
    process.exitCode = 1;
  }
}
