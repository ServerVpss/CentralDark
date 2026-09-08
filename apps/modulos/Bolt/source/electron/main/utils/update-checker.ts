import { createHash } from 'node:crypto';
import { appendFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { app } from 'electron';
import path from 'node:path';

export type UpdateCheckpointStatus = 'PROVED' | 'BROKEN' | 'BLOCKED' | 'UNKNOWN';

export type UpdateCheckpoint = {
  phase: string;
  status: UpdateCheckpointStatus;
  currentVersion?: string;
  targetVersion?: string;
  detail?: string;
};

const redact = (value = '') =>
  String(value).replace(
    /(token|password|authorization|apikey|api_key|secret|bearer|client_secret|refresh_token)([=: ]+)([^\s"']+)/gi,
    '$1$2***OCULTO***',
  );

function paths() {
  const dir = path.join(app.getPath('userData'), 'checker');
  return {
    dir,
    ledger: path.join(dir, 'update-checkpoints.jsonl'),
    pending: path.join(dir, 'pending-update.json'),
  };
}

export async function recordUpdateCheckpoint(checkpoint: UpdateCheckpoint) {
  const p = paths();
  await mkdir(p.dir, { recursive: true });
  const safeDetail = checkpoint.detail ? redact(checkpoint.detail) : undefined;
  const evidenceDigest = createHash('sha256')
    .update(JSON.stringify({ ...checkpoint, detail: safeDetail }))
    .digest('hex');
  const record = {
    schema: 'centraldark.desktop-update-checker.v1',
    observed_at: new Date().toISOString(),
    ...checkpoint,
    detail: safeDetail,
    evidence_digest: evidenceDigest,
    action_is_proof: false,
    unknown_is_not_pass: true,
    delta_util_applied: true,
    previous_flow_continues: true,
  };
  await appendFile(p.ledger, `${JSON.stringify(record)}\n`, 'utf8');
  return record;
}

export async function markPendingUpdate(currentVersion: string, targetVersion: string) {
  const p = paths();
  await mkdir(p.dir, { recursive: true });
  const payload = {
    schema: 'centraldark.desktop-pending-update.v1',
    currentVersion,
    targetVersion,
    createdAt: new Date().toISOString(),
  };
  await writeFile(p.pending, JSON.stringify(payload), 'utf8');
  return recordUpdateCheckpoint({
    phase: 'PRE_INSTALL',
    status: 'PROVED',
    currentVersion,
    targetVersion,
    detail: 'checkpoint persistido antes de quitAndInstall',
  });
}

export async function reconcilePendingUpdateCheckpoint(currentVersion: string) {
  const p = paths();
  try {
    const raw = await readFile(p.pending, 'utf8');
    const pending = JSON.parse(raw) as { targetVersion?: string; currentVersion?: string };
    const targetVersion = pending.targetVersion || '';
    if (!targetVersion) {
      await recordUpdateCheckpoint({
        phase: 'POST_UPDATE',
        status: 'BROKEN',
        currentVersion,
        detail: 'pending update sem targetVersion',
      });
      return;
    }
    if (currentVersion === targetVersion) {
      await recordUpdateCheckpoint({
        phase: 'POST_UPDATE',
        status: 'PROVED',
        currentVersion,
        targetVersion,
        detail: 'versão reiniciada corresponde ao alvo persistido',
      });
      await rm(p.pending, { force: true });
    } else {
      await recordUpdateCheckpoint({
        phase: 'POST_UPDATE',
        status: 'UNKNOWN',
        currentVersion,
        targetVersion,
        detail: 'aplicação reiniciou sem provar versão alvo; não declarar verde',
      });
    }
  } catch (error: any) {
    if (error?.code === 'ENOENT') return;
    await recordUpdateCheckpoint({
      phase: 'POST_UPDATE',
      status: 'BLOCKED',
      currentVersion,
      detail: error?.message || String(error),
    });
  }
}
