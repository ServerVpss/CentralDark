// Helper compartilhado: `git reset --hard origin/<branch>` seguro contra perda de trabalho local.
//
// Um `git reset --hard origin/main` cego apaga dois tipos de trabalho local:
//   1. Alterações NÃO-commitadas (working tree / index) -> protegidas com `git stash` + `pop`.
//   2. Commits locais AINDA NÃO enviados ao remote        -> protegidos com uma branch de backup.
//      (Atenção: `git stash` NÃO salva commits — só o backup-branch protege esse caso,
//       que foi exatamente o que quase perdeu o Elite Mapper.)
//
// Em conflito ao reaplicar o stash: mantém o stash salvo, restaura a árvore limpa
// (pra não quebrar o build) e registra aviso. Nunca lança erro que pare o deploy.

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

function timestamp() {
  // 2026-06-25_14-03-09
  return new Date().toISOString().replace('T', '_').replace(/\..+$/, '').replace(/:/g, '-');
}

/**
 * Atualiza `repoPath` para `origin/<branch>` sem perder trabalho local.
 *
 * @param {object} o
 * @param {string} o.repoPath        caminho do repositório
 * @param {string} [o.branch='main'] branch remota
 * @param {(msg:string)=>void} o.log função de log
 * @returns {Promise<{ok:boolean, stashed:boolean, stashConflict:boolean, backupRef:string|null}>}
 */
export async function safeResetToOrigin({ repoPath, branch = 'main', log }) {
  const ts = timestamp();
  log(`[safe-deploy] atualização segura de ${repoPath} -> origin/${branch}`);

  // 0. Buscar o estado remoto.
  const fetch = await git(['fetch', 'origin', branch], repoPath);
  if (fetch.code !== 0) {
    log(`[safe-deploy] ERRO no git fetch: ${fetch.stderr || fetch.stdout}`);
    return { ok: false, stashed: false, stashConflict: false, backupRef: null };
  }

  // 1. Commits locais não enviados? `reset --hard` os orfanaria; `stash` NÃO salva commits.
  const ahead = await git(['rev-list', '--count', `origin/${branch}..HEAD`], repoPath);
  const aheadCount = parseInt(ahead.stdout || '0', 10) || 0;
  let backupRef = null;
  if (aheadCount > 0) {
    const ref = `backup-pre-deploy-${ts}`;
    const b = await git(['branch', ref, 'HEAD'], repoPath);
    if (b.code === 0) {
      backupRef = ref;
      log(`[safe-deploy] ⚠ ${aheadCount} commit(s) local(is) não enviado(s) — backup salvo na branch '${ref}'`);
    } else {
      log(`[safe-deploy] ⚠ ${aheadCount} commit(s) local(is) não enviado(s), mas FALHOU criar branch de backup: ${b.stderr}`);
    }
  }

  // 2. Alterações não-commitadas (arquivos rastreados)? -> stash.
  //    (arquivos não-rastreados sobrevivem ao reset --hard, então não precisam de stash)
  const dirty = (await git(['diff-index', '--quiet', 'HEAD', '--'], repoPath)).code !== 0;
  const stashMsg = `auto-stash-before-deploy-${ts}`;
  let stashed = false;
  if (dirty) {
    const s = await git(['stash', 'push', '-m', stashMsg], repoPath);
    if (s.code === 0) {
      stashed = true;
      log(`[safe-deploy] alterações locais não-commitadas detectadas — salvas em stash '${stashMsg}'`);
    } else {
      log(`[safe-deploy] ⚠ falha ao criar stash (${s.stderr || s.stdout}) — seguindo com o reset`);
    }
  }

  // 3. Reset duro pro estado remoto.
  const reset = await git(['reset', '--hard', `origin/${branch}`], repoPath);
  if (reset.code !== 0) {
    log(`[safe-deploy] ERRO no git reset --hard: ${reset.stderr || reset.stdout}`);
    return { ok: false, stashed, stashConflict: false, backupRef };
  }
  log(`[safe-deploy] reset --hard origin/${branch} concluído (${reset.stdout || 'HEAD atualizado'})`);

  // 4. Reaplicar o stash sobre a nova versão.
  let stashConflict = false;
  if (stashed) {
    const pop = await git(['stash', 'pop'], repoPath);
    if (pop.code === 0) {
      log('[safe-deploy] stash reaplicado com sucesso sobre a nova versão');
    } else {
      // `git stash pop` em conflito NÃO descarta o stash: ele continua em `git stash list`.
      stashConflict = true;
      log('[safe-deploy] ⚠ CONFLITO ao reaplicar stash — restaurando árvore limpa pro build');
      await git(['reset', '--hard', `origin/${branch}`], repoPath);
      log(`[safe-deploy] ⚠ suas alterações locais foram PRESERVADAS no stash '${stashMsg}'. ` +
          `Reaplique à mão: cd ${repoPath} && git stash list && git stash apply`);
    }
  }

  if (backupRef) {
    log(`[safe-deploy] ⚠ lembrete: commits locais preservados em '${backupRef}'. ` +
        `Recupere com: git -C ${repoPath} log ${backupRef}`);
  }

  return { ok: true, stashed, stashConflict, backupRef };
}
