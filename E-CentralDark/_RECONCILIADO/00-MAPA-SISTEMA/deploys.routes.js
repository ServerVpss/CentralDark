// Rotas /deploys/* — listar histórico de deploys e disparar rollback manual.
// Protegidas pelo mesmo Bearer token do gateway. Lê /var/log/multizap-deploys.jsonl.

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const auth = require('../middlewares/authMiddleware');
const { ok, fail } = require('../utils/response');

const DEPLOY_LOG = process.env.MULTIZAP_DEPLOY_LOG || '/var/log/multizap-deploys.jsonl';
const LAST_GOOD = process.env.MULTIZAP_LAST_GOOD_FILE || '/var/lib/multizap/last-good-commit';
const PULL_SCRIPT = process.env.MULTIZAP_PULL_SCRIPT || '/usr/local/bin/multizap-gh-pull';
const ROLLBACK_LOCK = '/tmp/multizap-rollback.lock';

// GET /deploys/list?limit=50 — últimos N deploys (mais recente primeiro)
router.get('/list', auth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '50', 10) || 50, 200);
  try {
    if (!fs.existsSync(DEPLOY_LOG)) {
      return ok(res, { deploys: [], current_commit: readCurrentCommit(), log_path: DEPLOY_LOG });
    }
    const raw = fs.readFileSync(DEPLOY_LOG, 'utf8');
    const lines = raw.split('\n').filter(Boolean);
    const deploys = lines
      .slice(-limit)
      .reverse()
      .map((line, idx) => {
        try {
          return JSON.parse(line);
        } catch {
          return { id: `parse_error_${idx}`, status: 'parse_error', raw: line.slice(0, 200) };
        }
      });
    return ok(res, {
      deploys,
      current_commit: readCurrentCommit(),
      last_good_commit: readLastGood(),
      log_path: DEPLOY_LOG,
    });
  } catch (err) {
    return fail(res, 'read_log_failed', err.message || 'Falha lendo log de deploys', 500);
  }
});

// GET /deploys/status — versão atual + uptime + saúde
router.get('/status', auth, async (_req, res) => {
  try {
    const startedAt = process.env.MULTIZAP_STARTED_AT || null;
    return ok(res, {
      current_commit: readCurrentCommit(),
      last_good_commit: readLastGood(),
      gateway_started_at: startedAt,
      uptime_s: Math.floor(process.uptime()),
      pid: process.pid,
    });
  } catch (err) {
    return fail(res, 'status_failed', err.message, 500);
  }
});

// POST /deploys/rollback  body: { commit: "abc123" }
router.post('/rollback', auth, (req, res) => {
  const commit = String(req.body?.commit || '').trim();
  if (!/^[a-f0-9]{7,40}$/i.test(commit)) {
    return fail(res, 'bad_commit', 'Commit hash inválido (esperado 7-40 hex chars)', 400);
  }
  if (fs.existsSync(ROLLBACK_LOCK)) {
    return fail(res, 'rollback_in_progress', 'Outro rollback já está rodando', 409);
  }
  try {
    fs.writeFileSync(ROLLBACK_LOCK, String(Date.now()));
    setTimeout(() => { try { fs.unlinkSync(ROLLBACK_LOCK); } catch {} }, 5 * 60 * 1000);

    // dispara o script de pull com env MULTIZAP_FORCE_COMMIT — versão simplificada:
    // chama git reset no repo + restart. Reaproveita o pull script com env extra.
    const child = spawn('bash', ['-c', `MULTIZAP_FORCE_COMMIT="${commit}" "${PULL_SCRIPT}"`], {
      detached: true,
      stdio: 'ignore',
      env: { ...process.env, MULTIZAP_FORCE_COMMIT: commit },
    });
    child.unref();
    return ok(res, { queued: true, commit, message: 'Rollback disparado. Acompanhe em /deploys/list.' });
  } catch (err) {
    try { fs.unlinkSync(ROLLBACK_LOCK); } catch {}
    return fail(res, 'rollback_failed', err.message, 500);
  }
});

function readCurrentCommit() {
  // tenta ler do repo clonado
  const candidates = [
    '/root/Multizap-repo/.git/HEAD',
  ];
  for (const head of candidates) {
    try {
      const ref = fs.readFileSync(head, 'utf8').trim();
      if (ref.startsWith('ref:')) {
        const refPath = ref.replace('ref: ', '');
        const fullPath = path.join(path.dirname(head), refPath);
        return fs.readFileSync(fullPath, 'utf8').trim();
      }
      return ref;
    } catch {}
  }
  return null;
}

function readLastGood() {
  try {
    return fs.readFileSync(LAST_GOOD, 'utf8').trim();
  } catch {
    return null;
  }
}

module.exports = router;
