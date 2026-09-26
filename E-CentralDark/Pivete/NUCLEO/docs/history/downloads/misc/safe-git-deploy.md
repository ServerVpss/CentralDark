# OUTRO - safe-git-deploy.mjs
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\worktrees\pivete-centraldark\test\scripts\webhook\lib\safe-git-deploy.mjs
**SHA:** 17071fdb20f03d42
**Timestamp:** 2026-08-28T02:57:39.727393
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Principios
- // Princípio:

### Ouro Bruto (primeiros 5000 chars)
```
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
    : await git(['update-ref', 
```