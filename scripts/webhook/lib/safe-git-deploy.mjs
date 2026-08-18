// Helper compartilhado de atualização Git para runtime/deploy.
//
// Princípio:
//   FETCH -> OBSERVAR -> COMPARAR -> APLICAR SOMENTE FAST-FORWARD -> VERIFICAR.
//
// O helper NÃO usa `git reset --hard`, NÃO faz stash automático e NÃO reescreve
// histórico. Trabalho local, branch divergente, HEAD destacado ou rewrite remoto
// bloqueiam a atualização e ficam preservados para reconciliação explícita.

import { execFile } from 'child_process';

function git(args, cwd) {
  return new Promise((resolve) => {
    execFile('git', args, { cwd, maxBuffer: 32 * 1024 * 1024 }, (err, stdout, stderr) => {
      resolve({
        code: err ? (err.code ?? 1) : 0,
        stdout: (stdout || '').trim(),
        stderr: (stderr || '').trim(),
      });
    });
  });
}

function sanitizeGitOutput(value) {
  return String(value || '')
    .replace(/https:\/\/[^\s/@:]+:[^\s/@]+@/gi, 'https://[REDACTED]@')
    .replace(/\bBearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
    .replace(/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/g, '[REDACTED]')
    .slice(0, 900);
}

function result({ ok, reason = null, changed = false, localSha = null, remoteSha = null, repoRoot = null }) {
  return { ok, reason, changed, localSha, remoteSha, repoRoot };
}

/**
 * Atualiza o branch local para `origin/<branch>` somente quando a transição é
 * um fast-forward limpo e verificável.
 *
 * @param {object} o
 * @param {string} o.repoPath caminho dentro do repositório
 * @param {string} [o.branch='main'] branch remota/local esperada
 * @param {(msg:string)=>void} o.log função de log
 * @returns {Promise<{ok:boolean,reason:string|null,changed:boolean,localSha:string|null,remoteSha:string|null,repoRoot:string|null}>}
 */
export async function safeUpdateFromOrigin({ repoPath, branch = 'main', log = () => {} }) {
  const branchCheck = await git(['check-ref-format', '--branch', branch], repoPath);
  if (branchCheck.code !== 0) {
    log(`[safe-git] BLOCKED invalid branch: ${sanitizeGitOutput(branch)}`);
    return result({ ok: false, reason: 'INVALID_BRANCH' });
  }

  const top = await git(['rev-parse', '--show-toplevel'], repoPath);
  if (top.code !== 0 || !top.stdout) {
    log(`[safe-git] BLOCKED not a git repository: ${sanitizeGitOutput(top.stderr || top.stdout)}`);
    return result({ ok: false, reason: 'NOT_A_GIT_REPOSITORY' });
  }
  const repoRoot = top.stdout;
  log(`[safe-git] observar ${repoRoot} -> origin/${branch}`);

  const currentBranch = await git(['symbolic-ref', '--quiet', '--short', 'HEAD'], repoRoot);
  if (currentBranch.code !== 0 || !currentBranch.stdout) {
    log('[safe-git] BLOCKED detached HEAD; nenhum estado foi sobrescrito');
    return result({ ok: false, reason: 'DETACHED_HEAD', repoRoot });
  }
  if (currentBranch.stdout !== branch) {
    log(`[safe-git] BLOCKED branch atual=${sanitizeGitOutput(currentBranch.stdout)} esperado=${sanitizeGitOutput(branch)}`);
    return result({ ok: false, reason: 'BRANCH_MISMATCH', repoRoot });
  }

  // Observa a ponta remota em FETCH_HEAD sem sobrescrever primeiro a ref de
  // rastreamento local. `--refmap=` desliga explicitamente o refmap configurado
  // em remote.origin.fetch; sem isso o próprio fetch atualiza origin/<branch>
  // antes da comparação e destrói a observação anterior usada para detectar
  // rewrite remoto e para o compare-and-swap abaixo.
  const remoteRef = `refs/remotes/origin/${branch}`;
  const remoteBefore = await git(['rev-parse', '--verify', '--quiet', remoteRef], repoRoot);
  const remoteBeforeSha = remoteBefore.code === 0 && remoteBefore.stdout ? remoteBefore.stdout : null;

  const fetch = await git(['fetch', '--no-tags', '--refmap=', 'origin', `refs/heads/${branch}`], repoRoot);
  if (fetch.code !== 0) {
    log(`[safe-git] BLOCKED fetch falhou: ${sanitizeGitOutput(fetch.stderr || fetch.stdout)}`);
    return result({ ok: false, reason: 'FETCH_FAILED', repoRoot });
  }

  const fetchedHead = await git(['rev-parse', '--verify', 'FETCH_HEAD'], repoRoot);
  if (fetchedHead.code !== 0 || !fetchedHead.stdout) {
    log('[safe-git] BLOCKED FETCH_HEAD não resolvido após observação remota');
    return result({ ok: false, reason: 'REMOTE_REF_RESOLUTION_FAILED', repoRoot });
  }
  const remoteSha = fetchedHead.stdout;

  if (remoteBeforeSha && remoteBeforeSha !== remoteSha) {
    const remoteLineage = await git(['merge-base', '--is-ancestor', remoteBeforeSha, remoteSha], repoRoot);
    if (remoteLineage.code !== 0) {
      log(`[safe-git] BLOCKED REMOTE_REWRITE old=${remoteBeforeSha.slice(0, 12)} new=${remoteSha.slice(0, 12)}; estado local preservado`);
      return result({ ok: false, reason: 'REMOTE_REWRITE', remoteSha, repoRoot });
    }
  }

  // Só depois de provar que a nova observação não reescreve a linhagem anterior
  // atualizamos a ref de rastreamento local, com compare-and-swap quando existe.
  const trackingUpdate = remoteBeforeSha
    ? await git(['update-ref', remoteRef, remoteSha, remoteBeforeSha], repoRoot)
    : await git(['update-ref', remoteRef, remoteSha], repoRoot);
  if (trackingUpdate.code !== 0) {
    log(`[safe-git] BLOCKED tracking ref não atualizada: ${sanitizeGitOutput(trackingUpdate.stderr || trackingUpdate.stdout)}`);
    return result({ ok: false, reason: 'REMOTE_TRACK_UPDATE_FAILED', remoteSha, repoRoot });
  }

  // Fetch observa refs; só depois medimos se o working tree pode receber mutação.
  const status = await git(['status', '--porcelain=v1', '--untracked-files=all'], repoRoot);
  if (status.code !== 0) {
    log(`[safe-git] BLOCKED status falhou: ${sanitizeGitOutput(status.stderr || status.stdout)}`);
    return result({ ok: false, reason: 'STATUS_FAILED', remoteSha, repoRoot });
  }
  if (status.stdout) {
    log('[safe-git] BLOCKED working tree/index contém mudanças locais; preservado sem stash/reset');
    return result({ ok: false, reason: 'DIRTY_WORKTREE', remoteSha, repoRoot });
  }

  const local = await git(['rev-parse', 'HEAD'], repoRoot);
  if (local.code !== 0 || !local.stdout) {
    log('[safe-git] BLOCKED não foi possível resolver HEAD local');
    return result({ ok: false, reason: 'LOCAL_REF_RESOLUTION_FAILED', remoteSha, repoRoot });
  }
  const localSha = local.stdout;

  if (localSha === remoteSha) {
    log(`[safe-git] PASS já sincronizado HEAD=${localSha.slice(0, 12)}`);
    return result({ ok: true, changed: false, localSha, remoteSha, repoRoot });
  }

  const counts = await git(['rev-list', '--left-right', '--count', `HEAD...${remoteSha}`], repoRoot);
  const [aheadRaw, behindRaw] = String(counts.stdout || '').split(/\s+/);
  const ahead = Number.parseInt(aheadRaw || '0', 10) || 0;
  const behind = Number.parseInt(behindRaw || '0', 10) || 0;
  if (counts.code !== 0) {
    log(`[safe-git] BLOCKED comparação falhou: ${sanitizeGitOutput(counts.stderr || counts.stdout)}`);
    return result({ ok: false, reason: 'COMPARE_FAILED', localSha, remoteSha, repoRoot });
  }

  if (ahead > 0) {
    const reason = behind > 0 ? 'DIVERGED' : 'LOCAL_AHEAD';
    log(`[safe-git] BLOCKED ${reason} ahead=${ahead} behind=${behind}; commits locais preservados`);
    return result({ ok: false, reason, localSha, remoteSha, repoRoot });
  }

  const ancestry = await git(['merge-base', '--is-ancestor', 'HEAD', remoteSha], repoRoot);
  if (ancestry.code !== 0) {
    log('[safe-git] BLOCKED transição não é fast-forward; nenhum rewrite executado');
    return result({ ok: false, reason: 'NON_FAST_FORWARD', localSha, remoteSha, repoRoot });
  }

  const merge = await git(['merge', '--ff-only', remoteSha], repoRoot);
  if (merge.code !== 0) {
    log(`[safe-git] BLOCKED ff-only falhou: ${sanitizeGitOutput(merge.stderr || merge.stdout)}`);
    return result({ ok: false, reason: 'FAST_FORWARD_FAILED', localSha, remoteSha, repoRoot });
  }

  const verified = await git(['rev-parse', 'HEAD'], repoRoot);
  if (verified.code !== 0 || verified.stdout !== remoteSha) {
    log('[safe-git] BLOCKED pós-condição inválida: HEAD não coincide com remoto observado');
    return result({ ok: false, reason: 'POSTCONDITION_FAILED', localSha, remoteSha, repoRoot });
  }

  log(`[safe-git] PASS fast-forward ${localSha.slice(0, 12)} -> ${remoteSha.slice(0, 12)}`);
  return result({ ok: true, changed: true, localSha, remoteSha, repoRoot });
}
